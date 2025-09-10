# Evalia AI Coding Guidelines

## Architecture Overview

Evalia is a comprehensive microservices-based AI platform for interview and recruitment management:
- **Frontend**: Next.js 15 (React 19, TypeScript, Tailwind CSS, App Router, Redux Toolkit)
- **Resume Service**: Node.js/Express TypeScript (MongoDB, Pinecone vector DB, OpenAI, Cloudinary, Winston logging, Zod validation)
- **Job Service**: Node.js/Express TypeScript (MongoDB, OpenAI/OpenRouter integration, Zod validation) 
- **Interview Engine**: Node.js/Express TypeScript (MongoDB, Socket.IO, Python integration for video analysis, Winston logging)
- **Notification Service**: Node.js/Express TypeScript (MongoDB, Socket.IO, SMTP, RabbitMQ, Winston logging)
- **Auth Server**: Spring Boot (Java 17, plain text responses, JWT, email verification)

## Microservices Ports & Integration

### Service Ports
- **Client (Next.js)**: http://localhost:3000
- **Auth Server (Spring Boot)**: http://localhost:8080  
- **Resume Service (TypeScript)**: http://localhost:5000
- **Interview Engine (TypeScript)**: http://localhost:4000
- **Job Service (TypeScript)**: http://localhost:7001 (formerly upskill-engine)
- **Notification Service (TypeScript)**: http://localhost:6000

### Inter-service Communication
- **Job Service** ↔ **Resume Service**: Fetches resume data via GET `/api/resume/:id`
- **Interview Engine** ↔ **Job Service**: Fetches job details for interview scheduling
- **Notification Service** ↔ All services: Real-time notifications and email alerts
- **Client** ↔ All services: API integration through Next.js API routes

## Key Data Flow Patterns

### Resume Processing Pipeline
1. PDF upload → `resume-service/src/controllers/resumeController.ts` → PDF parsing + AI analysis
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
**All Backend Services Now Use TypeScript** (Resume Service, Interview Engine, Job Service, Notification Service):
- `src/controllers/` → Business logic with async wrapper pattern and Zod validation
- `src/services/` → External integrations and data processing
- `src/models/` → MongoDB schemas with TypeScript interfaces
- `src/types/` → Zod schemas and TypeScript interfaces
- `src/utils/asyncHandler.ts` → Error handling wrapper (used in newer services)
- `src/errors/` → Custom error classes extending base `CustomApiError`
- `src/middlewares/ErrorHandler.ts` → Global error handling
- `src/config/` → Centralized configuration with environment validation

### Error Handling Pattern (TypeScript services)
```typescript
// Resume Service uses enhanced error handling with comprehensive logging
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../errors';
import { ValidationSchema } from '../types';

export const controller = asyncHandler(async (req: Request, res: Response) => {
  const validation = ValidationSchema.safeParse(req.body);
  if (!validation.success) {
    throw new BadRequestError(`Validation failed: ${validation.error.issues.map(i => i.message).join(', ')}`);
  }
  // Business logic without try-catch - errors automatically handled by global middleware
});
```

### Component Architecture
- Break large components into focused pieces: `SearchBar`, `SearchFilters`, `ResultsTable`
- Use `types/` folder for all interface definitions across services
- Centralized candidate aggregation in `resume-helper.ts` (Resume Service)

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

### Resume Service (TypeScript)
```bash
cd resume-service && npm run dev  # ts-node-dev --respawn (PORT 5001)
```

### Interview Engine (TypeScript)
```bash
cd interview_engine && npm run dev  # ts-node-dev --respawn (PORT 5000)
```

### Job Service (TypeScript)
```bash
cd job-service && npm run dev       # nodemon ts-node (PORT 7001)  
```

### Notification Service (TypeScript)
```bash
cd notification-service && npm run dev  # nodemon ts-node (PORT 6001)
```

### Client  
```bash
cd client && npm run dev            # Next.js on port 3000
```

### Spring Boot Server
```bash
cd server/server && ./mvnw spring-boot:run  # port 8080
```

## Build & Production Commands

### TypeScript Services Build Process
```bash
# Resume Service
cd resume-service && npm run build && npm start

# Interview Engine
cd interview_engine && npm run build && npm start

# Job Service  
cd job-service && npm run build && npm start

# Notification Service
cd notification-service && npm run build && npm start
```

### Development Hot Reload
All TypeScript services use `ts-node-dev` or `nodemon` with TypeScript compilation:
- Resume Service: `ts-node-dev --respawn --transpile-only`
- Others: `nodemon --exec ts-node`

## Environment Dependencies

