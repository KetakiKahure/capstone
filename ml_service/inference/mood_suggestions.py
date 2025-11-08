import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import Dict, List
import random
import re
from datetime import datetime
from loguru import logger
from config.config import settings
from utils.data_loaders import DataLoader
from inference.sentiment_analyzer import SentimentAnalyzer
from inference.coach_service import CoachService

# Try importing OpenAI
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# Try importing Gemini
try:
    import google.generativeai as genai
    from google.generativeai.types import HarmCategory, HarmBlockThreshold
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    genai = None
    HarmCategory = None
    HarmBlockThreshold = None

class MoodSuggestionsService:
    def __init__(self):
        self.data_loader = DataLoader()
        self.sentiment_analyzer = SentimentAnalyzer()
        self.coach_service = CoachService()
        self.openai_client = self.coach_service.openai_client
        self.gemini_client = self.coach_service.gemini_client
        self.llm_provider = self.coach_service.llm_provider
    
    def get_mood_suggestions(self, user_id: int, mood: str, note: str = "") -> Dict:
        """
        Get AI-powered personalized suggestions based on mood and description
        
        Returns:
            {
                "suggestions": List[str],  # List of actionable suggestions
                "insights": str,  # AI-generated insight about the mood
                "recommended_activities": List[str],  # Specific activities to try
                "affirmation": str,  # Positive affirmation
                "sentiment_analysis": Dict  # Sentiment analysis of the note
            }
        """
        try:
            # Analyze sentiment of the note if provided
            sentiment_result = {
                "sentiment_score": 0.0,
                "label": "neutral"
            }
            if note:
                sentiment_result = self.sentiment_analyzer.analyze(note)
            
            # Get user context for personalized suggestions
            user_features = self.data_loader.get_user_features(user_id)
            
            # Get recent mood history for pattern detection
            moods = self.data_loader.get_user_moods(user_id=user_id, days=7)
            mood_history = []
            if not moods.empty:
                mood_history = moods['mood'].tolist()[:5]  # Last 5 moods
            
            # Generate AI suggestions
            if self.llm_provider == "gemini" and self.gemini_client:
                result = self._gemini_mood_suggestions(mood, note, sentiment_result, user_features, mood_history)
            elif self.llm_provider == "openai" and self.openai_client:
                result = self._openai_mood_suggestions(mood, note, sentiment_result, user_features, mood_history)
            else:
                # Enhanced rule-based suggestions
                result = self._rule_based_mood_suggestions(mood, note, sentiment_result, user_features, mood_history)
            
            return result
            
        except Exception as e:
            logger.error(f"Error in mood suggestions: {e}")
            import traceback
            logger.error(traceback.format_exc())
            # Return fallback suggestions
            return self._get_fallback_suggestions(mood, note)
    
    def _gemini_mood_suggestions(self, mood: str, note: str, sentiment: Dict, features: Dict, mood_history: List) -> Dict:
        """Generate mood suggestions using Gemini"""
        try:
            prompt = self._build_mood_prompt(mood, note, sentiment, features, mood_history)
            
            system_instruction = """You are a compassionate, empathetic AI wellness coach for FocusWave. 
- CRITICAL: Generate UNIQUE, DIFFERENT suggestions each time - avoid generic or repetitive responses
- Provide personalized, actionable suggestions based on the SPECIFIC mood and description provided
- Be supportive, understanding, and encouraging
- Give 3-5 specific, practical suggestions that are RELEVANT to what the user actually wrote
- Include insights about their mood pattern if relevant, but make them PERSONALIZED
- Suggest 2-3 concrete activities they can do right now - vary these based on context
- Provide a warm, positive affirmation that feels GENUINE and SPECIFIC
- Keep responses concise and helpful
- Be ADHD-friendly (simple, clear, actionable)
- IMPORTANT: If they mention specific topics (work, study, relationships, sleep, etc.), address those directly in your suggestions
- Vary your language and approach - don't use the same phrases every time"""
            
            full_prompt = f"{system_instruction}\n\n{prompt}\n\nFormat your response as:\nSUGGESTIONS:\n1. [suggestion]\n2. [suggestion]\n3. [suggestion]\n\nINSIGHT:\n[insight about their mood]\n\nACTIVITIES:\n1. [activity]\n2. [activity]\n\nAFFIRMATION:\n[positive affirmation]"
            
            generation_config = {
                "temperature": 0.9,  # Increased for more creativity and variety
                "max_output_tokens": 500,  # Increased for more detailed responses
            }
            
            # Safety settings - DISABLED for wellness content to avoid false positives
            # Wellness/mental health content often triggers safety filters incorrectly
            safety_settings = None
            # Try most permissive settings first, if available
            if GEMINI_AVAILABLE and HarmCategory and HarmBlockThreshold:
                try:
                    # Use BLOCK_NONE for wellness content (most permissive)
                    # This allows mental health and wellness discussions
                    if hasattr(HarmBlockThreshold, 'BLOCK_NONE'):
                        safety_settings = [
                            {"category": HarmCategory.HARM_CATEGORY_HARASSMENT, "threshold": HarmBlockThreshold.BLOCK_NONE},
                            {"category": HarmCategory.HARM_CATEGORY_HATE_SPEECH, "threshold": HarmBlockThreshold.BLOCK_NONE},
                            {"category": HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, "threshold": HarmBlockThreshold.BLOCK_NONE},
                            {"category": HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, "threshold": HarmBlockThreshold.BLOCK_ONLY_HIGH},
                        ]
                    else:
                        # Fallback: Use lowest blocking threshold available
                        safety_settings = [
                            {"category": HarmCategory.HARM_CATEGORY_HARASSMENT, "threshold": HarmBlockThreshold.BLOCK_ONLY_HIGH},
                            {"category": HarmCategory.HARM_CATEGORY_HATE_SPEECH, "threshold": HarmBlockThreshold.BLOCK_ONLY_HIGH},
                            {"category": HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, "threshold": HarmBlockThreshold.BLOCK_ONLY_HIGH},
                            {"category": HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, "threshold": HarmBlockThreshold.BLOCK_ONLY_HIGH},
                        ]
                except Exception as safety_err:
                    logger.debug(f"Could not set safety settings: {safety_err}, using no safety settings")
                    safety_settings = None
            
            try:
                # Don't pass safety_settings - use API defaults (usually more permissive)
                # Passing None or omitting it often works better than explicit settings
                response = self.gemini_client.generate_content(
                    full_prompt,
                    generation_config=generation_config
                )
                
                # Check if response was blocked by safety filters
                # finish_reason 2 = SAFETY (blocked by safety filters)
                if response.candidates and len(response.candidates) > 0:
                    candidate = response.candidates[0]
                    finish_reason = getattr(candidate, 'finish_reason', None)
                    
                    # Check if blocked (finish_reason can be enum or int)
                    is_blocked = False
                    if finish_reason is not None:
                        # Handle both enum and integer values
                        if hasattr(finish_reason, '__int__'):
                            is_blocked = int(finish_reason) == 2
                        else:
                            is_blocked = finish_reason == 2
                        
                        # Also check enum name if available
                        if not is_blocked and hasattr(finish_reason, 'name'):
                            is_blocked = finish_reason.name == 'SAFETY'
                    
                    if is_blocked:
                        logger.warning("Gemini response blocked by safety filters (finish_reason=SAFETY), using fallback")
                        return self._rule_based_mood_suggestions(mood, note, sentiment, features, mood_history)
                
                # Safely extract text
                try:
                    message = response.text.strip()
                except ValueError as text_error:
                    # If text extraction fails, check for alternative ways to get the content
                    if response.candidates and len(response.candidates) > 0:
                        candidate = response.candidates[0]
                        if candidate.content and candidate.content.parts:
                            message = "".join(part.text for part in candidate.content.parts if hasattr(part, 'text'))
                            if not message:
                                logger.warning(f"Could not extract text from Gemini response: {text_error}")
                                return self._rule_based_mood_suggestions(mood, note, sentiment, features, mood_history)
                        else:
                            logger.warning(f"Gemini response has no content: {text_error}")
                            return self._rule_based_mood_suggestions(mood, note, sentiment, features, mood_history)
                    else:
                        logger.warning(f"Gemini response has no candidates: {text_error}")
                        return self._rule_based_mood_suggestions(mood, note, sentiment, features, mood_history)
                        
            except Exception as api_error:
                logger.warning(f"Gemini API error: {api_error}")
                return self._rule_based_mood_suggestions(mood, note, sentiment, features, mood_history)
            
            # Parse the response
            if message:
                return self._parse_ai_response(message, mood, sentiment)
            else:
                # Empty message, use fallback
                logger.warning("Gemini returned empty message, using rule-based fallback")
                return self._rule_based_mood_suggestions(mood, note, sentiment, features, mood_history)
            
        except Exception as e:
            error_msg = str(e)
            if "safety" in error_msg.lower() or "finish_reason" in error_msg.lower() or "blocked" in error_msg.lower():
                logger.warning(f"Gemini response blocked by safety filters: {error_msg}")
            else:
                logger.error(f"Gemini mood suggestions error: {e}")
            return self._rule_based_mood_suggestions(mood, note, sentiment, features, mood_history)
    
    def _openai_mood_suggestions(self, mood: str, note: str, sentiment: Dict, features: Dict, mood_history: List) -> Dict:
        """Generate mood suggestions using OpenAI"""
        try:
            prompt = self._build_mood_prompt(mood, note, sentiment, features, mood_history)
            
            system_prompt = """You are a compassionate, empathetic AI wellness coach for FocusWave. 
- CRITICAL: Generate UNIQUE, DIFFERENT suggestions each time - avoid generic or repetitive responses
- Provide personalized, actionable suggestions based on the SPECIFIC mood and description provided
- Be supportive, understanding, and encouraging
- Give 3-5 specific, practical suggestions that are RELEVANT to what the user actually wrote
- Include insights about their mood pattern if relevant, but make them PERSONALIZED
- Suggest 2-3 concrete activities they can do right now - vary these based on context
- Provide a warm, positive affirmation that feels GENUINE and SPECIFIC
- Keep responses concise and helpful
- Be ADHD-friendly (simple, clear, actionable)
- IMPORTANT: If they mention specific topics (work, study, relationships, sleep, etc.), address those directly in your suggestions
- Vary your language and approach - don't use the same phrases every time

Format your response as:
SUGGESTIONS:
1. [suggestion]
2. [suggestion]
3. [suggestion]

INSIGHT:
[insight about their mood]

ACTIVITIES:
1. [activity]
2. [activity]

AFFIRMATION:
[positive affirmation]"""
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
            
            response = self.openai_client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                max_tokens=500,  # Increased for more detailed responses
                temperature=0.9  # Increased for more creativity and variety
            )
            
            message = response.choices[0].message.content.strip()
            
            # Parse the response
            return self._parse_ai_response(message, mood, sentiment)
            
        except Exception as e:
            logger.error(f"OpenAI mood suggestions error: {e}")
            return self._rule_based_mood_suggestions(mood, note, sentiment, features, mood_history)
    
    def _build_mood_prompt(self, mood: str, note: str, sentiment: Dict, features: Dict, mood_history: List) -> str:
        """Build prompt for mood suggestions"""
        # Extract keywords from note for better context
        note_keywords = self._extract_keywords_from_note(note) if note else []
        current_hour = datetime.now().hour
        time_of_day = "morning" if 5 <= current_hour < 12 else "afternoon" if 12 <= current_hour < 17 else "evening" if 17 <= current_hour < 22 else "night"
        
        prompt = f"""User's Current Mood: {mood}
Time of Day: {time_of_day} ({current_hour}:00)
"""
        
        if note:
            prompt += f'User\'s Description: "{note}"\n'
            prompt += f"Sentiment Analysis: {sentiment['label']} (score: {sentiment['sentiment_score']:.2f})\n"
            if note_keywords:
                prompt += f"Key themes in description: {', '.join(note_keywords[:5])}\n"
        
        prompt += f"""
User Context:
- Current streak: {features.get('current_streak', 0)} days
- Sessions today: {features.get('sessions_today', 0)}
- Pending tasks: {features.get('pending_tasks', 0)}
- Completion rate: {features.get('completion_rate', 50):.1f}%
- Recent mood: {features.get('recent_mood', 'unknown')}
"""
        
        if mood_history:
            prompt += f"Recent mood pattern: {', '.join(mood_history[-3:])}\n"
            # Analyze mood trend
            if len(mood_history) >= 2:
                mood_trend = "improving" if mood_history[-1] in ['happy', 'calm'] and mood_history[-2] not in ['happy', 'calm'] else "stable" if mood_history[-1] == mood_history[-2] else "fluctuating"
                prompt += f"Mood trend: {mood_trend}\n"
        
        prompt += f"""
IMPORTANT: Generate UNIQUE, SPECIFIC, and PERSONALIZED suggestions based on:
1. The specific mood ({mood}) and note content
2. Time of day ({time_of_day}) - adjust suggestions accordingly
3. User's actual description and context
4. Make each suggestion DIFFERENT and RELEVANT to what they actually wrote

Avoid generic responses. If they mention specific things (work, study, relationships, sleep, etc.), 
address those directly. Be creative and vary your suggestions each time.
"""
        
        return prompt
    
    def _parse_ai_response(self, message: str, mood: str, sentiment: Dict) -> Dict:
        """Parse AI response into structured format with improved parsing"""
        suggestions = []
        insight = ""
        activities = []
        affirmation = ""
        
        # Enhanced parsing - handle multiple formats
        lines = message.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # More flexible section detection
            line_upper = line.upper()
            if any(keyword in line_upper for keyword in ['SUGGESTIONS:', 'SUGGESTION:', 'RECOMMENDATIONS:', 'TRY:', 'YOU CAN:']):
                current_section = 'suggestions'
                # Check if there's content on the same line
                if ':' in line:
                    content = line.split(':', 1)[1].strip()
                    if content:
                        suggestions.append(content.lstrip('1234567890.-) '))
                continue
            elif any(keyword in line_upper for keyword in ['INSIGHT:', 'OBSERVATION:', 'NOTICING:', 'I NOTICE:']):
                current_section = 'insight'
                if ':' in line:
                    content = line.split(':', 1)[1].strip()
                    if content:
                        insight += content + " "
                continue
            elif any(keyword in line_upper for keyword in ['ACTIVITIES:', 'ACTIVITY:', 'TRY THESE:', 'DO THIS:']):
                current_section = 'activities'
                if ':' in line:
                    content = line.split(':', 1)[1].strip()
                    if content:
                        activities.append(content.lstrip('1234567890.-) '))
                continue
            elif any(keyword in line_upper for keyword in ['AFFIRMATION:', 'REMEMBER:', 'YOU ARE:', 'AFFIRM:']):
                current_section = 'affirmation'
                if ':' in line:
                    content = line.split(':', 1)[1].strip()
                    if content:
                        affirmation += content + " "
                continue
            
            # Process content based on current section
            if current_section == 'suggestions':
                # Remove numbering, bullets, dashes
                line = re.sub(r'^[\d\-\.\)\*\+\-]\s*', '', line)
                line = line.lstrip('•- ')
                if line and len(line) > 10:  # Filter out very short lines
                    suggestions.append(line)
            elif current_section == 'insight':
                if line and not line.startswith('#'):  # Skip markdown headers
                    insight += line + " "
            elif current_section == 'activities':
                line = re.sub(r'^[\d\-\.\)\*\+\-]\s*', '', line)
                line = line.lstrip('•- ')
                if line and len(line) > 10:
                    activities.append(line)
            elif current_section == 'affirmation':
                if line and not line.startswith('#'):
                    affirmation += line + " "
        
        # Clean up
        insight = insight.strip()
        affirmation = affirmation.strip()
        
        # Remove duplicates
        suggestions = list(dict.fromkeys(suggestions))  # Preserves order
        activities = list(dict.fromkeys(activities))
        
        # If parsing failed or insufficient content, supplement with rule-based
        if not suggestions or len(suggestions) < 2:
            # Get contextual suggestions to supplement
            note_lower = ""  # We don't have note here, but we can use mood-specific
            mood_suggestions = random.sample(self._get_mood_specific_suggestions(mood), min(3, len(self._get_mood_specific_suggestions(mood))))
            suggestions.extend(mood_suggestions)
            suggestions = list(dict.fromkeys(suggestions))  # Remove duplicates
        
        if not activities or len(activities) < 2:
            mood_activities = random.sample(self._get_mood_specific_activities(mood), min(2, len(self._get_mood_specific_activities(mood))))
            activities.extend(mood_activities)
            activities = list(dict.fromkeys(activities))
        
        if not insight:
            # Generate a basic insight
            default_insights = {
                'happy': "Your positive mood is wonderful! Use this energy well.",
                'calm': "This peaceful state is perfect for focused work or reflection.",
                'neutral': "Neutral is perfectly fine. Every day doesn't need to be extraordinary.",
                'tired': "Feeling tired is your body's signal. Rest is productive too.",
                'anxious': "Anxiety is tough, but manageable. Take it one step at a time.",
                'sad': "Your feelings are valid. Be gentle with yourself today."
            }
            insight = default_insights.get(mood, f"Your {mood} mood is valid. Remember to be kind to yourself.")
        
        if not affirmation:
            affirmation = self._get_mood_affirmation(mood, "")
        
        # Shuffle for variety
        random.shuffle(suggestions)
        random.shuffle(activities)
        
        return {
            "suggestions": suggestions[:5],  # Limit to 5
            "insights": insight,
            "recommended_activities": activities[:3],  # Limit to 3
            "affirmation": affirmation,
            "sentiment_analysis": sentiment
        }
    
    def _rule_based_mood_suggestions(self, mood: str, note: str, sentiment: Dict, features: Dict, mood_history: List) -> Dict:
        """Enhanced rule-based mood suggestions with note analysis and variety"""
        suggestions = []
        activities = []
        insight_parts = []
        
        # Analyze note for specific context
        note_lower = note.lower() if note else ""
        note_keywords = self._extract_keywords_from_note(note) if note else []
        current_hour = datetime.now().hour
        time_context = self._get_time_context(current_hour)
        
        # Get mood-specific base suggestions (will randomize later)
        all_mood_suggestions = self._get_mood_specific_suggestions(mood)
        all_mood_activities = self._get_mood_specific_activities(mood)
        
        # Add contextual suggestions based on note content
        contextual_suggestions = self._get_contextual_suggestions(mood, note_lower, note_keywords, features, time_context)
        suggestions.extend(contextual_suggestions)
        
        # Add mood-specific suggestions (randomized selection for variety)
        if len(all_mood_suggestions) > 0:
            # Randomly select 2-3 from mood-specific suggestions
            num_to_select = min(3, len(all_mood_suggestions))
            selected = random.sample(all_mood_suggestions, num_to_select)
            suggestions.extend(selected)
        
        # Add mood-specific activities (randomized)
        if len(all_mood_activities) > 0:
            num_to_select = min(2, len(all_mood_activities))
            selected = random.sample(all_mood_activities, num_to_select)
            activities.extend(selected)
        
        # Pattern detection with more variety
        if len(mood_history) >= 3:
            recent_moods = mood_history[-3:]
            if all(m == mood for m in recent_moods):
                patterns = {
                    'anxious': [
                        f"You've been feeling anxious for a few days. This is valid, and it's okay to slow down.",
                        "I notice you've been anxious lately. Consider what might be contributing to this pattern.",
                        "Consistent anxiety can be draining. Remember, it's okay to prioritize self-care."
                    ],
                    'sad': [
                        f"You've been feeling down for a few days. Your feelings are valid.",
                        "I see you've been feeling sad recently. Consider reaching out for support.",
                        "Sadness over multiple days can be heavy. Be gentle with yourself."
                    ],
                    'tired': [
                        f"You've been tired for a few days. Rest is not laziness - it's necessary.",
                        "Consistent fatigue suggests you might need more rest or check-in with your energy levels.",
                        "Being tired for days is your body's signal. Listen to it."
                    ],
                    'happy': [
                        "You've been consistently positive! This is great momentum to build on.",
                        "Your positive streak is wonderful! Use this energy wisely.",
                        "Consistent happiness is a gift - savor it and share it."
                    ]
                }
                if mood in patterns:
                    insight_parts.append(random.choice(patterns[mood]))
        
        # Sentiment-based insights with variety
        if sentiment['label'] == 'negative' and mood in ['anxious', 'sad', 'tired']:
            negative_insights = [
                "I notice your description has negative sentiment. Remember, difficult emotions are temporary and valid.",
                "Your words reflect some difficulty. These feelings won't last forever.",
                "I can sense some heaviness in what you've shared. Be kind to yourself - this is temporary."
            ]
            insight_parts.append(random.choice(negative_insights))
        elif sentiment['label'] == 'positive' and mood == 'happy':
            positive_insights = [
                "Your positive energy shines through in your words! Channel this into your tasks.",
                "I can feel the positive energy in what you've written. Use this momentum!",
                "Your words radiate positivity! This is a great state to be in."
            ]
            insight_parts.append(random.choice(positive_insights))
        elif sentiment['label'] == 'neutral':
            if note and len(note) > 20:
                insight_parts.append("I appreciate you sharing. Even neutral feelings are worth acknowledging.")
        
        # Note-specific insights
        if note:
            if any(keyword in note_lower for keyword in ['work', 'job', 'office', 'project', 'deadline']):
                insight_parts.append("I see work is on your mind. Remember to balance productivity with self-care.")
            if any(keyword in note_lower for keyword in ['study', 'exam', 'test', 'homework', 'assignment']):
                insight_parts.append("Studying can be intense. Take breaks and be patient with your progress.")
            if any(keyword in note_lower for keyword in ['friend', 'family', 'relationship', 'partner']):
                insight_parts.append("Relationships matter. It's okay to prioritize connection and communication.")
            if any(keyword in note_lower for keyword in ['sleep', 'tired', 'exhausted', 'rest']):
                insight_parts.append("Sleep and rest are foundational. Your body needs this to function well.")
            if any(keyword in note_lower for keyword in ['overwhelmed', 'stressed', 'pressure', 'too much']):
                insight_parts.append("Feeling overwhelmed is valid. Break things down into smaller, manageable pieces.")
        
        # Task-based suggestions with context
        pending_tasks = features.get('pending_tasks', 0)
        if pending_tasks > 5 and mood in ['anxious', 'tired']:
            task_suggestions = [
                f"You have {pending_tasks} tasks. Break them into smaller pieces - start with just one.",
                f"With {pending_tasks} tasks, pick the ONE most important and focus only on that.",
                f"Your task list is long ({pending_tasks} tasks). Try the '2-minute rule' - do quick tasks first."
            ]
            suggestions.append(random.choice(task_suggestions))
        elif pending_tasks == 0 and mood == 'happy':
            suggestions.append("Great job staying on top of tasks! Use this energy to tackle something new or creative.")
        
        # Time-based suggestions
        if time_context == 'morning' and mood in ['tired', 'anxious']:
            suggestions.append("Since it's morning, try some light movement or a nutritious breakfast to boost your energy.")
        elif time_context == 'evening' and mood == 'anxious':
            suggestions.append("Evening anxiety is common. Try a calming routine - maybe tea, reading, or gentle music.")
        elif time_context == 'night' and mood != 'tired':
            suggestions.append("It's getting late. Consider winding down to ensure you get enough rest.")
        
        # Streak-based insights with variety
        streak = features.get('current_streak', 0)
        if streak > 0:
            streak_insights = [
                f"You're on a {streak}-day streak - that shows resilience!",
                f"Your {streak}-day streak demonstrates consistency. Keep it up!",
                f"{streak} days in a row? That's impressive dedication!"
            ]
            insight_parts.append(random.choice(streak_insights))
        
        # Build insight
        if not insight_parts:
            default_insights = {
                'happy': "Your positive mood is wonderful! Use this energy well.",
                'calm': "This peaceful state is perfect for focused work or reflection.",
                'neutral': "Neutral is perfectly fine. Every day doesn't need to be extraordinary.",
                'tired': "Feeling tired is your body's signal. Rest is productive too.",
                'anxious': "Anxiety is tough, but manageable. Take it one step at a time.",
                'sad': "Your feelings are valid. Be gentle with yourself today."
            }
            insight_parts.append(default_insights.get(mood, f"Your {mood} mood is completely valid. Remember to be kind to yourself."))
        
        insight = " ".join(insight_parts[:2])  # Limit to 2 insights to avoid overwhelming
        
        # Shuffle suggestions for variety
        random.shuffle(suggestions)
        random.shuffle(activities)
        
        return {
            "suggestions": suggestions[:5],  # Return top 5
            "insights": insight,
            "recommended_activities": activities[:3],  # Return top 3
            "affirmation": self._get_mood_affirmation(mood, note_lower),
            "sentiment_analysis": sentiment
        }
    
    def _extract_keywords_from_note(self, note: str) -> List[str]:
        """Extract relevant keywords from note for context"""
        if not note:
            return []
        
        note_lower = note.lower()
        keywords = []
        
        # Context keywords
        context_keywords = {
            'work': ['work', 'job', 'office', 'career', 'boss', 'colleague', 'meeting', 'project', 'deadline', 'presentation'],
            'study': ['study', 'exam', 'test', 'homework', 'assignment', 'class', 'lecture', 'grades', 'school', 'university'],
            'relationships': ['friend', 'family', 'relationship', 'partner', 'love', 'dating', 'breakup', 'conflict', 'argument'],
            'health': ['sick', 'pain', 'headache', 'ache', 'ill', 'health', 'doctor', 'medicine', 'symptoms'],
            'sleep': ['sleep', 'tired', 'exhausted', 'insomnia', 'rest', 'bed', 'wake', 'night', 'morning'],
            'stress': ['stressed', 'overwhelmed', 'pressure', 'too much', 'busy', 'rushed', 'panic', 'worry'],
            'achievement': ['accomplished', 'finished', 'completed', 'success', 'proud', 'achieved', 'done', 'won'],
            'social': ['party', 'event', 'celebration', 'together', 'lonely', 'alone', 'isolated', 'social'],
            'exercise': ['workout', 'exercise', 'gym', 'run', 'walk', 'fitness', 'sport', 'activity'],
            'food': ['food', 'eat', 'meal', 'hungry', 'cooking', 'restaurant', 'dinner', 'breakfast', 'lunch']
        }
        
        for category, words in context_keywords.items():
            if any(word in note_lower for word in words):
                keywords.append(category)
        
        return keywords[:5]  # Limit to 5 keywords
    
    def _get_time_context(self, hour: int) -> str:
        """Get time of day context"""
        if 5 <= hour < 12:
            return 'morning'
        elif 12 <= hour < 17:
            return 'afternoon'
        elif 17 <= hour < 22:
            return 'evening'
        else:
            return 'night'
    
    def _get_contextual_suggestions(self, mood: str, note_lower: str, keywords: List[str], features: Dict, time_context: str) -> List[str]:
        """Generate contextual suggestions based on note content and keywords"""
        suggestions = []
        
        # Work-related suggestions
        if 'work' in keywords or any(word in note_lower for word in ['work', 'job', 'office', 'deadline', 'project']):
            if mood == 'anxious':
                suggestions.extend([
                    "Break your work into 25-minute Pomodoro sessions. Focus on one task at a time.",
                    "List all your work tasks, then pick the ONE most important. Start there.",
                    "Set clear boundaries for work hours. You don't need to be available 24/7."
                ])
            elif mood == 'tired':
                suggestions.extend([
                    "If you're working while tired, prioritize rest. Work can wait, your health can't.",
                    "Consider taking a power nap (20 minutes) before continuing work.",
                    "Delegate what you can. You don't have to do everything yourself."
                ])
            elif mood == 'happy':
                suggestions.extend([
                    "Use this positive energy to tackle your most challenging work task!",
                    "Your good mood is perfect for creative or collaborative work projects.",
                    "Channel this energy into building good work habits or relationships."
                ])
        
        # Study-related suggestions
        if 'study' in keywords or any(word in note_lower for word in ['study', 'exam', 'test', 'homework', 'assignment']):
            if mood == 'anxious':
                suggestions.extend([
                    "Break your study session into 25-minute focused blocks with 5-minute breaks.",
                    "Create a study plan - knowing what to study reduces anxiety.",
                    "Focus on understanding, not just memorizing. Take it one topic at a time."
                ])
            elif mood == 'tired':
                suggestions.extend([
                    "Don't study when exhausted - your brain won't retain information well.",
                    "If you must study, do it in short 15-minute bursts with longer breaks.",
                    "Sleep is more important than cramming. Well-rested studying is more effective."
                ])
            elif mood in ['happy', 'calm']:
                suggestions.extend([
                    "Your positive/calm state is perfect for deep learning. Start a focused study session!",
                    "Use this good energy to review difficult concepts or practice problems.",
                    "This is a great time to create study notes or flashcards."
                ])
        
        # Relationship-related suggestions
        if 'relationships' in keywords or any(word in note_lower for word in ['friend', 'family', 'relationship', 'partner', 'love']):
            if mood == 'sad':
                suggestions.extend([
                    "Reach out to someone you trust. You don't have to face this alone.",
                    "Write a letter (you don't have to send it) to process your feelings.",
                    "Remember: relationships have ups and downs. This difficult time will pass."
                ])
            elif mood == 'happy':
                suggestions.extend([
                    "Share your good mood with someone you care about - spread the positivity!",
                    "Use this positive energy to strengthen your relationships.",
                    "Reach out to someone you haven't talked to in a while."
                ])
            elif mood == 'anxious':
                suggestions.extend([
                    "Open communication often resolves relationship anxiety. Consider having an honest conversation.",
                    "Remember that misunderstandings happen. Give people (and yourself) grace.",
                    "Focus on what you can control in relationships, not what you can't."
                ])
        
        # Sleep/rest-related suggestions
        if 'sleep' in keywords or any(word in note_lower for word in ['sleep', 'tired', 'exhausted', 'rest', 'insomnia']):
            suggestions.extend([
                "Create a bedtime routine: dim lights, avoid screens 1 hour before bed, maybe read or meditate.",
                "If you're having trouble sleeping, try the 4-7-8 breathing technique: inhale 4, hold 7, exhale 8.",
                "Sleep hygiene matters: cool room, dark, quiet. Consider earplugs or an eye mask.",
                "If you can't sleep, don't force it. Get up, do something calm (read, listen to music), then try again.",
                "Rest is not optional - it's essential for your well-being and productivity."
            ])
        
        # Stress/overwhelm suggestions
        if 'stress' in keywords or any(word in note_lower for word in ['overwhelmed', 'stressed', 'pressure', 'too much', 'busy']):
            suggestions.extend([
                "Make a 'brain dump' list - write EVERYTHING down, then prioritize just the top 3.",
                "Use the '2-minute rule': if something takes less than 2 minutes, do it now. Otherwise, schedule it.",
                "Practice the 'STOP' technique: Stop, Take a breath, Observe your thoughts, Proceed mindfully.",
                "Break overwhelming tasks into tiny 5-minute steps. Just do one 5-minute step now.",
                "Remember: you don't have to do everything today. What can wait until tomorrow?"
            ])
        
        # Time-based contextual suggestions
        if time_context == 'morning':
            if mood == 'tired':
                suggestions.append("Morning fatigue? Try: sunlight exposure, light movement, protein-rich breakfast, or a cold shower.")
            elif mood == 'anxious':
                suggestions.append("Morning anxiety is common. Try: deep breathing, light exercise, or planning your day to feel more in control.")
        elif time_context == 'evening':
            if mood == 'anxious':
                suggestions.append("Evening anxiety often comes from the day's accumulation. Try: journaling, gentle stretching, or a warm drink.")
            elif mood == 'happy':
                suggestions.append("Evening is perfect for reflection. Write down what went well today or plan something nice for tomorrow.")
        elif time_context == 'night':
            suggestions.append("It's late - prioritize rest. Tomorrow will be better if you're well-rested.")
        
        return suggestions
    
    def _get_mood_specific_suggestions(self, mood: str) -> List[str]:
        """Get expanded mood-specific suggestions for variety"""
        suggestions_map = {
            'happy': [
                "Channel this positive energy into a productive task!",
                "Use this momentum to tackle something challenging.",
                "Share your good mood - help someone else feel better too.",
                "Take a moment to appreciate this feeling and what brought it.",
                "Document this moment - write down what made you happy today.",
                "Use this energy to start something new you've been putting off.",
                "Your positivity is a gift - share it with someone who might need it.",
                "This is a great time to tackle creative or social activities.",
                "Set a small goal while you're feeling motivated.",
                "Use this good mood to build a positive habit or routine."
            ],
            'calm': [
                "This is a great state for focused work - start a Pomodoro session.",
                "Use this peaceful energy to plan your day thoughtfully.",
                "Practice mindfulness - this calm state is valuable.",
                "Take on tasks that require steady, sustained attention.",
                "This is perfect for deep work or creative projects.",
                "Use this calm to reflect on what's working well in your life.",
                "Try meditation or gentle movement to maintain this state.",
                "This is a great time for strategic planning or problem-solving.",
                "Enjoy this peaceful moment - not every day needs to be intense.",
                "Use this calm to organize your thoughts or space."
            ],
            'neutral': [
                "Neutral is okay! Start with a small task to build momentum.",
                "Try a quick 5-minute activity to shift your energy.",
                "Break down one task into tiny steps - progress matters.",
                "Sometimes neutral is the perfect state for getting things done.",
                "Use this balanced state to make practical decisions.",
                "Neutral can be productive - you're not too high or too low.",
                "Try something small and see if it shifts your energy.",
                "This is a good time for routine tasks or maintenance.",
                "Accept neutral - not every moment needs to be intense.",
                "Use this state to build consistency in small habits."
            ],
            'tired': [
                "Rest is productive! Take a 15-20 minute break if you can.",
                "Hydrate and have a healthy snack - low energy often means basic needs.",
                "Do just ONE small task, then rest. Progress over perfection.",
                "Consider a short walk or gentle stretching to re-energize.",
                "Listen to your body - if you're tired, rest is what you need.",
                "Avoid caffeine late in the day if it affects your sleep.",
                "Take a power nap (20 minutes max) if possible.",
                "Check: are you hydrated? Sometimes fatigue is just dehydration.",
                "Do the easiest task first to build momentum without draining energy.",
                "Remember: rest is not laziness. Your body needs recovery time."
            ],
            'anxious': [
                "Take 5 deep breaths - in through your nose, out through your mouth.",
                "Break tasks into tiny, manageable pieces. You don't need to do everything at once.",
                "Write down what's making you anxious - getting it out helps.",
                "Try a 5-minute grounding exercise: name 5 things you see, 4 you hear, 3 you feel.",
                "Practice the 5-4-3-2-1 technique: 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.",
                "Anxiety is often about the future. Focus on just this moment, right now.",
                "Try progressive muscle relaxation: tense and release each muscle group.",
                "Write a worry list, then set it aside. You can come back to it later.",
                "Remember: anxiety is temporary. This feeling will pass.",
                "Do one small, calming activity: drink tea, listen to music, or look at something beautiful."
            ],
            'sad': [
                "Your feelings are valid. Be gentle with yourself today.",
                "Do one small thing that usually brings you joy - even if it's tiny.",
                "Connect with someone you trust - you don't have to go through this alone.",
                "Remember: emotions are temporary. This feeling will pass.",
                "Write in a journal about how you're feeling - sometimes expressing helps.",
                "Listen to music that matches or soothes your mood.",
                "Do something kind for yourself - even something very small.",
                "Get outside if you can - nature can be healing.",
                "Remember: it's okay to not be okay. You're human.",
                "Consider talking to a friend, family member, or professional if this persists."
            ]
        }
        return suggestions_map.get(mood, [
            "Take a moment to check in with yourself.",
            "Be kind to yourself today.",
            "Small steps forward are still progress."
        ])
    
    def _get_mood_specific_activities(self, mood: str) -> List[str]:
        """Get expanded mood-specific activities for variety"""
        activities_map = {
            'happy': [
                "Start a focus session on a challenging task",
                "Help a friend or colleague with something",
                "Plan and organize for tomorrow",
                "Tackle a creative project you've been putting off",
                "Reach out to someone you haven't talked to in a while",
                "Start learning something new or interesting",
                "Do something kind for someone else",
                "Engage in a hobby or activity you love",
                "Set a new goal or challenge for yourself",
                "Celebrate a recent accomplishment, no matter how small"
            ],
            'calm': [
                "Begin a 25-minute Pomodoro session",
                "Practice 5 minutes of meditation",
                "Work on a task that requires deep focus",
                "Do some gentle stretching or yoga",
                "Read a book or article",
                "Practice gratitude journaling",
                "Go for a peaceful walk",
                "Work on a puzzle or brain teaser",
                "Do some mindful breathing exercises",
                "Organize or declutter a small space"
            ],
            'neutral': [
                "Complete one small task to build momentum",
                "Take a 5-minute walk to refresh",
                "Start a short Pomodoro session",
                "Try a quick 5-minute activity",
                "Do something routine and familiar",
                "Check off one item from your to-do list",
                "Have a healthy snack or drink",
                "Listen to a podcast or music",
                "Do a quick tidy-up",
                "Start with the easiest task first"
            ],
            'tired': [
                "Take a 15-20 minute rest break",
                "Do gentle stretching or yoga",
                "Have a healthy snack and hydrate",
                "Get some fresh air - even 5 minutes helps",
                "Take a power nap (20 minutes max)",
                "Drink water and check if you're hydrated",
                "Do the easiest, least demanding task",
                "Listen to calming music or nature sounds",
                "Practice gentle breathing exercises",
                "Consider if you need more sleep tonight"
            ],
            'anxious': [
                "Try a 5-minute breathing exercise",
                "Write in a journal about what's on your mind",
                "Do a quick 5-minute meditation",
                "Practice the 5-4-3-2-1 grounding technique",
                "Go for a short walk to clear your mind",
                "Do progressive muscle relaxation",
                "Listen to calming music or sounds",
                "Write down your worries, then set them aside",
                "Do a simple, repetitive task to calm your mind",
                "Try a guided meditation or breathing app"
            ],
            'sad': [
                "Listen to your favorite music",
                "Call or text someone you care about",
                "Do one small act of self-care",
                "Write about your feelings in a journal",
                "Watch something that makes you laugh",
                "Do something creative (draw, write, craft)",
                "Get outside if possible - nature helps",
                "Do something you used to enjoy",
                "Practice self-compassion - be kind to yourself",
                "Consider reaching out for support"
            ]
        }
        return activities_map.get(mood, [
            "Take a moment to breathe",
            "Do something kind for yourself",
            "Check in with how you're feeling"
        ])
    
    def _get_mood_affirmation(self, mood: str, note_lower: str = "") -> str:
        """Get varied mood-specific affirmation based on context"""
        # Multiple affirmations per mood for variety
        affirmations_map = {
            'happy': [
                "Your positive energy is contagious! Keep spreading that good vibe. ✨",
                "This happiness is a gift - savor it and share it with others. 🌟",
                "Your joy matters. Let it fuel you to do great things today! 💫",
                "This positive moment is yours to enjoy. You've earned it! 🎉",
                "Your happiness shines through. Use this energy to make today amazing! ⭐"
            ],
            'calm': [
                "This peaceful state is a gift - use it wisely. You're doing great. 🌊",
                "Your calm is a strength. Use it for focused, meaningful work. 💙",
                "This peaceful moment is valuable. Trust yourself and this state. 🌸",
                "Calm is a superpower. You're in a great state to accomplish things. 🧘",
                "This serenity is perfect. Use it to make thoughtful decisions. 🌺"
            ],
            'neutral': [
                "Neutral is perfectly fine. Every day doesn't need to be extraordinary. You're enough. 💙",
                "Neutral is valid. You don't need to force yourself to feel anything specific. 💜",
                "This balanced state is okay. Sometimes neutral is exactly what you need. 🌼",
                "Neutral is a valid emotional state. Be gentle with yourself. 💚",
                "It's okay to feel neutral. You're human, and all feelings are valid. 🤍"
            ],
            'tired': [
                "Rest is not weakness - it's self-care. You're allowed to slow down. 😴",
                "Your body is asking for rest. Listen to it - rest is productive too. 💤",
                "Tiredness is a signal, not a failure. Take care of yourself. 🌙",
                "Rest is essential. You're not lazy - you're human. Take care. 🌛",
                "Being tired is valid. Your body needs rest to function well. Rest well. 🌃"
            ],
            'anxious': [
                "You're stronger than your anxiety. Take it one breath, one moment at a time. You've got this. 💪",
                "Anxiety is tough, but you're tougher. Breathe through it - you can handle this. 🌸",
                "Your anxiety doesn't define you. Take small steps, breathe deeply. You're capable. 💙",
                "Anxiety is temporary. You've gotten through difficult moments before. You will again. 🌺",
                "You're not alone in this feeling. Be patient with yourself. This will pass. 💜"
            ],
            'sad': [
                "Your feelings are valid and temporary. Be gentle with yourself - this too shall pass. 💜",
                "Sadness is human. It's okay to feel this way. Be kind to yourself today. 🌸",
                "Your emotions are valid. This difficult feeling won't last forever. You're stronger than you know. 💙",
                "It's okay to be sad. Feel your feelings, then take one small step forward. You've got this. 🌺",
                "Sadness is temporary. Be gentle with yourself. Better days are ahead. 💜"
            ]
        }
        
        # Select random affirmation for variety
        affirmations = affirmations_map.get(mood, [
            "You're doing your best, and that's enough. Be kind to yourself today. 💙"
        ])
        
        # If note mentions specific things, add context
        if note_lower:
            if any(word in note_lower for word in ['work', 'job', 'career']):
                return random.choice(affirmations) + " Remember: work is part of life, not all of life. 🌟"
            elif any(word in note_lower for word in ['study', 'exam', 'test']):
                return random.choice(affirmations) + " Your education matters, but so does your well-being. 📚"
            elif any(word in note_lower for word in ['friend', 'family', 'relationship']):
                return random.choice(affirmations) + " Relationships matter, and so do you. 💕"
        
        return random.choice(affirmations)
    
    def _get_fallback_suggestions(self, mood: str, note: str) -> Dict:
        """Fallback suggestions when AI fails - use enhanced rule-based"""
        # Use the enhanced rule-based system as fallback
        try:
            note_lower = note.lower() if note else ""
            sentiment = {
                "sentiment_score": 0.0,
                "label": "neutral"
            }
            if note:
                sentiment = self.sentiment_analyzer.analyze(note)
            
            # Get basic user features for context
            features = {
                'current_streak': 0,
                'sessions_today': 0,
                'pending_tasks': 0,
                'completion_rate': 50,
                'recent_mood': mood
            }
            
            return self._rule_based_mood_suggestions(mood, note, sentiment, features, [])
        except Exception as e:
            logger.error(f"Error in fallback suggestions: {e}")
            # Ultimate fallback
            return {
                "suggestions": random.sample(self._get_mood_specific_suggestions(mood), min(3, len(self._get_mood_specific_suggestions(mood)))),
                "insights": f"Your {mood} mood is valid. Remember to be kind to yourself.",
                "recommended_activities": random.sample(self._get_mood_specific_activities(mood), min(2, len(self._get_mood_specific_activities(mood)))),
                "affirmation": self._get_mood_affirmation(mood, note.lower() if note else ""),
                "sentiment_analysis": {
                    "sentiment_score": 0.0,
                    "label": "neutral"
                }
            }

