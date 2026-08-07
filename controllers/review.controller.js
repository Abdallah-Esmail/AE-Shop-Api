import reviewModel from "../models/review.model.js";
import factoryHandler from "./handlersFactory.controller.js";

const createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.id) filterObject = { product: req.params.id };
  req.filterObj = filterObject;
  next();
};

const addUserAndProduct = (req, res, next) => {
  req.body.user = req.user._id;
  req.body.product = req.params.id;
  next();
};

const getAllReviews = factoryHandler.getAll(reviewModel, "Review");
const getReview = factoryHandler.getOne(reviewModel);
const addReview = factoryHandler.createOne(reviewModel);
const updateReview = factoryHandler.updateOne(reviewModel);
const removeReview = factoryHandler.deleteOne(reviewModel);

export {
  createFilterObj,
  addUserAndProduct,
  getAllReviews,
  getReview,
  addReview,
  updateReview,
  removeReview,
};
