# Evalia AI Coding Guidelines

## Architecture Overview

Evalia is a comprehensive microservices-based AI platform for interview and recruitment management:
- **Frontend**: Next.js 15 (React 19, TypeScript, Tailwind CSS, App Router, Redux Toolkit)
- **Resume Service**: Node.js/Express (MongoDB, Pinecone vector DB, OpenAI, Cloudinary, Winston logging)
- **Job Service**: Node.js/Express TypeScript (MongoDB, OpenAI/OpenRouter integration) 
- **Interview Engine**: Node.js/Express TypeScript (MongoDB, Socket.IO, Python integration for video analysis)
- **Notification Service**: Node.js/Express TypeScript (MongoDB, Socket.IO, SMTP, RabbitMQ)
- **Auth Server**: Spring Boot (Java 17, plain text responses, JWT, email verification)

## Microservices Ports & Integration

### Service Ports
- **Client (Next.js)**: http://localhost:3000
- **Auth Server (Spring Boot)**: http://localhost:8080  
- **Resume Service (Node.js)**: http://localhost:5001
- **Interview Engine (TypeScript)**: http://localhost:5000
- **Job Service (TypeScript)**: http://localhost:7001 (formerly upskill-engine)
- **Notification Service (TypeScript)**: http://localhost:6001

### Inter-service Communication
- **Job Service** ↔ **Resume Service**: Fetches resume data via GET `/api/resume/:id`
- **Interview Engine** ↔ **Job Service**: Fetches job details for interview scheduling
- **Notification Service** ↔ All services: Real-time notifications and email alerts
- **Client** ↔ All services: API integration through Next.js API routes

## Key Data Flow Patterns

### Resume Processing Pipeline
1. PDF upload → `resume-service/src/controllers/resumeController.js` → PDF parsing + AI analysis
2. Structured data → MongoDB (`Resume` model) + Pinecone vector storage (by industry namespace)
3. Search → Pinecone vector queries → candidate aggregation → frontend display

### Interview Flow
1. Schedule → Job Service validates job → Interview Engine creates interview transcript
2. Real-time video analysis → Python worker processes → Socket.IO updates
3. Completion → Notification Service sends alerts → Results stored in MongoDB

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

### TypeScript Services Architecture
**Modern Pattern** (Interview Engine, Job Service, Notification Service):
- `src/controllers/` → Business logic with async wrapper pattern
- `src/services/` → External integrations and data processing
- `src/models/` → MongoDB schemas with TypeScript interfaces
- `src/types/` → Zod schemas and TypeScript interfaces
- `src/utils/asyncHandler.ts` → Error handling wrapper
- `src/errors/` → Custom error classes extending base `CustomApiError`
- `src/middlewares/ErrorHandler.ts` → Global error handling

### Error Handling Pattern (TypeScript services)
```typescript
// Use asyncHandler wrapper instead of try-catch
export const controller = asyncHandler(async (req: Request, res: Response) => {
  const validation = Schema.safeParse(req.body);
  if (!validation.success) {
    throw new BadRequestError(`Validation failed: ${validation.error.issues.map(i => i.message).join(', ')}`);
  }
  // Business logic without try-catch - errors automatically handled by global middleware
});
```

### Component Architecture
- Break large components into focused pieces: `SearchBar`, `SearchFilters`, `ResultsTable`
- Use `types/` folder for all interface definitions across services
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

## Development Commands

### Resume Service
```bash
cd resume-service && npm run dev  # nodemon server.js (PORT 5000)
```

### Interview Engine  
```bash
cd interview_engine && npm run dev  # ts-node-dev (PORT 5000)
```

### Job Service
```bash
cd job-service && npm run dev       # nodemon ts-node (PORT 7000)  
```

### Notification Service
```bash
cd notification-service && npm run dev  # ts-node (PORT 6000)
```

### Client  
```bash
cd client && npm run dev            # Next.js on port 3000
```

### Spring Boot Server
```bash
cd server/server && ./mvnw spring-boot:run  # port 8080
```

## Environment Dependencies

### Core Services
**Resume Service**:
- `PINECONE_API_KEY` - Vector database
- `MONGODB_URI` - Resume storage  
- `CLOUDINARY_URL` - PDF file storage
- `OPENAI_API_KEY` - Resume analysis
- `PORT` - Default 5001

**Interview Engine**:
- `MONGODB_URI` - Interview data storage
- `PORT` - Default 5000

**Job Service**:
- `MONGODB_URI` - Job postings storage
- `OPEN_ROUTER_API_KEY` - AI analysis
- `AI_SERVER_URL` - Resume service integration
- `PORT` - Default 7001

**Notification Service**:
- `MONGODB_URI` - Notifications storage
- `SMTP_*` - Email configuration
- `BROKER_URL` - RabbitMQ for message queuing
- `AI_SERVER_URL`, `UPSKILL_ENGINE_URL` - Service integration
- `PORT` - Default 6001

## Socket.IO & Real-time Features

### Interview Engine WebSocket
- Real-time video frame processing during interviews
- Python worker integration for emotion/engagement analysis
- Bi-directional communication between client and server

### Notification Service WebSocket  
- Real-time notifications across all services
- In-app notification system
- Email notifications with SMTP integration

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
- Redux: `redux/features/`, `redux/lib/`

### TypeScript Services Structure  
- Routes → Controllers → Services → Models
- Utils for cross-cutting concerns (`asyncHandler.ts`, `logger.ts`)
- Config for external integrations (`database.ts`, `env.ts`)
- Types with Zod schemas for validation

### JavaScript Services (Resume Service)
- Routes → Controllers → Services → Models
- Utils for cross-cutting concerns (`logger.js`, `resumeHelper.js`)
- Config for external integrations (`database.js`, `Cloudinary.js`)

## Debugging & Monitoring

- Winston logging with structured format across all Node.js services
- Console logs for vector search debugging
- Error handling with specific status codes and global middleware
- MongoDB connection graceful degradation in development

## Integration Points

- **Pinecone**: Section-based vector storage with industry namespaces
- **Cloudinary**: PDF storage with download URL generation  
- **OpenAI/OpenRouter**: Resume content analysis and job description parsing
- **MongoDB**: Structured data across all microservices
- **Socket.IO**: Real-time communication for interviews and notifications
- **RabbitMQ**: Message queuing for reliable notification delivery
- **SMTP**: Email notifications and OTP delivery

## Key Endpoints Summary

### Resume Service (5001)
- Health: `GET /api/health`
- Resume: `POST /api/resume/upload`, `GET /api/resume/:id`, `POST /api/resume/basic-search`

### Job Service (7001)  
- Jobs: `GET/POST /api/jobs`, `GET /api/jobs/:jobId`
- Overview: `POST /api/overview` (resume vs job comparison)

### Interview Engine (5000)
- Interviews: `POST /api/interviews/schedule`, `PUT /api/interviews/:id/transcript`
- WebSocket: Real-time video processing

### Notification Service (6001)
- Notifications: `GET/POST /api/notifications`  
- WebSocket: Real-time notification delivery

### Client Integration Notes
- Environment variables use `NEXT_PUBLIC_` prefix for client-side access
- API routes handle service communication and response formatting
- Redux for state management across components
- React 19 with modern hooks and concurrent features
