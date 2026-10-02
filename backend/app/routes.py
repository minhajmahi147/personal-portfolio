"""HTTP API routes for auth, dashboard editing, and public sites."""

import hashlib
import logging
import secrets
import smtplib
from email.message import EmailMessage

from fastapi import APIRouter, Depends, HTTPException, Request, Response

from app import db
from app.auth import (
    blank_portfolio,
    clear_session_cookie,
    create_session,
    current_user,
    hash_password,
    optional_user,
    verify_password,
)
from app.config import CODE_MINUTES, CODE_RESEND_SECONDS, SMTP_PASSWORD, SMTP_USER, is_admin_email
from app.schemas import (
    ContactIn,
    LoginIn,
    PortfolioIn,
    RegisterIn,
    ResetPasswordIn,
    SendCodeIn,
    SiteSettingsIn,
)
from app.serializers import parse_portfolio, site_public_dict

router = APIRouter(prefix="/api")
log = logging.getLogger(__name__)


def _hash_code(code: str) -> str:
    """Return the SHA-256 hex digest stored in place of a raw code."""
    return hashlib.sha256(code.encode()).hexdigest()


def _send_code_email(email: str, code: str) -> None:
    """Email ``code`` via Gmail SMTP, or log it when SMTP is not configured.

    Raises:
        HTTPException: 502 if Gmail rejects or cannot be reached.
    """
    if not SMTP_USER:
        log.warning("SMTP not configured; verification code for %s is %s", email, code)
        return
    msg = EmailMessage()
    msg["Subject"] = f"Your verification code: {code}"
    msg["From"] = SMTP_USER
    msg["To"] = email
    msg.set_content(f"Your code is {code}. It expires in {CODE_MINUTES} minutes.")
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=15) as smtp:
            smtp.login(SMTP_USER, SMTP_PASSWORD)
            smtp.send_message(msg)
    except (smtplib.SMTPException, OSError) as exc:
        log.error("Sending code to %s failed: %s", email, exc)
        raise HTTPException(status_code=502, detail="Could not send the email") from exc


def local_only(request: Request) -> None:
    """Reject requests that are not from localhost.

    Args:
        request: Incoming request whose client host is checked.

    Raises:
        HTTPException: 403 if the client is not ``127.0.0.1`` or ``::1``.
    """
    host = request.client.host if request.client else ""
    if host not in {"127.0.0.1", "::1"}:
        raise HTTPException(status_code=403, detail="Local only")


def _user_payload(user: dict, site) -> dict:
    """Shape a user + site summary for auth responses.

    Args:
        user: User dict with at least ``id`` and ``email``.
        site: Site row with ``slug``, ``theme``, and ``published``.

    Returns:
        JSON-ready object with user id, email, and nested site info.
    """
    return {
        "id": user["id"],
        "email": user["email"],
        "is_admin": is_admin_email(user["email"]),
        "site": {
            "slug": site["slug"],
            "theme": site["theme"],
            "published": bool(site["published"]),
        },
    }


@router.get("/health")
def health():
    """Return a simple liveness check for the API process."""
    return {"status": "ok", "service": "portfolio-api"}


@router.post("/auth/send-code")
def send_code(payload: SendCodeIn):
    """Email a 6-digit code for sign-up or password reset.

    Args:
        payload: Target email and ``purpose`` (``register`` or ``reset``).

    Returns:
        ``ok`` once the code is sent.

    Raises:
        HTTPException: 400/404 if the email does not fit the purpose,
            429 if a code was sent less than a minute ago, 502 on mail failure.
    """
    exists = db.get_user_by_email(payload.email) is not None
    if payload.purpose == "register" and exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    if payload.purpose == "reset" and not exists:
        raise HTTPException(status_code=404, detail="No account with that email")
    code = f"{secrets.randbelow(1_000_000):06d}"
    if not db.save_email_code(payload.email, _hash_code(code)):
        raise HTTPException(
            status_code=429,
            detail=f"Wait {CODE_RESEND_SECONDS} seconds before requesting another code",
        )
    _send_code_email(payload.email, code)
    return {"ok": True}


