const Product = require('../models/products');
const Category = require('../models/category');

// Add new product (Admin)
exports.addProduct = async (req, res) => {
  try {
    const {
      title,
      fabric,
      price,
      rating,
      colors,
      sizes,
      category
    } = req.body;

    const mainImage = req.files?.image?.[0]?.filename;
    const variantImages = req.files?.images?.map(file => file.filename) || [];

    if (!title || !fabric || !price || !rating || !mainImage || !category || !sizes || !colors) {
      return res.status(400).json({
        success: false,
        message: 'All fields including main image, colors, sizes, and category are required'
      });
    }

    const parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
    const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    const totalStock = parsedSizes.reduce((acc, cur) => acc + (cur.stock || 0), 0);

    const product = new Product({
      title,
      fabric,
      price,
      rating,
      image: mainImage,
      images: variantImages,
      colors: parsedColors,
      sizes: parsedSizes,
      totalStock,
      category,
      imagesByColor: {
        // Populate imagesByColor field
      },
    });

    await product.save();

    res.status(201).json({ success: true, message: 'Product added successfully', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error while adding product' });
  }
};

// Get all products (basic list)
// Get all products (with optional category filter)
exports.getAllProducts = async (req, res) => {
  try {
    const categoryName = req.query.category;
    let query = {};

    if (categoryName) {
      const category = await Category.findOne({
        name: { $regex: new RegExp('^' + categoryName + '$', 'i') }
      });

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      query.category = category._id;
    }

    const products = await Product.find(query, 'title fabric price rating image category')
      .populate('category', 'name') // populate category name
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Get product by ID (full detail view)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name image');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// Update product (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const {
      title,
      fabric,
      price,
      rating,
      colors,
      sizes,
      category
    } = req.body;

    const parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
    const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    const totalStock = parsedSizes.reduce((acc, cur) => acc + (cur.stock || 0), 0);

    const updateData = {
      title,
      fabric,
      price,
      rating,
      colors: parsedColors,
      sizes: parsedSizes,
      totalStock,
      category,
      imagesByColor: {
        // Populate imagesByColor field
      },
    };

    if (req.files?.image?.[0]) {
      updateData.image = req.files.image[0].filename;
    }

    if (req.files?.images) {
      updateData.images = req.files.images.map(file => file.filename);
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json({ success: true, message: 'Product updated', product: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryName = req.params.categoryName;
    // If you store category as a string:
    const products = await Product.find({ category: { $regex: new RegExp('^' + categoryName + '$', 'i') } });
    // If you use ObjectId for category, you'll need to look up the category by name first.
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products by category' });
  }
};
