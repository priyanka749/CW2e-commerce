// const Cart = require('../models/cart');
// const Product = require('../models/products');

// // Add to cart
// exports.addToCart = async (req, res) => {
//   const userId = req.user._id;
//   const { productId, qty = 1, color, size } = req.body;

//   if (!productId || qty <= 0) {
//     return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
//   }

//   try {
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ success: false, message: 'Product not found' });
//     }

//     let cart = await Cart.findOne({ user: userId });
//     if (!cart) {
//       cart = new Cart({ user: userId, items: [] });
//     }

//     // Check if item with same variant exists
//     const existingItem = cart.items.find(
//       item =>
//         item.product.toString() === productId &&
//         item.color === color &&
//         item.size === size
//     );

//     if (existingItem) {
//       existingItem.qty += qty;
//     } else {
//       cart.items.push({ product: productId, qty, color, size });
//     }

//     await cart.save();
//     res.json({ success: true, cart });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Failed to add to cart' });
//   }
// };

// // Get cart
// exports.getCart = async (req, res) => {
//   const userId = req.user._id;
//   try {
//     const cart = await Cart.findOne({ user: userId }).populate('items.product');
//     if (!cart) return res.json({ success: true, cart: { items: [] } });

//     // Optionally add total items and price
//     const totalItems = cart.items.reduce((sum, item) => sum + item.qty, 0);
//     const totalPrice = cart.items.reduce(
//       (sum, item) => sum + (item.product.price * item.qty),
//       0
//     );

//     res.json({ success: true, cart, totalItems, totalPrice });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Failed to get cart' });
//   }
// };

// // Remove item from cart
// exports.removeFromCart = async (req, res) => {
//   const userId = req.user._id;
//   const { productId, color, size } = req.body;

//   if (!productId) {
//     return res.status(400).json({ success: false, message: 'Product ID is required' });
//   }

//   try {
//     const cart = await Cart.findOne({ user: userId });
//     if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

//     cart.items = cart.items.filter(
//       item =>
//         !(
//           item.product.toString() === productId &&
//           item.color === color &&
//           item.size === size
//         )
//     );

//     await cart.save();
//     res.json({ success: true, cart });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Failed to remove from cart' });
//   }
// };

// // Update quantity
// exports.updateCartQty = async (req, res) => {
//   const userId = req.user._id;
//   const { productId, qty, color, size } = req.body;

//   if (!productId || qty <= 0) {
//     return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
//   }

//   try {
//     const cart = await Cart.findOne({ user: userId });
//     if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

//     const item = cart.items.find(
//       item =>
//         item.product.toString() === productId &&
//         item.color === color &&
//         item.size === size
//     );

//     if (item) {
//       item.qty = qty;
//       await cart.save();
//       res.json({ success: true, cart });
//     } else {
//       res.status(404).json({ success: false, message: 'Item not found in cart' });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Failed to update cart' });
//   }
// };
const Cart = require('../models/cart');
const Product = require('../models/products');

// Add to cart
// Add to cart
exports.addToCart = async (req, res) => {
  const userId = req.user._id;
  const { productId, qty = 1, color, size } = req.body;

  if (!productId || qty <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let sizeToUse = size;
    if (!sizeToUse && product.sizes.length === 1) {
      sizeToUse = product.sizes[0].size;
    }

    let availableStock = null;
    if (sizeToUse && product.sizes && product.sizes.length > 0) {
      const sizeEntry = product.sizes.find(s => s.size === sizeToUse || s.label === sizeToUse);
      if (!sizeEntry) {
        return res.status(400).json({ success: false, message: 'Selected size is invalid' });
      }
      availableStock = sizeEntry.stock;
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // 1. Remove any incomplete item for this product (missing size or color)
    cart.items = cart.items.filter(item => {
      if (item.product.toString() !== productId) return true;
      // If both size and color are present, keep only if they don't match the new selection
      if (item.size && item.color) {
        return !(item.size === sizeToUse && item.color === color);
      }
      // Remove if missing size or color (incomplete)
      return false;
    });

    // 2. Check if an item with the same variant exists (after removal)
    const existingItem = cart.items.find(
      item =>
        item.product.toString() === productId &&
        item.color === color &&
        item.size === sizeToUse
    );

    // Only check stock if availableStock is not null (i.e., size is provided)
    if (availableStock !== null) {
      const currentQty = existingItem ? existingItem.qty : 0;
      const totalRequestedQty = currentQty + qty;
      if (totalRequestedQty > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Only ${availableStock - currentQty} more items left in stock for size ${sizeToUse}`,
        });
      }
    }

    if (existingItem) {
      existingItem.qty += qty;
    } else {
      cart.items.push({ product: productId, qty, color, size: sizeToUse });
    }

    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add to cart' });
  }
};
// Get cart
exports.getCart = async (req, res) => {
  const userId = req.user._id;
  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) return res.json({ success: true, cart: { items: [] } });

    const totalItems = cart.items.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + (item.product.price * item.qty),
      0
    );

    res.json({ success: true, cart, totalItems, totalPrice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to get cart' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  const userId = req.user._id;
  const { productId, color, size } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required' });
  }

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter(
      item =>
        !(
          item.product.toString() === productId &&
          item.color === color &&
          item.size === size
        )
    );

    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to remove from cart' });
  }
};

// Update quantity
exports.updateCartQty = async (req, res) => {
  const userId = req.user._id;
  const { productId, qty, color, size } = req.body;

  if (!productId || qty <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    

    const sizeEntry = product.sizes.find(s => s.size === size || s.label === size);
    if (!sizeEntry) {
      return res.status(400).json({ success: false, message: `Invalid size "${size}"` });
    }
    

    if (qty > sizeEntry.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${sizeEntry.stock} items available in size ${size}`,
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.find(
      item =>
        item.product.toString() === productId &&
        item.color === color &&
        item.size === size
    );

    if (item) {
      item.qty = qty;
      await cart.save();
      res.json({ success: true, cart });
    } else {
      res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
};
