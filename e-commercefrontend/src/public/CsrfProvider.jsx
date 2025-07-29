
import axios from 'axios';
import React, { createContext, useEffect, useMemo, useState } from 'react';


export const CsrfContext = createContext();

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

  const api = useMemo(() => {
    const instance = axios.create({ withCredentials: true });
 
    instance.interceptors.request.use(
      config => {
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }
      
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    instance.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
     
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
         
            const refreshRes = await axios.post('https://localhost:3000/api/users/refresh-token', {}, { withCredentials: true });
            const newToken = refreshRes.data.token;
            if (newToken) {
              console.log('Access token refreshed!');
              localStorage.setItem('token', newToken);
            
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return instance(originalRequest);
            }
          } catch (refreshError) {
    
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
