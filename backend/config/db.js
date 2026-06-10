const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('CRITICAL: DATABASE_URL is not defined in the environment or .env file.');
  process.exit(1);
}

const isRemote = databaseUrl.includes('supabase.co') || databaseUrl.includes('pooler.supabase.com');

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false, // Change to console.log if you need to debug queries
  dialectOptions: isRemote ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
});

module.exports = sequelize;
