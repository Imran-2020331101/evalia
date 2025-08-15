export const IMPORTANCE_OPTIONS = [
  { value: "critical", label: "🔴 Critical" },
  { value: "high", label: "🟠 High" },
  { value: "moderate", label: "🟡 Moderate" },
  { value: "low", label: "🔵 Low" },
  { value: "optional", label: "⚪ Optional" },
];

import { JobType } from "@/types/create-job";

export const JOB_TYPE = [
  { value: JobType.FULL_TIME, label: "🕐 Full-time" },
  { value: JobType.PART_TIME, label: "🕞 Part-time" },
  { value: JobType.CONTRACT, label: "📃 Contract" },
  { value: JobType.INTERN, label: "🎓 Internship" }
] as const;

import { WorkPlaceType } from "@/types/create-job";

export const WORKPLACE_TYPE = [
  { value: WorkPlaceType.ONSITE, label: "🏢 On-site" },
  { value: WorkPlaceType.REMOTE, label: "🏠 Remote" },
  { value: WorkPlaceType.HYBRID, label: "🔀 Hybrid" }
] as const;

import { EmploymentLevelType } from "@/types/create-job";

export const EMPLOYMENT_LEVEL = [
  { value: EmploymentLevelType.ENTRY, label: "🧩 Entry Level" },
  { value: EmploymentLevelType.MID, label: "⚙️ Mid Level" },
  { value: EmploymentLevelType.SENIOR, label: "🎯 Senior Level" },
  { value: "EXECUTIVE", label: "💼 Executive" },
  { value: "DIRECTOR", label: "📊 Director" }
] as const;