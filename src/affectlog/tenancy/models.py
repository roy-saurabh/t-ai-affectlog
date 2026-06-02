"""
SQLAlchemy ORM models for the multi-tenant layer.

These models are only active in managed/enterprise deployments
(AFFECTLOG_EDITION=managed). Community Edition uses single-tenant mode
and does not create these tables by default (they are safe to migrate
in any mode for forward compatibility).
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from affectlog.db.base import Base


# ── Tenant ──────────────────────────────────────────────────────────────────
class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    plan: Mapped[str] = mapped_column(String(40), default="managed_cloud", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    suspended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    suspended_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    settings: Mapped[TenantSettings | None] = relationship("TenantSettings", back_populates="tenant", uselist=False)
    domains: Mapped[list[TenantDomain]] = relationship("TenantDomain", back_populates="tenant", cascade="all, delete-orphan")
    memberships: Mapped[list[TenantMembership]] = relationship("TenantMembership", back_populates="tenant", cascade="all, delete-orphan")
    invitations: Mapped[list[TenantInvitation]] = relationship("TenantInvitation", back_populates="tenant", cascade="all, delete-orphan")
    feature_flags: Mapped[list[TenantFeatureFlag]] = relationship("TenantFeatureFlag", back_populates="tenant", cascade="all, delete-orphan")
    quota: Mapped[TenantQuota | None] = relationship("TenantQuota", back_populates="tenant", uselist=False)
    audit_logs: Mapped[list[TenantAuditLog]] = relationship("TenantAuditLog", back_populates="tenant", cascade="all, delete-orphan")
    support_grants: Mapped[list[SupportAccessGrant]] = relationship("SupportAccessGrant", back_populates="tenant", cascade="all, delete-orphan")
    smtp_settings: Mapped[TenantSmtpSettings | None] = relationship("TenantSmtpSettings", back_populates="tenant", uselist=False)
    storage_policy: Mapped[TenantStoragePolicy | None] = relationship("TenantStoragePolicy", back_populates="tenant", uselist=False)


# ── TenantSettings ───────────────────────────────────────────────────────────
class TenantSettings(Base):
    __tablename__ = "tenant_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), unique=True)
    allow_public_registration: Mapped[bool] = mapped_column(Boolean, default=False)
    require_mfa: Mapped[bool] = mapped_column(Boolean, default=False)
    session_timeout_minutes: Mapped[int] = mapped_column(Integer, default=480)
    max_dataset_size_mb: Mapped[int] = mapped_column(Integer, default=500)
    extra: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    tenant: Mapped[Tenant] = relationship("Tenant", back_populates="settings")


# ── TenantDomain ─────────────────────────────────────────────────────────────
class TenantDomain(Base):
    """Allowed email domains for self-registration within this tenant."""
    __tablename__ = "tenant_domains"
    __table_args__ = (UniqueConstraint("tenant_id", "domain"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    domain: Mapped[str] = mapped_column(String(200), nullable=False)

    tenant: Mapped[Tenant] = relationship("Tenant", back_populates="domains")


# ── TenantMembership ──────────────────────────────────────────────────────────
class TenantMembership(Base):
    """Associates a user with a tenant and their role within it."""
    __tablename__ = "tenant_memberships"
    __table_args__ = (UniqueConstraint("tenant_id", "user_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    tenant_role: Mapped[str] = mapped_column(String(60), nullable=False, default="researcher")
    joined_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    tenant: Mapped[Tenant] = relationship("Tenant", back_populates="memberships")


# ── TenantInvitation ──────────────────────────────────────────────────────────
class TenantInvitation(Base):
    __tablename__ = "tenant_invitations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    email: Mapped[str] = mapped_column(String(254), nullable=False, index=True)
    tenant_role: Mapped[str] = mapped_column(String(60), default="researcher")
    token: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    invited_by_user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")

    tenant: Mapped[Tenant] = relationship("Tenant", back_populates="invitations")


# ── TenantFeatureFlag ─────────────────────────────────────────────────────────
class TenantFeatureFlag(Base):
    """Tenant-level feature flag override."""
    __tablename__ = "tenant_feature_flags"
    __table_args__ = (UniqueConstraint("tenant_id", "feature"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    feature: Mapped[str] = mapped_column(String(80), nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False)
    set_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    set_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    tenant: Mapped[Tenant] = relationship("Tenant", back_populates="feature_flags")


# ── TenantQuota ───────────────────────────────────────────────────────────────
class TenantQuota(Base):
    __tablename__ = "tenant_quotas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), unique=True)
    max_audit_runs_per_month: Mapped[int] = mapped_column(Integer, default=100)
    max_rows_per_run: Mapped[BigInteger] = mapped_column(BigInteger, default=5_000_000)
    max_storage_gb: Mapped[int] = mapped_column(Integer, default=10)
    max_jobs_per_day: Mapped[int] = mapped_column(Integer, default=200)
    max_api_calls_per_hour: Mapped[int] = mapped_column(Integer, default=1000)
    max_model_explanation_runs: Mapped[int] = mapped_column(Integer, default=50)
    max_export_artifacts: Mapped[int] = mapped_column(Integer, default=500)

    tenant: Mapped[Tenant] = relationship("Tenant", back_populates="quota")


# ── UsageRecord ───────────────────────────────────────────────────────────────
class UsageRecord(Base):
    __tablename__ = "usage_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    period_month: Mapped[str] = mapped_column(String(7), nullable=False)  # YYYY-MM
    audit_runs: Mapped[int] = mapped_column(Integer, default=0)
    rows_processed: Mapped[BigInteger] = mapped_column(BigInteger, default=0)
    storage_bytes_used: Mapped[BigInteger] = mapped_column(BigInteger, default=0)
    jobs_run: Mapped[int] = mapped_column(Integer, default=0)
    model_explanation_runs: Mapped[int] = mapped_column(Integer, default=0)
    exports_generated: Mapped[int] = mapped_column(Integer, default=0)
    api_calls: Mapped[BigInteger] = mapped_column(BigInteger, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    __table_args__ = (UniqueConstraint("tenant_id", "period_month"),)


# ── SupportAccessGrant ────────────────────────────────────────────────────────
class SupportAccessGrant(Base):
    """
    Time-limited support access grant.
    Tenant owner approves; all actions by support staff are audited.
    Raw dataset access is disabled by default.
    """
    __tablename__ = "support_access_grants"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    granted_by_user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    support_user_email: Mapped[str] = mapped_column(String(254), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    scope: Mapped[str] = mapped_column(Text, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    raw_data_access: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    revoked_by_user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")

    tenant: Mapped[Tenant] = relationship("Tenant", back_populates="support_grants")


# ── TenantAuditLog ─────────────────────────────────────────────────────────────
class TenantAuditLog(Base):
    __tablename__ = "tenant_audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    actor_email: Mapped[str | None] = mapped_column(String(254), nullable=True)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    resource_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    resource_id: Mapped[str | None] = mapped_column(String(200), nullable=True)
    detail: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), index=True)
    ip_address: Mapped[str | None] = mapped_column(String(50), nullable=True)

    tenant: Mapped[Tenant] = relationship("Tenant", back_populates="audit_logs")


# ── TenantSmtpSettings ─────────────────────────────────────────────────────────
class TenantSmtpSettings(Base):
    __tablename__ = "tenant_smtp_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), unique=True)
    host: Mapped[str] = mapped_column(String(200), nullable=False)
    port: Mapped[int] = mapped_column(Integer, default=587)
    username: Mapped[str] = mapped_column(String(254), nullable=False)
    encrypted_password: Mapped[str] = mapped_column(Text, nullable=False)
    use_tls: Mapped[bool] = mapped_column(Boolean, default=True)
    from_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    from_email: Mapped[str] = mapped_column(String(254), nullable=False)

    tenant: Mapped[Tenant] = relationship("Tenant", back_populates="smtp_settings")


# ── TenantStoragePolicy ────────────────────────────────────────────────────────
class TenantStoragePolicy(Base):
    __tablename__ = "tenant_storage_policies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), unique=True)
    storage_backend: Mapped[str] = mapped_column(String(20), default="local")
    s3_bucket: Mapped[str | None] = mapped_column(String(200), nullable=True)
    s3_prefix: Mapped[str | None] = mapped_column(String(200), nullable=True)
    artifact_retention_days: Mapped[int] = mapped_column(Integer, default=90)
    audit_log_retention_days: Mapped[int] = mapped_column(Integer, default=365)

    tenant: Mapped[Tenant] = relationship("Tenant", back_populates="storage_policy")


# ── ManagedAccessRequest ───────────────────────────────────────────────────────
class ManagedAccessRequest(Base):
    """
    Lead record created when someone submits the public 'Request Managed Access' form.
    Platform admin reviews before creating a Tenant.
    """
    __tablename__ = "managed_access_requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False, index=True)
    organization: Mapped[str] = mapped_column(String(300), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    sector: Mapped[str] = mapped_column(String(100), nullable=False)
    intended_use: Mapped[str] = mapped_column(Text, nullable=False)
    expected_volume: Mapped[str | None] = mapped_column(String(200), nullable=True)
    deployment_pref: Mapped[str] = mapped_column(String(50), default="managed_cloud")
    compliance_needs: Mapped[str | None] = mapped_column(Text, nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    reviewed_by: Mapped[str | None] = mapped_column(String(200), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
