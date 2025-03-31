const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String,
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update vendor rating when a new review is added
reviewSchema.post('save', async function(doc) {
  try {
    const vendor = await mongoose.model('Vendor').findById(doc.vendor);
    const reviews = await mongoose.model('Review').find({ vendor: doc.vendor });
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    vendor.rating = totalRating / reviews.length;
    
    await vendor.save();
  } catch (err) {
    console.error('Error updating vendor rating:', err);
  }
});

// Update vendor rating when a review is deleted
reviewSchema.post('remove', async function(doc) {
  try {
    const vendor = await mongoose.model('Vendor').findById(doc.vendor);
    const reviews = await mongoose.model('Review').find({ vendor: doc.vendor });
    
    if (reviews.length === 0) {
      vendor.rating = 0;
    } else {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      vendor.rating = totalRating / reviews.length;
    }
    
    await vendor.save();
  } catch (err) {
    console.error('Error updating vendor rating:', err);
  }
});

module.exports = mongoose.model('Review', reviewSchema);