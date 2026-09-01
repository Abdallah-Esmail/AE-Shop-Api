import Stripe from "stripe";
import factoryHandler from "./handlersFactory.controller.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import appError from "../utils/appError.js";
import httpStatusText from "../utils/httpStatusText.js";
import orderModel from "../models/order.model.js";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET);

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice = totalPrice + item.quantity * item.price;
  });
  return Math.round(totalPrice * 100) / 100;
};

const filterOrdersForLoggedUser = asyncWrapper(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id };
  next();
});

const getOrders = factoryHandler.getAll(orderModel, "Order");

const getSpecificOrder = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const order = await orderModel.findById(id);
  if (!order) {
    const error = new appError("document not found", 404, httpStatusText.FAIL);
    return next(error);
  }
  const orderUserId = order.user._id
    ? order.user._id.toString()
    : order.user.toString();

  if (req.user.role === "user" && orderUserId !== req.user._id.toString()) {
    const error = new appError(
      "You don't have access on this order",
      403,
      httpStatusText.FAIL,
    );
    return next(error);
  }
  res.status(200).json({
    data: order,
  });
});

const createCashOrder = asyncWrapper(async (req, res, next) => {
  // Find logged user cart
  const cart = await cartModel.findById(req.params.cartId);
  if (!cart || !cart.cartItems.length) {
    const error = new appError(
      "There is no product here",
      404,
      httpStatusText.FAIL,
    );
    return next(error);
  }

  // Confirm from quantity
  const productIds = cart.cartItems.map((item) => item.product);
  const products = await productModel.find({ _id: { $in: productIds } });

  for (const item of cart.cartItems) {
    const product = products.find(
      (p) => p._id.toString() === item.product.toString(),
    );
    if (!product || product.quantity < item.quantity) {
      return next(
        new appError(
          `Sorry, product ${product?.title || "Unknown"} is out of stock`,
          400,
          httpStatusText.FAIL,
        ),
      );
    }
  }

  // Get total price
  const totalCartPrice = calcTotalCartPrice(cart);
  const taxPrice =
    Math.round(totalCartPrice * +process.env.TAX_PERCENT * 100) / 100;

  const city = req.body?.shippingAddress?.city?.toLowerCase() || "";
  const shippingPrice = city === "cairo" ? 30 : +process.env.SHIPPING_FEE || 0;

  let totalOrderPrice = totalCartPrice + taxPrice + shippingPrice;
  totalOrderPrice = Math.round(totalOrderPrice * 100) / 100;

  // Create order
  const order = await orderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    shippingPrice,
    taxPrice,
    totalOrderPrice,
  });
  if (order) {
    const bulkOptions = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await productModel.bulkWrite(bulkOptions, {});
    await cartModel.findByIdAndDelete(req.params.cartId);
  }
  // Send order data
  res.status(201).json({ status: "success", data: order });
});

const updateOrderStatus = asyncWrapper(async (req, res, next) => {
  const order = await orderModel.findById(req.params.id);
  if (!order) {
    return next(
      new appError(
        "There is no such a order with this id",
        404,
        httpStatusText.FAIL,
      ),
    );
  }

  const previousStatus = order.status;

  if (previousStatus === "delivered") {
    return next(
      new appError(
        "Cannot edit order status that has already been delivered",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  // update order status
  order.status = req.body.status;

  // Delivered on cash
  if (req.body.status === "delivered") {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.deliveredAt = Date.now();
  }

  // Handle cancelling
  if (req.body.status === "cancelled" && previousStatus !== "cancelled") {
    const bulkOptions = order.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: +item.quantity, sold: -item.quantity } },
      },
    }));
    await productModel.bulkWrite(bulkOptions, {});
  }

  const updatedOrder = await order.save();
  res.status(200).json({ status: "success", data: updatedOrder });
});

