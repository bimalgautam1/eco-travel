const mapService = require('../services/mapService');
const costService = require('../services/costService');
const co2Service = require('../services/co2Service');
const rankingService = require('../services/rankingService');
const feedbackService = require('../services/feedbackService');
const evService = require('../services/evService');

/**
 * Handles fetching simple route distance/duration
 */
exports.getRoute = async (req, res) => {
  try {
    const source = req.query.source || req.body.source;
    const destination = req.query.destination || req.body.destination;

    if (!source || !destination) {
      return res.status(400).json({ error: 'Please provide both source and destination strings.' });
    }

    const route = await mapService.getRouteDetails(source, destination);
    return res.status(200).json(route);
  } catch (error) {
    console.error('Error in getRoute:', error);
    return res.status(500).json({ error: 'Failed to fetch route details.' });
  }
};

/**
 * Compares all commute modes for cost, duration, and emissions, then ranks them.
 */
exports.compareRoutes = async (req, res) => {
  try {
    const source = req.query.source || req.body.source;
    const destination = req.query.destination || req.body.destination;
    const city = req.query.city || req.body.city || 'Delhi';

    // Optional: parse waypoints
    let waypoints = [];
    if (req.query.waypoints) {
      try {
        waypoints = JSON.parse(req.query.waypoints);
      } catch (_) {
        if (typeof req.query.waypoints === 'string') {
          waypoints = req.query.waypoints.split(',').map(w => w.trim()).filter(Boolean);
        }
      }
    }

    // Optional: real route data pre-fetched by the browser (bypasses server-side API restrictions)
    const clientDistance = req.query.distance ? parseFloat(req.query.distance) : null;
    const clientBaseDuration = req.query.baseDuration ? parseInt(req.query.baseDuration) : null;
    let clientDurationByMode = null;
    if (req.query.durationByMode) {
      try { clientDurationByMode = JSON.parse(req.query.durationByMode); } catch (_) {}
    }

    if (!source || !destination) {
      return res.status(400).json({ error: 'Please provide both source and destination strings.' });
    }

    // 1. Use client-provided route data if available (real Google Maps, browser-based).
    //    Otherwise fall back to server-side mapService (mock when key is restricted).
    let distance, baseDuration, durations;

    if (clientDistance && clientBaseDuration && clientDurationByMode) {
      // ✅ Real data from Google Maps JS SDK (browser-side, works with referrer-restricted keys)
      distance = clientDistance;
      baseDuration = clientBaseDuration;
      durations = clientDurationByMode;
      console.log(`[CommuteController] Using client-provided Google Maps data: ${distance} km, ${baseDuration} min`);
    } else {
      // ⚠️  Fallback: server-side fetch (will be mock if key has referrer restrictions)
      const route = await mapService.getRouteDetails(source, destination);
      distance = route.distance;
      baseDuration = route.duration;
      durations = route.durationByMode || {
        auto: baseDuration,
        bike: Math.max(1, Math.round(baseDuration * 0.85)),
        bus: Math.max(1, Math.round(baseDuration * 1.4 + 5)),
        metro: Math.max(1, Math.round(baseDuration * 0.75 + 8)),
        walk: Math.max(1, Math.round((distance / 5) * 60)),
      };
    }

    // 2. Fetch computed pricing options
    // Detect weekend (Sunday = 0) or National Holiday for DMRC metro pricing
    const todayDay = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = todayDay === 0; // Only Sunday gets the discounted DMRC rate
    const costs = await costService.calculateCosts(city, distance, isWeekend);

    // 3. Compute carbon emissions
    const co2 = co2Service.calculateCO2(distance);

    // 5. Structure payload for ranking engine
    const modesList = [
      { mode: 'auto', cost: costs.auto, duration: durations.auto, co2: co2.auto },
      { mode: 'bus', cost: costs.bus, duration: durations.bus, co2: co2.bus },
      { mode: 'metro', cost: costs.metro, duration: durations.metro, co2: co2.metro },
      { mode: 'bike', cost: costs.bike, duration: durations.bike, co2: co2.bike },
      { mode: 'walk', cost: costs.walk, duration: durations.walk, co2: co2.walk }
    ];

    // 5b. Synthesize Multi-Modal Combo (Metro + Auto) if distance is substantial (>5km)
    if (distance > 5) {
      // 15% distance via Auto, 85% via Metro
      const autoDist = distance * 0.15;
      const metroDist = distance * 0.85;

      // Auto leg: use accurate calculation for Delhi or Bengaluru, otherwise fallback
      const searchCity = city ? city.trim().toLowerCase() : 'delhi';
      const isDelhi = searchCity === 'delhi' || searchCity === 'new delhi' || searchCity === 'delhi ncr';
      const isBengaluru = searchCity === 'bangalore' || searchCity === 'bengaluru';
      
      let autoLegCost;
      if (isDelhi) {
        autoLegCost = costService.calculateDelhiAutoFare(autoDist);
      } else if (isBengaluru) {
        autoLegCost = costService.calculateBengaluruAutoFare(autoDist);
      } else {
        autoLegCost = 30 + (autoDist * 11); // Generic Fallback
      }

      const comboCost = parseFloat((autoLegCost + costs.metro).toFixed(2)); // auto leg + metro fare
      const comboDuration = Math.round((durations.auto * 0.15) + durations.metro + 5); // auto transfer + metro duration + buffer
      const comboCO2 = parseFloat(((autoDist * 0.12) + (metroDist * 0.04)).toFixed(3)); // auto CO2 + metro CO2

      modesList.push({
        mode: 'metro_auto',
        cost: comboCost,
        duration: comboDuration,
        co2: comboCO2,
        isCombo: true
      });
    }

    // 6. Rank best choices
    const ranking = rankingService.rankCommutes(modesList);

    // 7. Formulate AI recommendation summary
    const cheapestMode = ranking.cheapest;
    const fastestMode = ranking.fastest;
    const greenestMode = ranking.greenest;

    const cheapestInfo = modesList.find(m => m.mode === cheapestMode);
    const fastestInfo = modesList.find(m => m.mode === fastestMode);
    const greenestInfo = modesList.find(m => m.mode === greenestMode);

    const aiSummary = {
      totalDistance: distance,
      cityName: city,
      recommendations: {
        cheapest: `Taking a ${cheapestMode} is the cheapest option costing ₹${cheapestInfo.cost} taking ${cheapestInfo.duration} mins.`,
        fastest: `Taking a ${fastestMode} is the fastest option taking ${fastestInfo.duration} mins costing ₹${fastestInfo.cost}.`,
        greenest: `Taking a ${greenestMode} is the greenest option with only ${greenestInfo.co2} kg of CO2 emissions.`
      },
      insights: `For a ${distance} km commute in ${city}: If you are in a rush, choose ${fastestMode} (${fastestInfo.duration} mins). If you want to save money, choose ${cheapestMode} (₹${cheapestInfo.cost}). For the lowest carbon footprint, choose ${greenestMode} (${greenestInfo.co2} kg CO2).`
    };

    // 8. Call EV charging stations lookup (dest, city)
    let evStationsList = [];
    try {
      evStationsList = await evService.getEVStationsNearAddress(destination, city);
    } catch (evErr) {
      console.error('[CommuteController] Failed to query EV stations:', evErr.message);
    }

    // 9. Generate Carpool/Ride-Sharing integration mockup options
    const carpools = [
      { driver: 'Rohan Kumar', rating: 4.8, fareShare: Math.round(costs.auto * 0.4) || 40, vehicle: 'Nexon EV', departure: 'In 5 mins' },
      { driver: 'Anjali Gupta', rating: 4.9, fareShare: Math.round(costs.auto * 0.35) || 35, vehicle: 'Tigor EV', departure: 'In 12 mins' }
    ];

    return res.status(200).json({
      source,
      destination,
      city,
      distance,
      baseDuration,
      waypoints,
      modes: modesList,
      ranking,
      aiSummary,
      evStations: evStationsList,
      carpools
    });
  } catch (error) {
    console.error('Error in compareRoutes:', error);
    return res.status(500).json({ error: 'Failed to compare commute modes.' });
  }
};

