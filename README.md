# 🛠️ AE-Shop-Api — RESTful API Backend Service

[![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Swagger](https://img.shields.io/badge/Swagger-API%20Docs-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://app.swaggerhub.com/apis-docs/abdallah-687/ae-shop/1.0.0?view=uiDocs)

A production-oriented RESTful API backend powering the **AE-Shop** e-commerce platform. Built with **TypeScript**, **Node.js**, **Express 5**, and **MongoDB (Mongoose)**, following an MVC architecture with JWT authentication, image processing, Stripe payments, and transactional emails.

---

## 📑 Documentation & Live Links

- 🧪 **Postman Documentation:** https://documenter.getpostman.com/view/34709416/2sBYAvuptx
- 🦄 **Swagger API Docs:** https://app.swaggerhub.com/apis-docs/abdallah-687/ae-shop/1.0.0?view=uiDocs
- 🌐 **Live Web Application:** https://ae-shop.vercel.app/
- 🔌 **API Base URL:** `https://ae-shop-api.vercel.app/api/v1`
- 🐙 **GitHub Repository:** https://github.com/abdallah-esmail/AE-Shop-Api

---

## ✨ Key Features

- 🔐 **Authentication & Authorization:** JWT token generation and verification, password hashing with `bcryptjs`, password reset flows, and role-based permissions.
- 📦 **E-Commerce Endpoints:** Filtering, sorting, pagination, searching, and field limiting for products and categories.
- 🛒 **Cart & Wishlist:** Cart calculation, coupon application, shipping fee computation, and tax estimation.
- 💳 **Payments & Checkout:** Stripe Checkout with signed webhook verification, plus cash-on-delivery orders.
- 🖼️ **Media Processing:** Multi-part uploads (`Multer`), image optimization (`Sharp`), and cloud hosting (`Cloudinary`).
- 📧 **Email Services:** Transactional emails via `Nodemailer`.
- 🧱 **Type Safety:** Strict TypeScript (`strict`, `exactOptionalPropertyTypes`) with typed models, request bodies, and Express request augmentation.

---

## 🛠️ Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js 24
- **Framework:** Express 5
- **Database & ODM:** MongoDB & Mongoose
- **Authentication:** `jsonwebtoken` & `bcryptjs`
- **Validation:** `express-validator`
- **Media & Cloud:** Multer, Sharp, Cloudinary
- **Payments:** Stripe SDK
- **Mail:** Nodemailer
- **Dev tooling:** `tsx` (dev runner), `tsc` (build & type-check), ESLint

---

## 📁 Project Structure

```text
AE-Shop-Api/
├── src/
│   ├── config/          # config.ts (env), database.ts (Mongo), cloudinary.ts
│   ├── controllers/     # Request handlers & business logic
│   ├── middlewares/     # Auth, error handling, validation, uploads
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route definitions
│   ├── types/           # Shared types & Express request augmentation
│   ├── utils/           # Helpers (ApiFeatures, appError, ...)
│   └── index.ts         # Application entry point
├── dist/                # Compiled output (generated, git-ignored)
├── .env.example         # Template for environment variables
├── .gitignore
├── eslint.config.js
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** v24.x
- **MongoDB:** Local instance or MongoDB Atlas URI

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/abdallah-esmail/AE-Shop-Api.git
   cd AE-Shop-Api
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env` and fill in your values:

   ```env
   PORT=5000
   NODE_ENV=development

   # Database
   DB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ae-shop

   # Cloudinary
   CLOUD_NAME=your_cloud_name
   API_KEY=your_cloudinary_api_key
   API_SECRET=your_cloudinary_api_secret

   # JWT
   JWT_SECRET_KEY=your_super_secret_jwt_key
   JWT_EXPIRE_TIME=90d

   # Nodemailer (SMTP)
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USER=your_email_username
   EMAIL_PASS=your_password

   # Stripe
   STRIPE_SECRET=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   # Store settings
   SHIPPING_FEE=60
   TAX_PERCENT=0.14
   ```

   > Never commit your real `.env` file. Only `.env.example` should be tracked.

4. **Run the server:**

   ```bash
   # Development (hot reload via tsx)
   npm run start:dev

   # Type-check without emitting files
   npm run typecheck

   # Build to ./dist
   npm run build

   # Run the compiled build (env vars from the host)
   npm start

   # Run the compiled build locally with .env
   npm run start:local
   ```

   The server runs at `http://localhost:5000`.

---

## 📜 Available Scripts

| Script                | Description                                    |
| --------------------- | ---------------------------------------------- |
| `npm run start:dev`   | Start in watch mode with `tsx` (no type-check) |
| `npm run typecheck`   | Run the TypeScript compiler without emitting   |
| `npm run build`       | Compile TypeScript to `dist/`                  |
| `npm start`           | Run the compiled app (`dist/index.js`)         |
| `npm run start:local` | Run the compiled app and load `.env`           |

---

## 💳 Stripe Webhook

The webhook endpoint requires the **raw request body** to verify Stripe's signature, so it must be registered **before** `express.json()`. Set the endpoint URL and signing secret (`STRIPE_WEBHOOK_SECRET`) in the Stripe Dashboard. For local testing, use the Stripe CLI to forward events.

---

## 🧪 API Documentation

Explore all routes, request payloads, response schemas, and authentication headers:

👉 **[Postman Documentation](https://documenter.getpostman.com/view/34709416/2sBYAvuptx)** · **[Swagger](https://app.swaggerhub.com/apis-docs/abdallah-687/ae-shop/1.0.0?view=uiDocs)**

---

## 👨‍💻 Author

**Abdallah Esmail** — Backend / Full-Stack Developer

- 🌐 Live App: [ae-shop.vercel.app](https://ae-shop.vercel.app/)
- 💼 LinkedIn: [abdallah-esmail](https://www.linkedin.com/in/abdallah-esmail)
- 🐙 GitHub: [@abdallah-esmail](https://github.com/abdallah-esmail)
