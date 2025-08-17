# 🚀 Evalia Upskill Engine

A TypeScript-based microservice that powers job matching, skill analysis, and career development recommendations within the Evalia AI resume analysis platform. This service bridges resume data with job opportunities to provide intelligent career insights.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)

## 🎯 Overview

The Upskill Engine is a core component of the Evalia ecosystem, responsible for:

- **Job Management**: CRUD operations for job postings and company data
- **Resume-Job Matching**: AI-powered compatibility analysis
- **Skill Gap Analysis**: Identifying missing skills for career advancement
- **Career Recommendations**: Personalized upskilling suggestions
- **Company Insights**: Job market analysis by company and industry

### Service Position in Microservice Architecture

```mermaid
graph TD
    A[Client Frontend] --> B[Upskill Engine]
    C[AI Server] --> B
    D[Auth Server] --> B
    E[Notification Service] --> B
    B --> F[MongoDB]
    B --> G[OpenRouter AI]
    B --> H[External Job APIs]
```

## 🏗️ Architecture

### Microservice Ecosystem Integration

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   AI Server     │    │ Notification    │
│   (Next.js)     │    │  (Node.js)      │    │   Service       │
│   Port: 3000    │    │  Port: 5001     │    │  Port: 6000     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │   Upskill Engine        │
                    │    (TypeScript)         │
                    │     Port: 7000          │
                    └─────────────┬───────────┘
                                  │
                    ┌─────────────┴───────────┐
                    │     Auth Server         │
                    │    (Spring Boot)        │
                    │      Port: 8080         │
                    └─────────────────────────┘
```

### Core Components

- **Job Controller**: RESTful job management APIs
- **Overview Controller**: Resume-job compatibility analysis
- **Job Service**: Business logic for job operations
- **Overview Service**: AI-powered resume analysis
- **OpenRouter Integration**: LLM-based skill analysis
- **MongoDB Models**: Data persistence layer

## ✨ Features

### 💼 Job Management System
- **CRUD Operations**: Create, read, update, delete job postings
- **Company Management**: Store and manage company information
- **Job Search & Filtering**: Advanced search with multiple criteria
- **Pagination Support**: Efficient data retrieval for large datasets

### 🎯 AI-Powered Resume Analysis
- **Resume-Job Matching**: Compatibility scoring using LLM analysis
- **Skill Gap Identification**: Pinpoint missing skills for target roles
- **Career Path Recommendations**: Personalized upskilling suggestions
- **Industry Insights**: Market trends and demand analysis

### 🔍 Advanced Job Analytics
- **Company Insights**: Jobs and hiring patterns by company
- **Skill Demand Analysis**: Market demand for specific skills
- **Salary Range Analysis**: Compensation insights by role/location
- **Job Market Trends**: Historical and predictive analytics

### 🔧 Developer Features
- **Interactive API Documentation**: Swagger UI at `/api/docs`
- **Type Safety**: Full TypeScript implementation with Zod validation
- **Comprehensive Logging**: Winston-based structured logging
- **Health Monitoring**: Service health checks and metrics

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB 6.0+
- TypeScript knowledge
- OpenRouter API key for AI features

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Imran-2020331101/evalia.git
cd evalia/upskill-engine

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run in development mode
npm run dev

# Build for production
npm run build
npm start
```

### Docker Setup

```bash
# Build Docker image
docker build -t evalia-upskill-engine .

# Run with Docker Compose
docker-compose up -d
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=7000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/evalia

# AI Integration
OPEN_ROUTER_API_KEY=sk-or-v1-your-api-key-here

# Security & CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info

# External Services
AI_SERVER_URL=http://localhost:5001
NOTIFICATION_SERVICE_URL=http://localhost:6000
AUTH_SERVER_URL=http://localhost:8080
```

### Service Configuration Matrix

| Service | Port | Purpose | Database | AI Provider |
|---------|------|---------|----------|-------------|
| **Upskill Engine** | **7000** | **Job Matching & Analysis** | **MongoDB** | **OpenRouter** |
| Client | 3000 | Next.js Frontend | - | - |
| AI Server | 5001 | Resume Processing | MongoDB | OpenAI/Pinecone |
| Notification | 6000 | Real-time Notifications | MongoDB | - |
| Auth Server | 8080 | Authentication | Database | - |

