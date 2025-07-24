const express = require('express');
const router = express.Router();
const favoriteController = require('../controller/favController');
const { protect } = require('../middleware/auth');

router.post('/add', protect, favoriteController.addFavorite);
router.post('/remove', protect, favoriteController.removeFavorite);
router.get('/', protect, favoriteController.getFavorites);

module.exports = router;
