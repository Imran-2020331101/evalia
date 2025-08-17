# 🔔 Evalia Notification Service - Real-time Communication Hub

A comprehensive real-time notification microservice for the Evalia AI recruitment platform. This service orchestrates multi-channel communication including WebSocket notifications, email campaigns, and batch processing for automated candidate feedback.

---

## 🏗️ Architecture Overview

The Notification Service acts as the central communication hub for the Evalia ecosystem:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Notification Service (Port 6001)            │
├─────────────────────────────────────────────────────────────────┤
│  🔔 Real-time Notifications  │  📧 Email Service               │
│  • Socket.IO WebSockets       │  • SMTP Integration             │
│  • JWT Cookie Authentication  │  • HTML Templates               │
│  • Room-based Broadcasting    │  • Batch Email Processing       │
├─────────────────────────────────────────────────────────────────┤
│  📨 Message Broker           │  🤖 AI-Powered Feedback         │
│  • AMQP/RabbitMQ Integration │  • Automated Rejection Letters  │
│  • Event-driven Processing   │  • Resume Analysis Integration  │
│  • Cross-service Events      │  • Personalized Recommendations │
├─────────────────────────────────────────────────────────────────┤
│  💾 MongoDB Persistence     │  📊 Delivery Tracking           │
│  • Notification History     │  • Success/Failure Metrics      │
│  • User Preferences         │  • Performance Analytics        │
│  • Delivery Status          │  • Winston Logging              │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Core Features

### 🔔 **Real-time Notification System**
- **Socket.IO Integration**: Bidirectional WebSocket communication
- **JWT Authentication**: Cookie-based authentication with automatic token extraction
- **Room Management**: User-specific and broadcast channels
- **Event Broadcasting**: Multi-user notification delivery

### 📧 **Advanced Email Service**
- **SMTP Integration**: Configurable email provider support (Gmail, SendGrid, etc.)
- **HTML Templates**: Rich, responsive email templates
- **Batch Processing**: Efficient bulk email delivery with rate limiting
- **Personalization**: Dynamic content injection per recipient

### 🤖 **AI-Powered Batch Feedback** ⭐ **NEW FEATURE**
- **Automated Rejection Letters**: AI-generated personalized feedback for non-shortlisted candidates
- **Resume Analysis**: Integration with Upskill Engine for detailed candidate insights
- **Batch Processing**: Efficient handling of large candidate pools
- **Multi-channel Delivery**: Email + in-app notifications

### � **Event-Driven Processing**
- **Message Broker**: AMQP/RabbitMQ integration for cross-service communication
- **Event Types**: Comprehensive event taxonomy for all platform activities
- **Async Processing**: Non-blocking notification delivery
- **Retry Mechanism**: Failed notification recovery

### 💾 **Data Management**
- **MongoDB Integration**: Notification persistence and history
- **User Preferences**: Customizable notification settings
- **Delivery Tracking**: Success/failure metrics and analytics
- **Performance Monitoring**: Winston logging and error tracking

---

## 🛠 Technology Stack

### **Backend Framework**
- **Node.js** 18+ - Runtime environment
- **Express.js** 5+ - Web application framework
- **TypeScript** 5+ - Type-safe development
- **Socket.IO** 4+ - Real-time WebSocket communication

### **Communication**
- **Nodemailer** - SMTP email delivery
- **AMQP** - Message broker integration
- **JWT** - Authentication token handling
- **Axios** - HTTP client for service integration

### **Database & Storage**
- **MongoDB** 8+ - Notification persistence
- **Mongoose** - ODM for MongoDB
- **Winston** - Structured logging

### **Development Tools**
- **Nodemon** - Development hot reload
- **ts-node** - TypeScript execution
- **CORS** - Cross-origin resource sharing

---

## 🚀 Quick Start Guide

### **Prerequisites**
- **Node.js** ≥ 18.0.0
- **MongoDB** ≥ 6.0 (local or cloud)
- **RabbitMQ** (optional - for message broker)
- **SMTP Credentials** (Gmail, SendGrid, etc.)