@router.post("/auth/reset-password")
def reset_password(payload: ResetPasswordIn, response: Response):
    """Set a new password with an emailed code, sign out other devices, and sign in.

    Args:
        payload: Email, emailed code, and new password.
        response: Response used to set the session cookie.

    Returns:
        ``ok`` plus the user/site summary.

    Raises:
        HTTPException: 400 if the code is wrong, expired, or the account is gone.
    """
    row = db.get_user_by_email(payload.email)
    if not row or not db.use_email_code(payload.email, _hash_code(payload.code)):
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    db.update_password(row["id"], hash_password(payload.password))
    db.delete_user_sessions(row["id"])
    create_session(row["id"], response)
    return {"ok": True, "user": _user_payload(dict(row), db.get_site_by_user(row["id"]))}


@router.post("/auth/register", status_code=201)
def register(payload: RegisterIn, response: Response):
    """Register a new account, create a draft site, and sign the user in.

    Args:
        payload: Email, password, public slug, emailed code, and optional display name.
        response: Response used to set the session cookie.

    Returns:
        ``ok`` plus the new user/site summary.

    Raises:
        HTTPException: 400 if the email or slug is taken or the code is invalid.
    """
    if db.get_user_by_email(payload.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.slug_taken(payload.slug):
        raise HTTPException(status_code=400, detail="Slug already taken")
    if not db.use_email_code(payload.email, _hash_code(payload.code)):
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    user_id = db.create_user(payload.email, hash_password(payload.password))
    portfolio = blank_portfolio(email=payload.email, name=payload.name)
    db.create_site(user_id, payload.slug, portfolio, published=False)
    create_session(user_id, response)
    user = dict(db.get_user_by_id(user_id))
    site = db.get_site_by_user(user_id)
    return {"ok": True, "user": _user_payload(user, site)}


@router.post("/auth/login")
def login(payload: LoginIn, response: Response):
    """Authenticate with email/password and set a session cookie.

    Args:
        payload: Login credentials.
        response: Response used to set the session cookie.

    Returns:
        ``ok`` plus the user/site summary.

    Raises:
        HTTPException: 401 on bad credentials; 500 if the user has no site.
    """
    row = db.get_user_by_email(payload.email)
    if not row or not verify_password(payload.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    create_session(row["id"], response)
    site = db.get_site_by_user(row["id"])
    if not site:
        raise HTTPException(status_code=500, detail="Site missing for user")
    return {"ok": True, "user": _user_payload(dict(row), site)}


@router.post("/auth/logout")
def logout(
    request: Request,
    response: Response,
    user: dict = Depends(optional_user),
):
    """End the current session and clear the session cookie.

    Args:
        request: Used to read the session cookie.
        response: Used to delete the cookie.
        user: Optional signed-in user (unused; logout is idempotent).

    Returns:
        ``{"ok": true}`` whether or not a session existed.
    """
    token = request.cookies.get("portfolio_session")
    if token:
        db.delete_session(token)
    clear_session_cookie(response)
    return {"ok": True}


@router.get("/auth/me")
def me(user: dict = Depends(current_user)):
    """Return the signed-in user and their site summary.

    Args:
        user: Authenticated user from the session cookie.

    Returns:
        Nested ``user`` object with site slug, theme, and published state.

    Raises:
        HTTPException: 404 if the user has no site row.
    """
    site = db.get_site_by_user(user["id"])
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return {"user": _user_payload(user, site)}


@router.get("/dashboard/portfolio")
def dashboard_portfolio(user: dict = Depends(current_user)):
    """Return the owner's full portfolio for the dashboard editor.

    Args:
        user: Authenticated site owner.

    Returns:
        Slug, theme, published flag, and portfolio JSON.

    Raises:
        HTTPException: 404 if the site is missing.
    """
    site = db.get_site_by_user(user["id"])
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return {
        "slug": site["slug"],
        "theme": site["theme"],
        "published": bool(site["published"]),
        "portfolio": parse_portfolio(site),
    }


@router.put("/dashboard/portfolio")
def save_portfolio(payload: PortfolioIn, user: dict = Depends(current_user)):
    """Replace the signed-in user's stored portfolio content.

    Args:
        payload: Body with a ``portfolio`` object.
        user: Authenticated site owner.

    Returns:
        ``{"ok": true}`` on success.

    Raises:
        HTTPException: 404 if the site is missing.
    """
    site = db.get_site_by_user(user["id"])
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    db.update_site_portfolio(site["id"], payload.portfolio)
    return {"ok": True}


@router.patch("/dashboard/settings")
def save_settings(payload: SiteSettingsIn, user: dict = Depends(current_user)):
    """Update theme and/or published state for the owner's site.

    Args:
        payload: Optional ``theme`` and ``published`` fields.
        user: Authenticated site owner.

    Returns:
        Updated slug, theme, and published flag.

    Raises:
        HTTPException: 404 if the site is missing.
    """
    site = db.get_site_by_user(user["id"])
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    db.update_site_settings(
        site["id"],
        theme=payload.theme,
        published=payload.published,
    )
    refreshed = db.get_site_by_user(user["id"])
    return {
        "ok": True,
        "slug": refreshed["slug"],
        "theme": refreshed["theme"],
        "published": bool(refreshed["published"]),
    }


@router.get("/dashboard/messages")
def dashboard_messages(user: dict = Depends(current_user)):
    """List contact messages sent to the signed-in user's site.

    Args:
        user: Authenticated site owner.

    Returns:
        ``messages`` list for that site.

    Raises:
        HTTPException: 404 if the site is missing.
    """
    site = db.get_site_by_user(user["id"])
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return {"messages": db.list_messages(site["id"])}


@router.get("/sites/{slug}")
def public_site(
    slug: str,
    request: Request,
    user: dict | None = Depends(optional_user),
):
    """Return a public portfolio by slug.

    Draft sites are only visible to their owner when signed in.

    Args:
        slug: Public site slug (matched case-insensitively).
        request: Incoming request (unused beyond dependency wiring).
        user: Optional signed-in user for owner draft access.

    Returns:
        Public site dict with an ``owner`` flag.

    Raises:
        HTTPException: 404 if missing or unpublished for non-owners.
    """
    site = db.get_site_by_slug(slug.lower())
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    is_owner = bool(user and user["id"] == site["user_id"])
    if not site["published"] and not is_owner:
        raise HTTPException(status_code=404, detail="Site not published")
    data = site_public_dict(site)
    data["owner"] = is_owner
    return data


@router.post("/sites/{slug}/contact", status_code=201)
def site_contact(slug: str, payload: ContactIn):
    """Accept a contact form submission for a published site.

    A filled honeypot ``website`` field is treated as spam and ignored.

    Args:
        slug: Public site slug.
        payload: Contact form fields.

    Returns:
        ``ok`` and the new message ``id`` (or just ``ok`` for honeypot hits).

    Raises:
        HTTPException: 404 if the site is missing or unpublished.
    """
    if payload.website.strip():
        return {"ok": True}
    site = db.get_site_by_slug(slug.lower())
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    if not site["published"]:
        raise HTTPException(status_code=404, detail="Site not published")
    message_id = db.save_message(
        payload.name, payload.email, payload.message, site_id=site["id"]
    )
    return {"ok": True, "id": message_id}


@router.post("/contact", status_code=201)
def contact(payload: ContactIn):
    """Legacy contact endpoint — stores against the demo site when possible.

    Args:
        payload: Contact form fields (honeypot ``website`` ignored as spam).

    Returns:
        ``ok`` and the new message ``id``.
    """
    if payload.website.strip():
        return {"ok": True}
    site = db.get_site_by_slug("mahi")
    site_id = site["id"] if site else None
    message_id = db.save_message(
        payload.name, payload.email, payload.message, site_id=site_id
    )
    return {"ok": True, "id": message_id}


@router.get("/messages")
def messages(request: Request):
    """List all contact messages (localhost only).

    Args:
        request: Used to enforce the local-only check.

    Returns:
        All messages across sites, newest first.
    """
    local_only(request)
    return {"messages": db.list_messages()}
