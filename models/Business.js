const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Business = sequelize.define('Business', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('Shop', 'Restaurant'),
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Business;
