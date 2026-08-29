// A custom error that carries an HTTP status code, so the centralized
// error handler knows what status to respond with (e.g. 400, 401, 404, 409).
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;