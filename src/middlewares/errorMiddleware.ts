import type { NextFunction, Request, Response } from "express";
import config from "../config/config.js";
import appError from "../utils/appError.js";
import httpStatusText from "../utils/httpStatusText.js";

const sendErrorForDev = (err: Error & Partial<appError>, res: Response) => {
  return res.status(err.statusCode || 500).json({
    status: err.statusText || httpStatusText.ERROR,
    code: err.statusCode || 500,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorForProd = (err: Error & Partial<appError>, res: Response) => {
  return res.status(err.statusCode || 500).json({
    status: err.statusText || httpStatusText.ERROR,
    message: err.message,
  });
};

const handleJwtInvalidSignature = () =>
  new appError("Invalid token, Please login again", 401, httpStatusText.ERROR);

const handleJwtExpired = () =>
  new appError("Expired token, Please login again", 401, httpStatusText.ERROR);

const globalError = (
  err: appError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (config.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    if (err.name === "JsonWebTokenError") err = handleJwtInvalidSignature();
    if (err.name === "TokenExpiredError") err = handleJwtExpired();
    sendErrorForProd(err, res);
  }
};

export default globalError;
