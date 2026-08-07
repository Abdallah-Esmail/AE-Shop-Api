import { check, body } from "express-validator";
import validatorMiddleware from "../../middlewares/validationMiddleware.js";
import slugify from "slugify";

export const getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];

export const createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isString()
    .withMessage("Name must be string")
    .isLength({ min: 3 })
    .withMessage("Too short category name")
    .isLength({ max: 32 })
    .withMessage("Too long category name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

export const updateCategoryValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid category id format")
    .notEmpty()
    .withMessage("Category id is required"),
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

export const deleteCategoryValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid category id format")
    .notEmpty()
    .withMessage("Category id is required"),
  validatorMiddleware,
];
