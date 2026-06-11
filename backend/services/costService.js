const City = require('../models/City');
const TransportRate = require('../models/TransportRate');

// ─────────────────────────────────────────────────────────────────────────────
// DELHI FARE TABLES & CALCULATORS
// All fares reflect real-world Delhi pricing as of 2025-26.
// These override any DB-stored linear rates for accuracy.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DMRC (Delhi Metro Rail Corporation) distance-slab fare table.
 *
 *   Distance (km)   Mon–Sat   Sun & National Holidays
 *   0–2             ₹11       ₹11
 *   2–5             ₹21       ₹11
 *   5–12            ₹32       ₹21
 *   12–21           ₹43       ₹32
 *   21–32           ₹54       ₹43
 *   >32             ₹64       ₹54
 *
 *  Time limits: 0–12 km → 65 min | 12–32 km → 100 min | >32 km → 180 min
 */
const DMRC_SLABS = [
  { maxKm:  2, weekday: 11, weekend: 11 },
  { maxKm:  5, weekday: 21, weekend: 11 },
  { maxKm: 12, weekday: 32, weekend: 21 },
  { maxKm: 21, weekday: 43, weekend: 32 },
  { maxKm: 32, weekday: 54, weekend: 43 },
  { maxKm: Infinity, weekday: 64, weekend: 54 },
];

/**
 * Returns the official DMRC metro fare.
 * @param {number} distance - km
 * @param {boolean} [isWeekend=false] - Sunday / National Holiday
 */
function calculateDMRCMetroFare(distance, isWeekend = false) {
  for (const slab of DMRC_SLABS) {
    if (distance <= slab.maxKm) {
      return isWeekend ? slab.weekend : slab.weekday;
    }
  }
  return isWeekend ? 54 : 64;
}

/**
 * AUTO RICKSHAW — Delhi metered fare (government-regulated).
 *
 *   Base fare : ₹30 for first 1.5 km
 *   After 1.5 km: ₹11 per additional km
 *   Minimum fare: ₹30
 *
 *   App-based (Uber Auto / Ola / Rapido Auto):
 *   - Uber Auto minimum: ₹35–40; slightly above meter
 *   - Rapido Auto / Ola Auto: comparable upfront pricing
 *   - E-Rickshaw (shared/private): min ₹20 for short hops
 *
 *   We model the government metered rate as the baseline (most common).
 * @param {number} distance - km
 */
function calculateDelhiAutoFare(distance) {
  const BASE_FARE = 30.0;   // covers first 1.5 km
  const BASE_KM   = 1.5;
  const PER_KM    = 11.0;
  const MIN_FARE  = 30.0;

  const chargeableKm = Math.max(0, distance - BASE_KM);
  const fare = BASE_FARE + chargeableKm * PER_KM;
  return parseFloat(Math.max(MIN_FARE, fare).toFixed(2));
}

/**
 * BIKE / MOTO RIDE-SHARING — Delhi (Uber Moto / Rapido Bike).
 *
 *   Uber Moto : ₹25 flat for first 3 km, then ₹7/km
 *   Rapido Bike: base ₹15–25; ~₹6–8/km beyond that
 *
 *   We use Uber Moto as the reference (most widely used).
 *   Minimum fare: ₹25
 * @param {number} distance - km
 */
function calculateDelhiBikeFare(distance) {
  const BASE_FARE = 25.0;   // covers first 3 km
  const BASE_KM   = 3.0;
  const PER_KM    = 7.0;
  const MIN_FARE  = 25.0;

  const chargeableKm = Math.max(0, distance - BASE_KM);
  const fare = BASE_FARE + chargeableKm * PER_KM;
  return parseFloat(Math.max(MIN_FARE, fare).toFixed(2));
}

/**
 * DTC BUS — Delhi Transport Corporation distance-slab fare.
 *
 *   Non-AC buses  : ₹5 – ₹15  (distance-based)
 *   AC buses      : ₹10 – ₹25 (distance-based)
 *
 *   Non-AC slab table (government tariff):
 *     0–5 km   → ₹5
 *     5–10 km  → ₹10
 *     10-20 km → ₹15
 *     >20 km   → scales ₹5 per 10km for realism on long routes
 *
 *   AC slab table:
 *     0–5 km   → ₹10
 *     5–12 km  → ₹15
 *     12–20 km → ₹20
 *     >20 km   → ₹25 + scales ₹5 per 10km for realism
 *
 *   We return the Non-AC fare (most common; AC shown as a note).
 *   Women ride FREE on DTC buses.
 * @param {number} distance - km
 * @param {boolean} [ac=false] - true for AC bus fare
 */
