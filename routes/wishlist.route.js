import express from "express";

import * as authController from "../controllers/auth.controller.js";
import * as wishlistController from "../controllers/wishlist.controller.js";

const router = express.Router();

router.use(authController.protect, authController.allowedTo("user"));

router
  .route("/")
  .post(wishlistController.addProductToWishlist)
  .get(wishlistController.getLoggedUserWishlist);

router.delete("/:productId", wishlistController.removeProductFromWishlist);

export default router;
