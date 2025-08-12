# 🔔 Evalia Notification Service

A real-time notification microservice for the Evalia AI-powered resume analysis platform. This service handles all notification delivery across the platform using WebSocket connections, message queues, and email notifications.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [WebSocket Events](#websocket-events)
- [Message Broker Integration](#message-broker-integration)
- [Development](#development)
- [Deployment](#deployment)
- [Monitoring](#monitoring)

## 🎯 Overview

The Notification Service is a critical component of the Evalia microservice ecosystem, responsible for:

- **Real-time notifications** via WebSocket connections
- **Email notifications** for important events
- **Cross-service communication** through message brokers
- **Notification persistence** and delivery tracking
- **User preference management** for notification types

### Service Dependencies

```mermaid
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