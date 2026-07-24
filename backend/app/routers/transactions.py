from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Transaction, User
from app.schemas import DashboardSummary, TransactionCreate, TransactionResponse, TransactionUpdate
from app.security import get_current_user


# Δημιουργία δρομολογητή για τη διαχείριση των συναλλαγών (CRUD)
router = APIRouter(prefix="/api/v1/transactions", tags=["Transactions"])


# Endpoint ανάκτησης όλων των συναλλαγών με έλεγχο ρόλων (RBAC)
@router.get("", response_model=List[TransactionResponse])
async def get_transactions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Αν ο χρήστης είναι Admin, βλέπει όλες τις συναλλαγές της οικογένειας
    if current_user.role == "admin":
        query = select(Transaction).order_by(Transaction.date.desc())
    else:
        # Αν ο χρήστης είναι απλό μέλος, βλέπει τις δικές του συναλλαγές συν τις κοινόχρηστες
        query = select(Transaction).where(
            (Transaction.user_id == current_user.id) | (Transaction.is_shared == True)
        ).order_by(Transaction.date.desc())

    result = await db.execute(query)
    transactions = result.scalars().all()
    return transactions


# Endpoint δημιουργίας νέας συναλλαγής
@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_in: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Δημιουργία αντικειμένου συναλλαγής με σύνδεση στον τρέχοντα χρήστη
    new_transaction = Transaction(
        amount=transaction_in.amount,
        category=transaction_in.category,
        transaction_type=transaction_in.transaction_type,
        frequency=transaction_in.frequency,
        date=transaction_in.date,
        description=transaction_in.description,
        is_shared=transaction_in.is_shared,
        user_id=current_user.id
    )

    db.add(new_transaction)
    await db.commit()
    await db.refresh(new_transaction)

    return new_transaction


# Endpoint ανάκτησης μιας συγκεκριμένης συναλλαγής βάσει ID
@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Transaction).where(Transaction.id == transaction_id))
    transaction = result.scalar_one_or_none()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Η συναλλαγή με ID {transaction_id} δεν βρέθηκε"
        )

    # Έλεγχος δικαιωμάτων πρόσβασης (Admin ή Ιδιοκτήτης ή Κοινόχρηστη συναλλαγή)
    if current_user.role != "admin" and transaction.user_id != current_user.id and not transaction.is_shared:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Δεν έχετε δικαίωμα πρόσβασης σε αυτή τη συναλλαγή"
        )

    return transaction


# Endpoint ενημέρωσης συναλλαγής
@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction_in: TransactionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Transaction).where(Transaction.id == transaction_id))
    transaction = result.scalar_one_or_none()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Η συναλλαγή με ID {transaction_id} δεν βρέθηκε"
        )

    # Έλεγχος δικαιωμάτων τροποποίησης (Μόνο ο ιδιοκτήτης ή ο Admin)
    if current_user.role != "admin" and transaction.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Δεν έχετε δικαίωμα τροποποίησης αυτής της συναλλαγής"
        )

    # Ενημέρωση των πεδίων της συναλλαγής
    update_data = transaction_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(transaction, field, value)

    await db.commit()
    await db.refresh(transaction)

    return transaction


# Endpoint διαγραφής συναλλαγής
@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Transaction).where(Transaction.id == transaction_id))
    transaction = result.scalar_one_or_none()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Η συναλλαγή με ID {transaction_id} δεν βρέθηκε"
        )

    # Έλεγχος δικαιωμάτων διαγραφής (Μόνο ο ιδιοκτήτης ή ο Admin)
    if current_user.role != "admin" and transaction.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Δεν έχετε δικαίωμα διαγραφής αυτής της συναλλαγής"
        )

    await db.delete(transaction)
    await db.commit()

    return None


# Endpoint υπολογισμού οικονομικών στατιστικών πίνακα οργάνων (Dashboard Analytics)
@router.get("/summary/dashboard", response_model=DashboardSummary)
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ανάκτηση συναλλαγών ανάλογα με τον ρόλο
    if current_user.role == "admin":
        query = select(Transaction)
    else:
        query = select(Transaction).where(
            (Transaction.user_id == current_user.id) | (Transaction.is_shared == True)
        )

    result = await db.execute(query)
    transactions = result.scalars().all()

    total_income = 0.0
    total_expenses = 0.0
    total_investments = 0.0
    total_savings = 0.0
    category_expenses = {}

    # Υπολογισμός αθροισμάτων εσόδων, εξόδων, επενδύσεων & αποταμιεύσεων
    for tx in transactions:
        t_type = getattr(tx, "transaction_type", "expense")
        abs_amount = abs(tx.amount)

        if t_type == "income" or (t_type == "expense" and tx.amount > 0):
            total_income += abs_amount
        elif t_type == "investment":
            total_investments += abs_amount
        elif t_type == "savings":
            total_savings += abs_amount
        else:
            total_expenses += abs_amount
            category_expenses[tx.category] = category_expenses.get(tx.category, 0.0) + abs_amount

    net_savings = total_income - (total_expenses + total_investments + total_savings)

    return DashboardSummary(
        total_income=round(total_income, 2),
        total_expenses=round(total_expenses, 2),
        total_investments=round(total_investments, 2),
        total_savings=round(total_savings, 2),
        net_savings=round(net_savings, 2),
        category_expenses={k: round(v, 2) for k, v in category_expenses.items()},
        transaction_count=len(transactions)
    )

