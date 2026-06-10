const sequelize = require('../config/db');
const City = require('../models/City');
const TransportRate = require('../models/TransportRate');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const Travel = require('../models/Travel');

async function seed() {
  try {
    console.log('Connecting to database and syncing models...');
    // Force sync drops all tables and recreates them. Useful for initialization.
    await sequelize.sync({ force: true });
    console.log('Database synced successfully.');

    // Seed Cities
    console.log('Seeding cities...');
    const delhi = await City.create({ name: 'Delhi' });
    const bangalore = await City.create({ name: 'Bangalore' });

    console.log('Seeding transport rates for Delhi...');
    await TransportRate.bulkCreate([
      { cityId: delhi.id, mode: 'auto', baseFare: 30.0, baseKm: 1.5, perKm: 11.0, adjustmentFactor: 1.0 },
      { cityId: delhi.id, mode: 'bus', baseFare: 10.0, baseKm: 4.0, perKm: 2.0, adjustmentFactor: 1.0 },
      { cityId: delhi.id, mode: 'metro', baseFare: 10.0, baseKm: 2.0, perKm: 4.0, adjustmentFactor: 1.0 },
      { cityId: delhi.id, mode: 'bike', baseFare: 20.0, baseKm: 2.0, perKm: 6.0, adjustmentFactor: 1.0 },
      { cityId: delhi.id, mode: 'walk', baseFare: 0.0, baseKm: 0.0, perKm: 0.0, adjustmentFactor: 1.0 }
    ]);

    console.log('Seeding transport rates for Bangalore...');
    await TransportRate.bulkCreate([
      { cityId: bangalore.id, mode: 'auto', baseFare: 30.0, baseKm: 1.5, perKm: 15.0, adjustmentFactor: 1.0 },
      { cityId: bangalore.id, mode: 'bus', baseFare: 15.0, baseKm: 3.0, perKm: 3.5, adjustmentFactor: 1.0 },
      { cityId: bangalore.id, mode: 'metro', baseFare: 10.0, baseKm: 2.0, perKm: 4.5, adjustmentFactor: 1.0 },
      { cityId: bangalore.id, mode: 'bike', baseFare: 25.0, baseKm: 2.0, perKm: 8.0, adjustmentFactor: 1.0 },
      { cityId: bangalore.id, mode: 'walk', baseFare: 0.0, baseKm: 0.0, perKm: 0.0, adjustmentFactor: 1.0 }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
}

seed();
