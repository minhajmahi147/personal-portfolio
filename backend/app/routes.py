from fastapi import APIRouter, HTTPException, Request

from app import db
from app.schemas import ContactIn

router = APIRouter(prefix="/api")


def local_only(request: Request) -> None:
    """Reject the request unless it comes from this machine."""
    host = request.client.host if request.client else ""
    if host not in {"127.0.0.1", "::1"}:
        raise HTTPException(status_code=403, detail="Local only")


@router.get("/health")
def health():
    """Report that the API process is up."""
    return {"status": "ok", "service": "portfolio-api"}


@router.post("/contact", status_code=201)
def contact(payload: ContactIn):
    """Save a contact form submission. Bots that fill the honeypot are ignored."""
    if payload.website.strip():
        return {"ok": True}
    message_id = db.save_message(payload.name, payload.email, payload.message)
    return {"ok": True, "id": message_id}


@router.get("/messages")
def messages(request: Request):
    """List stored contact messages. Localhost only."""
    local_only(request)
    return {"messages": db.list_messages()}
