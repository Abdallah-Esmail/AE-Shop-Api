import mongoose from "mongoose";
import type { IBrand } from "../types/brand.types.js";

const brandSchema = new mongoose.Schema<IBrand>(
  {
    name: {
      type: String,
      required: [true, "Brand is required"],
      unique: true,
      minlength: [3, "Too short brand name"],
      maxlength: [32, "Too long brand name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true },
);

export default mongoose.model<IBrand>("Brand", brandSchema);
