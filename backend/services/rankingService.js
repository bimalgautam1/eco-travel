/**
 * Ranks the commute modes to find:
 * - fastest: lowest duration (min)
 * - cheapest: lowest cost (INR)
 * - greenest: lowest CO2 (kg)
 * 
 * @param {Array} modesArray - Array of mode objects: { mode, cost, duration, co2 }
 */
function rankCommutes(modesArray) {
  if (!Array.isArray(modesArray) || modesArray.length === 0) {
    return { fastest: null, cheapest: null, greenest: null };
  }

  let cheapest = modesArray[0];
  let fastest = modesArray[0];
  let greenest = modesArray[0];

  modesArray.forEach(item => {
    // Find cheapest (if walk is 0 cost, it will be cheapest, which makes sense)
    if (item.cost < cheapest.cost) {
      cheapest = item;
    } else if (item.cost === cheapest.cost) {
      // Tie breaker: choose the one with less duration
      if (item.duration < cheapest.duration) {
        cheapest = item;
      }
    }

    // Find fastest
    if (item.duration < fastest.duration) {
      fastest = item;
    } else if (item.duration === fastest.duration) {
      // Tie breaker: choose cheaper
      if (item.cost < fastest.cost) {
        fastest = item;
      }
    }

    // Find greenest (lowest CO2)
    if (item.co2 < greenest.co2) {
      greenest = item;
    } else if (item.co2 === greenest.co2) {
      // Tie breaker: choose faster
      if (item.duration < greenest.duration) {
        greenest = item;
      }
    }
  });

  return {
    fastest: fastest.mode,
    cheapest: cheapest.mode,
    greenest: greenest.mode
  };
}

module.exports = {
  rankCommutes
};
