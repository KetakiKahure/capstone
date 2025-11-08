import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import Dict, Optional
from loguru import logger
from config.config import settings

# Try to import transformers (optional)
try:
    from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
    import torch
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logger.warning("Transformers library not available - will use fallback sentiment analysis")

# Global singleton instance
_sentiment_analyzer_instance = None
_model_loaded = False

class SentimentAnalyzer:
    """
    Singleton Sentiment Analyzer with lazy model loading.
    Prevents multiple model loads that can cause bus errors on macOS.
    """
    _instance = None
    _model_loaded = False
    
    def __new__(cls):
        """Singleton pattern - return same instance every time"""
        if cls._instance is None:
            cls._instance = super(SentimentAnalyzer, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        # Only initialize once
        if self._initialized:
            return
        
        self.model = None
        self.tokenizer = None
        self.pipeline = None
        self._model_loaded = False
        self._use_transformer = TRANSFORMERS_AVAILABLE
        
        # Check if we should disable transformer loading (for macOS compatibility)
        # On macOS, transformer models can cause bus errors, so we disable by default
        # Set DISABLE_TRANSFORMER_MODEL=false to enable transformer model
        import platform
        is_macos = platform.system() == "Darwin"
        env_disable = os.getenv("DISABLE_TRANSFORMER_MODEL", "").lower()
        
        if env_disable == "true":
            logger.info("⚠️  Transformer model loading disabled via DISABLE_TRANSFORMER_MODEL env var")
            self._use_transformer = False
        elif env_disable == "false":
            logger.info("✅ Transformer model loading enabled via DISABLE_TRANSFORMER_MODEL env var")
            self._use_transformer = TRANSFORMERS_AVAILABLE
        elif is_macos:
            # On macOS, disable transformer by default to avoid bus errors
            logger.info("⚠️  macOS detected - Transformer model disabled by default (set DISABLE_TRANSFORMER_MODEL=false to enable)")
            self._use_transformer = False
        else:
            # On other platforms, use transformer if available
            self._use_transformer = TRANSFORMERS_AVAILABLE
        
        self._initialized = True
        # Don't load model in __init__ - use lazy loading instead
        logger.debug("SentimentAnalyzer initialized (lazy loading enabled)")
    
    def _load_model(self):
        """Lazy load the sentiment analysis model (only load once)"""
        # If already attempted to load (whether successful or not), return
        if self._model_loaded:
            return
        
        if not self._use_transformer:
            logger.info("⚠️  Using fallback sentiment analysis (transformer disabled)")
            self.pipeline = None
            self._model_loaded = True
            return
            
        try:
            model_path = settings.SENTIMENT_MODEL_PATH
            
            # Try to load from local path first
            if os.path.exists(model_path) and os.path.isdir(model_path):
                logger.info(f"Loading model from local path: {model_path}")
                self.tokenizer = AutoTokenizer.from_pretrained(model_path)
                self.model = AutoModelForSequenceClassification.from_pretrained(model_path)
            else:
                # Load from Hugging Face
                logger.info(f"Loading model from Hugging Face: {settings.HF_MODEL_NAME}")
                try:
                    self.tokenizer = AutoTokenizer.from_pretrained(settings.HF_MODEL_NAME)
                    self.model = AutoModelForSequenceClassification.from_pretrained(settings.HF_MODEL_NAME)
                except Exception as e:
                    logger.warning(f"⚠️  Could not load model from Hugging Face: {e}")
                    logger.warning("⚠️  Falling back to keyword-based sentiment analysis")
                    self.pipeline = None
                    self._model_loaded = True
                    return
            
            # Create pipeline
            self.pipeline = pipeline(
                "sentiment-analysis",
                model=self.model,
                tokenizer=self.tokenizer,
                device=0 if torch.cuda.is_available() else -1
            )
            
            logger.info("✅ Sentiment analyzer loaded successfully")
            self._model_loaded = True
            
        except Exception as e:
            logger.error(f"❌ Error loading sentiment model: {e}")
            logger.error("⚠️  Using fallback keyword-based sentiment analysis")
            # Fallback to basic sentiment analysis
            self.pipeline = None
            self._model_loaded = True
    
    def analyze(self, text: str) -> Dict:
        """
        Analyze sentiment of text (lazy loads model on first use)
        
        Returns:
            {
                "sentiment_score": float (-1 to 1),
                "label": "negative" | "neutral" | "positive"
            }
        """
        if not text or not text.strip():
            return {
                "sentiment_score": 0.0,
                "label": "neutral"
            }
        
        # Lazy load model on first use
        if not self._model_loaded:
            self._load_model()
        
        try:
            if self.pipeline:
                # Use transformer model
                result = self.pipeline(text, truncation=True, max_length=512)[0]
                
                label = result['label'].lower()
                score = result['score']
                
                # Convert to our format
                if 'positive' in label:
                    sentiment_score = score
                    sentiment_label = "positive"
                elif 'negative' in label:
                    sentiment_score = -score
                    sentiment_label = "negative"
                else:
                    sentiment_score = 0.0
                    sentiment_label = "neutral"
                
            else:
                # Fallback: simple keyword-based sentiment
                sentiment_score, sentiment_label = self._simple_sentiment(text)
            
            return {
                "sentiment_score": round(sentiment_score, 3),
                "label": sentiment_label
            }
            
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {e}")
            # On error, fall back to simple sentiment
            try:
                sentiment_score, sentiment_label = self._simple_sentiment(text)
                return {
                    "sentiment_score": round(sentiment_score, 3),
                    "label": sentiment_label
                }
            except Exception as fallback_error:
                logger.error(f"Fallback sentiment analysis also failed: {fallback_error}")
                return {
                    "sentiment_score": 0.0,
                    "label": "neutral"
                }
    
    def _simple_sentiment(self, text: str) -> tuple:
        """Simple keyword-based sentiment analysis fallback"""
        text_lower = text.lower()
        
        positive_words = [
            'happy', 'great', 'good', 'excellent', 'amazing', 'wonderful',
            'fantastic', 'love', 'enjoy', 'excited', 'proud', 'accomplished',
            'grateful', 'blessed', 'calm', 'peaceful', 'relaxed', 'content'
        ]
        
        negative_words = [
            'sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated',
            'anxious', 'worried', 'stressed', 'tired', 'exhausted', 'overwhelmed',
            'depressed', 'lonely', 'disappointed', 'upset'
        ]
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            return 0.6, "positive"
        elif negative_count > positive_count:
            return -0.6, "negative"
        else:
            return 0.0, "neutral"

