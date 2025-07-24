const express = require('express');
const router = express.Router();
const {
  createReview,
  getProductReviews,
  getAllReviews,
  deleteReview
} = require('../controller/reviewController');
const { protect } = require('../middleware/auth');

// user creates review
router.post('/:productId', protect, createReview);

// get reviews for a product
router.get('/product/:productId', getProductReviews);

// get all reviews (admin)
router.get('/', protect, getAllReviews);

// delete review (admin)
router.delete('/:id', protect, deleteReview);

module.exports = router;