## 📡 API Documentation

### Interactive Documentation
Access the full API documentation at: `http://localhost:7000/api/docs`

### Core Endpoints

#### Health & Status
```http
GET /api/health
```
Returns service health and dependency status.

#### Job Management
```http
# Get all jobs with pagination and filtering
GET /api/jobs?page=1&limit=10&company=Google&type=Full-time

# Get job by ID
GET /api/jobs/:jobId

# Create new job posting
POST /api/jobs

# Update existing job
PUT /api/jobs/:jobId

# Delete job
DELETE /api/jobs/:jobId

# Get jobs by company
GET /api/jobs/company/:companyName
```

#### Resume-Job Analysis
```http
# Analyze resume compatibility with job
POST /api/overview

Request Body:
{
  "resumeId": "60f7b3b4e1b2c3d4e5f6g7h8",
  "jobId": "60f7b3b4e1b2c3d4e5f6g7h9"
}

Response:
{
  "success": true,
  "data": {
    "matchPercentage": 85,
    "fit": "Good Fit",
    "strengths": ["React expertise", "5+ years experience"],
    "weaknesses": ["Missing AWS certification", "No GraphQL experience"],
    "recommendations": ["Complete AWS Solutions Architect course"]
  }
}
```

### Request/Response Examples

#### Create Job Posting
```http
POST /api/jobs
Content-Type: application/json

{
  "title": "Senior Frontend Developer",
  "company": {
    "name": "TechCorp Inc",
    "website": "https://techcorp.com",
    "location": "San Francisco, CA"
  },
  "jobDescription": "We are seeking a Senior Frontend Developer...",
  "requiredSkills": [
    {
      "name": "React",
      "importance": "critical"
    },
    {
      "name": "TypeScript", 
      "importance": "high"
    }
  ],
  "jobType": "Full-time",
  "workplaceType": "Remote",
  "employmentLevel": "Senior",
  "salary": {
    "min": 120000,
    "max": 180000,
    "currency": "USD"
  }
}
```

#### Job Search with Filters
```http
GET /api/jobs?company=Google&type=Full-time&level=Senior&remote=true&page=1&limit=20
```

## 🔧 Development

### Project Structure

```
upskill-engine/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts      # MongoDB connection
│   │   ├── index.ts         # Environment config
│   │   ├── logger.ts        # Winston logging setup
│   │   └── OpenRouter.ts    # AI client configuration
│   │
│   ├── controllers/         # Request handlers
│   │   ├── jobController.ts     # Job CRUD operations
│   │   └── overviewController.ts # Resume analysis
│   │
│   ├── docs/               # API documentation
│   │   └── openapi.ts      # Swagger/OpenAPI spec
│   │
│   ├── middleware/         # Express middleware
│   │   └── errorHandler.ts # Global error handling
│   │
│   ├── models/            # Database models
│   │   └── JobDetails.ts   # MongoDB job schema
│   │
│   ├── prompts/           # AI prompts
│   │   └── overview.ts     # Resume analysis prompts
│   │
│   ├── routes/            # API routes
│   │   ├── index.ts        # Route aggregator
│   │   ├── jobRoutes.ts    # Job endpoints
│   │   └── overview.ts     # Analysis endpoints
│   │
│   ├── services/          # Business logic
│   │   ├── jobService.ts       # Job operations
│   │   └── overviewService.ts  # Resume analysis
│   │
│   ├── types/             # TypeScript definitions
│   │   ├── job.types.ts    # Job-related types
│   │   └── resume.types.ts # Resume-related types
│   │
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
│
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env                  # Environment variables
└── README.md            # This file
```

### Available Scripts

```bash
# Development
npm run dev          # Start with nodemon and ts-node
npm run build        # Compile TypeScript to dist/
npm run start        # Start production server

# Database
npm run db:seed      # Seed sample job data
npm run db:migrate   # Run database migrations
```

