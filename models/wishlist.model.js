import mongoose from "mongoose";

const wishlistSchema = mongoose.Schema(
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

export default mongoose.model("Wishlist", wishlistSchema);
