"""Background worker entry point."""

from __future__ import annotations

import logging
import time

from affectlog.logging import configure_logging

logger = logging.getLogger(__name__)


def main() -> None:
    configure_logging("INFO")
    logger.info("ALT-AI worker started.")
    while True:
        # Polling loop — extend with real queue (Redis, Celery, etc.)
        time.sleep(5)


if __name__ == "__main__":
    main()
