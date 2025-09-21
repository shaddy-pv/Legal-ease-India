# LegalEase India - AI-Powered Legal Document Analysis

A production-ready web application for analyzing legal documents using AI, specifically designed for Indian law. Built with React, TypeScript, and Express.js.

## 🚀 Features

- **Document Upload & Analysis**: Support for PDF, DOCX, and image files
- **AI-Powered Analysis**: Uses Google Gemini AI for intelligent document analysis
- **Multi-language Support**: English and Hindi language support
- **Risk Assessment**: Identifies potential legal risks and provides recommendations
- **Interactive Chat**: Ask questions about your documents
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Production Ready**: Secure, scalable backend with proper error handling

## 🏗️ Architecture

### Backend (Express.js)
- **Port**: 3001
- **API Structure**: RESTful API with organized routes
- **Security**: CORS, rate limiting, input validation
- **File Processing**: PDF, DOCX, and image text extraction
- **AI Integration**: Google Gemini API for document analysis

### Frontend (React + TypeScript)
- **Port**: 5173 (Vite dev server)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks and context
- **Build Tool**: Vite

## 📋 Prerequisites

- Node.js 16+ 
- npm 8+
- Google Gemini API key

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd bharat-legal-bot-main/Legal-ease-India
```

### 2. Backend Setup
```bash
cd backend
npm install
cp env.example .env
```

Edit `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd .. # Back to root directory
npm install
```

### 4. Environment Variables (Frontend)
Create `.env.local` in the root directory:
```env
VITE_BACKEND_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 Running the Application

### Development Mode

1. **Start Backend**:
```bash
cd backend
npm run dev
```

2. **Start Frontend** (in a new terminal):
```bash
npm run dev
```

3. **Access the Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - API Health Check: http://localhost:3001/api/health

### Production Mode

1. **Build Frontend**:
```bash
npm run build
```

2. **Start Backend**:
```bash
cd backend
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Health Check
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health information

#### Document Processing
- `POST /documents/upload` - Upload and analyze document
- `POST /documents/extract-text` - Extract text only (no AI analysis)

#### AI Analysis
- `POST /gemini/analyze` - Analyze text with AI
- `POST /gemini/chat` - Chat with document
- `POST /gemini/summary` - Generate summary
- `GET /gemini/health` - Check AI service status

### Example API Usage

#### Upload Document
```bash
curl -X POST http://localhost:3001/api/documents/upload \
  -F "file=@document.pdf" \
  -F "language=en"
```

#### Analyze Text
```bash
curl -X POST http://localhost:3001/api/gemini/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Your legal document text", "language": "en"}'
```

## 🔧 Configuration

### Backend Configuration
All backend configuration is done through environment variables in `backend/.env`:

- `GEMINI_API_KEY`: Required. Your Google Gemini API key
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Allowed frontend origins for CORS
- `RATE_LIMIT_MAX`: Rate limiting (requests per 15 minutes)
- `MAX_FILE_SIZE`: Maximum file upload size in bytes

### Frontend Configuration
Frontend configuration is in `.env.local`:

- `VITE_BACKEND_URL`: Backend API URL
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

## 🛡️ Security Features

- **CORS Protection**: Configurable allowed origins
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Sanitizes all inputs
- **File Type Validation**: Only allows safe file types
- **Error Handling**: Secure error messages (no sensitive data leaked)
- **Helmet.js**: Security headers

## 📁 Project Structure

```
Legal-ease-India/
├── backend/                 # Express.js backend
│   ├── routes/             # API route handlers
│   │   ├── documents.js    # Document processing
│   │   ├── gemini.js       # AI analysis
│   │   └── health.js       # Health checks
│   ├── services/           # Business logic
│   │   └── geminiService.js # AI service
│   ├── uploads/            # Temporary file storage
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── services/           # Frontend services
│   ├── config/             # Configuration
│   └── main.tsx           # App entry point
├── public/                 # Static assets
└── package.json           # Frontend dependencies
```

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**:
   - Check if port 3001 is available
   - Verify GEMINI_API_KEY is set in backend/.env
   - Run `npm install` in backend directory

2. **Frontend can't connect to backend**:
   - Ensure backend is running on port 3001
   - Check CORS configuration in backend
   - Verify VITE_BACKEND_URL in frontend .env.local

3. **File upload fails**:
   - Check file size (max 10MB)
   - Verify file type is supported
   - Ensure backend uploads directory exists

4. **AI analysis fails**:
   - Verify GEMINI_API_KEY is valid
   - Check API quota limits
   - Review backend logs for errors

### Logs

- **Backend logs**: Check console output where backend is running
- **Frontend logs**: Check browser developer console
- **API logs**: Backend logs include detailed API request/response info

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database (if needed)
3. Set up reverse proxy (nginx/Apache)
4. Configure SSL certificates
5. Set up monitoring and logging

### Docker (Optional)
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🔄 Changelog

### v1.0.0
- Initial production release
- Consolidated backend architecture
- Improved security and error handling
- Multi-language support
- Production-ready configuration