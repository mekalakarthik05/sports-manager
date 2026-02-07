const ApiError = require('../utils/ApiError');
const jwtUtils = require('../utils/jwt');
const adminModel = require('../models/admin');

/**
 * Protects routes: requires valid JWT (admin only).
 * Attaches req.admin = { id, username, name, role } from DB.
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Authentication required'));
  }

  try {
    const decoded = jwtUtils.verify(token);
    const admin = await adminModel.findById(decoded.id);
    if (!admin) {
      return next(new ApiError(401, 'Invalid or expired token'));
    }
    req.admin = {
      id: admin.id,
      username: admin.username,
      name: admin.name || admin.username,
      role: admin.role === 'super_admin' ? 'super_admin' : 'admin',
    };
    return next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}

module.exports = { authMiddleware };
