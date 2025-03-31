const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    res.status(201).json({
      success: true,
      token
    });
  } catch (err) {
    next(err);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email/password
    if (!email || !password) {
      return next(new Error('Please provide email and password'));
    }

    // Check user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new Error('Invalid credentials'));
    }

    // Check password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new Error('Invalid credentials'));
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    res.status(200).json({
      success: true,
      token
    });
  } catch (err) {
    next(err);
  }
};