# 🎥 Interview Engine - Real-time AI Video Analysis System

A sophisticated real-time interview analysis system that processes video streams using MediaPipe AI to extract behavioral metrics and performance indicators during interviews.

---

## 🧠 Architecture Overview

The Interview Engine uses a **hybrid Node.js + Python architecture**:

- **Node.js Server**: Handles WebSocket connections, room management, and real-time communication
- **Python Worker**: Processes video frames using MediaPipe for AI-powered facial analysis
- **Socket.IO**: Real-time bidirectional communication between client and server
- **Inter-Process Communication**: Node.js spawns Python worker and communicates via stdin/stdout

```
┌─────────────────┐    Socket.IO     ┌─────────────────┐    stdin/stdout    ┌─────────────────┐
│   Client Apps   │ ◄──────────────► │   Node.js API   │ ◄─────────────────► │  Python Worker  │
│  (Video Stream) │    WebSocket     │   (Express +    │     JSON Data      │  (MediaPipe AI) │
└─────────────────┘                  │    Socket.IO)   │                    └─────────────────┘
                                     └─────────────────┘
```

---

## ⚡ Core Features

### 🎯 Real-time Video Analysis
- **Face Detection**: Tracks up to 1 face with 468+ landmark points using MediaPipe FaceMesh
- **Eye Contact Monitoring**: Calculates gaze direction and eye contact percentage
- **Blink Rate Analysis**: Measures Eye Aspect Ratio (EAR) to detect natural blinking patterns
- **Speech Detection**: Analyzes mouth movement to determine speaking activity
- **Performance Metrics**: Real-time scoring and behavioral analysis

### 🏠 Room-based System
- **Interview Rooms**: Isolated user sessions with unique room IDs
- **Multi-client Support**: Multiple interviews can run simultaneously
- **Real-time Broadcasting**: Metrics are sent to specific interview rooms

### 📊 Behavioral Metrics Tracked

| Metric | Description | Algorithm |
|--------|-------------|-----------|
| **Face Count** | Number of faces detected in frame | MediaPipe FaceMesh detection |
| **Eye Contact** | Gaze direction alignment (0.0-1.0) | Iris center vs nose tip alignment |
| **Speaking Activity** | Mouth movement intensity (0.0-1.0) | Upper/lower lip distance ratio |
| **Blink Rate** | Blinks per minute | Eye Aspect Ratio (EAR) < 0.22 threshold |

---

## 🛠 Technology Stack

### Backend
- **Node.js** 18+ - Main server runtime
- **Express.js** - REST API framework
- **Socket.IO** - Real-time WebSocket communication
- **Python** 3.9-3.12 - AI processing worker

### AI/Computer Vision
- **MediaPipe** 0.10.21 - Google's machine learning framework
- **OpenCV** 4.11+ - Computer vision library
- **NumPy** - Numerical computing for image processing

### Development
- **Nodemon** - Hot reload for development
- **CORS** - Cross-origin resource sharing
- **express-async-errors** - Async error handling

---

## � Quick Start Guide

### Prerequisites
- **Node.js** ≥ 18
- **Python** 3.9 – 3.12 (MediaPipe requirement)
- **pip** (Python package manager)
- **Git**

### Installation

1. **Clone and Navigate**
   ```bash
   git clone <repository>
   cd interview-engine
   ```

2. **Install Node.js Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Python Virtual Environment**
   
   **Windows:**
   ```bash
   py -3.12 -m venv venv
   venv\Scripts\activate
   ```
   
   **macOS/Linux:**
   ```bash
   python3.12 -m venv venv
   source venv/bin/activate
   ```

4. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Environment Configuration**
   ```bash
   # Create .env file (optional)
   # No specific environment variables required for basic setup
   ```

### Running the Application

**Development Mode:**
```bash
npm run dev        # Starts with nodemon (auto-reload)
```

**Production Mode:**
```bash
npm start          # Starts with node
```

The server will start on **http://localhost:5000**

---

## 📡 API Reference

### WebSocket Events

#### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `roomId: string` | Join a specific interview room |
| `video-frames` | `{interviewId, frame}` | Send base64 video frame for analysis |

#### Server → Client  
| Event | Payload | Description |
|-------|---------|-------------|
| `metrics` | `{faceCount, eyeContact, speaking, blinkRate}` | Real-time analysis results |

### REST Endpoints
- **GET** `/health` - Server health check (returns "ok")

---

## 🔧 Technical Implementation

