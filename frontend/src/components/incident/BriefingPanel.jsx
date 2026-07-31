import { formatRelativeTime, formatConfidence } from '../../utils/formatters';
import Spinner from '../ui/Spinner';

export default function BriefingPanel({ briefing, briefingPending, loading }) {
  if (loading) {
    return (
      <section className="card p-5 flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#004ac6]" />
        <Spinner centered />
      </section>
    );
  }

  return (
    <section className="card p-5 flex flex-col gap-4 relative overflow-hidden">
      {/* left accent bar */}
      <div className="absolute top-0 left-0 w-1 h-full bg-[#004ac6]" />

      <div className="flex items-center gap-2 border-b border-[#c3c6d7] pb-3">
        <span className="material-symbols-outlined text-[#004ac6]" style={{ fontSize: '20px' }}>psychology</span>
        <h2 className="text-base font-semibold text-[#191c1e]">AI Operational Briefing</h2>
        {briefing?.generatedAt && (
          <span className="ml-auto text-xs font-mono text-[#434655]">
            Generated {formatRelativeTime(briefing.generatedAt)}
          </span>
        )}
      </div>

      {briefing ? (
        <>
          <p className="text-sm text-[#191c1e] leading-relaxed">
            {briefing.text}
          </p>
          <div className="flex items-center gap-4 pt-2 border-t border-[#c3c6d7]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#434655]">Confidence</span>
              <span className="text-xs font-bold text-[#004ac6]">{formatConfidence(briefing.confidence)}</span>
            </div>
            <div className="flex-1 h-1.5 rounded-full bg-[#e0e3e5] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#004ac6] transition-all"
                style={{ width: `${Math.round((briefing.confidence || 0) * 100)}%` }}
              />
            </div>
            {briefing.basedOnReportIds?.length > 0 && (
              <span className="text-xs text-[#434655]">
                Based on {briefing.basedOnReportIds.length} report{briefing.basedOnReportIds.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </>
      ) : briefingPending ? (
        <div className="py-6 text-center">
          <span className="material-symbols-outlined text-[#f59e0b]" style={{ fontSize: '32px' }}>warning</span>
          <p className="text-sm font-semibold text-[#191c1e] mt-2">Briefing delayed</p>
          <p className="text-xs text-[#434655] mt-1 max-w-xs mx-auto">
            The AI pipeline is taking longer than expected — likely due to high model demand. Refresh the page in a minute to check again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-xs text-[#004ac6] hover:underline flex items-center gap-1 mx-auto"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>refresh</span>
            Refresh page
          </button>
        </div>
      ) : (
        <div className="py-6 text-center">
          <span className="material-symbols-outlined text-[#737686]" style={{ fontSize: '32px' }}>hourglass_empty</span>
          <p className="text-sm text-[#434655] mt-2">Briefing is being generated…</p>
          <p className="text-xs text-[#737686] mt-1">Check back in a few seconds after the AI pipeline completes.</p>
        </div>
      )}
    </section>
  );
}
