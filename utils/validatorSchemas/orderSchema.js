import { body, param } from "express-validator";
import validatorMiddleware from "../../middlewares/validationMiddleware.js";

export const updateOrderStatusValidator = [
  param("id").isMongoId().withMessage("Invalid order id"),
  body("status")
    .notEmpty()
    .withMessage("Order status is required")
    .isIn(["pending", "shipped", "delivered"])
    .withMessage("Status must be pending, shipped, or delivered"),
  validatorMiddleware,
];

export const createCashOrderValidator = [
  param("cartId").isMongoId().withMessage("Invalid cart id"),
  body("shippingAddress")
    .notEmpty()
    .withMessage("Shipping address is required"),

  body("shippingAddress.details")
    .notEmpty()
    .withMessage("Address details are required"),

  body("shippingAddress.city").notEmpty().withMessage("City is required"),
  body("shippingAddress.phone").notEmpty().withMessage("Phone is required"),
  validatorMiddleware,
];
