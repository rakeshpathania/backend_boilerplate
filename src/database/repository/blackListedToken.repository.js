import { BlacklistTokenModel } from "../models/blackListedToken.js";
import { APIError } from "../../utils/error-handler.js";

class BlackListTokenRepository {
  async createBlackListedToken(token) {
    try {
      const blackListedToken = new BlacklistTokenModel({ token });
      await blackListedToken.save();
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
      const blackListedToken = await BlacklistTokenModel.findOne({ token });
      if (!blackListedToken) {
        return null;
      }
      return blackListedToken;
    } catch (err) {
      throw new APIError("Unable to get the token", {
        message: err.message,
        stack: err.stack,
      });
    }
  }
}

export default BlackListTokenRepository;
