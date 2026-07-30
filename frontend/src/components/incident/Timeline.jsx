import clsx from 'clsx';
import { formatRelativeTime } from '../../utils/formatters';
import EmptyState from '../ui/EmptyState';

const EVENT_CONFIG = {
  created: {
    icon: 'add_circle',
    color: 'bg-[#004ac6]',
    label: 'Incident Created',
  },
  merged: {
    icon: 'merge',
    color: 'bg-[#505f76]',
    label: 'Report Merged',
  },
  severity_changed: {
    icon: 'priority_high',
    color: 'bg-[#ba1a1a]',
    label: 'Severity Escalated',
  },
  confidence_changed: {
    icon: 'trending_up',
    color: 'bg-[#004ac6]',
    label: 'Confidence Updated',
  },
  status_changed: {
    icon: 'flag',
    color: 'bg-[#943700]',
    label: 'Status Changed',
  },
  briefing_updated: {
    icon: 'auto_awesome',
    color: 'bg-[#0053db]',
    label: 'Briefing Updated',
  },
};

function TimelineEvent({ event }) {
  const cfg = EVENT_CONFIG[event.eventType] || {
    icon: 'info',
    color: 'bg-[#c3c6d7]',
    label: event.eventType,
  };

  return (
    <div className="relative pl-6">
      {/* dot */}
      <div className={clsx('absolute -left-[7px] top-1 w-3.5 h-3.5 rounded-full ring-4 ring-white flex-shrink-0', cfg.color)} />

      <p className="text-[11px] font-semibold text-[#434655] mb-0.5">
        {formatRelativeTime(event.createdAt)}
      </p>
      <p className="text-sm font-semibold text-[#191c1e]">{cfg.label}</p>
      {event.reason && (
        <p className="text-xs text-[#434655] mt-0.5 leading-relaxed">{event.reason}</p>
      )}
      {event.before?.severity && event.after?.severity && event.before.severity !== event.after.severity && (
        <p className="text-xs text-[#ba1a1a] mt-1 font-semibold">
          {event.before.severity} → {event.after.severity}
        </p>
      )}
    </div>
  );
}

export default function Timeline({ events }) {
  if (!events || events.length === 0) {
    return <EmptyState icon="history" title="No timeline events" message="Events will appear as the AI pipeline processes reports." />;
  }

  // newest first
  const sorted = [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="relative pl-6 border-l-2 border-[#e0e3e5] space-y-6">
      {sorted.map((event) => (
        <TimelineEvent key={event._id} event={event} />
      ))}
    </div>
  );
}
