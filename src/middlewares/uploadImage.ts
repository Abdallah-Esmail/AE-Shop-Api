import multer from "multer";
import type { Field, FileFilterCallback } from "multer";
import appError from "../utils/appError.js";
import httpStatusText from "../utils/httpStatusText.js";
import type { Request } from "express";

const multerOptions = () => {
  const multerStorage = multer.memoryStorage();

  const multerFilter = function (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new appError("Only Images allowed", 400, httpStatusText.FAIL));
    }
  };

  return multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
};

export const uploadSingleImage = (fieldName: string) =>
  multerOptions().single(fieldName);

export const uploadMixOfImages = (arrayOfFields: Field[]) =>
  multerOptions().fields(arrayOfFields);
