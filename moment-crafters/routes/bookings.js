const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
const Booking = require('../models/Booking');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Create booking
router.post('/', protect, async (req, res, next) => {
  try {
    const { vendorId, date, services, notes } = req.body;
    
    // Verify vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const booking = new Booking({
      user: req.user.id,
      vendor: vendorId,
      date,
      services,
      notes,
      status: 'pending'
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});

// Get user bookings
router.get('/my-bookings', protect, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('vendor', 'businessName category');
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// Get vendor bookings
router.get('/vendor-bookings', protect, async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(403).json({ error: 'Not a vendor account' });
    }

    const bookings = await Booking.find({ vendor: vendor._id })
      .populate('user', 'name email');
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100, // amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating order');
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    try {
      // Create booking record
      const booking = new Booking({
        user: req.user.id,
        vendor: req.body.vendorId,
        amount: req.body.amount / 100,
        paymentId: razorpay_payment_id,
        bookingDate: new Date(),
        status: 'confirmed',
        eventDate: req.body.eventDate,
        guests: req.body.guests,
        specialRequests: req.body.specialRequests
      });

      await booking.save();
      
      // Update vendor's bookings
      await Vendor.findByIdAndUpdate(
        req.body.vendorId,
        { $push: { bookings: booking._id } }
      );

      // Update user's bookings
      await User.findByIdAndUpdate(
        req.user.id,
        { $push: { bookings: booking._id } }
      );

      res.json({ 
        success: true,
        bookingId: booking._id
      });
    } catch (err) {
      console.error('Booking save error:', err);
      res.status(500).json({ success: false });
    }
  } else {
    res.status(400).json({ success: false });
  }
});

// Booking success page
router.get('/success/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('vendor', 'businessName category');
      
    if (!booking) {
      return res.status(404).redirect('/bookings');
    }

    res.render('pages/booking-success', {
      title: 'Booking Successful',
      booking
    });
  } catch (err) {
    console.error(err);
    res.redirect('/bookings');
  }
});

module.exports = router;
