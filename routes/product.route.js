import express from "express";
import {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} from "../utils/validatorSchemas/productSchema.js";
import * as productController from "../controllers/product.controller.js";
import * as authController from "../controllers/auth.controller.js";

import reviewRoute from "../routes/review.route.js";

const router = express.Router();

router.use("/:productId/reviews", reviewRoute);

router
  .route("/")
  .get(productController.getProducts)
  .post(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    createProductValidator,
    productController.uploadProductImages,
    productController.resizeProductImages,
    productController.createProduct,
  );

router
  .route("/:id")
  .get(getProductValidator, productController.getProduct)
  .put(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    updateProductValidator,
    productController.uploadProductImages,
    productController.resizeProductImages,
    productController.updateProduct,
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    deleteProductValidator,
    productController.deleteProduct,
  );

export default router;
