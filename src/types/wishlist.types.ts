import type { Types, HydratedDocument } from "mongoose";

export interface IWishlist {
  wishlistItems: Types.ObjectId[];
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type WishlistDocument = HydratedDocument<IWishlist>;
