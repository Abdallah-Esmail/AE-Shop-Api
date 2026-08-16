import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";
import factoryHandler from "./handlersFactory.controller.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import { uploadMixOfImages } from "../middlewares/uploadImage.js";
import cloudinary from "../config/cloudinary.js";
import sharp from "sharp";
import httpStatusText from "../utils/httpStatusText.js";
import appError from "../utils/appError.js";
// Upload mix of images (imageCover + images)
const uploadProductImages = uploadMixOfImages([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

// Helper: process buffer with sharp then upload to Cloudinary
const processAndUpload = async (buffer, folder) => {
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
const resizeProductImages = asyncWrapper(async (req, res, next) => {
  if (!req.files) return next();

  try {
    // 1- Image processing for imageCover
    if (req.files.imageCover) {
      req.body.imageCover = await processAndUpload(
        req.files.imageCover[0].buffer,
        "products",
      );
    }

    // 2- Image processing for images
    if (req.files.images) {
      req.body.images = await Promise.all(
        req.files.images.map((img) => processAndUpload(img.buffer, "products")),
      );
    }
  } catch (error) {
    return next(new appError("Image upload failed", 500, httpStatusText.FAIL));
  }

  next();
});

const extractPublicId = (url) => {
  if (!url) return null;
  const parts = url.split("/upload/")[1];
  if (!parts) return null;

  return parts.replace(/^v\d+\//, "").replace(/\.[^/.]+$/, "");
};

const safeDestroy = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(
      `Failed to delete image ${publicId} from Cloudinary:`,
      err.message,
    );
  }
};

const getProducts = factoryHandler.getAll(productModel, "Product");
const getProduct = factoryHandler.getOne(productModel);
const createProduct = factoryHandler.createOne(productModel);
const updateProduct = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const oldProduct = await productModel.findById(id);
  if (!oldProduct) {
    return next(new appError("Document not found", 404, httpStatusText.FAIL));
  }

  let document;
  try {
    document = await productModel.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
  } catch (err) {
    if (req.body.imageCover)
      await safeDestroy(extractPublicId(req.body.imageCover));
    if (req.body.images) {
      await Promise.all(
        req.body.images.map((url) => safeDestroy(extractPublicId(url))),
      );
    }
    return next(new appError(err.message, 400, httpStatusText.FAIL));
  }
  if (req.body.imageCover && oldProduct.imageCover) {
    const oldPublicId = extractPublicId(oldProduct.imageCover);
    await safeDestroy(oldPublicId);
  }

  if (req.body.images && oldProduct.images?.length) {
    await Promise.all(
      oldProduct.images.map((oldUrl) => safeDestroy(extractPublicId(oldUrl))),
    );
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { document },
  });
});

const deleteProduct = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const product = await productModel.findById(id);
  if (!product) {
    return next(new appError("Document not found", 404, httpStatusText.FAIL));
  }

  await productModel.findByIdAndDelete(id);

  if (product.imageCover) {
    await safeDestroy(extractPublicId(product.imageCover));
  }

  if (product.images?.length) {
    await Promise.all(
      product.images.map((url) => safeDestroy(extractPublicId(url))),
    );
  }

  await cartModel.updateMany(
    { "cartItems.product": id },
    { $pull: { cartItems: { product: id } } },
  );

  res.status(204).send();
});

export {
  uploadProductImages,
  resizeProductImages,
  getProducts,
  getProduct,
  updateProduct,
  createProduct,
  deleteProduct,
};
