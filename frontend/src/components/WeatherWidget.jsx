import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Helper to calculate sub-index for a specific pollutant
const calculateSubIndex = (c, breakpoints) => {
  for (let i = 0; i < breakpoints.length; i++) {
    const { bpLow, bpHigh, iLow, iHigh } = breakpoints[i];
    // Extend bpHigh to next bpLow to avoid gaps for decimals
    const nextBpLow = i < breakpoints.length - 1 ? breakpoints[i+1].bpLow : Infinity;
    if (c >= bpLow && c < nextBpLow) {
      return Math.round(((iHigh - iLow) / (bpHigh - bpLow)) * (c - bpLow) + iLow);
    }
  }
  // If exceeds max breakpoint, return max or extrapolated
  const last = breakpoints[breakpoints.length - 1];
  return Math.round(((last.iHigh - last.iLow) / (last.bpHigh - last.bpLow)) * (c - last.bpLow) + last.iLow);
};

const calculateUSAQI = (components) => {
  if (!components) return null;

  // US EPA AQI Breakpoints
  const pm25Breakpoints = [
    { bpLow: 0.0, bpHigh: 12.0, iLow: 0, iHigh: 50 },
    { bpLow: 12.1, bpHigh: 35.4, iLow: 51, iHigh: 100 },
    { bpLow: 35.5, bpHigh: 55.4, iLow: 101, iHigh: 150 },
    { bpLow: 55.5, bpHigh: 150.4, iLow: 151, iHigh: 200 },
    { bpLow: 150.5, bpHigh: 250.4, iLow: 201, iHigh: 300 },
    { bpLow: 250.5, bpHigh: 350.4, iLow: 301, iHigh: 400 },
    { bpLow: 350.5, bpHigh: 500.4, iLow: 401, iHigh: 500 }
  ];

  const pm10Breakpoints = [
    { bpLow: 0, bpHigh: 54, iLow: 0, iHigh: 50 },
    { bpLow: 55, bpHigh: 154, iLow: 51, iHigh: 100 },
    { bpLow: 155, bpHigh: 254, iLow: 101, iHigh: 150 },
    { bpLow: 255, bpHigh: 354, iLow: 151, iHigh: 200 },
    { bpLow: 355, bpHigh: 424, iLow: 201, iHigh: 300 },
    { bpLow: 425, bpHigh: 504, iLow: 301, iHigh: 400 },
    { bpLow: 505, bpHigh: 604, iLow: 401, iHigh: 500 }
  ];

  const subIndices = [];
  if (components.pm2_5 != null) subIndices.push(calculateSubIndex(components.pm2_5, pm25Breakpoints));
  if (components.pm10 != null) subIndices.push(calculateSubIndex(components.pm10, pm10Breakpoints));
  // Omit NO2/O3 for simpler accurate PM-based US AQI without complex conversion

  if (subIndices.length === 0) return 0;
  
  // The overall AQI is the maximum of the sub-indices
  return Math.max(...subIndices);
};

const getAqiInfo = (aqiValue) => {
  if (aqiValue <= 50) return { label: 'Good', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900', icon: '🟢' };
  if (aqiValue <= 100) return { label: 'Moderate', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-900', icon: '🟡' };
  if (aqiValue <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900', icon: '🟠' };
  if (aqiValue <= 200) return { label: 'Unhealthy', color: 'text-red-600 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900', icon: '🔴' };
  if (aqiValue <= 300) return { label: 'Very Unhealthy', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900', icon: '🟣' };
  return { label: 'Hazardous', color: 'text-rose-900 bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-900', icon: '🟤' };
};

const WeatherWidget = ({ city = 'Delhi' }) => {
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherAndAqi = async () => {
      try {
        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
        if (!apiKey) {
          setLoading(false);
          return;
        }

        // 1. Fetch weather and coordinates for the city
        const weatherRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );
        setWeather(weatherRes.data);

        // 2. Fetch AQI using coordinates from OpenWeatherMap API
        const { lat, lon } = weatherRes.data.coord;
        const aqiRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );
        setAqi({
          level: aqiRes.data.list[0].main.aqi,
          components: aqiRes.data.list[0].components
        });
      } catch (err) {
        console.error('Error fetching weather/AQI:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherAndAqi();
  }, [city]);

  if (loading || !weather || !aqi) {
    return null; // hide if not loaded or failed
  }

  // Use the US AQI calculation derived directly from OpenWeatherMap state components
  const calculatedAqi = calculateUSAQI(aqi?.components) || 50;
  const aqiInfo = getAqiInfo(calculatedAqi);

  return (
    <div className="flex items-center gap-2 hidden sm:flex relative group">
      <span className="text-[10px] font-bold px-2 py-1 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1">
        <span className="text-slate-400 dark:text-slate-500 mr-0.5">📍 {weather.name}</span>
        {Math.round(weather.main.temp)}°C {weather.weather[0]?.main}
      </span>
      <div className="relative flex items-center">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border cursor-help ${aqiInfo.color}`}>
          AQI {calculatedAqi}: {aqiInfo.label}
        </span>

      </div>
    </div>
  );
};

export default WeatherWidget;