### **Installation**

1. **Clone and Navigate**
   ```bash
   git clone <repository>
   cd evalia/notification-service
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Configure required variables (see Environment Variables section)
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The service will start on **http://localhost:6001**

---

## 🔧 Environment Variables

```bash
# .env file configuration

# Server Configuration
PORT=6001
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/evalia-notifications

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Message Broker (Optional)
BROKER_URL=amqp://localhost:5672

# Email Configuration (Required for email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@evalia.com
FROM_NAME=Evalia Team

# Service Integration
AI_SERVER_URL=http://localhost:5001
UPSKILL_ENGINE_URL=http://localhost:7001
```

---

## 📡 API Endpoints

### **Notification Management**

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| **GET** | `/notifications/:userId` | Get user notifications | - |
| **PATCH** | `/notifications/:id/read` | Mark notification as read | - |

### **Batch Processing** ⭐ **NEW**

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| **POST** | `/notifications/batch-rejection-feedback` | Process batch rejection feedback | BatchRejectionRequest |
| **POST** | `/notifications/batch-rejection-feedback/direct` | Direct batch processing (bypass events) | BatchRejectionRequest |

#### BatchRejectionRequest Schema
```typescript
{
  jobId: string;                    // Job identifier
  jobTitle: string;                 // Job title
  companyName: string;              // Company name
  jobDescription: string;           // Full job description for AI analysis
  shortlistedCandidates: string[];  // Array of user IDs who got shortlisted
  allApplicants: CandidateInfo[];   // All candidates who applied
  recruiterId: string;              // Recruiter user ID
}

interface CandidateInfo {
  userId: string;     // User identifier
  name: string;       // Candidate name
  email: string;      // Contact email
  resumeId: string;   // Resume identifier for AI analysis
}
```

#### Example Request
```bash
POST http://localhost:6001/notifications/batch-rejection-feedback
Content-Type: application/json

{
  "jobId": "job_12345",
  "jobTitle": "Senior Software Engineer",
  "companyName": "TechCorp Inc.",
  "jobDescription": "We are looking for a Senior Software Engineer with 5+ years experience in React, Node.js, and cloud technologies...",
  "shortlistedCandidates": ["user_001", "user_005", "user_009"],
  "allApplicants": [
    {
      "userId": "user_001",
      "name": "John Doe",
      "email": "john.doe@email.com",
      "resumeId": "resume_001"
    },
    {
      "userId": "user_002",
      "name": "Jane Smith",
      "email": "jane.smith@email.com",
      "resumeId": "resume_002"
    }
    // ... more applicants
  ],
  "recruiterId": "recruiter_123"
}
```

---

## 🔌 WebSocket Events

### **Client → Server**
| Event | Payload | Description |
|-------|---------|-------------|
| `connection` | `{ userId }` | Establish connection with user authentication |
| `join-room` | `{ roomId }` | Join specific notification room |
| `disconnect` | - | Clean disconnection |

### **Server → Client**
| Event | Payload | Description |
|-------|---------|-------------|
| `notification` | `NotificationData` | Real-time notification delivery |
| `batch-status` | `BatchStatus` | Batch processing status updates |
| `connect_error` | `Error` | Connection error details |

#### Notification Data Schema
```typescript
interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'feedback';
  link?: string;
  timestamp: string;
  isRead: boolean;
}
```

---

## 🎯 Event Types & Processing

The service handles comprehensive event types from across the Evalia platform:

```typescript
enum EventTypes {
  // Resume Processing
  RESUME_ANALYSIS_COMPLETED = "resume.analysis.completed",
  RESUME_ANALYSIS_FAILED = "resume.analysis.failed",
  
  // Job Matching
  JOB_POSTING_CREATED = "job.posting.created",
  JOB_MATCH_FOUND = "job.match.found",
  JOB_APPLICATION_SHORTLISTED = "job.application.shortlisted",
  JOB_APPLICATION_REJECTED = "job.application.rejected",
  
  // Batch Processing ⭐ NEW
  BATCH_REJECTION_FEEDBACK = "batch.rejection.feedback",
  
