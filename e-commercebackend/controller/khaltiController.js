// const axios = require('axios');
// const Cart = require('../models/cart');
// const Product = require('../models/products');
// const Order = require('../models/order');

// const KHALTI_PUBLIC_KEY = '0b353ee393f14dd48743e73b7306ed14'; // Hardcoded as requested
// const KHALTI_SECRET_KEY = '59bc2858051d4983b53fd1b2033e9052'; // Hardcoded as requested
// const BASE_URL = 'http://localhost:3000';

// // INITIATE PAYMENT (for cart or buy now)
// exports.initiatePayment = async (req, res) => {
//   const { mode, productId, qty = 1, color, size, return_url } = req.body;
//   let amount = 0;
//   let orderName = '';
//   let orderId = '';

//   try {
//     // Validate inputs
//     if (!mode || !['cart', 'buy-now'].includes(mode)) {
//       return res.status(400).json({ success: false, message: 'Invalid or missing mode' });
//     }
//     if (mode === 'buy-now' && !productId) {
//       return res.status(400).json({ success: false, message: 'Product ID required' });
//     }
//     if (mode === 'buy-now' && (!Number.isInteger(qty) || qty < 1)) {
//       return res.status(400).json({ success: false, message: 'Invalid quantity' });
//     }

//     const user = req.user;
//     if (!user || !user._id || !user.fullName || !user.email || !user.phone) {
//       return res.status(401).json({ success: false, message: 'User data incomplete' });
//     }

//     if (mode === 'cart') {
//       const cart = await Cart.findOne({ user: user._id }).populate('items.product');
//       if (!cart || cart.items.length === 0) {
//         return res.status(400).json({ success: false, message: 'Cart is empty' });
//       }
//       amount = cart.items.reduce((sum, item) => sum + item.product.price * item.qty, 0) * 100;
//       orderName = 'Cart Purchase';
//       orderId = `CART-${Date.now()}`;
//     }

//     if (mode === 'buy-now') {
//       const product = await Product.findById(productId);
//       if (!product) {
//         return res.status(404).json({ success: false, message: 'Product not found' });
//       }
//       // Validate size and color
//       if (size && product.sizes && !product.sizes.some(s => s.size === size)) {
//         return res.status(400).json({ success: false, message: 'Invalid size' });
//       }
//       if (color && product.colors && !product.colors.includes(color)) {
//         return res.status(400).json({ success: false, message: 'Invalid color' });
//       }
//       // Validate stock
//       if (size) {
//         const sizeObj = product.sizes.find(s => s.size === size);
//         if (sizeObj && qty > sizeObj.stock) {
//           return res.status(400).json({ success: false, message: `Only ${sizeObj.stock} items available` });
//         }
//       }
//       amount = product.price * qty * 100;
//       orderName = `Buy Now - ${product.title}`;
//       orderId = `BUY-${Date.now()}`;
//     }

//     if (amount <= 0) {
//       return res.status(400).json({ success: false, message: 'Invalid amount' });
//     }

//     // Save pending order
//     const order = await Order.create({
//       user: user._id,
//       orderId,
//       amount: amount / 100,
//       status: 'pending',
//       pidx: '',
//       mode,
//       ...(mode === 'buy-now' && { productId, qty, color, size }),
//     });

//     const response = await axios.post(
//       'https://a.khalti.com/api/v2/epayment/initiate/',
//       {
//         return_url: return_url || `${BASE_URL}/api/payment/verify`,
//         website_url: BASE_URL,
//         amount,
//         purchase_order_id: orderId,
//         purchase_order_name: orderName,
//         customer_info: {
//           name: user.fullName,
//           email: user.email,
//           phone: user.phone,
//         },
//       },
//       {
//         headers: {
//           Authorization: `Key ${KHALTI_SECRET_KEY}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     // Update order with pidx
//     await Order.findOneAndUpdate({ orderId }, { pidx: response.data.pidx });

//     res.status(200).json({ success: true, payment_url: response.data.payment_url });
//   } catch (err) {
//     console.error('Initiate Payment Error:', err?.response?.data || err.message);
//     res.status(500).json({ success: false, message: 'Failed to initiate payment' });
//   }
// };

// // VERIFY PAYMENT
// exports.verifyPayment = async (req, res) => {
//   const { pidx } = req.body;

//   if (!pidx) {
//     return res.status(400).json({ success: false, message: 'Missing pidx' });
//   }

//   try {
//     const response = await axios.post(
//       'https://a.khalti.com/api/v2/epayment/lookup/',
//       { pidx },
//       {
//         headers: {
//           Authorization: `Key ${KHALTI_SECRET_KEY}`,
//         },
//       }
//     );

//     if (response.data.status === 'Completed') {
//       // Update order status
//       await Order.findOneAndUpdate(
//         { pidx },
//         { status: 'completed', amount: response.data.total_amount / 100 }
//       );
//       // Clear cart if mode was cart
//       const order = await Order.findOne({ pidx });
//       if (order.mode === 'cart') {
//         await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
//       }

//       return res.status(200).json({
//         success: true,
//         message: 'Payment successful',
//         data: response.data,
//       });
//     }

//     await Order.findOneAndUpdate({ pidx }, { status: 'failed' });
//     res.status(400).json({
//       success: false,
//       message: 'Payment not completed',
//       data: response.data,
//     });
//   } catch (err) {
//     console.error('Verify Payment Error:', err?.response?.data || err.message);
//     res.status(500).json({ success: false, message: 'Failed to verify payment' });
//   }
// };

// // VERIFY PAYMENT
// exports.verifyPayment = async (req, res) => {
//   const { pidx } = req.body;

//   try {
//     const response = await axios.post(
//       'https://a.khalti.com/api/v2/epayment/lookup/',
//       { pidx },
//       {
//         headers: {
//           Authorization: `Key ${KHALTI_SECRET_KEY}`,
//         },
//       }
//     );

//     if (response.data.status === 'Completed') {
//       // Here you can save payment info, empty cart, update order status etc.
//       return res.status(200).json({
//         success: true,
//         message: 'Payment successful',
//         data: response.data,
//       });
//     }

//     res.status(400).json({ success: false, message: 'Payment not completed', data: response.data });
//   } catch (err) {
//     console.error(err?.response?.data || err.message);
//     res.status(500).json({ success: false, message: 'Failed to verify payment' });
//   }
// };
