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

    # Server
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_workers: int = 4

    # Storage
    data_dir: Path = Path("data")
    runs_dir: Path = Path("runs")
    models_dir: Path = Path("models")
    chunk_size: int = 100_000

    # Logging
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    log_format: Literal["text", "json"] = "json"

    # Privacy
    hash_secret: str = Field(default="", repr=False)
    allow_raw_identifiers: bool = False
    pseudonymize: bool = True

    # PDC
    pdc_url: str = ""
    pdc_token: str = Field(default="", repr=False)

    @field_validator("hash_secret", mode="before")
    @classmethod
    def warn_empty_secret(cls, v: str) -> str:
        if not v:
            import warnings

            warnings.warn(
                "AFFECTLOG_HASH_SECRET is not set — using empty string. "
                "Set a strong secret in production.",
                UserWarning,
                stacklevel=2,
            )
        return v

    @property
    def raw_dir(self) -> Path:
        return self.data_dir / "raw"

    @property
    def samples_dir(self) -> Path:
        return self.data_dir / "samples"

    @property
    def processed_dir(self) -> Path:
        return self.data_dir / "processed"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
