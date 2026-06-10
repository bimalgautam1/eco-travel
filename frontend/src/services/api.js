import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecoroute_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * Compares commute modes for a route.
 *
 * @param {string} source
 * @param {string} destination
 * @param {string} city
 * @param {object|null} routeData - Pre-fetched Google Maps route data from the browser.
 *   If provided, the backend will use these real values instead of its server-side mock fallback.
 *   Shape: { distance: number, duration: number, durationByMode: { auto, bike, bus, metro, walk } }
 */
export const getCompareRoutes = async (source, destination, city = 'Delhi', routeData = null, waypoints = []) => {
  const params = { source, destination, city };

  if (waypoints && waypoints.length > 0) {
    params.waypoints = JSON.stringify(waypoints);
  }

  if (routeData) {
    params.distance = routeData.distance;
    params.baseDuration = routeData.duration;
    // JSON-encode the durationByMode map so it survives as a query param
    params.durationByMode = JSON.stringify(routeData.durationByMode);
  }

  const response = await api.get('/api/compare', { params });
  return response.data;
};

export const submitFeedback = async (feedbackData) => {
  const response = await api.post('/api/feedback', feedbackData);
  return response.data;
};

export const getMapsKey = async () => {
  const response = await api.get('/api/config/maps-key');
  return response.data;
};

export const saveTravel = async (travelData) => {
  const response = await api.post('/api/travel', travelData);
  return response.data;
};

export const getTravelHistory = async () => {
  const response = await api.get('/api/travel/history');
  return response.data;
};

export default {
  getCompareRoutes,
  submitFeedback,
  getMapsKey,
  saveTravel,
  getTravelHistory,
};
