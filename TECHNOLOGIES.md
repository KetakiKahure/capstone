# FocusWave - Complete Technology Stack

## 🎯 Project Overview
FocusWave is a full-stack productivity and focus application with AI-powered features, built using modern web technologies.

---

## 📱 Frontend Technologies

### Core Framework
- **React** `^18.2.0` - UI library
- **React DOM** `^18.2.0` - React rendering
- **Vite** `^5.0.8` - Build tool and dev server

### Routing
- **React Router DOM** `^6.20.0` - Client-side routing

### State Management
- **Zustand** `^4.4.7` - Lightweight state management

### UI Components & Icons
- **Lucide React** `^0.294.0` - Icon library
- **React Beautiful DnD** `^13.1.1` - Drag and drop functionality

### Data Visualization
- **Recharts** `^2.10.3` - Chart library for analytics

### Styling
- **Tailwind CSS** `^3.3.6` - Utility-first CSS framework
- **PostCSS** `^8.4.32` - CSS processing
- **Autoprefixer** `^10.4.16` - CSS vendor prefixing

### Utilities
- **date-fns** `^2.30.0` - Date manipulation library

### Development Tools
- **ESLint** `^8.55.0` - Code linting
- **@vitejs/plugin-react** `^4.2.1` - Vite React plugin
- **TypeScript Types** - Type definitions for React
- **patch-package** `^8.0.1` - Patch node_modules

---

## 🔧 Backend Technologies

### Core Framework
- **Node.js** - JavaScript runtime
- **Express** `^4.18.2` - Web framework
- **ES Modules** - Modern JavaScript modules

### Database
- **PostgreSQL** - Relational database
- **pg** `^8.11.3` - PostgreSQL client for Node.js

### Authentication & Security
- **JSON Web Token (JWT)** `^9.0.2` - Authentication tokens
- **bcryptjs** `^2.4.3` - Password hashing
- **express-validator** `^7.0.1` - Input validation

### HTTP & API
- **Axios** `^1.6.2` - HTTP client (for ML service communication)
- **CORS** `^2.8.5` - Cross-Origin Resource Sharing

### Environment & Configuration
- **dotenv** `^16.3.1` - Environment variable management

### Development Tools
- **Nodemon** `^3.0.2` - Development server auto-reload

---

## 🤖 ML Service Technologies

### Core Framework
- **Python 3.11+** - Programming language
- **FastAPI** `>=0.104.1` - Modern Python web framework
- **Uvicorn** `>=0.24.0` - ASGI server
- **Pydantic** `>=2.5.0` - Data validation
- **Pydantic Settings** `>=2.1.0` - Settings management

### Machine Learning
- **scikit-learn** `>=1.3.0` - Machine learning library
  - Random Forest Regressor (Pomodoro recommendations)
  - Random Forest Classifier (Distraction prediction)
- **NumPy** `>=1.26.0` - Numerical computing
- **Pandas** `>=2.1.0` - Data manipulation and analysis
- **Joblib** `>=1.3.0` - Model serialization

### Deep Learning & NLP
- **Transformers** `>=4.35.0` - Hugging Face transformers
- **PyTorch** `>=2.1.0` - Deep learning framework
- **DistilBERT** - Pre-trained sentiment analysis model
  - Model: `distilbert-base-uncased-finetuned-sst-2-english`

### AI/LLM APIs
- **Google Generative AI** `>=0.3.0` - Gemini API client
  - Model: `gemini-2.5-flash`
- **OpenAI** `>=1.3.0` - OpenAI API client (fallback)
  - Model: `gpt-3.5-turbo`

### Database Connectivity
- **psycopg2-binary** `>=2.9.9` - PostgreSQL adapter
- **SQLAlchemy** `>=2.0.0` - SQL toolkit and ORM

### HTTP & Networking
- **Requests** `>=2.31.0` - HTTP library
- **aiohttp** `>=3.9.0` - Async HTTP client/server

### Utilities
- **python-dotenv** `>=1.0.0` - Environment variables
- **python-multipart** `>=0.0.6` - Multipart form data
- **schedule** `>=1.2.0` - Task scheduling
- **loguru** `>=0.7.0` - Advanced logging

---

## 🗄️ Database

### Database System
- **PostgreSQL** - Primary database
  - Version: Latest stable
  - Features used:
    - Tables: users, tasks, timer_sessions, mood_logs, user_gamification
    - Indexes for performance
    - Foreign keys and constraints
    - Triggers for updated_at timestamps
    - Arrays (for badges)

### Database Tools
- **pg** (Node.js) - Database client
- **psycopg2** (Python) - Database adapter

---

## 🔐 Authentication & Security

### Authentication
- **JWT (JSON Web Tokens)** - Stateless authentication
- **bcryptjs** - Password hashing (bcrypt algorithm)

### Security Features
- Password hashing with bcrypt
- JWT token-based authentication
- CORS configuration
- Input validation with express-validator
- Environment variable protection

---

## 📊 Data Visualization

### Chart Library
- **Recharts** - React charting library
  - Bar charts (Focus time, Mood vs Focus)
  - Line charts (Focus trends)
  - Scatter plots (Mood correlation)
  - Area charts

---

## 🛠️ Development Tools

### Build Tools
- **Vite** - Frontend build tool
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

### Code Quality
- **ESLint** - JavaScript/React linting
- **React ESLint Plugins** - React-specific linting rules

