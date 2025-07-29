const Review = require('../models/review');




const { escape } = require('validator');
const AuditLog = require('../models/auditLog');

exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    const userId = req.user.id;

    // Check for existing review by this user for this product
    const existing = await Review.findOne({ productId, userId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product.' });
    }

    // Detect XSS attempt and log to audit log
    if (/<script.*?>.*?<\/script>/i.test(comment)) {
      await AuditLog.create({
        action: 'XSS_ATTEMPT',
        userId,
        details: `Potential XSS attempt in review for product ${productId}: ${comment}`
      });
    }

    // Sanitize comment to prevent XSS
    const sanitizedComment = escape(comment);

    const newReview = await Review.create({ productId, userId, rating, comment: sanitizedComment });
    // Fetch all reviews for this product (with user info) after adding new review
    const reviews = await Review.find({ productId }).populate('userId', 'fullName');
    return res.status(201).json({
      success: true,
      review: newReview,
      reviews
    });
  } catch (err) {
    console.error('Review creation error:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};



exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).populate('userId', 'fullName');
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};


exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('userId', 'fullName').populate('productId', 'title');
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};


exports.deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};
