/**
 * Generates a stable, deterministic number from two strings.
 * Used for mock distance/duration generation.
 */
function getDeterministicHash(str1, str2) {
  const combined = (str1 || '').trim().toLowerCase() + '|' + (str2 || '').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generates stable mock distance in kilometers and duration in minutes
 * based on source and destination strings.
 */
function generateMockCommute(source, destination) {
  const hash = getDeterministicHash(source, destination);
  
  // Distance between 2.0 km and 32.0 km
  const distance = parseFloat((2.0 + (hash % 300) / 10).toFixed(1));
  
  // Duration based on average speed (e.g. 25 km/h for auto/bus, 15 km/h for bike/walk, etc.)
  // Let's return a base duration that can be modified by travel speed
  const duration = Math.round(distance * 3); // Approx 20 km/h average
  
  return {
    distance,
    duration
  };
}

module.exports = {
  getDeterministicHash,
  generateMockCommute
};