  // Authentication & Security
  USER_EMAIL_VERIFIED = "user.email.verified",
  SUSPICIOUS_LOGIN_DETECTED = "user.suspicious.login.detected",
  
  // Interview System
  INTERVIEW_SCHEDULED = "interview.scheduled",
  INTERVIEW_CANCELLED = "interview.cancelled",
  
  // System Events
  SYSTEM_MAINTENANCE_SCHEDULED = "system.maintenance.scheduled"
}
```

---

## 🤖 AI-Powered Batch Feedback System ⭐ **NEW**

### **Process Flow**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Recruiter     │    │  Notification   │    │  Upskill        │
│   Shortlists    │───▶│   Service       │───▶│   Engine        │
│   Candidates    │    │                 │    │  (AI Analysis)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Email Service  │
                       │  (Batch Send)   │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Candidates    │
                       │  Receive AI     │
                       │   Feedback      │
                       └─────────────────┘
```

### **Features**
- **AI Analysis Integration**: Connects to Upskill Engine for resume vs job analysis
- **Personalized Feedback**: Unique strengths, weaknesses, and recommendations per candidate
- **Batch Email Processing**: Efficient bulk email delivery with rate limiting
- **Multi-channel Notifications**: Email + in-app notifications
- **Recruiter Status Updates**: Real-time feedback on processing status
- **Error Handling**: Comprehensive error recovery and logging

### **Email Template Features**
- **Professional Design**: Responsive HTML email templates
- **Personalization**: Dynamic content based on AI analysis
- **Actionable Insights**: Specific recommendations for improvement
- **Brand Consistency**: Evalia platform styling and messaging

---

## 📁 Project Structure

```
notification-service/
├── 📄 package.json              # Dependencies and scripts
├── 📄 tsconfig.json            # TypeScript configuration
├── 📄 .env                     # Environment variables
├── 📄 README.md               # This documentation
├── 📁 src/
│   ├── 📄 app.ts              # Express app configuration
│   ├── 📄 server.ts           # Server startup and Socket.IO
│   ├── 📁 config/
│   │   ├── 📄 env.ts          # Environment variable management
│   │   └── 📄 socket.ts       # Socket.IO configuration & auth
│   ├── 📁 events/
│   │   ├── 📄 eventTypes.ts   # Event type definitions
│   │   ├── 📄 messageBroker.ts # AMQP/RabbitMQ integration
│   │   └── 📄 notificationHandler.ts # Event processing logic
│   ├── 📁 models/
│   │   └── 📄 Notification.ts # MongoDB notification schema
│   ├── 📁 routes/
│   │   └── 📄 notificationRoutes.ts # REST API endpoints
│   ├── 📁 services/
│   │   ├── 📄 notificationService.ts # Core notification logic
│   │   ├── 📄 emailService.ts       # Email delivery & templates
│   │   └── 📄 batchFeedbackService.ts # ⭐ AI batch feedback
│   └── 📁 utils/
│       └── 📄 logger.ts       # Winston logging configuration
```

---

## 🔄 Integration with Evalia Platform

### **Service Communication**

| Service | Port | Integration | Purpose |
|---------|------|-------------|---------|
| **Client (Next.js)** | 3000 | Socket.IO Client | Real-time UI notifications |
| **AI Server** | 5001 | HTTP API | Resume data retrieval |
| **Upskill Engine** | 7001 | HTTP API | AI analysis for feedback |
| **Spring Boot Auth** | 8080 | Event Messages | User authentication events |

### **Event Flow Example: Batch Rejection**

1. **Recruiter Action**: Shortlists candidates via frontend
2. **API Call**: Frontend calls batch rejection endpoint
3. **Event Processing**: Notification service processes batch event
4. **AI Analysis**: Each rejected candidate's resume analyzed via Upskill Engine
5. **Email Generation**: Personalized feedback emails created
6. **Batch Delivery**: Emails sent with rate limiting
7. **Real-time Updates**: Candidates receive in-app notifications
8. **Status Reporting**: Recruiter notified of completion

