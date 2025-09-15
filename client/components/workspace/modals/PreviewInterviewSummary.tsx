'use client'

import React, { useState , useEffect, useRef} from 'react'
import { useAppDispatch , useAppSelector} from '@/redux/lib/hooks'
import {
  CheckCircle,
  AlertTriangle,
  Download,
  Clock,
  User,
  FileText,
  Play,
  Tag
} from 'lucide-react'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import { BarChart } from '@mui/x-charts/BarChart';
import Typography from '@mui/material/Typography'
import { previewedInterviewSummaryId, setPreviewedInterviewSummaryId } from '@/redux/features/interview'
import axios from 'axios'
import { ScaleLoader } from 'react-spinners'

// Minimal types matching your schema (subset)
type QuestionEval = {
  questionIndex: number
  contentScore: number
  communicationScore: number
  finalScore: number
  similarity?: number
  keywordsMatched?: string[]
  keywordCoverage?: number
  responseLatency?: number
  fillerRate?: number
}

export type InterviewEvaluationPreview = {
  _id?: string
  interviewId: string
  overallScore: number // 0..100
  contentAggregate: number
  commAggregate: number
  integrityAggregate: number
  responsivenessAggregate: number
  perQuestion: QuestionEval[]
  flags?: string[]
  decision: 'advance' | 'reject' | 'review' | 'pending'
  modelVersion?: string
  reviewerId?: string
  summaryText?: string
  publishedAt?: string
}

// dummy-evaluation.ts
export const dummyEvaluation = {
  _id: '6512f3e9a8b4c6d7e8f90123',
  interviewId: '650f9b2c4d3a2b1c0e9f1234',
  overallScore: 78,                // 0..100
  contentAggregate: 80,            // 0..100
  commAggregate: 75,
  integrityAggregate: 72,
  responsivenessAggregate: 82,
  perQuestion: [
    {
      questionIndex: 0,
      contentScore: 85,
      communicationScore: 80,
      finalScore: 83,
      similarity: 0.72,
      keywordsMatched: ['react', 'hooks', 'useEffect'],
      keywordCoverage: 0.6,
      responseLatency: 1.2,   // seconds
      fillerRate: 0.03
    },
    {
      questionIndex: 1,
      contentScore: 78,
      communicationScore: 70,
      finalScore: 74,
      similarity: 0.66,
      keywordsMatched: ['state', 'lifecycle'],
      keywordCoverage: 0.5,
      responseLatency: 2.1,
      fillerRate: 0.07
    },
    {
      questionIndex: 2,
      contentScore: 72,
      communicationScore: 68,
      finalScore: 70,
      similarity: 0.58,
      keywordsMatched: ['props', 'composition'],
      keywordCoverage: 0.45,
      responseLatency: 1.8,
      fillerRate: 0.09
    },
    {
      questionIndex: 3,
      contentScore: 88,
      communicationScore: 85,
      finalScore: 87,
      similarity: 0.80,
      keywordsMatched: ['performance', 'memoization', 'useMemo'],
      keywordCoverage: 0.75,
      responseLatency: 1.0,
      fillerRate: 0.02
    },
    {
      questionIndex: 4,
      contentScore: 60,
      communicationScore: 62,
      finalScore: 61,
      similarity: 0.40,
      keywordsMatched: [],
      keywordCoverage: 0,
      responseLatency: 4.5,
      fillerRate: 0.15
    }
  ],
  flags: ['low_eye_contact', 'high_filler_rate'],
  decision: 'review',             // 'advance' | 'reject' | 'review' | 'pending'
  modelVersion: '1.3.0',
  reviewerId: '62d7b3f9e4a1b2c3d4e5f678',
  summaryText:
    'Candidate shows solid React knowledge and good performance-awareness. Communication is fine but one answer was short and needs follow-up. Recommend manual review.',
  publishedAt: '2025-09-13T10:15:00Z'
}


