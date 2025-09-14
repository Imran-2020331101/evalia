'use client'
import axios from "axios";
import React, { useEffect } from "react";

// InterviewSummaryPreview.tsx
// - TypeScript + React (default export)
// - Tailwind CSS classes (dark slate theme)
// - No external UI libraries or animations
// - Sections: core metadata, evaluation (transcript), evaluation (video metrics), full transcript, summarized description

interface Candidate { id: string; name: string; resumeRef?: string }
interface Job { id: string; title: string; postedAt?: string }
interface Snippet { text: string; start?: string }
interface Question {
  id: string;
  text: string;
  askedAt?: string;
  answerStart?: string;
  answerEnd?: string;
  answerDurationSec?: number;
  score?: number;
  snippets?: Snippet[];
  followUps?: string[];
}
interface VideoMetrics { faceCount: number; eyeContact: number; speaking: number; blinkRate: number }
interface InterviewData {
  interviewId: string;
  candidate: Candidate;
  job: Job;
  timestamps: { start: string; end: string; durationSec?: number };
  consent: { recording: boolean; videoAnalysis: boolean };
  questions: Question[];
  transcript: string;
  videoMetrics: VideoMetrics;
  provenance: { summarizer: string };
}

const defaultData: InterviewData = {
  interviewId: "intv_12345",
  candidate: { id: "cand_01", name: "Afsana Rahman", resumeRef: "s3://resumes/afsana.pdf" },
  job: { id: "job_007", title: "Backend Engineer", postedAt: "2025-09-01T12:00:00Z" },
  timestamps: { start: "2025-09-08T10:00:00Z", end: "2025-09-08T10:25:00Z", durationSec: 1500 },
  consent: { recording: true, videoAnalysis: true },
  questions: [
    {
      id: "q1",
      text: "Describe cache invalidation strategies.",
      askedAt: "2025-09-08T10:02:00Z",
      answerStart: "2025-09-08T10:02:10Z",
      answerEnd: "2025-09-08T10:03:00Z",
      answerDurationSec: 50,
      score: 82,
      snippets: [{ text: "We use TTL and versioned keys", start: "2025-09-08T10:02:40Z" }],
      followUps: ["How would you measure cache hit ratio?"],
    },
    {
      id: "q2",
      text: "Explain a time you improved system performance.",
      askedAt: "2025-09-08T10:05:00Z",
      answerStart: "2025-09-08T10:05:05Z",
      answerEnd: "2025-09-08T10:07:20Z",
      answerDurationSec: 135,
      score: 74,
      snippets: [{ text: "We migrated from sync to async workers", start: "2025-09-08T10:06:00Z" }],
      followUps: ["How did you measure latency improvements?"],
    }
  ],
  transcript:
    `Agent: Hello, welcome to the interview.
Candidate: Thank you.
Agent: Describe cache invalidation strategies.
Candidate: We use TTL and versioned keys. We prefer versioning when rolling updates happen.
Agent: Explain a time you improved system performance.
Candidate: We migrated from sync to async workers which reduced latency by 40%.
Agent: Thank you, that's all.`,
  videoMetrics: { faceCount: 1, eyeContact: 82, speaking: 90, blinkRate: 12 },
  provenance: { summarizer: "LLM-v2" },
};

