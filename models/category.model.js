import mongoose from "mongoose";
import productModel from "../models/product.model.js";
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category is required"],
      unique: [true, "category must be unique"],
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

export default mongoose.model("Category", categorySchema);
