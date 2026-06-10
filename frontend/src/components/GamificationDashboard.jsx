import React from 'react';

// Full list of badges for visual display (unlocked will be highlighted, locked will be grayscale)
const ALL_BADGES = [
  { id: 'first_commute', name: '🌱 Green Pioneer', desc: 'Logged your very first green commute on EcoRoute.', icon: '🌱', bg: 'from-emerald-500 to-teal-500' },
  { id: 'streak_3', name: '🔥 Flame Commuter', desc: 'Maintained a 3-day active streak of green commutes.', icon: '🔥', bg: 'from-amber-500 to-red-500' },
  { id: 'carbon_hero_10', name: '🌳 CO₂ Hero', desc: 'Saved 10 kg or more of cumulative CO₂ emissions.', icon: '🌳', bg: 'from-green-500 to-emerald-600' },
  { id: 'budget_king', name: '🪙 Wealth Wise', desc: 'Commuted on public transit or walking costing under ₹100.', icon: '🪙', bg: 'from-amber-400 to-yellow-500' }
];

const GamificationDashboard = ({ user, history }) => {
  const points = user?.points || 0;
  const streak = user?.streak || 0;
  const unlockedBadges = user?.badges || [];

  // Calculate progressive Level
  const calculateLevelInfo = (totalPoints) => {
    let level = 1;
    let pointsNeededForNext = 100;
    let currentLevelPoints = totalPoints;

    while (currentLevelPoints >= pointsNeededForNext) {
      currentLevelPoints -= pointsNeededForNext;
      level++;
      pointsNeededForNext = Math.floor(pointsNeededForNext * 1.5);
    }

    return {
      userLevel: level,
      levelProgress: currentLevelPoints,
      nextLevelTarget: pointsNeededForNext
    };
  };

  const { userLevel, levelProgress, nextLevelTarget } = calculateLevelInfo(points);

  // Calculate spending analytics
  const totalSpent = history.reduce((sum, item) => sum + item.cost, 0);
  
  // Spend breakdown per mode
  const spendByMode = { auto: 0, bus: 0, metro: 0, bike: 0, walk: 0 };
  history.forEach(trip => {
    const mode = trip.mode.toLowerCase();
    const cost = parseFloat(trip.cost) || 0;
    if (spendByMode[mode] !== undefined) {
      spendByMode[mode] += cost;
    } else if (mode.includes('combo') || mode.includes('metro')) {
      // Catch combo modes in metro/auto
      spendByMode.metro += cost;
    }
  });

  // Calculate money saved compared to a standard private cab baseline (e.g. ₹50 base + ₹18/km)
  const estimatedSavings = history.reduce((sum, trip) => {
    const cabBaseline = 50 + (trip.distance * 18);
    const savings = cabBaseline - trip.cost;
    return sum + (savings > 0 ? savings : 0);
  }, 0);

  // Determine percentages for spending chart
  const maxSpend = Math.max(...Object.values(spendByMode), 1);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Achievements &amp; Analytics</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Collect badges, track commute streaks, and review your transport spending insights.
        </p>
      </div>

      {/* Grid: Streaks & Levels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Streak Card */}
        <div className="bg-gradient-to-tr from-amber-600 to-orange-500 p-6 rounded-2xl border border-orange-400/20 text-white shadow-lg shadow-orange-500/10 relative overflow-hidden">
          <div className="absolute right-3 bottom-1 text-8xl opacity-15 pointer-events-none">🔥</div>
          <span className="text-2xl">🔥</span>
          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-orange-100 mt-2">Active Commute Streak</h4>
          <p className="text-3xl font-black mt-1">{streak} {streak === 1 ? 'Day' : 'Days'}</p>
          <p className="text-xs text-orange-50 font-medium mt-1">
            {streak > 0 ? 'Keep commuting green daily to grow!' : 'Log a commute to start your streak!'}
          </p>
        </div>

        {/* Level Progression */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Green Commuter Rank</h4>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-0.5">Level {userLevel}</p>
              </div>
              <span className="text-2xl">🏆</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{points} Total points scored</p>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
              <span>Progress to Level {userLevel + 1}</span>
              <span>{levelProgress}/{nextLevelTarget} XP</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                style={{ width: `${(levelProgress / nextLevelTarget) * 100}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-3xl shrink-0">
              🪙
            </div>
            <div>
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Spent on Transit</h4>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-0.5">₹{totalSpent.toFixed(0)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Across logged trips</p>
            </div>
          </div>

          <div className="mt-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl px-3 py-1.5 border border-emerald-100 dark:border-emerald-900/40 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex justify-between">
            <span>Estimated Savings:</span>
            <span>Saved ~₹{estimatedSavings.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Grid: Badges & Spending Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Badges System */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-7">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-5">
            🏅 Unlocked Achievements ({unlockedBadges.length} / {ALL_BADGES.length})
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ALL_BADGES.map(badge => {
              const isUnlocked = unlockedBadges.includes(badge.id);
              return (
                <div 
                  key={badge.id}
                  className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                    isUnlocked 
                      ? 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700' 
                      : 'bg-slate-50/30 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 opacity-40 grayscale select-none'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${isUnlocked ? badge.bg : 'from-slate-200 to-slate-300'} text-white flex items-center justify-center text-2xl shrink-0 shadow-sm`}>
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      {badge.name}
                      {isUnlocked && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900">Unlocked</span>}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium leading-normal">{badge.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spending Analytics */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-5">
            📊 Transport Spending Breakdown
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'auto', label: '🛺 Auto Rickshaw', val: spendByMode.auto, color: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-700 dark:text-amber-400' },
              { id: 'bus', label: '🚌 City Bus', val: spendByMode.bus, color: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-700 dark:text-blue-400' },
              { id: 'metro', label: '🚇 Metro Train', val: spendByMode.metro, color: 'bg-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-700 dark:text-purple-400' },
              { id: 'bike', label: '🏍️ Two-Wheeler', val: spendByMode.bike, color: 'bg-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/20', text: 'text-cyan-700 dark:text-cyan-400' },
              { id: 'walk', label: '🚶 Walk', val: 'Free', color: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-700 dark:text-emerald-400' },
            ].map(mode => (
              <div key={mode.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${mode.bg}`}>
                    {mode.label.split(' ')[0]}
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{mode.label.substring(mode.label.indexOf(' ') + 1)}</h4>
                    <span className={`text-lg font-black ${mode.text}`}>
                      {mode.val === 'Free' ? 'Free' : `₹${mode.val.toFixed(0)}`}
                    </span>
                  </div>
                  {mode.val !== 'Free' && (
                    <div className="mt-1 h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${(mode.val / maxSpend) * 100}%` }}
                        className={`h-full ${mode.color} transition-all duration-500`}
                      />
                    </div>
                  )}
                  {mode.val === 'Free' && (
                    <div className="mt-1 h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-emerald-500 transition-all duration-500" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationDashboard;
