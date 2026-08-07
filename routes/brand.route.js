import express from "express";
import {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} from "../utils/validatorSchemas/brandSchema.js";
import * as brandController from "../controllers/brand.controller.js";
import * as authController from "../controllers/auth.controller.js";

const router = express.Router();

router
  .route("/")
  .get(brandController.getBrands)
  .post(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    createBrandValidator,
    brandController.createBrand,
  );

router
  .route("/:id")
  .get(getBrandValidator, brandController.getBrand)
  .put(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    updateBrandValidator,
    brandController.updateBrand,
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    deleteBrandValidator,
    brandController.deleteBrand,
  );

export default router;
