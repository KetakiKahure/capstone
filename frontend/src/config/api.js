// API configuration
// In production, this should be set via environment variable VITE_API_URL
// For local development, defaults to localhost:5000/api
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://your-backend-url.com/api'  // Update this with your production backend URL
    : 'http://localhost:5000/api');

// Helper function to get auth token
export const getAuthToken = () => {
  try {
    const authData = localStorage.getItem('focuswave-auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.state?.token || parsed.token;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return null;
};

// Helper function to make API requests
export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Handle body - stringify if it's an object
  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }

  const config = {
    method: options.method || 'GET',
    headers,
    ...(body && { body }),
  };

  try {
    console.log(`🌐 API Request: ${config.method} ${API_BASE_URL}${endpoint}`, body ? JSON.parse(body) : '');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle non-JSON responses
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      console.error(`❌ API Error (${response.status}):`, data);
      throw new Error(data.message || data.error || 'Request failed');
    }

    console.log(`✅ API Response: ${config.method} ${endpoint}`, data);
    return data;
  } catch (error) {
    // Enhanced error handling for network/CORS issues
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error(`❌ Network error for ${endpoint}:`, error.message);
      console.error(`❌ Check if backend is running on ${API_BASE_URL}`);
      throw new Error(`Failed to connect to server. Please ensure the backend is running on ${API_BASE_URL.replace('/api', '')}`);
    }
    console.error(`❌ API request error for ${endpoint}:`, error.message);
    throw error;
  }
};

