import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";
import reviewModel from "../models/review.model.js";
import categoryModel from "../models/category.model.js";
import factoryHandler from "./handlersFactory.controller.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import { uploadMixOfImages } from "../middlewares/uploadImage.js";
import cloudinary from "../config/cloudinary.js";
import sharp from "sharp";
import httpStatusText from "../utils/httpStatusText.js";
import appError from "../utils/appError.js";
import ApiFeatures from "../utils/apiFeatures.js";
import type { NextFunction, Request, Response } from "express";
import { isValidObjectId } from "mongoose";
// Upload mix of images (imageCover + images)
const uploadProductImages = uploadMixOfImages([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

// Helper: process buffer with sharp then upload to Cloudinary
const processAndUpload = async (buffer: Buffer, folder: string) => {
  const processedBuffer = await sharp(buffer)
    .resize(1000, 1000, {
      fit: "cover",
      background: "#ffffff",
      withoutEnlargement: true,
    })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 90 })
    .toBuffer();

  const base64Image = `data:image/jpeg;base64,${processedBuffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64Image, {
    folder,
  });

  return result.secure_url;
};

// Image processing
const resizeProductImages = asyncWrapper(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.files) return next();
    type UploadedFiles = { [fieldname: string]: Express.Multer.File[] };
    const files = req.files as UploadedFiles | undefined;
    if (!files) return next();
    try {
      // 1- Image processing for imageCover
      if (files.imageCover) {
        req.body.imageCover = await processAndUpload(
          files.imageCover[0].buffer,
          "products",
        );
      }

      // 2- Image processing for images
      if (files.images) {
        req.body.images = await Promise.all(
          files.images.map((img) => processAndUpload(img.buffer, "products")),
        );
      }
    } catch (error) {
      return next(
        new appError("Image upload failed", 500, httpStatusText.FAIL),
      );
    }

    next();
  },
);

const extractPublicId = (url: string) => {
  if (!url) return null;
  const parts = url.split("/upload/")[1];
  if (!parts) return null;

  return parts.replace(/^v\d+\//, "").replace(/\.[^/.]+$/, "");
};

const safeDestroy = async (publicId?: string | null): Promise<void> => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    if (err instanceof Error) {
      console.error(
        `Failed to delete image ${publicId} from Cloudinary:`,
        err.message,
      );
    }
  }
};

const getProducts = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const filter: Record<string, unknown> = {};
    const queryForFeatures = { ...req.query };

    if (req.query.category && typeof req.query.category === "string") {
      const category = await categoryModel.findOne({
        slug: req.query.category.toString(),
      });

      if (!category) {
        return next(
          new appError("Category not found", 404, httpStatusText.FAIL),
        );
      }

      filter.category = category._id;
      delete queryForFeatures.category;
    }

    const documentsCount = await productModel.countDocuments(filter);

    const apiFeatures = new ApiFeatures(
      productModel.find(filter),
      queryForFeatures,
    )
      .pagination(documentsCount)
      .filter()
      .sort()
      .search("Product")
      .limitFields();

    const documents = await apiFeatures.mongooseQuery.populate(
      "category",
      "name slug",
    );

    res.status(200).json({
      results: documents.length,
      paginationResult: apiFeatures.paginationResult,
      data: documents,
    });
  },
);

const getProduct = factoryHandler.getOne(productModel);
const createProduct = factoryHandler.createOne(productModel);
const updateProduct = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    if (!isValidObjectId(id)) {
      return next(new appError("Invalid product id", 400, httpStatusText.FAIL));
    }

    const allowedFields = [
      "title",
      "description",
      "price",
      "category",
      "imageCover",
      "images",
    ];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body?.[field] !== undefined) updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0) {
      return next(
        new appError("No valid fields to update", 400, httpStatusText.FAIL),
      );
    }

    const oldProduct = await productModel.findById(id);
    if (!oldProduct) {
      return next(new appError("Document not found", 404, httpStatusText.FAIL));
    }

    const newCover =
      typeof updates.imageCover === "string" ? updates.imageCover : undefined;
    const newImages = Array.isArray(updates.images)
      ? (updates.images as string[])
      : undefined;

    const cleanupNew = async () => {
      if (newCover) await safeDestroy(extractPublicId(newCover));
      if (newImages) {
        await Promise.all(
          newImages.map((url) => safeDestroy(extractPublicId(url))),
        );
      }
    };

    let document;
    try {
      document = await productModel.findByIdAndUpdate(id, updates, {
        returnDocument: "after",
        runValidators: true,
      });
    } catch (err) {
      await cleanupNew();
      const message = err instanceof Error ? err.message : "Update failed";
      return next(new appError(message, 400, httpStatusText.FAIL));
    }

    if (!document) {
      await cleanupNew();
      return next(new appError("Document not found", 404, httpStatusText.FAIL));
    }

    if (newCover && oldProduct.imageCover) {
      await safeDestroy(extractPublicId(oldProduct.imageCover));
    }

    if (newImages && oldProduct.images?.length) {
      const toDelete = oldProduct.images.filter(
        (url) => !newImages.includes(url),
      );
      await Promise.all(
        toDelete.map((url) => safeDestroy(extractPublicId(url))),
      );
    }

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { document },
    });
  },
);

const deleteProduct = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const product = await productModel.findById(id);
    if (!product) {
      return next(new appError("Document not found", 404, httpStatusText.FAIL));
    }

    await productModel.findByIdAndDelete(id);

    await Promise.all([
      product.imageCover
        ? safeDestroy(extractPublicId(product.imageCover))
        : Promise.resolve(),
      product.images?.length
        ? Promise.all(
            product.images.map((url) => safeDestroy(extractPublicId(url))),
          )
        : Promise.resolve(),
      reviewModel.deleteMany({ product: id }),
      cartModel.updateMany(
        { "cartItems.product": id },
        { $pull: { cartItems: { product: id } } },
      ),
    ]);

    res.status(204).send();
  },
);

export {
  uploadProductImages,
  resizeProductImages,
  getProducts,
  getProduct,
  updateProduct,
  createProduct,
  deleteProduct,
};
