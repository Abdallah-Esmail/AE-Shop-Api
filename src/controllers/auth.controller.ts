import crypto from "crypto";
import bcrypt from "bcryptjs";

import asyncWrapper from "../middlewares/asyncWrapper.js";
import appError from "../utils/appError.js";
import httpStatusText from "../utils/httpStatusText.js";
import userModel from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import createToken, { verifyToken } from "../utils/createToken.js";

import type { Request, Response, NextFunction } from "express";

const signup = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Create user
    const user = await userModel.create({
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      password: req.body.password,
      profileImg: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    });

    const token = createToken(user._id.toString());
    res.status(201).json({ data: user, token });
  },
);

const login = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await userModel
      .findOne({
        email: req.body.email,
      })
      .select("+password");
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return next(
        new appError("Incorrect email or password", 401, httpStatusText.FAIL),
      );
    }
    if (!user.active)
      return next(
        new appError(
          "Your account has been deactivated",
          401,
          httpStatusText.FAIL,
        ),
      );

    const token = createToken(user._id.toString());
    res.status(200).json({ data: user, token });
  },
);

const protect = asyncWrapper(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token || token === "null") {
      return next(
        new appError(
          "You have not logged in, please login to get access this resource",
          401,
          httpStatusText.FAIL,
        ),
      );
    }

    let decoded: ReturnType<typeof verifyToken>;
    try {
      decoded = verifyToken(token);
    } catch {
      return next(
        new appError(
          "Invalid or expired token, please log in again",
          401,
          httpStatusText.FAIL,
        ),
      );
    }

    const currentUser = await userModel.findById(decoded.userId);
    if (!currentUser) {
      return next(
        new appError(
          "The user that belong to this token does no longer exists",
          401,
          httpStatusText.FAIL,
        ),
      );
    }
    if (!currentUser.active) {
      return next(
        new appError("This account is inactive", 401, httpStatusText.FAIL),
      );
    }

    if (currentUser.passwordChangedAt && decoded.iat) {
      const passChangedTimestamp = Math.floor(
        currentUser.passwordChangedAt.getTime() / 1000,
      );
      if (passChangedTimestamp > decoded.iat) {
        return next(
          new appError(
            "This user has changed his password recently, please login again...",
            401,
            httpStatusText.FAIL,
          ),
        );
      }
    }

    req.user = currentUser;
    next();
  },
);

const allowedTo = (...roles: string[]) => {
  return asyncWrapper(
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        const err = new appError(
          "You have not logged in, please login to get access this resource",
          403,
          httpStatusText.FAIL,
        );
        return next(err);
      }
      if (!roles.includes(req.user.role)) {
        const err = new appError(
          "You are not allowed to access this route",
          403,
          httpStatusText.FAIL,
        );
        return next(err);
      }
      next();
    },
  );
};

const forgetPassword = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: "If user exists reset code has sent to email",
      });
      return;
    }

    const resetCode = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    const hashedResetCode = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");
    user.passwordResetCode = hashedResetCode;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetVerified = false;
    await user.save();
    const message = `Hi, ${user.name},\nWe received a request to reset the password on your E-shop Account. \n${resetCode}. \n Enter this code to complete the reset.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset code {valid for 10 minutes}",
        message,
      });
    } catch (err) {
      user.passwordResetCode = undefined;
      user.passwordResetExpires = undefined;
      user.passwordResetVerified = undefined;
      await user.save();
      return next(
        new appError(
          "There is an error in sending email",
          500,
          httpStatusText.ERROR,
        ),
      );
    }
    res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "If user exists reset code has sent to email",
    });
  },
);

const verifyPasswordResetCode = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const hashedResetCode = crypto
      .createHash("sha256")
      .update(req.body.resetCode)
      .digest("hex");
    const user = await userModel.findOne({
      passwordResetCode: hashedResetCode,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      const err = new appError(
        "Reset code is invalid or expired",
        404,
        httpStatusText.FAIL,
      );
      return next(err);
    }
    user.passwordResetVerified = true;
    await user.save();
    res.status(200).json({ status: httpStatusText.SUCCESS });
  },
);

const resetPassword = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      const err = new appError(
        "Invalid request or expired code",
        400,
        httpStatusText.FAIL,
      );
      return next(err);
    }

    if (
      !user ||
      !user.passwordResetVerified ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      const err = new appError(
        "Invalid request or expired code",
        400,
        httpStatusText.FAIL,
      );
      return next(err);
    }

    if (!user.passwordResetVerified) {
      const err = new appError(
        "Invalid request or expired code",
        400,
        httpStatusText.FAIL,
      );
      return next(err);
    }
    user.password = req.body.newPassword;
    user.passwordChangedAt = new Date();
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = false;
    await user.save();

    const token = createToken(user._id.toString());
    res.status(200).json({ token });
  },
);

export {
  signup,
  login,
  protect,
  allowedTo,
  forgetPassword,
  verifyPasswordResetCode,
  resetPassword,
};
