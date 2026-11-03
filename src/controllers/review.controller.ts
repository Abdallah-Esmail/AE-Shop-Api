import type { Request, Response, NextFunction } from "express";
import reviewModel from "../models/review.model.js";
import factoryHandler from "./handlersFactory.controller.js";

const createFilterObj = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  let filterObject = {};
  if (req.params.id) filterObject = { product: req.params.id };
  req.filterObj = filterObject;
  next();
};

const addUserAndProduct = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  req.body.user = req.user._id;
  req.body.product = req.params.productId;
  next();
};

const getAllReviews = factoryHandler.getAll(reviewModel, "Review");
const getReview = factoryHandler.getOne(reviewModel);
const addReview = factoryHandler.createOne(reviewModel);
const updateReview = factoryHandler.updateOne(reviewModel);

export {
  createFilterObj,
  addUserAndProduct,
  getAllReviews,
  getReview,
  addReview,
  updateReview,
};
