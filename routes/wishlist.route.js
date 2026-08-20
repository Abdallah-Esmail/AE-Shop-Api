import express from "express";

import * as authController from "../controllers/auth.controller.js";
import * as wishlistController from "../controllers/wishlist.controller.js";
import {
  addProductToWishlistValidator,
  removeProductFromWishlistValidator,
} from "../utils/validatorSchemas/wishlistSchema.js";
const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(wishlistController.getLoggedUserWishlist)
  .post(addProductToWishlistValidator, wishlistController.addProductToWishlist);

router.delete(
  "/:productId",
  removeProductFromWishlistValidator,
  wishlistController.removeProductFromWishlist,
);

export default router;
