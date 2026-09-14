import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone

from app.config import DB_PATH


def init_db() -> None:
    """Create the messages table if it does not exist yet."""
    DB_PATH.parent.mkdir(exist_ok=True)
    with connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )


@contextmanager
def connect():
    """Open a SQLite connection and commit when the block finishes."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def save_message(name: str, email: str, message: str) -> int:
    """Store one contact submission and return its id."""
    created_at = datetime.now(timezone.utc).isoformat()
    with connect() as conn:
        cursor = conn.execute(
            "INSERT INTO messages (name, email, message, created_at) VALUES (?, ?, ?, ?)",
            (name, email, message, created_at),
        )
        return cursor.lastrowid


def list_messages() -> list[dict]:
    """Return saved contact submissions, newest first."""
    with connect() as conn:
        rows = conn.execute(
            "SELECT id, name, email, message, created_at FROM messages ORDER BY id DESC"
        ).fetchall()
    return [dict(row) for row in rows]
