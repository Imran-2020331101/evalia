# Evalia - Automated Hiring Solution

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

<img src="/Resources/evalia_architecture.png" height="350" width="100%" alt="Architecture Diagram of Evalia App">

### 🔧 Technology Stack

<img src="/Resources/tech-stack.png" height="350" width="100%" alt="Technology Stack of Evalia App">


## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- MongoDB
- Maven

### Environment Variables

Create `.env` files in each service directory and add application.json file in the auth-gateway server. follow the .env.example files for details.

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

cd {server-name} && npm install

# Auth Gateway (Maven)
cd ../server/auth-gateway && ./mvnw clean install
```

3. **Start all services in separate terminals**

**In each terminl run:**
```bash
cd {server-name} && npm run dev
```

**Auth Gateway**
```bash
cd server/auth-gateway && ./mvnw spring-boot:run
```
**For detailed installation guide check individual readme**



## 📋 API Documentation

### Resume Service (Port 5000)
```
GET    /health                        # Health check
POST   /api/resume/upload             # Upload resume PDF
GET    /api/resume/:id                # Get resume by ID
POST   /api/resume/basic-search       # Search resumes
GET    /api/courses                   # Get skill development courses
```

### Job Service (Port 7000)
```
GET    /api/jobs                      # Get all jobs
POST   /api/jobs                      # Create new job
GET    /api/jobs/:jobId               # Get job by ID
POST   /api/jobs/generate/interview-questions  # Generate interview questions
POST   /api/jobs/:jobId/shortlist     # Shortlist candidates
GET    /api/jobs/organization/:id     # Get jobs by organization
```

### Interview Engine (Port 5000)
```
POST   /api/interviews/schedule       # Schedule interview
PUT    /api/interviews/:id/transcript # Update interview transcript
WebSocket: Real-time video processing # Video analysis
```

### Auth Gateway (Port 8080)
```
POST   /api/auth/register             # User registration
POST   /api/auth/login                # User login
POST   /api/auth/verify-otp           # OTP verification
POST   /api/auth/resend-otp           # Resend OTP
GET    /api/auth/profile              # Get user profile
```

### Notification Service (Port 6000)
```
GET    /api/notifications             # Get user notifications
POST   /api/notifications             # Create notification
WebSocket: /socket.io (Port 6001)     # Real-time notifications
```

## 🗄️ Data Flow

### Resume Processing Pipeline
1. **Upload** → PDF uploaded to Cloudinary
2. **Parsing** → AI extracts structured data
3. **Storage** → MongoDB stores resume data
4. **Vectorization** → Pinecone stores embeddings by industry
5. **Analysis** → OpenAI provides insights and recommendations

<img src="/Resources/resume_processing_pipeline.png" height="350" width="100%" alt="Resume Processing Pipeline">

### Vector Database Partition
To store the vector values of the Resume we used Qdrant. For better searching efficiency we separated the table by **industry**. This virtual separation is done by storing industry metadata in each point.

<img src="/Resources/VectorDB_Segmantation.png" height="350" width="100%" alt="Segmentation details of the vector database">

### Interview Flow
1. **join** -> User joins the interview using the link 
2. **Interview Agent: Monke** → Our interview agent 
3. **Aggregation** → Results grouped by candidate
4. **Ranking** → Scored by relevance and skills match
5. **Presentation** → Formatted results with recommendations

### Video Processing Pipeline

<img src="/Resources/Video_Processing_Pipeline.png" height="350" width="100%" alt="Anti-cheating video pipeline architecture">


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
- **Error Handling**: Specific status codes with graceful degradation within global error handling

### Common Issues
1. **CORS**: Ensure all services have proper CORS configuration
2. **Environment Variables**: Check all required env vars are set
3. **MongoDB Connection**: Verify connection strings and database access
4. **Qdrant & OpenAI**: Confirm API key


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Team

- **Azwoad** - Frontend Developer
- **Imran** - Backend Developer

##  Acknowledgments

- OpenAI for GPT models
- Qdrant for vector database
- Cloudinary for file storage
- Material-UI for component library
---

<div align="center">
  <p>Made with ❤️ by the Evalia Team</p>
  <p>
    <a href="https://github.com/Imran-2020331101/evalia">⭐ Star us on GitHub</a> |
    <a href="mailto:evalia.apostrophe@gmail.com">📧 Contact Support</a>
  </p>

</div>

