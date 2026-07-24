from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from app.database import AsyncSessionFactory, Base, async_engine
from app.routers import auth, budget, export, transactions

from app.seed import seed_initial_data


# Διαχείριση κύκλου ζωής (Lifespan Context Manager) της εφαρμογής FastAPI
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Δημιουργία των πινάκων στη βάση δεδομένων SQLite αν δεν υπάρχουν
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Σπορά αρχικών δεδομένων (Δημιουργία Admin User)
    async with AsyncSessionFactory() as session:
        await seed_initial_data(session)

    yield

    # Ενέργειες κατά τον τερματισμό (Shutdown)
    await async_engine.dispose()


# Δημιουργία κύριας εφαρμογής FastAPI
app = FastAPI(
    title="Family Budget & Finance Tracker API",
    description="Lightweight and efficient family budget management system",
    version="1.0.0",
    lifespan=lifespan
)


# Προσθήκη Middleware συμπίεσης GZip για βελτιστοποίηση ταχύτητας
app.add_middleware(GZipMiddleware, minimum_size=1000)


# Προσθήκη Middleware CORS για ασφαλή επικοινωνία με το Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Ενσωμάτωση των δρομολογητών API (Routers)
app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(budget.router)
app.include_router(export.router)




# Endpoint ελέγχου υγείας (Health Check Probe) για το Docker container
@app.get("/health", status_code=status.HTTP_200_OK, tags=["Health"])
@app.get("/api/health", status_code=status.HTTP_200_OK, tags=["Health"])
@app.get("/api/v1/health", status_code=status.HTTP_200_OK, tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Family Budget API",
        "version": "1.0.0"
    }


# Αρχικό ριζικό endpoint για επιβεβαίωση λειτουργίας
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to Family Budget & Finance Tracker API",
        "docs_url": "/docs"
    }
