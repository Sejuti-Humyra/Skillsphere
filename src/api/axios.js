import axios from 'axios';

// Get base URL with fallbacks
const getBaseURL = () => {
  // Check for Vite environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check for development mode
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:5000/api';
  }
  
  // Production fallback
  return '/api';
};

const baseURL = getBaseURL();
console.log('🔧 API Configuration:', {
  baseURL,
  mode: import.meta.env.MODE,
  viteUrl: import.meta.env.VITE_API_URL
});

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
  withCredentials: true, // Include cookies if needed
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('📤 Outgoing Request:', {
      method: config.method?.toUpperCase(),
      url: config.baseURL + config.url,
      hasToken: !!token
    });
    
    return config;
  },
  (error) => {
    console.error('💥 Request Setup Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ Incoming Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('💥 Response Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.baseURL + error.config?.url,
      code: error.code
    });
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - redirect to login');
      localStorage.removeItem('token');
      // You can redirect to login page here if needed
    }
    
    return Promise.reject(error);
  }
);

export default api;