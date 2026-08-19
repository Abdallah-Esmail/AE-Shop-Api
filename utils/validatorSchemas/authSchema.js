import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validationMiddleware.js";
import userModel from "../../models/user.model.js";
import slugify from "slugify";

export const signupValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name is required")
    .trim()
    .isString()
    .withMessage("Name must be string")
    .isLength({ min: 3, max: 32 })
    .withMessage("The name must be between 3 and 32 chars")
    .custom((name, { req }) => {
      req.body.slug = slugify(name);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail()
    .custom(async (val) => {
      const user = await userModel.findOne({ email: val });
      if (user) {
        throw new Error("The email already exists");
      }
      return true;
    }),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 32 })
    .withMessage("The password must be between 6 and 32 chars")
    .matches(/^\S+$/)
    .withMessage("Password must not contain spaces"),
  check("passwordConfirmation")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((passwordConfirmation, { req }) => {
      if (passwordConfirmation !== req.body.password) {
        throw new Error("Password confirmation is incorrect");
      }
      return true;
    }),
  validatorMiddleware,
];

export const loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),
  check("password").notEmpty().withMessage("Password is required"),
  validatorMiddleware,
];

export const forgetPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),
  validatorMiddleware,
];

export const verifyPasswordResetCodeValidator = [
  check("resetCode")
    .notEmpty()
    .withMessage("Reset code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Reset code must be 6 characters"),
  validatorMiddleware,
];

export const resetPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),
  check("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6, max: 32 })
    .withMessage("The password must be between 6 and 32 chars")
    .matches(/^\S+$/)
    .withMessage("Password must not contain spaces"),
  validatorMiddleware,
];
