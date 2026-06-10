const Travel = require('../models/Travel');
const User = require('../models/User');
const { processGamification } = require('../services/gamificationService');

/**
 * Saves a new travel record for the authenticated user
 */
exports.saveTravel = async (req, res) => {
  try {
    const { source, destination, city, mode, distance, duration, cost, co2, vehicle, waypoints } = req.body;
    const userId = req.user.id; // From authMiddleware

    if (!source || !destination || !mode || distance === undefined || duration === undefined || cost === undefined || co2 === undefined || !vehicle) {
      return res.status(400).json({
        error: 'Required travel fields: source, destination, mode, distance, duration, cost, co2, vehicle.'
      });
    }

    const distVal = parseFloat(distance);
    const co2Val = parseFloat(co2);
    // Baseline single occupant petrol car emissions is 0.18 kg/km
    const baselineCO2 = distVal * 0.18;
    const co2Saved = parseFloat(Math.max(0, baselineCO2 - co2Val).toFixed(3));

    const travel = await Travel.create({
      userId,
      source,
      destination,
      city: city || 'Delhi',
      mode,
      distance: distVal,
      duration: parseInt(duration, 10),
      cost: parseFloat(cost),
      co2: co2Val,
      co2Saved,
      vehicle,
      waypoints: waypoints || null
    });

    // Process points, streak, and badges
    const user = await User.findByPk(userId);
    let gamificationResults = null;
    if (user) {
      gamificationResults = await processGamification(user, travel);
    }

    return res.status(201).json({
      message: 'Travel logged successfully.',
      travel,
      gamification: gamificationResults
    });
  } catch (error) {
    console.error('Error in saveTravel:', error);
    return res.status(500).json({ error: 'Failed to save travel record.' });
  }
};

/**
 * Retrieves the travel history for the authenticated user
 */
exports.getTravelHistory = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware

    const history = await Travel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      history
    });
  } catch (error) {
    console.error('Error in getTravelHistory:', error);
    return res.status(500).json({ error: 'Failed to retrieve travel history.' });
  }
};
