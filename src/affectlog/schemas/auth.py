"""Pydantic v2 schemas for auth endpoints."""
from __future__ import annotations

from typing import Any
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    organization: str | None = Field(None, max_length=200)
    role_description: str | None = Field(None, max_length=200)
    requested_access_profile: str | None = Field(None, max_length=100)
    reason_for_access: str | None = Field(None, max_length=2000)
    agreed_to_coc: bool
    agreed_to_data_governance: bool

    @field_validator("agreed_to_coc", "agreed_to_data_governance")
    @classmethod
    def must_agree(cls, v: bool) -> bool:
        if not v:
            raise ValueError("You must agree to the code of conduct and data governance policy.")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)
    mfa_code: str | None = Field(None, min_length=6, max_length=8)


class ActivateRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=12)
    confirm_password: str

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info: Any) -> str:
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match.")
        return v


class PasswordResetRequestIn(BaseModel):
    email: EmailStr


class PasswordResetConfirmIn(BaseModel):
    token: str
    new_password: str = Field(..., min_length=12)
    confirm_password: str

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info: Any) -> str:
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match.")
        return v


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=12)
    confirm_password: str

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info: Any) -> str:
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match.")
        return v


class UserOut(BaseModel):
    id: UUID
    email: str
    full_name: str
    organization: str | None
    is_active: bool
    is_superadmin: bool
    must_change_password: bool
    mfa_enabled: bool
    roles: list[str] = []
    permissions: set[str] = set()

    model_config = {"from_attributes": True}


class MeResponse(BaseModel):
    user: UserOut
    workspaces: list[str] = []
