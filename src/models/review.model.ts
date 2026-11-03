import mongoose from "mongoose";
import productModel from "./product.model.js";
import type { Types } from "mongoose";
import type { IReview, IReviewModel } from "../types/review.types.js";

const reviewSchema = new mongoose.Schema<IReview, IReviewModel>(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "The user is required"],
    },
    rating: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: [true, "review ratings required"],
    },
    review: {
      type: String,
      minlength: [6, "Too short review"],
      maxlength: [300, "Too long review"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to product"],
    },
  },
  { timestamps: true },
);

reviewSchema.pre(/^find/, function (this: mongoose.Query<unknown, IReview>) {
  this.populate({
    path: "user",
    select: "name profileImg",
  });
});

reviewSchema.statics.calcAverageRatings = async function (
  this: IReviewModel,
  productId: Types.ObjectId,
): Promise<void> {
  const result = await this.aggregate<{
    _id: Types.ObjectId;
    avgRating: number;
    ratingsCount: number;
  }>([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        ratingsCount: { $sum: 1 },
      },
    },
  ]);

  await productModel.findByIdAndUpdate(productId, {
    ratingsAverage: result[0]?.avgRating ?? 0,
    ratingsQuantity: result[0]?.ratingsCount ?? 0,
  });
};

reviewSchema.post("save", async function () {
  await (this.constructor as IReviewModel).calcAverageRatings(this.product);
});

reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await (doc.constructor as IReviewModel).calcAverageRatings(doc.product);
  }
});

reviewSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    await (doc.constructor as IReviewModel).calcAverageRatings(doc.product);
  }
});

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.model<IReview, IReviewModel>("Review", reviewSchema);
