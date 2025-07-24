const Review = require('../models/review');

exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    const userId = req.user.id;

    const newReview = await Review.create({ productId, userId, rating, comment });
    return res.status(201).json(newReview);
  } catch (err) {
    console.error('Review creation error:', err.message);

    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    return res.status(500).json({ message: err.message || 'Server error' });
  }
};


exports.getProductReviews = async (req, res) => {
  const reviews = await Review.find({ productId: req.params.productId }).populate('userId', 'fullName');
  res.json(reviews);
};

exports.getAllReviews = async (req, res) => {
  const reviews = await Review.find().populate('userId', 'fullName').populate('productId', 'title');
  res.json(reviews);
};

exports.deleteReview = async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: 'Review deleted' });
};
