import mongoose from "mongoose";
import config from "./config.js";

const dbConnection = async () => {
  try {
    const conn = await mongoose.connect(config.DB_URI);
    console.log(`Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default dbConnection;
