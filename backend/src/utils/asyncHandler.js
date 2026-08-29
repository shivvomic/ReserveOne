// Wraps an async route handler so a rejected promise (or thrown error)
// is automatically forwarded to Express's error-handling middleware,
// instead of needing a try/catch block in every single controller.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;