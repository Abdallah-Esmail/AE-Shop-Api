import express from "express";
import * as orderValidator from "../utils/validatorSchemas/orderSchema.js";
import * as orderController from "../controllers/order.controller.js";
import * as authController from "../controllers/auth.controller.js";

const router = express.Router();

router.use(authController.protect);

// Get all user orders for users and all orders for managers and admins
router
  .route("/")
  .get(orderController.filterOrdersForLoggedUser, orderController.getOrders);

// Update order status
router.put(
  "/:id/status",
  authController.allowedTo("admin", "manager"),
  orderValidator.updateOrderStatusValidator,
  orderController.updateOrderStatus,
);

// Get specific order
router.route("/:id").get(orderController.getSpecificOrder);

export default router;
