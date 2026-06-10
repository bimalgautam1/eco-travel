/**
 * Uses the Google Maps JavaScript Distance Matrix Service (browser-side)
 * to fetch real travel distances and durations for all commute modes.
 *
 * Browser-based calls work even with HTTP-referrer-restricted API keys
 * (unlike server-side Node.js calls which get REQUEST_DENIED).
 *
 * Returns:
 * {
 *   distance: number (km),
 *   durationByMode: { auto, bike, bus, metro, walk }
 * }
 */
export async function fetchAllModeDistances(source, destination, maps) {
  const service = new maps.DistanceMatrixService();

  /**
   * Wraps the callback-based DistanceMatrixService in a Promise.
   * Returns { distance (km), duration (min) } or null on failure.
   */
  function queryMode(travelMode) {
    return new Promise((resolve) => {
      service.getDistanceMatrix(
        {
          origins: [source],
          destinations: [destination],
          travelMode,
          region: 'IN',
          unitSystem: maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (
            status === 'OK' &&
            response.rows?.[0]?.elements?.[0]?.status === 'OK'
          ) {
            const el = response.rows[0].elements[0];
            resolve({
              distance: parseFloat((el.distance.value / 1000).toFixed(1)),
              duration: Math.round(el.duration.value / 60),
            });
          } else {
            console.warn(`[MapsDistance] ${travelMode} → status: ${status}`);
            resolve(null);
          }
        }
      );
    });
  }

  // Run all mode queries in parallel
  const [driving, transit, walking, bicycling] = await Promise.all([
    queryMode(maps.TravelMode.DRIVING),
    queryMode(maps.TravelMode.TRANSIT),
    queryMode(maps.TravelMode.WALKING),
    queryMode(maps.TravelMode.BICYCLING),
  ]);

  // If driving failed entirely, return null so caller can fallback
  if (!driving) return null;

  const distanceKm = driving.distance;
  const drivingMin = driving.duration;

  const durationByMode = {
    // Auto rickshaw follows driving route
    auto: drivingMin,
    // Bike/Two-wheeler uses bicycling route (or 85% of driving)
    bike: bicycling
      ? bicycling.duration
      : Math.max(1, Math.round(drivingMin * 0.85)),
    // Bus uses transit data (or 140% driving + 5 min buffer)
    bus: transit
      ? transit.duration
      : Math.max(1, Math.round(drivingMin * 1.4 + 5)),
    // Metro is often faster than generic transit (90% of transit, or 75% driving + 8)
    metro: transit
      ? Math.max(1, Math.round(transit.duration * 0.9))
      : Math.max(1, Math.round(drivingMin * 0.75 + 8)),
    // Walking uses real walking route (or distance/5 km/h)
    walk: walking
      ? walking.duration
      : Math.max(1, Math.round((distanceKm / 5) * 60)),
  };

  console.log('[MapsDistance] Real Google Maps data:', {
    distanceKm,
    drivingMin,
    transit: transit?.duration ?? 'N/A (fallback)',
    walking: walking?.duration ?? 'N/A (fallback)',
    bicycling: bicycling?.duration ?? 'N/A (fallback)',
    durationByMode,
  });

  return { distance: distanceKm, duration: drivingMin, durationByMode };
}
