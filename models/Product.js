const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  originalPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  discountedPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  discountPercent: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  inStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  sizes: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  colors: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  delivery: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  reviews: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
});

module.exports = Product;
