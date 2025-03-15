import UserService from "../services/auth.service.js";
import Authenticate from "../middlewares/auth.js";
import { signinSchema, signupSchema } from "../validations/authentication.js";
import { validateRequest } from "../middlewares/validate.js";
import { STATUS_CODES, SUCCESS_STATUS } from "../utils/error-handler.js";
export const AuthenticationController = (app) => {
  const service = new UserService();

  // Signup route
  app.post(
    "/user/signup",
    validateRequest(signupSchema),
    async (req, res, next) => {
      try {
        const { email, password, phoneNumber, fullName } = req.body;
        const { data } = await service.signUp({
          fullName: {
            firstName: fullName?.firstName,
            lastName: fullName?.lastName || "",
          },
          email,
          password,
          phoneNumber,
        });

        res
          .status(STATUS_CODES.OK)
          .json(SUCCESS_STATUS("User registred successfully", data));
      } catch (err) {
        next(err);
      }
    }
  );

  // Signin route
  app.post(
    "/user/login",
    validateRequest(signinSchema),
    async (req, res, next) => {
      try {
        const { email, password } = req.body;
        const { data } = await service.signIn({ email, password });
        const { password: _, salt: __, ...safeUserData } = data.user;
        const response = {
          user: safeUserData,
          token: data.token,
        };
        return res
          .status(200)
          .json(SUCCESS_STATUS("User login successfully", response));
      } catch (err) {
        return next(err);
      }
    }
  );

  // getUser route
  app.get("/user/:id", Authenticate, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { data } = await service.getProfile(id);
      return res
        .status(STATUS_CODES.OK)
        .json(SUCCESS_STATUS("User fetched successfully", data));
    } catch (err) {
      return next(err);
    }
  });

  // updateUser route
  app.put("/user/:id", Authenticate, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { data } = await service.updateProfile(id, req.body);
      return res
        .status(STATUS_CODES.OK)
        .json(SUCCESS_STATUS("User updated successfully", data));
    } catch (err) {
      return next(err);
    }
  });

  //deleteUser route
  app.delete("/user/:id", Authenticate, async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.deleteProfile(id);
      return res
        .status(STATUS_CODES.OK)
        .json(SUCCESS_STATUS("User deleted successfully"));
    } catch (err) {
      return next(err);
    }
  });

  //deleteUser route
  app.post("/user/logout", Authenticate, async (req, res, next) => {
    try {
      const token =
        req.cookies?.token || req.headers.authorization?.split(" ")[1];
      await service.logout(token);
      return res
        .status(STATUS_CODES.OK)
        .json(SUCCESS_STATUS("User logout successfully"));
    } catch (err) {
      return next(err);
    }
  });

  //generate otp for forget password
  app.post("/user/generate-otp", async (req, res, next) => {
    try {
      const { email } = req.body;
      await service.generateOtp(email);
      return res
        .status(STATUS_CODES.OK)
        .json(SUCCESS_STATUS("Otp sent successfully"));
    } catch (err) {
      return next(err);
    }
  });

  //otp verification route
  app.post("/user/verify-otp", async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      await service.verifyOtp({ email, otp });
      return res
        .status(STATUS_CODES.OK)
        .json(SUCCESS_STATUS("Otp verified successfully"));
    } catch (err) {
      return next(err);
    }
  });
};
