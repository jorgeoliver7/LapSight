FROM python:3.12-slim AS builder

WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.12-slim

RUN groupadd -g 1001 appgroup && useradd -u 1001 -g appgroup -m -s /bin/bash appuser

COPY --from=builder /root/.local /home/appuser/.local
RUN chown -R appuser:appgroup /home/appuser

USER appuser
WORKDIR /app
ENV PATH=/home/appuser/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

COPY --chown=appuser:appgroup app ./app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
