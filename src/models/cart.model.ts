import mongoose from "mongoose";
import type { ICart } from "../types/cart.types.js";

const cartSchema = new mongoose.Schema<ICart>({
  cartItems: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        min: [1, "Quantity must be at least 1"],
        max: [50, "Quantity must be 50 items maximum"],
        default: 1,
      },
      price: {
        type: Number,
        required: [true, "Price is required"],
        max: [200000, "Price is too high"],
      },
      color: String,
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
});

export default mongoose.model<ICart>("Cart", cartSchema);
