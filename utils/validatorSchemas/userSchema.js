import { check, body } from "express-validator";
import validatorMiddleware from "../../middlewares/validationMiddleware.js";
import slugify from "slugify";
import userModel from "../../models/user.model.js";
import appError from "../appError.js";
import httpStatusText from "../httpStatusText.js";
import bcrypt from "bcryptjs";

export const getUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  validatorMiddleware,
];

export const createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("Users is required")
    .isString()
    .withMessage("Name must be string")
    .isLength({ min: 3 })
    .withMessage("Too short user name")
    .isLength({ max: 32 })
    .withMessage("Too long user name")
    .custom((name, { req }) => {
      req.body.slug = slugify(name);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val) => {
      const user = await userModel.findOne({ email: val });
      if (user) {
        throw new appError(
          "The email is already exists",
          400,
          httpStatusText.FAIL,
        );
      }
    }),
  check("password")
    .notEmpty()
    .withMessage("Password is requied")
    .isLength({ min: 6 })
    .withMessage("Password must be 6 chars at least")
    .isLength({ max: 32 })
    .withMessage("Too long password"),
  check("profileImg").optional(),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accepts Egy & SA phone numbers"),
  check("role").optional(),
  check("passwordConfirmation")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((passwordConfirmation, { req }) => {
      if (passwordConfirmation !== req.body.password) {
        throw new appError(
          "Password confirmation is incorrect",
          400,
          httpStatusText.FAIL,
        );
      }
      return true;
    }),
  validatorMiddleware,
];

export const updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be string")
    .custom((name, { req }) => {
      req.body.slug = slugify(name);
      return true;
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val) => {
      const user = await userModel.findOne({ email: val });
      if (user) {
        throw new appError(
          "The email is already exists",
          400,
          httpStatusText.FAIL,
        );
      }
    }),
  check("profileImg").optional(),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accepts Egy & SA phone numbers"),
  check("role").optional(),
  validatorMiddleware,
];

export const changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("The new password is required")
    .custom(async (newPassword, { req }) => {
      const user = await userModel.findById(req.params.id);
      if (!user) {
        throw new appError(
          "There is no user for this id",
          400,
          httpStatusText.FAIL,
        );
      }

      if (!(await bcrypt.compare(req.body.currentPassword, user.password))) {
        throw new appError(
          "Incorrect current password",
          404,
          httpStatusText.FAIL,
        );
      }
    })
    .custom((newPassword, { req }) => {
      if (newPassword !== req.body.passwordConfirmation) {
        throw new appError(
          "The confirmation password is not equal to the new password",
          400,
          httpStatusText.FAIL,
        );
      }
      return true;
    }),
  body("passwordConfirmation")
    .notEmpty()
    .withMessage("Confirmation password is required"),
  validatorMiddleware,
];

export const deactivateUserValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid user id format")
    .notEmpty()
    .withMessage("Users id is required"),
  validatorMiddleware,
];

export const updateLoggedUserValidator = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be string")
    .custom((name, { req }) => {
      req.body.slug = slugify(name);
      return true;
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val) => {
      const user = await userModel.findOne({ email: val });
      if (user) {
        throw new appError(
          "The email is already exists",
          400,
          httpStatusText.FAIL,
        );
      }
    }),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accepts Egy & SA phone numbers"),
  validatorMiddleware,
];
