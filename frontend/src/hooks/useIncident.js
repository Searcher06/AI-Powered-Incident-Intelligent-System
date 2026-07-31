import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getIncident,
  getIncidentReports,
  getIncidentTimeline,
  getIncidentBriefing,
} from '../api/incidents.api';

const POLL_INTERVAL_MS = 5000;  // check every 5 seconds
const MAX_POLL_ATTEMPTS = 12;   // stop after 60 seconds (12 × 5s)

const useIncident = (id) => {
  const [incident, setIncident] = useState(null);
  const [reports, setReports] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [briefing, setBriefing] = useState(null);
  const [briefingPending, setBriefingPending] = useState(false); // true = gave up polling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);
  const pollCountRef = useRef(0);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    pollCountRef.current = 0;
  };

  const fetchAll = useCallback(async () => {
    if (!id) return;
    stopPolling();
    setLoading(true);
    setError(null);
    setBriefingPending(false);
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

  // Poll for briefing every 5s, max 12 attempts (60s total), then give up
  const pollBriefing = useCallback(async () => {
    if (!id) return;

    pollCountRef.current += 1;

    // Give up after MAX_POLL_ATTEMPTS
    if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
      console.log('[useIncident] Briefing not ready after 60s, stopping poll.');
      stopPolling();
      setBriefingPending(true); // tell UI to show "still processing" message
      return;
    }

    try {
      const data = await getIncidentBriefing(id).catch(() => null);
      if (data?.briefing) {
        setBriefing(data.briefing);
        setBriefingPending(false);
        // Also refresh timeline
        const timelineData = await getIncidentTimeline(id).catch(() => null);
        if (timelineData) setTimeline(timelineData.events || []);
        stopPolling();
      }
    } catch (_) {
      // silent
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Start polling only when: loaded, no briefing yet, not given up
  useEffect(() => {
    if (loading) return;
    if (briefing) { stopPolling(); return; }
    if (briefingPending) return;

    // Start the poll interval
    pollCountRef.current = 0;
    pollRef.current = setInterval(pollBriefing, POLL_INTERVAL_MS);

    return () => stopPolling();
  }, [loading, briefing, briefingPending, pollBriefing]);

  return {
    incident, reports, timeline, briefing, briefingPending,
    loading, error, refetch: fetchAll,
  };
};

export default useIncident;
