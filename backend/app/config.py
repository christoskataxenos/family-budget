import os
from pydantic_settings import BaseSettings, SettingsConfigDict


# Κλάση διαχείρισης ρυθμίσεων της εφαρμογής με χρήση pydantic-settings
class Settings(BaseSettings):
    # Μυστικό κλειδί για την υπογραφή των JWT tokens
    secret_key: str = "super_secret_key_family_budget_2026_change_in_production"
    
    # Αλγόριθμος κρυπτογράφησης JWT
    algorithm: str = "HS256"
    
    # Χρόνος λήξης JWT token σε λεπτά (προεπιλογή: 30 ημέρες)
    access_token_expire_minutes: int = 43200
    
    # URL σύνδεσης με τη βάση δεδομένων SQLite (Async)
    database_url: str = "sqlite+aiosqlite:///./data/budget.db"
    
    # Στοιχεία αρχικού διαχειριστή (Seed Admin User)
    first_admin_email: str = "admin@family.local"
    first_admin_password: str = "AdminPassword123!"
    first_admin_name: str = "Family Admin"
    
    # Ρύθμιση για ανάγνωση από αρχείο .env
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


# Δημιουργία καθολικού αντικειμένου ρυθμίσεων
settings = Settings()
