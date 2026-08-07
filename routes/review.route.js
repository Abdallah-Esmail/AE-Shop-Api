import express from "express";

import {
  createReviewValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} from "../utils/validatorSchemas/reviewSchema.js";
import * as reviewController from "../controllers/review.controller.js";
import * as authController from "../controllers/auth.controller.js";

const router = express.Router({ mergeParams: true });
router.use(authController.protect);

router
  .route("/")
  .get(reviewController.createFilterObj, reviewController.getAllReviews)
  .post(
    authController.allowedTo("user"),
    reviewController.addUserAndProduct,
    createReviewValidator,
    reviewController.addReview,
  );

router
  .route("/:id")
  .get(getReviewValidator, reviewController.getReview)
  .put(
    authController.allowedTo("user"),
    updateReviewValidator,
    reviewController.updateReview,
  )
  .delete(
    authController.allowedTo("user", "admin", "manager"),
    deleteReviewValidator,
    reviewController.removeReview,
  );

export default router;
