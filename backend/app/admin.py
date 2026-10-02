"""Admin-only API: list users and their sites.

Kept separate from owner dashboard routes in :mod:`app.routes`.
"""

from fastapi import APIRouter, Depends, HTTPException

from app import db
from app.auth import current_user
from app.config import is_admin_email

router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin(user: dict = Depends(current_user)) -> dict:
    """Allow only signed-in users whose email is in ``ADMIN_EMAILS``.

    Args:
        user: Authenticated user from the session cookie.

    Returns:
        The same user dict when authorized.

    Raises:
        HTTPException: 403 if the account is not an admin.
    """
    if not is_admin_email(user["email"]):
        raise HTTPException(status_code=403, detail="Admin only")
    return user


@router.get("/users")
def admin_list_users(_admin: dict = Depends(require_admin)):
    """Return every user and their site summary.

    Args:
        _admin: Authenticated admin (authorization only).

    Returns:
        ``users`` list plus a ``count``.
    """
    users = db.list_users_with_sites()
    return {"users": users, "count": len(users)}