function calculateDTCBusFare(distance, ac = false) {
  if (ac) {
    if (distance <=  5) return 10;
    if (distance <= 12) return 15;
    if (distance <= 20) return 20;
    const extraDistance = Math.max(0, distance - 20);
    return 25 + Math.ceil(extraDistance / 10) * 5;
  }
  // Non-AC (default)
  if (distance <=  5) return 5;
  if (distance <= 10) return 10;
  if (distance <= 20) return 15;
  
  // Beyond 20km, add ₹5 for every 10km to simulate longer regional routes
  const extraDistance = Math.max(0, distance - 20);
  return 15 + Math.ceil(extraDistance / 10) * 5;
}

// ─────────────────────────────────────────────────────────────────────────────
// BENGALURU (BANGALORE) FARE TABLES & CALCULATORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * NAMMA METRO — Bengaluru distance-based fare.
 *
 *   Short distances (1-2 stations): ~₹11
 *   10-15 km: ~₹63
 *   >25 km: ~₹95 (Max)
 *
 *   A linear approximation that fits these data points well:
 *   Base ₹10 + ₹3.5 per km, capped at ₹95.
 */
function calculateBengaluruMetroFare(distance) {
  let fare = 10 + (distance * 3.5);
  fare = Math.min(95, Math.max(11, fare)); // Min ₹11, Max ₹95
  return parseFloat(fare.toFixed(2));
}

/**
 * AUTO RICKSHAW — Bengaluru metered fare.
 *
 *   Base fare : ₹36 for first 2 km
 *   After 2 km: ₹18 per additional km
 *   Minimum fare: ₹36
 *
 *   Night travel (10PM - 5AM) has 50% surcharge. 
 *   (We apply base rate here; the app could later pass an isNight flag)
 * @param {number} distance - km
 * @param {boolean} [isNight=false] - 50% surcharge
 */
function calculateBengaluruAutoFare(distance, isNight = false) {
  const BASE_FARE = 36.0;   // covers first 2 km
  const BASE_KM   = 2.0;
  const PER_KM    = 18.0;
  const MIN_FARE  = 36.0;

  const chargeableKm = Math.max(0, distance - BASE_KM);
  let fare = BASE_FARE + chargeableKm * PER_KM;
  fare = Math.max(MIN_FARE, fare);

  if (isNight) {
    fare *= 1.5; // 50% surcharge
  }
  return parseFloat(fare.toFixed(2));
}

/**
 * BIKE / MOTO RIDE-SHARING — Bengaluru (Uber Moto / Rapido).
 *
 *   Pricing: Starts at ₹25 for the first 3 km.
 *   Thereafter, standard per-km rate (approx ₹7-8/km).
 * @param {number} distance - km
 */
function calculateBengaluruBikeFare(distance) {
  const BASE_FARE = 25.0;   // covers first 3 km
  const BASE_KM   = 3.0;
  const PER_KM    = 8.0;    // typical rate
  const MIN_FARE  = 25.0;

  const chargeableKm = Math.max(0, distance - BASE_KM);
  const fare = BASE_FARE + chargeableKm * PER_KM;
  return parseFloat(Math.max(MIN_FARE, fare).toFixed(2));
}

/**
 * BMTC BUS — Bengaluru Metropolitan Transport Corporation.
 *
 *   Range from ₹10 to ₹50 for normal services, depending on distance.
 *   Modeled roughly as base ₹10, increasing by ~₹2 per km up to ₹50 cap.
 * @param {number} distance - km
 */
