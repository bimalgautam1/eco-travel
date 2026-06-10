const Feedback = require('../models/Feedback');
const TransportRate = require('../models/TransportRate');
const City = require('../models/City');

/**
 * Stores feedback in the database and refines the pricing model based on fare estimation errors.
 */
async function processFeedback(userId, { source, destination, mode, distance, estimatedFare, actualFare, city: cityName }) {
  const error = actualFare - estimatedFare;

  // 1. Store feedback record
  const feedback = await Feedback.create({
    userId: userId || null, // authenticated or anonymous
    source,
    destination,
    mode: mode.toLowerCase().trim(),
    distance: parseFloat(distance),
    estimatedFare: parseFloat(estimatedFare),
    actualFare: parseFloat(actualFare),
    error: parseFloat(error.toFixed(2))
  });

  // 2. Identify target city (Delhi / Bangalore)
  let resolvedCityName = cityName ? cityName.trim() : null;

  if (!resolvedCityName) {
    // Attempt parsing from source & destination names
    const searchString = `${source} ${destination}`.toLowerCase();
    if (searchString.includes('bangalore') || searchString.includes('bengaluru') || searchString.includes('blr')) {
      resolvedCityName = 'Bangalore';
    } else if (searchString.includes('delhi') || searchString.includes('ncr') || searchString.includes('del')) {
      resolvedCityName = 'Delhi';
    } else {
      resolvedCityName = 'Delhi'; // Default fallback
    }
  }

  // Find city record
  const city = await City.findOne({
    where: { name: resolvedCityName }
  });

  let transportRate = null;

  if (city) {
    // Find rate for that city and mode
    transportRate = await TransportRate.findOne({
      where: {
        cityId: city.id,
        mode: mode.toLowerCase().trim()
      }
    });

    if (transportRate) {
      const currentFactor = transportRate.adjustmentFactor;
      // Formula: adjustment_factor = adjustment_factor + (error * 0.01)
      const newFactor = currentFactor + (error * 0.01);
      // Clamp between 0.7 and 1.5
      const clampedFactor = Math.max(0.7, Math.min(1.5, newFactor));
      
      transportRate.adjustmentFactor = parseFloat(clampedFactor.toFixed(4));
      await transportRate.save();
    }
  }

  return {
    feedback,
    updatedRate: transportRate
  };
}

module.exports = {
  processFeedback
};
