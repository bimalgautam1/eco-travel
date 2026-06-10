import React, { useState, useEffect } from 'react';
import SearchBox from '../components/SearchBox';
import ResultsPanel from '../components/ResultsPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import MapView from '../components/MapView';
import TravelHistory from '../components/TravelHistory';
import ImpactDashboard from '../components/ImpactDashboard';
import GamificationDashboard from '../components/GamificationDashboard';
import WeatherWidget from '../components/WeatherWidget';
import { getCompareRoutes, getMapsKey, getTravelHistory } from '../services/api';
import { loadGoogleMaps } from '../utils/googleMapsLoader';
import { fetchAllModeDistances } from '../utils/mapsDistanceService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('commute');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapsApiKey, setMapsApiKey] = useState('');
  const [mapsSDK, setMapsSDK] = useState(null); // loaded google.maps instance
  const [routeData, setRouteData] = useState(null); // last fetched route (for MapView)
  
  // Shared travel history state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError('');
      const data = await getTravelHistory();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Error fetching travel history:', err);
      setHistoryError('Failed to load travel history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Resolve Google Maps API key (backend → Vite env fallback)
  useEffect(() => {
    const viteKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    getMapsKey()
      .then((data) => {
        const key = (data && data.apiKey) ? data.apiKey : viteKey;
        setMapsApiKey(key || viteKey);
      })
      .catch(() => {
        setMapsApiKey(viteKey);
      });
  }, []);

  // Pre-load the Google Maps JS SDK as soon as we have the key
  useEffect(() => {
    if (!mapsApiKey) return;
    loadGoogleMaps(mapsApiKey)
      .then((maps) => setMapsSDK(maps))
      .catch((err) => console.warn('[Dashboard] Maps SDK load failed:', err.message));
  }, [mapsApiKey]);

  // Persist dark mode preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleSearch = async ({ source, destination, city, waypoints = [] }) => {
    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      // Step 1: Fetch real route data from Google Maps JS SDK (browser-side)
      let fetchedRouteData = null;
      if (mapsSDK) {
        try {
          fetchedRouteData = await fetchAllModeDistances(source, destination, mapsSDK);
          if (fetchedRouteData) {
            console.log('[Dashboard] ✅ Real Google Maps distances fetched:', fetchedRouteData);
          } else {
            console.warn('[Dashboard] ⚠️ Distance Matrix returned no data. Backend will use fallback.');
          }
        } catch (distErr) {
          console.warn('[Dashboard] Distance fetch error (non-fatal):', distErr.message);
        }
      }

      // Step 2: Call backend with real route data and waypoints
      const data = await getCompareRoutes(source, destination, city, fetchedRouteData, waypoints);

      setRouteData({ source, destination, waypoints });
      setResults({
        ...data,
        city: city || data.city || 'Delhi',
        waypoints: waypoints
      });
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
        'Could not connect to commute engine. Please verify the backend is running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-16">
      {/* Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-bold text-xl">
              🌱
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100 leading-none">
                EcoRoute <span className="text-emerald-600 dark:text-emerald-400">India</span>
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
                Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <WeatherWidget city={routeData?.source || results?.city || 'Delhi'} />
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border hidden sm:inline-block ${
                mapsSDK
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900'
              }`}
            >
              {mapsSDK ? '🗺️ Maps Live' : '🗺️ Maps Loading…'}
            </span>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer transition-colors"
              title="Toggle theme"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* User Profile Info and Logout */}
            {user && (
              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name}</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">XP: {user.points || 0} • 🔥 {user.streak || 0}</span>
                </div>
                <button
                  onClick={logout}
                  id="logout-btn"
                  className="bg-slate-100 hover:bg-red-50 hover:text-red-650 dark:bg-slate-800 dark:hover:bg-red-950/40 dark:hover:text-red-405 text-slate-600 dark:text-slate-400 text-xs font-bold px-3 py-2 rounded-xl transition-all border border-slate-200 dark:border-slate-700/60 cursor-pointer"
                  title="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 lg:mt-8 animate-fadeIn pb-6">
        {/* Intro Tagline */}
        <div className="text-center max-w-2xl mx-auto mb-6 lg:mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex flex-wrap justify-center gap-1.5">
            Optimize India's commutes for
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Cost, Time &amp; CO₂
            </span>
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
            Welcome back, <span className="font-semibold text-slate-600 dark:text-slate-300">{user?.name}</span>! Compare paths, rates, and carbon estimates.
          </p>
        </div>

        {/* Mobile Tab Bar (hidden on lg+) */}
        <div className="flex lg:hidden gap-1 mb-5 bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('commute')}
            className={`flex-1 min-w-[75px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'commute'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span>🧭</span> Commute
          </button>
          <button
            onClick={() => setActiveTab('impact')}
            className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'impact'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span>🌱</span> Impact
          </button>
          <button
            onClick={() => setActiveTab('gamification')}
            className={`flex-1 min-w-[85px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'gamification'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span>🏆</span> Rewards
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 min-w-[75px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span>📜</span> History
          </button>
        </div>

        {/* Desktop: Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Sidebar (desktop only) */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-5 border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                📂 Navigation
              </h3>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('commute')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'commute'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/10'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">🧭</span><span>Commute Finder</span>
                </button>
                <button
                  onClick={() => setActiveTab('impact')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'impact'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/10'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">🌱</span><span>Environmental Impact</span>
                </button>
                <button
                  onClick={() => setActiveTab('gamification')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'gamification'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/10'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">🏆</span><span>Achievements &amp; Stats</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/10'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">📜</span><span>Travel History</span>
                </button>
              </nav>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-5 border border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                ⚙️ Engine parameters
              </h3>
              <ul className="space-y-2.5 text-xs">
                <li className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Data source:</span>
                  <span className={`font-mono px-2 py-0.5 rounded font-semibold ${mapsSDK ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'}`}>
                    {mapsSDK ? 'Google Maps API' : 'Loading…'}
                  </span>
                </li>
                <li className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Carbon factors:</span>
                  <span className="font-mono bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded text-emerald-600 font-semibold">100% active</span>
                </li>
                <li className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Feedback learning:</span>
                  <span className="font-mono bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded text-teal-600 font-semibold">Loop enabled</span>
                </li>
                <li className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Supported cities:</span>
                  <span className="font-mono bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-medium">Delhi, Bangalore</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-9">
            {activeTab === 'commute' && (
              <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start animate-fadeIn">
                <div className="w-full lg:col-span-4">
                  <SearchBox onSearch={handleSearch} isLoading={isLoading} />
                </div>
                <div className="w-full lg:col-span-8">
                  {isLoading && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800 min-h-[300px] flex items-center justify-center">
                      <LoadingSpinner />
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 text-center animate-fadeIn">
                      <span className="text-4xl">⚠️</span>
                      <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mt-2">Connection Error</h3>
                      <p className="text-sm text-red-600 dark:text-red-300 mt-1 max-w-md mx-auto">{error}</p>
                      <button onClick={() => handleSearch({ source: 'Connaught Place', destination: 'India Gate', city: 'Delhi' })} className="mt-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer transition-all">
                        Retry Demo Connection
                      </button>
                    </div>
                  )}
                  {!isLoading && !error && !results && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                      <div className="p-4 pb-2">
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">🗺️ Live Map</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${mapsApiKey ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900'}`}>
                            {mapsApiKey ? 'Google Maps ✓' : 'No API Key'}
                          </span>
                        </div>
                        <MapView source={null} destination={null} apiKey={mapsApiKey} isDarkMode={isDarkMode} />
                      </div>
                      <div className="px-4 pb-5 pt-2 text-center">
                        <h3 className="text-base font-extrabold text-slate-700 dark:text-slate-200">Ready for Commute Comparison</h3>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Enter your source and destination above.</p>
                      </div>
                    </div>
                  )}
                  {!isLoading && !error && results && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">🗺️ Route Map</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-emerald-600 dark:text-emerald-400">📍 {results.distance} km</span>
                            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-mono font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">Google Maps ✓</span>
                          </div>
                        </div>
                        <MapView source={results.source} destination={results.destination} apiKey={mapsApiKey} isDarkMode={isDarkMode} waypoints={results.waypoints || []} />
                      </div>
                      <ResultsPanel results={results} onTravelSaved={async () => { await fetchHistory(); if (refreshUser) await refreshUser(); setActiveTab('history'); }} />
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'impact' && (
              <ImpactDashboard history={history} />
            )}
            {activeTab === 'gamification' && (
              <GamificationDashboard user={user} history={history} />
            )}
            {activeTab === 'history' && (
              <TravelHistory history={history} isLoading={historyLoading} error={historyError} onRefresh={fetchHistory} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
