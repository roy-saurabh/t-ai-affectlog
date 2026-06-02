"""Central configuration using pydantic-settings."""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="AFFECTLOG_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Server ────────────────────────────────────────────────────────────
    app_env: Literal["development", "production", "test"] = "development"
    app_base_url: str = "http://localhost:3000"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_workers: int = 4

    # ── Database ──────────────────────────────────────────────────────────
    database_url: str = "sqlite+aiosqlite:///./affectlog_dev.db"
    db_echo: bool = False

    # ── Redis / Queue ──────────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/1"

    # ── Storage ────────────────────────────────────────────────────────────
    data_dir: Path = Path("data")
    runs_dir: Path = Path("runs")
    models_dir: Path = Path("models")
    uploads_dir: Path = Path("data/uploads")
    chunk_size: int = 100_000
    max_upload_bytes: int = 2 * 1024 * 1024 * 1024  # 2 GB

    # ── Auth / Security ────────────────────────────────────────────────────
    secret_key: str = Field(default="", repr=False)
    password_pepper: str = Field(default="", repr=False)
    session_ttl_seconds: int = 86400 * 7  # 7 days
    activation_token_ttl_seconds: int = 86400  # 24 h
    password_reset_token_ttl_seconds: int = 1800  # 30 min
    cookie_secure: bool = False
    cookie_samesite: Literal["lax", "strict", "none"] = "lax"
    cookie_httponly: bool = True
    csrf_secret: str = Field(default="", repr=False)
    rate_limit_login: str = "10/minute"
    rate_limit_register: str = "5/minute"
    rate_limit_activate: str = "20/minute"
    rate_limit_password_reset: str = "5/minute"
    max_failed_logins: int = 10
    lockout_seconds: int = 900  # 15 min
    cors_allowed_origins: list[str] = ["http://localhost:3000"]

    # ── SMTP / Email ────────────────────────────────────────────────────────
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = Field(default="", repr=False)
    smtp_from_email: str = "noreply@affectlog.example.org"
    smtp_from_name: str = "AffectLog Trustworthy AI"
    # smtp_use_ssl=True → port 465 implicit SSL; smtp_use_tls=True → port 587 STARTTLS.
    smtp_use_ssl: bool = False
    smtp_use_tls: bool = True
    support_email: str = "support@affectlog.com"
    email_send_enabled: bool = False
    dev_show_activation_link: bool = True

    # ── reCAPTCHA v3 ────────────────────────────────────────────────────────
    recaptcha_enabled: bool = False
    recaptcha_site_key: str = ""
    recaptcha_secret_key: str = Field(default="", repr=False)
    recaptcha_contact_action: str = "contact"
    recaptcha_min_score: float = 0.5
    recaptcha_allowed_hostnames: str = "localhost,127.0.0.1"

    # ── Registration / Approval ────────────────────────────────────────────
    public_registration_enabled: bool = True
    admin_approval_required: bool = True
    raw_exports_enabled: bool = False

    # ── Logging ────────────────────────────────────────────────────────────
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    log_format: Literal["text", "json"] = "json"

    # ── Privacy ───────────────────────────────────────────────────────────
    hash_secret: str = Field(default="", repr=False)
    allow_raw_identifiers: bool = False
    pseudonymize: bool = True

    # ── PDC ───────────────────────────────────────────────────────────────
    pdc_url: str = ""
    pdc_token: str = Field(default="", repr=False)

    @field_validator("hash_secret", mode="before")
    @classmethod
    def warn_empty_hash_secret(cls, v: str) -> str:
        if not v:
            import warnings
            warnings.warn(
                "AFFECTLOG_HASH_SECRET is not set — using empty string. "
                "Set a strong secret in production.",
                UserWarning,
                stacklevel=2,
            )
        return v

    @field_validator("secret_key", mode="before")
    @classmethod
    def warn_empty_secret_key(cls, v: str) -> str:
        if not v:
            import warnings
            warnings.warn(
                "AFFECTLOG_SECRET_KEY is not set — sessions are insecure. "
                "Set a strong random secret in production.",
                UserWarning,
                stacklevel=2,
            )
        return v or "dev-insecure-secret-change-me"

    @property
    def raw_dir(self) -> Path:
        return self.data_dir / "raw"

    @property
    def samples_dir(self) -> Path:
        return self.data_dir / "samples"

    @property
    def processed_dir(self) -> Path:
        return self.data_dir / "processed"

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
