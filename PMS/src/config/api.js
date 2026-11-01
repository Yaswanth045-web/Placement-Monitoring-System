
// Centralized API configuration for PlacementPulse

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  // When running on deployed environments (like Vercel), route to relative /api on current origin
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5000/api';
};

export const API_BASE = getApiBase();

export const API_ENDPOINTS = {
  health: `${API_BASE}/health`,
  students: `${API_BASE}/students`,
  companies: `${API_BASE}/companies`,
  applications: `${API_BASE}/applications`,

  auth: {
    signup: `${API_BASE}/auth/signup`,
    login: `${API_BASE}/auth/login`,
    me: `${API_BASE}/auth/me`,
    profile: `${API_BASE}/auth/profile`,
  },
};

export default API_ENDPOINTS;