function timeSince(startIso: string, endIso: string): string {
  try {
    const s = new Date(startIso);
    const e = new Date(endIso);
    const diff = Math.max(0, Math.floor((e.getTime() - s.getTime()) / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${secs}s`;
  } catch (e) {
    return "-";
  }
}

function CircularScore({ value = 0, size = 88, stroke = 8 }: { value?: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, Math.round(value || 0)));
  const offset = circumference * (1 - pct / 100);


  useEffect(()=>{
    const fetch = async()=>{
      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search?part=snippet&q=react&type=video&maxResults=5&key=AIzaSyC1EZtkXFSSo7n1ao6dDhfwWTpUuWRvTb0')
        console.log(response.data);
      } catch (error) {
        console.log(error)
      }
    }
    fetch();
  },[])

  return (
    <svg width={size} height={size} className="block">
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={radius} fill="none" stroke="#1f2937" strokeWidth={stroke} />
        <circle
          r={radius}
          fill="none"
          stroke="#60a5fa"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform="rotate(-90)"
        />
        <text x={0} y={6} textAnchor="middle" fontSize={16} fontWeight={700} fill="#e2e8f0">
          {pct}%
        </text>
      </g>
    </svg>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-md font-semibold text-slate-100">{value}</div>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const val = Math.max(0, Math.min(100, Math.round(value)));
  const fillerStyle: React.CSSProperties = { width: `${val}%`, height: '100%', background: 'linear-gradient(90deg,#0ea5e9,#6366f1)' };
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-400">
        <div>{label}</div>
        <div className="font-medium text-slate-100">{val}</div>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
        <div style={fillerStyle} className="rounded" />
      </div>
    </div>
  );
}

export default function InterviewSummaryPreview({ data }: { data?: InterviewData }): JSX.Element {
  const d: InterviewData = { ...(defaultData as InterviewData), ...(data || {}) };
  const duration = timeSince(d.timestamps.start, d.timestamps.end);

  const transcriptScores = d.questions && d.questions.length ? d.questions.map((q) => q.score || 0) : [];
  const transcriptAvg = transcriptScores.length ? Math.round(transcriptScores.reduce((a, b) => a + b, 0) / transcriptScores.length) : 0;

  const composite = Math.round((transcriptAvg + (d.videoMetrics?.speaking ?? 0)) / 2);

  return (
    <div className="min-h-screen p-6 bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400">Interview · {d.job.title}</div>
            <h1 className="text-2xl font-semibold mt-1">{d.candidate.name}</h1>
            <div className="text-sm text-slate-400 mt-1">Interview ID: <span className="font-mono text-slate-300">{d.interviewId}</span></div>
            <div className="text-sm text-slate-400">{new Date(d.timestamps.start).toLocaleString()} · Duration: {duration}</div>
            <div className="text-sm text-slate-400 mt-1">Consent: Recording {d.consent.recording ? '✔' : '✖'} · Video Analysis {d.consent.videoAnalysis ? '✔' : '✖'}</div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <div className="text-xs text-slate-400">Composite</div>
              <CircularScore value={composite} />
            </div>

            <div className="flex flex-col gap-2">
              <SmallStat label="Transcript Avg" value={`${transcriptAvg}%`} />
              <SmallStat label="Video Speaking" value={`${d.videoMetrics.speaking}%`} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-6">
          <div className="col-span-1 bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h2 className="text-sm font-semibold text-slate-100">Evaluation — Transcript</h2>
            <div className="mt-3 space-y-3">
              <MetricBar label="Transcript-derived score" value={transcriptAvg} />
              <div className="text-xs text-slate-400">Questions evaluated: {d.questions.length}</div>

              <div className="mt-3">
                <div className="text-xs text-slate-400">Top highlights</div>
                <ul className="list-disc list-inside mt-2 text-sm text-slate-200">
                  {d.questions.slice(0, 3).map((q) => (
                    <li key={q.id} className="mt-1">
                      {q.text} — <span className="text-slate-300">score {q.score}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-700 pt-3">
              <div className="text-xs text-slate-400">Recommendation</div>
              <div className="text-sm font-medium text-slate-100 mt-1">{composite >= 75 ? 'Proceed' : composite >= 60 ? 'Human review' : 'Reject'}</div>
            </div>
          </div>

          <div className="col-span-2 bg-slate-800 rounded-lg p-4 border border-slate-700 flex flex-col">
            <h2 className="text-sm font-semibold text-slate-100">Full Transcript</h2>
            <div className="mt-3 overflow-auto max-h-64 p-3 bg-slate-900 rounded text-sm text-slate-200 font-mono whitespace-pre-wrap">{d.transcript}</div>

            <div className="mt-4">
              <h3 className="text-xs text-slate-400">Question-by-question (transcript aligned)</h3>
              <div className="mt-2 space-y-2">
                {d.questions.map((q) => (
                  <div key={q.id} className="p-3 bg-slate-900 rounded border border-slate-700">
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-medium text-slate-100">{q.text}</div>
                      <div className="text-xs text-slate-400">{Math.round(q.answerDurationSec || 0)}s</div>
                    </div>
                    <div className="mt-2 text-sm text-slate-200">Top snippet: <span className="text-slate-300">{q.snippets && q.snippets.length ? q.snippets[0].text : '—'}</span></div>
                    <div className="mt-2 text-xs text-slate-400">Score: <span className="font-medium text-slate-100">{q.score}</span> · Follow-ups: {q.followUps ? q.followUps.join(' · ') : '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-6">
          <div className="col-span-1 bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-100">Evaluation — Video Metrics</h3>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">Face count</div>
                <div className="text-sm font-medium text-slate-100">{d.videoMetrics.faceCount}</div>
              </div>
              <MetricBar label="Eye contact (%)" value={d.videoMetrics.eyeContact} />
              <MetricBar label="Speaking (%)" value={d.videoMetrics.speaking} />
              <MetricBar label="Blink rate (per min scaled)" value={Math.min(100, Math.round((d.videoMetrics.blinkRate / 30) * 100))} />

              <div className="mt-3 text-xs text-slate-400">Notes</div>
              <div className="mt-1 text-sm text-slate-200">{d.videoMetrics.faceCount > 1 ? 'Multiple faces detected — verify identity' : 'Single face detected'}</div>
            </div>
          </div>

          <div className="col-span-2 bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-100">Summarized Description</h3>
            <p className="mt-2 text-sm text-slate-200">{`Candidate: ${d.candidate.name}. Interview focused on ${d.job.title.toLowerCase()} fundamentals and performance optimisation. Transcript-derived score indicates domain competence (${transcriptAvg}%). Video signals: speaking ${d.videoMetrics.speaking}%, eye contact ${d.videoMetrics.eyeContact}%. Recommendation: ${composite >= 75 ? 'Proceed to technical round' : composite >= 60 ? 'Human review & targeted task' : 'Request further evidence or decline'}.`}</p>

            <div className="mt-4 text-xs text-slate-400">Provenance: {d.provenance.summarizer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
