import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Persist dark mode preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-16 relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-10 left-0 w-[600px] h-[600px] bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-[140px] -z-10" />
      </div>

      {/* Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
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
                Smart Commute Decision Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer transition-colors"
              title="Toggle theme"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* Auth navigation links */}
            {user ? (
              <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-3">
                <Link
                  to="/dashboard"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="bg-slate-100 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-red-950/40 dark:hover:text-red-400 text-slate-600 dark:text-slate-400 text-xs font-bold px-3 py-2 rounded-xl transition-all border border-slate-200 dark:border-slate-700/60 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 transition-colors cursor-pointer"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-900 text-emerald-700 dark:text-emerald-455 text-xs font-semibold uppercase tracking-wider">
              ⚡ India's First Commute Emission Engine
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-slate-900 dark:text-white">
              Track your carbon footprint, <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Optimize your commutes.
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Compare transit modes in real time. Compare Auto, Bike, Bus, Metro, and Walking on cost, time, and carbon impact. Take control of your daily commute footprint.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all hover:-translate-y-0.5 text-center"
                >
                  Go to dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all hover:-translate-y-0.5 text-center cursor-pointer"
                  >
                    Track Carbon Footprint Now
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-extrabold px-8 py-4 rounded-2xl transition-all text-center cursor-pointer"
                  >
                    Partner Login
                  </Link>
                </>
              )}
            </div>

            {/* Stats info */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-200 dark:border-slate-800 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">45%</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">CO₂ reduction</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">10k+</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Commutes compared</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">₹0</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Always free</p>
              </div>
            </div>
          </div>

          {/* Right graphic panel */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative mx-auto max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-150 dark:border-slate-800 space-y-6">
              {/* Fake visual elements representing comparisons */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">🏆 Best Eco Option</span>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-900">Metro + Walk</span>
              </div>

              {/* Commute Option 1 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg">🚇</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">Metro Rail</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">24 mins · High efficiency</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">-72% CO₂</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">₹35 approx</p>
                </div>
              </div>

              {/* Commute Option 2 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg">🚗</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">Cabs &amp; Rides</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">42 mins · Traffic delays</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-red-500">+180% CO₂</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">₹320 approx</p>
                </div>
              </div>

              {/* Mini Carbon Factor Chart */}
              <div className="pt-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">
                  <span>Carbon Factor intensity</span>
                  <span>gCO2 / km</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-[9px] font-bold">Bus</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '30%' }} />
                    </div>
                    <span className="text-[9px] font-semibold text-slate-500">22g</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-[9px] font-bold">Auto</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: '65%' }} />
                    </div>
                    <span className="text-[9px] font-semibold text-slate-500">68g</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-[9px] font-bold">Cab</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: '90%' }} />
                    </div>
                    <span className="text-[9px] font-semibold text-slate-500">114g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ambient bubble decoration */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-teal-500/20 rounded-full blur-xl -z-10" />
          </div>
        </div>
      </main>
    </div>
  );
}
