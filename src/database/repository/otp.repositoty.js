import { OTPModel } from "../models/otp.js";
import { APIError } from "../../utils/error-handler.js";

class OTPRepository {
  async createOTP(data) {
    try {
      await OTPModel.deleteOne({ email: data?.email });
      const otp = new OTPModel(data);
      const otpResult = await otp.save();
      return otpResult;
    } catch (err) {
      throw new APIError("Unable to create otp", {
        message: err.message,
        stack: err.stack,
      });
    }
  }
  async FindOTP(otp) {
    try {
      const otpResponse = await OTPModel.findOne({ otp });
      if (!otpResponse) {
        return null;
      }
      return otpResponse;
    } catch (err) {
      throw new APIError("Error finding otp", {
        message: err.message,
        stack: err.stack,
      });
    }
  }
}

export default OTPRepository;
