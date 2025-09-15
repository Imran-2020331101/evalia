# 🚀 Evalia Job Service

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![License](https://img.shields.io/badge/license-Proprietary-blue) ![Contributors](https://img.shields.io/badge/contributors-3-orange)

## 📝 Overview

The **Evalia Job Service** is a TypeScript-based microservice that powers job matching, skill analysis, and career development recommendations within the Evalia AI platform. It bridges resume data with job opportunities to provide intelligent career insights and personalized upskilling suggestions.

### Why It Exists

This service is designed to enhance the recruitment process by leveraging AI to match candidates with the right job opportunities, identify skill gaps, and recommend career development paths. It integrates seamlessly with the Evalia ecosystem to deliver a comprehensive hiring solution.

---

## ✨ Features

### 💼 Job Management
- CRUD operations for job postings and company data
- Advanced job search and filtering
- Pagination for large datasets

### 🎯 AI-Powered Analysis
- Resume-job compatibility scoring
- Skill gap identification
- Career path recommendations
- Industry and market insights

### 🔍 Advanced Analytics
- Company hiring patterns
- Skill demand and salary analysis
- Job market trends

### 🔧 Developer Features
- Interactive API documentation with Swagger UI
- Full TypeScript implementation with Zod validation
- Comprehensive logging with Winston
- Health monitoring and metrics

---

## 🛠️ Tech Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **TypeScript**: Type-safe development

### Database
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB

### AI Integration
- **OpenRouter API**: LLM-based skill analysis

### DevOps
- **Docker**: Containerization
- **Winston**: Logging

---

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- OpenRouter API key

### Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Imran-2020331101/evalia.git
   cd evalia/job-service
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   - Copy `.env.example` to `.env`
   - Update the environment variables as needed.

4. **Run the Server**:
   - Development Mode:
     ```bash
     npm run dev
     ```
   - Production Mode:
     ```bash
     npm run build
     npm start
     ```

5. **Docker Setup**:
   ```bash
   docker build -t evalia-job-service .
   docker-compose up -d
   ```

---

## 📖 Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### API Endpoints

#### Health & Status

**GET** `/api/health`

Returns service health and dependency status.

#### Job Management

**GET** `/api/jobs`

Retrieve all jobs with pagination and filtering.

**POST** `/api/jobs`

Create a new job posting.

**PUT** `/api/jobs/:jobId`

Update an existing job posting.

**DELETE** `/api/jobs/:jobId`

Delete a job posting.

#### Resume-Job Analysis

**POST** `/api/overview`

Analyze resume compatibility with a job.

**Request Body**:
```json
{
  "resumeId": "string",
  "jobId": "string"
}
```

**Response**:
```json
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

---

## 🤝 Contributing

We welcome contributions! To get started:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push to the branch.
5. Create a Pull Request.

### Guidelines
- Follow TypeScript best practices.
- Maintain type safety throughout.
- Add proper error handling.
- Update documentation for new features.

---

## 📜 License

This project is proprietary software and part of the Evalia platform. All rights reserved.

---

## 🙏 Acknowledgments

- **OpenRouter API**: For AI-powered skill analysis.
- **MongoDB**: For scalable data storage.
- **Evalia Team**: For their contributions to the ecosystem.

---

**Note**: This service is part of the Evalia microservices ecosystem. For more details, refer to the main project documentation.