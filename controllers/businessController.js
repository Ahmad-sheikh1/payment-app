const dataStore = require('../config/dataStore');

// Mock food products for restaurants
const MOCK_RESTAURANT_PRODUCTS = [
  { id: 'food_1', name: 'Chicken Biryani Double Plate', price: 350, originalPrice: 450, discount: 22, image: 'https://picsum.photos/seed/biryani/200/200', rating: 4.9 },
  { id: 'food_2', name: 'Special Beef Burger with Fries', price: 580, originalPrice: 750, discount: 22, image: 'https://picsum.photos/seed/burger/200/200', rating: 4.7 },
  { id: 'food_3', name: 'Hot Spicy Zinger Burger', price: 420, originalPrice: 500, discount: 16, image: 'https://picsum.photos/seed/zinger/200/200', rating: 4.6 },
  { id: 'food_4', name: 'Garlic Mayo Fries Basket', price: 220, originalPrice: 300, discount: 26, image: 'https://picsum.photos/seed/fries/200/200', rating: 4.5 }
];

exports.getAllBusinesses = async (req, res) => {
  const { type } = req.query; // 'All', 'Shop', 'Restaurant'
  try {
    const businesses = await dataStore.getBusinesses(type);
    res.json(businesses);
  } catch (error) {
    console.error('Get businesses error:', error);
    res.status(500).json({ message: 'Server error retrieving businesses' });
  }
};

exports.getBusinessProducts = async (req, res) => {
  const { id } = req.params;
  try {
    const business = await dataStore.getBusinessById(id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Return custom mock items based on business type
    if (business.type === 'Restaurant') {
      res.json(MOCK_RESTAURANT_PRODUCTS);
    } else {
      // Return normal e-commerce products
      const products = await dataStore.getProducts();
      // Filter out deals or just return standard product items
      const shopProducts = products.filter(p => !p.id.startsWith('deal_'));
      res.json(shopProducts);
    }
  } catch (error) {
    console.error('Get business products error:', error);
    res.status(500).json({ message: 'Server error retrieving business catalog' });
  }
};
