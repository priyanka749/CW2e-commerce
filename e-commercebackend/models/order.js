// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   orderId: { type: String, required: true },
//   amount: { type: Number, required: true },
//   status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
//   pidx: { type: String, required: true },
//   mode: { type: String, enum: ['cart', 'buy-now'], required: true },
//   productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // For buy-now
//   qty: Number, // For buy-now
//   color: String, // For buy-now
//   size: String, // For buy-now
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('Order', orderSchema);