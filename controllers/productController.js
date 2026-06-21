const dataStore = require('../config/dataStore');

exports.getAllProducts = async (req, res) => {
  const { search } = req.query;
  try {
    const products = await dataStore.getProducts(search);
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error retrieving products' });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await dataStore.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Server error retrieving product detail' });
  }
};

exports.getSuperDeals = async (req, res) => {
  try {
    const superDeals = await dataStore.getSuperDeals();
    res.json(superDeals);
  } catch (error) {
    console.error('Get super deals error:', error);
    res.status(500).json({ message: 'Server error retrieving super deals' });
  }
};
