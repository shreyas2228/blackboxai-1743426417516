const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Photography', 'Catering', 'Venue', 'Event Planning', 'Entertainment', 'Florist', 'Other']
  },
  services: [{
    name: String,
    description: String,
    price: Number
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  imageUrl: String,
  images: [String],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  pricingRange: String,
  availability: [Date],
  pricing: {
    hourly: Number,
    daily: Number,
    package: Number
  }
}, { 
  timestamps: true 
});

vendorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Vendor', vendorSchema);