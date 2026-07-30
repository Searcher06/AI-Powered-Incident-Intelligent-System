import { useState, useEffect, useCallback, useRef } from 'react';
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
  const pollRef = useRef(null);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [incidentData, reportsData, timelineData, briefingData] = await Promise.all([
        getIncident(id),
        getIncidentReports(id),
        getIncidentTimeline(id),
        getIncidentBriefing(id).catch(() => null),
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

  // Poll briefing every 4s until it exists, then stop
  const pollBriefing = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getIncidentBriefing(id).catch(() => null);
      if (data?.briefing) {
        setBriefing(data.briefing);
        // Also refresh timeline since briefing_updated event may have fired
        const timelineData = await getIncidentTimeline(id).catch(() => null);
        if (timelineData) setTimeline(timelineData.events || []);
        // Stop polling
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    } catch (_) {
      // silent — keep polling
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Start polling when briefing is null, stop when it arrives
  useEffect(() => {
    if (briefing) {
      // Already have it — clear any existing poll
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    // No briefing yet — start polling every 4 seconds
    if (!loading && !briefing && id) {
      pollRef.current = setInterval(pollBriefing, 4000);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [briefing, loading, id, pollBriefing]);

  return { incident, reports, timeline, briefing, loading, error, refetch: fetchAll };
};

export default useIncident;
