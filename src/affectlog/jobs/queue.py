"""Simple in-process job queue (replace with Celery/Redis for production)."""

from __future__ import annotations

import asyncio
import logging
from typing import Any, Callable

logger = logging.getLogger(__name__)

_queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue()


async def enqueue(task_name: str, payload: dict[str, Any]) -> None:
    await _queue.put({"task": task_name, "payload": payload})
    logger.info("Enqueued task: %s", task_name)
