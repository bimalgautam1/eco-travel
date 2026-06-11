import React from 'react';
import ModeCard from './ModeCard';
import RecommendationBox from './RecommendationBox';
import FeedbackBox from './FeedbackBox';

const ResultsPanel = ({ results, onTravelSaved }) => {
  if (!results) return null;

  const { source, destination, city, distance, baseDuration, modes, ranking, aiSummary } = results;

  return (
    <div className="space-y-6">
      {/* Route Info Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Smart Commute Route</span>
          <h2 className="text-xl font-extrabold flex items-center gap-2 mt-1">
            <span className="capitalize">{source}</span>
            <span className="text-emerald-200">➔</span>
            <span className="capitalize">{destination}</span>
          </h2>
          <p className="text-xs text-emerald-100 mt-1">
            Region: <span className="capitalize font-semibold">{city}</span>
          </p>
        </div>
        <div className="flex gap-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 w-full sm:w-auto justify-around">
          <div className="text-center px-3">
            <span className="block text-[10px] text-emerald-105 uppercase tracking-wider font-semibold">Total Distance</span>
            <span className="text-lg font-bold">{parseFloat(distance).toFixed(1)} km</span>
          </div>
          <div className="w-px bg-white/20"></div>
          <div className="text-center px-3">
            <span className="block text-[10px] text-emerald-105 uppercase tracking-wider font-semibold">Est. Duration</span>
            <span className="text-lg font-bold">{baseDuration} mins</span>
          </div>
        </div>
      </div>

      {/* AI Recommendation Box */}
      <RecommendationBox aiSummary={aiSummary} />

      {/* Mode Cards Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          📊 Transit Mode Comparison
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modes.map((modeData) => (
            <ModeCard
              key={modeData.mode}
              modeData={modeData}
              ranking={ranking}
              source={source}
              destination={destination}
              city={city}
              distance={distance}
              waypoints={results.waypoints || []}
              onSaved={(tripData) => onTravelSaved && onTravelSaved(tripData)}
            />
          ))}
        </div>
      </div>

      {/* EV Stations & Carpools */}
      <div className="grid grid-cols-1 gap-6 animate-fadeIn">
        {/* EV Charging Stations */}
        {results.evStations && results.evStations.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              🔌 EV Charging Stations Nearby Destination
            </h3>
            <div className="space-y-3">
              {results.evStations.map((station, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-50 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{station.name}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{station.address}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-100 dark:border-emerald-900 px-1.5 py-0.5 rounded font-bold">
                        {station.connector_type}
                      </span>
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold">
                        Level {station.level}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-extrabold border border-emerald-100 dark:border-emerald-900">
                    {station.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}


      </div>

      {/* Feedback Section */}
      <FeedbackBox
        source={source}
        destination={destination}
        city={city}
        distance={distance}
        modes={modes}
      />
    </div>
  );
};

export default ResultsPanel;