/**
 * Receives customer feedback on fare estimation errors and saves it to adjust rates
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { source, destination, mode, distance, estimatedFare, actualFare, city } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!source || !destination || !mode || distance === undefined || estimatedFare === undefined || actualFare === undefined) {
      return res.status(400).json({ 
        error: 'Required feedback fields: source, destination, mode, distance, estimatedFare, actualFare.' 
      });
    }

    const result = await feedbackService.processFeedback(userId, {
      source,
      destination,
      mode,
      distance,
      estimatedFare,
      actualFare,
      city
    });

    return res.status(201).json({
      message: 'Feedback submitted successfully. Pricing models updated.',
      data: result.feedback,
      updatedRate: result.updatedRate ? {
        mode: result.updatedRate.mode,
        adjustmentFactor: result.updatedRate.adjustmentFactor,
        baseFare: result.updatedRate.baseFare,
        perKm: result.updatedRate.perKm
      } : null
    });
  } catch (error) {
    console.error('Error in submitFeedback:', error);
    return res.status(500).json({ error: 'Failed to process feedback.' });
  }
};

/**
 * Exposes the Google Maps API Key to the frontend
 */
exports.getMapsKey = async (req, res) => {
  try {
    const apiKey = process.env.MAPS_API_KEY || '';
    return res.status(200).json({ apiKey });
  } catch (error) {
    console.error('Error in getMapsKey:', error);
    return res.status(500).json({ error: 'Failed to fetch Maps configuration.' });
  }
};

