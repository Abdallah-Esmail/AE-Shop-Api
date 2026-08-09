import { check, body, param } from "express-validator";
import validatorMiddleware from "../../middlewares/validationMiddleware.js";
import slugify from "slugify";

import categoryModel from "../../models/category.model.js";

export const getProductValidator = [
  check("id").isMongoId().withMessage("Invalid product id format"),
  validatorMiddleware,
];

export const createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("Product title is required")
    .bail()
    .isString()
    .withMessage("Title must be string")
    .isLength({ min: 3 })
    .withMessage("Too short product title")
    .isLength({ max: 100 })
    .withMessage("Too long product title")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .bail()
    .isLength({ min: 20 })
    .withMessage("Too short product description")
    .isLength({ max: 2000 })
    .withMessage("Too long product description"),

  check("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .bail()
    .trim()
    .isNumeric()
    .withMessage("Product quantity must be a number")
    .toInt(),

  check("sold")
    .optional()
    .trim()
    .isNumeric()
    .withMessage("Product sold must be a number")
    .toInt(),

  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .bail()
    .trim()
    .isNumeric()
    .withMessage("Product price must be a number")
    .toFloat(),

  check("priceAfterDiscount")
    .optional()
    .trim()
    .isNumeric()
    .withMessage("Product price must be a number")
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price && req.body.price <= value) {
        throw new Error("priceAfterDiscount must be less than price");
      }
      return true;
    }),

  check("colors")
    .optional()
    .isArray()
    .withMessage("availableColors should be array of string"),

  check("imageCover").notEmpty().withMessage("Product imageCover is required"),

  check("images")
    .optional()
    .isArray()
    .withMessage("images should be array of string"),

  check("category")
    .notEmpty()
    .withMessage("Product must belong to a category")
    .bail()
    .isMongoId()
    .withMessage("Invalid ID format")
    .bail() // 👈 حماية السيرفر من Mongoose CastError
    .custom(async (categoryId) => {
      const category = await categoryModel.findById(categoryId);
      if (!category) {
        throw new Error(`No category found with this id: ${categoryId}`);
      }
    }),

  check("brand").optional().isMongoId().withMessage("Invalid ID format"),

  check("ratingsAverage")
    .optional()
    .trim()
    .isNumeric()
    .withMessage("ratingsAverage must be a number")
    .toFloat()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1.0 and 5.0"),

  check("ratingsQuantity")
    .optional()
    .trim()
    .isNumeric()
    .withMessage("ratingsQuantity must be a number")
    .toInt(),

  validatorMiddleware,
];

export const updateProductValidator = [
  check("id")
    .notEmpty()
    .withMessage("Product id is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid product id format"),

  check("category")
    .optional()
    .bail()
    .isMongoId()
    .withMessage("Invalid ID format")
    .bail() // 👈 حماية السيرفر من Mongoose CastError
    .custom(async (categoryId) => {
      const category = await categoryModel.findById(categoryId);
      if (!category) {
        throw new Error(`No category found with this id: ${categoryId}`);
      }
    }),

  check("priceAfterDiscount")
    .optional()
    .trim()
    .isNumeric()
    .withMessage("Product price must be a number")
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price && req.body.price <= value) {
        throw new Error("priceAfterDiscount must be less than price");
      }
      return true;
    }),

  body("title")
    .optional()
    .isString()
    .withMessage("Title must be string")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  validatorMiddleware,
];

export const deleteProductValidator = [
  param("id").isMongoId().withMessage("Invalid product id format"),
  validatorMiddleware,
];
