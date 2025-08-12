# Microservices Ports & Endpoints

This reference lists the dev ports, base URLs, and key endpoints for each service in the Evalia stack.

## Summary

- Client (Next.js): http://localhost:3000
- Spring Boot Auth: http://localhost:8080
- AI Server (Node/Express): http://localhost:5001
- Upskill Engine (Node/Express TypeScript): http://localhost:7001

Environment overrides:
- Client: PORT (Next dev uses 3000 by default)
- Spring Boot: server.port (application.properties)
- AI Server: PORT (defaults to 5001)
- Upskill Engine: PORT (defaults to 7001)

## Client (Next.js)
- Base URL: http://localhost:3000
- Dev: `cd client; npm run dev`
- Notes: Uses App Router and communicates with Auth and Upskill Engine via API routes.

## Spring Boot Auth Server
- Base URL: http://localhost:8080
- Dev: `cd server/server; ./mvnw spring-boot:run`
- Response format: Often plain text. Always check `content-type` and handle text fallback.

Key endpoints (examples):
- POST /register
- POST /login
- POST /verify-otp

## AI Server (Resume + Vector)
- Base URL: http://localhost:5001
- Dev: `cd aiServer; npm run dev`
- Env: PINECONE_API_KEY, OPENAI_API_KEY, CLOUDINARY_URL, MONGODB_URI, PORT

Endpoints:
- GET /api/health
- POST /api/resume/upload
- POST /api/resume/save
- POST /api/resume/get-resume
- GET /api/resume/:id
- GET /api/resume/:id/download
- POST /api/resume/basic-search

Notes:
- Pinecone index: resume-bot, namespace per industry.
- When reading Pinecone results, use `response.result.hits[].fields.candidate_email`.

## Upskill Engine (TypeScript)
- Base URL: http://localhost:7001
- Dev: `cd upskill-engine; npm run dev`
- Env: AI_SERVER_URL or RESUME_SERVER_URL (base to call AI Server), PORT

Endpoints:
- GET /api/health
- Jobs:
  - GET /api/jobs
  - POST /api/jobs
  - GET /api/jobs/:jobId
  - GET /api/jobs/company/:companyName
- Overview:
  - POST /api/overview   (body: { resumeId, jobDescription })

Notes:
- The Overview flow fetches resume data from AI Server at GET /api/resume/:id, extracts key parts, and compares to a job description via OpenRouter.
- Ensure OPENAI/OPEN_ROUTER API key is configured for LLM calls.

## CORS & Origins
- AI Server CORS defaults: http://localhost:3000, http://localhost:3001
- Adjust via CORS_ORIGINS in `aiServer/src/config/index.js`.
