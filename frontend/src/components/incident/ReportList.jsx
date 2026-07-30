import { formatRelativeTime } from '../../utils/formatters';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';

const SOURCE_ICONS = {
  whatsapp: 'chat',
  facebook: 'thumb_up',
  x: 'tag',
  phone: 'phone',
  officer: 'badge',
  other: 'report',
};

function ReportItem({ report }) {
  const icon = SOURCE_ICONS[report.sourceType] || 'report';
  const images = report.mediaAssets?.filter((a) => a.url) || [];

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#eceef0] flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[#434655]" style={{ fontSize: '16px' }}>{icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[#191c1e] capitalize">{report.sourceType || 'Unknown source'}</span>
              {report.understanding?.category && (
                <Badge variant="category" value={report.understanding.category} />
              )}
              {report.understanding?.severity && (
                <Badge variant="severity" value={report.understanding.severity} />
              )}
            </div>
            <p className="text-[11px] text-[#737686] mt-0.5">{formatRelativeTime(report.timestamp)}</p>
          </div>
        </div>
        {report.location?.text && (
          <span className="text-[11px] text-[#434655] flex items-center gap-1 shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>location_on</span>
            {report.location.text}
          </span>
        )}
      </div>

      {report.description && (
        <p className="text-sm text-[#191c1e] leading-relaxed">{report.description}</p>
      )}

      {report.understanding?.summary && report.understanding.summary !== report.description && (
        <div className="bg-[#f2f4f6] rounded p-3 border-l-2 border-[#004ac6]">
          <p className="text-[11px] font-semibold text-[#004ac6] mb-1">AI Summary</p>
          <p className="text-xs text-[#191c1e]">{report.understanding.summary}</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.slice(0, 3).map((asset, i) => (
            <a key={i} href={asset.url} target="_blank" rel="noopener noreferrer"
              className="relative overflow-hidden rounded border border-[#c3c6d7] h-24 block group">
              <img
                src={asset.url}
                alt={`Report evidence ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </a>
          ))}
        </div>
      )}

      {report.understanding?.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {report.understanding.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-[#eceef0] text-[#434655] rounded text-[10px] font-mono border border-[#c3c6d7]">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReportList({ reports }) {
  if (!reports || reports.length === 0) {
    return <EmptyState icon="article" title="No reports yet" message="Reports submitted to this incident will appear here." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {reports.map((r) => (
        <ReportItem key={r._id} report={r} />
      ))}
    </div>
  );
}
