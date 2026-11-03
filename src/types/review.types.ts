import type { Types, HydratedDocument, Model } from "mongoose";

export interface IReview {
  user: Types.ObjectId;
  rating: 1 | 2 | 3 | 4 | 5;
  review?: string;
  product: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewModel extends Model<IReview> {
  calcAverageRatings(productId: Types.ObjectId): Promise<void>;
}

export type ReviewDocument = HydratedDocument<IReview>;
