import asyncWrapper from "../middlewares/asyncWrapper.js";
import appError from "../utils/appError.js";
import cartModel from "../models/cart.model.js";
import userModel from "../models/user.model.js";
import productModel from "../models/product.model.js";
import httpStatusText from "../utils/httpStatusText.js";

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice = totalPrice + item.quantity * item.price;
  });
  return Math.round(totalPrice * 100) / 100;
};

const getLoggedUserCart = asyncWrapper(async (req, res, next) => {
  const cart = await cartModel
    .findOne({ user: req.user._id })
    .populate(
      "cartItems.product",
      "title imageCover ratingsAverage price priceAfterDiscount",
    );
  if (!cart) {
    return res.status(200).json({
      status: "success",
      numOfCartItems: 0,
      data: { cartItems: [], totalCartPrice: 0 },
    });
  }
  const totalCartPrice = calcTotalCartPrice(cart);
  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: { ...cart._doc, totalCartPrice: totalCartPrice },
  });
});

const addToCart = asyncWrapper(async (req, res, next) => {
  const { itemId, color } = req.body;
  const user = req.user;
  const product = await productModel.findById(req.body.itemId);
  if (!product) {
    const error = new appError("document not found", 404, httpStatusText.FAIL);
    return next(error);
  }
  if (product.colors.length) {
    if (!color) {
      const error = new appError("Color is required", 400, httpStatusText.FAIL);
      return next(error);
    }
    if (!product.colors.includes(color)) {
      const error = new appError(
        "this color is not available",
        400,
        httpStatusText.FAIL,
      );
      return next(error);
    }
  }
  let cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    cart = await cartModel.create({
      cartItems: [
        {
          product: itemId,
          color: color,
          price: product.priceAfterDiscount || product.price,
        },
      ],
      user: user._id,
    });
  } else {
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === itemId && item.color === color,
    );
    if (productIndex > -1) {
      cart.cartItems[productIndex].quantity++;
      cart.cartItems[productIndex].price =
        product.priceAfterDiscount || product.price;
    } else {
      cart.cartItems.push({
        product: itemId,
        color: color,
        price: product.priceAfterDiscount || product.price,
      });
    }
  }
  await cart.save();
  // Calculate total cart price
  const totalCartPrice = calcTotalCartPrice(cart);
  res.status(200).json({
    status: "success",
    message: "Product added to cart successfully",
    numOfCartItems: cart.cartItems.length,
    data: { ...cart._doc, totalCartPrice: totalCartPrice },
  });
});

const removeSpecificCartItem = asyncWrapper(async (req, res, next) => {
  const cart = await cartModel.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { product: req.params.itemId } },
    },
    {
      returnDocument: "after",
    },
  );
  if (!cart) {
    const error = new appError(
      "No cart items to remove",
      400,
      httpStatusText.FAIL,
    );
    return next(error);
  }
  const totalCartPrice = calcTotalCartPrice(cart);
  res.status(200).json({
    status: "success",
    message: "Item removed successfully",
    numOfCartItems: cart.cartItems.length,
    data: { ...cart._doc, totalCartPrice: totalCartPrice },
  });
});

const clearCart = asyncWrapper(async (req, res, next) => {
  const cart = await cartModel.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});

const updateCartItemQuantity = asyncWrapper(async (req, res, next) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return next(new appError("Invalid quantity", 400, httpStatusText.FAIL));
  }
  const cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    const error = new appError(
      "there is no cart item",
      400,
      httpStatusText.FAIL,
    );
    return next(error);
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item.product.toString() === req.params.itemId,
  );
  if (itemIndex > -1) {
    cart.cartItems[itemIndex].quantity = quantity;
  } else {
    return next(
      new appError("Item not found in your cart", 400, httpStatusText.FAIL),
    );
  }

  await cart.save();
  const totalCartPrice = calcTotalCartPrice(cart);
  res.status(200).json({
    status: "success",
    message: "Quantity updated successfully",
    numOfCartItems: cart.cartItems.length,
    data: { ...cart._doc, totalCartPrice: totalCartPrice },
  });
});

export {
  getLoggedUserCart,
  addToCart,
  removeSpecificCartItem,
  clearCart,
  updateCartItemQuantity,
};
