import type { HydratedDocument } from "mongoose";

export type UserRole = "user" | "manager" | "admin";

export interface IUser {
  name: string;
  slug?: string | undefined;
  email: string;
  phone?: string | undefined;
  profileImg?: string | undefined;
  password: string;
  passwordChangedAt?: Date | undefined;
  passwordResetCode?: string | undefined;
  passwordResetExpires?: Date | undefined;
  passwordResetVerified?: boolean | undefined;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;
