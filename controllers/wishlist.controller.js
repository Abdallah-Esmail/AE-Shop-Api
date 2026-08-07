import asyncWrapper from "../middlewares/asyncWrapper.js";
import userModel from "../models/user.model.js";

const addProductToWishlist = asyncWrapper(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true },
  );

  res.status(200).json({
    status: "success",
    message: "Product added successfully to your wishlist.",
    data: user.wishlist,
  });
});

const removeProductFromWishlist = asyncWrapper(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.productId },
    },
    { new: true },
  );

  res.status(200).json({
    status: "success",
    message: "Product removed successfully from your wishlist.",
    data: user.wishlist,
  });
});

const getLoggedUserWishlist = asyncWrapper(async (req, res, next) => {
  const user = await userModel.findById(req.user._id).populate("wishlist");

  res.status(200).json({
    status: "success",
    results: user.wishlist.length,
    data: user.wishlist,
  });
});

export {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
};