### Package Management
- **npm** - Node.js package manager
- **pip** - Python package manager

### Version Control
- **Git** - Version control system

---

## ☁️ APIs & External Services

### AI/ML APIs
- **Google Gemini API** - Primary LLM provider
  - Model: `gemini-2.5-flash`
  - Use: AI Coach, Mood Suggestions
- **OpenAI API** - Fallback LLM provider
  - Model: `gpt-3.5-turbo`
  - Use: AI Coach fallback, Mood Suggestions fallback

### Model Hosting
- **Hugging Face** - Pre-trained model hosting
  - Model: `distilbert-base-uncased-finetuned-sst-2-english`
  - Use: Sentiment analysis

---

## 🚀 Deployment & Infrastructure

### Runtime Environments
- **Node.js** - Backend runtime
- **Python 3.11+** - ML service runtime
- **PostgreSQL** - Database server

### Process Management
- **Uvicorn** - ASGI server for ML service
- **Node.js** - Backend server (Express)

### Scripts & Automation
- **Bash scripts** - Setup and deployment scripts
- **npm scripts** - Development and build scripts

---

## 📦 Package Management

### Frontend
- **npm** - Package manager
- **package.json** - Dependency management

### Backend
- **npm** - Package manager
- **package.json** - Dependency management

### ML Service
- **pip** - Package manager
- **requirements.txt** - Dependency management
- **virtualenv/venv** - Virtual environment

---

## 🎨 Styling & Design

### CSS Framework
- **Tailwind CSS** - Utility-first CSS framework
  - Responsive design
  - Dark mode support
  - Custom color palette

### Design Principles
- Mobile-first responsive design
- Dark mode support
- Accessible UI components
- Modern, clean interface

---

## 📱 Features & Capabilities

### Core Features
1. **Pomodoro Timer** - Focus session management
2. **Task Management** - Todo list with priorities
3. **Mood Journal** - Mood tracking with AI suggestions
4. **Analytics Dashboard** - Data visualization
5. **Gamification** - Points, levels, streaks, badges
6. **AI Coach** - Personalized coaching suggestions

### AI/ML Features
1. **Pomodoro Recommendations** - ML-based timer duration prediction
2. **Distraction Prediction** - ML-based distraction risk assessment
3. **Sentiment Analysis** - NLP-based mood analysis
4. **AI Mood Suggestions** - LLM-powered personalized suggestions
5. **AI Coach** - LLM-powered coaching messages

---

## 🔄 Data Flow

### Architecture
```
Frontend (React) 
    ↕ HTTP/REST
Backend (Express/Node.js)
    ↕ PostgreSQL
Database
    ↕ HTTP/REST
ML Service (FastAPI/Python)
    ↕ APIs
External Services (Gemini, OpenAI, Hugging Face)
```

### Communication
- **Frontend ↔ Backend**: REST API (JSON)
- **Backend ↔ Database**: PostgreSQL (SQL)
- **Backend ↔ ML Service**: REST API (JSON)
- **ML Service ↔ External APIs**: HTTP (JSON)

---

## 📝 File Formats & Standards

### Data Formats
- **JSON** - API communication
- **SQL** - Database queries
- **CSV/DataFrames** - ML data processing

### Code Standards
- **ES6+** - Modern JavaScript
- **JSX** - React component syntax
- **Python 3.11+** - Modern Python
- **Async/Await** - Asynchronous programming

---

## 🧪 Testing & Quality

### Code Quality Tools
- **ESLint** - JavaScript/React linting
- **TypeScript Types** - Type checking (frontend)

### Development Practices
- Environment variable management
- Error handling and logging
- Input validation
- Security best practices

---

## 📚 Documentation

### Documentation Tools
- **Markdown** - Documentation format
- **API Documentation** - FastAPI auto-generated docs
- **Code Comments** - Inline documentation

---

## 🔧 Configuration Files

### Frontend
- `package.json` - Dependencies and scripts
- `vite.config.js` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `.eslintrc` - ESLint configuration

### Backend
- `package.json` - Dependencies and scripts
- `.env` - Environment variables
- Database migration scripts

### ML Service
- `requirements.txt` - Python dependencies
- `config/config.py` - Configuration settings
- `.env` - Environment variables
- Model versioning system

---

## 🎯 Key Technologies Summary

### Frontend Stack
- React + Vite + Tailwind CSS + Zustand

### Backend Stack
- Node.js + Express + PostgreSQL + JWT

### ML Stack
- Python + FastAPI + scikit-learn + Transformers + Gemini/OpenAI

### Database
- PostgreSQL

### AI/ML
- Google Gemini API, OpenAI API, Hugging Face Transformers

---

## 📊 Technology Categories

### Languages
- JavaScript (ES6+)
- Python 3.11+
- SQL
- HTML/CSS
- Bash

### Frameworks
- React
- Express.js
- FastAPI

### Libraries
- React Router, Zustand, Recharts
- Express, JWT, bcryptjs
- scikit-learn, Pandas, NumPy, Transformers, PyTorch

### Tools
- Vite, ESLint, PostCSS, Tailwind CSS
- npm, pip, Git
- Uvicorn, Nodemon

### Services
- PostgreSQL
- Google Gemini API
- OpenAI API
- Hugging Face

---

**Last Updated**: 2025-11-08
**Project**: FocusWave
**Version**: 1.0

