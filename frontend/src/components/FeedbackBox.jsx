import React, { useState } from 'react';
import { submitFeedback } from '../services/api';

const FeedbackBox = ({ source, destination, city, distance, modes }) => {
  const [selectedMode, setSelectedMode] = useState('');
  const [isCorrect, setIsCorrect] = useState(null); // null, 'yes', 'no'
  const [actualFare, setActualFare] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Filter out Walk as it has no fare to give feedback on (always ₹0)
  const fareModes = modes.filter((m) => m.mode.toLowerCase() !== 'walk');

  const handleSelectMode = (modeName) => {
    setSelectedMode(modeName);
    setIsCorrect(null);
    setActualFare('');
    setIsSuccess(false);
    setErrorMessage('');
  };

  const currentModeData = modes.find(
    (m) => m.mode.toLowerCase() === selectedMode.toLowerCase()
  );
  const estimatedFare = currentModeData ? currentModeData.cost : 0;

  const handleSubmit = async (e, actualOverride) => {
    if (e) e.preventDefault();

    setIsSubmitting(true);
    setErrorMessage('');

    const farePaid = actualOverride !== undefined ? actualOverride : parseFloat(actualFare);

    if (isNaN(farePaid) || farePaid < 0) {
      setErrorMessage('Please enter a valid fare amount.');
      setIsSubmitting(false);
      return;
    }

    try {
      await submitFeedback({
        source,
        destination,
        mode: selectedMode,
        distance: parseFloat(distance),
        estimatedFare: parseFloat(estimatedFare),
        actualFare: parseFloat(farePaid),
        city,
      });

      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.error || 'Failed to submit feedback. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleYes = () => {
    setIsCorrect('yes');
    handleSubmit(null, estimatedFare);
  };

  const handleNo = () => {
    setIsCorrect('no');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-100 dark:shadow-none p-6 border border-slate-100 dark:border-slate-800">
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
        <span>💬</span> Improve Our Fare Engine
      </h2>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
        Indian transport fares vary by traffic and demand. Help us refine our pricing model.
      </p>

      {/* 1. Select Mode */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Select the mode you commuted in:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {fareModes.map((m) => (
            <button
              key={m.mode}
              type="button"
              onClick={() => handleSelectMode(m.mode)}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border capitalize transition-all cursor-pointer ${
                selectedMode === m.mode
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {m.mode}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Ask Correctness */}
      {selectedMode && !isSuccess && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Was the estimated fare of{' '}
            <strong className="text-slate-800 dark:text-slate-100">₹{parseFloat(estimatedFare).toFixed(0)}</strong>{' '}
            for <span className="capitalize font-semibold">{selectedMode}</span> correct?
          </p>

          {isCorrect === null && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleYes}
                disabled={isSubmitting}
                className="flex-1 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                👍 Yes, correct
              </button>
              <button
                type="button"
                onClick={handleNo}
                disabled={isSubmitting}
                className="flex-1 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                👎 No, incorrect
              </button>
            </div>
          )}

          {/* 3. If incorrect, get actual fare */}
          {isCorrect === 'no' && (
            <form onSubmit={(e) => handleSubmit(e)} className="mt-4 space-y-3 animate-slideDown">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Enter actual fare paid (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={actualFare}
                    onChange={(e) => setActualFare(e.target.value)}
                    placeholder="e.g. 150"
                    disabled={isSubmitting}
                    required
                    min="0"
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="text-xs font-semibold text-red-500 dark:text-red-400">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !actualFare}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Fare Correction'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Success Message */}
      {isSuccess && (
        <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-xl text-center animate-fadeIn">
          <p className="text-emerald-800 dark:text-emerald-300 font-bold text-sm">🌱 Thanks! We are improving our estimates.</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            Our pricing engine has updated the rate parameters for this route.
          </p>
        </div>
      )}
    </div>
  );
};

export default FeedbackBox;
