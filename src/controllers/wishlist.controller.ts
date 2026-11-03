import { Types, isValidObjectId } from "mongoose";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import wishlistModel from "../models/wishlist.model.js";
import httpStatusText from "../utils/httpStatusText.js";
import appError from "../utils/appError.js";
import type { NextFunction, Request, Response } from "express";
const addProductToWishlist = asyncWrapper(
  async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
    const wishlist = await wishlistModel
      .findOneAndUpdate(
        { user: req.user._id },
        {
          $addToSet: { wishlistItems: req.body.productId },
        },
        { new: true, upsert: true, runValidators: true },
      )
      .populate("wishlistItems", "title price imageCover ratingsAverage");

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      results: wishlist.wishlistItems.length,
      message: "Product added successfully to your wishlist.",
      data: wishlist,
    });
  },
);

const removeProductFromWishlist = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const productId = req.params.productId as string;

    if (!isValidObjectId(productId)) {
      return next(new appError("Invalid product id", 400, httpStatusText.FAIL));
    }

    const productObjectId = new Types.ObjectId(productId);

    const wishlist = await wishlistModel
      .findOneAndUpdate(
        { user: req.user!._id, wishlistItems: productObjectId },
        { $pull: { wishlistItems: productObjectId } },
        { returnDocument: "after" },
      )
      .populate("wishlistItems", "title price imageCover ratingsAverage");

    if (!wishlist) {
      return next(
        new appError(
          "This product is not in your wishlist",
          404,
          httpStatusText.FAIL,
        ),
      );
    }

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      results: wishlist.wishlistItems.length,
      message: "Product removed successfully from your wishlist.",
      data: wishlist,
    });
  },
);

const getLoggedUserWishlist = asyncWrapper(
  async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
    const wishlist = await wishlistModel
      .findOne({ user: req.user._id })
      .populate("wishlistItems", "title price imageCover ratingsAverage");
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
  },
);

export {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
};
