const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { saveLocation } = require('../controller/locationController');

// POST /api/location
router.post('/', protect, saveLocation);

module.exports = router;
