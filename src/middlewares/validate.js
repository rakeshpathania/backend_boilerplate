import { ValidationError } from "../utils/error-handler.js";

export const validateRequest =
  (schema, sources = ["body"]) =>
  (req, res, next) => {
    try {
      // Merge data from different sources
      let data = {};
      if (sources.includes("body")) data = { ...data, ...req.body };
      if (sources.includes("query")) data = { ...data, ...req.query };
      const { error } = schema.validate(data, {
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
