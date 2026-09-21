"""Authentication helpers: passwords, slug/email checks, and session cookies."""

import hashlib
import re
import secrets
from copy import deepcopy
from datetime import datetime, timedelta, timezone

from fastapi import Cookie, HTTPException, Request, Response

from app import db
from app.config import SESSION_COOKIE, SESSION_DAYS
from app.portfolio_default import EMPTY_PORTFOLIO

SLUG_RE = re.compile(r"^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def utcnow() -> datetime:
    """Return the current UTC datetime with timezone info."""
    return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
    """Hash a password with a random salt using PBKDF2-HMAC-SHA256.

    Args:
        password: Plain-text password from registration or a password change.

    Returns:
        A string of the form ``salt$hex_digest`` suitable for storage.
    """
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 200_000
    ).hex()
    return f"{salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    """Check a plain-text password against a stored ``salt$digest`` hash.

    Args:
        password: Plain-text password from a login attempt.
        stored: Value previously produced by :func:`hash_password`.

    Returns:
        True if the password matches; False for a bad format or mismatch.
    """
    try:
        salt, digest = stored.split("$", 1)
    except ValueError:
        return False
    check = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 200_000
    ).hex()
    return secrets.compare_digest(check, digest)


def normalize_slug(value: str) -> str:
    """Strip surrounding whitespace and lowercase a public site slug."""
    return value.strip().lower()


def validate_slug(value: str) -> str:
    """Normalize and validate a public slug, or raise HTTP 400.

    Args:
        value: Raw slug from the client.

    Returns:
        The normalized slug if it matches the allowed pattern.
    """
    slug = normalize_slug(value)
    if not SLUG_RE.fullmatch(slug):
        raise HTTPException(
            status_code=400,
            detail="Slug must be 3–32 chars: lowercase letters, numbers, hyphens",
        )
    return slug


def validate_email(value: str) -> str:
    """Normalize and validate an email address, or raise HTTP 400.

    Args:
        value: Raw email from the client.

    Returns:
        The stripped, lowercased email if it looks valid.
    """
    email = value.strip().lower()
    if not EMAIL_RE.fullmatch(email):
        raise HTTPException(status_code=400, detail="Enter a valid email")
    return email


def blank_portfolio(email: str = "", name: str = "") -> dict:
    """Build a starter portfolio from the empty template.

    Prefills profile email and, when a name is given, hero name lines and
    sigil initials.

    Args:
        email: Owner email to store under ``profile.email``.
        name: Display name used for profile and hero defaults.

    Returns:
        A deep copy of :data:`EMPTY_PORTFOLIO` with optional personalization.
    """
    data = deepcopy(EMPTY_PORTFOLIO)
    data["profile"]["email"] = email
    if name:
        data["profile"]["name"] = name
        parts = name.split()
        data["hero"]["nameLines"] = parts[:-1] or [name]
        data["hero"]["accent"] = parts[-1] if len(parts) > 1 else name
        data["hero"]["sigilLeft"] = parts[0][0].upper() if parts else "Y"
        data["hero"]["sigilRight"] = parts[-1][0].upper() if parts else "N"
    return data


def set_session_cookie(response: Response, token: str) -> None:
    """Attach an HttpOnly session cookie to the response.

    Args:
        response: FastAPI/Starlette response that will be sent to the client.
        token: Opaque session token stored in the database.
    """
    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=SESSION_DAYS * 24 * 60 * 60,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    """Remove the session cookie from the client.

    Args:
        response: FastAPI/Starlette response that will be sent to the client.
    """
    response.delete_cookie(SESSION_COOKIE, path="/")


def create_session(user_id: int, response: Response) -> str:
    """Create a DB session, set the cookie, and return the new token.

    Args:
        user_id: Authenticated user's primary key.
        response: Response used to set the session cookie.

    Returns:
        The newly generated session token.
    """
    token = secrets.token_urlsafe(32)
    expires = utcnow() + timedelta(days=SESSION_DAYS)
    db.create_session(token, user_id, expires.isoformat())
    set_session_cookie(response, token)
    return token


def current_user(
    request: Request,
    session: str | None = Cookie(default=None, alias="portfolio_session"),
) -> dict:
    """Resolve the signed-in user from the session cookie (FastAPI dependency).

    Args:
        request: Incoming request (used as a cookie fallback).
        session: Value of the ``portfolio_session`` cookie, if present.

    Returns:
        A user row as a plain dict (``id``, ``email``, ``password_hash``, …).

    Raises:
        HTTPException: 401 if there is no valid, unexpired session.
    """
    token = session or request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Not signed in")
    row = db.get_session(token)
    if not row:
        raise HTTPException(status_code=401, detail="Not signed in")
    expires = datetime.fromisoformat(row["expires_at"])
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < utcnow():
        db.delete_session(token)
        raise HTTPException(status_code=401, detail="Session expired")
    user = db.get_user_by_id(row["user_id"])
    if not user:
        raise HTTPException(status_code=401, detail="Not signed in")
    return dict(user)


def optional_user(
    request: Request,
    session: str | None = Cookie(default=None, alias="portfolio_session"),
) -> dict | None:
    """Like :func:`current_user`, but return None when not signed in.

    Args:
        request: Incoming request.
        session: Value of the ``portfolio_session`` cookie, if present.

    Returns:
        The user dict, or None if there is no valid session.
    """
    try:
        return current_user(request, session)
    except HTTPException:
        return None
