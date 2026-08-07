import asyncWrapper from "../middlewares/asyncWrapper.js";
import appError from "../utils/appError.js";
import ApiFeatures from "../utils/apiFeatures.js";
import httpStatusText from "../utils/httpStatusText.js";

const getAll = (model, modelName = "") => {
  return asyncWrapper(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    // Build query
    const documentsCount = await model.countDocuments(filter);
    const apiFeatures = new ApiFeatures(model.find(filter), req.query)
      .pagination(documentsCount)
      .filter()
      .sort()
      .search(modelName)
      .limitFields();

    // Execute query
    const documents = await apiFeatures.mongooseQuery;

    res.status(200).json({
      results: documents.length,
      paginationResult: apiFeatures.paginationResult,
      data: documents,
    });
  });
};

const getOne = (model) => {
  return asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const document = await model.findById(id);
    if (!document) {
      const error = new appError(
        "document not found",
        404,
        httpStatusText.FAIL,
      );
      return next(error);
    }
    res.status(200).json({
      data: document,
    });
  });
};

const createOne = (model) => {
  return asyncWrapper(async (req, res, next) => {
    const document = await model.create(req.body);
    res.status(201).json({ data: document });
  });
};

const updateOne = (model) => {
  return asyncWrapper(async (req, res, next) => {
    const document = await model.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!document) {
      const error = new appError(
        "Document not found",
        404,
        httpStatusText.FAIL,
      );
      return next(error);
    }

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { document },
    });
  });
};

const deleteOne = (model) => {
  return asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const document = await model.findByIdAndDelete(id);
    if (!document) {
      const error = new appError(
        "document not found",
        404,
        httpStatusText.FAIL,
      );
      return next(error);
    }
    res.status(204).send();
  });
};

export default { deleteOne, updateOne, createOne, getOne, getAll };
