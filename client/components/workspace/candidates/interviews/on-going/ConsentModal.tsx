"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

type ConsentPageProps = {
  setIsStarted: React.Dispatch<React.SetStateAction<boolean>>;
};

const CONTACT_EMAIL = "privacy@evalia.ai"; // change to your support email
const DATA_RETENTION_MONTHS = 12; // change retention as needed

export default function ConsentPage({ setIsStarted }: ConsentPageProps) {
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);
  const [primaryConsentChecked, setPrimaryConsentChecked] = useState(false);
  const [trainingConsentChecked, setTrainingConsentChecked] = useState(false);
  const [thirdPartyConsentChecked, setThirdPartyConsentChecked] =
    useState(false);
  const [processing, setProcessing] = useState(false);

  const handleAccept = () => {
    if (!primaryConsentChecked) return;
    setProcessing(true);

    // TODO: persist consent to backend / analytics here (if you want)
    // e.g. await api.post('/consent', {accepted: true, trainingConsent: trainingConsentChecked, thirdPartyConsent: thirdPartyConsentChecked})

    setConsentGiven(true);
    setTimeout(() => {
      setProcessing(false);
      // start the flow in parent (true => started). change if your logic differs.
      setIsStarted(false);
    }, 2000);
  };

  const handleDecline = () => {
    // Optionally notify backend of decline, then update UI
    setConsentGiven(false);
    // setIsStarted(false);
  };

  // After user accepts/declines, show a short confirmation panel
  if (consentGiven !== null) {
    return (
      <div className="fixed z-[90] inset-0 flex items-center justify-center bg-black/60 p-4">
        <div className="max-w-md w-full p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-center">
          {consentGiven ? (
            <>
              <CheckCircle className="mx-auto mb-3 w-12 h-12 text-green-400" />
              <h2 className="text-xl font-semibold">Consent Recorded</h2>
              <p className="mt-2 text-sm text-slate-300">
                Thank you — your consent has been recorded. You may now proceed
                with the Evalia interview experience.
              </p>
            </>
          ) : (
            <>
              <XCircle className="mx-auto mb-3 w-12 h-12 text-red-400" />
              <h2 className="text-xl font-semibold">Consent Declined</h2>
              <p className="mt-2 text-sm text-slate-300">
                You declined consent. Some features may be limited. If you have
                questions or want to change this later, contact{" "}
                <a
                  className="text-blue-300 underline"
                  href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Main consent modal
  return (
    <div className="fixed z-[80] inset-0 flex backdrop-blur-sm items-center justify-center p-4">
      <div className="w-full max-w-[40%] h-[85vh] rounded-xl bg-slate-900 shadow-2xl border border-white/10 overflow-y-scroll scroll-container flex flex-col ">
        {/* Left: content (scrollable) */}
        <div className="p-6 ">
          <h1 className="text-2xl font-semibold text-white mb-3">
            Consent to Participate — Evalia AI Interview
          </h1>

          <p className="text-sm text-slate-300 mb-4">
            Evalia uses AI to assist with interviewing and evaluation. Please
            read the following carefully. By accepting you agree to the
            collection and use of your data as described below.
          </p>

          <section className="mb-4">
            <h3 className="font-medium text-white">Purpose</h3>
            <p className="text-sm text-slate-300 mt-1">
              This AI-powered interview will capture your audio (and optional
              video) responses and produce transcripts and automated scoring to
              help evaluators assess fit and performance.
            </p>
          </section>

          <section className="mb-4">
            <h3 className="font-medium text-white">Use of AI</h3>
            <p className="text-sm text-slate-300 mt-1">
              Automated tools (speech-to-text, NLP scoring, and other AI
              algorithms) will analyze content, voice characteristics and
              (optionally) visual cues. AI results are intended to assist
              human reviewers and are not the sole determinant of hiring
              decisions.
            </p>
          </section>

          <section className="mb-4">
            <h3 className="font-medium text-white">Data Collected</h3>
            <ul className="list-disc list-inside text-sm text-slate-300 mt-1 space-y-1">
              <li>Audio recordings of your interview answers</li>
              <li>Video recordings (only if you enable camera)</li>
              <li>Automatically generated transcripts</li>
              <li>Metadata: timestamps, silence detection, scoring logs</li>
              <li>Basic profile details you provide (name, email)</li>
            </ul>
          </section>

          <section className="mb-4">
            <h3 className="font-medium text-white">How We Use Your Data</h3>
            <p className="text-sm text-slate-300 mt-1">
              Data is used to evaluate interview performance, provide reports to
              recruiters, and (optionally) to improve our AI models if you give
              explicit training consent below.
            </p>
          </section>

          <section className="mb-4">
            <h3 className="font-medium text-white">Storage & Security</h3>
            <p className="text-sm text-slate-300 mt-1">
              Your interview data is stored securely and encrypted in transit
              and at rest. By default we retain interview data for{" "}
              <strong>{DATA_RETENTION_MONTHS} months</strong> unless you request
              earlier deletion.
            </p>
          </section>

          <section className="mb-4">
            <h3 className="font-medium text-white">Sharing & Third Parties</h3>
            <p className="text-sm text-slate-300 mt-1">
              Access is limited to Evalia staff involved in hiring. We will
              never share your data with external parties except with your
              consent or where required by law. If you enable third-party
              sharing below, we may share transcripts or aggregated,
              non-identifying data with trusted service providers.
            </p>
          </section>

          <section className="mb-4">
            <h3 className="font-medium text-white">Bias & Fairness</h3>
            <p className="text-sm text-slate-300 mt-1">
              AI systems can exhibit bias. Evalia aims to reduce bias and uses
              human oversight for decisions. If you have concerns about
              fairness, contact us.
            </p>
          </section>

          {/* New: Integrity Score section (English translation of provided content) */}
          <section className="mb-4">
            <h3 className="font-medium text-white">What is the Integrity Score?</h3>
            <p className="text-sm text-slate-300 mt-1">
              During your interview our AI system measures indicators of
              honesty and behavioral trustworthiness and produces an <em>Integrity
              Score</em>. The score ranges from <strong>0 to 100</strong>, where
              100 is the highest (best) score.
            </p>

            <h4 className="mt-3 font-medium text-white">How the Integrity Score is calculated</h4>
            <p className="text-sm text-slate-300 mt-1">
              The system computes the score from four main categories:
            </p>

            <ul className="list-disc list-inside text-sm text-slate-300 mt-2 space-y-2">
              <li>
                <strong>1. Face Presence (Face Detection)</strong>
                <div className="text-xs text-slate-400">Weight: 2 (most important)</div>
                <div className="text-sm text-slate-300 mt-1">Your face should be clearly visible in the camera. Avoid multiple faces in frame.</div>
              </li>

              <li>
                <strong>2. Eye Contact / Gaze</strong>
                <div className="text-xs text-slate-400">Weight: 1</div>
                <div className="text-sm text-slate-300 mt-1">Look toward the camera and avoid continuously looking away.</div>
              </li>

              <li>
                <strong>3. Speaking Pattern</strong>
                <div className="text-xs text-slate-400">Weight: 1</div>
                <div className="text-sm text-slate-300 mt-1">Speak naturally when answering questions and avoid long periods of silence.</div>
              </li>

              <li>
                <strong>4. Blink Rate</strong>
                <div className="text-xs text-slate-400">Weight: 1</div>
                <div className="text-sm text-slate-300 mt-1">Maintain a normal blink rate (roughly 15–20 blinks per minute).</div>
              </li>
            </ul>

            <h4 className="mt-3 font-medium text-white">How to get a good Integrity Score</h4>

            <div className="text-sm text-slate-300 mt-2 space-y-2">
              <p className="font-medium text-white">What to do:</p>

              <p className="text-xs text-slate-400">Camera setup:</p>
              <ul className="list-disc list-inside text-sm text-slate-300 mt-1 space-y-1">
                <li>Sit in a well-lit area</li>
                <li>Keep the camera at eye level</li>
                <li>Look directly at the camera (not at the screen)</li>
                <li>Ensure your full face is visible in the frame</li>
              </ul>

              <p className="text-xs text-slate-400">During the conversation:</p>
              <ul className="list-disc list-inside text-sm text-slate-300 mt-1 space-y-1">
                <li>Look at the camera when listening and answering</li>
                <li>Speak clearly and at a natural pace</li>
                <li>You may take 2–3 seconds to think before answering</li>
                <li>Blink at a natural rate</li>
              </ul>

              <p className="text-xs text-slate-400">Behavior:</p>
              <ul className="list-disc list-inside text-sm text-slate-300 mt-1 space-y-1">
                <li>Sit calm and still</li>
                <li>Avoid excessive movement</li>
                <li>Be confident and natural</li>
              </ul>

              <p className="font-medium text-white mt-2">What NOT to do:</p>
              <ul className="list-disc list-inside text-sm text-slate-300 mt-1 space-y-1">
                <li>Avoid multiple people in the camera frame</li>
                <li>Do not remove your face from the camera for more than 3 seconds</li>
                <li>Avoid continuously looking away (more than 10 seconds)</li>
                <li>Do not remain silent for long periods</li>
                <li>Do not look at a phone or other device, or read answers from paper or another screen</li>
              </ul>
            </div>

            <h4 className="mt-3 font-medium text-white">Penalty system — how violations affect score</h4>
            <p className="text-sm text-slate-300 mt-1">
              Penalties are applied for detected violations before the final score is given.
            </p>

            <ul className="list-disc list-inside text-sm text-slate-300 mt-2 space-y-2">
              <li>
                <strong>Severe violations:</strong>
                <ul className="list-disc list-inside text-sm text-slate-300 mt-1 space-y-1">
                  <li>Multiple faces shown: score reduction of 50% per minute</li>
                  <li>Absent from camera for more than 5 seconds: score may be set to 0</li>
                  <li>Poor eye contact for more than 10 seconds: score reduction of 60%</li>
                </ul>
              </li>

              <li>
                <strong>Moderate violations:</strong>
                <ul className="list-disc list-inside text-sm text-slate-300 mt-1 space-y-1">
                  <li>3 seconds of multiple faces: flagged as a violation</li>
                  <li>3 seconds of absence: flagged as a violation</li>
                </ul>
              </li>
            </ul>

            <h4 className="mt-3 font-medium text-white">How the score is computed</h4>
            <p className="text-sm text-slate-300 mt-1">Final score = (face × 2 + eyes × 1 + speaking × 1 + blink × 1) ÷ 5. Penalties are then applied and the final score is normalized to a 0–100 range.</p>

            <h4 className="mt-3 font-medium text-white">Score ranges — what they mean</h4>
            <ul className="list-disc list-inside text-sm text-slate-300 mt-2 space-y-1">
              <li><strong>90–100</strong>: Excellent integrity — all guidelines followed</li>
              <li><strong>80–89</strong>: Very good — minor improvements suggested</li>
              <li><strong>70–79</strong>: Good — some behavioral issues noted</li>
              <li><strong>60–69</strong>: Average — follow guidelines more closely</li>
              <li><strong>50–59</strong>: Weak — serious issues noted</li>
              <li><strong>0–49</strong>: Unacceptable — a re-interview may be required</li>
            </ul>

            <h4 className="mt-3 font-medium text-white">Tips & special instructions</h4>
            <p className="text-sm text-slate-300 mt-1">Preparation:</p>
            <ol className="list-decimal list-inside text-sm text-slate-300 mt-1 space-y-1">
              <li>Test your camera and microphone before the interview</li>
              <li>Ensure a stable internet connection</li>
              <li>Set up a quiet, private space</li>
              <li>Inform household members not to enter the room during the interview</li>
            </ol>

            <p className="text-sm text-slate-300 mt-2">During the interview:</p>
            <ul className="list-disc list-inside text-sm text-slate-300 mt-1 space-y-1">
              <li>Be natural and relaxed</li>
              <li>Speak honestly and avoid overthinking</li>
              <li>If you do not understand a question, politely ask for clarification</li>
              <li>Answer truthfully</li>
            </ul>

            <p className="text-sm text-slate-300 mt-2">Technical issues: if you experience technical problems, report them immediately. Our system will attempt to distinguish technical faults from intentional violations.</p>

            <p className="text-sm text-slate-300 mt-3">Remember: the Integrity Scoring system is designed to promote fairness, not to embarrass you. If you follow these guidelines your Integrity Score is likely to be favorable.</p>

            <p className="text-sm text-slate-300 mt-2 font-medium">Good luck with your interview!</p>
          </section>

          <section className="mb-4">
            <h3 className="font-medium text-white">Voluntary Participation</h3>
            <p className="text-sm text-slate-300 mt-1">
              Participation is voluntary. If you don’t consent, you may request
              a human-only interview or an alternative evaluation method.
            </p>
          </section>

          <section className="mb-4">
            <h3 className="font-medium text-white">Withdrawal & Deletion</h3>
            <p className="text-sm text-slate-300 mt-1">
              You can withdraw consent and request deletion of your data at any
              time. To request deletion or changes, contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-blue-300 underline"
              >
                {CONTACT_EMAIL}
              </a>
              . We will respond to deletion requests in accordance with
              applicable law.
            </p>
          </section>

          <section className="mb-4">
            <h3 className="font-medium text-white">Contact</h3>
            <p className="text-sm text-slate-300 mt-1">
              Questions or complaints? Reach out to{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-blue-300 underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>

        {/* Right: actions */}
        <div className="p-6 border-l border-white/6 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-white">Your choices</h2>
              <p className="text-sm text-slate-300 mt-1">
                Please confirm you understand and accept the required items.
              </p>
            </div>

            <div className="space-y-3">
              {/* Primary required consent */}
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={primaryConsentChecked}
                  onChange={(e) => setPrimaryConsentChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-blue-400"
                  aria-checked={primaryConsentChecked}
                />
                <div>
                  <div className="text-sm text-white font-medium">
                    I have read and understand the information above (required)
                  </div>
                  <div className="text-xs text-slate-400">
                    I consent to Evalia recording my interview and processing the
                    data for evaluation purposes.
                  </div>
                </div>
              </label>

              {/* Optional: training */}
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={trainingConsentChecked}
                  onChange={(e) =>
                    setTrainingConsentChecked(e.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-blue-400"
                />
                <div>
                  <div className="text-sm text-white font-medium">
                    Allow anonymized use for model improvement (optional)
                  </div>
                  <div className="text-xs text-slate-400">
                    Allow Evalia to use anonymized transcripts and features to
                    improve its AI models.
                  </div>
                </div>
              </label>

              {/* Optional: third party */}
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={thirdPartyConsentChecked}
                  onChange={(e) =>
                    setThirdPartyConsentChecked(e.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-blue-400"
                />
                <div>
                  <div className="text-sm text-white font-medium">
                    Allow sharing with trusted service providers (optional)
                  </div>
                  <div className="text-xs text-slate-400">
                    Share transcripts or aggregated data with service providers
                    that support Evalia’s operations (e.g., transcription
                    services). We will not sell your personal data.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                className={`flex-1 px-4 py-2 rounded-md text-white font-medium shadow-sm transition ${
                  primaryConsentChecked
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-green-500/40 cursor-not-allowed"
                }`}
                disabled={!primaryConsentChecked || processing}
                aria-disabled={!primaryConsentChecked || processing}
              >
                {processing ? "Processing..." : "Accept & Continue"}
              </button>

              <button
                onClick={handleDecline}
                className="flex-1 px-4 py-2 rounded-md border border-red-500 text-red-300 hover:bg-red-800/10"
              >
                Decline
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-3">
              By accepting you confirm that you are at least 18 years old and
              that you agree to the terms described above. You may request
              withdrawal or deletion later by contacting{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-blue-300 underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
