import mongoose from "mongoose";

import type { IWishlist } from "../types/wishlist.types.js";

const wishlistSchema = new mongoose.Schema<IWishlist>(
  {
    wishlistItems: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IWishlist>("Wishlist", wishlistSchema);
