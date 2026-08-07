import subCategoryModel from "../models/subCategory.model.js";
import factoryHandler from "./handlersFactory.controller.js";

// On create
const setCategoryIdToBody = (req, res, next) => {
  // Nested route
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// On get
const createFilterObj = (req, res, next) => {
  let filterObj = {};
  if (req.params.categoryId) {
    filterObj = { category: req.params.categoryId };
    req.filterObj = filterObj;
  }
  next();
};

const getSubCategories = factoryHandler.getAll(subCategoryModel, "Subcategory");
const getSubCategory = factoryHandler.getOne(subCategoryModel);
const createSubCategory = factoryHandler.createOne(subCategoryModel);
const updateSubCategory = factoryHandler.updateOne(subCategoryModel);
const deleteSubCategory = factoryHandler.deleteOne(subCategoryModel);

export {
  getSubCategories,
  getSubCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdToBody,
  createFilterObj,
};
