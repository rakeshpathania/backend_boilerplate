import UserService from "../services/auth.service.js";
import { body } from "express-validator";
import { validationResult } from "express-validator";
import Authenticate from "../middlewares/auth.js";
import { ValidationError, STATUS_CODES } from "../utils/error-handler.js";
export const AuthenticationController = (app) => {
  const service = new UserService();

  const ValidateSignup = [
    body("fullName.firstName")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters long"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("phoneNumber")
      .isLength({ min: 10 })
      .withMessage("Phone number must be at least 10 characters long")
      .isMobilePhone("any")
      .withMessage("Phone number must be valid"),
  ];

  const ValidateSignin = [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ];

  // Signup route
  app.post("/user/signup", ValidateSignup, async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          new ValidationError("Validation failed", { errors: errors.array() })
        );
      }
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
        .json({ message: "User registered successfully", data });
    } catch (err) {
      next(err);
    }
  });

  // Signin route
  app.post("/user/login", ValidateSignin, async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError("Validation failed", {
          errors: errors.array(),
        });
      }
      const { email, password } = req.body;
      const { data } = await service.signIn({ email, password });
      const { password: _, salt: __, ...safeUserData } = data.user;

      return res.status(200).json({
        message: "User logged in successfully",
        data: {
          user: safeUserData,
          token: data.token,
        },
      });
    } catch (err) {
      return next(err);
    }
  });

  // getUser route
  app.get("/user/:id", Authenticate, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { data } = await service.getProfile(id);
      return res.status(STATUS_CODES.OK).json({ data });
    } catch (err) {
      return next(err);
    }
  });

  // updateUser route
  app.put("/user/:id", Authenticate, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { data } = await service.updateProfile(id, req.body);
      return res.status(STATUS_CODES.OK).json({ data });
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
        .json({ message: "User deleted successfully" });
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
        .json({ message: "User logout successfully" });
    } catch (err) {
      return next(err);
    }
  });
};
