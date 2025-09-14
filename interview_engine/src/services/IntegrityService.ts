import { IntegrityMetrics, IntegrityUpdateResponse, InterviewIntegrityState } from "../types/interview.types";

export class IntergrityService{

    private integrityStates: Map<string, InterviewIntegrityState> = new Map();

    private EWMA_ALPHA = 0.18; // smoothing factor (0-1); smaller = smoother
    private W_FACE = 2;
    private W_GAZE = 1;
    private W_SPEAK = 1;
    private W_BLINK = 1;

    // violation thresholds (seconds)
    private MULTIPLE_FACE_VIOLATION_SEC = 3; // sustained multiple faces (secs) considered violation
    private ABSENT_VIOLATION_SEC = 3;        // sustained absence considered violation
    private LOW_GAZE_VIOLATION_SEC = 10;     // sustained low eye contact considered violation

    // penalty factors
    // multiply aggregate score by these (each between 0 and 1) depending on severity
    private MULTIPLE_FACE_PENALTY_PER_MIN = 0.5; // per minute of extra face presence -> heavy penalty
    private ABSENT_PENALTY = 0.0; // absent for a lot -> zero integrity
    private LOW_GAZE_PENALTY_FACTOR = 0.6; // sustained low gaze reduces overall score to 60%


    private initStateIfMissing(interviewId: string, now = Date.now()): InterviewIntegrityState {
      let s = this.integrityStates.get(interviewId);
      if (!s) {
        s = {
          startedAt: now,
          lastUpdatedAt: now,
          sampleCount: 0,
          sumFaceScore: 0,
          sumGazeScore: 0,
          sumSpeakScore: 0,
          sumBlinkScore: 0,
          ewmaFace: 0,
          ewmaGaze: 0,
          ewmaSpeak: 0,
          ewmaBlink: 0,
          minInstantScore: Number.POSITIVE_INFINITY,
          maxInstantScore: Number.NEGATIVE_INFINITY,
          multipleFaceSeconds: 0,
          absentSeconds: 0,
          lowEyeContactSeconds: 0,
          violatedMultipleFaces: false,
          violatedAbsent: false,
          violatedLowEyeContact: false
        };
        this.integrityStates.set(interviewId, s);
      }
      return s;
    }

    private calculateInstantScore(metrics: IntegrityMetrics): number {
      const { faceCount, eyeContact, speaking, blinkRate } = metrics;

      // Face score
      let faceScore: number;
      if (faceCount === 1) faceScore = 1;
      else if (faceCount === 0) faceScore = 0;
      else faceScore = Math.max(0, 1 / faceCount);

      // gaze & speaking clamp
      const gazeScore = Math.min(Math.max(eyeContact, 0), 1);
      const speakScore = Math.min(Math.max(speaking, 0), 1);

      // blink score based on normalRate
      const normalBlinkRate = 0.08; // blinks/sec baseline
      let blinkScore = 1 - Math.min(1, Math.abs(blinkRate - normalBlinkRate) / normalBlinkRate);
      blinkScore = Math.max(0, Math.min(blinkScore, 1));

      const weighted =
        (this.W_FACE * faceScore +
          this.W_GAZE * gazeScore +
          this.W_SPEAK * speakScore +
          this.W_BLINK * blinkScore) /
        (this.W_FACE + this.W_GAZE + this.W_SPEAK + this.W_BLINK);

      return Math.max(0, Math.min(weighted, 1));
    }

