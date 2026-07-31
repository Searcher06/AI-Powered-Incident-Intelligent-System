import { useState, useRef, useCallback } from 'react';
import { transcribeVoice } from '../../api/reports.api';

const LANGUAGE_NAMES = {
  en: 'English', ha: 'Hausa', yo: 'Yoruba', ig: 'Igbo',
  ar: 'Arabic', fr: 'French', ff: 'Fulfulde', es: 'Spanish',
};

const MAX_SECONDS = 30;

/**
 * Voice recorder that sends audio to Gemini 2.5 Flash for transcription.
 * Supports any language spoken by the user.
 *
 * Props:
 *   onTranscript({ transcript, detectedLanguage }) — called when transcription completes
 */
export default function VoiceInput({ onTranscript, disabled }) {
  const [state, setState] = useState('idle'); // idle | recording | transcribing | done | error
  const [seconds, setSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null); // { transcript, detectedLanguage }

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = useCallback(async () => {
    setErrorMsg('');
    setResult(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Prefer webm/opus — best compatibility with Gemini
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(timerRef.current);

        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size < 100) {
          setState('error');
          setErrorMsg('Recording was too short. Please try again.');
          return;
        }

        setState('transcribing');
        try {
          const data = await transcribeVoice(blob);
          setResult(data);
          setState('done');
          onTranscript(data);
        } catch (err) {
          setState('error');
          setErrorMsg(err.message || 'Transcription failed. Please try again.');
        }
      };

      recorder.start(250); // collect data every 250ms
      setState('recording');
      setSeconds(0);

      // Auto-stop at MAX_SECONDS
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) stopRecording();
          return s + 1;
        });
      }, 1000);

    } catch (err) {
      setState('error');
      if (err.name === 'NotAllowedError') {
        setErrorMsg('Microphone access denied. Please allow microphone access and try again.');
      } else {
        setErrorMsg(err.message || 'Could not access microphone.');
      }
    }
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const reset = () => {
    setState('idle');
    setResult(null);
    setErrorMsg('');
    setSeconds(0);
  };

  const langName = result?.detectedLanguage
    ? (LANGUAGE_NAMES[result.detectedLanguage] || result.detectedLanguage.toUpperCase())
    : null;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-[#191c1e]">
        Voice Report
        <span className="ml-1 text-[#737686] font-normal">(optional — speak in any language)</span>
      </label>

      {/* Main control */}
      <div className={`border-2 rounded-lg p-4 transition-colors ${
        state === 'recording'
          ? 'border-[#ba1a1a] bg-[#ffdad6]/20'
          : state === 'done'
          ? 'border-[#16a34a] bg-[#dcfce7]/20'
          : 'border-[#c3c6d7] bg-white'
      }`}>

        {/* Idle / Error */}
        {(state === 'idle' || state === 'error') && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={disabled}
              onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#004ac6] hover:bg-[#003ea8] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
                mic
              </span>
              Start Recording
            </button>
            <p className="text-xs text-[#434655]">
              Speak in <strong>any language</strong> — Gemini will transcribe it
            </p>
          </div>
        )}

        {/* Recording */}
        {state === 'recording' && (
          <div className="flex items-center gap-3">
            {/* Pulse indicator */}
            <div className="relative flex-shrink-0">
              <div className="w-3 h-3 bg-[#ba1a1a] rounded-full" />
              <div className="absolute inset-0 w-3 h-3 bg-[#ba1a1a] rounded-full animate-ping opacity-75" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#ba1a1a]">Recording… {seconds}s / {MAX_SECONDS}s</p>
              <div className="mt-1.5 h-1.5 rounded-full bg-[#e0e3e5] overflow-hidden">
                <div
                  className="h-full bg-[#ba1a1a] rounded-full transition-all"
                  style={{ width: `${(seconds / MAX_SECONDS) * 100}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
                stop_circle
              </span>
              Stop
            </button>
          </div>
        )}

        {/* Transcribing */}
        {state === 'transcribing' && (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-[#004ac6] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#004ac6]">Gemini is transcribing…</p>
              <p className="text-[11px] text-[#434655]">Detecting language and converting to text</p>
            </div>
          </div>
        )}

        {/* Done */}
        {state === 'done' && result && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#16a34a]" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <span className="text-xs font-bold text-[#16a34a]">Transcribed</span>
                {langName && (
                  <span className="px-2 py-0.5 bg-[#004ac6] text-white text-[10px] font-bold rounded-full">
                    {langName}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={reset}
                className="text-[11px] text-[#737686] hover:text-[#ba1a1a] transition-colors"
              >
                Re-record
              </button>
            </div>
            <p className="text-sm text-[#191c1e] bg-[#f2f4f6] rounded-lg px-3 py-2 leading-relaxed italic">
              "{result.transcript}"
            </p>
            <p className="text-[11px] text-[#434655]">
              ↑ This text has been added to the description field and will be analyzed by Gemma 4
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {state === 'error' && errorMsg && (
        <p className="text-xs text-[#ba1a1a] flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
          {errorMsg}
        </p>
      )}
    </div>
  );
}
