const axios = require('axios');
const orderSchema = require('../models/payment'); // Your Order model
const mongoose = require('mongoose');
const Product = require('../models/products'); 
const Cart = require('../models/cart'); 

const KHALTI_PUBLIC = 'd86da06a4edb4eca90dc423aec77c1a1';
const KHALTI_SECRET = '9ce3609e431d4833850f8663db46c625';

// 🧠 Helper to reduce stock
const reduceStock = async (productId, size, quantity) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  const sizeIndex = product.sizes.findIndex(s => s.size === size);
  if (sizeIndex === -1) throw new Error(`Size ${size} not found`);

  if (product.sizes[sizeIndex].stock < quantity) {
    throw new Error(`Insufficient stock for product ${productId}`);
  }

  product.sizes[sizeIndex].stock -= quantity;
  product.totalStock = product.sizes.reduce((acc, cur) => acc + cur.stock, 0);

  await product.save();
};

// 📤 Initiate Payment
exports.initiateKhaltiPayment = async (req, res) => {
  try {
    const { amount, userId, products } = req.body;
    const purchase_order_id = `order_${Date.now()}`;
    const purchase_order_name = 'Anka Attire Purchase';

    const khaltiRes = await axios.post(
      'https://dev.khalti.com/api/v2/epayment/initiate/',
      {
        return_url: 'http://localhost:5173/payment-success',
        website_url: 'http://localhost:5173',
        amount: amount * 100, // convert to paisa
        purchase_order_id,
        purchase_order_name,
product_details: products.map(p => ({
  identity: p.productId,
  name: p.name,
  total_price: amount * 100,
  quantity: p.quantity,
  unit_price: (amount * 100) / p.quantity,
}))
      },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { pidx, payment_url } = khaltiRes.data;
    return res.status(200).json({ success: true, pidx, payment_url });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return res.status(500).json({ success: false, message: 'Khalti initiation failed' });
  }
};

// ✅ Verify Payment + Reduce Stock
exports.verifyKhaltiPayment = async (req, res) => {
  try {
    console.log('verifyKhaltiPayment req.body:', req.body);

    const { pidx, userId, products, amount } = req.body;

    if (!pidx || !userId || !products || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const verificationRes = await axios.post(
      'https://dev.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_PUBLIC}`,
        },
      }
    );

    const { status, transaction_id, total_amount } = verificationRes.data;

    if (status === 'Completed') {
      // 💾 Save Order
      const newOrder = new orderSchema({
        userId: new mongoose.Types.ObjectId(userId),
        products: products.map(p => ({
          productId: new mongoose.Types.ObjectId(p.productId),
          quantity: p.quantity,
          size: p.size,
          color: p.color,
        })),
        totalAmount: total_amount / 100,
        paymentStatus: 'paid',
        transactionId: transaction_id,
      });

      await newOrder.save();
const result = await Cart.updateOne(
  { user: new mongoose.Types.ObjectId(userId) },
  { $set: { items: [] } }
);
console.log('Cart clear result:', result);
      // 🔽 Reduce Stock for Each Product
      for (const item of products) {
        await reduceStock(item.productId, item.size, item.quantity);
      }

      return res.status(200).json({
        success: true,
        message: 'Payment verified, stock updated, and order placed!',
        order: newOrder,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${status}`,
      });
    }
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
};
exports.getUserOrders = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId); // <-- use 'new' here!
    console.log('Looking for orders with userId:', userId);

    const orders = await orderSchema
      .find({ userId })
      .populate('products.productId', 'name image price')
      .sort({ createdAt: -1 });

    console.log('Orders found:', orders);

    res.status(200).json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to fetch user orders' });
  }
};

// ✅ Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderSchema
      .find()
      .populate('userId', 'fullName email') // Optional: show user details
      .populate('products.productId', 'title image price') // Include product data
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to fetch all orders' });
  }
};

// ✅ Delete Order by ID
exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await orderSchema.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Optionally restore stock when deleting an order
    for (const item of order.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        const sizeIndex = product.sizes.findIndex(s => s.size === item.size);
        if (sizeIndex !== -1) {
          product.sizes[sizeIndex].stock += item.quantity;
          product.totalStock = product.sizes.reduce((acc, cur) => acc + cur.stock, 0);
          await product.save();
        }
      }
    }

    await order.deleteOne();

    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Failed to delete order' });
  }
};
