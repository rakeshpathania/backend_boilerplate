import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { APP_SECRET } from "../config/index.js";
import { logger, NotFoundError, UnauthorizedError } from "./error-handler.js";
import UserService from "../services/auth.service.js";

// Utility functions
export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

export const GenerateSignature = async (payload) => {
  try {
    return jwt.sign(payload, APP_SECRET, { expiresIn: "24h" });
  } catch (error) {
    console.log(error);
    return error;
  }
};
export const ValidateSignature = async (req) => {
  const userService = new UserService();

  try {
    req.cookies?.token || req.headers.authorization?.split(" ")[1];
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader?.split(" ")[1]
      : req.cookies?.token;
    if (!token) {
      throw new UnauthorizedError("No token provided");
    }
    const blackListedToken = await userService?.getBlackListedToken(token);
    if (blackListedToken) {
      throw new UnauthorizedError("Token is blacklisted");
    }

    const payload = jwt.verify(token, APP_SECRET);
    if (!payload?._id) {
      throw new UnauthorizedError("Invalid token payload");
    }

    const user = await userService?.getProfile(payload._id);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    req.user = user;
    return true;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.error("JWT Error:", error.message);
    } else if (error instanceof UnauthorizedError) {
      logger.error("Auth Error:", error.message);
    } else {
      logger.error("Validation Error:", error.message);
    }
    return false;
  }
};

export const FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new NotFoundError("Data Not found!");
  }
};
