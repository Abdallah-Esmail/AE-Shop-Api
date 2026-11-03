import type { HydratedDocument } from "mongoose";

export interface IBrand {
  name: string;
  slug?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BrandDocument = HydratedDocument<IBrand>;
