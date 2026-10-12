import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  withCredentials: true, // Crucial: sends & receives httpOnly cookies across origins
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;