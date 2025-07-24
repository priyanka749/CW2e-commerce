const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { getAllSales, createSale, deleteSale } = require('../controller/saleController');

router.get('/', getAllSales);
router.post('/', upload.single('image'), createSale);
router.delete('/:id', deleteSale);

module.exports = router;
