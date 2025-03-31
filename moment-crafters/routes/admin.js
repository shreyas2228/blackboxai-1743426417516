const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');

// Admin dashboard
router.get('/dashboard', [protect, authorize('admin')], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Get stats
    const totalUsers = await User.countDocuments();
    const activeVendors = await Vendor.countDocuments();
    const recentBookings = await Booking.countDocuments({ 
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
    });
    const revenue = await Booking.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Get recent bookings
    const bookings = await Booking.find()
      .sort('-createdAt')
      .limit(5)
      .populate('user', 'name email')
      .populate('vendor', 'businessName');

    res.render('pages/admin-dashboard', {
      stats: {
        totalUsers,
        activeVendors,
        recentBookings,
        revenue: revenue[0]?.total || 0
      },
      bookings,
      activities: [
        {
          icon: 'fa-user-plus',
          message: 'New user registered',
          timestamp: new Date()
        },
        {
          icon: 'fa-calendar-check',
          message: 'New booking created',
          timestamp: new Date(Date.now() - 3600000)
        }
      ]
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Manage users
router.get('/users', [protect, authorize('admin')], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const users = await User.find().sort('-createdAt');
    res.render('pages/admin-users', { users });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Manage vendors
router.get('/vendors', [protect, authorize('admin')], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const vendors = await Vendor.find()
      .populate('user', 'name email')
      .sort('-createdAt');
    res.render('pages/admin-vendors', { vendors });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Manage bookings
router.get('/bookings', [protect, authorize('admin')], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('vendor', 'businessName')
      .sort('-createdAt');
    res.render('pages/admin-bookings', { bookings });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;