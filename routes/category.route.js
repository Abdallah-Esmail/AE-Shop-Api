import express from "express";
import {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} from "../utils/validatorSchemas/categorySchema.js";
import * as categoryController from "../controllers/category.controller.js";
import * as authController from "../controllers/auth.controller.js";

const router = express.Router();

router
  .route("/")
  .get(categoryController.getCategories)
  .post(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    categoryController.uploadCategoryImage,
    categoryController.resizeImage,
    createCategoryValidator,
    categoryController.createCategory,
  );
router
  .route("/:id")
  .get(getCategoryValidator, categoryController.getCategory)
  .put(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    categoryController.uploadCategoryImage,
    categoryController.resizeImage,
    updateCategoryValidator,
    categoryController.updateCategory,
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    deleteCategoryValidator,
    categoryController.deleteCategory,
  );

export default router;
