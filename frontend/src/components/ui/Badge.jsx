import clsx from 'clsx';
import { SEVERITY_CONFIG, STATUS_CONFIG, CATEGORY_ICONS } from '../../utils/constants';
import { formatCategory, formatSeverity, formatStatus } from '../../utils/formatters';

const Badge = ({ variant, value, className }) => {
  if (!value) return null;

  const normalized = value.toLowerCase();

  if (variant === 'severity') {
    const config = SEVERITY_CONFIG[normalized] || SEVERITY_CONFIG.low;
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
          config.bgClass,
          className
        )}
      >
        <span
          className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', config.dotClass)}
        />
        {formatSeverity(value)}
      </span>
    );
  }

  if (variant === 'status') {
    const config = STATUS_CONFIG[normalized] || STATUS_CONFIG.active;
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
          config.bgClass,
          className
        )}
      >
        {formatStatus(value)}
      </span>
    );
  }

  if (variant === 'category') {
    const icon = CATEGORY_ICONS[normalized] || CATEGORY_ICONS.default;
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#eceef0] text-[#434655]',
          className
        )}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
          {icon}
        </span>
        {formatCategory(value)}
      </span>
    );
  }

  // Generic badge
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#eceef0] text-[#434655]',
        className
      )}
    >
      {value}
    </span>
  );
};

export default Badge;
