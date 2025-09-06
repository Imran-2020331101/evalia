# Interview Engine (TypeScript)

A TypeScript version of the video analysis interview engine that processes video frames during interviews and provides real-time metrics using Socket.IO.

## Features

- Real-time video frame processing
- Face detection and analysis
- Eye contact tracking
- Speaking detection
- Blink rate monitoring
- Interview scheduling and management
- RESTful API endpoints
- Socket.IO for real-time communication
- MongoDB integration with Mongoose

## Technology Stack

- **Backend**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO
- **Video Processing**: Python with OpenCV and MediaPipe
- **Type Safety**: Full TypeScript implementation

## Project Structure

```
interview_engine(ts)/
├── src/
│   ├── controllers/
│   │   └── InterviewController.ts
│   ├── models/
│   │   └── InterviewSchema.ts
│   ├── routes/
│   │   └── interview.ts
│   ├── middlewares/
│   │   └── ErrorHandler.ts
│   ├── errors/
│   │   ├── CustomApiError.ts
│   │   ├── BadRequestError.ts
│   │   ├── UnauthenticatedError.ts
│   │   └── index.ts
│   ├── types/
│   │   └── interview.ts
│   └── server.ts
├── python/
│   └── worker.py
├── dist/ (generated)
├── package.json
├── tsconfig.json
└── requirements.txt
```

## Installation

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MongoDB

### Setup

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Setup Python virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # source venv/bin/activate  # On Linux/Mac
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration:**
   - Copy `.env.example` to `.env`
   - Update the environment variables as needed

5. **Build TypeScript:**
   ```bash
   npm run build
   ```

## Usage

### Development Mode

```bash
# Start in development mode with hot reload
npm run dev
```

### Production Mode

```bash
# Build the project
npm run build

# Start the server
npm start
```

## API Endpoints

### Schedule Interview

**POST** `/api/interview`

Schedule a new interview session.

**Request Body:**
```json
{
  "candidateId": "string",
  "candidateEmail": "string", 
  "candidateName": "string",
  "jobId": "string"
}
```

**Response:**
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

## Socket.IO Events

### Client -> Server

- `join-room`: Join an interview room
- `video-frames`: Send video frame data for analysis

### Server -> Client

- `metrics`: Receive real-time analysis metrics

**Metrics Format:**
```json
{
  "faceCount": "number",
  "eyeContact": "number (0-1)",
  "speaking": "number (0-1)", 
  "blinkRate": "number"
}
```

## Types and Interfaces

The application uses comprehensive TypeScript types defined in `src/types/interview.ts`:

- `IInterviewTranscript`: Main interview document interface
- `IQuestionAnswer`: Question-answer pair interface
- `IScheduleInterviewRequest/Response`: API request/response types
- `IVideoFrameData`: Socket.IO video frame data
- `IPythonMetrics`: Video analysis metrics

## Error Handling

Custom error classes with proper HTTP status codes:

- `CustomApiError`: Base error class
- `BadRequestError`: 400 errors
- `UnauthenticatedError`: 401 errors

## Database Schema

### InterviewTranscript Collection

- Candidate information (ID, email, name)
- Job information (ID, title)
- Interview details (type, status, scheduling)
- Questions and answers array
- Overall assessment and scoring
- Technical metadata
- Audit fields

## Video Processing

The Python worker (`python/worker.py`) handles:

- Face mesh detection using MediaPipe
- Eye contact estimation
- Blink rate calculation
- Speaking detection based on mouth movement
- Real-time metric computation

## Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run start`: Start production server
- `npm run dev`: Start development server with hot reload
- `npm run dev:nodemon`: Alternative development mode

## Environment Variables

```bash
MONGODB_URI=mongodb://localhost:27017/interview-engine
JOB_SERVICE_URL=http://localhost:8080
PORT=5000
NODE_ENV=development
```

## Contributing

1. Follow TypeScript best practices
2. Maintain type safety throughout
3. Add proper error handling
4. Update documentation for new features

## License

ISC
