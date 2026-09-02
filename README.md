# 🛠️ AE-Shop-Api — RESTful API Backend Service

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Postman](https://img.shields.io/badge/Postman-API_Docs-FF6C37?style=for-the-badge&logo=postman&logoColor=white)](https://documenter.getpostman.com/view/34709416/2sBYAvuptx)

A production-grade RESTful API backend powering the **AE-Shop** e-commerce platform. Built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**, utilizing standard MVC pattern architecture, JWT authentication, image processing, Stripe payments, and transactional emails.

---

## 📑 API Documentation & Live Links

* 📖 **Interactive Postman Documentation:** [https://documenter.getpostman.com/view/34709416/2sBYAvuptx](https://documenter.getpostman.com/view/34709416/2sBYAvuptx)
* 🌐 **Live Web Application:** [https://ae-shop.vercel.app/](https://ae-shop.vercel.app/)
* 🐙 **GitHub Repository:** [abdallah-esmail/AE-Shop-Api](https://github.com/abdallah-esmail/AE-Shop-Api)

---

## ✨ Key Features

* 🔐 **Authentication & Authorization:** JWT token generation and verification, password hashing with `bcryptjs`, password reset flows, and role-based permissions.
* 📦 **E-Commerce Endpoints:** Advanced filtering, sorting, pagination, searching, and field limiting for products and categories.
* 🛒 **Cart & Wishlist Engine:** Cart calculation, coupon application, shipping fee computation, and tax estimation (`TAX_PERCENT=0.14`).
* 💳 **Payment & Checkout:** Integrated Stripe payment processing with Webhook validation.
* 🖼️ **Media Processing & Storage:** Multi-part file handling (`Multer`), image optimization (`Sharp`), and cloud hosting (`Cloudinary`).
* 📧 **Email Services:** Transactional email delivery via `Nodemailer`.

---

## 🛠️ Tech Stack & Dependencies

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database & ORM:** MongoDB & Mongoose
* **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
* **Validation:** `express-validator`
* **Media & Cloud:** Multer, Sharp, Cloudinary
* **Payments:** Stripe SDK
* **Mail:** Nodemailer

---

## 📁 Project Structure (MVC Architecture)

```text
AE-Shop-Api/
├── config/             # Database connection setup & configuration files
├── controllers/        # Express request handlers & core business logic
├── middlewares/        # Auth checks, error handling, input validation
├── models/             # Mongoose schemas (User, Product, Category, Cart, Order)
├── node_modules/
├── routes/             # API route definitions
├── uploads/            # Local temporary file uploads directory
├── utils/              # Helper utilities (API Features, Handlers, Token generators)
├── .env                # Environment configuration file
├── .eslintrc.json      # Code quality & ESLint rules
├── .gitignore
├── index.js            # Main application entry point & server setup
├── notes.txt           # Developer documentation & project notes
├── package-lock.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js:** v18.x or higher
* **MongoDB:** Local MongoDB instance or MongoDB Atlas URI

### Installation & Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abdallah-esmail/AE-Shop-Api.git
   cd AE-Shop-Api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory matching the following variables:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   DB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ae-shop
   
   # Cloudinary Media Configuration
   CLOUD_NAME=your_cloud_name
   API_KEY=your_cloudinary_api_key
   API_SECRET=your_cloudinary_api_secret
   
   # JWT Configuration
   JWT_SECRET_KEY=your_super_secret_jwt_key
   JWT_EXPIRE_TIME=90d
   
   # Nodemailer SMTP Configuration
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USER=your_email_username
   EMAIL_PASS=your_password
   
   # Stripe Payment Configuration
   STRIPE_SECRET=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   
   # Store Tax & Shipping Settings
   SHIPPING_FEE=60
   TAX_PERCENT=0.14
   ```

4. **Start the API Server:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```
   The backend server will run at `http://localhost:5000`.

---

## 🧪 API Testing & Documentation

Explore all available routes, request payloads, response schemas, and authentication headers:

👉 **[Open Published Postman Documentation](https://documenter.getpostman.com/view/34709416/2sBYAvuptx)**

---

## 👨‍💻 Author

**Abdallah Ismail** — Backend / Full-Stack Developer
* 🌐 Live App: [ae-shop.vercel.app](https://ae-shop.vercel.app/)
* 💼 LinkedIn: [abdallah-esmail](https://www.linkedin.com/in/abdallah-esmail)
* 🐙 GitHub: [@abdallah-esmail](https://github.com/abdallah-esmail)
* 📑 API Docs: [Postman Collection](https://documenter.getpostman.com/view/34709416/2sBYAvuptx)
