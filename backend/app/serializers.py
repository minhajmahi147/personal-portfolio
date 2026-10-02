"""Map database rows to API response payloads."""

import json
import sqlite3
from copy import deepcopy

from app.portfolio_default import EMPTY_PORTFOLIO


def parse_portfolio(row: sqlite3.Row) -> dict:
    """Deserialize ``portfolio_json`` from a site row.

    Args:
        row: Site row containing ``portfolio_json``.

    Returns:
        Parsed portfolio dict, or a copy of :data:`EMPTY_PORTFOLIO` if invalid.
    """
    try:
        return json.loads(row["portfolio_json"])
    except (TypeError, json.JSONDecodeError):
        return deepcopy(EMPTY_PORTFOLIO)


def site_public_dict(row: sqlite3.Row) -> dict:
    """Build the public site payload (slug, theme, published, portfolio).

    Args:
        row: Site row from the database.
    """
    return {
        "slug": row["slug"],
        "theme": row["theme"],
        "published": bool(row["published"]),
        "portfolio": parse_portfolio(row),
    }
