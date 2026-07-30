import { formatDistanceToNow, parseISO } from 'date-fns';

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '—';
  }
};

export const formatConfidence = (num) => {
  if (num === null || num === undefined) return '—';
  const pct = typeof num === 'number' && num <= 1 ? Math.round(num * 100) : Math.round(num);
  return `${pct}%`;
};

export const formatConfidenceNumber = (num) => {
  if (num === null || num === undefined) return null;
  return typeof num === 'number' && num <= 1 ? Math.round(num * 100) : Math.round(num);
};

export const formatSeverity = (str) => {
  if (!str) return '—';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatCategory = (str) => {
  if (!str) return '—';
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const formatStatus = (str) => {
  if (!str) return '—';
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};
