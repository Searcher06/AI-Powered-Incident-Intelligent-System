import client from './client';

export const getActivityFeed = async (params = {}) => {
  const { data } = await client.get('/feed', { params });
  return data; // { events, pagination }
};

export const getReportsFeed = async (params = {}) => {
  const { data } = await client.get('/feed/reports', { params });
  return data; // { reports, pagination }
};
