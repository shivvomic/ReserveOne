const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

// Confirms the request carries a valid JWT and attaches the decoded
// { id, role } payload to req.user for downstream handlers to use.
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    // Phase 18 — fallback for the SSE stream route: the browser's native
    // EventSource can't set custom headers, so the JWT has to travel as a
    // query parameter for that one route instead. Kept as a fallback (not
    // the primary path) so every other route keeps using the header, which
    // doesn't end up sitting in a URL/access log the way a query string does.
    token = req.query.token;
  }

  if (!token) {
    return next(new AppError('Authentication token missing', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };