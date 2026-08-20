import asyncWrapper from "../middlewares/asyncWrapper.js";
import wishlistModel from "../models/wishlist.model.js";
import httpStatusText from "../utils/httpStatusText.js";
import appError from "../utils/appError.js";
const addProductToWishlist = asyncWrapper(async (req, res, next) => {
  const wishlist = await wishlistModel
    .findOneAndUpdate(
      { user: req.user._id },
      {
        $addToSet: { wishlistItems: req.body.productId },
      },
      { new: true, upsert: true, runValidators: true },
    )
    .populate("wishlistItems", "name price imageCover ratingsAverage");

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: wishlist.wishlistItems.length,
    message: "Product added successfully to your wishlist.",
    data: wishlist,
  });
});

const removeProductFromWishlist = asyncWrapper(async (req, res, next) => {
  const wishlist = await wishlistModel
    .findOne({ user: req.user._id })
    .populate("wishlistItems", "name price imageCover ratingsAverage");

  if (
    !wishlist ||
    !wishlist.wishlistItems.some(
      (product) => product.id.toString() === req.params.productId,
    )
  ) {
    const err = new appError(
      "This product is not in your wishlist",
      400,
      httpStatusText.FAIL,
    );
    return next(err);
  }

  wishlist.wishlistItems.pull(req.params.productId);
  await wishlist.save();
  await wishlist.populate(
    "wishlistItems",
    "name price imageCover ratingsAverage",
  );

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: wishlist.wishlistItems.length,
    message: "Product removed successfully from your wishlist.",
    data: wishlist,
  });
});

const getLoggedUserWishlist = asyncWrapper(async (req, res, next) => {
  const wishlist = await wishlistModel
    .findOne({ user: req.user._id })
    .populate("wishlistItems", "name price imageCover ratingsAverage");
  if (!wishlist) {
    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      results: 0,
      data: { wishlistItems: [] },
    });
  }
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: wishlist.wishlistItems.length,
    data: wishlist,
  });
});

export {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
};
