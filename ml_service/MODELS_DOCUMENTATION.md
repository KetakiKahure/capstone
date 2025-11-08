# ML Models Documentation

## Overview
This document lists all Machine Learning models used in the FocusWave ML Service, their locations, types, and usage.

---

## 📊 Model List

### 1. **Pomodoro Recommender Model**
- **Type**: Random Forest Regressor (sklearn)
- **Format**: Joblib (`.joblib`)
- **Location**: `./models/pomodoro_recommender.joblib`
- **Purpose**: Recommends personalized Pomodoro timer durations (focus & break) based on user patterns
- **Algorithm**: RandomForestRegressor (100 estimators, max_depth=10)
- **Training Script**: `training/train_pomodoro_model.py`
- **Inference Class**: `inference/pomodoro_recommender.py` → `PomodoroRecommender`
- **API Endpoint**: `/ml/pomodoro-recommendation` (POST)
- **Used In**:
  - Frontend: Pomodoro Timer page (`src/pages/PomodoroTimer.jsx`)
  - Backend: `/api/ml/pomodoro-recommendation` route
  - ML Service: `app/routers/pomodoro.py`

**Features Used**:
- User stats (avg focus duration, completion rate, streak, level)
- Daily trend features (yesterday, day before, 3 days ago focus time)
- Mood encoding
- Time features (hour, day of week, weekend, morning/afternoon/evening)
- Task features (pending tasks, high priority tasks)
- Productivity score

**Output**: 
- `focus_minutes`: Recommended focus duration (5-60 minutes)
- `break_minutes`: Recommended break duration (1-30 minutes)
- `confidence`: Prediction confidence (0-1)
- `explanation`: Human-readable explanation

---

### 2. **Distraction Predictor Model**
- **Type**: Random Forest Classifier (sklearn)
- **Format**: Joblib (`.joblib`)
- **Location**: `./models/distraction_predictor.joblib`
- **Purpose**: Predicts likelihood of user being distracted during a focus session
- **Algorithm**: RandomForestClassifier (100 estimators, max_depth=10)
- **Training Script**: `training/train_distraction_model.py`
- **Inference Class**: `inference/distraction_predictor.py` → `DistractionPredictor`
- **API Endpoint**: `/ml/predict-distraction` (POST)
- **Used In**:
  - ML Service: `app/routers/distraction.py`
  - Can be integrated in frontend for proactive distraction alerts

**Features Used**:
- User stats (completion rate, streak, level)
- Session context (duration, time of day)
- Mood and stress indicators
- Task load (pending tasks, high priority tasks)
- Time features (hour, day of week, weekend)

**Output**:
- `distraction_probability`: Probability of distraction (0-1)
- `risk_level`: Low/Medium/High
- `triggers`: List of distraction triggers identified
- `recommendations`: Suggestions to reduce distraction risk

---

### 3. **Sentiment Analyzer Model**
- **Type**: DistilBERT (Hugging Face Transformers)
- **Format**: Pre-trained model from Hugging Face
- **Model Name**: `distilbert-base-uncased-finetuned-sst-2-english`
- **Location**: 
  - Primary: Hugging Face Hub (auto-downloaded)
  - Fallback: `./models/sentiment_analyzer/` (if cached locally)
- **Purpose**: Analyzes sentiment of user mood journal entries and notes
- **Training**: Pre-trained by Hugging Face (no custom training)
- **Inference Class**: `inference/sentiment_analyzer.py` → `SentimentAnalyzer`
- **API Endpoint**: `/ml/sentiment-analysis` (POST)
- **Used In**:
  - Mood Journal AI suggestions (`inference/mood_suggestions.py`)
  - AI Coach service (`inference/coach_service.py`)
  - ML Service: `app/routers/sentiment.py`
  - Frontend: Mood Journal page (via mood suggestions)

**Fallback**: If Transformers library is unavailable, uses keyword-based sentiment analysis

**Output**:
- `sentiment_score`: Sentiment score (-1 to 1, where -1 is negative, 1 is positive)
- `label`: "positive", "negative", or "neutral"

---

### 4. **Gemini LLM (AI Coach & Mood Suggestions)**
- **Type**: Large Language Model (Google Gemini)
- **Model**: `gemini-2.5-flash`
- **API**: Google Generative AI API
- **Location**: Cloud-based (API calls)
- **Purpose**: 
  - Generate personalized coaching messages
  - Generate mood-based suggestions, insights, and affirmations
- **Configuration**: `config/config.py` → `GEMINI_MODEL`, `GEMINI_API_KEY`
- **Inference Classes**: 
  - `inference/coach_service.py` → `CoachService`
  - `inference/mood_suggestions.py` → `MoodSuggestionsService`
- **API Endpoints**: 
  - `/ml/coach` (POST) - AI coaching
  - `/ml/mood-suggestions` (POST) - Mood-based suggestions
- **Used In**:
  - Frontend: Dashboard (AI Coach), Mood Journal (AI suggestions)
  - Backend: `/api/ml/coach`, `/api/ml/mood-suggestions`
  - ML Service: `app/routers/coach.py`, `app/routers/sentiment.py`

**Features**:
- Safety settings configured for wellness/mental health content
- Graceful fallback to rule-based suggestions if API blocked
- Context-aware prompts with user history, mood trends, sentiment analysis

**Output** (Coach):
- `message`: Personalized coaching message
- `action`: Suggested action item

**Output** (Mood Suggestions):
- `suggestions`: List of actionable suggestions
- `insights`: AI-generated insight about the mood
- `recommended_activities`: Specific activities to try
- `affirmation`: Personalized affirmation
- `sentiment_analysis`: Sentiment analysis results

