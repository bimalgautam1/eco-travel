import React, { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const MODE_META = {
  auto: { icon: '🛺', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  bus: { icon: '🚌', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  metro: { icon: '🚇', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  bike: { icon: '🏍️', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  walk: { icon: '🚶', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  metro_auto: { icon: '🚇🛺', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
};

/**
 * Renders **bold** text within a string.
 */
function renderBold(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-bold text-white">{part}</strong> : part
  );
}

export default function AIRecommendCard({ city = 'Delhi', aqi }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRecommendation = useCallback(async () => {
    setLoading(true);
    setError(false);
    const token = localStorage.getItem('ecoroute_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({ city });
      if (aqi) params.append('aqi', aqi);

      const res = await fetch(`${API_URL}/api/ai/recommend?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setData(json);
    } catch (_) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [city, aqi]);

  useEffect(() => {
    fetchRecommendation();
  }, [fetchRecommendation]);

  // Skeleton loader
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-slate-800 rounded-xl" />
          <div>
            <div className="h-3 w-32 bg-slate-800 rounded mb-1.5" />
            <div className="h-2 w-20 bg-slate-800 rounded" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-800 rounded w-full" />
          <div className="h-3 bg-slate-800 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !data) return null;

  const modeMeta = MODE_META[data.favouriteMode] || MODE_META.metro;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 hover:border-emerald-800/50 rounded-2xl p-5 shadow-xl transition-all duration-300 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute -top-8 -right-8 w-28 h-28 bg-emerald-500/8 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-lg shadow-md shadow-emerald-500/20">
            🤖
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">Today's Smart Pick</p>
            <p className="text-[10px] text-emerald-400 font-semibold mt-0.5 uppercase tracking-wider">
              AI Personalized · {data.city}
            </p>
          </div>
        </div>
        <button
          onClick={fetchRecommendation}
          title="Refresh recommendation"
          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          🔄
        </button>
      </div>

      {/* Recommendation text */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          {renderBold(data.recommendation)}
        </p>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Favourite mode badge */}
        <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border ${modeMeta.bg} ${modeMeta.color}`}>
          <span>{modeMeta.icon}</span>
          <span className="capitalize">{data.favouriteMode?.replace('_', ' + ')} preferred</span>
        </div>

        {/* CO₂ saved */}
        {data.totalCO2Saved > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
            <span>🌿</span>
            <span>{data.totalCO2Saved.toFixed(1)} kg CO₂ saved</span>
          </div>
        )}

        {/* Trip count */}
        {data.tripCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg">
            <span>📜</span>
            <span>{data.tripCount} trips logged</span>
          </div>
        )}
      </div>
    </div>
  );
}
