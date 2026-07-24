from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


# Σχήμα για την απόκριση JWT token
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Σχήμα δεδομένων payload του JWT token
class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None


# Βασικό σχήμα στοιχείων χρήστη
class UserBase(BaseModel):
    email: str = Field(..., pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$", description="Έγκυρη διεύθυνση ηλεκτρονικού ταχυδρομείου")
    full_name: str
    is_active: bool = True
    role: str = "user"


# Σχήμα δημιουργίας νέου χρήστη
class UserCreate(UserBase):
    password: Optional[str] = Field(default="", description="Προαιρετικός κωδικός πρόσβασης")
    pin: Optional[str] = Field(default=None, pattern=r"^\d{4}$", description="4-ψηφιο PIN (υποχρεωτικό αν role είναι admin)")


# Σχήμα αλλαγής PIN Admin
class AdminPinUpdate(BaseModel):
    pin: str = Field(..., pattern=r"^\d{4}$", description="Νέο 4-ψηφιο PIN")


# Σχήμα επιστροφής στοιχείων χρήστη στις αποκρίσεις API
class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Σχήμα αίτησης σύνδεσης χρήστη (Login)
class UserLogin(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    pin: Optional[str] = Field(default=None, description="4-ψηφιο PIN (μόνο για Admin)")


# Βασικό σχήμα στοιχεία συναλλαγής
class TransactionBase(BaseModel):
    amount: float = Field(..., description="Ποσό συναλλαγής (θετικό για έσοδα, αρνητικό για έξοδα)")
    category: str = Field(..., min_length=1, description="Κατηγορία συναλλαγής")
    transaction_type: str = Field(default="expense", description="Τύπος συναλλαγής (expense, income, investment, savings)")
    frequency: str = Field(default="one_off", description="Συχνότητα (one_off, monthly, yearly)")
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Ημερομηνία σε μορφή YYYY-MM-DD")
    description: str = Field(default="", description="Περιγραφή συναλλαγής")
    is_shared: bool = Field(default=True, description="True αν η συναλλαγή είναι κοινόχρηστη για όλη την οικογένεια")


# Σχήμα δημιουργίας συναλλαγής
class TransactionCreate(TransactionBase):
    pass


# Σχήμα ενημέρωσης συναλλαγής
class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    transaction_type: Optional[str] = None
    frequency: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None
    is_shared: Optional[bool] = None


# Σχήμα επιστροφής συναλλαγής στις αποκρίσεις API
class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Βασικό σχήμα ορίου προϋπολογισμού
class BudgetLimitBase(BaseModel):
    category: str = Field(..., min_length=1, description="Κατηγορία εξόδων")
    monthly_limit: float = Field(..., gt=0, description="Μηνιαίο ανώτατο όριο δαπάνης")


# Σχήμα δημιουργίας/ενημέρωσης ορίου προϋπολογισμού
class BudgetLimitCreate(BudgetLimitBase):
    pass


# Σχήμα επιστροφής ορίου προϋπολογισμού
class BudgetLimitResponse(BudgetLimitBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Σχήμα συνοπτικών στατιστικών οικονομικού πίνακα (Dashboard Summary)
class DashboardSummary(BaseModel):
    total_income: float = 0.0
    total_expenses: float = 0.0
    total_investments: float = 0.0
    total_savings: float = 0.0
    net_savings: float = 0.0
    category_expenses: dict = Field(default_factory=dict)
    transaction_count: int = 0

