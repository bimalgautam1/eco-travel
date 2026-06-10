import React from 'react';

const LoadingSpinner = ({ message = 'Calculating optimal commute paths...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative w-16 h-16">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10 animate-ping"></div>
        {/* Spinning gradient ring */}
        <div className="w-16 h-16 rounded-full border-4 border-t-emerald-500 border-r-teal-400 border-b-transparent border-l-transparent animate-spin"></div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-500 animate-pulse">{message}</p>
        <p className="text-xs text-slate-400 mt-1">Comparing costs, times, and carbon footprints across India...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
