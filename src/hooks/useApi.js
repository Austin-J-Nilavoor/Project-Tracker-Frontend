import { useState, useCallback, useEffect } from 'react';
import api from '../services/api'; 

/**
 * Custom hook for making API requests (primarily GET) with built-in
 * loading, error, and data state management.
 * @param {string} url - The API endpoint URL (e.g., '/projects').
 * @param {boolean} [initialLoad=false] - If true, fetches data immediately on mount.
 * @param {object} [config={}] - Additional Axios configuration.
 */
export const useApi = (url, initialLoad = false, config = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(initialLoad);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (method = 'GET', payload = null) => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.request({
          url,
          method,
          data: payload,
          ...config, // Merge optional config
        });

        // Assuming your backend uses ApiResponse<T> DTO and returns data in the 'data' field
        // Example DTO: ApiResponse<T> { data: T, success: boolean, ... }
        const result = response.data.data; 
        
        setData(result);
        return result;

      } catch (err) {
        // Extract the error message from the nested ApiResponse structure if available
        const errorMsg = err.response?.data?.message || err.message || 'An unknown API error occurred.';
        setError(errorMsg);
        setData(null);
        return Promise.reject(err);
      } finally {
        setLoading(false);
      }
    },
    [url, config]
  );

  // Auto-fetch data if initialLoad is true
  useEffect(() => {
    if (initialLoad) {
      execute('GET');
    }
  }, [initialLoad, execute]);

  // Export utility functions for manual calls (POST, PUT, DELETE)
  const get = useCallback(() => execute('GET'), [execute]);
  const post = useCallback((payload) => execute('POST', payload), [execute]);
  const put = useCallback((payload) => execute('PUT', payload), [execute]);
  const del = useCallback((payload) => execute('DELETE', payload), [execute]);


  return { 
    data, 
    loading, 
    error, 
    execute,
    get, 
    post, 
    put, 
    del 
  };
};