function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Something went wrong on the server';

  if (!err.statusCode) {
    console.error(err); // Unexpected errors get logged for debugging
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;