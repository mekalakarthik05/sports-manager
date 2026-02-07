const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const jwtUtils = require('../utils/jwt');
const adminModel = require('../models/admin');

const SALT_ROUNDS = 10;

async function login(username, password) {
  if (!username || !password) {
    throw new ApiError(400, 'Username and password required');
  }
  const admin = await adminModel.findByUsername(username);
  if (!admin) {
    throw new ApiError(401, 'Invalid credentials');
  }
  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    throw new ApiError(401, 'Invalid credentials');
  }
  const token = jwtUtils.sign({ id: admin.id, username: admin.username });
  const role = admin.role === 'super_admin' ? 'super_admin' : 'admin';
  return {
    token,
    admin: { id: admin.id, name: admin.name || admin.username, username: admin.username, role },
  };
}

async function createAdmin(username, password, name = '') {
  if (!username || !password) {
    throw new ApiError(400, 'Username and password required');
  }
  const trimmedUsername = String(username).trim();
  if (!trimmedUsername) {
    throw new ApiError(400, 'Username is required');
  }
  if (trimmedUsername.toLowerCase() === 'admin') {
    throw new ApiError(400, 'Username "admin" is reserved for system');
  }
  if (String(password).length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }
  const existing = await adminModel.findByUsername(trimmedUsername);
  if (existing) {
    throw new ApiError(409, 'Username already exists');
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const admin = await adminModel.create(trimmedUsername, passwordHash, name, 'admin');
  return { id: admin.id, name: admin.name || admin.username, username: admin.username, role: 'admin' };
}

module.exports = { login, createAdmin };