---

## 🚀 Development Guidelines

### **Code Organization**
- **Services**: Business logic and external integrations
- **Controllers**: Request/response handling
- **Models**: Data structures and database schemas
- **Events**: Cross-service communication patterns

### **Error Handling**
```typescript
// Comprehensive error handling pattern
try {
  const result = await someAsyncOperation();
  logger.info("Operation successful", { result });
} catch (error) {
  logger.error("Operation failed", { error, context });
  // Fallback behavior
}
```

### **Testing Strategy**
```bash
# Unit tests (when implemented)
npm run test

# Integration tests (when implemented)
npm run test:integration

# Load testing for batch operations
npm run test:load
```

---

## 🔍 Monitoring & Analytics

### **Winston Logging**
- **Structured Logging**: JSON format with timestamps
- **Log Levels**: Error, warn, info, debug
- **Context Preservation**: Request IDs and user context

### **Performance Metrics**
- **Email Delivery**: Success/failure rates
- **WebSocket Connections**: Active connections and latency
- **Batch Processing**: Throughput and processing times
- **AI Integration**: Response times from Upskill Engine

### **Health Checks**
```bash
# Service health
GET http://localhost:6001/health

# Database connection
GET http://localhost:6001/health/database

# SMTP connection
GET http://localhost:6001/health/email
```

---

## 🚢 Deployment

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 6001
CMD ["npm", "start"]
```

### **Environment-specific Configuration**
```bash
# Production
NODE_ENV=production
PORT=6001
MONGO_URI=mongodb://prod-cluster/evalia

# Staging
NODE_ENV=staging
PORT=6001
MONGO_URI=mongodb://staging-cluster/evalia
```

---

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/notification-enhancement`
3. **Follow TypeScript conventions**
4. **Add comprehensive logging**
5. **Test batch processing thoroughly**
6. **Update documentation**
7. **Submit pull request**

---

## 🐛 Troubleshooting

### **Common Issues**

1. **Socket Connection Fails**
   ```bash
   # Check authentication
   # Verify JWT_SECRET matches other services
   # Ensure MongoDB is running
   ```

2. **Email Delivery Issues**
   ```bash
   # Verify SMTP credentials
   # Check network connectivity
   # Review email provider limits
   ```

3. **Batch Processing Timeouts**
   ```bash
   # Check Upskill Engine availability
   # Review batch size limits
   # Monitor memory usage
   ```

---

## 📄 License

This project is part of the Evalia platform and follows the project's licensing terms.

---

## 👥 Team & Credits

**Notification Service Team**  
**Part of:** Evalia AI Platform  
**Powered by:** Node.js, Socket.IO, MongoDB, Nodemailer

**Key Contributors:**
- Real-time notification system
- AI-powered batch feedback (Latest Feature)
- Email template system
- Cross-service event handling

---

*For technical support or feature requests, please contact the development team or create an issue in the repository.*mermaid
graph TD
    A[Client Frontend] --> B[Notification Service]
    C[AI Server] --> B
    D[Upskill Engine] --> B
    E[Auth Server] --> B
    B --> F[MongoDB]
    B --> G[RabbitMQ]
    B --> H[SMTP Server]
```

## 🏗️ Architecture

### Microservice Architecture Position

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   AI Server     │    │ Upskill Engine  │
│   (Next.js)     │    │  (Node.js)      │    │  (TypeScript)   │
│   Port: 3000    │    │  Port: 5001     │    │  Port: 7000     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │  Notification Service   │
                    │     (TypeScript)        │
                    │      Port: 6000         │
                    └─────────────┬───────────┘
                                  │
                    ┌─────────────┴───────────┐
                    │     Auth Server         │
                    │    (Spring Boot)        │
                    │      Port: 8080         │
                    └─────────────────────────┘
```

### Core Components

- **WebSocket Manager**: Real-time communication with clients
- **Message Broker**: Async communication between services
- **Email Service**: SMTP-based email notifications
- **Notification Store**: MongoDB persistence layer
- **Event Handlers**: Process different notification types

