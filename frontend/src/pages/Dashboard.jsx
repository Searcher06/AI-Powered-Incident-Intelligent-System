import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useIncidents from '../hooks/useIncidents';
import IncidentStats from '../components/incident/IncidentStats';
import IncidentCard from '../components/incident/IncidentCard';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const SEVERITY_FILTERS = ['all', 'critical', 'high', 'medium', 'low'];
const STATUS_FILTERS = ['all', 'active', 'critical', 'resolved'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const params = {};
  if (severityFilter !== 'all') params.severity = severityFilter;
  if (statusFilter !== 'all') params.status = statusFilter;

  const { stats, incidents, loading, error, refetch } = useIncidents(params);

  return (
    <div className="p-8 max-w-[1440px] mx-auto">

      {/* Page header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#191c1e] tracking-tight mb-1">Command Center</h2>
          <p className="text-sm text-[#434655]">Real-time overview of civic intelligence and critical incidents.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ba1a1a] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ba1a1a]" />
          </span>
          <span className="text-xs font-semibold text-[#191c1e]">Live Updates Active</span>
          <button
            onClick={refetch}
            className="ml-2 p-2 rounded-full text-[#434655] hover:bg-[#e6e8ea] hover:text-[#004ac6] transition-colors"
            title="Refresh"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <IncidentStats stats={stats} incidents={incidents} />
      </div>

      {/* AI Insights */}
      <div className="mb-6 bg-white border border-[#c3c6d7] rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[#004ac6]" style={{ fontSize: '20px' }}>auto_awesome</span>
          <h3 className="text-base font-semibold text-[#191c1e]">AI Insights</h3>
        </div>
        <div className="bg-[#dbe1ff]/30 rounded-lg p-3 border border-[#dbe1ff]">
          {incidents.length > 0 ? (
            <p className="text-sm text-[#191c1e] leading-relaxed">
              <strong className="font-semibold text-[#004ac6]">System Status: </strong>
              {stats?.criticalIncidents > 0
                ? `${stats.criticalIncidents} critical incident${stats.criticalIncidents > 1 ? 's' : ''} require immediate attention. `
                : 'No critical incidents at this time. '}
              {stats?.totalIncidents > 0
                ? `Monitoring ${stats.totalIncidents} active incident${stats.totalIncidents > 1 ? 's' : ''} across ${stats?.categoryBreakdown?.length || 0} categories.`
                : 'No active incidents.'}
            </p>
          ) : (
            <p className="text-sm text-[#434655]">No active incidents. System is monitoring for new reports.</p>
          )}
        </div>
      </div>

      {/* Filters + Table */}
      <div className="bg-white border border-[#c3c6d7] rounded-xl shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="px-5 py-4 border-b border-[#c3c6d7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-[#191c1e]">Recent Incidents</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Severity filter */}
            <div className="flex items-center gap-1 bg-[#f2f4f6] rounded-lg p-1">
              {SEVERITY_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setSeverityFilter(f)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                    severityFilter === f
                      ? 'bg-white text-[#191c1e] shadow-sm'
                      : 'text-[#434655] hover:text-[#191c1e]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/submit')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#004ac6] text-white text-xs font-semibold rounded-lg hover:bg-[#003ea8] transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
              New Report
            </button>
          </div>
        </div>

        {loading ? (
          <Spinner centered />
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-[#ba1a1a] mb-3">{error}</p>
            <button onClick={refetch} className="text-xs text-[#004ac6] hover:underline">Try again</button>
          </div>
        ) : incidents.length === 0 ? (
          <EmptyState
            icon="shield"
            title="No incidents found"
            message="Adjust your filters or submit the first report to get started."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6] border-b border-[#c3c6d7]">
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#434655] uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#434655] uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#434655] uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#434655] uppercase tracking-wider">Severity</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#434655] uppercase tracking-wider">AI Confidence</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#434655] uppercase tracking-wider text-center">Reports</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#434655] uppercase tracking-wider">Updated</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#434655] uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e8ea]">
                {incidents.map((incident) => (
                  <IncidentCard key={incident._id} incident={incident} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
