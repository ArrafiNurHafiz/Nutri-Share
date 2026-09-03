"""Vercel Serverless Function entry point for FastAPI.

This file is the bridge between Vercel's Python runtime and the NutriShare
FastAPI application. Vercel looks for an `app` variable (ASGI application)
in the file specified by vercel.json builds[].src.

Usage:
    vercel.json:
        { "builds": [{ "src": "api/index.py", "use": "@vercel/python" }] }
"""
from backend.main import app

# The `app` variable is picked up by Vercel's ASGI adapter.
# No modifications needed — the FastAPI app instance is the ASGI app.