const modifyCardOrder = async (event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const orderId = session.client_reference_id;

      if (!orderId) {
        console.error("No client_reference_id found in session");
        return;
      }

      // Check if the request is duplicated
      const existingOrder = await orderModel.findById(orderId);
      if (!existingOrder) return;
      if (existingOrder.isPaid) return;
      // Modify order
      const order = await orderModel.findByIdAndUpdate(
        orderId,
        {
          isPaid: true,
          paidAt: Date.now(),
          sessionId: session.id,
          paymentIntentId: session.payment_intent,
        },
        { returnDocument: "after" },
      );

      if (order) {
        const bulkOption = order.cartItems.map((item) => ({
          updateOne: {
            filter: { _id: item.product },
            update: {
              $inc: { quantity: -item.quantity, sold: +item.quantity },
            },
          },
        }));
        await productModel.bulkWrite(bulkOption, {});

        // Delete cart
        await cartModel.findOneAndDelete({ user: order.user });
      }
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object;
      const order = await orderModel.findOne({
        paymentIntentId: charge.payment_intent,
      });
      if (!order) {
        console.error("Order not found for this refund!");
        return;
      }
      // Check if the request is duplicated
      if (order.isRefunded) return;

      // Modify order
      order.isRefunded = true;
      order.refundedAt = Date.now();
      order.paymentIntentId = charge.payment_intent;
      await order.save();

      // Modify order quantities
      if (order) {
        const bulkOption = order.cartItems.map((item) => ({
          updateOne: {
            filter: { _id: item.product },
            update: {
              $inc: { quantity: +item.quantity, sold: -item.quantity },
            },
          },
        }));
        await productModel.bulkWrite(bulkOption, {});
      }
      break;
    }
  }
};

const checkoutSession = asyncWrapper(async (req, res, next) => {
  const cart = await cartModel.findById(req.params.cartId);
  if (!cart || !cart.cartItems.length) {
    return next(
      new appError("There is no product here", 404, httpStatusText.FAIL),
    );
  }
  // Confirm from quantity
  const productIds = cart.cartItems.map((item) => item.product);
  const products = await productModel.find({ _id: { $in: productIds } });

  for (const item of cart.cartItems) {
    const product = products.find(
      (p) => p._id.toString() === item.product.toString(),
    );
    if (!product || product.quantity < item.quantity) {
      return next(
        new appError(
          `Sorry, product ${product?.title || "Unknown"} is out of stock`,
          400,
          httpStatusText.FAIL,
        ),
      );
    }
  }
  // Get total price
  const totalCartPrice = calcTotalCartPrice(cart);
  const taxPrice =
    Math.round(totalCartPrice * +process.env.TAX_PERCENT * 100) / 100;
  const city = req.query?.city?.toLowerCase() || "";
  const shippingPrice = city === "cairo" ? 30 : +process.env.SHIPPING_FEE || 0;

  let totalOrderPrice = totalCartPrice + taxPrice + shippingPrice;
  totalOrderPrice = Math.round(totalOrderPrice * 100) / 100;

  // Create order
  const order = await orderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: {
      phone: req.query.phone,
      city: req.query.city,
      details: req.query.details,
    },
    taxPrice,
    shippingPrice,
    totalOrderPrice: totalOrderPrice,
    paymentMethodType: "card",
  });

  // Create session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: "Card Checkout",
          },
          unit_amount: Math.round(order.totalOrderPrice * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `https://ae-shop.vercel.app/orders/${order._id}`,
    cancel_url: `https://ae-shop.vercel.app/checkout`,
    customer_email: req.user.email,
    client_reference_id: order._id.toString(),
  });
  order.sessionId = session.id;
  await order.save();
  res.status(200).json({
    status: "success",
    url: session.url,
  });
});

const webhookCheckout = asyncWrapper(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // Create order
  try {
    await modifyCardOrder(event);
  } catch (e) {
    return res.status(500).json({ error: "Webhook failed" });
  }

  res.status(200).json({ received: true });
});

export {
  filterOrdersForLoggedUser,
  getOrders,
  getSpecificOrder,
  createCashOrder,
  updateOrderStatus,
  checkoutSession,
  webhookCheckout,
};
