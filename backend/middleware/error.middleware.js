import AppError from "../utils/appError.js";

export const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors || {}).map((item) => item.message);
  const message = messages.length ? messages.join(", ") : "Validation failed";

  return new AppError(message, 400);
};

const handleDuplicateKeyError = (err) => {
  const duplicateField = Object.keys(err.keyValue || {})[0] || "field";
  const duplicateValue = err.keyValue?.[duplicateField];
  const message = `Duplicate value for ${duplicateField}: ${duplicateValue}`;

  return new AppError(message, 409);
};

export const errorHandler = (err, _req, res, _next) => {
  let normalizedError = err;

  if (err.name === "ValidationError") {
    normalizedError = handleValidationError(err);
  }

  if (err.code === 11000) {
    normalizedError = handleDuplicateKeyError(err);
  }

  const statusCode = normalizedError.statusCode || 500;
  const message = normalizedError.isOperational
    ? normalizedError.message
    : "Internal server error";

  if (!normalizedError.isOperational) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};
