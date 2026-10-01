import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

/**
 * Custom hook for fetching data with loading/error states
 * @param {string} url - API endpoint
 * @param {object} options - { immediate: true/false }
 */
export const useFetch = (url, options = {}) => {
  const { immediate = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data: response } = await API.get(url, { params });
      setData(response.data || response);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return { data, loading, error, refetch: fetchData, setData };
};
