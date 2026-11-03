import "dotenv/config";

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function numberEnv(name: string, defaultValue?: number): number {
  const value = process.env[name];

  if (value === undefined || value === "") {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(`Missing required environment variable: ${name}`);
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }

  return number;
}

const config = {
  // App
  PORT: numberEnv("PORT", 5000),
  NODE_ENV: process.env.NODE_ENV ?? "development",

  // Database
  DB_URI: requiredEnv("DB_URI"),
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,

  // Cloudinary
  CLOUD_NAME: requiredEnv("CLOUD_NAME"),
  API_KEY: requiredEnv("API_KEY"),
  API_SECRET: requiredEnv("API_SECRET"),

  // JWT
  JWT_SECRET_KEY: requiredEnv("JWT_SECRET_KEY"),
  JWT_EXPIRE_TIME: process.env.JWT_EXPIRE_TIME ?? "90d",

  // Email
  EMAIL_HOST: requiredEnv("EMAIL_HOST"),
  EMAIL_PORT: numberEnv("EMAIL_PORT", 587),
  EMAIL_USER: requiredEnv("EMAIL_USER"),
  EMAIL_PASS: requiredEnv("EMAIL_PASS"),

  // Stripe
  STRIPE_SECRET: requiredEnv("STRIPE_SECRET"),
  STRIPE_WEBHOOK_SECRET: requiredEnv("STRIPE_WEBHOOK_SECRET"),

  // Taxes and shipping
  TAX_PERCENT: numberEnv("TAX_PERCENT", 0.14),
  SHIPPING_FEE: numberEnv("SHIPPING_FEE", 60),
} as const;

export default config;
