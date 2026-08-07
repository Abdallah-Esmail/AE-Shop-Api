import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Too short product title"],
      maxlength: [100, "Too long product title"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [20, "Too short description"],
      maxlength: [2000, "Too long description"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      max: [200000, "Too long product price"],
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors: {
      type: [String],
      validate: {
        validator: (colors) => colors.length <= 10,
        message: "Max 10 colors allowed",
      },
    },
    imageCover: {
      type: String,
      required: [true, "Product cover image is required"],
    },
    images: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 12,
        message: "Max 12 images allowed",
      },
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Product must be belong to category"],
    },
    subCategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "subcategory",
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "brand",
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above or equal to 1"],
      max: [5, "Rating must be below or equal to 5"],
      default: 1,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

productSchema.pre(/^find/, function () {
  this.populate("category", "name _id");
});

// delete reviews
// delete form cart
// productSchema.pre(["findOneAndDelete", "deleteOne"], async function () {
//   const productId = this.getQuery()._id;
//   await productModel.deleteMany({ category: categoryId });
// });

export default mongoose.model("Product", productSchema);
