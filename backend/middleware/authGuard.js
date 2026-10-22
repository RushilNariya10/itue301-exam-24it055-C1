const jwt = require('jsonwebtoken');

/**
 * Task 3 – authGuard middleware
 *
 * Validates the Bearer token from the Authorization header.
 * Returns 401 if the token is missing or invalid.
 *
 * Applied to every route except:
 *   - POST /api/v1/auth/login
 *   - GET  /api/v1/events  (public listing)
 */
function authGuard(req, res, next) {
  const authHeader = req.headers['authorization'];

  // Token must be in format: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach decoded payload (id, role) to request object
    req.attendee = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
}

module.exports = authGuard;