## ✨ Features

### 🚀 Real-time Notifications
- WebSocket-based instant delivery
- User-specific notification rooms
- Broadcast capabilities for system-wide alerts
- Connection management and reconnection handling

### 📧 Email Notifications
- Resume analysis completion alerts
- Job matching notifications
- Account verification emails
- Weekly digest emails

### 🔄 Cross-Service Integration
- Event-driven architecture with RabbitMQ
- RESTful API for direct service calls
- JWT-based authentication
- Service health monitoring

### 📊 Notification Types
- **Resume Processing**: Upload, analysis, completion
- **Job Matching**: New matches, application status
- **System Alerts**: Maintenance, updates, errors
- **User Activity**: Login attempts, profile changes

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB 6.0+
- RabbitMQ 3.12+
- TypeScript knowledge

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Imran-2020331101/evalia.git
cd evalia/notification-service

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

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=6000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/evalia
REDIS_URL=redis://localhost:6379

# Message Broker
BROKER_URL=amqp://guest:guest@localhost:5672

# Authentication
JWT_SECRET=your-super-secure-jwt-secret

# Email Service (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# WebSocket Configuration
SOCKET_CORS_ORIGIN=http://localhost:3000

# External Services
AI_SERVER_URL=http://localhost:5001
UPSKILL_ENGINE_URL=http://localhost:7000
AUTH_SERVER_URL=http://localhost:8080
```

### Service Configuration Matrix

| Service | Port | Purpose | Dependencies |
|---------|------|---------|--------------|
| Client | 3000 | Next.js Frontend | Notification Service |
| AI Server | 5001 | Resume Processing | MongoDB, Pinecone |
| Notification | 6000 | **This Service** | MongoDB, RabbitMQ |
| Upskill Engine | 7000 | Job Matching | MongoDB, OpenAI |
| Auth Server | 8080 | Authentication | Database |

## 📡 API Endpoints

### Health & Status
```http
GET /api/health
```
Returns service health status and dependencies.

### Notifications Management
```http
# Get user notifications
GET /api/notifications/:userId?limit=20&offset=0

# Mark notification as read
PATCH /api/notifications/:notificationId/read

# Get notification preferences
GET /api/notifications/:userId/preferences

# Update notification preferences
PUT /api/notifications/:userId/preferences
```

### Admin Endpoints
```http
# Send system-wide notification
POST /api/notifications/broadcast

# Get notification analytics
GET /api/notifications/analytics

# Service metrics
GET /api/metrics
```

## 🔌 WebSocket Events

### Client → Server Events

```typescript
// Join user-specific notification room
socket.emit('join-user-room', userId);

// Mark notification as read
socket.emit('notification-read', notificationId);

// Request notification history
socket.emit('get-notifications', { limit: 20, offset: 0 });
```

### Server → Client Events

```typescript
// New notification received
socket.on('new-notification', (notification) => {
  // Handle new notification
});

// Notification status update
socket.on('notification-updated', (update) => {
  // Handle notification update
});

// System announcement
socket.on('system-alert', (alert) => {
  // Handle system-wide alert
});
```

### Example Client Integration

```typescript
// Client-side WebSocket setup
import io from 'socket.io-client';

