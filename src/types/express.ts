import type { HydratedDocument } from "mongoose";
import type { IUser } from "./user.types.js";
declare global {
  namespace Express {
    interface Request {
      user: HydratedDocument<IUser>;
      filterObj?: Record<string, unknown>;
    }
  }
}

export {};
