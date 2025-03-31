const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');

// Login page
router.get('/login', (req, res) => {
  res.render('pages/login', {
    csrfToken: req.csrfToken(),
    error: req.flash('error')[0]
  });
});

// Login handler
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: true
}));

// Register page
router.get('/register', (req, res) => {
  res.render('pages/register', {
    csrfToken: req.csrfToken(),
    errors: [],
    name: '',
    email: ''
  });
});

// Register handler
router.post('/register', [
  check('name', 'Name is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 8 characters with 1 uppercase and 1 number')
    .matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/),
  check('confirmPassword', 'Passwords do not match').custom((value, { req }) => value === req.body.password)
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('pages/register', {
      errors: errors.array(),
      name: req.body.name,
      email: req.body.email
    });
  }

  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      req.flash('error', 'Email already in use');
      return res.redirect('/auth/register');
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role: req.body.userType === 'on' ? 'vendor' : 'user'
    });

    await user.save();
    
    // Login the new user
    req.login(user, (err) => {
      if (err) throw err;
      req.flash('success', 'Registration successful!');
      res.redirect('/');
    });

  } catch (err) {
    console.error(err);
    req.flash('error', 'Server error');
    res.redirect('/auth/register');
  }
});

// Logout handler
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You have been logged out');
  res.redirect('/');
});

// Forgot password page
router.get('/forgot-password', (req, res) => {
  res.render('pages/forgot-password');
});

module.exports = router;