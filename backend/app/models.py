from datetime import datetime
from typing import List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


# Μοντέλο χρήστη (User) στη βάση δεδομένων
class User(Base):
    __tablename__ = "users"

    # Μοναδικό αναγνωριστικό χρήστη
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Ηλεκτρονική διεύθυνση χρήστη (μοναδικό πεδίο)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)

    # Κρυπτογραφημένος κωδικός πρόσβασης (ή κενό για απλούς χρήστες με ελεύθερη είσοδο)
    hashed_password: Mapped[str] = mapped_column(String(255), default="", nullable=False)

    # 4-ψηφιο PIN κρυπτογραφημένο (μόνο για τον Admin)
    pin: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Πλήρες όνομα χρήστη
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Ρόλος χρήστη ("admin" για διαχειριστή οικογένειας, "user" για απλό μέλος)
    role: Mapped[str] = mapped_column(String(50), default="user", nullable=False)

    # Κατάσταση ενεργοποίησης λογαριασμού
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Ημερομηνία δημιουργίας λογαριασμού
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=False)

    # Σχέση ένα-προς-πολλά με τις συναλλαγές του χρήστη
    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="owner", cascade="all, delete-orphan")


# Μοντέλο συναλλαγής (Transaction) στη βάση δεδομένων
class Transaction(Base):
    __tablename__ = "transactions"

    # Μοναδικό αναγνωριστικό συναλλαγής
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Ποσό συναλλαγής (θετικό για έσοδα, αρνητικό για έξοδα)
    amount: Mapped[float] = mapped_column(Float, nullable=False)

    # Κατηγορία συναλλαγής (π.χ. "Groceries", "Salary", "Utilities")
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=False)

    # Τύπος συναλλαγής ("expense", "income", "investment", "savings")
    transaction_type: Mapped[str] = mapped_column(String(50), default="expense", nullable=False)

    # Συχνότητα συναλλαγής ("one_off", "monthly", "yearly")
    frequency: Mapped[str] = mapped_column(String(50), default="one_off", nullable=False)

    # Ημερομηνία πραγματοποίησης της συναλλαγής (YYYY-MM-DD)
    date: Mapped[str] = mapped_column(String(10), nullable=False)

    # Περιγραφή συναλλαγής
    description: Mapped[str] = mapped_column(String(255), default="", nullable=False)

    # Ξένο κλειδί που συνδέει τη συναλλαγή με τον ιδιοκτήτη χρήστη
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Σημαία κοινόχρηστης οικογενειακής συναλλαγής (true αν αφορά όλη την οικογένεια)
    is_shared: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Ημερομηνία καταγραφής στη βάση
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=False)

    # Αναφορά στον ιδιοκτήτη της συναλλαγής
    owner: Mapped["User"] = relationship("User", back_populates="transactions")


# Μοντέλο ορίου προϋπολογισμού ανά κατηγορία (BudgetLimit)
class BudgetLimit(Base):
    __tablename__ = "budget_limits"

    # Μοναδικό αναγνωριστικό ορίου
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Κατηγορία εξόδων (μοναδικό πεδίο)
    category: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)

    # Μηνιαίο ανώτατο όριο δαπάνης σε Ευρώ
    monthly_limit: Mapped[float] = mapped_column(Float, nullable=False)

    # Ημερομηνία δημιουργίας ορίου
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=False)

