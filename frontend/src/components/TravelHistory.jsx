import React, { useState, useEffect } from 'react';
import { getTravelHistory } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const MODE_META = {
  auto: { label: 'Auto Rickshaw', icon: '🛺', bg: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-100 dark:border-amber-900/40' },
  bus: { label: 'City Bus', icon: '🚌', bg: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-100 dark:border-blue-900/40' },
  metro: { label: 'Metro Train', icon: '🚇', bg: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 border-purple-100 dark:border-purple-900/40' },
  bike: { label: 'Two-Wheeler / Bike', icon: '🏍️', bg: 'bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 border-cyan-100 dark:border-cyan-900/40' },
  walk: { label: 'Walk', icon: '🚶', bg: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/40' },
};

const TravelHistory = ({ history: propsHistory, isLoading: propsIsLoading, error: propsError, onRefresh }) => {
  const [internalHistory, setInternalHistory] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [internalError, setInternalError] = useState('');

  const fetchHistory = async () => {
    try {
      setInternalLoading(true);
      setInternalError('');
      const data = await getTravelHistory();
      setInternalHistory(data.history || []);
    } catch (err) {
      console.error('Error fetching travel history:', err);
      setInternalError('Failed to load travel history. Please try again.');
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    if (propsHistory === undefined) {
      fetchHistory();
    }
  }, [propsHistory]);

  const history = propsHistory !== undefined ? propsHistory : internalHistory;
  const isLoading = propsIsLoading !== undefined ? propsIsLoading : internalLoading;
  const error = propsError !== undefined ? propsError : internalError;
  const handleRefresh = onRefresh || fetchHistory;

  // Compute summary stats
  const totalTrips = history.length;
  const totalDistance = history.reduce((sum, item) => sum + item.distance, 0);
  const totalCost = history.reduce((sum, item) => sum + item.cost, 0);
  const totalCO2 = history.reduce((sum, item) => sum + item.co2, 0);

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 min-h-[400px] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 text-center">
        <span className="text-4xl">⚠️</span>
        <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mt-2">Error</h3>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Title & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Travel History &amp; Impact</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Track your logged commutes, transit costs, and CO₂ footprint.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Impact Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Trips */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-2xl">🚗</span>
          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-2">Total Trips</h4>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{totalTrips}</p>
        </div>

        {/* Total Distance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-2xl">📏</span>
          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-2">Total Distance</h4>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{totalDistance.toFixed(1)} km</p>
        </div>

        {/* Total Cost */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-2xl">🪙</span>
          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-2">Spent Fare</h4>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">₹{totalCost.toFixed(0)}</p>
        </div>

        {/* Carbon Emitted */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-2xl">🌱</span>
          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-2">CO₂ Footprint</h4>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalCO2.toFixed(1)} kg</p>
        </div>
      </div>

      {/* Trips Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xl">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-5">
          📜 Commute Log Timeline
        </h3>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">🧭</span>
            <h4 className="font-extrabold text-slate-700 dark:text-slate-300">No travel logs found</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
              Your logged trips will appear here once you select a commute mode and save it in the Commute Finder.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((trip) => {
              const meta = MODE_META[trip.mode.toLowerCase()] || {
                label: trip.mode,
                icon: '🚗',
                bg: 'bg-slate-50 dark:bg-slate-900/50 text-slate-600 border-slate-200',
              };

              return (
                <div
                  key={trip.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/55 dark:hover:bg-slate-850/40 transition-colors"
                >
                  {/* Left: Mode icon, Route details */}
                  <div className="flex items-start gap-3.5">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xl flex-shrink-0 mt-0.5 ${meta.bg}`}>
                      {meta.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 capitalize">
                          {trip.source}
                        </span>
                        <span className="text-slate-400 dark:text-slate-600 text-xs">➔</span>
                        <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 capitalize">
                          {trip.destination}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 dark:text-slate-500 flex-wrap">
                        <span>{formatDate(trip.createdAt)}</span>
                        <span>•</span>
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                          {trip.city}
                        </span>
                        <span>•</span>
                        <span className="italic font-medium text-slate-500 dark:text-slate-400">
                          Vehicle: {trip.vehicle}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Specs (Distance, time, cost, co2) */}
                  <div className="flex items-center gap-6 justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3 md:pt-0 md:border-none">
                    <div className="text-center md:text-right">
                      <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Distance</span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{trip.distance.toFixed(1)} km</span>
                    </div>
                    <div className="text-center md:text-right">
                      <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Duration</span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{trip.duration} min</span>
                    </div>
                    <div className="text-center md:text-right">
                      <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Fare</span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        {trip.cost === 0 ? <span className="text-emerald-600">Free</span> : `₹${trip.cost.toFixed(0)}`}
                      </span>
                    </div>
                    <div className="text-center md:text-right">
                      <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Carbon</span>
                      <span className={`text-xs font-extrabold ${trip.co2 === 0 ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        {trip.co2.toFixed(1)} kg
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelHistory;
