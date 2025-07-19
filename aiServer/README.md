# Evalia AI Server

A scalable Express.js server for AI-powered resume processing and analysis.

## 🏗️ Project Structure

```
aiServer/
├── src/
│   ├── config/
│   │   ├── database.js          # Database connection configuration
│   │   └── index.js             # Environment and app configuration
│   ├── controllers/
│   │   └── resumeController.js  # Resume processing logic
│   ├── middleware/
│   │   ├── errorHandler.js      # Global error handling
│   │   ├── fileValidation.js    # File upload validation
│   │   └── requestLogger.js     # HTTP request logging
│   ├── models/
│   │   └── Resume.js            # Resume data model (MongoDB)
│   ├── routes/
│   │   ├── index.js             # Main router
│   │   └── resumeRoutes.js      # Resume-related routes
│   ├── services/
│   │   └── pdfService.js        # PDF processing business logic
│   ├── utils/
│   │   └── logger.js            # Winston logging configuration
│   └── app.js                   # Express app configuration
├── uploads/                     # File upload directory
├── logs/                        # Application logs
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies and scripts
├── server.js                    # Application entry point
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Start the production server:**
   ```bash
   npm start
   ```

## 📡 API Endpoints

### Health Check
- **GET** `/` - Server welcome message
- **GET** `/api/health` - Health check endpoint

### Resume Processing
- **POST** `/api/resume/upload` - Upload and process PDF resume
- **GET** `/api/resume/status` - Get upload service status

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/evalia_ai` |
| `MAX_FILE_SIZE` | Maximum file size in bytes | `10485760` (10MB) |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000,http://localhost:3001` |
| `LOG_LEVEL` | Logging level | `info` |

### File Upload Configuration

- **Allowed types:** PDF only
- **Maximum size:** 10MB (configurable)
- **Upload directory:** `./uploads`
- **Temporary files:** `./uploads/temp`

## 📊 Features

### ✅ Current Features

- **PDF Text Extraction:** Extract text content from PDF resumes
- **Resume Analysis:** Basic analysis of resume content and structure
- **File Validation:** Type and size validation for uploaded files
- **Request Logging:** Comprehensive HTTP request/response logging
- **Error Handling:** Global error handling with detailed logging
- **CORS Support:** Cross-origin resource sharing configuration
- **Database Integration:** MongoDB with Mongoose ODM
- **Environment Configuration:** Flexible environment-based configuration

### 🔄 Planned Features

- **AI-Powered Analysis:** Integration with OpenAI for advanced resume analysis
- **Vector Storage:** Pinecone integration for semantic search
- **Authentication:** JWT-based user authentication
- **Rate Limiting:** API rate limiting and throttling
- **Caching:** Redis caching for improved performance
- **Testing:** Unit and integration tests
- **API Documentation:** Swagger/OpenAPI documentation

## 🧪 Usage Examples

### Upload Resume

```bash
curl -X POST http://localhost:5000/api/resume/upload \
  -F "pdfFile=@/path/to/resume.pdf" \
  -H "Content-Type: multipart/form-data"
```

### Response Format

```json
{
  "success": true,
  "data": {
    "filename": "resume.pdf",
    "extractedText": "...",
    "metadata": {
      "pages": 2,
      "info": {},
      "version": "1.4"
    },
    "analysis": {
      "wordCount": 450,
      "characterCount": 2850,
      "hasEmail": true,
      "hasPhone": true,
      "sections": ["education", "experience", "skills"],
      "keywords": ["javascript", "react", "node.js"]
    },
    "uploadedAt": "2025-07-18T12:34:56.789Z"
  }
}
```

## 🛠️ Development

### Project Architecture

This project follows a **layered architecture** pattern:

1. **Routes Layer** (`src/routes/`) - HTTP routing and endpoint definitions
2. **Controller Layer** (`src/controllers/`) - Request/response handling
3. **Service Layer** (`src/services/`) - Business logic implementation
4. **Model Layer** (`src/models/`) - Data models and database schemas
5. **Middleware Layer** (`src/middleware/`) - Cross-cutting concerns
6. **Configuration Layer** (`src/config/`) - App and environment configuration

### Code Style

- **ES6+ Features:** Modern JavaScript syntax
- **Async/Await:** Promise-based asynchronous operations
- **Error Handling:** Comprehensive error handling with logging
- **Validation:** Input validation and sanitization
- **Security:** Basic security best practices

### Logging

The application uses **Winston** for structured logging:

- **Console output** in development
- **File output** in production (`logs/combined.log`, `logs/error.log`)
- **Structured JSON** format for log analysis
- **Request/response** tracking with correlation IDs

## 🔒 Security Considerations

- File type validation (PDF only)
- File size limits (10MB default)
- CORS configuration
- Input sanitization
- Error message sanitization
- Temporary file cleanup

## 📈 Monitoring & Observability

- **Request logging** with response times
- **Error tracking** with stack traces
- **File processing metrics**
- **Health check endpoints**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- **Imran** - Backend Development
- **Azwoad** - AI Integration

---

**Note:** This server is part of the larger Evalia ecosystem and is designed to work with the Next.js frontend application.
