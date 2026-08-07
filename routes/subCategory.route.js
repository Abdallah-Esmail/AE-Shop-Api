import express from "express";
import {
  getSubCategoryValidator,
  createSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} from "../utils/validatorSchemas/subCategorySchema.js";
import * as subCategoryController from "../controllers/subCategory.controller.js";
import * as authController from "../controllers/auth.controller.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    subCategoryController.createFilterObj,
    subCategoryController.getSubCategories,
  )
  .post(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    subCategoryController.setCategoryIdToBody,
    createSubCategoryValidator,
    subCategoryController.createSubCategory,
  );

router
  .route("/:id")
  .get(getSubCategoryValidator, subCategoryController.getSubCategory)
  .put(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    updateSubCategoryValidator,
    subCategoryController.updateSubCategory,
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    deleteSubCategoryValidator,
    subCategoryController.deleteSubCategory,
  );

export default router;
