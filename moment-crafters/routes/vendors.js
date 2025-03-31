const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Vendor = require('../models/Vendor');
const { protect } = require('../middleware/auth');

// Vendor routes
router.get('/', async (req, res) => {
  try {
    const categories = [
      { name: 'Photography', slug: 'photography', icon: 'fas fa-camera' },
      { name: 'Venues', slug: 'venues', icon: 'fas fa-building' },
      { name: 'Catering', slug: 'catering', icon: 'fas fa-utensils' },
      { name: 'Florists', slug: 'florists', icon: 'fas fa-spa' },
      { name: 'Music', slug: 'music', icon: 'fas fa-music' },
      { name: 'Makeup', slug: 'makeup', icon: 'fas fa-paint-brush' },
      { name: 'Attire', slug: 'attire', icon: 'fas fa-tshirt' },
      { name: 'Planners', slug: 'planners', icon: 'fas fa-clipboard-list' }
    ];

    const featuredVendors = await Vendor.find({ isFeatured: true })
      .limit(6)
      .populate('reviews')
      .lean();

    // Calculate average ratings
    featuredVendors.forEach(vendor => {
      vendor.averageRating = vendor.reviews.reduce((acc, review) => acc + review.rating, 0) / vendor.reviews.length || 0;
      vendor.reviewCount = vendor.reviews.length;
    });

    const testimonials = [
      {
        userName: 'Sarah & Michael',
        weddingDate: 'June 2023',
        content: 'Moment Crafters made our wedding planning so easy! We found all our vendors in one place.',
        userImage: '/images/couple1.jpg'
      },
      {
        userName: 'Jessica & David',
        weddingDate: 'August 2023',
        content: 'The budget tracker helped us stay on target and the vendors were amazing!',
        userImage: '/images/couple2.jpg'
      }
    ];

    res.render('pages/home', {
      categories,
      featuredVendors,
      testimonials
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('pages/500');
  }
});
// Get all vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find().populate('user', 'name email');
    res.render('pages/vendor-listing', { vendors });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get single vendor
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('user', 'name email');
    if (!vendor) {
      return res.status(404).render('pages/404');
    }
    res.render('pages/vendor-profile', { vendor });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Create vendor (protected route)
router.post('/',
  [
    protect,
    check('businessName', 'Business name is required').notEmpty(),
    check('category', 'Category is required').notEmpty(),
    check('description', 'Description is required').notEmpty()
  ],
  async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { businessName, category, description, services, pricing } = req.body;
    
    // Check if vendor profile already exists for this user
    const existingVendor = await Vendor.findOne({ user: req.user.id });
    if (existingVendor) {
      return res.status(400).json({ msg: 'Vendor profile already exists' });
    }

    // Create new vendor
    const vendor = new Vendor({
      user: req.user.id,
      businessName,
      category,
      description,
      services: services || [],
      pricing: pricing || {}
    });

    await vendor.save();
    res.redirect('/vendors/' + vendor._id);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Update vendor (protected route)
router.put('/:id', protect, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ msg: 'Vendor not found' });
    }

    // Check user owns vendor profile
    if (vendor.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const { businessName, category, description, services, pricing } = req.body;
    
    vendor.businessName = businessName || vendor.businessName;
    vendor.category = category || vendor.category;
    vendor.description = description || vendor.description;
    vendor.services = services || vendor.services;
    vendor.pricing = pricing || vendor.pricing;
    vendor.updatedAt = Date.now();

    await vendor.save();
    res.json(vendor);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Delete vendor (protected route)
router.delete('/:id', protect, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ msg: 'Vendor not found' });
    }

    // Check user owns vendor profile
    if (vendor.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await vendor.remove();
    res.json({ msg: 'Vendor removed' });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;