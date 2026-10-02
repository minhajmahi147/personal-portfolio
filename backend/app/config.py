"""Paths and runtime settings for the portfolio API."""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "data" / "portfolio.db"
DIST_DIR = BASE_DIR.parent / "frontend" / "dist"

SESSION_COOKIE = "portfolio_session"
SESSION_DAYS = 14

# Gmail address + App Password used to send verification codes. If unset, codes are logged.
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
CODE_MINUTES = 10
CODE_RESEND_SECONDS = 60
CODE_MAX_ATTEMPTS = 5

# Comma-separated admin emails (case-insensitive). Override with ADMIN_EMAILS.
ADMIN_EMAILS = {
    email.strip().lower()
    for email in os.environ.get("ADMIN_EMAILS", "admin@gmail.com").split(",")
    if email.strip()
}

def is_admin_email(email: str) -> bool:
    """Return True if ``email`` is configured as an admin."""
    return email.strip().lower() in ADMIN_EMAILS


CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]
