import { validationResult } from "express-validator";
import { ApiError } from "../utils/api_error.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  console.log(errors.array());
  const extractedErrors = [];
  errors.array().map((err) => {
    extractedErrors.push({ [err.path]: err.msg });
  });
  throw new ApiError(422, "recievdd data is not valid", extractedErrors);
};
