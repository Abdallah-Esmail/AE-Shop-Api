import { body, check } from "express-validator";
import validatorMiddleware from "../../middlewares/validationMiddleware.js";
import slugify from "slugify";

export const getSubCategoryValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid subcategory id format")
    .notEmpty()
    .withMessage("Category id is required"),
  validatorMiddleware,
];

export const createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Subcategory is required")
    .isString()
    .withMessage("Name must be string")
    .isLength({ min: 2 })
    .withMessage("Too short subcategory name")
    .isLength({ max: 32 })
    .withMessage("Too long subcategory name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("category")
    .notEmpty()
    .withMessage("category is required")
    .isMongoId()
    .withMessage("invalid category id format"),
  validatorMiddleware,
];

export const updateSubCategoryValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid subcategory id format")
    .notEmpty()
    .withMessage("Subcategory id is required"),
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be string")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

export const deleteSubCategoryValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid subcategory id format")
    .notEmpty()
    .withMessage("Subcategory id is required"),
  validatorMiddleware,
];
