import { describe, it, expect } from "vitest";
import { EventTypes } from "../../../src/events/eventTypes";

describe("EventTypes", () => {
  it("has unique dotted string values", () => {
    const values = Object.values(EventTypes);
    expect(new Set(values).size).toBe(values.length);
    values.forEach((v) => expect(v).toMatch(/^[a-z]+(\.[a-z]+)+$/));
  });

  it.each([
    ["RESUME_ANALYSIS_COMPLETED", "resume.analysis.completed"],
    ["JOB_APPLICATION_SHORTLISTED", "job.application.shortlisted"],
    ["JOB_APPLICATION_REJECTED", "job.application.rejected"],
    ["JOB_APPLICATION_ACCEPTED", "job.application.accepted"],
    ["BATCH_REJECTION_FEEDBACK", "batch.rejection.feedback"],
    ["INTERVIEW_SCHEDULED", "interview.scheduled"],
    ["MESSAGE_RECEIVED", "message.received"],
  ])("%s = %s", (k, v) => {
    expect((EventTypes as any)[k]).toBe(v);
  });
});
