# Evalia AI Coding Guidelines

## Architecture Overview

Evalia is a 3-tier AI-powered resume analysis platform:
- **Frontend**: Next.js 15 (TypeScript, Tailwind CSS, App Router) 
- **AI Server**: Node.js/Express (MongoDB, Pinecone vector DB, OpenAI, Cloudinary)
- **Auth Server**: Spring Boot (Java 17, plain text responses)

## Key Data Flow Patterns

### Resume Processing Pipeline
1. PDF upload → `aiServer/src/controllers/resumeController.js` → PDF parsing + AI analysis
2. Structured data → MongoDB (`Resume` model) + Pinecone vector storage (by industry namespace)
3. Search → Pinecone vector queries → candidate aggregation → frontend display

### Authentication Flow  
- Registration: Next.js API route → Spring Boot → OTP email → verification
- **Critical**: Spring Boot returns plain text, not JSON - handle both formats in API routes

## Vector Search Architecture

**Pinecone Structure**: 
- Index: `resume-bot`
- Namespaces: Industry-based (`"STEM & Technical"`, `"Business, Finance & Administration"`, etc.)
- Records: `{email}_skills`, `{email}_education`, `{email}_projects`, `{email}_experience`

**Response Format**:
```javascript
// Pinecone returns: response.result.hits[].fields.candidate_email
// NOT: response.records[].metadata.candidate_email
```

## Critical Development Patterns

### Component Architecture
- Break large components into focused pieces: `SearchBar`, `SearchFilters`, `ResultsTable`
- Use `types/resume.ts` for all interface definitions
- Centralized candidate aggregation in `resumeHelper.js`

### API Response Handling
```typescript
// Always handle both JSON and plain text from Spring Boot
const contentType = response.headers.get('content-type')
if (contentType?.includes('application/json')) {
  result = await response.json()
} else {
  result = { message: await response.text() }
}
```

### Vector DB Service Pattern
```javascript
// Industry namespace targeting
const index = pc.index("resume-bot").namespace(industry)

// Section-wise search and aggregation
const sectionResults = response.result.hits.map((record) => ({
  candidateEmail: record.fields?.candidate_email,  // NOT metadata
  score: record._score,  // NOT score
  id: record._id  // NOT id
}))
```

## Development Commands

### AI Server
```bash
cd aiServer && npm run dev  # nodemon server.js (PORT from env, default 5001)
```

### Client  
```bash
cd client && npm run dev    # Next.js on port 3000
```

### Spring Boot Server
```bash
cd server/server && ./mvnw spring-boot:run  # port 8080
```

### Upskill Engine (TypeScript)
```bash
cd upskill-engine
npm run dev           # ts-node/nodemon (PORT from env, default 7001)
npm run build; npm start  # build to dist and run
```

## Environment Dependencies

**Required ENV variables**:
- `PINECONE_API_KEY` - Vector database
- `MONGODB_URI` - Resume storage  
- `CLOUDINARY_URL` - PDF file storage
- `OPENAI_API_KEY` - Resume analysis

## Font & Styling Conventions

- Use Roboto Mono for form inputs: `font-family: 'Roboto Mono', monospace`
- Dark theme with colors: `bg-[#3E3232]`, `text-[#c5b2b2]`, `border-[#ac8e8e]`
- Component styling: Tailwind with consistent spacing and hover states

## File Organization Patterns

### Next.js Structure
- API routes: `app/api/[feature]/[action]/route.ts`
- Pages: `app/[feature]/page.tsx` 
- Components: `components/[feature]/ComponentName.tsx`
- Types: `types/[domain].ts`

### AI Server Structure  
- Routes → Controllers → Services → Models
- Utils for cross-cutting concerns (`logger.js`, `resumeHelper.js`)
- Config for external integrations (`database.js`, `Cloudinary.js`)

## Debugging & Monitoring

- Winston logging with structured format
- Console logs for vector search debugging
- Error handling with specific status codes
- MongoDB connection graceful degradation in development

## Integration Points

- **Pinecone**: Section-based vector storage with industry namespaces
- **Cloudinary**: PDF storage with download URL generation  
- **OpenAI**: Resume content analysis and job description parsing
- **MongoDB**: Structured resume data with embedded subdocuments

## Service Ports & Key Endpoints

- Client (Next.js): http://localhost:3000
- Spring Boot Auth: http://localhost:8080
- AI Server (Node/Express): http://localhost:5001
  - Health: GET /api/health
  - Resume:
    - GET /api/resume/:id
    - POST /api/resume/upload
    - POST /api/resume/save
    - GET /api/resume/:id/download
    - POST /api/resume/basic-search
- Upskill Engine (Node/Express TS): http://localhost:7001
  - Health: GET /api/health
  - Jobs: GET/POST /api/jobs, GET /api/jobs/:jobId, GET /api/jobs/company/:companyName
  - Overview: POST /api/overview  (body: { resumeId, jobDescription })

Notes:
- Upskill Engine calls AI Server to fetch resumes by ID at GET /api/resume/:id.
- OpenRouter is used inside Upskill Engine for resume vs JD comparison (requires OPENAI/OPEN_ROUTER key).
