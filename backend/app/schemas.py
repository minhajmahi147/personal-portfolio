import re

from pydantic import BaseModel, Field, field_validator

EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ContactIn(BaseModel):
    """Payload posted by the contact form. `website` is a honeypot."""

    name: str = Field(min_length=2, max_length=80)
    email: str = Field(max_length=120)
    message: str = Field(min_length=10, max_length=2000)
    website: str = ""

    @field_validator("name", "message")
    @classmethod
    def strip_text(cls, value: str) -> str:
        """Collapse whitespace and reject a field that is empty after that."""
        cleaned = " ".join(value.split())
        if not cleaned:
            raise ValueError("This field is required")
        return cleaned

    @field_validator("email")
    @classmethod
    def email_ok(cls, value: str) -> str:
        """Require a normal email address, then return it trimmed."""
        cleaned = value.strip()
        if not EMAIL.fullmatch(cleaned):
            raise ValueError("Enter a valid email")
        return cleaned
