import { describe, it, expect } from "vitest";
import { generateRejectionFeedbackEmail as gen } from "../../../../src/mail/template/rejection";
import { rejectionPayload } from "../../../fixtures/payloads";

describe("generateRejectionFeedbackEmail", () => {
  it("renders candidate, job, stage, strengths and weaknesses", () => {
    const html = gen(rejectionPayload());
    expect(html).toContain("Alice");
    expect(html).toContain("Backend Dev");
    expect(html).toContain("Resume Screening");
    expect(html).toContain("✔ Node.js");
    expect(html).toContain("✔ SQL");
    expect(html).toContain("✖ Kubernetes");
    expect(html).toContain("Check your interview evaluation here : https://eval.test/1");
    expect(html).toContain("Team Evalia");
  });

  it("shows placeholders when strengths/weaknesses are empty", () => {
    const p = rejectionPayload();
    p.data.review.strengths = [];
    p.data.review.weaknesses = [];
    const html = gen(p);
    expect(html).toContain("No specific strengths highlighted");
    expect(html).toContain("No key growth areas identified");
  });

  // BUG (characterization): `data?.interviewEvaluation && ...` renders the literal
  // text "undefined" (or "") into the e-mail when there is no interview evaluation.
  it("leaks the literal string 'undefined' when interviewEvaluation is absent (known bug)", () => {
    const p = rejectionPayload();
    delete (p.data as any).interviewEvaluation;
    expect(gen(p)).toContain("undefined");
  });
});
