import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const MODE_ICONS = {
  auto: '🛺', bus: '🚌', metro: '🚇', bike: '🏍️', walk: '🚶',
  metro_auto: '🚇', default: '🚗',
};

/**
 * CarbonStoryModal
 * 
 * Triggered after a trip is logged. Fetches an AI-generated eco impact story
 * and displays it in a celebratory animated modal.
 * 
 * Props:
 *  - tripData: { mode, distance, co2, co2Saved, city }
 *  - onClose: () => void
 */
export default function CarbonStoryModal({ tripData, onClose }) {
  const [story, setStory] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!tripData) return;
    fetchStory();
  }, [tripData]);

  const fetchStory = async () => {
    setLoading(true);
    const token = localStorage.getItem('ecoroute_token');
    if (!token || !tripData) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/ai/carbon-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tripData),
      });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setStory(json.story);
      setStats({
        treeDays: json.treeDays,
        kmAvoided: json.kmAvoided,
        lightBulbHours: json.lightBulbHours,
        co2Saved: json.co2Saved,
      });
    } catch (_) {
      setStory('🌿 Every eco trip counts — you\'re making a difference for India\'s future!');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose?.(), 280);
  };

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const modeIcon = MODE_ICONS[tripData?.mode?.toLowerCase()] || MODE_ICONS.default;
  const co2SavedNum = parseFloat(tripData?.co2Saved || 0);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-all duration-300
        ${visible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'}`}
      onClick={handleBackdrop}
    >
      <div
        className={`relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40
          border border-emerald-800/40 rounded-3xl shadow-2xl shadow-emerald-900/30 overflow-hidden
          transition-all duration-300 ease-out
          ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top confetti bar */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 w-full" />

        <div className="relative p-7">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-all cursor-pointer"
          >
            ✕
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/25">
                {modeIcon}
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 bg-emerald-400 rounded-full flex items-center justify-center text-sm animate-bounce shadow-md">
                ✓
              </div>
            </div>
            <h2 className="text-xl font-black text-white">Trip Logged!</h2>
            <p className="text-sm text-emerald-400 font-semibold mt-1 capitalize">
              {tripData?.mode?.replace('_', ' + ')} · {tripData?.distance} km · {tripData?.city}
            </p>
          </div>

          {/* AI Story */}
          <div className="bg-slate-900/80 border border-emerald-800/30 rounded-2xl p-5 mb-5 min-h-[80px] flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-400 font-medium">Calculating your eco impact…</p>
              </div>
            ) : (
              <p className="text-slate-200 text-sm leading-relaxed text-center font-medium">{story}</p>
            )}
          </div>

          {/* Impact stats */}
          {stats && co2SavedNum > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
                <p className="text-xl mb-0.5">🌳</p>
                <p className="text-lg font-black text-emerald-400">{stats.treeDays}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Tree-Days</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
                <p className="text-xl mb-0.5">🚗</p>
                <p className="text-lg font-black text-teal-400">{stats.kmAvoided}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">km Avoided</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
                <p className="text-xl mb-0.5">💡</p>
                <p className="text-lg font-black text-yellow-400">{stats.lightBulbHours}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Bulb-Hours</p>
              </div>
            </div>
          )}

          {/* CO₂ saved total */}
          {co2SavedNum > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-4 py-2.5 rounded-xl">
                <span className="text-lg">🌿</span>
                <div>
                  <p className="text-xs font-bold text-emerald-400">
                    {co2SavedNum.toFixed(3)} kg CO₂ saved
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">vs. solo petrol car baseline</p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Keep Commuting! 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