### Key Dependencies

```json
{
  "dependencies": {
    "express": "^4.21.2",      
    "mongoose": "^8.17.0",     
    "openai": "^5.11.0",       
    "zod": "^3.22.4",          // Runtime type validation
    "winston": "^3.17.0",      
    "swagger-ui-express": "^5.0.1" 
  },
  "devDependencies": {
    "typescript": "^5.3.3",    
    "ts-node": "^10.9.2",      
    "nodemon": "^3.1.10"       
  }
}
```

### Development Workflow

1. **Setup**: Clone repo and install dependencies
2. **Environment**: Configure `.env` file with required variables
3. **Database**: Ensure MongoDB connection is available
4. **Development**: Run `npm run dev` for auto-reload
5. **API Testing**: Use Swagger UI at `/api/docs`
6. **Build**: Use `npm run build` for production compilation

## 🧪 Testing

### Test Structure

```bash
# Unit Tests
npm run test:unit
# Tests individual functions and classes

# Integration Tests  
npm run test:integration
# Tests API endpoints and database operations

# End-to-End Tests
npm run test:e2e
# Tests complete user workflows

# Load Testing
npm run test:load
# Performance and stress testing
```

### Example Test Cases

```typescript
describe('Job Controller', () => {
  test('should create job with valid data', async () => {
    const response = await request(app)
      .post('/api/jobs')
      .send(validJobData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(validJobData.title);
  });

  test('should reject invalid job data', async () => {
    const response = await request(app)
      .post('/api/jobs')
      .send(invalidJobData)
      .expect(400);
    
    expect(response.body.success).toBe(false);
  });
});
```

##  Deployment

### Production Build

```bash
# Build for production
npm run build

# Start production server
NODE_ENV=production npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY dist ./dist

# Expose port
EXPOSE 7000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7000/api/health || exit 1

# Start application
CMD ["node", "dist/index.js"]
```

### Monitoring & Health Checks

#### Health Endpoint Response
```json
{
  "status": "healthy",
  "timestamp": "2025-08-12T10:30:00.000Z",
  "services": {
    "database": "connected",
    "openrouter": "available",
    "aiServer": "reachable"
  },
  "metrics": {
    "uptime": "2d 4h 30m",
    "totalJobs": 1245,
    "analysisToday": 89,
    "memoryUsage": "124MB"
  }
}
```

##  Monitoring & Analytics

### Key Metrics

- **Job Analytics**: Creation, updates, views by company/industry
- **Analysis Performance**: Resume-job matching success rates
- **User Engagement**: API usage patterns and popular endpoints
- **System Performance**: Response times, memory usage, error rates

### Logging Strategy

```typescript
// Structured logging example
logger.info('Job analysis completed', {
  correlationId: 'req-123',
  userId: 'user-456',
  jobId: 'job-789',
  matchScore: 85,
  processingTime: '2.3s'
});
```

## 🔄 Integration with Other Services

### AI Server Integration
- **Resume Fetching**: Retrieves processed resume data
- **Skill Extraction**: Gets structured skill information
- **Experience Analysis**: Accesses work history data

### Notification Service Integration
- **Job Matching Alerts**: Sends notifications for new opportunities
- **Analysis Completion**: Notifies users when analysis is ready
- **System Updates**: Broadcasts service status changes

### Client Application Integration
- **Job Search UI**: Provides job listing and filtering
- **Analysis Dashboard**: Displays resume-job compatibility
- **Career Recommendations**: Shows upskilling suggestions


### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb TypeScript configuration  
- **Prettier**: Consistent code formatting
- **Zod**: Runtime type validation for all APIs
- **Testing**: Jest + Supertest for API testing

## 📄 License

This project is part of the Evalia platform and is proprietary software. All rights reserved.

## 🔗 Related Services

- [AI Server](../aiServer/README.md) - Resume processing and analysis
- [Notification Service](../notification-service/README.md) - Real-time notifications
- [Client Application](../client/README.md) - Next.js frontend
- [Auth Server](../server/README.md) - Spring Boot authentication service

---

**Built with 🚀 by the Evalia Development Team**