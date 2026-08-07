import { check, body } from "express-validator";
import validatorMiddleware from "../../middlewares/validationMiddleware.js";
import slugify from "slugify";

export const getBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand id format"),
  validatorMiddleware,
];

export const createBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("Brand is required")
    .isString()
    .withMessage("Name must be string")
    .isLength({ min: 3 })
    .withMessage("Too short brand name")
    .isLength({ max: 32 })
    .withMessage("Too long brand name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

export const updateBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand id format"),
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

export const deleteBrandValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid brand id format")
    .notEmpty()
    .withMessage("Brand id is required"),
  validatorMiddleware,
];