---

### 5. **OpenAI LLM (Fallback for AI Coach & Mood Suggestions)**
- **Type**: Large Language Model (OpenAI)
- **Model**: `gpt-3.5-turbo` (configurable)
- **API**: OpenAI API
- **Location**: Cloud-based (API calls)
- **Purpose**: Fallback LLM when Gemini is unavailable
- **Configuration**: `config/config.py` → `OPENAI_MODEL`, `OPENAI_API_KEY`
- **Usage**: Same as Gemini (CoachService, MoodSuggestionsService)
- **Status**: Currently set to use Gemini as primary provider

---

## 📁 Model Storage Structure

```
ml_service/
├── models/
│   ├── pomodoro_recommender.joblib      # Pomodoro recommendation model
│   ├── distraction_predictor.joblib     # Distraction prediction model
│   ├── sentiment_analyzer/              # (Optional) Cached DistilBERT model
│   └── versions.json                    # Model versioning metadata
├── config/
│   └── config.py                        # Model paths and configuration
├── training/
│   ├── train_pomodoro_model.py          # Train Pomodoro model
│   └── train_distraction_model.py       # Train Distraction model
└── inference/
    ├── pomodoro_recommender.py          # Pomodoro inference
    ├── distraction_predictor.py         # Distraction inference
    ├── sentiment_analyzer.py            # Sentiment inference
    ├── coach_service.py                 # AI Coach (uses Gemini/OpenAI)
    └── mood_suggestions.py              # Mood AI (uses Gemini/OpenAI)
```

---

## 🔄 Model Training

### Training Requirements
- **Minimum Samples**: 50 (configurable via `MIN_SAMPLES_FOR_TRAINING`)
- **Training Interval**: 24 hours (configurable via `RETRAIN_INTERVAL_HOURS`)
- **Data Window**: Last 90 days of user data

### Training Process
1. **Pomodoro Model**: Trains on historical timer sessions to predict optimal focus/break durations
2. **Distraction Model**: Trains on session completion data to predict distraction risk
3. **Sentiment Model**: Pre-trained (no training needed)
4. **LLM Models**: No training (API-based)

### Manual Training
```bash
cd ml_service
python3 training/train_pomodoro_model.py
python3 training/train_distraction_model.py
```

---

## 📊 Model Versioning

Models are versioned using `utils/model_versioning.py`:
- Tracks model versions in `models/versions.json`
- Stores metrics (MAE, R², accuracy, etc.)
- Supports model rollback

---

## 🔧 Configuration

All model configurations are in `config/config.py`:

```python
# Model Paths
MODEL_DIR = "./models"
POMODORO_MODEL_PATH = "./models/pomodoro_recommender.joblib"
DISTRACTION_MODEL_PATH = "./models/distraction_predictor.joblib"
SENTIMENT_MODEL_PATH = "./models/sentiment_analyzer"

# LLM Models
GEMINI_MODEL = "gemini-2.5-flash"
OPENAI_MODEL = "gpt-3.5-turbo"
LLM_PROVIDER = "gemini"  # or "openai" or "auto"

# Hugging Face
HF_MODEL_NAME = "distilbert-base-uncased-finetuned-sst-2-english"

# Training
RETRAIN_INTERVAL_HOURS = 24
MIN_SAMPLES_FOR_TRAINING = 50
```

---

## 🚀 Model Loading & Fallback

All models have fallback mechanisms:
1. **Pomodoro Model**: Falls back to default 25min/5min if model not found
2. **Distraction Model**: Falls back to heuristic-based prediction
3. **Sentiment Model**: Falls back to keyword-based sentiment if Transformers unavailable
4. **LLM Models**: Falls back to rule-based suggestions if API fails or is blocked

---

## 📈 Model Metrics

Models track the following metrics:
- **Pomodoro Model**: MAE (Mean Absolute Error), R² score
- **Distraction Model**: Accuracy, Precision, Recall, F1, AUC
- **Sentiment Model**: N/A (pre-trained)
- **LLM Models**: N/A (API-based)

Metrics are stored in `models/versions.json` after training.

---

## 🔍 Model Usage Flow

### 1. Pomodoro Recommendation
```
Frontend → Backend → ML Service → PomodoroRecommender → Random Forest Model → Response
```

### 2. Distraction Prediction
```
ML Service → DistractionPredictor → Random Forest Classifier → Risk Assessment
```

### 3. Sentiment Analysis
```
Mood Journal → ML Service → SentimentAnalyzer → DistilBERT → Sentiment Score
```

### 4. AI Coach & Mood Suggestions
```
Frontend → Backend → ML Service → CoachService/MoodSuggestionsService → Gemini API → AI Response
```

---

## 📝 Notes

- Models are loaded lazily (on first use)
- Models can be retrained automatically or manually
- Model versioning helps track improvements over time
- All models support graceful degradation (fallback mechanisms)
- LLM models require API keys (Gemini or OpenAI)

---

## 🛠️ Maintenance

### Check Model Status
```bash
cd ml_service
python3 -c "from inference.pomodoro_recommender import PomodoroRecommender; r = PomodoroRecommender(); print('Model loaded:', r.model is not None)"
```

### Retrain Models
```bash
cd ml_service
python3 training/train_pomodoro_model.py
python3 training/train_distraction_model.py
```

### Check Model Versions
```bash
cat ml_service/models/versions.json
```

---

**Last Updated**: 2025-11-08
**ML Service Version**: 1.0

