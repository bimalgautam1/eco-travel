const axios = require('axios');
const { generateMockCommute } = require('../utils/helpers');

/**
 * Calls Google Maps Distance Matrix API for a specific travel mode.
 * Returns { distance (km), duration (min) } or null on failure.
 */
async function fetchDistanceMatrix(source, destination, mode, apiKey) {
  try {
    const url =
      `https://maps.googleapis.com/maps/api/distancematrix/json` +
      `?origins=${encodeURIComponent(source)}` +
      `&destinations=${encodeURIComponent(destination)}` +
      `&mode=${mode}` +
      `&region=in` +
      `&key=${apiKey}`;

    const response = await axios.get(url, { timeout: 8000 });
    const data = response.data;

    if (
      data.status === 'OK' &&
      data.rows?.[0]?.elements?.[0]?.status === 'OK'
    ) {
      const el = data.rows[0].elements[0];
      return {
        distance: parseFloat((el.distance.value / 1000).toFixed(1)),
        duration: Math.round(el.duration.value / 60),
      };
    }

    console.warn(`[MapService] Distance Matrix non-OK for mode=${mode}:`, data.status, data.rows?.[0]?.elements?.[0]?.status);
    return null;
  } catch (err) {
    console.error(`[MapService] Distance Matrix error for mode=${mode}:`, err.message);
    return null;
  }
}

/**
 * Gets real route data per travel mode from Google Maps Distance Matrix API.
 * Falls back to mock data if the API key is missing or all calls fail.
 *
 * Returns:
 * {
 *   distance: number (km),            // from driving route
 *   duration: number (min),           // base driving duration
 *   durationByMode: {
 *     auto: number,
 *     bike: number,
 *     bus: number,
 *     metro: number,
 *     walk: number,
 *   }
 * }
 */
async function getRouteDetails(source, destination) {
  const apiKey = process.env.MAPS_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    const mock = generateMockCommute(source, destination);
    return buildMockResponse(mock);
  }

  // Fetch driving, transit, walking, and bicycling in parallel
  const [driving, transit, walking, bicycling] = await Promise.all([
    fetchDistanceMatrix(source, destination, 'driving', apiKey),
    fetchDistanceMatrix(source, destination, 'transit', apiKey),
    fetchDistanceMatrix(source, destination, 'walking', apiKey),
    fetchDistanceMatrix(source, destination, 'bicycling', apiKey),
  ]);

  // If even driving failed, use mock
  if (!driving) {
    console.warn('[MapService] All Distance Matrix calls failed. Using mock fallback.');
    const mock = generateMockCommute(source, destination);
    return buildMockResponse(mock);
  }

  const distanceKm = driving.distance;
  const drivingMin = driving.duration;

  // Build per-mode durations using real data where available, heuristics otherwise
  const durationByMode = {
    // auto = driving (traffic conditions similar)
    auto: drivingMin,
    // bike = bicycling route if available, else 80% of driving
    bike: bicycling ? bicycling.duration : Math.max(1, Math.round(drivingMin * 0.85)),
    // bus = transit if available, else 140% of driving + 5 min
    bus: transit ? transit.duration : Math.max(1, Math.round(drivingMin * 1.4 + 5)),
    // metro = transit if available (same API, covers metro), else 75% of driving + 8 min
    metro: transit ? Math.max(1, Math.round(transit.duration * 0.9)) : Math.max(1, Math.round(drivingMin * 0.75 + 8)),
    // walk = walking route if available, else distance / 5 km/h * 60
    walk: walking ? walking.duration : Math.max(1, Math.round((distanceKm / 5) * 60)),
  };

  console.log(`[MapService] Real route data for "${source}" → "${destination}":`, {
    distance: distanceKm,
    drivingMin,
    transitMin: transit?.duration ?? 'N/A',
    walkingMin: walking?.duration ?? 'N/A',
    bicyclingMin: bicycling?.duration ?? 'N/A',
  });

  return {
    distance: distanceKm,
    duration: drivingMin,
    durationByMode,
  };
}

function buildMockResponse(mock) {
  const { distance, duration } = mock;
  return {
    distance,
    duration,
    durationByMode: {
      auto: duration,
      bike: Math.max(1, Math.round(duration * 0.85)),
      bus: Math.max(1, Math.round(duration * 1.4 + 5)),
      metro: Math.max(1, Math.round(duration * 0.75 + 8)),
      walk: Math.max(1, Math.round((distance / 5) * 60)),
    },
  };
}

module.exports = {
  getRouteDetails,
};
