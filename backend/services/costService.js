const City = require('../models/City');
const TransportRate = require('../models/TransportRate');

/**
 * Calculates travel costs for all modes in a specific city given a distance.
 */
async function calculateCosts(cityName, distance) {
  // Normalize city name search (case insensitive or direct)
  const searchName = cityName ? cityName.trim() : 'Delhi';
  
  let city = await City.findOne({
    where: { name: sequelizeSearchCaseInsensitive(searchName) },
    include: [{ model: TransportRate, as: 'rates' }]
  });

  // Fallback to searching case-insensitively using simple logic if no match
  if (!city) {
    city = await City.findOne({
      where: sequelizeSearchFallback(searchName),
      include: [{ model: TransportRate, as: 'rates' }]
    });
  }

  const rates = city ? city.rates : [];
  const costMap = {};

  // Fail-safe fallback rates
  const fallbackRates = {
    auto: { baseFare: 30.0, baseKm: 1.5, perKm: 12.0, adjustmentFactor: 1.0 },
    bus: { baseFare: 10.0, baseKm: 4.0, perKm: 2.0, adjustmentFactor: 1.0 },
    metro: { baseFare: 10.0, baseKm: 2.0, perKm: 4.0, adjustmentFactor: 1.0 },
    bike: { baseFare: 20.0, baseKm: 2.0, perKm: 6.0, adjustmentFactor: 1.0 },
    walk: { baseFare: 0.0, baseKm: 0.0, perKm: 0.0, adjustmentFactor: 1.0 }
  };

  const modes = ['auto', 'bus', 'metro', 'bike', 'walk'];

  modes.forEach(mode => {
    const dbRate = rates.find(r => r.mode.toLowerCase() === mode);
    const rate = dbRate ? {
      baseFare: dbRate.baseFare,
      baseKm: dbRate.baseKm,
      perKm: dbRate.perKm,
      adjustmentFactor: dbRate.adjustmentFactor
    } : fallbackRates[mode];

    if (mode === 'walk') {
      costMap[mode] = 0.0;
    } else {
      const chargeableDistance = Math.max(0, distance - rate.baseKm);
      const baseCalculation = rate.baseFare + (chargeableDistance * rate.perKm);
      const finalCost = baseCalculation * rate.adjustmentFactor;
      costMap[mode] = parseFloat(finalCost.toFixed(2));
    }
  });

  return costMap;
}

// Case insensitive search helper for Postgres/SQLite
function sequelizeSearchCaseInsensitive(name) {
  const { Op } = require('sequelize');
  return {
    [Op.iLike]: name
  };
}

function sequelizeSearchFallback(name) {
  // If Op.iLike fails or on other DB dialect, do simple search
  const { Op } = require('sequelize');
  return {
    name: {
      [Op.or]: [
        name,
        name.toLowerCase(),
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
      ]
    }
  };
}

module.exports = {
  calculateCosts
};
