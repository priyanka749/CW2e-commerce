// const express = require('express');
// const router = express.Router();
// const upload = require('../middleware/upload');

// const {
//   addProduct,
//   getAllProducts,
//   deleteProduct,
//   updateProduct
// } = require('../controller/productController');

// // Add new product
// router.post('/add', upload.single('image'), addProduct);

// // Get all products
// router.get('/', getAllProducts);

// // Delete product
// router.delete('/:id', deleteProduct);

// // Update product
// router.put('/:id', upload.single('image'), updateProduct);

// module.exports = router; 

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');
const productController = require('../controller/productController');

const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controller/productController');

// 🔐 ADMIN Routes (require protect + adminOnly)
router.post(
  '/',
  protect,
  adminOnly,
  upload.fields([
    { name: 'image', maxCount: 1 },       // main image
    { name: 'images', maxCount: 10 }      // thumbnails / variant images
  ]),
  addProduct
);

router.put(
  '/:id',
  protect,
  adminOnly,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  updateProduct
);

router.delete('/:id', protect, adminOnly, deleteProduct);

// 🌐 PUBLIC Routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/category/:categoryName', productController.getProductsByCategory);

module.exports = router;
