import express from "express";
import {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} from "../utils/validatorSchemas/categorySchema.js";
import * as categoryController from "../controllers/category.controller.js";
import * as authController from "../controllers/auth.controller.js";
import subCategoriesRoute from "../routes/subCategory.route.js";

const router = express.Router();

router.use("/:categoryId/subcategories", subCategoriesRoute);

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
  .get(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    getCategoryValidator,
    categoryController.getCategory,
  )
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
