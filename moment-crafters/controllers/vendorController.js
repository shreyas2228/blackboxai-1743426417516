const Vendor = require('../models/Vendor');
const asyncHandler = require('../middleware/async');

// @desc    Get all vendors
// @route   GET /api/v1/vendors
// @access  Public
exports.getVendors = asyncHandler(async (req, res, next) => {
  const vendors = await Vendor.find().populate('user', 'name email');
  
  res.status(200).json({
    success: true,
    count: vendors.length,
    data: vendors
  });
});

// @desc    Get single vendor
// @route   GET /api/v1/vendors/:id
// @access  Public
exports.getVendor = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findById(req.params.id).populate('user', 'name email');
  
  if (!vendor) {
    return next(new ErrorResponse(`Vendor not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: vendor
  });
});

// @desc    Create vendor
// @route   POST /api/v1/vendors
// @access  Private
exports.createVendor = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const vendor = await Vendor.create(req.body);

  res.status(201).json({
    success: true,
    data: vendor
  });
});

// @desc    Update vendor
// @route   PUT /api/v1/vendors/:id
// @access  Private
exports.updateVendor = asyncHandler(async (req, res, next) => {
  let vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    return next(new ErrorResponse(`Vendor not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is vendor owner or admin
  if (vendor.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update this vendor`, 401));
  }

  vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: vendor
  });
});

// @desc    Delete vendor
// @route   DELETE /api/v1/vendors/:id
// @access  Private
exports.deleteVendor = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    return next(new ErrorResponse(`Vendor not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is vendor owner or admin
  if (vendor.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to delete this vendor`, 401));
  }

  await vendor.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});