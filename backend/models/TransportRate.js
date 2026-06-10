const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const City = require('./City');

const TransportRate = sequelize.define('TransportRate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'city_id',
    references: {
      model: City,
      key: 'id'
    }
  },
  mode: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['auto', 'bus', 'metro', 'bike', 'walk']]
    }
  },
  baseFare: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
    field: 'base_fare'
  },
  baseKm: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
    field: 'base_km'
  },
  perKm: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
    field: 'per_km'
  },
  adjustmentFactor: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1.0,
    field: 'adjustment_factor',
    validate: {
      min: 0.7,
      max: 1.5
    }
  }
}, {
  tableName: 'transport_rates',
  timestamps: true,
  underscored: true
});

// Setup relationships
City.hasMany(TransportRate, { foreignKey: 'city_id', as: 'rates' });
TransportRate.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

module.exports = TransportRate;
