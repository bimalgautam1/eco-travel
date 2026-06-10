const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Travel = sequelize.define('Travel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: User,
      key: 'id'
    }
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  distance: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cost: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  co2: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  co2Saved: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
    allowNull: false,
    field: 'co2_saved'
  },
  vehicle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  waypoints: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'travels',
  timestamps: true,
  underscored: true
});

// Setup relationships
User.hasMany(Travel, { foreignKey: 'user_id', as: 'travels' });
Travel.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = Travel;
