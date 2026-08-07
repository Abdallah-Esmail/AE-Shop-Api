import express from "express";
import * as cartValidator from "../utils/validatorSchemas/cartSchema.js";
import * as orderValidator from "../utils/validatorSchemas/orderSchema.js";
import * as cartController from "../controllers/cart.controller.js";
import * as authController from "../controllers/auth.controller.js";
import * as orderController from "../controllers/order.controller.js";

const router = express.Router();

router.use(authController.protect);

router
  .route("/")

  // Get logged user cart
  .get(cartController.getLoggedUserCart)

  // Add cart item
  .post(cartValidator.addToCartValidator, cartController.addToCart)

  // Delete the cart
  .delete(cartController.clearCart);

router
  .route("/:itemId")
  // Update cart item quantity
  .put(
    cartValidator.updateCartItemQuantityValidator,
    cartController.updateCartItemQuantity,
  )
  // Remove item from cart
  .delete(
    cartValidator.removeSpecificCartItemValidator,
    cartController.removeSpecificCartItem,
  );

// Create cash order
router.post(
  "/:cartId/orders",
  authController.allowedTo("user"),
  orderValidator.createCashOrderValidator,
  orderController.createCashOrder,
);

// Create checkout session
router.get(
  "/:cartId/checkout-session",
  authController.allowedTo("user"),
  orderController.checkoutSession,
);

export default router;
