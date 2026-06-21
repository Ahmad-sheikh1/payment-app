const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const db = require('./db');

// Import Sequelize Models
const User = require('../models/User');
const Product = require('../models/Product');
const Business = require('../models/Business');
const Address = require('../models/Address');
const Order = require('../models/Order');

// Local Files DB setup
const dbFilePath = path.join(__dirname, '../data/db.json');
const initialDataPath = path.join(__dirname, '../data/initialData.json');

// Local Data Store state
let localDB = {
  users: [],
  products: [],
  businesses: [],
  addresses: [],
  orders: []
};

// Load Initial Data for fallback or seeding
const getInitialSeedData = () => {
  try {
    const raw = fs.readFileSync(initialDataPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load initialData.json', err);
    return { products: [], businesses: [] };
  }
};

// Generate salt & hash password synchronously for seed users
const hashPasswordSync = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

// Seeding standard users (Owner & Merchants) for local JSON
const getSeedUsers = () => {
  return [
    {
      _id: 'user_owner',
      id: 'user_owner',
      fullName: 'HaiderPay Owner',
      email: 'owner@haiderpay.com',
      password: hashPasswordSync('owner123'),
      role: 'Owner',
      phone: '0300-1234567',
      cnic: '35201-1234567-1',
      images: [],
      createdAt: new Date()
    },
    {
      _id: 'user_shop1',
      id: 'user_shop1',
      fullName: 'Tech Haven Shop Owner',
      email: 'shop@haiderpay.com',
      password: hashPasswordSync('shop123'),
      role: 'Shop',
      phone: '0311-1234567',
      cnic: '35201-1234567-2',
      images: ['https://picsum.photos/seed/shop@haiderpay.com/150/150'],
      createdAt: new Date()
    },
    {
      _id: 'user_shop2',
      id: 'user_shop2',
      fullName: 'Fashion Point Owner',
      email: 'fashion@haiderpay.com',
      password: hashPasswordSync('shop123'),
      role: 'Shop',
      phone: '0321-9876543',
      cnic: '35201-9876543-1',
      images: ['https://picsum.photos/seed/fashion@haiderpay.com/150/150'],
      createdAt: new Date()
    },
    {
      _id: 'user_rest1',
      id: 'user_rest1',
      fullName: 'Al-Farid Restaurant Owner',
      email: 'restaurant@haiderpay.com',
      password: hashPasswordSync('rest123'),
      role: 'Restaurant',
      phone: '0300-5551234',
      cnic: '35201-5551234-1',
      images: ['https://picsum.photos/seed/restaurant@haiderpay.com/150/150'],
      createdAt: new Date()
    },
    {
      _id: 'user_rest2',
      id: 'user_rest2',
      fullName: 'Bismillah Biryani Owner',
      email: 'biryani@haiderpay.com',
      password: hashPasswordSync('rest123'),
      role: 'Restaurant',
      phone: '0333-4445566',
      cnic: '35201-4445566-1',
      images: ['https://picsum.photos/seed/biryani@haiderpay.com/150/150'],
      createdAt: new Date()
    }
  ];
};

// Read from JSON file
const loadLocalDB = () => {
  try {
    if (!fs.existsSync(path.dirname(dbFilePath))) {
      fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });
    }
    if (fs.existsSync(dbFilePath)) {
      const data = fs.readFileSync(dbFilePath, 'utf8');
      localDB = JSON.parse(data);
      // Ensure seed users exist in local JSON db
      if (!localDB.users || localDB.users.length === 0) {
        localDB.users = getSeedUsers();
        saveLocalDB();
      }
    } else {
      const seed = getInitialSeedData();
      localDB = {
        users: getSeedUsers(),
        products: seed.products || [],
        businesses: seed.businesses || [],
        addresses: [],
        orders: []
      };
      saveLocalDB();
    }
  } catch (error) {
    console.error('Error loading local JSON DB:', error);
  }
};

// Write to JSON file
const saveLocalDB = () => {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(localDB, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to local JSON DB:', error);
  }
};

// Seed PostgreSQL if empty
const seedPostgresIfEmpty = async () => {
  try {
    const productCount = await Product.count();
    if (productCount === 0) {
      console.log('🌱 Seeding PostgreSQL with initial products...');
      const seed = getInitialSeedData();
      if (seed.products && seed.products.length > 0) {
        await Product.bulkCreate(seed.products);
      }
    }
    
    const businessCount = await Business.count();
    if (businessCount === 0) {
      console.log('🌱 Seeding PostgreSQL with initial businesses...');
      const seed = getInitialSeedData();
      if (seed.businesses && seed.businesses.length > 0) {
        await Business.bulkCreate(seed.businesses);
      }
    }
    
    // Seed Owner and Merchant Users
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('🌱 Seeding PostgreSQL with Owner & Merchant users...');
      const seedUsers = getSeedUsers();
      // Remove local client-specific fields like _id and id because the model uses UUID primary key
      const cleanSeedUsers = seedUsers.map(({ _id, id, ...rest }) => rest);
      await User.bulkCreate(cleanSeedUsers);
    }
  } catch (error) {
    console.error('Error seeding PostgreSQL:', error);
  }
};

