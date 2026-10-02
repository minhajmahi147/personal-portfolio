"""Pydantic request bodies and field validators for the API."""

import re
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
SLUG = re.compile(r"^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$")
CODE = r"^\d{6}$"


class ContactIn(BaseModel):
    """Payload posted by the contact form. ``website`` is a honeypot."""

    name: str = Field(min_length=2, max_length=80)
    email: str = Field(max_length=120)
    message: str = Field(min_length=10, max_length=2000)
    website: str = ""

    @field_validator("name", "message")
    @classmethod
    def strip_text(cls, value: str) -> str:
        """Collapse whitespace and reject empty values after stripping."""
        cleaned = " ".join(value.split())
        if not cleaned:
            raise ValueError("This field is required")
        return cleaned

    @field_validator("email")
    @classmethod
    def email_ok(cls, value: str) -> str:
        """Require a simple valid email shape."""
        cleaned = value.strip()
        if not EMAIL.fullmatch(cleaned):
            raise ValueError("Enter a valid email")
        return cleaned


class RegisterIn(BaseModel):
    """Registration body: credentials, public slug, and optional name."""

    email: str = Field(max_length=120)
    password: str = Field(min_length=8, max_length=128)
    slug: str = Field(min_length=3, max_length=32)
    name: str = Field(default="", max_length=80)
    code: str = Field(pattern=CODE)

    @field_validator("email")
    @classmethod
    def email_ok(cls, value: str) -> str:
        """Normalize and validate the registration email."""
        cleaned = value.strip().lower()
        if not EMAIL.fullmatch(cleaned):
            raise ValueError("Enter a valid email")
        return cleaned

    @field_validator("slug")
    @classmethod
    def slug_ok(cls, value: str) -> str:
        """Normalize and validate the public URL slug."""
        cleaned = value.strip().lower()
        if not SLUG.fullmatch(cleaned):
            raise ValueError("Slug: 3–32 chars, lowercase, numbers, hyphens")
        return cleaned

    @field_validator("name")
    @classmethod
    def name_ok(cls, value: str) -> str:
        """Collapse internal whitespace in the display name."""
        return " ".join(value.split())


class LoginIn(BaseModel):
    """Login body with email and password."""

    email: str = Field(max_length=120)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def email_ok(cls, value: str) -> str:
        """Strip and lowercase the login email."""
        return value.strip().lower()


class SendCodeIn(BaseModel):
    """Request a verification code for sign-up or password reset."""

    email: str = Field(max_length=120)
    purpose: Literal["register", "reset"]

    @field_validator("email")
    @classmethod
    def email_ok(cls, value: str) -> str:
        """Normalize and validate the email."""
        cleaned = value.strip().lower()
        if not EMAIL.fullmatch(cleaned):
            raise ValueError("Enter a valid email")
        return cleaned


class ResetPasswordIn(BaseModel):
    """Set a new password using an emailed code."""

    email: str = Field(max_length=120)
    code: str = Field(pattern=CODE)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def email_ok(cls, value: str) -> str:
        """Strip and lowercase the email."""
        return value.strip().lower()


class PortfolioIn(BaseModel):
    """Body for saving the owner's full portfolio document."""

    portfolio: dict[str, Any]


class SiteSettingsIn(BaseModel):
    """Partial update for theme and/or published flag."""

    theme: str | None = None
    published: bool | None = None

    @field_validator("theme")
    @classmethod
    def theme_ok(cls, value: str | None) -> str | None:
        """Allow only known theme keys when a theme is provided."""
        if value is None:
            return value
        if value not in {"night", "ice", "green", "orange", "blue"}:
            raise ValueError("Theme must be night, ice, green, orange or blue")
        return value
