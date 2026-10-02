"""SQLite persistence for users, sites, sessions, and contact messages."""

import json
import sqlite3
from contextlib import contextmanager
from copy import deepcopy
from datetime import datetime, timedelta, timezone

from app.config import CODE_MAX_ATTEMPTS, CODE_MINUTES, CODE_RESEND_SECONDS, DB_PATH
from app.portfolio_default import DEMO_PORTFOLIO, EMPTY_PORTFOLIO


def init_db() -> None:
    """Create tables if missing and migrate older ``messages`` schemas."""
    DB_PATH.parent.mkdir(exist_ok=True)
    with connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS sites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                slug TEXT NOT NULL UNIQUE,
                theme TEXT NOT NULL DEFAULT 'night',
                published INTEGER NOT NULL DEFAULT 0,
                portfolio_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                expires_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                site_id INTEGER,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (site_id) REFERENCES sites(id)
            );

            CREATE TABLE IF NOT EXISTS email_codes (
                email TEXT PRIMARY KEY,
                code_hash TEXT NOT NULL,
                sent_at TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0
            );
            """
        )
        cols = {row[1] for row in conn.execute("PRAGMA table_info(messages)").fetchall()}
        if "site_id" not in cols:
            conn.execute("ALTER TABLE messages ADD COLUMN site_id INTEGER")


@contextmanager
def connect():
    """Yield a SQLite connection with row factory and foreign keys enabled.

    Commits on clean exit and always closes the connection.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def _now() -> str:
    """Return the current UTC time as an ISO-8601 string."""
    return datetime.now(timezone.utc).isoformat()


def create_user(email: str, password_hash: str) -> int:
    """Insert a user and return the new row id.

    Args:
        email: Unique account email (already normalized by the caller).
        password_hash: Output of :func:`app.auth.hash_password`.

    Returns:
        The inserted user's ``id``.
    """
    with connect() as conn:
        cursor = conn.execute(
            "INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)",
            (email, password_hash, _now()),
        )
        return cursor.lastrowid


def get_user_by_email(email: str) -> sqlite3.Row | None:
    """Fetch a user by email, or None if not found.

    Args:
        email: Exact email stored in the database.
    """
    with connect() as conn:
        return conn.execute(
            "SELECT id, email, password_hash, created_at FROM users WHERE email = ?",
            (email,),
        ).fetchone()


