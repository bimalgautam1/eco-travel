import React, { useState } from 'react';

const SearchBox = ({ onSearch, isLoading }) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [city, setCity] = useState('Delhi');
  const [waypoints, setWaypoints] = useState([]);

  const handleAddWaypoint = () => {
    if (waypoints.length < 2) {
      setWaypoints([...waypoints, '']);
    }
  };

  const handleWaypointChange = (index, value) => {
    const updated = [...waypoints];
    updated[index] = value;
    setWaypoints(updated);
  };

  const handleRemoveWaypoint = (index) => {
    const updated = waypoints.filter((_, i) => i !== index);
    setWaypoints(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!source.trim() || !destination.trim()) return;
    const cleanWaypoints = waypoints.map(w => w.trim()).filter(Boolean);
    onSearch({ 
      source: source.trim(), 
      destination: destination.trim(), 
      city, 
      waypoints: cleanWaypoints 
    });
  };

  // Quick preset locations for the demo to wow users
  const handleQuickLoad = (src, dest, cty) => {
    setSource(src);
    setDestination(dest);
    setCity(cty);
    setWaypoints([]);
    onSearch({ source: src, destination: dest, city: cty, waypoints: [] });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-100 dark:shadow-none p-6 border border-slate-100 dark:border-slate-800">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <span className="text-2xl">🌍</span> Plan Your Smart Commute
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* City Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Operating City
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
          >
            <option value="Delhi">Delhi NCR</option>
            <option value="Bangalore">Bangalore (Bengaluru)</option>
          </select>
        </div>

        {/* Source Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Source Address
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">📍</span>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. Connaught Place"
              disabled={isLoading}
              required
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Waypoints List */}
        {waypoints.map((wp, index) => (
          <div key={index} className="space-y-1 animate-fadeIn">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Stop {index + 1}
              </label>
              <button
                type="button"
                onClick={() => handleRemoveWaypoint(index)}
                className="text-[10px] text-red-500 hover:text-red-600 font-bold uppercase transition-colors cursor-pointer"
              >
                ✕ Remove
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">📍</span>
              <input
                type="text"
                value={wp}
                onChange={(e) => handleWaypointChange(index, e.target.value)}
                placeholder="e.g. Landmark or Metro stop"
                disabled={isLoading}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
          </div>
        ))}

        {/* Add Waypoint Trigger */}
        {waypoints.length < 2 && (
          <div className="text-right">
            <button
              type="button"
              onClick={handleAddWaypoint}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>➕</span> Add Midpoint Stop
            </button>
          </div>
        )}

        {/* Destination Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Destination Address
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🏁</span>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. India Gate"
              disabled={isLoading}
              required
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !source.trim() || !destination.trim()}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analyzing routes...
            </>
          ) : (
            <>
              <span>⚡</span> Compare Travel Modes
            </>
          )}
        </button>
      </form>

      {/* Quick Presets for Demo */}
      <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          💡 Try Hackathon Demo Routes:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickLoad('Connaught Place', 'India Gate', 'Delhi')}
            disabled={isLoading}
            className="text-xs bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-1.5 px-3 rounded-lg transition-colors font-medium cursor-pointer"
          >
            Delhi: CP → India Gate
          </button>
          <button
            onClick={() => handleQuickLoad('Indiranagar', 'Whitefield', 'Bangalore')}
            disabled={isLoading}
            className="text-xs bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-1.5 px-3 rounded-lg transition-colors font-medium cursor-pointer"
          >
            Blr: Indiranagar → Whitefield
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBox;
