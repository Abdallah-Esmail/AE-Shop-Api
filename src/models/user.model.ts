import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import type { IUser } from "../types/user.types.js";

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
    },
    phone: String,
    profileImg: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: [6, "Too short password"],
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

export default mongoose.model<IUser>("User", userSchema);
