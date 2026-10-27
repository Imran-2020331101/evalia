import { describe, expect, it } from 'vitest'
import { EMPLOYMENT_LEVEL, IMPORTANCE_OPTIONS, JOB_TYPE, WORKPLACE_TYPE } from '@/Data/create-job'
import { EmploymentLevelType, JobType, WorkPlaceType } from '@/types/create-job'

const shape = (arr: readonly { value: string; label: string }[]) => {
  expect(arr.length).toBeGreaterThan(0)
  for (const o of arr) {
    expect(typeof o.value).toBe('string')
    expect(o.label.length).toBeGreaterThan(0)
  }
  expect(new Set(arr.map((o) => o.value)).size).toBe(arr.length)
}

describe('create-job options', () => {
  it('importance options', () => {
    shape(IMPORTANCE_OPTIONS)
    expect(IMPORTANCE_OPTIONS.map((o) => o.value)).toEqual(['critical', 'high', 'moderate', 'low', 'optional'])
  })
  it('job types map to enum', () => {
    shape(JOB_TYPE)
    expect(JOB_TYPE.map((o) => o.value)).toEqual([JobType.FULL_TIME, JobType.PART_TIME, JobType.CONTRACT, JobType.INTERN])
  })
  it('workplace types map to enum', () => {
    shape(WORKPLACE_TYPE)
    expect(WORKPLACE_TYPE.map((o) => o.value)).toEqual([WorkPlaceType.ONSITE, WorkPlaceType.REMOTE, WorkPlaceType.HYBRID])
  })
  it('employment levels include enum and extra levels', () => {
    shape(EMPLOYMENT_LEVEL)
    const values = EMPLOYMENT_LEVEL.map((o) => o.value as string)
    expect(values).toEqual([EmploymentLevelType.ENTRY, EmploymentLevelType.MID, EmploymentLevelType.SENIOR, 'EXECUTIVE', 'DIRECTOR'])
  })
})
