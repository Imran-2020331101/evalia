'use client'

import React from 'react'
import { Users, Briefcase, ClipboardList, Calendar, ShieldCheck, BookOpen, Mail, HelpCircle } from 'lucide-react'

export default function RecruitmentAndGuidelineContainer() {
  return (
    <div className="h-auto text-slate-200 bg-transparent">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Evalia Recruitment Guidelines</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-3xl">
            At Evalia, we believe recruitment should be transparent, efficient, and fair. This guideline helps recruiters and candidates navigate the hiring process with consistency and professionalism.
          </p>
        </header>

        <main className="grid grid-cols-1 gap-6">
          {/* For Recruiters */}
          <section className="rounded-2xl p-5 shadow-sm ">
            <div className="flex items-center gap-3">
              <Briefcase size={18} />
              <h2 className="text-sm font-medium">For Recruiters</h2>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
              <article className="space-y-2">
                <h3 className="text-xs font-medium flex items-center gap-2"><ClipboardList size={14} /> Job Posting</h3>
                <ul className="list-inside list-disc text-xs text-slate-400 space-y-1">
                  <li>Write clear & concise descriptions: title, responsibilities, skills, experience, location/remote</li>
                  <li>Avoid biased language — keep postings inclusive and neutral</li>
                  <li>Add application deadlines to set expectations</li>
                </ul>
              </article>

              <article className="space-y-2">
                <h3 className="text-xs font-medium flex items-center gap-2"><Users size={14} /> Candidate Shortlisting</h3>
                <ul className="list-inside list-disc text-xs text-slate-400 space-y-1">
                  <li>Use Evalia’s AI filtering & scoring to surface matches</li>
                  <li>Always review profiles before scheduling interviews</li>
                  <li>Respect equal opportunity — evaluate on merit & relevance</li>
                </ul>
              </article>

              <article className="space-y-2">
                <h3 className="text-xs font-medium flex items-center gap-2"><Calendar size={14} /> Interview Process</h3>
                <ul className="list-inside list-disc text-xs text-slate-400 space-y-1">
                  <li>Schedule with at least 48 hours' notice</li>
                  <li>Ensure candidates can access Evalia’s AI interview platform</li>
                  <li>Use structured questions for consistency</li>
                  <li>Record and analyze interviews with scoring & video metrics</li>
                </ul>
              </article>

              <article className="space-y-2">
                <h3 className="text-xs font-medium flex items-center gap-2"><ShieldCheck size={14} /> Evaluation</h3>
                <ul className="list-inside list-disc text-xs text-slate-400 space-y-1">
                  <li>Base decisions on transcript analysis, AI scores, and video metrics</li>
                  <li>Keep records in Evalia dashboard for audit & compliance</li>
                </ul>
              </article>

              <article className="md:col-span-2 space-y-2">
                <h3 className="text-xs font-medium flex items-center gap-2"><Mail size={14} /> Offer & Feedback</h3>
                <ul className="list-inside list-disc text-xs text-slate-400 space-y-1">
                  <li>Communicate decisions promptly (within 1–2 weeks)</li>
                  <li>Provide constructive feedback to unsuccessful candidates when possible</li>
                  <li>Ensure offers include salary, benefits, and working terms</li>
                </ul>
              </article>
            </div>
          </section>

          {/* For Candidates */}
          <section className="rounded-2xl p-5 shadow-sm ">
            <div className="flex items-center gap-3">
              <Users size={18} />
              <h2 className="text-sm font-medium">For Candidates</h2>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
              <article className="space-y-2">
                <h3 className="text-xs font-medium">Preparing Your Profile</h3>
                <ul className="list-inside list-disc text-xs text-slate-400 space-y-1">
                  <li>Complete your profile: resume/CV, photo (optional), experience, skills</li>
                  <li>Keep information accurate and up to date</li>
                </ul>
              </article>

              <article className="space-y-2">
                <h3 className="text-xs font-medium">Applying for Jobs</h3>
                <ul className="list-inside list-disc text-xs text-slate-400 space-y-1">
                  <li>Read descriptions carefully and apply to matching roles</li>
                  <li>Customize applications to highlight relevant strengths</li>
                </ul>
              </article>

              <article className="space-y-2">
                <h3 className="text-xs font-medium">Interview Preparation</h3>
                <ul className="list-inside list-disc text-xs text-slate-400 space-y-1">
                  <li>Test audio, video, and internet before interviews</li>
                  <li>Practice role-specific questions; familiarize with Evalia’s environment</li>
                </ul>
              </article>

              <article className="space-y-2 md:col-span-2">
                <h3 className="text-xs font-medium">During & After the Interview</h3>
                <ul className="list-inside list-disc text-xs text-slate-400 space-y-1">
                  <li>Dress professionally and maintain eye contact with camera</li>
                  <li>Speak clearly; avoid distractions and background noise</li>
                  <li>Monitor dashboard for updates and use feedback to improve</li>
                </ul>
              </article>
            </div>
          </section>

          {/* Ethical Standards & Best Practices */}
          <section className="rounded-2xl p-5 shadow-sm ">
            <div className="flex items-center gap-3">
              <BookOpen size={18} />
              <h2 className="text-sm font-medium">Ethical Standards</h2>
            </div>

            <div className="mt-3 text-sm text-slate-300 space-y-3">
              <p className="text-xs text-slate-400">Evalia promotes:</p>
              <ul className="list-inside list-disc text-xs text-slate-400 space-y-1">
                <li><strong>Fair Recruitment</strong> — equal opportunity for all candidates</li>
                <li><strong>Transparency</strong> — clear communication between recruiters and applicants</li>
                <li><strong>Data Privacy</strong> — personal data and recordings protected under our Privacy Policy</li>
                <li><strong>Zero Tolerance</strong> — no discrimination or unethical hiring practices</li>
              </ul>

              <h3 className="text-xs font-medium mt-3">Best Practices</h3>
              <ul className="list-inside list-disc text-xs text-slate-400 space-y-1">
                <li>Recruiters: balance AI-driven insights with human judgment</li>
                <li>Candidates: treat every interaction as part of the evaluation</li>
                <li>Both: respect time, deadlines, and professional communication</li>
              </ul>
            </div>
          </section>

          {/* Need Assistance */}
          <section className="rounded-2xl p-5 shadow-sm ">
            <div className="flex items-center gap-3">
              <HelpCircle size={18} />
              <h2 className="text-sm font-medium">Need Assistance?</h2>
            </div>

            <div className="mt-3 text-sm text-slate-300">
              <p className="text-xs text-slate-400">If you have questions about the recruitment process:</p>
              <ul className="list-inside list-disc text-xs text-slate-400 space-y-1 mt-2">
                <li>Visit the <a href="#" className="underline text-indigo-500">Support Page</a></li>
                <li>Email: <a href="mailto:support@evallia.com" className="underline text-indigo-500">support@evallia.com</a></li>
                <li>Access tutorials in the <a href="#" className="underline text-indigo-500">Help Center</a></li>
              </ul>
            </div>
          </section>

        </main>
      </div>
    </div>
  )
}
