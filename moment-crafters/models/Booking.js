const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  services: [{
    name: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1
    }
  }],
  totalPrice: {
    type: Number,
    required: true
  },
  notes: String,
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total price before saving
bookingSchema.pre('save', function(next) {
  this.totalPrice = this.services.reduce((total, service) => {
    return total + (service.price * service.quantity);
  }, 0);
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);