import mongoose from "mongoose";

import productModel from "./product.model.js";
import type { ICategory } from "../types/category.types.js";

const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category is required"],
      unique: true,
      minlength: [3, "Too short category name"],
      maxlength: [32, "Too long category name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: { type: String, required: [true, "Category image is required"] },
  },
  { timestamps: true },
);
categorySchema.pre(["findOneAndDelete", "deleteOne"], async function () {
  const categoryId = this.getQuery()._id;
  await productModel.deleteMany({ category: categoryId });
});

export default mongoose.model<ICategory>("Category", categorySchema);
