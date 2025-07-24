const mongoose = require('mongoose');

const saleProductSchema = new mongoose.Schema({
  title: String,
  image: String,
  price: Number,
  originalPrice: Number,
  description: String,
  colors: [String],
  sizes: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('SaleProduct', saleProductSchema);
