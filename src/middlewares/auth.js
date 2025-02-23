import { UnauthorizedError } from "../utils/error-handler.js";
import { ValidateSignature } from "../utils/helpers.js";

export default async (req, res, next) => {
  const isAuthorized = await ValidateSignature(req);
  if (!isAuthorized) {
    return next(new UnauthorizedError("Unauthorized"));
  }
  return next();
};
