// Demo mode serves a self-contained mock backend in the browser so the UI can be
// hosted (e.g. on Vercel) without the Spring Boot / Node microservices behind it.
export const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export const DEMO_CANDIDATE_EMAIL = 'candidate@demo.evalia.app'
export const DEMO_RECRUITER_EMAIL = 'recruiter@demo.evalia.app'
