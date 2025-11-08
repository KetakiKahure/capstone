#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Test ML service startup"""
import sys
import os

# Set UTF-8 encoding for Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Add to Python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

try:
    print("Testing config import...")
    from config.config import settings
    print("Config loaded successfully")
    print(f"Database: {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")
    print(f"ML Service: {settings.ML_SERVICE_HOST}:{settings.ML_SERVICE_PORT}")
    print(f"Gemini Key: {settings.GEMINI_API_KEY[:15] if settings.GEMINI_API_KEY else 'Not set'}...")
    
    print("\nTesting app import...")
    from app.main import app
    print("App imported successfully")
    
    print("\nAll imports successful! ML Service should start correctly.")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