// Initialize DB (Run at app launch)
const initDataStore = async () => {
  loadLocalDB();
  if (db.isPostgresConnected()) {
    await seedPostgresIfEmpty();
  }
};

// Unified Data Access API
module.exports = {
  initDataStore,

  // Users
  getUserByEmail: async (email) => {
    if (db.isPostgresConnected()) {
      return await User.findOne({ where: { email } });
    } else {
      return localDB.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }
  },

  getUserById: async (id) => {
    if (db.isPostgresConnected()) {
      return await User.findByPk(id);
    } else {
      const user = localDB.users.find(u => u.id === id || u._id === id);
      if (user) {
        const { password, ...safeUser } = user;
        return safeUser;
      }
      return null;
    }
  },

  createUser: async (userData) => {
    if (db.isPostgresConnected()) {
      return await User.create(userData);
    } else {
      const id = 'user_' + Date.now() + Math.random().toString(36).substr(2, 5);
      const newUser = { _id: id, id, ...userData, createdAt: new Date() };
      localDB.users.push(newUser);
      saveLocalDB();
      return newUser;
    }
  },

  // Products
  getProducts: async (search = '') => {
    if (db.isPostgresConnected()) {
      let where = {};
      if (search) {
        where = { name: { [Op.iLike]: `%${search}%` } };
      }
      return await Product.findAll({ where });
    } else {
      if (!search) return localDB.products;
      const cleanSearch = search.toLowerCase();
      return localDB.products.filter(p => p.name.toLowerCase().includes(cleanSearch));
    }
  },

  getProductById: async (id) => {
    if (db.isPostgresConnected()) {
      return await Product.findByPk(id);
    } else {
      return localDB.products.find(p => p.id === id);
    }
  },

  // Deals
  getSuperDeals: async () => {
    if (db.isPostgresConnected()) {
      return await Product.findAll({
        where: {
          id: { [Op.like]: 'deal_%' }
        }
      });
    } else {
      return localDB.products.filter(p => p.id.startsWith('deal_'));
    }
  },

  // Businesses
  getBusinesses: async (type = 'All') => {
    if (db.isPostgresConnected()) {
      let where = {};
      if (type !== 'All') {
        where = { type };
      }
      return await Business.findAll({ where });
    } else {
      if (type === 'All') return localDB.businesses;
      return localDB.businesses.filter(b => b.type === type);
    }
  },

  getBusinessById: async (id) => {
    if (db.isPostgresConnected()) {
      return await Business.findByPk(id);
    } else {
      return localDB.businesses.find(b => b.id === id);
    }
  },

  // User Addresses
  getAddressesByUser: async (userId) => {
    if (db.isPostgresConnected()) {
      return await Address.findAll({ where: { userId } });
    } else {
      return localDB.addresses.filter(a => a.userId === userId || a.user === userId);
    }
  },

  addAddress: async (userId, addressData) => {
    if (db.isPostgresConnected()) {
      return await Address.create({
        userId,
        ...addressData
      });
    } else {
      const id = 'addr_' + Date.now();
      const newAddr = {
        _id: id,
        id,
        userId,
        user: userId,
        ...addressData,
        createdAt: new Date()
      };
      localDB.addresses.push(newAddr);
      saveLocalDB();
      return newAddr;
    }
  },

  // Orders
  getOrdersByUser: async (userId) => {
    if (db.isPostgresConnected()) {
      return await Order.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });
    } else {
      return localDB.orders
        .filter(o => o.userId === userId || o.user === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  getOrderById: async (id) => {
    if (db.isPostgresConnected()) {
      return await Order.findOne({
        where: {
          [Op.or]: [{ orderId: id }, { id }]
        }
      });
    } else {
      return localDB.orders.find(o => o.orderId === id || o.id === id || o._id === id);
    }
  },

  createOrder: async (userId, orderData) => {
    // Generate tracking steps initially
    const trackingSteps = [
      { id: 1, title: 'Order Placed', description: 'Your order has been received', time: 'Today, 2:30 PM', completed: true },
      { id: 2, title: 'Order Confirmed', description: 'Seller confirmed your order', time: 'Today, 3:00 PM', completed: true },
      { id: 3, title: 'Processing', description: 'Your order is being prepared', time: 'Today, 4:00 PM', completed: true },
      { id: 4, title: 'Shipped', description: 'Order handed to delivery partner', time: 'Tomorrow, 10:00 AM', completed: false },
      { id: 5, title: 'Out for Delivery', description: 'Rider is on the way', time: 'Tomorrow, 2:00 PM', completed: false },
      { id: 6, title: 'Delivered', description: 'Package delivered successfully', time: 'Tomorrow, 4:00 PM', completed: false }
    ];

    const finalOrderData = {
      ...orderData,
      trackingSteps,
      rider: {
        name: 'Usman Rider',
        stats: '⭐ 4.8 · 1,200+ deliveries',
        avatar: '🧑'
      }
    };

    if (db.isPostgresConnected()) {
      return await Order.create({
        userId,
        ...finalOrderData
      });
    } else {
      const id = 'ord_' + Date.now();
      const newOrder = {
        _id: id,
        id,
        userId,
        user: userId,
        ...finalOrderData,
        createdAt: new Date()
      };
      localDB.orders.push(newOrder);
      saveLocalDB();
      return newOrder;
    }
  }
};