const PreviewInterviewSummary = () => {

  const modalRef = useRef<HTMLDivElement|null>(null)

  const dispatch = useAppDispatch()

  const evaluation:any = dummyEvaluation;
  
  const [openQuestions, setOpenQuestions] = useState<Record<number, boolean>>({})
  const [interviewDetails, setInterviewDetails]=useState<any>(null);
  const [isLoading, setIsLoading]=useState<boolean>(false);
  const [newEval, setNewEval]=useState<any>(null);

  const currentPreviewedInterviewSummaryId = useAppSelector(previewedInterviewSummaryId)

  function toggleQuestion(i: number) {
    setOpenQuestions((s) => ({ ...s, [i]: !s[i] }))
  }

  function formatDecision(dec: InterviewEvaluationPreview['decision']) {
    switch (dec) {
      case 'advance':
        return { label: 'Advance', tone: 'bg-green-700', icon: <CheckCircle size={16} /> }
      case 'review':
        return { label: 'Review', tone: 'bg-amber-700', icon: <AlertTriangle size={16} /> }
      case 'reject':
        return { label: 'Reject', tone: 'bg-red-700', icon: <AlertTriangle size={16} /> }
      default:
        return { label: 'Pending', tone: 'bg-slate-600', icon: <Clock size={16} /> }
    }
  }

  const decisionMeta = formatDecision(evaluation?.decision)

  function downloadSummary() {
    // implement export endpoint client call; left intentionally empty per request
  }

  function playSnippet(question: QuestionEval) {
    // open player at timestamp or snippet. left empty for you to implement
  }
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (
          modalRef.current &&
          !modalRef.current.contains(event.target as Node)
          ) {
              dispatch(setPreviewedInterviewSummaryId(null));
          }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, []);

  useEffect(()=>{
    
    const fetchInterviewById = async()=>{
      const interviewId=currentPreviewedInterviewSummaryId;
      try {
        setIsLoading(true);
        const interviewResponse = await axios.get(`http://localhost:8080/api/interviews/${interviewId}`,{withCredentials:true});
        setInterviewDetails(interviewResponse.data.data)
        const evaluationResponse = await axios.get(`http://localhost:8080/api/interviews/${interviewId}/evaluation`,{withCredentials:true})
        console.log(evaluationResponse,'evaluationResponse')
        setNewEval(evaluationResponse.data.data);
      } catch (error:any) {
        console.log(error, 'error')
      }
      finally{
        setIsLoading(false);
      }
    }
    fetchInterviewById();
  },[currentPreviewedInterviewSummaryId])
  
  return (
    <div className={`fixed inset-0 z-[230] ${currentPreviewedInterviewSummaryId?'flex':'hidden'}`}>
      {
        isLoading?
        <div className="w-full h-full backdrop-blur-2xl flex justify-center items-center">
          <div  className="w-[70%] h-[90%] overflow-y-scroll scrollbar-hidden bg-gray-900">
            <ScaleLoader barCount={30} color='white'/>
          </div>
        </div>:
        <div className="w-full h-full flex justify-center items-center backdrop-blur-sm">
        <div ref={modalRef} className="w-[70%] h-[90%] overflow-y-scroll scrollbar-hidden bg-gray-900">
            <article
            className={`bg-gray-900/60 border border-gray-800 rounded-2xl p-4 shadow-sm pt-[20px]`}
            aria-label="Interview summary"
            >
            <header className="flex items-start justify-between gap-4">
                <div>
                <h3 className="text-sm font-semibold text-slate-100">Interview Summary</h3>
                <p className="mt-1 text-xs text-slate-400 max-w-xl">Quick evaluation overview and per-question breakdown.</p>

                <div className="mt-3 flex items-center gap-2 text-xs">
                    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded ${decisionMeta.tone} text-white text-[11px]`}>
                    {decisionMeta.icon}
                    <span>{decisionMeta.label}</span>
                    </div>

                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px]">
                    <FileText size={12} />
                    <span>{newEval?.perQuestion?.length} questions</span>
                    </div>

                    {newEval?.modelVersion && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px]">
                        <Tag size={12} />
                        <span>v{newEval?.modelVersion}</span>
                    </div>
                    )}

                    {newEval?.reviewerId && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px]">
                        <User size={12} />
                        <span>Reviewed</span>
                    </div>
                    )}
                </div>
                </div>

                <div className="w-36 h-36 flex-shrink-0 flex items-center justify-center">
                <Box className="relative flex items-center justify-center w-28 h-28">
                    <CircularProgress
                    variant="determinate"
                    value={Math.max(0, Math.min(100, Math.round(newEval?.overallScore)))}
                    size={112}
                    thickness={6}
                    sx={{ color: '#6366F1' }}
                    />

                    <div className="absolute text-center -mt-1">
                    <div className="text-xs text-slate-400">Overall</div>
                    <div className="text-lg font-semibold text-slate-100">{Math.round(newEval?.overallScore)}%</div>
                    </div>
                </Box>
                </div>
            </header>

            <section className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-3">
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
                    <h4 className="text-xs text-slate-300 font-medium">Aggregates</h4>
                    <div className="mt-4">
                    <BarChart
                        xAxis={[
                                {
                                scaleType: 'band',
                                data: ['Content', 'Communication', 'Integrity', 'Responsiveness'],
                                labelStyle: { fill: '#facc15', fontSize: 12 }, // Tailwind yellow-400
                                },
                            ]}
                            
                        series={[
                        {
                            data: [
                            newEval?.contentAggregate || 0,
                            newEval?.commAggregate || 0,
                            newEval?.integrityAggregate || 0,
                            newEval?.responsivenessAggregate || 0,
                            ],
                            label: 'Score',
                            color: '#38bdf8', // Tailwind sky-400
                        },
                        ]}
                        height={220}
                        margin={{ top: 20, bottom: 30, left: 40, right: 10 }}
                        slotProps={{
                            axisTickLabel: {
                            style: {
                                fill: '#e2e8f0', // Tailwind slate-200
                                fontSize: 12,
                                fontWeight: 500,
                            },
                            }
                        }}
                    />
                    </div>
                </div>
                {/* per-question list */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 space-y-2">
                    <h4 className="text-xs text-slate-300 font-medium">Per-question details</h4>

                    <div className="mt-2 space-y-2">
                    {newEval?.perQuestion.map((q:any) => (
                        <div key={q?.questionIndex} className="rounded-md border border-gray-800 p-2">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-300">Q{q?.questionIndex + 1}</div>
                            <div className="min-w-0">
                                <div className="text-xs font-medium text-slate-100">Answer summary</div>
                                <div className="text-xs text-slate-400 truncate max-w-xl">{(q?.keywordsMatched || []).slice(0,3).join(', ') || '—'}</div>
                            </div>
                            </div>

                            <div className="flex items-center gap-2">
                            <div className="text-xs text-slate-400">Score</div>
                            <div className="text-sm font-semibold text-slate-100">{Math.round(q?.finalScore)}%</div>

                            <button
                                type="button"
                                onClick={() => toggleQuestion(q?.questionIndex)}
                                className="text-xs text-indigo-400 px-2 py-1 rounded hover:bg-slate-800/50"
                            >
                                {openQuestions[q?.questionIndex] ? 'Hide' : 'Details'}
                            </button>

                            <button
                                type="button"
                                onClick={() => playSnippet(q)}
                                className="inline-flex items-center gap-1 text-xs text-slate-300 px-2 py-1 rounded hover:bg-slate-800/50"
                            >
                                <Play size={12} /> Play
                            </button>
                            </div>
                        </div>

                        {openQuestions[q?.questionIndex] && (
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-400 pl-[5%]">
                            <div>
                                <div className="text-[11px] text-slate-500">Content</div>
                                <div className="font-medium text-slate-100">{q?.contentScore}%</div>
                                <LinearProgress variant="determinate" value={q?.contentScore} sx={{ height: 6, borderRadius: 6, mt: 1 }} />
                            </div>
                            <div>
                                <div className="text-[11px] text-slate-500">Communication</div>
                                <div className="font-medium text-slate-100">{q?.communicationScore}%</div>
                                <LinearProgress variant="determinate" value={q?.communicationScore} sx={{ height: 6, borderRadius: 6, mt: 1 }} />
                            </div>
                            <div>
                                <div className="text-[11px] text-slate-500">Filler rate</div>
                                <div className="font-medium text-slate-100">{q?.fillerRate ?? '—'}</div>
                            </div>

                            <div className="md:col-span-3 text-[11px] text-slate-500 mt-1">Keywords: <span className="text-slate-200">{(q?.keywordsMatched || []).join(', ') || '—'}</span></div>
                            </div>
                        )}
                        </div>
                    ))}
                    </div>
                </div>
                </div>

                <aside className="space-y-3">
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 text-xs text-slate-400">
                    <div className="flex items-center justify-between w-full h-auto ">
                    <div className="flex items-center gap-2 w-full h-auto">
                        <FileText size={14}  className='self-start mt-1'/>
                        <div className='w-full h-auto'>
                        <div className="text-sm text-slate-200">Summary</div>
                        <div className="text-xs text-slate-400 mt-1 w-full h-auto">{newEval?.summaryText || 'No summary available.'}</div>
                        </div>
                    </div>
                    </div>

                    <div className="mt-3 flex flex-col gap-2">
                    {/* <Button variant="contained" size="small" onClick={downloadSummary} sx={{ backgroundColor: '#6366F1' }}>
                        <Download size={14} />
                        <span className="ml-2">Download summary</span>
                    </Button> */}

                    <div className="pt-2 border-t border-gray-800 mt-2 text-xs text-slate-500">
                        <div>Published: {newEval?.publishedAt ? new Date(newEval?.publishedAt).toLocaleString() : '—'}</div>
                        <div className="mt-1">Flags: {(newEval?.flags || []).join(', ') || 'None'}</div>
                    </div>
                    </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 text-xs text-slate-400">
                    <h4 className="text-xs text-slate-300">Actions</h4>
                    <div className="mt-2 flex flex-col gap-2">
                    <button className="text-left px-3 py-2 rounded hover:bg-slate-800/50 text-slate-200 text-sm">Open full evaluation</button>
                    <button className="text-left px-3 py-2 rounded hover:bg-slate-800/50 text-slate-200 text-sm">Add reviewer note</button>
                    </div>
                </div>
                </aside>
            </section>
            </article>
        </div>
      </div>
      }
    </div>
  )
}

export default PreviewInterviewSummary
