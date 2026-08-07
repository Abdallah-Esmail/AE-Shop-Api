import userModel from "../models/user.model.js";
import factoryHandler from "./handlersFactory.controller.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import appError from "../utils/appError.js";
import httpStatusText from "../utils/httpStatusText.js";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import createToken from "../utils/createToken.js";
import cloudinary from "../config/cloudinary.js";
import { uploadSingleImage } from "../middlewares/uploadImage.js";

const getUsers = factoryHandler.getAll(userModel, "User");
const getUser = factoryHandler.getOne(userModel);

// Upload single image
const uploadUserImage = uploadSingleImage("profileImg");

const extractPublicId = (url) => {
  if (!url) return null;
  const parts = url.split("/");
  const fileName = parts[parts.length - 1].split(".")[0];
  const folder = parts[parts.length - 2];
  return `${folder}/${fileName}`;
};

const safeDestroy = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(
      `Failed to delete image ${publicId} from Cloudinary:`,
      err.message,
    );
  }
};

// Image processing
const resizeImage = asyncWrapper(async (req, res, next) => {
  if (req.file) {
    const processedBuffer = await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toBuffer();

    try {
      const base64Image = `data:image/jpeg;base64,${processedBuffer.toString("base64")}`;

      const result = await cloudinary.uploader.upload(base64Image, {
        folder: "users",
      });

      req.body.profileImg = result.secure_url;
    } catch (error) {
      return next(
        new appError("Image upload failed", 500, httpStatusText.FAIL),
      );
    }
  }

  next();
});

const createUser = factoryHandler.createOne(userModel);

const updateUser = asyncWrapper(async (req, res, next) => {
  const allowedFields = [
    "name",
    "phone",
    "slug",
    "email",
    "profileImg",
    "active",
  ];
  const updateData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const oldUser = await userModel.findById(req.params.id);
  if (!oldUser) {
    const error = new appError("Document not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  if (updateData.profileImg && oldUser.profileImg) {
    await safeDestroy(extractPublicId(oldUser.profileImg));
  }

  const document = await userModel.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!document) {
    const error = new appError("Document not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { document },
  });
});

const changeUserPassword = asyncWrapper(async (req, res, next) => {
  const hashedPassword = await bcrypt.hash(req.body.newPassword, 12);
  const document = await userModel.findByIdAndUpdate(
    req.params.id,
    { password: hashedPassword, passwordChangedAt: Date.now() },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!document) {
    const error = new appError("Document not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { document },
  });
});

const deactivateUser = asyncWrapper(async (req, res, next) => {
  const updatedUser = await userModel.findByIdAndUpdate(
    req.params.id,
    { active: false },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );
  if (!updatedUser) {
    const error = new appError("Document not found", 404, httpStatusText.FAIL);
    return next(error);
  }
  res.status(204).json();
});

const getLoggedUserData = asyncWrapper(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

const updateLoggedUserPassword = asyncWrapper(async (req, res, next) => {
  const hashedPassword = await bcrypt.hash(req.body.newPassword, 12);
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { password: hashedPassword, passwordChangedAt: Date.now() },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );
  req.params.id = req.user._id;
  const token = createToken(user._id);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { user },
    token,
  });
});

const updateLoggedUserData = asyncWrapper(async (req, res, next) => {
  const allowedFields = ["name", "phone", "email", "profileImg"];
  const updateData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });
  if (Object.keys(updateData).length === 0) {
    const err = new appError(
      "Please, enter the data to update",
      400,
      httpStatusText.FAIL,
    );
    return next(err);
  }

  if (updateData.profileImg && req.user.profileImg) {
    await safeDestroy(extractPublicId(req.user.profileImg));
  }

  const updatedUser = await userModel.findByIdAndUpdate(
    req.user._id,
    updateData,
    {
      returnDocument: "after",
      runValidators: true,
    },
  );
  res.status(200).json({ data: updatedUser });
});

const deleteLoggedUser = asyncWrapper(async (req, res, next) => {
  await userModel.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).send();
});

export {
  uploadUserImage,
  resizeImage,
  getUsers,
  getUser,
  updateUser,
  createUser,
  changeUserPassword,
  deactivateUser,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUser,
};
