import express from "express";
import { PORT } from "./config/index.js";
import connectDB from "./database/connection.js";
import expressApp from "./express-app.js";
import { logger, initializeErrorHandling } from "./utils/error-handler.js";

const StartServer = async () => {
  try {
    const app = express();

    // Initialize error handling for process-level errors
    initializeErrorHandling();

    // Database connection
    logger.info("Initializing database connection...");
    await connectDB();

    // Express app configuration
    logger.info("Configuring express application...");
    await expressApp(app);
    logger.info("Express application configured successfully");

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(
        `Server environment: ${process.env.NODE_ENV || "development"}`
      );
    });

    // Server error handling
    server.on("error", (error) => {
      logger.error("Server encountered an error:", error);
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle startup
StartServer().catch((error) => {
  logger.error("Startup error:", {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});
