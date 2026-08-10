import factoryHandler from "./handlersFactory.controller.js";
import categoryModel from "../models/category.model.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import sharp from "sharp";
import appError from "../utils/appError.js";
import cloudinary from "../config/cloudinary.js";
import { uploadSingleImage } from "../middlewares/uploadImage.js";

// Upload single image
const uploadCategoryImage = uploadSingleImage("image");

// Image processing
const resizeImage = asyncWrapper(async (req, res, next) => {
  if (req.file) {
    const filename = `category-${crypto.randomUUID()}-${Date.now()}.jpeg`;
    const processedBuffer = await sharp(req.file.buffer)
      .resize(600, 600, {
        fit: "cover",
        background: "#ffffff",
        withoutEnlargement: true,
      })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 90 })
      .toBuffer();

    try {
      const base64Image = `data:image/jpeg;base64,${processedBuffer.toString("base64")}`;

      const result = await cloudinary.uploader.upload(base64Image, {
        folder: "categories",
      });

      req.body.image = result.secure_url;
    } catch (error) {
      return next(
        new appError("Image upload failed", 500, httpStatusText.FAIL),
      );
    }
  }

  next();
});

const getCategories = factoryHandler.getAll(categoryModel, "Category");
const getCategory = factoryHandler.getOne(categoryModel);
const createCategory = factoryHandler.createOne(categoryModel);
const updateCategory = factoryHandler.updateOne(categoryModel);
const deleteCategory = factoryHandler.deleteOne(categoryModel);

export {
  uploadCategoryImage,
  resizeImage,
  getCategories,
  getCategory,
  updateCategory,
  createCategory,
  deleteCategory,
};
