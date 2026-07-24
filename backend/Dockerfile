# Multi-stage Dockerfile για το FastAPI Backend με ελάχιστο αποτύπωμα πόρων

# Στάδιο 1: Στάδιο μεταγλώττισης και προετοιμασίας εξαρτήσεων (Builder Stage)
FROM python:3.12-slim AS builder

# Ορισμός μεταβλητών περιβάλλοντος Python για αποφυγή δημιουργίας .pyc
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Εγκατάσταση απαραίτητων εργαλείων μεταγλώττισης
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Αντιγραφή και εγκατάσταση εξαρτήσεων Python
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# Στάδιο 2: Τελικό στάδιο εκτέλεσης (Runtime Stage)
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/install/bin:$PATH" \
    PYTHONPATH="/install/lib/python3.12/site-packages:$PYTHONPATH"

WORKDIR /app

# Δημιουργία μη-root χρήστη για λόγους ασφαλείας
RUN addgroup --gid 1001 appgroup && \
    adduser --uid 1001 --gid 1001 --disabled-password --gecos "" appuser

# Εγκατάσταση curl για το health check
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Αντιγραφή των βιβλιοθηκών από το στάδιο builder
COPY --from=builder /install /install

# Αντιγραφή του κώδικα της εφαρμογής
COPY --chown=appuser:appgroup app /app/app

# Δημιουργία φακέλου δεδομένων για τη βάση SQLite και ορισμός δικαιωμάτων
RUN mkdir -p /app/data && chown -R appuser:appgroup /app/data

# Αλλαγή σε μη-root χρήστη
USER appuser

EXPOSE 8000

# Έλεγχος υγείας του container (Health Check)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Εκκίνηση του Uvicorn server
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
