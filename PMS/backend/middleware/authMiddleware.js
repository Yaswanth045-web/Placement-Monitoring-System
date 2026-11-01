const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'yaswanth_placement_jwt_secure_key_2026_pulse_auth';

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid format (Bearer token expected)',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session token has expired. Please sign in again.',
        expired: true,
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or forged authorization token',
    });
  }
}

// Middleware to enforce Administrator role
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required before verifying administrative clearance',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. This action requires placement administrator clearance.',
    });
  }

  next();
}

// Optional Auth (populates req.user if token present, but does not block)
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        req.user = jwt.verify(token, JWT_SECRET);
      }
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
  optionalAuth,
  JWT_SECRET,
};
