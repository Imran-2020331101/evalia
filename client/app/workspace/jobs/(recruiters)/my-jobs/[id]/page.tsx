'use client'

import { User, Filter, BadgeCheck } from 'lucide-react'

const MySpecificJobPage = () => {
  return (
    <section className="w-full h-full  flex flex-col justify-start items-start pt-[10%] px-6 py-4 text-[12px] text-gray-300 space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-white">Recruitment Workflow Overview</h2>
        <p className="text-gray-400">Understand each stage of the applicant journey and your role in it.</p>
      </div>

      <ol className="space-y-4 list-decimal list-inside  pl-4">
        <li>
          <span className="font-medium text-white">Applicants:</span> All individuals who have applied to this job.
        </li>
        <li>
          <span className="font-medium text-white">Shortlist:</span> Based on CV requirements you defined while posting the job, we match and rank applicants. You can adjust required skills and priority weights to regenerate the shortlist.
        </li>
        <li>
          <span className="font-medium text-white">Finalists:</span> Shortlisted candidates who have completed the interview and passed your evaluation criteria.
        </li>
      </ol>

      <div className=" pt-4 text-gray-400 space-y-1">
        <p className="font-semibold text-white">🧭 Get Started</p>
        <p>1. While posting a job, define required skills and assign priority levels.</p>
        <p>2. Once applicants submit, set how many you want to shortlist.</p>
        <p>3. We'll match and rank them automatically for your review.</p>
      </div>
    </section>
  )
}

export default MySpecificJobPage
