import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { submitReport } from '../api/reports.api';
import ImageUpload from '../components/form/ImageUpload';
import LocationPicker from '../components/form/LocationPicker';

const SOURCE_TYPES = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'officer', label: 'Field Officer' },
  { value: 'other', label: 'Other' },
];

const PIPELINE_STEPS = [
  { key: 'analyze', label: 'Gemma Vision Analysis…', icon: 'psychology' },
  { key: 'search', label: 'Searching similar incidents…', icon: 'search' },
  { key: 'fuse', label: 'Incident Fusion…', icon: 'merge' },
  { key: 'brief', label: 'Generating operational briefing…', icon: 'auto_awesome' },
];

const DATA_STREAM_LINES = [
  'ANALYZING IMAGE DATA...',
  'EXTRACTING FEATURES... [OK]',
  'SEARCHING INCIDENT DATABASE...',
  'FUSING SENSOR FEEDS...',
  'CORRELATING HISTORICAL DATA...',
  'GENERATING BRIEFING...',
  'PIPELINE COMPLETE.',
];

export default function SubmitReport() {
  const navigate = useNavigate();

  // Form state
  const [uploadedImage, setUploadedImage] = useState(null);
  const [description, setDescription] = useState('');
  const [sourceType, setSourceType] = useState('other');
  const [language, setLanguage] = useState('en');
  const [location, setLocation] = useState(null);

  // AI panel state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [streamLines, setStreamLines] = useState([]);
  const [resultIncidentId, setResultIncidentId] = useState(null);
  const streamRef = useRef(null);

  // Animate pipeline steps after submission
  useEffect(() => {
    if (!submitting) return;
    let step = 0;
    setActiveStep(0);
    setCompletedSteps([]);

    const interval = setInterval(() => {
      setCompletedSteps((prev) => [...prev, step]);
      step++;
      if (step < PIPELINE_STEPS.length) {
        setActiveStep(step);
      } else {
        setActiveStep(-1);
        clearInterval(interval);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [submitting]);

  // Animate data stream
  useEffect(() => {
    if (!submitting) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < DATA_STREAM_LINES.length) {
        setStreamLines((prev) => [...prev, DATA_STREAM_LINES[i]]);
        i++;
        if (streamRef.current) {
          streamRef.current.scrollTop = streamRef.current.scrollHeight;
        }
      } else {
        clearInterval(interval);
      }
    }, 900);
    return () => clearInterval(interval);
  }, [submitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location?.coordinates) {
      toast.error('Please set a location — search by name, tap "My Location", or click the map.');
      return;
    }

    setSubmitting(true);
    setStreamLines([]);

    try {
      const payload = {
        sourceType,
        reporterType: sourceType === 'officer' ? 'field_officer' : 'citizen',
        description,
        language,
        location,
        timestamp: new Date().toISOString(),
        mediaAssets: uploadedImage ? [{ url: uploadedImage.url, mimeType: uploadedImage.mimeType }] : [],
      };

      const result = await submitReport(payload);
      setResultIncidentId(result.report?.incidentId || null);
      setSubmitted(true);
      toast.success('Report submitted and queued for AI analysis!');
    } catch (err) {
      toast.error(err.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col md:flex-row">

      {/* ── Left: Form ── */}
      <div className="flex-1 p-8 overflow-y-auto bg-white border-r border-[#c3c6d7] shadow-sm flex flex-col max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#191c1e] mb-1">Submit Intelligence Report</h1>
            <p className="text-sm text-[#434655]">Provide raw data for AI fusion and operational briefing generation.</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-[#eceef0] transition-colors"
          >
            <span className="material-symbols-outlined text-[#434655]" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">

          {/* Image upload */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#191c1e]">
              Evidence Image
              <span className="ml-1 text-[#737686] font-normal">(optional)</span>
            </label>
            <ImageUpload value={uploadedImage} onUpload={setUploadedImage} />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#191c1e]">
              Raw Description
              <span className="ml-1 text-[#737686] font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter observed details, field notes, or witness account…"
              rows={4}
              className="w-full bg-white border border-[#c3c6d7] rounded-lg p-3 text-sm text-[#191c1e] placeholder-[#737686] focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition-colors resize-none"
            />
          </div>

          {/* Source + Language */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#191c1e]">Source Type</label>
              <div className="relative">
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full bg-white border border-[#c3c6d7] rounded-lg p-2.5 pr-8 text-sm text-[#191c1e] focus:outline-none focus:border-[#004ac6] appearance-none transition-colors"
                >
                  {SOURCE_TYPES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#434655] pointer-events-none" style={{ fontSize: '18px' }}>
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#191c1e]">Language</label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-white border border-[#c3c6d7] rounded-lg p-2.5 pr-8 text-sm text-[#191c1e] focus:outline-none focus:border-[#004ac6] appearance-none transition-colors"
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#434655] pointer-events-none" style={{ fontSize: '18px' }}>
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Location */}
          <LocationPicker value={location} onChange={setLocation} />

          {/* Submit */}
          <div className="mt-auto pt-4">
            <button
              type="submit"
              disabled={submitting || submitted}
              className="w-full bg-[#004ac6] hover:bg-[#003ea8] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg h-11 flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {submitting && !submitted ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Submitting…
                </>
              ) : submitted ? (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Submitted — AI Processing
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>auto_awesome</span>
                  Analyze with Gemma
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Right: AI Processing Panel ── */}
      <div className="flex-1 bg-[#2d3133] hidden md:flex flex-col items-center justify-center relative overflow-hidden">

        {/* Background grid decoration */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(180,197,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(180,197,255,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-md w-full p-8 flex flex-col items-center text-center">

          {/* Gemma icon */}
          <div className={`w-24 h-24 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center mb-6 ${submitting ? 'ai-pulse' : ''}`}>
            <span
              className="material-symbols-outlined text-[#b4c5ff]"
              style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1" }}
            >
              memory
            </span>
          </div>

          {!submitting && !submitted && (
            <>
              <h2 className="text-xl font-semibold text-[#eff1f3] mb-2">Gemma 4 Ready</h2>
              <p className="text-sm text-[#c3c6d7] leading-relaxed">
                Submit your report to trigger the AI intelligence pipeline. Gemma will analyze, fuse, and generate an operational briefing.
              </p>

              {/* Pipeline preview */}
              <div className="mt-8 w-full bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 flex flex-col gap-3">
                {PIPELINE_STEPS.map((step) => (
                  <div key={step.key} className="flex items-center gap-3 opacity-40">
                    <span className="material-symbols-outlined text-[#b4c5ff]" style={{ fontSize: '18px' }}>{step.icon}</span>
                    <span className="font-mono text-xs text-[#eff1f3]">{step.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {submitting && !submitted && (
            <>
              <h2 className="text-xl font-semibold text-[#eff1f3] mb-2">Gemma Vision Analysis…</h2>
              <p className="text-sm text-[#c3c6d7] mb-6">Extracting entities and context from raw data inputs.</p>

              {/* Pipeline steps */}
              <div className="w-full bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 flex flex-col gap-4 mb-6">
                {PIPELINE_STEPS.map((step, i) => {
                  const isDone = completedSteps.includes(i);
                  const isActive = activeStep === i;
                  return (
                    <div key={step.key} className={`flex items-center gap-3 transition-opacity ${isDone || isActive ? 'opacity-100' : 'opacity-30'}`}>
                      {isDone ? (
                        <span className="material-symbols-outlined text-[#b4c5ff]" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      ) : isActive ? (
                        <div className="w-4 h-4 rounded-full border-2 border-[#b4c5ff] border-t-transparent animate-spin flex-shrink-0" />
                      ) : (
                        <span className="material-symbols-outlined text-[#737686]" style={{ fontSize: '18px' }}>radio_button_unchecked</span>
                      )}
                      <span className={`font-mono text-xs ${isDone || isActive ? 'text-[#eff1f3]' : 'text-[#737686]'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Data stream */}
              <div
                ref={streamRef}
                className="w-full h-28 overflow-hidden text-left opacity-30"
                style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent)' }}
              >
                <div className="font-mono text-[10px] text-[#b4c5ff] leading-relaxed tracking-wider space-y-0.5">
                  {streamLines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            </>
          )}

          {submitted && (
            <>
              <div className="w-16 h-16 rounded-full bg-[#004ac6]/20 border border-[#004ac6]/40 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[#b4c5ff]" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <h2 className="text-xl font-semibold text-[#eff1f3] mb-2">Report Submitted!</h2>
              <p className="text-sm text-[#c3c6d7] mb-6 leading-relaxed">
                Your report has been accepted and queued for AI processing. The intelligence pipeline is running in the background.
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-[#004ac6] hover:bg-[#003ea8] text-white text-sm font-semibold rounded-lg h-10 flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>dashboard</span>
                  View Dashboard
                </button>
                {resultIncidentId && (
                  <button
                    onClick={() => navigate(`/incidents/${resultIncidentId}`)}
                    className="w-full bg-white/10 hover:bg-white/20 text-[#eff1f3] text-sm font-semibold rounded-lg h-10 flex items-center justify-center gap-2 transition-colors border border-white/20"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                    View Incident
                  </button>
                )}
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setSubmitting(false);
                    setUploadedImage(null);
                    setDescription('');
                    setLocation(null);
                    setActiveStep(-1);
                    setCompletedSteps([]);
                    setStreamLines([]);
                    setResultIncidentId(null);
                  }}
                  className="text-xs text-[#c3c6d7] hover:text-[#eff1f3] transition-colors"
                >
                  Submit another report
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
