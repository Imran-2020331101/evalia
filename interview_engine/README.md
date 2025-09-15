# Interview Engine (TypeScript)

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![License](https://img.shields.io/badge/license-ISC-blue) ![Contributors](https://img.shields.io/badge/contributors-2-orange)

## 📝 Overview

The **Interview Engine** is a TypeScript-based microservice designed to facilitate real-time video analysis during interviews. It provides metrics such as face detection, eye contact tracking, speaking detection, and blink rate monitoring. This service integrates seamlessly with the Evalia ecosystem, enabling efficient interview scheduling, management, and analysis.

### Why It Exists

In modern recruitment, real-time insights during interviews can significantly enhance decision-making. The Interview Engine leverages AI and video processing to provide actionable metrics, ensuring a fair and efficient evaluation process.

---

## ✨ Features

- **Real-Time Video Analysis**: Face detection, eye contact tracking, speaking detection, and blink rate monitoring.
- **Interview Scheduling**: RESTful API for scheduling and managing interviews.
- **Socket.IO Integration**: Real-time communication for video frame processing and metrics delivery.
- **Python Worker**: Advanced video processing using OpenCV and MediaPipe.
- **TypeScript Implementation**: Full type safety and modern development practices.
- **MongoDB Integration**: Persistent storage for interview data.

---

## 🛠️ Tech Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **TypeScript**: Type-safe development
- **Socket.IO**: Real-time communication

### Database
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB

### Video Processing
- **Python**: Worker for video analysis
- **OpenCV**: Computer vision library
- **MediaPipe**: Face mesh detection

### DevOps
- **Docker**: Containerization (planned)
- **Winston**: Logging

---

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MongoDB

### Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Imran-2020331101/evalia.git
   cd evalia/interview_engine
   ```

2. **Install Node.js Dependencies**:
   ```bash
   npm install
   ```

3. **Setup Python Environment**:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # source venv/bin/activate  # On Linux/Mac
   pip install -r requirements.txt
   ```

4. **Environment Configuration**:
   - Copy `.env.example` to `.env`
   - Update the environment variables as needed.

5. **Build the Project**:
   ```bash
   npm run build
   ```

6. **Run the Server**:
   - Development Mode:
     ```bash
     npm run dev
     ```
   - Production Mode:
     ```bash
     npm start
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

#### Schedule Interview

**POST** `/api/interview`

**Request Body**:
```json
{
  "candidateId": "string",
  "candidateEmail": "string", 
  "candidateName": "string",
  "jobId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Interview scheduled successfully",
  "data": {
    "interviewId": "string",
    "candidateId": "string",
    "jobId": "string",
    "jobTitle": "string",
    "scheduledAt": "date",
    "totalQuestions": "number",
    "status": "string"
  }
}
```

### Socket.IO Events

#### Client -> Server
- `join-room`: Join an interview room
- `video-frames`: Send video frame data for analysis

#### Server -> Client
- `metrics`: Receive real-time analysis metrics

**Metrics Format**:
```json
{
  "faceCount": "number",
  "eyeContact": "number (0-1)",
  "speaking": "number (0-1)", 
  "blinkRate": "number"
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

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenCV**: For computer vision capabilities.
- **MediaPipe**: For face mesh detection.
- **Socket.IO**: For real-time communication.
- **Evalia Team**: For their contributions to the ecosystem.

---

**Note**: This service is part of the Evalia microservices ecosystem. For more details, refer to the main project documentation.
