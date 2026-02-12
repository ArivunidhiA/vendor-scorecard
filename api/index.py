"""
Vercel Serverless Function Entry Point
This file serves as the adapter between Vercel's serverless functions and the FastAPI application.
"""
import sys
import os

# Add the backend directory to Python path so we can import the app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import the FastAPI app from backend
from main import app

# Vercel serverless handler - ASGI adapter
from fastapi import FastAPI

# The app is exported directly - Vercel Python runtime will handle it
# as an ASGI application
