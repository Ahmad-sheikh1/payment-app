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

exports.createProduct = async (req, res) => {
  const { name, price, originalPrice, stock, description, image, category, merchantId } = req.body;

  try {
    if (!name || !price) {
      return res.status(400).json({ message: 'Product name and price are required' });
    }

    const calculatedPrice = Number(price);
    const calculatedOriginalPrice = originalPrice ? Number(originalPrice) : Math.round(calculatedPrice * 1.5);
    const discountPercent = calculatedOriginalPrice > calculatedPrice ? Math.round(((calculatedOriginalPrice - calculatedPrice) / calculatedOriginalPrice) * 100) : 0;

    const newProduct = await dataStore.createProduct({
      name: name.trim(),
      discountedPrice: calculatedPrice,
      originalPrice: calculatedOriginalPrice,
      discountPercent: discountPercent,
      stock: stock ? Number(stock) : 50,
      rating: 5.0,
      reviewCount: 0,
      inStock: true,
      description: description ? description.trim() : 'Premium product.',
      images: image ? [image] : ['https://picsum.photos/seed/prod/300/300'],
      sizes: [],
      colors: [],
      delivery: {
        time: '2-3 days',
        charge: 'Free',
        returnPolicy: '7 days return'
      },
      reviews: [],
      merchantId: merchantId || '',
      category: category || 'General'
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};
