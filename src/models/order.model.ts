import mongoose from "mongoose";
import type { IOrder } from "../types/order.types.js";

const orderSchema = new mongoose.Schema<IOrder>(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Order must be belong to user"],
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        color: String,
      },
    ],
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalOrderPrice: {
      type: Number,
      required: true,
    },
    paymentMethodType: {
      type: String,
      enum: ["card", "cash"],
      default: "cash",
    },
    paidAt: Date,
    isRefunded: { type: Boolean, default: false },
    paymentIntentId: {
      type: String,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    refundedAt: Date,
    status: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    deliveredAt: Date,
    sessionId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

orderSchema.pre(
  ["find", "findOne"],
  function (this: mongoose.Query<unknown, IOrder>) {
    this.populate({
      path: "user",
      select: "name profileImg email phone",
    }).populate({
      path: "cartItems.product",
      select: "title imageCover",
    });
  },
);

export default mongoose.model<IOrder>("Order", orderSchema);