function calculateBengaluruBusFare(distance) {
  let fare = 10 + (distance * 1.5);
  fare = Math.min(50, Math.max(10, Math.round(fare))); // Caps at ₹50
  return parseFloat(fare.toFixed(2));
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates travel costs for all modes in a specific city given a distance.
 *
 * For Delhi, all modes use accurate real-world fare functions.
 * For other cities, the DB-stored linear rates are used as a fallback.
 *
 * @param {string} cityName - Name of the city.
 * @param {number} distance - Route distance in km.
 * @param {boolean} [isWeekend=false] - Sunday / National Holiday (affects DMRC metro fare).
 */
async function calculateCosts(cityName, distance, isWeekend = false) {
  const searchName = cityName ? cityName.trim().toLowerCase() : 'delhi';
  const isDelhiCity = searchName === 'delhi' || searchName === 'new delhi' || searchName === 'delhi ncr';
  const isBengaluruCity = searchName === 'bangalore' || searchName === 'bengaluru';

  // ── Delhi: use real-world fare functions for all modes ───────────────────
  if (isDelhiCity) {
    return {
      auto:  calculateDelhiAutoFare(distance),
      bike:  calculateDelhiBikeFare(distance),
      metro: calculateDMRCMetroFare(distance, isWeekend),
      bus:   calculateDTCBusFare(distance, false),   // Non-AC DTC fare
      walk:  0.0,
    };
  }

  // ── Bengaluru: use real-world fare functions for all modes ─────────────────
  if (isBengaluruCity) {
    return {
      auto:  calculateBengaluruAutoFare(distance),
      bike:  calculateBengaluruBikeFare(distance),
      metro: calculateBengaluruMetroFare(distance),
      bus:   calculateBengaluruBusFare(distance),
      walk:  0.0,
    };
  }

  // ── Other cities: DB-driven linear rates with fallback ───────────────────
  let city = await City.findOne({
    where: { name: sequelizeSearchCaseInsensitive(cityName.trim()) },
    include: [{ model: TransportRate, as: 'rates' }]
  });

  if (!city) {
    city = await City.findOne({
      where: sequelizeSearchFallback(cityName.trim()),
      include: [{ model: TransportRate, as: 'rates' }]
    });
  }

  const rates = city ? city.rates : [];
  const costMap = {};

  const fallbackRates = {
    auto:  { baseFare: 30.0, baseKm: 1.5, perKm: 12.0, adjustmentFactor: 1.0 },
    bus:   { baseFare: 10.0, baseKm: 4.0, perKm:  2.0, adjustmentFactor: 1.0 },
    metro: { baseFare: 10.0, baseKm: 2.0, perKm:  4.0, adjustmentFactor: 1.0 },
    bike:  { baseFare: 20.0, baseKm: 2.0, perKm:  6.0, adjustmentFactor: 1.0 },
    walk:  { baseFare:  0.0, baseKm: 0.0, perKm:  0.0, adjustmentFactor: 1.0 },
  };

  ['auto', 'bus', 'metro', 'bike', 'walk'].forEach(mode => {
    const dbRate = rates.find(r => r.mode.toLowerCase() === mode);
    const rate = dbRate
      ? { baseFare: dbRate.baseFare, baseKm: dbRate.baseKm, perKm: dbRate.perKm, adjustmentFactor: dbRate.adjustmentFactor }
      : fallbackRates[mode];

    if (mode === 'walk') {
      costMap[mode] = 0.0;
    } else if (mode === 'metro') {
      // Use DMRC slabs even for non-Delhi cities as a sensible default
      costMap[mode] = calculateDMRCMetroFare(distance, isWeekend);
    } else {
      const chargeableKm = Math.max(0, distance - rate.baseKm);
      const fare = rate.baseFare + chargeableKm * rate.perKm;
      costMap[mode] = parseFloat((fare * rate.adjustmentFactor).toFixed(2));
    }
  });

  return costMap;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sequelize helpers
// ─────────────────────────────────────────────────────────────────────────────

function sequelizeSearchCaseInsensitive(name) {
  const { Op } = require('sequelize');
  return { [Op.iLike]: name };
}

function sequelizeSearchFallback(name) {
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
  calculateCosts,
  calculateDMRCMetroFare,
  calculateDelhiAutoFare,
  calculateDelhiBikeFare,
  calculateDTCBusFare,
  calculateBengaluruMetroFare,
  calculateBengaluruAutoFare,
  calculateBengaluruBikeFare,
  calculateBengaluruBusFare,
};