### Video Frame Processing Pipeline

1. **Client Capture**: Browser captures video frames from camera
2. **Base64 Encoding**: Frames converted to base64 format
3. **WebSocket Transmission**: Frames sent via Socket.IO to Node.js server
4. **Python Worker**: Node.js forwards frames to Python worker via stdin
5. **AI Processing**: MediaPipe processes frames for facial landmarks
6. **Metrics Calculation**: Behavioral metrics computed from landmarks
7. **Real-time Response**: Results sent back through Socket.IO to client

### MediaPipe Configuration

```python
mp_face_mesh = mp.solutions.face_mesh.FaceMesh(
    static_image_mode=False,      # Video mode
    max_num_faces=1,              # Single face tracking
    refine_landmarks=True,        # High-precision landmarks
    min_detection_confidence=0.5,  # Detection threshold
    min_tracking_confidence=0.5   # Tracking threshold
)
```

### Facial Analysis Algorithms

**Eye Contact Detection:**
- Uses iris landmarks (468, 473) and nose tip (1)
- Calculates horizontal alignment between iris centers and nose
- Normalized score: `1.0 - abs((left_iris + right_iris)/2 - nose) * 5`

**Blink Detection (EAR Algorithm):**
- Eye Aspect Ratio = vertical_distance / horizontal_distance  
- Landmarks: top(159), bottom(145), left(33), right(133)
- Blink threshold: EAR < 0.22
- Debounce: 200ms between blinks

**Speaking Detection:**
- Mouth openness ratio using upper lip (13) and lower lip (14)
- Normalized: `min(1.0, mouth_distance * 15)`

---

## 📁 Project Structure

```
interview-engine/
├── 📄 server.js              # Main Node.js server & Socket.IO setup
├── 📄 package.json          # Node.js dependencies & scripts
├── 📄 requirements.txt      # Python dependencies
├── 📄 .gitignore           # Git ignore patterns
├── 📄 README.md            # This documentation
├── 📁 python/
│   └── 📄 worker.py         # MediaPipe video processing worker
├── 📁 Errors/
│   ├── 📄 CustomApiError.js    # Base error class
│   ├── 📄 BadRequestError.js   # 400 error handler
│   └── 📄 UnauthenticatedError.js # 401 error handler
└── 📁 Middlewares/
    └── 📄 ErrorHandler.js      # Express error middleware
```

---

## 🔄 Integration with Evalia Platform

The Interview Engine integrates with the broader Evalia ecosystem:

- **Client Integration**: Frontend apps connect via Socket.IO for real-time video analysis
- **Room Management**: Each interview session gets isolated room for privacy
- **Metrics Streaming**: Real-time behavioral data for interview assessment
- **Scalable Architecture**: Multiple concurrent interviews supported

**Connection Example:**
```javascript
const socket = io('http://localhost:5000', {
  query: { interviewId: 'unique-interview-id' }
});

socket.emit('join-room', interviewId);
socket.emit('video-frames', { interviewId, frame: base64Frame });
socket.on('metrics', (data) => console.log(data));
```

---

## 🐛 Troubleshooting

### Common Issues

1. **Python Worker Not Starting**
   - Ensure virtual environment is activated
   - Verify Python path in `server.js` matches your system

2. **MediaPipe Installation Fails**
   - Use Python 3.9-3.12 (MediaPipe requirement)
   - Try: `pip install --upgrade pip` then reinstall

3. **Socket Connection Issues**
   - Check CORS settings in `server.js`
   - Ensure port 5000 is not in use

4. **Frame Processing Slow**
   - Reduce video resolution on client side
   - Consider frame rate throttling

---

## 🚀 Performance Considerations

- **Frame Rate**: Optimal at 15-20 FPS for real-time analysis
- **Resolution**: 640x480 recommended for balance of quality/speed
- **Memory**: Python worker maintains minimal state for efficiency
- **Concurrency**: Each interview room is isolated, supporting multiple sessions

---

## 📈 Future Enhancements

- [ ] Emotion detection using facial expressions
- [ ] Voice analysis integration
- [ ] Advanced pose tracking for body language
- [ ] Interview scoring algorithms
- [ ] Data persistence and analytics
- [ ] WebRTC integration for better video quality

---

## 👥 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the package.json for details.

---

## 🏆 Credits

**Developed by:** Ajoad  
**Part of:** Evalia AI Platform  
**Powered by:** MediaPipe, Node.js, Python
