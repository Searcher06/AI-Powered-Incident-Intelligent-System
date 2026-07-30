import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge';
import ConfidenceMeter from '../ui/ConfidenceMeter';
import { formatRelativeTime } from '../../utils/formatters';

const IncidentCard = ({ incident }) => {
  const navigate = useNavigate();
  if (!incident) return null;

  const shortId = `#${incident._id?.slice(-8) || 'xxxxxxxx'}`;

  return (
    <tr
      className="border-b border-[#e6e8ea] hover:bg-[#f2f4f6] cursor-pointer transition-colors"
      onClick={() => navigate(`/incidents/${incident._id}`)}
    >
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-[#737686]">{shortId}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-[#191c1e] line-clamp-1">
            {incident.title || 'Untitled Incident'}
          </span>
          {incident.location?.text && (
            <span className="text-xs text-[#737686] flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>location_on</span>
              {incident.location.text}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="category" value={incident.category} />
      </td>
      <td className="px-4 py-3">
        <Badge variant="severity" value={incident.severity} />
      </td>
      <td className="px-4 py-3 min-w-[120px]">
        <ConfidenceMeter value={incident.aiConfidence} size="sm" />
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-sm text-[#434655] font-medium">{incident.reportCount ?? 0}</span>
      </td>
      <td className="px-4 py-3 text-sm text-[#737686] whitespace-nowrap">
        {formatRelativeTime(incident.updatedAt)}
      </td>
      <td className="px-4 py-3">
        <button
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#dbe1ff] text-[#004ac6] hover:bg-[#b4c5ff] transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/incidents/${incident._id}`);
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
          View
        </button>
      </td>
    </tr>
  );
};

export default IncidentCard;
