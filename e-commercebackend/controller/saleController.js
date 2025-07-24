const SaleProduct = require('../models/saleProduct');

const getAllSales = async (req, res) => {
  try {
    const sales = await SaleProduct.find({ isActive: true });
    res.status(200).json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sale products.' });
  }
};

const createSale = async (req, res) => {
  try {
    const { title, price, originalPrice, description, colors, sizes } = req.body;

    const newSale = new SaleProduct({
      title,
      price,
      originalPrice,
      description,
      image: req.file ? req.file.filename : '',
      colors: colors ? JSON.parse(colors) : [],
      sizes: sizes ? JSON.parse(sizes) : [],
    });

    await newSale.save();
    res.status(201).json(newSale);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create sale product.', error: err.message });
  }
};

const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    await SaleProduct.findByIdAndDelete(id);
    res.status(200).json({ message: 'Sale product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete sale product.' });
  }
};

module.exports = {
  getAllSales,
  createSale,
  deleteSale,
};
