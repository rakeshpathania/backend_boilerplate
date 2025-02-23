import { UserModel } from "../models/users.js";
import { APIError } from "../../utils/error-handler.js";

class UserRepository {
  async createUser(data) {
    try {
      const user = new UserModel(data);
      const userResult = await user.save();
      // Remove sensitive fields before returning
      const userData = userResult.toObject();
      delete userData.password;
      delete userData.salt;

      return userData;
    } catch (err) {
      throw new APIError("Unable to sign up user", {
        message: err.message,
        stack: err.stack,
      });
    }
  }
  async FindUserByEmail(email) {
    try {
      const user = await UserModel.findOne(email)
        .select("+password +salt -__v")
        .lean();

      if (!user) {
        return null;
      }
      return user;
    } catch (err) {
      throw new APIError("Error finding user with email", {
        message: err.message,
        stack: err.stack,
        statusCode: 500,
      });
    }
  }
  async FindUserById(id) {
    try {
      const user = await UserModel.findById(id);
      if (!user) {
        return null;
      }
      return user;
    } catch (err) {
      throw new APIError("Error finding user with id", {
        message: err.message,
        stack: err.stack,
        statusCode: 500,
      });
    }
  }

  async updateUser(id, data) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        id,
        { $set: data },
        {
          new: true,
          runValidators: true,
          context: "query",
        }
      );

      if (!user) {
        return null;
      }

      return user;
    } catch (err) {
      throw new APIError("Error updating user", {
        message: err.message,
        stack: err.stack,
        statusCode: 500,
      });
    }
  }

  async deleteProfile(id) {
    try {
      const user = await UserModel.findByIdAndDelete(id);
      if (!user) {
        return null;
      }
      return user;
    } catch (err) {
      throw new APIError("Error deleting user", {
        message: err.message,
        stack: err.stack,
        statusCode: 500,
      });
    }
  }
}

export default UserRepository;