def get_user_by_id(user_id: int) -> sqlite3.Row | None:
    """Fetch a user by primary key, or None if not found.

    Args:
        user_id: Users table id.
    """
    with connect() as conn:
        return conn.execute(
            "SELECT id, email, password_hash, created_at FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()


def create_site(
    user_id: int,
    slug: str,
    portfolio: dict | None = None,
    *,
    theme: str = "night",
    published: bool = False,
) -> int:
    """Create a portfolio site for a user and return its id.

    Args:
        user_id: Owner's user id (one site per user).
        slug: Unique public URL slug.
        portfolio: Portfolio JSON; defaults to a copy of :data:`EMPTY_PORTFOLIO`.
        theme: Visual theme key (e.g. ``night`` or ``ice``).
        published: Whether the site is publicly visible.

    Returns:
        The inserted site's ``id``.
    """
    payload = json.dumps(portfolio if portfolio is not None else deepcopy(EMPTY_PORTFOLIO))
    with connect() as conn:
        cursor = conn.execute(
            """
            INSERT INTO sites (user_id, slug, theme, published, portfolio_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (user_id, slug, theme, 1 if published else 0, payload, _now()),
        )
        return cursor.lastrowid


def get_site_by_user(user_id: int) -> sqlite3.Row | None:
    """Return the site owned by ``user_id``, or None.

    Args:
        user_id: Owner's user id.
    """
    with connect() as conn:
        return conn.execute(
            """
            SELECT id, user_id, slug, theme, published, portfolio_json, created_at
            FROM sites WHERE user_id = ?
            """,
            (user_id,),
        ).fetchone()


def get_site_by_slug(slug: str) -> sqlite3.Row | None:
    """Return the site with the given public slug, or None.

    Args:
        slug: Exact slug to look up (callers usually lowercased it).
    """
    with connect() as conn:
        return conn.execute(
            """
            SELECT id, user_id, slug, theme, published, portfolio_json, created_at
            FROM sites WHERE slug = ?
            """,
            (slug,),
        ).fetchone()


def slug_taken(slug: str) -> bool:
    """Return True if a site already uses this slug.

    Args:
        slug: Candidate public slug.
    """
    return get_site_by_slug(slug) is not None


def update_site_portfolio(site_id: int, portfolio: dict) -> None:
    """Replace the stored portfolio JSON for a site.

    Args:
        site_id: Sites table id.
        portfolio: Full portfolio object to serialize and store.
    """
    with connect() as conn:
        conn.execute(
            "UPDATE sites SET portfolio_json = ? WHERE id = ?",
            (json.dumps(portfolio), site_id),
        )


def update_site_settings(
    site_id: int, *, theme: str | None = None, published: bool | None = None
) -> None:
    """Update theme and/or published flag; omitted fields are left unchanged.

    Args:
        site_id: Sites table id.
        theme: New theme name, or None to skip.
        published: New publish state, or None to skip.
    """
    with connect() as conn:
        if theme is not None:
            conn.execute("UPDATE sites SET theme = ? WHERE id = ?", (theme, site_id))
        if published is not None:
            conn.execute(
                "UPDATE sites SET published = ? WHERE id = ?",
                (1 if published else 0, site_id),
            )


def create_session(token: str, user_id: int, expires_at: str) -> None:
    """Persist a login session.

    Args:
        token: Opaque session token (also sent as a cookie).
        user_id: Authenticated user id.
        expires_at: ISO-8601 expiry timestamp.
    """
    with connect() as conn:
        conn.execute(
            "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
            (token, user_id, expires_at),
        )


def get_session(token: str) -> sqlite3.Row | None:
    """Look up a session by token, or return None.

    Args:
        token: Session cookie value.
    """
    with connect() as conn:
        return conn.execute(
            "SELECT token, user_id, expires_at FROM sessions WHERE token = ?",
            (token,),
        ).fetchone()


def delete_session(token: str) -> None:
    """Delete a single session (logout).

    Args:
        token: Session cookie value to invalidate.
    """
    with connect() as conn:
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))


def delete_user_sessions(user_id: int) -> None:
    """Delete every session for a user (force sign-out everywhere).

    Args:
        user_id: User whose sessions should be removed.
    """
    with connect() as conn:
        conn.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))


def update_password(user_id: int, password_hash: str) -> None:
    """Replace a user's password hash.

    Args:
        user_id: Users table id.
        password_hash: Output of :func:`app.auth.hash_password`.
    """
    with connect() as conn:
        conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (password_hash, user_id))


def save_email_code(email: str, code_hash: str) -> bool:
    """Store a fresh verification code for ``email``, replacing any older one.

    Args:
        email: Normalized email the code was sent to.
        code_hash: SHA-256 hex digest of the code.

    Returns:
        False (and stores nothing) if a code was sent less than
        ``CODE_RESEND_SECONDS`` ago, else True.
    """
    now = datetime.now(timezone.utc)
    with connect() as conn:
        row = conn.execute("SELECT sent_at FROM email_codes WHERE email = ?", (email,)).fetchone()
        if row and now - datetime.fromisoformat(row["sent_at"]) < timedelta(seconds=CODE_RESEND_SECONDS):
            return False
        conn.execute(
            """
            INSERT OR REPLACE INTO email_codes (email, code_hash, sent_at, expires_at, attempts)
            VALUES (?, ?, ?, ?, 0)
            """,
            (email, code_hash, now.isoformat(), (now + timedelta(minutes=CODE_MINUTES)).isoformat()),
        )
        return True


def use_email_code(email: str, code_hash: str) -> bool:
    """Check a code for ``email`` and consume it on success.

    Args:
        email: Normalized email the code was sent to.
        code_hash: SHA-256 hex digest of the submitted code.

    Returns:
        True if the code matched and had not expired or run out of attempts.
    """
    with connect() as conn:
        row = conn.execute("SELECT * FROM email_codes WHERE email = ?", (email,)).fetchone()
        if (
            not row
            or row["attempts"] >= CODE_MAX_ATTEMPTS
            or datetime.fromisoformat(row["expires_at"]) < datetime.now(timezone.utc)
        ):
            return False
        if row["code_hash"] != code_hash:
            conn.execute("UPDATE email_codes SET attempts = attempts + 1 WHERE email = ?", (email,))
            return False
        conn.execute("DELETE FROM email_codes WHERE email = ?", (email,))
        return True


def save_message(
    name: str, email: str, message: str, site_id: int | None = None
) -> int:
    """Store a contact-form message and return its id.

    Args:
        name: Sender name.
        email: Sender email.
        message: Message body.
        site_id: Optional site that received the message.

    Returns:
        The inserted message's ``id``.
    """
    with connect() as conn:
        cursor = conn.execute(
            """
            INSERT INTO messages (site_id, name, email, message, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (site_id, name, email, message, _now()),
        )
        return cursor.lastrowid


def list_messages(site_id: int | None = None) -> list[dict]:
    """List contact messages, newest first.

    Args:
        site_id: If set, only messages for that site; otherwise all messages.

    Returns:
        A list of message dicts.
    """
    with connect() as conn:
        if site_id is None:
            rows = conn.execute(
                """
                SELECT id, site_id, name, email, message, created_at
                FROM messages ORDER BY id DESC
                """
            ).fetchall()
        else:
            rows = conn.execute(
                """
                SELECT id, site_id, name, email, message, created_at
                FROM messages WHERE site_id = ? ORDER BY id DESC
                """,
                (site_id,),
            ).fetchall()
    return [dict(row) for row in rows]


def list_users_with_sites() -> list[dict]:
    """List all users with their site summary (for the admin panel).

    Returns:
        Newest users first. Each item includes nested ``site`` when present.
    """
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT
                u.id AS user_id,
                u.email,
                u.created_at AS user_created_at,
                s.id AS site_id,
                s.slug,
                s.theme,
                s.published,
                s.created_at AS site_created_at,
                json_extract(s.portfolio_json, '$.profile.name') AS profile_name
            FROM users u
            LEFT JOIN sites s ON s.user_id = u.id
            ORDER BY u.id DESC
            """
        ).fetchall()

    result = []
    for row in rows:
        item = {
            "id": row["user_id"],
            "email": row["email"],
            "created_at": row["user_created_at"],
            "site": None,
        }
        if row["site_id"] is not None:
            item["site"] = {
                "id": row["site_id"],
                "slug": row["slug"],
                "theme": row["theme"],
                "published": bool(row["published"]),
                "created_at": row["site_created_at"],
                "profile_name": row["profile_name"] or "",
            }
        result.append(item)
    return result


def seed_demo_if_empty() -> None:
    """Create the demo Mahi account once, when no users exist yet."""
    from app.auth import hash_password

    with connect() as conn:
        count = conn.execute("SELECT COUNT(*) AS n FROM users").fetchone()["n"]
        if count:
            return

    user_id = create_user("mahi@demo.local", hash_password("mahi1234"))
    create_site(
        user_id,
        "mahi",
        DEMO_PORTFOLIO,
        theme="night",
        published=True,
    )
