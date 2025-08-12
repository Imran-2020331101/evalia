# Evalia - AI-Powered Resume Analysis Platform

<div align="center">
  <img src="./client/public/evalia-logo.png" alt="Evalia Logo" width="200"/>
  
  <p><strong>Intelligent Resume Analysis & Job Matching Platform</strong></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
  [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
</div>

## 🚀 Overview

Evalia is a comprehensive 3-tier AI-powered platform that revolutionizes resume analysis and job matching. It combines advanced AI technologies with modern web development to provide intelligent insights, personalized career recommendations, and seamless job matching experiences.

### ✨ Key Features

- **🤖 AI-Powered Resume Analysis** - Advanced parsing and skill extraction using OpenAI
- **🎯 Intelligent Job Matching** - Vector-based similarity search with industry-specific namespacing
- **📊 Career Insights** - Personalized recommendations and skill gap analysis
- **🔔 Real-time Notifications** - WebSocket-based notification system with persistent storage
- **👥 Multi-Role Support** - Separate interfaces for job seekers and recruiters
- **🗣️ Voice Integration** - AI-powered voice interactions using Vapi
- **📈 Analytics Dashboard** - Comprehensive analytics with Material-UI charts
- **🔒 Secure Authentication** - JWT-based authentication with OTP verification

## 🏗️ Architecture

Evalia follows a microservices architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   AI Server     │    │ Upskill Engine  │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (TypeScript)  │
│   Port: 3000    │    │   Port: 5001    │    │   Port: 7001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Server   │    │ Notification    │    │   External      │
│  (Spring Boot)  │    │   Service       │    │   Services      │
│   Port: 8080    │    │   Port: 6000    │    │ (OpenAI, etc.)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔧 Technology Stack

#### Frontend (Client)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Material-UI
- **State Management**: Redux Toolkit
- **Real-time**: Socket.io Client
- **Animations**: GSAP
- **Voice**: Vapi AI Integration

#### Backend Services

##### AI Server (Node.js)
- **Runtime**: Node.js with Express
- **Database**: MongoDB (Resume storage)
- **Vector DB**: Pinecone (Semantic search)
- **File Storage**: Cloudinary (PDF management)
- **AI**: OpenAI GPT models for analysis

##### Upskill Engine (TypeScript)
- **Runtime**: Node.js with Express + TypeScript
- **Purpose**: Job matching and career recommendations
- **AI**: OpenRouter for resume-job comparison

##### Auth Server (Spring Boot)
- **Framework**: Spring Boot 3.5.3
- **Language**: Java 17
- **Authentication**: JWT + OTP verification
- **Response Format**: Plain text responses

##### Notification Service (Node.js)
- **Runtime**: Node.js with Express + TypeScript
- **Real-time**: Socket.io server
- **Message Queue**: RabbitMQ (AMQP)
- **Database**: MongoDB (Notification persistence)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- MongoDB
- Redis (optional)
- Maven

### Environment Variables

Create `.env` files in each service directory:

#### Client (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_AUTH_URL=http://localhost:8080
NEXT_PUBLIC_UPSKILL_URL=http://localhost:7001
NEXT_PUBLIC_NOTIFICATION_URL=http://localhost:6000
```

#### AI Server (`.env`)
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/evalia
PINECONE_API_KEY=your_pinecone_key
OPENAI_API_KEY=your_openai_key
CLOUDINARY_URL=your_cloudinary_url
```

#### Upskill Engine (`.env`)
```env
PORT=7001
MONGODB_URI=mongodb://localhost:27017/evalia
OPENAI_API_KEY=your_openai_key
AI_SERVER_URL=http://localhost:5001
```

#### Notification Service (`.env`)
```env
PORT=6000
MONGODB_URI=mongodb://localhost:27017/evalia
RABBITMQ_URL=amqp://localhost
JWT_SECRET=your_jwt_secret
```

#### Auth Server (`application.properties`)
```properties
server.port=8080
spring.mail.host=smtp.gmail.com
spring.mail.username=your_email
spring.mail.password=your_app_password
```

### Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/Imran-2020331101/evalia.git
cd evalia
```

2. **Install dependencies for all services**
```bash
# Root dependencies
npm install

# Frontend
cd client && npm install

# AI Server
cd ../aiServer && npm install

# Upskill Engine
cd ../upskill-engine && npm install

# Notification Service
cd ../notification-service && npm install

# Auth Server (Maven)
cd ../server/server && ./mvnw clean install
```

3. **Start all services**

**Terminal 1: Frontend**
```bash
cd client && npm run dev
```

**Terminal 2: AI Server**
```bash
cd aiServer && npm run dev
```

**Terminal 3: Upskill Engine**
```bash
cd upskill-engine && npm run dev
```

**Terminal 4: Notification Service**
```bash
cd notification-service && npm run dev
```

**Terminal 5: Auth Server**
```bash
cd server/server && ./mvnw spring-boot:run
```

4. **Access the application**
- Frontend: http://localhost:3000
- AI Server: http://localhost:5001
- Upskill Engine: http://localhost:7001
- Notification Service: http://localhost:6000
- Auth Server: http://localhost:8080

## 📋 API Documentation

### AI Server (Port 5001)
```
GET    /api/health                    # Health check
POST   /api/resume/upload             # Upload resume PDF
GET    /api/resume/:id                # Get resume by ID
POST   /api/resume/save               # Save resume data
GET    /api/resume/:id/download       # Download resume PDF
POST   /api/resume/basic-search       # Search resumes
```

### Upskill Engine (Port 7001)
```
GET    /api/health                    # Health check
GET    /api/jobs                      # Get all jobs
POST   /api/jobs                      # Create new job
GET    /api/jobs/:jobId               # Get job by ID
GET    /api/jobs/company/:company     # Get jobs by company
POST   /api/overview                  # Resume vs JD comparison
```

### Auth Server (Port 8080)
```
POST   /api/auth/register             # User registration
POST   /api/auth/login                # User login
POST   /api/auth/verify-otp           # OTP verification
POST   /api/auth/resend-otp           # Resend OTP
GET    /api/auth/profile              # Get user profile
```

### Notification Service (Port 6000)
```
GET    /api/health                    # Health check
GET    /api/notifications             # Get user notifications
POST   /api/notifications/mark-read   # Mark as read
WebSocket: /socket.io                 # Real-time notifications
```

## 🗄️ Data Flow

### Resume Processing Pipeline
1. **Upload** → PDF uploaded to Cloudinary
2. **Parsing** → AI extracts structured data
3. **Storage** → MongoDB stores resume data
4. **Vectorization** → Pinecone stores embeddings by industry
5. **Analysis** → OpenAI provides insights and recommendations

### Job Matching Flow
1. **Query** → User searches for opportunities
2. **Vector Search** → Pinecone finds similar profiles
3. **Aggregation** → Results grouped by candidate
4. **Ranking** → Scored by relevance and skills match
5. **Presentation** → Formatted results with recommendations

### Notification System
1. **Event Trigger** → Microservice publishes event
2. **Processing** → Notification service handles event
3. **Persistence** → MongoDB stores notification
4. **Delivery** → WebSocket pushes to frontend
5. **Display** → Redux store updates UI

## 🔧 Development Guidelines

### Code Structure
```
evalia/
├── client/               # Next.js frontend
│   ├── app/             # App router pages
│   ├── components/      # Reusable components
│   ├── redux/           # State management
│   └── types/           # TypeScript definitions
├── aiServer/            # Resume analysis service
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── services/    # Business logic
│   │   ├── models/      # MongoDB schemas
│   │   └── utils/       # Helper functions
├── upskill-engine/      # Job matching service
├── notification-service/ # Real-time notifications
└── server/              # Spring Boot auth
```

### Component Architecture
- Break large components into focused pieces
- Use TypeScript interfaces from `types/resume.ts`
- Centralized candidate aggregation in `resumeHelper.js`
- Follow Redux Toolkit patterns for state management

### API Response Handling
```typescript
// Handle both JSON and plain text from Spring Boot
const contentType = response.headers.get('content-type')
if (contentType?.includes('application/json')) {
  result = await response.json()
} else {
  result = { message: await response.text() }
}
```

## 🎨 UI/UX Guidelines

### Design System
- **Font**: Roboto Mono for form inputs
- **Theme**: Dark theme with colors:
  - Background: `bg-[#3E3232]`
  - Text: `text-[#c5b2b2]`
  - Borders: `border-[#ac8e8e]`
- **Components**: Tailwind CSS with consistent spacing
- **Interactions**: Smooth hover states and animations

### Notification Strategy
- **Persistent Notifications**: Important events requiring user attention
- **Toast Notifications**: Immediate feedback (using React Toastify)
- **Real-time Updates**: WebSocket for live notifications

## 🐛 Debugging & Monitoring

### Logging
- **Winston**: Structured logging across Node.js services
- **Console Logs**: Vector search debugging
- **Error Handling**: Specific status codes with graceful degradation

### Common Issues
1. **CORS**: Ensure all services have proper CORS configuration
2. **Environment Variables**: Check all required env vars are set
3. **MongoDB Connection**: Verify connection strings and database access
4. **Pinecone**: Confirm API key and index configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow
- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Write unit tests for new features
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Imran** - Full Stack Developer
- **Azwoad** - Backend Developer

## 🙏 Acknowledgments

- OpenAI for GPT models
- Pinecone for vector database
- Cloudinary for file storage
- Material-UI for component library
- All contributors and open-source projects used

---

<div align="center">
  <p>Made with ❤️ by the Evalia Team</p>
  <p>
    <a href="https://github.com/Imran-2020331101/evalia">⭐ Star us on GitHub</a> |
    <a href="mailto:support@evalia.com">📧 Contact Support</a>
  </p>
</div>