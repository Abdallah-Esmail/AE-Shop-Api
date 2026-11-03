import type { Request, Response, NextFunction } from "express";
import type { Model, QueryFilter } from "mongoose";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import appError from "../utils/appError.js";
import ApiFeatures from "../utils/apiFeatures.js";
import httpStatusText from "../utils/httpStatusText.js";

const getAll = <T>(model: Model<T>, modelName: string = "") => {
  return asyncWrapper(async (req, res) => {
    let filter: QueryFilter<T> = req.filterObj ?? {};
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

const getOne = <T>(model: Model<T>) => {
  return asyncWrapper(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    },
  );
};

const createOne = <T>(model: Model<T>) => {
  return asyncWrapper(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const document = await model.create(req.body);
      res.status(201).json({ data: document });
    },
  );
};

const updateOne = <T>(model: Model<T>) => {
  return asyncWrapper(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { document },
      });
      return;
    },
  );
};

const deleteOne = <T>(model: Model<T>) => {
  return asyncWrapper(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    },
  );
};

export default { deleteOne, updateOne, createOne, getOne, getAll };