    /**
     * Call this on every incoming metric (per-second).
     * Returns instant + aggregate + smoothed scores and violation flags.
     */
    public updateIntegrity(interviewId: string, metrics: IntegrityMetrics, now = Date.now()): IntegrityUpdateResponse {
      const state = this.initStateIfMissing(interviewId, now);

      // compute dt (seconds) since last update (used for accumulating sustained seconds)
      const dtSec = Math.max(0.001, (now - state.lastUpdatedAt) / 1000); // avoid 0

      // compute instant score
      const instantScore = this.calculateInstantScore(metrics);

      // derive sub-scores like faceScore/gaze/speak/blink (same breakdown as calculateInstantScore helper)
      const faceScore = (metrics.faceCount === 1) ? 1 : (metrics.faceCount === 0 ? 0 : Math.max(0, 1 / metrics.faceCount));
      const gazeScore = Math.min(Math.max(metrics.eyeContact, 0), 1);
      const speakScore = Math.min(Math.max(metrics.speaking, 0), 1);
      const normalBlinkRate = 0.08;
      let blinkScore = 1 - Math.min(1, Math.abs(metrics.blinkRate - normalBlinkRate) / normalBlinkRate);
      blinkScore = Math.max(0, Math.min(blinkScore, 1));

      // update sample counts - treat incoming pulses as 'dt' seconds worth of data
      // For simplicity when data arrives once per second dt~1 -> sampleCount increments by 1.
      const sampleWeight = dtSec; // treat sums as time-weighted
      state.sampleCount += sampleWeight;

      // running sums
      state.sumFaceScore += faceScore * sampleWeight;
      state.sumGazeScore += gazeScore * sampleWeight;
      state.sumSpeakScore += speakScore * sampleWeight;
      state.sumBlinkScore += blinkScore * sampleWeight;

      // EWMA smoothing
      const a = this.EWMA_ALPHA;
      state.ewmaFace = state.ewmaFace === 0 ? faceScore : a * faceScore + (1 - a) * state.ewmaFace;
      state.ewmaGaze = state.ewmaGaze === 0 ? gazeScore : a * gazeScore + (1 - a) * state.ewmaGaze;
      state.ewmaSpeak = state.ewmaSpeak === 0 ? speakScore : a * speakScore + (1 - a) * state.ewmaSpeak;
      state.ewmaBlink = state.ewmaBlink === 0 ? blinkScore : a * blinkScore + (1 - a) * state.ewmaBlink;

      // min/max instant
      state.minInstantScore = Math.min(state.minInstantScore, instantScore);
      state.maxInstantScore = Math.max(state.maxInstantScore, instantScore);

      // sustained violation counters
      if (metrics.faceCount > 1) {
        state.multipleFaceSeconds += dtSec;
      }
      if (metrics.faceCount === 0) {
        state.absentSeconds += dtSec;
      }
      if (gazeScore < 0.4) {
        state.lowEyeContactSeconds += dtSec;
      }

      // update flags once thresholds exceeded
      if (state.multipleFaceSeconds >= this.MULTIPLE_FACE_VIOLATION_SEC) state.violatedMultipleFaces = true;
      if (state.absentSeconds >= this.ABSENT_VIOLATION_SEC) state.violatedAbsent = true;
      if (state.lowEyeContactSeconds >= this.LOW_GAZE_VIOLATION_SEC) state.violatedLowEyeContact = true;

      // compute aggregated averages (time-weighted)
      const avgFace = state.sumFaceScore / Math.max(1e-9, state.sampleCount);
      const avgGaze = state.sumGazeScore / Math.max(1e-9, state.sampleCount);
      const avgSpeak = state.sumSpeakScore / Math.max(1e-9, state.sampleCount);
      const avgBlink = state.sumBlinkScore / Math.max(1e-9, state.sampleCount);

      const aggWeighted =
        (this.W_FACE * avgFace +
          this.W_GAZE * avgGaze +
          this.W_SPEAK * avgSpeak +
          this.W_BLINK * avgBlink) /
        (this.W_FACE + this.W_GAZE + this.W_SPEAK + this.W_BLINK);

      // combine smoothed sub-scores into a single EWMA-based combined score
      const smoothedCombined =
        (this.W_FACE * state.ewmaFace +
          this.W_GAZE * state.ewmaGaze +
          this.W_SPEAK * state.ewmaSpeak +
          this.W_BLINK * state.ewmaBlink) /
        (this.W_FACE + this.W_GAZE + this.W_SPEAK + this.W_BLINK);

      // Apply penalties to aggregated score for sustained violations
      let aggregateScore = aggWeighted;

      // If absent for too long -> set to zero (severe)
      if (state.absentSeconds > 5) {
        aggregateScore = this.ABSENT_PENALTY;
      } else {
        // Multiple faces penalty: scale by factor depending on minutes of violation
        if (state.multipleFaceSeconds > 0) {
          const minutes = state.multipleFaceSeconds / 60;
          // exponential decay penalty per minute of multiple-face presence
          const penalty = Math.pow(this.MULTIPLE_FACE_PENALTY_PER_MIN, minutes);
          aggregateScore = aggregateScore * penalty;
        }

        // Low gaze sustained penalty
        if (state.violatedLowEyeContact) {
          aggregateScore = aggregateScore * this.LOW_GAZE_PENALTY_FACTOR;
        }
      }

      // clamp
      const clamp = (v: number) => Math.max(0, Math.min(1, v));
      state.lastUpdatedAt = now;

      const resp: IntegrityUpdateResponse = {
        interviewId,
        instantScore: clamp(instantScore),
        aggregateScore: clamp(aggregateScore),
        smoothedScore: clamp(smoothedCombined),
        sampleCount: Math.round(state.sampleCount),
        violations: {
          multipleFaces: state.violatedMultipleFaces,
          absent: state.violatedAbsent,
          lowEyeContact: state.violatedLowEyeContact
        }
      };

      return resp;
    }

    /**
     * Call at the end of interview (or when you want a final score).
     * This computes a final aggregated score, returns it and clears state.
     */
    public finalizeIntegrity(interviewId: string): { finalScore: number; details: InterviewIntegrityState | null } {
      const state = this.integrityStates.get(interviewId);
      if (!state) return { finalScore: 1, details: null }; // no data -> be conservative or decide default

      // compute averages again
      const avgFace = state.sumFaceScore / Math.max(1e-9, state.sampleCount);
      const avgGaze = state.sumGazeScore / Math.max(1e-9, state.sampleCount);
      const avgSpeak = state.sumSpeakScore / Math.max(1e-9, state.sampleCount);
      const avgBlink = state.sumBlinkScore / Math.max(1e-9, state.sampleCount);

      let final =
        (this.W_FACE * avgFace +
          this.W_GAZE * avgGaze +
          this.W_SPEAK * avgSpeak +
          this.W_BLINK * avgBlink) /
        (this.W_FACE + this.W_GAZE + this.W_SPEAK + this.W_BLINK);

      // apply same penalties as updateIntegrity
      if (state.absentSeconds > 5) {
        final = this.ABSENT_PENALTY;
      } else {
        if (state.multipleFaceSeconds > 0) {
          const minutes = state.multipleFaceSeconds / 60;
          final = final * Math.pow(this.MULTIPLE_FACE_PENALTY_PER_MIN, minutes);
        }
        if (state.violatedLowEyeContact) {
          final = final * this.LOW_GAZE_PENALTY_FACTOR;
        }
      }

      final = Math.max(0, Math.min(1, final));
      // you may persist 'final' into DB here (Interview.summary etc.)

      // clear state
      this.integrityStates.delete(interviewId);

      return { finalScore: final, details: state };
    }
}

export const intergrityService = new IntergrityService();