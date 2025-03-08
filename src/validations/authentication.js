import Joi from "joi";

export const signupSchema = Joi.object({
  fullName: Joi.object({
    firstName: Joi.string().min(3).required().messages({
      "string.min": "First name must be at least 3 characters long",
    }),
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
  }),
  phoneNumber: Joi.string()
    .min(10)
    .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)
    .required()
    .messages({
      "string.min": "Phone number must be at least 10 characters long",
      "string.pattern.base": "Phone number must be valid",
    }),
});

export const signinSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email address",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

export const otpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email address",
  }),
});
