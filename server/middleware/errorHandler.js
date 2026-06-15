// Wraps async route handlers so thrown errors reach the error middleware
// without try/catch boilerplate in every controller.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const notFound = (req, res) =>
  res.status(404).json({ message: "Route not found" });

// Centralized error handler. Translates common Mongoose/JWT errors into
// clean HTTP responses and hides stack traces in production.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || "Server error";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  } else if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    message = "Duplicate entry";
  } else if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  }

  if (status === 500) {
    console.error("Unhandled error:", err);
  }

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === "production" ? {} : { stack: err.stack }),
  });
};

// Small helper to throw HTTP errors from controllers.
export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
