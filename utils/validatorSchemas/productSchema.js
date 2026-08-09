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
    .isLength({ min: 20 })
    .withMessage("Too short product description")
    .isLength({ max: 2000 })
    .withMessage("Too long product description"),
  check("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product price must be a number"),
  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number"),
  check("priceAfterDiscount")
    .optional()
    .toFloat()
    .isNumeric()
    .withMessage("Product price must be a number")
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
    .withMessage("Product must be belong to a category")
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom(async (categoryId) => {
      const category = await categoryModel.findById(categoryId);
      if (!category) {
        throw new Error(`No category found with this id: ${categoryId}`);
      }
    }),

  check("brand").optional().isMongoId().withMessage("Invalid ID formate"),

  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("ratingsAverage must be a number")
    .isFloat({ min: 1 })
    .withMessage("Rating must be above or equal 1.0")
    .isFloat({ max: 5 })
    .withMessage("Rating must be below or equal 5.0"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("ratingsQuantity must be a number"),
  validatorMiddleware,
];

export const updateProductValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid product id format")
    .notEmpty()
    .withMessage("Product id is required"),
  check("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom(async (categoryId) => {
      const category = await categoryModel.findById(categoryId);
      if (!category) {
        throw new Error(`No category found with this id: ${categoryId}`);
      }
    }),
  check("priceAfterDiscount")
    .optional()
    .toFloat()
    .isNumeric()
    .withMessage("Product price must be a number")
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
