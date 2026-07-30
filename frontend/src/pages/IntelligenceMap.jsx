import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import useIncidents from '../hooks/useIncidents';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { formatRelativeTime } from '../utils/formatters';

// Custom colored marker icons per severity
const makeIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });

const SEVERITY_COLORS = {
  critical: '#ba1a1a',
  high:     '#943700',
  medium:   '#f59e0b',
  low:      '#505f76',
};

export default function IntelligenceMap() {
  const navigate = useNavigate();
  const { incidents, stats, loading, error, refetch } = useIncidents({ limit: 100 });

  // Only incidents that have valid coordinates
  const mapped = incidents.filter(
    (i) => i.location?.coordinates?.coordinates?.length === 2
  );

  return (
    <div className="p-8 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#191c1e] tracking-tight mb-1">Intelligence Maps</h2>
          <p className="text-sm text-[#434655]">
            Live geographic view of all active incidents.
            {mapped.length > 0 && ` Showing ${mapped.length} of ${incidents.length} incidents.`}
          </p>
        </div>
        <button
          onClick={refetch}
          className="p-2 rounded-full text-[#434655] hover:bg-[#e6e8ea] hover:text-[#004ac6] transition-colors"
          title="Refresh"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
        </button>
      </div>

      {/* Stats strip */}
      <div className="mb-5 flex items-center gap-4 flex-wrap">
        {[
          { label: 'Active', value: stats?.activeIncidents ?? '—', color: 'text-[#004ac6]' },
          { label: 'Critical', value: stats?.criticalIncidents ?? '—', color: 'text-[#ba1a1a]' },
          { label: 'Resolved', value: stats?.resolvedIncidents ?? '—', color: 'text-[#16a34a]' },
          { label: 'Total Reports', value: stats?.totalReports ?? '—', color: 'text-[#434655]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-[#c3c6d7] rounded-lg px-4 py-2 flex items-center gap-2 shadow-sm">
            <span className={`text-xl font-bold ${color}`}>{value}</span>
            <span className="text-xs text-[#434655] font-semibold">{label}</span>
          </div>
        ))}

        {/* Legend */}
        <div className="ml-auto flex items-center gap-3 bg-white border border-[#c3c6d7] rounded-lg px-4 py-2 shadow-sm">
          {Object.entries(SEVERITY_COLORS).map(([severity, color]) => (
            <div key={severity} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ background: color }} />
              <span className="text-[11px] font-semibold text-[#434655] capitalize">{severity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Map */}
        <div className="lg:col-span-2 bg-white border border-[#c3c6d7] rounded-xl shadow-sm overflow-hidden h-[580px]">
          {loading ? (
            <Spinner centered />
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p className="text-sm text-[#ba1a1a]">{error}</p>
              <button onClick={refetch} className="text-xs text-[#004ac6] hover:underline">Retry</button>
            </div>
          ) : mapped.length === 0 ? (
            <EmptyState
              icon="map"
              title="No incidents with location data"
              message="Submit reports with a location pin to see them on the map."
            />
          ) : (
            <MapContainer
              center={[
                mapped[0].location.coordinates.coordinates[1],
                mapped[0].location.coordinates.coordinates[0],
              ]}
              zoom={12}
              className="w-full h-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {mapped.map((incident) => {
                const [lng, lat] = incident.location.coordinates.coordinates;
                const color = SEVERITY_COLORS[incident.severity] || SEVERITY_COLORS.low;
                return (
                  <Marker
                    key={incident._id}
                    position={[lat, lng]}
                    icon={makeIcon(color)}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                            style={{ background: color + '20', color }}
                          >
                            {incident.severity}
                          </span>
                          <span className="text-[10px] text-gray-500 capitalize">{incident.status}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mb-1 leading-snug">
                          {incident.title}
                        </p>
                        {incident.location?.text && (
                          <p className="text-xs text-gray-500 mb-2">{incident.location.text}</p>
                        )}
                        <p className="text-[11px] text-gray-400 mb-3">{formatRelativeTime(incident.updatedAt)}</p>
                        <button
                          onClick={() => navigate(`/incidents/${incident._id}`)}
                          className="w-full bg-[#004ac6] text-white text-xs font-semibold rounded py-1.5 hover:bg-[#003ea8] transition-colors"
                        >
                          View Incident →
                        </button>
                      </div>
                    </Popup>
                    {/* Pulse ring for critical */}
                    {incident.severity === 'critical' && (
                      <Circle
                        center={[lat, lng]}
                        radius={150}
                        color={color}
                        fillColor={color}
                        fillOpacity={0.08}
                        weight={1}
                      />
                    )}
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>

        {/* Incident list panel */}
        <div className="bg-white border border-[#c3c6d7] rounded-xl shadow-sm flex flex-col overflow-hidden h-[580px]">
          <div className="px-4 py-3 border-b border-[#c3c6d7] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#191c1e]">Incidents</h3>
            <span className="text-xs text-[#434655]">{incidents.length} total</span>
          </div>

          {loading ? (
            <Spinner centered />
          ) : incidents.length === 0 ? (
            <EmptyState icon="shield" title="No incidents" message="None found." />
          ) : (
            <div className="overflow-y-auto flex-1 divide-y divide-[#f2f4f6]">
              {incidents.map((incident) => (
                <button
                  key={incident._id}
                  onClick={() => navigate(`/incidents/${incident._id}`)}
                  className="w-full text-left px-4 py-3 hover:bg-[#f2f4f6] transition-colors flex items-start gap-3"
                >
                  {/* Severity dot */}
                  <div
                    className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: SEVERITY_COLORS[incident.severity] || SEVERITY_COLORS.low }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#191c1e] truncate">{incident.title}</p>
                    {incident.location?.text && (
                      <p className="text-[11px] text-[#737686] truncate mt-0.5">{incident.location.text}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="category" value={incident.category} />
                      <span className="text-[10px] text-[#737686]">{formatRelativeTime(incident.updatedAt)}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#c3c6d7] flex-shrink-0" style={{ fontSize: '16px' }}>
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
