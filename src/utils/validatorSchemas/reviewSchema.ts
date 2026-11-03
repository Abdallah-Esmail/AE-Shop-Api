import { check, body } from "express-validator";
import validatorMiddleware from "../../middlewares/validationMiddleware.js";
import Review from "../../models/review.model.js";

export const createReviewValidator = [
  check("rating")
    .notEmpty()
    .withMessage("rating value required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating value must be between 1 to 5"),
  check("review")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Too short review")
    .isLength({ max: 300 })
    .withMessage("Too long review"),
  check("product").custom(async (val, { req }) => {
    const review = await Review.findOne({
      user: req.user._id,
      product: req.body.product,
    });
    if (review) {
      throw new Error("You already created a review before");
    }
  }),
  validatorMiddleware,
];

export const getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review id format"),
  validatorMiddleware,
];

export const updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom(async (val, { req }) => {
      const review = await Review.findById(val);
      if (!review) {
        throw new Error(`There is no review with id ${val}`);
      }
      if (review.user._id.toString() !== req.user._id.toString()) {
        throw new Error(`You are not allowed to perform this action`);
      }
    }),
  check("review")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Too short review")
    .isLength({ max: 300 })
    .withMessage("Too long review"),
  validatorMiddleware,
];
