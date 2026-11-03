import type { Types, HydratedDocument } from "mongoose";

export interface IProduct {
  title: string;
  slug: string;
  description: string;
  quantity: number;
  sold: number;
  price: number;
  priceAfterDiscount?: number;
  colors: string[];
  imageCover: string;
  images: string[];
  category: Types.ObjectId;
  brand?: Types.ObjectId;
  ratingsAverage: number;
  ratingsQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductDocument = HydratedDocument<IProduct>;
