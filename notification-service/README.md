# 🔔 Evalia Notification Service

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![License](https://img.shields.io/badge/license-Proprietary-blue) ![Contributors](https://img.shields.io/badge/contributors-4-orange)

## 📝 Overview

The **Evalia Notification Service** is a real-time communication hub for the Evalia AI recruitment platform. It orchestrates multi-channel communication, including WebSocket notifications, email campaigns, and batch processing for automated candidate feedback. This service ensures seamless communication across the Evalia ecosystem.

### Why It Exists

Effective communication is critical in recruitment. The Notification Service provides real-time updates, personalized feedback, and automated notifications to enhance the user experience and streamline communication workflows.

---

## ✨ Features

### 🔔 Real-Time Notifications
- WebSocket-based instant delivery
- User-specific notification rooms
- Broadcast capabilities for system-wide alerts
- Connection management and reconnection handling

### 📧 Email Notifications
- Resume analysis completion alerts
- Job matching notifications
- Account verification emails
- Weekly digest emails

### 🤖 AI-Powered Feedback
- Automated rejection letters with personalized feedback
- Resume analysis integration for detailed insights
- Multi-channel delivery: Email + in-app notifications

### 🔄 Event-Driven Architecture
- RabbitMQ integration for cross-service communication
- Comprehensive event taxonomy for platform activities
- Retry mechanism for failed notifications

### 📊 Analytics & Monitoring
- Delivery tracking: Success/failure metrics
- User preferences for notification customization
- Performance monitoring with Winston logging

---

## 🛠️ Tech Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **TypeScript**: Type-safe development
- **Socket.IO**: Real-time WebSocket communication

### Communication
- **Nodemailer**: SMTP email delivery
- **RabbitMQ**: Message broker integration
- **JWT**: Authentication token handling

### Database & Storage
- **MongoDB**: Notification persistence
- **Mongoose**: ODM for MongoDB
- **Winston**: Structured logging

### Development Tools
- **Nodemon**: Development hot reload
- **ts-node**: TypeScript execution
- **CORS**: Cross-origin resource sharing

---

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- RabbitMQ (optional - for message broker)
- SMTP credentials (e.g., Gmail, SendGrid)

### Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Imran-2020331101/evalia.git
   cd evalia/notification-service
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
   docker build -t evalia-notification-service .
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

#### Notification Management

**GET** `/notifications/:userId`

Retrieve notifications for a specific user.

**PATCH** `/notifications/:id/read`

Mark a notification as read.

#### Batch Processing

**POST** `/notifications/batch-rejection-feedback`

Process batch rejection feedback with AI-generated insights.

**Request Body**:
```json
{
  "jobId": "string",
  "jobTitle": "string",
  "companyName": "string",
  "jobDescription": "string",
  "shortlistedCandidates": ["string"],
  "allApplicants": [
    {
      "userId": "string",
      "name": "string",
      "email": "string",
      "resumeId": "string"
    }
  ],
  "recruiterId": "string"
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

- **Socket.IO**: For real-time communication.
- **RabbitMQ**: For event-driven architecture.
- **Evalia Team**: For their contributions to the ecosystem.

---

**Note**: This service is part of the Evalia microservices ecosystem. For more details, refer to the main project documentation.