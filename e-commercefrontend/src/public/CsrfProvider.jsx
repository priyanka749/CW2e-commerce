
import axios from 'axios';
import React, { createContext, useEffect, useMemo, useState } from 'react';


export const CsrfContext = createContext();

// Custom hook to use CSRF context
export function useCsrf() {
  const context = React.useContext(CsrfContext);
  if (!context) {
    throw new Error('useCsrf must be used within a CsrfProvider');
  }
  return context;
}

export default function CsrfProvider({ children }) {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    axios.get('https://localhost:3000/api/csrf-token', { withCredentials: true })
      .then(res => setCsrfToken(res.data.csrfToken));
  }, []);

  // Only create the Axios instance once
  const api = useMemo(() => {
    const instance = axios.create({ withCredentials: true });
    // Attach latest CSRF token to every request
    instance.interceptors.request.use(
      config => {
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }
        // Attach access token if present
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor for token refresh
    instance.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        // Only try refresh if 401 and not already retried
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            // Call refresh endpoint
            const refreshRes = await axios.post('https://localhost:3000/api/users/refresh-token', {}, { withCredentials: true });
            const newToken = refreshRes.data.token;
            if (newToken) {
              console.log('Access token refreshed!');
              localStorage.setItem('token', newToken);
              // Update Authorization header and retry original request
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return instance(originalRequest);
            }
          } catch (refreshError) {
            // If refresh fails, clear token and reject
            localStorage.removeItem('token');
          }
        }
        return Promise.reject(error);
      }
    );
    return instance;
  }, [csrfToken]);

  return (
    <CsrfContext.Provider value={{ csrfToken, api }}>
      {children}
    </CsrfContext.Provider>
  );
}
