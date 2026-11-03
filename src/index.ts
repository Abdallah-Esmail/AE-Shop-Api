import "./types/express.js";
import config from "./config/config.js";

import express from "express";
import type { Express, Request, Response } from "express";

import morgan from "morgan";
import qs from "qs";
import cors from "cors";

import dbConnection from "./config/database.js";
import categoryRoute from "./routes/category.route.js";
import brandRoute from "./routes/brand.route.js";
import productRoute from "./routes/product.route.js";
import cartRoute from "./routes/cart.route.js";
import userRoute from "./routes/user.route.js";
import orderRoute from "./routes/order.route.js";
import wishlistRoute from "./routes/wishlist.route.js";
import authRoute from "./routes/auth.route.js";
import httpStatusText from "./utils/httpStatusText.js";
import globalError from "./middlewares/errorMiddleware.js";
import * as orderController from "./controllers/order.controller.js";

// Express app
const app: Express = express();

// connect with db
dbConnection();

// Cors
app.use(
  cors({
    origin: ["https://ae-shop.vercel.app", "http://localhost:5173"],
    credentials: true,
  }),
);

// Webhook
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  orderController.webhookCheckout,
);

// Middlewares
app.use(express.json({ limit: "20kb" }));

if (config.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${config.NODE_ENV}`);
}

// Query String parser to mongo query
app.set("query parser", (str: string) => qs.parse(str));

// Mount Routes
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/brands", brandRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/carts", cartRoute);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/wishlist", wishlistRoute);
app.use("/api/v1/auth", authRoute);

// global middleware for not found router
app.use((_req: Request, res: Response): void => {
  res.status(404).json({
    status: httpStatusText.ERROR,
    message: "Route not found",
  });
});

// global error handler
app.use(globalError);

const PORT = Number(config.PORT) || 8000;
const server = app.listen(PORT, (): void => {
  console.log(`listening on port ${PORT}`);
});

// Handle rejections outside express
process.on("unhandledRejection", (err: unknown): void => {
  if (err instanceof Error) {
    console.error(`unhandledRejection Errors: ${err.name} | ${err.message}`);
  }
  server.close(() => {
    console.error("Shutting down....");
    process.exit(1);
  });
});
process.on("uncaughtException", (err: unknown): void => {
  if (err instanceof Error) {
    console.error(`uncaughtException Errors: ${err.name} | ${err.message}`);
  }
  server.close(() => {
    console.error("Shutting down....");
    process.exit(1);
  });
});
