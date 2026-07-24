from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import BudgetLimit, User
from app.schemas import BudgetLimitCreate, BudgetLimitResponse
from app.security import get_current_user, require_admin


# Δημιουργία δρομολογητή για τα όρια προϋπολογισμού (Budget Limits)
router = APIRouter(prefix="/api/v1/budget-limits", tags=["Budget Limits"])


# Endpoint ανάκτησης όλων των ορίων κατηγοριών (για όλους τους συνδεδεμένους χρήστες)
@router.get("", response_model=List[BudgetLimitResponse])
async def get_budget_limits(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[BudgetLimit]:
    # Ανάκτηση όλων των ορίων προϋπολογισμού
    result = await db.execute(select(BudgetLimit).order_by(BudgetLimit.category.asc()))
    limits = result.scalars().all()
    return list(limits)


# Endpoint δημιουργίας ή ενημέρωσης ορίου κατηγορίας (αποκλειστικά από Admin)
@router.post("", response_model=BudgetLimitResponse, status_code=status.HTTP_201_CREATED)
async def set_budget_limit(
    limit_in: BudgetLimitCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> BudgetLimit:
    # Έλεγχος αν υπάρχει ήδη όριο για την κατηγορία
    result = await db.execute(select(BudgetLimit).where(BudgetLimit.category == limit_in.category))
    existing_limit = result.scalar_one_or_none()

    if existing_limit:
        # Ενημέρωση υπάρχοντος ορίου
        existing_limit.monthly_limit = limit_in.monthly_limit
        await db.commit()
        await db.refresh(existing_limit)
        return existing_limit

    # Δημιουργία νέου ορίου
    new_limit = BudgetLimit(
        category=limit_in.category,
        monthly_limit=limit_in.monthly_limit
    )
    db.add(new_limit)
    await db.commit()
    await db.refresh(new_limit)

    return new_limit


# Endpoint διαγραφής ορίου κατηγορίας (αποκλειστικά από Admin)
@router.delete("/{limit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget_limit(
    limit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> None:
    result = await db.execute(select(BudgetLimit).where(BudgetLimit.id == limit_id))
    limit = result.scalar_one_or_none()

    if not limit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Το όριο με ID {limit_id} δεν βρέθηκε"
        )

    await db.delete(limit)
    await db.commit()
    return None
