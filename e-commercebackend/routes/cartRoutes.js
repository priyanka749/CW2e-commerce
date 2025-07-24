const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const cartController = require('../controller/cartController');

router.post('/add', protect, cartController.addToCart);
router.get('/', protect, cartController.getCart);
router.post('/remove', protect, cartController.removeFromCart);
router.post('/update', protect, cartController.updateCartQty);

module.exports = router;