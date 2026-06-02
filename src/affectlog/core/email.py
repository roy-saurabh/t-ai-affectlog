"""
Email sending via aiosmtplib (async SMTP).

Supports Gmail SMTP with App Passwords, or Mailpit for local dev.
When EMAIL_SEND_ENABLED=false, emails are logged to console.
"""
from __future__ import annotations

import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Any

import aiosmtplib
from jinja2 import Environment, FileSystemLoader, select_autoescape

from affectlog.config import get_settings

logger = logging.getLogger(__name__)

_TEMPLATES_DIR = Path(__file__).parent.parent / "templates" / "email"

_jinja_env: Environment | None = None


def _get_env() -> Environment:
    global _jinja_env
    if _jinja_env is None:
        _jinja_env = Environment(
            loader=FileSystemLoader(str(_TEMPLATES_DIR)),
            autoescape=select_autoescape(["html"]),
        )
    return _jinja_env


def _render(template_name: str, context: dict[str, Any]) -> tuple[str, str]:
    """Return (html_body, plain_body)."""
    env = _get_env()
    html = env.get_template(f"{template_name}.html").render(**context)
    try:
        plain = env.get_template(f"{template_name}.txt").render(**context)
    except Exception:
        plain = ""
    return html, plain


async def send_email(
    *,
    to: str,
    subject: str,
    template: str,
    context: dict[str, Any],
) -> bool:
    """Send templated email. Returns True on success."""
    settings = get_settings()
    html, plain = _render(template, context)

    if not settings.email_send_enabled:
        logger.info(
            "[EMAIL DISABLED] To=%s Subject=%s template=%s", to, subject, template
        )
        if context.get("activation_url"):
            logger.info("DEV activation URL: %s", context["activation_url"])
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    msg["To"] = to

    if plain:
        msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        send_kwargs: dict[str, Any] = {
            "hostname": settings.smtp_host,
            "port": settings.smtp_port,
            "username": settings.smtp_username or None,
            "password": settings.smtp_password or None,
        }
        if settings.smtp_use_ssl:
            # Port 465 — implicit SSL (Gmail default for App Passwords)
            send_kwargs["use_tls"] = True
        else:
            # Port 587 — STARTTLS upgrade
            send_kwargs["start_tls"] = settings.smtp_use_tls
        await aiosmtplib.send(msg, **send_kwargs)
        logger.info("Email sent to %s (template=%s)", to, template)
        return True
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to, exc)
        return False


async def send_registration_received(to: str, full_name: str) -> bool:
    settings = get_settings()
    return await send_email(
        to=to,
        subject="AffectLog: Registration received — awaiting review",
        template="registration_received",
        context={"full_name": full_name, "app_base_url": settings.app_base_url},
    )


async def send_registration_approved(
    to: str,
    full_name: str,
    activation_token: str,
    role: str,
) -> bool:
    settings = get_settings()
    activation_url = f"{settings.app_base_url}/activate?token={activation_token}"
    return await send_email(
        to=to,
        subject="AffectLog: Your access has been approved — activate your account",
        template="registration_approved_activation",
        context={
            "full_name": full_name,
            "email": to,
            "role": role,
            "activation_url": activation_url,
            "app_base_url": settings.app_base_url,
        },
    )


async def send_registration_rejected(to: str, full_name: str, reason: str | None) -> bool:
    settings = get_settings()
    return await send_email(
        to=to,
        subject="AffectLog: Registration outcome",
        template="registration_rejected",
        context={
            "full_name": full_name,
            "reason": reason or "Please contact the platform administrators for more information.",
            "app_base_url": settings.app_base_url,
        },
    )


async def send_password_reset(to: str, full_name: str, reset_token: str) -> bool:
    settings = get_settings()
    reset_url = f"{settings.app_base_url}/reset-password?token={reset_token}"
    return await send_email(
        to=to,
        subject="AffectLog: Password reset request",
        template="password_reset",
        context={
            "full_name": full_name,
            "reset_url": reset_url,
            "app_base_url": settings.app_base_url,
        },
    )


async def send_admin_new_registration(admin_email: str, registrant_name: str, registrant_email: str) -> bool:
    settings = get_settings()
    return await send_email(
        to=admin_email,
        subject="AffectLog Admin: New registration request",
        template="admin_new_registration_notification",
        context={
            "registrant_name": registrant_name,
            "registrant_email": registrant_email,
            "admin_url": f"{settings.app_base_url}/admin/pending-registrations",
            "app_base_url": settings.app_base_url,
        },
    )
