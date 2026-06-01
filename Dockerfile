FROM python:3.11-slim AS base

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl git && \
    rm -rf /var/lib/apt/lists/*

COPY pyproject.toml README.md ./
COPY src/ src/

RUN pip install --no-cache-dir -e "." && \
    pip install --no-cache-dir uvicorn[standard]

COPY configs/ configs/
COPY data/samples/ data/samples/

EXPOSE 8000

CMD ["affectlog", "serve", "--host", "0.0.0.0", "--port", "8000"]
