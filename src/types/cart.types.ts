import type { HydratedDocument, Types } from "mongoose";

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  color?: string;
  price: number;
}

export interface ICart {
  user: Types.ObjectId;
  cartItems: ICartItem[];
}

export type CartDocument = HydratedDocument<ICart>;
