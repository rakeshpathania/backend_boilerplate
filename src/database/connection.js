import mongoose from "mongoose";
import { DB_URL } from "../config/index.js";
import { APIError, logger, STATUS_CODES } from "../utils/error-handler.js";

const connectDB = async () => {
  try {
    mongoose.connect(DB_URL, {
      serverSelectionTimeoutMS: 5000, // Avoid infinite hanging
      socketTimeoutMS: 45000, // Improve network reliability
    });

    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Database connection error:", error);
    throw new APIError(
      "API Error",
      STATUS_CODES.INTERNAL_ERROR,
      "Unable to connect with DB"
    );
  }
};

export default connectDB;
