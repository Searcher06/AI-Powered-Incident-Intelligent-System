import client from './client';

export const getStats = async () => {
  const { data } = await client.get('/incidents/stats');
  return data;
};

export const getIncidents = async (params = {}) => {
  const { data } = await client.get('/incidents', { params });
  return data;
};

export const getIncident = async (id) => {
  const { data } = await client.get(`/incidents/${id}`);
  return data;
};

export const getIncidentReports = async (id, params = {}) => {
  const { data } = await client.get(`/incidents/${id}/reports`, { params });
  return data;
};

export const getIncidentTimeline = async (id) => {
  const { data } = await client.get(`/incidents/${id}/timeline`);
  return data;
};

export const getIncidentBriefing = async (id) => {
  const { data } = await client.get(`/incidents/${id}/briefing`);
  return data;
};

export const updateIncidentStatus = async (id, status) => {
  const { data } = await client.patch(`/incidents/${id}/status`, { status });
  return data;
};
