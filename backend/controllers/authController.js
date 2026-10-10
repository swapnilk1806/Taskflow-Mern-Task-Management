const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

function createToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return jwt.sign({}, process.env.JWT_SECRET, {
    subject: userId.toString(),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists.'
    });
  }

  const user = await User.create({ name, email, password });
  const token = createToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: {
      user,
      token
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Logged in successfully.',
    data: {
      user,
      token: createToken(user._id)
    }
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully.',
    data: {
      user: req.user
    }
  });
});

module.exports = {
  register,
  login,
  getCurrentUser
};
