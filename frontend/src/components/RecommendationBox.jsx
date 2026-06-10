import React from 'react';

const RecommendationBox = ({ aiSummary }) => {
  if (!aiSummary) return null;

  const { cityName, totalDistance, recommendations, insights } = aiSummary;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl shadow-xl p-6 border border-slate-800 relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl animate-bounce">✨</span>
        <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent tracking-wide">
          AI Smart Commute Recommendation
        </h2>
        <span className="ml-auto bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md">
          Decision Engine Active
        </span>
      </div>

      {/* Main Insight Text */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 mb-5">
        <p className="text-slate-300 text-sm leading-relaxed font-medium">
          {insights}
        </p>
      </div>

      {/* Mode Recommendations Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Cheapest */}
        <div className="bg-slate-900/40 border border-slate-800 hover:border-green-500/30 p-3.5 rounded-xl transition-all">
          <div className="flex items-center gap-2 mb-1.5 text-green-400 text-xs font-bold uppercase tracking-wider">
            <span>🪙</span> Cheapest Choice
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            {recommendations.cheapest}
          </p>
        </div>

        {/* Fastest */}
        <div className="bg-slate-900/40 border border-slate-800 hover:border-blue-500/30 p-3.5 rounded-xl transition-all">
          <div className="flex items-center gap-2 mb-1.5 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <span>⚡</span> Fastest Choice
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            {recommendations.fastest}
          </p>
        </div>

        {/* Greenest */}
        <div className="bg-slate-900/40 border border-slate-800 hover:border-emerald-500/30 p-3.5 rounded-xl transition-all">
          <div className="flex items-center gap-2 mb-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span>🌱</span> Greenest Choice
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            {recommendations.greenest}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecommendationBox;
