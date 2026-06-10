const User = require('../models/User');
const Travel = require('../models/Travel');

// Badge definitions
const BADGE_DEFS = {
  first_commute: {
    id: 'first_commute',
    name: '🌱 Green Pioneer',
    description: 'Logged your very first green commute on EcoRoute!',
    icon: '🌱'
  },
  streak_3: {
    id: 'streak_3',
    name: '🔥 Eco Streak',
    description: 'Maintained a 3-day streak of green commutes.',
    icon: '🔥'
  },
  carbon_hero_10: {
    id: 'carbon_hero_10',
    name: '🌳 CO₂ Hero',
    description: 'Saved 10+ kg of CO₂ emissions cumulative.',
    icon: '🌳'
  },
  budget_king: {
    id: 'budget_king',
    name: '🪙 Wealth Wise',
    description: 'Logged commutes with public transit or walking costing under ₹100.',
    icon: '🪙'
  }
};

/**
 * Handles all gamification updates for a user after saving a trip.
 * Updates points, streak, lastCommuteDate, and badges.
 * 
 * @param {object} user - User sequelize instance
 * @param {object} travel - The newly created Travel instance
 * @returns {object} { pointsEarned, newStreak, newlyUnlockedBadges }
 */
async function processGamification(user, travel) {
  const mode = travel.mode.toLowerCase();
  const co2Saved = travel.co2Saved;

  // 1. Calculate Points
  let modeBonus = 0;
  if (mode === 'walk') modeBonus = 25;
  else if (mode === 'metro') modeBonus = 20;
  else if (mode === 'bus') modeBonus = 15;
  else if (mode === 'bike') modeBonus = 5;

  const pointsEarned = Math.round(co2Saved * 10) + modeBonus;
  user.points = (user.points || 0) + pointsEarned;

  // 2. Update Streak
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const lastCommute = user.lastCommuteDate;
  let newStreak = user.streak || 0;

  if (!lastCommute) {
    newStreak = 1;
  } else if (lastCommute === yesterdayStr) {
    newStreak += 1;
  } else if (lastCommute !== todayStr) {
    // If last commute was not today either (so missed a day)
    newStreak = 1;
  }
  // If lastCommute === todayStr, streak remains unchanged

  user.streak = newStreak;
  user.lastCommuteDate = todayStr;

  // 3. Evaluate Badges
  const currentBadges = Array.isArray(user.badges) ? user.badges : [];
  const newlyUnlockedBadges = [];

  // Helper to unlock badge
  const unlockBadge = (badgeId) => {
    if (!currentBadges.includes(badgeId)) {
      currentBadges.push(badgeId);
      newlyUnlockedBadges.push(BADGE_DEFS[badgeId]);
    }
  };

  // Badge 1: First commute
  unlockBadge('first_commute');

  // Badge 2: 3-day streak
  if (newStreak >= 3) {
    unlockBadge('streak_3');
  }

  // Fetch cumulative stats for other badges
  try {
    const totalCO2Saved = await Travel.sum('co2_saved', { where: { userId: user.id } }) || 0;
    if (totalCO2Saved + co2Saved >= 10.0) {
      unlockBadge('carbon_hero_10');
    }
  } catch (err) {
    console.error('[Gamification] Error calculating cumulative CO2 saved:', err.message);
  }

  // Badge 4: Budget King (if travel cost is very low and it's walk/metro/bus)
  if (travel.cost <= 100 && (mode === 'walk' || mode === 'metro' || mode === 'bus')) {
    unlockBadge('budget_king');
  }

  // Save changes
  user.badges = currentBadges;
  await user.save();

  return {
    pointsEarned,
    newStreak,
    newlyUnlockedBadges
  };
}

module.exports = {
  processGamification,
  BADGE_DEFS
};
