const Favorite = require('../models/fav');

// ✅ Add to favorites
exports.addFavorite = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    const exists = await Favorite.findOne({ user: userId, product: productId });
    if (exists) return res.status(400).json({ message: 'Already in favorites' });

    const fav = new Favorite({ user: userId, product: productId });
    await fav.save();
    res.status(200).json({ message: 'Added to favorites' });
  } catch (err) {
    console.error('Add Favorite Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Remove from favorites
exports.removeFavorite = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    await Favorite.findOneAndDelete({ user: userId, product: productId });
    res.status(200).json({ message: 'Removed from favorites' });
  } catch (err) {
    console.error('Remove Favorite Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id }).populate('product');
    const productList = favorites.map(fav => fav.product);
    res.status(200).json({ favorites: productList });
  } catch (error) {
    console.error('🔥 Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};