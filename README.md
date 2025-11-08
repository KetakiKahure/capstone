# FocusWave - Productivity Platform

A full-stack productivity application with AI-powered features for task management, focus tracking, and mood analysis.

## 📁 Project Structure

```
capstone/
├── frontend/          # React + Vite frontend application
├── backend/           # Node.js + Express backend API
├── ml_service/        # Python + FastAPI ML service
└── [docs]             # Documentation files (root level)
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- PostgreSQL (v12+)

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run migrate
npm run dev
```

### 3. ML Service Setup
```bash
cd ml_service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python start.py
```

## 📚 Documentation

- [Database Setup](./DATABASE_SETUP.md) - PostgreSQL database setup and migration guide
- [Project Structure](./STRUCTURE.md) - Detailed folder structure and organization
- [ML Models Documentation](./ml_service/MODELS_DOCUMENTATION.md) - ML service models and inference documentation

## 🔧 Services

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000/api
- **ML Service**: http://localhost:8001

## 🎯 Features

- Task Management
- Pomodoro Timer
- Mood Tracking
- Analytics Dashboard
- Gamification
- AI-Powered Suggestions

## 🚀 Deployment

### Frontend Deployment (Vercel)

The frontend can be deployed to Vercel. See [Frontend Deployment Guide](./frontend/VERCEL_DEPLOY.md) for detailed instructions.

**Quick Deploy:**
1. Push your code to GitHub
2. Import project in Vercel
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL` = your backend URL
5. Deploy!

### Backend Deployment

The backend can be deployed to platforms like:
- **Railway**: Easy PostgreSQL + Node.js deployment
- **Render**: Free tier available
- **Heroku**: Traditional PaaS option
- **AWS/DigitalOcean**: VPS deployment

### ML Service Deployment

The ML service can be deployed to:
- **Railway**: Supports Python services
- **Render**: Python service deployment
- **AWS Lambda**: Serverless deployment
- **Google Cloud Run**: Container-based deployment

## 📝 License

MIT
