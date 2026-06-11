import React, { useState } from 'react';
import { saveTravel } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MODE_META = {
  auto: {
    label: 'Auto Rickshaw',
    icon: '🛺',
    iconBg: 'bg-amber-100 text-amber-700',
    accentText: 'text-amber-600',
    accentBorder: 'border-amber-200',
    accentBg: 'bg-amber-50',
    defaultVehicle: 'Auto Rickshaw',
  },
  bus: {
    label: 'City Bus',
    icon: '🚌',
    iconBg: 'bg-blue-100 text-blue-700',
    accentText: 'text-blue-600',
    accentBorder: 'border-blue-200',
    accentBg: 'bg-blue-50',
    defaultVehicle: 'Public Bus',
  },
  metro: {
    label: 'Metro Train',
    icon: '🚇',
    iconBg: 'bg-purple-100 text-purple-700',
    accentText: 'text-purple-600',
    accentBorder: 'border-purple-200',
    accentBg: 'bg-purple-50',
    defaultVehicle: 'Metro Train',
  },
  bike: {
    label: 'Two-Wheeler / Bike',
    icon: '🏍️',
    iconBg: 'bg-cyan-100 text-cyan-700',
    accentText: 'text-cyan-600',
    accentBorder: 'border-cyan-200',
    accentBg: 'bg-cyan-50',
    defaultVehicle: 'Motorcycle',
  },
  walk: {
    label: 'Walk',
    icon: '🚶',
    iconBg: 'bg-emerald-100 text-emerald-700',
    accentText: 'text-emerald-600',
    accentBorder: 'border-emerald-200',
    accentBg: 'bg-emerald-50',
    defaultVehicle: 'Walking',
  },
  metro_auto: {
    label: 'Metro + Auto Combo',
    icon: '🚇🛺',
    iconBg: 'bg-gradient-to-tr from-purple-100 to-amber-100 text-indigo-700',
    accentText: 'text-indigo-650',
    accentBorder: 'border-indigo-200',
    accentBg: 'bg-indigo-50/50',
    defaultVehicle: 'Metro & Auto',
  },
};

const ModeCard = ({ modeData, ranking, source, destination, city, distance, waypoints = [], onSaved }) => {
  const { mode, cost, duration, co2 } = modeData;
  const { refreshUser } = useAuth();
  const meta = MODE_META[mode.toLowerCase()] || {
    label: mode,
    icon: '🚗',
    iconBg: 'bg-slate-100 text-slate-700',
    accentText: 'text-slate-600',
    accentBorder: 'border-slate-200',
    accentBg: 'bg-slate-50',
    defaultVehicle: 'Vehicle',
  };

  const isCheapest = ranking.cheapest === mode;
  const isFastest = ranking.fastest === mode;
  const isGreenest = ranking.greenest === mode;

  // Log-trip states
  const [showLogForm, setShowLogForm] = useState(false);
  const [vehicle, setVehicle] = useState(meta.defaultVehicle);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!vehicle.trim()) {
      setErrorMessage('Please specify the vehicle or line.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await saveTravel({
        source,
        destination,
        city,
        mode,
        distance: parseFloat(distance),
        duration: parseInt(duration, 10),
        cost: parseFloat(cost),
        co2: parseFloat(co2),
        vehicle: vehicle.trim(),
        waypoints: waypoints.length > 0 ? waypoints : null
      });
      
      try {
        await refreshUser();
      } catch (e) {
        console.warn('Failed to refresh user stats:', e.message);
      }

      setIsSuccess(true);
      // After 1.8s, collapse the form and pass trip data for carbon story
      setTimeout(() => {
        setShowLogForm(false);
        setIsSuccess(false);
        // Baseline CO2 for a solo petrol car: 0.18 kg/km
        const distVal = parseFloat(distance);
        const co2Val = parseFloat(co2);
        const co2Saved = Math.max(0, distVal * 0.18 - co2Val);
        if (onSaved) onSaved({
          mode,
          distance: distVal,
          co2: co2Val,
          co2Saved: parseFloat(co2Saved.toFixed(3)),
          city: city || 'Delhi',
        });
      }, 1800);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Border highlight logic
  let borderClasses = 'border-slate-200';
  if (isCheapest && isFastest && isGreenest) {
    borderClasses = 'border-emerald-500 ring-2 ring-emerald-500/20';
  } else if (isCheapest && isGreenest) {
    borderClasses = 'border-emerald-500 ring-2 ring-emerald-500/20';
  } else if (isCheapest) {
    borderClasses = 'border-green-500 ring-2 ring-green-500/20';
  } else if (isFastest) {
    borderClasses = 'border-blue-500 ring-2 ring-blue-500/20';
  } else if (isGreenest) {
    borderClasses = 'border-emerald-500 ring-2 ring-emerald-500/20';
  }

  return (
    <div className={`relative rounded-2xl border bg-white dark:bg-slate-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden ${borderClasses}`}>

      {/* Coloured top strip */}
      <div className={`h-1.5 w-full ${meta.iconBg.split(' ')[0].replace('bg-', 'bg-').replace('100', '400')}`} />

      {/* Badges */}
      <div className="absolute top-4 right-3 flex flex-row gap-1 z-10">
        {isFastest && (
          <span className="bg-blue-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
            ⚡ Fastest
          </span>
        )}
        {isCheapest && (
          <span className="bg-green-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
            🪙 Cheapest
          </span>
        )}
        {isGreenest && (
          <span className="bg-emerald-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
            🌱 Greenest
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${meta.iconBg}`}>
            {meta.icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight">{meta.label}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider mt-0.5">Commute mode</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <div>
            <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Fare</span>
            <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
              {cost === 0 ? <span className="text-emerald-600">Free</span> : `₹${parseFloat(cost).toFixed(0)}`}
            </span>
          </div>
          <div>
            <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Time</span>
            <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">{duration} min</span>
          </div>
          <div>
            <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">CO₂</span>
            <span className={`text-sm font-extrabold ${co2 === 0 ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-200'}`}>
              {co2 === 0 ? '0 kg 🌱' : `${parseFloat(co2).toFixed(1)} kg`}
            </span>
          </div>
        </div>

        {/* ── Add to Travel CTA ── */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {!showLogForm ? (
            <button
              id={`add-travel-${mode}`}
              onClick={() => setShowLogForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-extrabold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-500/20 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <span className="text-base">➕</span>
              Add to Travel
            </button>
          ) : (
            <form onSubmit={handleSave} className="space-y-3">
              {isSuccess ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold py-3 px-4 rounded-xl text-center flex flex-col items-center gap-1">
                  <span className="text-2xl">✅</span>
                  <span>Trip saved! Redirecting to History…</span>
                </div>
              ) : (
                <>
                  {/* Vehicle input */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Vehicle / Line Used
                    </label>
                    <input
                      type="text"
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value)}
                      placeholder="e.g. Pulsar 150, Metro Line 2"
                      disabled={isSubmitting}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                    />
                  </div>

                  {errorMessage && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900">
                      ⚠️ {errorMessage}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-extrabold py-2 px-3 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Saving…
                        </>
                      ) : '✓ Confirm Save'}
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => { setShowLogForm(false); setErrorMessage(''); }}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold py-2 px-3 rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModeCard;
