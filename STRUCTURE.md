# FocusWave - Project Structure

## 📁 Folder Organization

```
capstone/
│
├── frontend/              # React Frontend Application
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state management
│   │   ├── services/      # API service functions
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration files
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   └── tailwind.config.js # Tailwind CSS configuration
│
├── backend/               # Node.js Backend API
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── config/        # Configuration files
│   │   ├── middleware/    # Express middleware
│   │   └── server.js      # Main server file
│   ├── package.json       # Backend dependencies
│   └── .env               # Backend environment variables
│
├── ml_service/            # Python ML Service
│   ├── app/
│   │   ├── routers/       # FastAPI route handlers
│   │   └── main.py        # FastAPI application
│   ├── inference/         # ML inference logic
│   ├── training/          # Model training scripts
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   ├── requirements.txt   # Python dependencies
│   ├── start.py           # Service startup script
│   └── venv/              # Python virtual environment
│
├── README.md              # Main project documentation
├── DATABASE_SETUP.md      # Database setup guide
├── SIMPLE_SETUP_GUIDE.md  # Quick setup guide
├── TECHNOLOGIES.md        # Technology stack documentation
├── start-all.ps1          # Start all services script
└── .gitignore             # Git ignore rules
```

## 🚀 Service Ports

- **Frontend**: Port 3000
- **Backend**: Port 5000
- **ML Service**: Port 8001

## 📝 Quick Commands

### Start All Services
```powershell
.\start-all.ps1
```

### Start Individual Services

**Frontend:**
```bash
cd frontend
npm run dev
```

**Backend:**
```bash
cd backend
npm run dev
```

**ML Service:**
```bash
cd ml_service
.\venv\Scripts\python.exe start.py
```

## 🔧 Environment Files

Each service has its own environment configuration:

- `backend/.env` - Backend environment variables
- `ml_service/config/.env` - ML service environment variables
- `frontend/.env` (optional) - Frontend environment variables

## 📦 Dependencies

Each service manages its own dependencies:

- **Frontend**: `frontend/package.json`
- **Backend**: `backend/package.json`
- **ML Service**: `ml_service/requirements.txt`

