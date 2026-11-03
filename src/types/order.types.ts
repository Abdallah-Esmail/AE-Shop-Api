import type { Types, HydratedDocument } from "mongoose";

export type PaymentMethodType = "card" | "cash";
export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

export interface IOrderItem {
  product: Types.ObjectId;
  quantity: number;
  color?: string;
  price: number;
}

export interface IShippingAddress {
  details?: string;
  phone?: string;
  city?: string;
  postalCode?: string;
}

export interface ICreateCashOrderBody {
  shippingAddress: IShippingAddress;
}

export interface IUpdateCashOrderBody {
  status: OrderStatus;
}

export interface IOrder {
  user: Types.ObjectId;
  cartItems: IOrderItem[];
  taxPrice: number;
  shippingAddress: IShippingAddress;
  shippingPrice: number;
  totalOrderPrice: number;
  paymentMethodType: PaymentMethodType;
  paidAt?: Date;
  isPaid: boolean;
  isRefunded: boolean;
  refundedAt?: Date;
  paymentIntentId?: string;
  sessionId?: string;
  status: OrderStatus;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderDocument = HydratedDocument<IOrder>;
