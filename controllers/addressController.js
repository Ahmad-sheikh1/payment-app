const dataStore = require('../config/dataStore');

exports.getUserAddresses = async (req, res) => {
  const userId = req.user.id || req.user._id;
  try {
    const addresses = await dataStore.getAddressesByUser(userId);
    res.json(addresses);
  } catch (error) {
    console.error('Get user addresses error:', error);
    res.status(500).json({ message: 'Server error retrieving addresses' });
  }
};

exports.addUserAddress = async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { name, phone, city, area, address } = req.body;

  try {
    if (!name || !phone || !city || !area || !address) {
      return res.status(400).json({ message: 'Please provide all address fields' });
    }

    const savedAddr = await dataStore.addAddress(userId, {
      name,
      phone,
      city,
      area,
      address
    });

    res.status(201).json(savedAddr);
  } catch (error) {
    console.error('Add user address error:', error);
    res.status(500).json({ message: 'Server error saving address' });
  }
};
