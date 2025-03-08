import { ValidationError } from "../utils/error-handler.js";

export const validateRequest = (schema) => (req, res, next) => {
  try {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return next(
        new ValidationError("Validation failed", errorMessages.join(", "))
      );
    }

    next();
  } catch (err) {
    return next(new ValidationError("Validation error", err.message));
  }
};
