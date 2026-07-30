import clsx from 'clsx';
import { formatConfidenceNumber } from '../../utils/formatters';

const ConfidenceMeter = ({ value, label = 'Model Confidence', size = 'md', className }) => {
  const pct = formatConfidenceNumber(value);

  const getBarColor = (p) => {
    if (p === null || p === undefined) return 'bg-[#c3c6d7]';
    if (p >= 80) return 'bg-[#004ac6]';
    if (p >= 60) return 'bg-[#505f76]';
    if (p >= 40) return 'bg-[#943700]';
    return 'bg-[#ba1a1a]';
  };

  if (size === 'sm') {
    return (
      <div className={clsx('flex items-center gap-2', className)}>
        <div className="flex-1 h-1.5 rounded-full bg-[#e0e3e5] overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all', getBarColor(pct))}
            style={{ width: pct !== null ? `${pct}%` : '0%' }}
          />
        </div>
        <span className="text-xs font-semibold text-[#434655] w-8 text-right">
          {pct !== null ? `${pct}%` : '—'}
        </span>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#434655]">{label}</span>
        <span className={clsx('text-xs font-bold', pct !== null && pct >= 80 ? 'text-[#004ac6]' : 'text-[#434655]')}>
          {pct !== null ? `${pct}%` : '—'}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[#e0e3e5] overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', getBarColor(pct))}
          style={{ width: pct !== null ? `${pct}%` : '0%' }}
        />
      </div>
    </div>
  );
};

export default ConfidenceMeter;
