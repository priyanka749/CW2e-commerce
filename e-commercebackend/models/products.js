// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   fabric: { type: String, required: true },
//   price: { type: String, required: true },
//   rating: { type: Number, required: true },
//   image: { type: String, required: true }, // filename of image
// }, { timestamps: true });

// module.exports = mongoose.model('Product', productSchema);
const mongoose = require('mongoose');
const path = require('path');
const getColors = require('get-image-colors');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fabric: { type: String, required: true },
  price: { type: Number, required: true }, // changed from String to Number
  rating: { type: Number, default: 0 },
  image: { type: String, required: true }, // filename of image
  images: [{ type: String }], //
  colors: [{ type: String }], // e.g., ['#4B371C', '#dc2626']
  sizes: [{ size: String, stock: Number }],
  totalStock: { type: Number, default: 0 },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  reviews: [reviewSchema]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
