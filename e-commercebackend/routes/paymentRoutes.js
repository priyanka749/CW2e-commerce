const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  getUserOrders,
  getAllOrders,
  deleteOrder
} = require('../controller/paymentController');

router.post('/khalti/initiate', initiateKhaltiPayment);
router.post('/khalti/verify', verifyKhaltiPayment);

// User: Get orders
router.get('/orders/:userId', getUserOrders); 

// Admin: Get all orders
router.get('/orders', protect, getAllOrders);

// Admin: Delete an order
router.delete('/orders/:id', deleteOrder);

module.exports = router;
