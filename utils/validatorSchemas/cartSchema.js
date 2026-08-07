import { param, body } from "express-validator";
import validatorMiddleware from "../../middlewares/validationMiddleware.js";
import productModel from "../../models/product.model.js";

export const addToCartValidator = [
  body("itemId")
    .notEmpty()
    .withMessage("itemId is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid product id format")
    .custom(async (val, { req }) => {
      const product = await productModel.findById(val);
      if (!product) {
        throw new Error("Product not found");
      }
      return true;
    }),
  validatorMiddleware,
];

export const updateCartItemQuantityValidator = [
  param("itemId").isMongoId().withMessage("Invalid product id format"),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .bail()
    .isInt({ min: 1, max: 50 })
    .withMessage("Invalid quantity")
    .toInt()
    .custom((val, { req }) => {
      if (typeof val !== "number") {
        throw new Error("quantity must be a number type");
      }
      return true;
    }),
  validatorMiddleware,
];

export const removeSpecificCartItemValidator = [
  param("itemId").isMongoId().withMessage("Invalid cart item id format"),
  validatorMiddleware,
];
