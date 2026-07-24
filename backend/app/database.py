from typing import AsyncGenerator
from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from app.config import settings


# Δημιουργία async engine για τη βάση δεδομένων SQLite
async_engine = create_async_engine(
    settings.database_url,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False}
)


# Ενεργοποίηση SQLite WAL (Write-Ahead Logging) mode και Foreign Keys για μέγιστη απόδοση
@event.listens_for(async_engine.sync_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    # Ενεργοποίηση WAL mode για γρήγορες ταυτόχρονες αναγνώσεις
    cursor.execute("PRAGMA journal_mode=WAL;")
    # Ενεργοποίηση ξένων κλειδιών για ακέραιες σχέσεις δεδομένων
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.close()


# Δημιουργία async session factory
AsyncSessionFactory = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)


# Βασική κλάση μοντέλων SQLAlchemy
class Base(DeclarativeBase):
    pass


# Συνάρτηση εξάρτησης (Dependency) για παροχή συνεδρίας βάσης δεδομένων στα endpoints
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionFactory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
