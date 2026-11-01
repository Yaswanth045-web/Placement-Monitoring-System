// Centralized API configuration for PlacementPulse
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_BASE = rawBase.replace(/\/+$/, '');

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
