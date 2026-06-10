import React from 'react';

const ImpactDashboard = ({ history }) => {
  // 1. Calculate stats
  const totalCO2Emitted = history.reduce((sum, trip) => sum + trip.co2, 0);
  const totalCO2Saved = history.reduce((sum, trip) => sum + (trip.co2Saved || 0), 0);
  const totalDistance = history.reduce((sum, trip) => sum + trip.distance, 0);
  
  // Trees Saved: 1 tree absorbs ~22kg of CO2 per year
  const treesSaved = totalCO2Saved / 22;

  // 2. Determine Current Indian Season Recommendation
  const getCurrentSeasonRecommendation = () => {
    const month = new Date().getMonth(); // 0-indexed: 0 = Jan, 11 = Dec
    
    // Summer: March (2) to June (5)
    if (month >= 2 && month <= 5) {
      return {
        title: '☀️ High Temperature Alert (Summer)',
        color: 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300',
        icon: '☀️',
        text: 'Temperatures are high across most Indian cities. To balance environmental savings and personal health: favor air-conditioned Metro systems or electric AC buses rather than walking or open cycling during peak mid-day hours (12 PM - 4 PM).'
      };
    }
    // Monsoon: July (6) to September (8)
    if (month >= 6 && month <= 8) {
      return {
        title: '🌧️ Monsoon Rains Active',
        color: 'border-blue-300 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300',
        icon: '🌧️',
        text: 'Expect sudden downpours, waterlogging, and transit delays. Covered transport like Metros and public buses are the safest low-emission options. Avoid walking or using two-wheelers on flooded streets.'
      };
    }
    // Winter: November (10) to February (1)
    if (month === 10 || month === 11 || month === 0 || month === 1) {
      return {
        title: '🌫️ Winter Fog & Air Alert',
        color: 'border-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-300',
        icon: '🌫️',
        text: 'Cooler months are great for walking or riding, but watch out for morning fog and heavy smog (high AQI) in North India (Delhi NCR). Wear a high-quality mask if active commuting, and travel via Metro to bypass road congestion.'
      };
    }
    // Default / Autumn & Spring: October (9) or March
    return {
      title: '🌸 Ideal Active Commute Season',
      color: 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300',
      icon: '🌸',
      text: 'Pleasant weather and clear skies! Outstanding time to maximize carbon savings. Walking and cycling are perfect for journeys under 4km, yielding 100% emission savings.'
    };
  };

  const season = getCurrentSeasonRecommendation();

  // 3. Comparison Stats (in kg of CO2 per month)
  // Assume user's history represents their commutes
  const userMonthlyEst = totalCO2Emitted; // Simulating logged footprint as current monthly usage
  const indiaAvgMonthly = 158; // 1.9 tonnes / 12 months = 158 kg
  const globalAvgMonthly = 391; // 4.7 tonnes / 12 months = 391 kg

  // Determine scaling for custom chart
  const maxVal = Math.max(userMonthlyEst, indiaAvgMonthly, globalAvgMonthly, 100);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Environmental Impact Dashboard</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Deep-dive analysis of your carbon footprint reductions and tree conversion equivalents.
        </p>
      </div>

      {/* Grid: Savings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CO2 Saved */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-3xl shrink-0">
            🌱
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Cumulative CO₂ Saved</h4>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-455 mt-0.5">{totalCO2Saved.toFixed(2)} kg</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Compared to single-occupant cars</p>
          </div>
        </div>

        {/* Tree Equivalent */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center text-3xl shrink-0">
            🌳
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Trees Offset Equivalent</h4>
            <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5">{treesSaved.toFixed(3)} Trees</p>
            <p className="text-[10px] text-slate-400 mt-0.5">At 22 kg absorption per tree/yr</p>
          </div>
        </div>

        {/* Carbon Footprint */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl shrink-0">
            🏃
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Emitted Footprint</h4>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-205 mt-0.5">{totalCO2Emitted.toFixed(2)} kg</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Across {totalDistance.toFixed(0)} km total logged</p>
          </div>
        </div>
      </div>

      {/* Grid: Charts & Season */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Comparison Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-7">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6">
            📊 Footprint Comparison (Monthly Average CO₂ in kg)
          </h3>
          
          <div className="space-y-5">
            {/* User Monthly */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700 dark:text-slate-300">Your Commutes (Logged)</span>
                <span className="text-emerald-600">{userMonthlyEst.toFixed(1)} kg</span>
              </div>
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${(userMonthlyEst / maxVal) * 100}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" 
                />
              </div>
            </div>

            {/* India Avg */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700 dark:text-slate-400">India Monthly Per Capita Avg</span>
                <span>{indiaAvgMonthly} kg</span>
              </div>
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${(indiaAvgMonthly / maxVal) * 100}%` }}
                  className="h-full bg-slate-450 dark:bg-slate-600 rounded-full transition-all duration-500" 
                />
              </div>
            </div>

            {/* Global Avg */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700 dark:text-slate-400">Global Monthly Per Capita Avg</span>
                <span>{globalAvgMonthly} kg</span>
              </div>
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${(globalAvgMonthly / maxVal) * 100}%` }}
                  className="h-full bg-red-400 dark:bg-red-950/60 rounded-full transition-all duration-500" 
                />
              </div>
            </div>
          </div>
          
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 font-semibold leading-relaxed">
            💡 <strong>Insight:</strong> Commuting with public transport in India reduces your carbon footprint by up to <strong>78%</strong> relative to private cars! Keeping your emissions below the 158kg average is a key goal.
          </div>
        </div>

        {/* Seasonal Recommendations */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            📅 Seasonal Transit Advice
          </h3>
          
          <div className={`p-4 rounded-xl border-l-4 ${season.color} space-y-2.5`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{season.icon}</span>
              <h4 className="font-extrabold text-sm">{season.title}</h4>
            </div>
            <p className="text-xs leading-relaxed font-medium">
              {season.text}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">💡 Commuter Tips for India:</h4>
            <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400 list-disc pl-4 font-medium">
              <li>Check live metro line status before boarding.</li>
              <li>Combine short walks with metro links for first/last mile.</li>
              <li>Opt for EV autos or e-rickshaws where available in NCR/Blr.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactDashboard;
