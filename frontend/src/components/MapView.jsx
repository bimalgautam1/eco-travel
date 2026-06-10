import React, { useState, useEffect } from 'react';
import { loadGoogleMaps } from '../utils/googleMapsLoader';

/**
 * MapView — Uses the Google Maps Embed API (iframe) to display routes.
 * This approach avoids the Directions JS API billing issue (REQUEST_DENIED)
 * and works with any Maps-enabled API key that has the Embed API active.
 *
 * Props:
 *   source      — origin address string (null = show a default India map)
 *   destination — destination address string
 *   apiKey      — Google Maps API key
 *   isDarkMode  — boolean for UI context (Embed API uses its own styling)
 */

const MapView = ({ source, destination, apiKey, isDarkMode, waypoints = [] }) => {
  const [embedUrl, setEmbedUrl] = useState('');

  useEffect(() => {
    if (!apiKey) {
      setEmbedUrl('');
      return;
    }

    let url;

    if (source && destination) {
      // Directions mode — shows real route polyline on the map
      let wpString = '';
      if (waypoints && waypoints.length > 0) {
        wpString = `&waypoints=${encodeURIComponent(waypoints.join('|'))}`;
      }
      url =
        `https://www.google.com/maps/embed/v1/directions` +
        `?key=${apiKey}` +
        `&origin=${encodeURIComponent(source)}` +
        `&destination=${encodeURIComponent(destination)}` +
        wpString +
        `&mode=driving` +
        `&region=in` +
        `&avoid=tolls`;
    } else {
      // Default view — India centered
      url =
        `https://www.google.com/maps/embed/v1/view` +
        `?key=${apiKey}` +
        `&center=20.5937,78.9629` +
        `&zoom=5`;
    }

    setEmbedUrl(url);
  }, [apiKey, source, destination, waypoints]);

  // No API key configured
  if (!apiKey) {
    return (
      <div
        className={`relative w-full h-64 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-2 border ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-400'
            : 'bg-slate-100 border-slate-200 text-slate-500'
        }`}
      >
        <span className="text-4xl">🗺️</span>
        <p className="text-xs font-semibold">No Google Maps API key configured.</p>
        <p className="text-[10px] text-slate-400">Add VITE_GOOGLE_MAPS_API_KEY to your .env file.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      {embedUrl ? (
        <iframe
          title="Google Maps Route"
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading map…</p>
        </div>
      )}

      {/* Route label badge */}
      {source && destination && (
        <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shadow-sm z-10 flex items-center gap-1 max-w-[85%] truncate">
          <span>📍</span>
          <span className="truncate">{source}</span>
          {waypoints && waypoints.map((wp, idx) => (
            <React.Fragment key={idx}>
              <span className="text-slate-400 mx-0.5 shrink-0">→</span>
              <span className="truncate text-slate-500 dark:text-slate-300 font-medium">{wp}</span>
            </React.Fragment>
          ))}
          <span className="text-slate-400 mx-0.5 shrink-0">→</span>
          <span className="truncate">{destination}</span>
        </div>
      )}

      {/* Google Maps attribution */}
      <div className="absolute bottom-0 right-0 z-10 pointer-events-none">
        <div className="text-[8px] text-slate-400 dark:text-slate-600 px-1 py-0.5 bg-white/50 dark:bg-slate-900/50">
          Powered by Google Maps
        </div>
      </div>
    </div>
  );
};

export default MapView;
