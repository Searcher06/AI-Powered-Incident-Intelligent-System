import { useState, useEffect, useCallback } from 'react';
import { getStats, getIncidents } from '../api/incidents.api';

const useIncidents = (params = {}) => {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, incidentsData] = await Promise.all([
        getStats(),
        getIncidents(params),
      ]);
      setStats(statsData);
      setIncidents(incidentsData.incidents || []);
      setPagination(incidentsData.pagination || null);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { stats, incidents, pagination, loading, error, refetch: fetchAll };
};

export default useIncidents;
