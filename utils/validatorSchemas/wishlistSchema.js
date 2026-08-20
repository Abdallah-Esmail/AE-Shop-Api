import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validationMiddleware.js";

export const addProductToWishlistValidator = [
  check("productId")
    .notEmpty()
    .withMessage("Product id is required")
    .isMongoId()
    .withMessage("Invalid product id"),
  validatorMiddleware,
];

export const removeProductFromWishlistValidator = [
  check("productId")
    .notEmpty()
    .withMessage("Product id is required")
    .isMongoId()
    .withMessage("Invalid product id"),
  validatorMiddleware,
];
