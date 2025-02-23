import UserRepository from "../database/repository/auth.repository.js";
import BlackListTokenRepository from "../database/repository/blackListedToken.repository.js";

import {
  FormateData,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} from "../utils/helpers.js";
import {
  APIError,
  BadRequestError,
  logger,
  UnauthorizedError,
} from "../utils/error-handler.js";

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
    this.blackListTokenRepository = new BlackListTokenRepository();
  }

  async signIn(userInputs) {
    const { email, password } = userInputs;
    try {
      logger.info("Sign in attempt initiated", {
        email,
        timestamp: new Date(),
      });

      const existingUser = await this.userRepository.FindUserByEmail({ email });
      if (!existingUser) {
        throw new UnauthorizedError("Invalid credentials");
      }

      const isPasswordValid = await ValidatePassword(
        password,
        existingUser.password,
        existingUser.salt
      );
      if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid credentials");
      }
      const tokenPayload = {
        email: existingUser.email,
        _id: existingUser._id,
        iat: Math.floor(Date.now() / 1000),
      };
      const token = await GenerateSignature(tokenPayload);
      logger.info("Authentication successful", {
        userId: existingUser._id,
        timestamp: new Date(),
      });
      return FormateData({
        user: existingUser,
        token,
      });
    } catch (error) {
      // Rethrow as APIError with appropriate status
      if (error instanceof UnauthorizedError) {
        throw error;
      }

      throw new APIError("Authentication failed", {
        message: error.message,
        stack: error.stack,
      });
    }
  }

  async signUp(userInputs) {
    try {
      const { email, password } = userInputs;
      logger.info("Attempting user registration", { email });
      const existingUser = await this.userRepository.FindUserByEmail({ email });
      if (existingUser) {
        throw new BadRequestError("User is already exist with this email");
      }
      const salt = await GenerateSalt();
      const hashedPassword = await GeneratePassword(password, salt);

      const newUser = await this.userRepository.createUser({
        ...userInputs,
        password: hashedPassword,
        salt,
      });

      const token = await GenerateSignature({
        email,
        _id: newUser?._id,
      });

      logger.info("User registered successfully", { userId: newUser?._id });
      return FormateData({ user: newUser, token });
    } catch (err) {
      if (err instanceof BadRequestError) {
        throw err;
      }
      throw new APIError("Unable to sign up the user", {
        message: err.message,
        stack: err.stack,
      });
    }
  }

  async getProfile(id) {
    try {
      logger.info("Fetching user profile", { userId: id });
      const existingUser = await this.userRepository.FindUserById(id);
      return FormateData(existingUser);
    } catch (err) {
      throw new APIError("Unable to find the user", {
        message: err.message,
        stack: err.stack,
      });
    }
  }

  async updateProfile(id, data) {
    try {
      logger.info("Updating user profile", { userId: id });

      const updateFields = {};

      if (data?.firstName) {
        updateFields["fullName.firstName"] = data.firstName;
        delete data.firstName;
      }
      if (data?.lastName) {
        updateFields["fullName.lastName"] = data.lastName;
        delete data.lastName;
      }

      // Sanitize input
      const sanitizedData = { ...data, ...updateFields };
      delete sanitizedData._id;
      delete sanitizedData.__v;

      if (Object.keys(sanitizedData).length === 0) {
        throw new BadRequestError("No valid update data provided");
      }
      const existingUser = await this.userRepository.updateUser(
        id,
        sanitizedData
      );
      return FormateData(existingUser);
    } catch (err) {
      if (err instanceof BadRequestError) {
        throw err;
      }
      throw new APIError("Unable to update the user", {
        message: err.message,
        stack: err.stack,
      });
    }
  }

  async deleteProfile(id) {
    try {
      logger.info("Deleting user profile", { userId: id });
      await this.userRepository.deleteUser(id);
      return;
    } catch (err) {
      throw new APIError("Unable to delete the user", {
        message: err.message,
        stack: err.stack,
      });
    }
  }

  async logout(token) {
    try {
      await this.blackListTokenRepository.createBlackListedToken(token);
      return;
    } catch (err) {
      throw new APIError("Unable to logout the user", {
        message: err.message,
        stack: err.stack,
      });
    }
  }
  async getBlackListedToken(token) {
    try {
      return await this.blackListTokenRepository.getBlackListedToken(token);
    } catch (err) {
      throw new APIError("Unable to get the token", {
        message: err.message,
        stack: err.stack,
      });
    }
  }
}

export default UserService;
