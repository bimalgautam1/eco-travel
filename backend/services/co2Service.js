const CO2_FACTORS = {
  walk: 0.0,
  metro: 0.04,
  bus: 0.08,
  auto: 0.12,
  bike: 0.10
};

/**
 * Calculates CO2 emissions in kg for all modes based on distance.
 */
function calculateCO2(distance) {
  const co2Map = {};
  
  Object.keys(CO2_FACTORS).forEach(mode => {
    const factor = CO2_FACTORS[mode];
    const emissions = distance * factor;
    co2Map[mode] = parseFloat(emissions.toFixed(3)); // 3 decimals for precision in kg
  });
  
  return co2Map;
}

module.exports = {
  calculateCO2,
  CO2_FACTORS
};
