import { useState, useEffect, useCallback } from 'react';
import {
  getIncident,
  getIncidentReports,
  getIncidentTimeline,
  getIncidentBriefing,
} from '../api/incidents.api';

const useIncident = (id) => {
  const [incident, setIncident] = useState(null);
  const [reports, setReports] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [incidentData, reportsData, timelineData, briefingData] = await Promise.all([
        getIncident(id),
        getIncidentReports(id),
        getIncidentTimeline(id),
        getIncidentBriefing(id).catch(() => null), // briefing may not exist yet
      ]);
      setIncident(incidentData.incident || incidentData);
      setReports(reportsData.reports || []);
      setTimeline(timelineData.events || timelineData.timeline || []);
      setBriefing(briefingData?.briefing || null);
    } catch (err) {
      setError(err.message || 'Failed to load incident');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { incident, reports, timeline, briefing, loading, error, refetch: fetchAll };
};

export default useIncident;