const socket = io('http://localhost:6000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Join user notification room
socket.emit('join-user-room', 'user-123');

// Listen for notifications
socket.on('new-notification', (notification) => {
  console.log('New notification:', notification);
  // Update UI with new notification
});
```

## 🔄 Message Broker Integration

### Event Types Handled

```typescript
// Resume processing events
'resume.uploaded'      // From AI Server
'resume.analyzed'      // From AI Server
'resume.failed'        // From AI Server

// Job matching events
'job.matched'          // From Upskill Engine
'job.applied'          // From Client
'application.status'   // From External APIs

// User events
'user.registered'      // From Auth Server
'user.verified'        // From Auth Server
'user.login.suspicious' // From Auth Server

// System events
'system.maintenance'   // From Admin
'system.update'        // From Deployment
```

### Message Queue Setup

```typescript
// Example message handler
import { MessageBroker } from './events/messageBroker';

const broker = new MessageBroker();

// Listen for resume analysis completion
broker.subscribe('resume.analyzed', async (data) => {
  await notificationService.createNotification({
    userId: data.userId,
    type: 'resume_analysis_complete',
    title: 'Resume Analysis Complete',
    message: `Your resume has been analyzed. View results now.`,
    data: { resumeId: data.resumeId }
  });
});
```

## 🔧 Development

### Project Structure

```
notification-service/
├── src/
│   ├── config/           # Configuration files
│   │   ├── env.ts       # Environment variables
│   │   └── socket.ts    # WebSocket configuration
│   │
│   ├── events/          # Message broker & events
│   │   ├── eventTypes.ts        # Event type definitions
│   │   ├── messageBroker.ts     # RabbitMQ integration
│   │   └── notificationHandler.ts # Event processing
│   │
│   ├── models/          # Database models
│   │   └── Notification.ts      # Notification schema
│   │
│   ├── routes/          # API routes
│   │   └── notificationRoutes.ts
│   │
│   ├── services/        # Business logic
│   │   └── notificationService.ts
│   │
│   ├── utils/           # Utilities
│   │   └── logger.ts    # Winston logging
│   │
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
│
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
└── .env               # Environment variables
```

### Available Scripts

```bash
# Development
npm run dev          # Start with nodemon + ts-node
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run test         # Run test suite
npm run lint         # ESLint checking
npm run format       # Prettier formatting

# Database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed initial data

# Docker
npm run docker:build # Build Docker image
npm run docker:run   # Run containerized service
```

### Testing Strategy

```bash
# Unit tests
npm run test:unit

# Integration tests  
npm run test:integration

# WebSocket tests
npm run test:websocket

# Load testing
npm run test:load
```

## 🚀 Deployment

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
EXPOSE 6000

CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  notification-service:
    build: .
    ports:
      - "6000:6000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb
      - rabbitmq
```

### Production Considerations

- **Load Balancing**: Use sticky sessions for WebSocket connections
- **Scaling**: Horizontal scaling with Redis adapter for Socket.IO
- **Monitoring**: Implement health checks and metrics collection
- **Security**: Rate limiting, input validation, JWT verification

## 📊 Monitoring

### Health Checks

```http
GET /api/health

Response:
{
  "status": "healthy",
  "timestamp": "2025-08-12T10:30:00.000Z",
  "services": {
    "database": "connected",
    "messageBroker": "connected",
    "smtp": "available"
  },
  "metrics": {
    "activeConnections": 45,
    "notificationsSent": 1230,
    "uptime": "2d 4h 30m"
  }
}
```

### Metrics & Analytics

- **Connection Metrics**: Active WebSocket connections
- **Delivery Metrics**: Success/failure rates by type
- **Performance Metrics**: Response times, queue depths
- **Error Tracking**: Failed deliveries, connection issues

### Logging

- **Structured Logging**: JSON format with correlation IDs
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Log Rotation**: Daily rotation with 30-day retention
- **Centralized Logging**: Integration with ELK stack

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/notification-enhancement`
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Commit with conventional commit format: `feat: add email templates`
6. Push and create a Pull Request

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Testing**: Jest for unit tests, Supertest for integration

## 📄 License

This project is part of the Evalia platform and is proprietary software. All rights reserved.

## 📞 Support

- **Documentation**: [Evalia Docs](https://docs.evalia.com)
- **Issues**: [GitHub Issues](https://github.com/Imran-2020331101/evalia/issues)
- **Discord**: [Evalia Community](https://discord.gg/evalia)
- **Email**: support@evalia.com

## 🔗 Related Services

- [AI Server](../aiServer/README.md) - Resume processing and analysis
- [Upskill Engine](../upskill-engine/README.md) - Job matching and recommendations
- [Client Application](../client/README.md) - Next.js frontend
- [Auth Server](../server/README.md) - Spring Boot authentication service

---

**Built with ❤️ by the Evalia Team**