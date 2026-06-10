const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // Can be nullable if anonymous, but normally refers to logged-in User
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
  mode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  distance: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  estimatedFare: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'estimated_fare'
  },
  actualFare: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'actual_fare'
  },
  error: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'feedbacks',
  timestamps: true,
  underscored: true
});

// Setup relationships
User.hasMany(Feedback, { foreignKey: 'user_id', as: 'feedbacks' });
Feedback.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = Feedback;