### Core Services
**Resume Service (TypeScript)**:
- `PINECONE_API_KEY` - Vector database
- `MONGODB_URI` - Resume storage  
- `CLOUDINARY_URL` - PDF file storage
- `OPENAI_API_KEY` - Resume analysis
- `OPENROUTER_API_KEY` - Alternative AI analysis
- `MAX_FILE_SIZE` - File upload limits
- `CORS_ORIGINS` - Frontend URLs
- `LOG_LEVEL`, `LOG_DIR` - Enhanced logging configuration
- `PORT` - Default 5001

**Interview Engine (TypeScript)**:
- `MONGODB_URI` - Interview data storage
- `PORT` - Default 5000

**Job Service (TypeScript)**:
- `MONGODB_URI` - Job postings storage
- `OPEN_ROUTER_API_KEY` - AI analysis
- `AI_SERVER_URL` - Resume service integration
- `PORT` - Default 7001

**Notification Service (TypeScript)**:
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

## TypeScript Migration Benefits

### Resume Service Enhanced Features
- **Comprehensive Type Safety**: Full TypeScript implementation with strict typing
- **Advanced Configuration**: Centralized config with environment validation
- **Enhanced Error Handling**: Custom error classes with proper inheritance
- **Structured Logging**: Winston with metadata and log rotation
- **File Processing**: Robust PDF parsing with error recovery
- **Security**: Enhanced middleware stack with request validation
- **Performance**: Optimized file uploads and vector operations

### Shared TypeScript Patterns
- **Zod Validation**: Runtime type checking across all services
- **Async Error Handling**: Centralized error wrapper patterns
- **Database Models**: Strongly typed MongoDB schemas
- **API Responses**: Consistent response structures with TypeScript
- **Configuration Management**: Type-safe environment variable handling

## File Organization Patterns

### Next.js Structure (Client)
- API routes: `app/api/[feature]/[action]/route.ts`
- Pages: `app/[feature]/page.tsx` 
- Components: `components/[feature]/ComponentName.tsx`
- Types: `types/[domain].ts` and `app/types/[domain].d.ts`
- Redux: `redux/features/`, `redux/lib/`

### TypeScript Services Structure (All Backend Services)
- **Resume Service**: `src/` with full TypeScript migration
  - Controllers with Zod validation
  - Enhanced logging and error handling  
  - Comprehensive configuration management
  - Type-safe database operations
- **Interview Engine**: `src/` with Socket.IO integration
- **Job Service**: `src/` with OpenRouter AI integration  
- **Notification Service**: `src/` with email and WebSocket support

### TypeScript Services Structure  
- Routes → Controllers → Services → Models
- Utils for cross-cutting concerns (`asyncHandler.ts`, `logger.ts`)
- Config for external integrations (`database.ts`, `index.ts`)
- Types with Zod schemas for validation
- Enhanced middleware for security and logging

### Legacy JavaScript Services
- None - All backend services have been migrated to TypeScript

**Note**: There may be a legacy `interview-engine` (JavaScript) directory alongside the new `interview_engine` (TypeScript). Always use the TypeScript version for development.

## Debugging & Monitoring

- Winston logging with structured format across all TypeScript services
- Enhanced logging with metadata in Resume Service (`src/utils/logger.ts`)
- Console logs for vector search debugging
- Error handling with specific status codes and global middleware
- MongoDB connection graceful degradation in development
- Comprehensive configuration validation with meaningful error messages

## Integration Points

- **Pinecone**: Section-based vector storage with industry namespaces
- **Cloudinary**: PDF storage with download URL generation  
- **OpenAI/OpenRouter**: Resume content analysis and job description parsing
- **MongoDB**: Structured data across all microservices with TypeScript models
- **Socket.IO**: Real-time communication for interviews and notifications
- **RabbitMQ**: Message queuing for reliable notification delivery
- **SMTP**: Email notifications and OTP delivery
- **Zod**: Runtime validation across all TypeScript services
- **Winston**: Structured logging with metadata across all services

## Key Endpoints Summary

### Resume Service (5001)
- Health: `GET /health`
- Resume: `POST /api/resume/upload`, `GET /api/resume/:id`, `POST /api/resume/basic-search`
- Vector Search: Advanced Pinecone integration with industry-specific namespaces

### Job Service (7001)  
- Jobs: `GET/POST /api/jobs`, `GET /api/jobs/:jobId`
- Overview: `POST /api/overview` (resume vs job comparison)

### Interview Engine (5000)
- Interviews: `POST /api/interviews/schedule`, `PUT /api/interviews/:id/transcript`
- WebSocket: Real-time video processing with Python worker integration

### Notification Service (6001)
- Notifications: `GET/POST /api/notifications`  
- WebSocket: Real-time notification delivery
- Email: SMTP integration with RabbitMQ queuing

### Client Integration Notes
- Environment variables use `NEXT_PUBLIC_` prefix for client-side access
- API routes handle service communication and response formatting
- Redux for state management across components
- React 19 with modern hooks and concurrent features
- Enhanced TypeScript integration across all services
