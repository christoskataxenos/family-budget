from datetime import timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.database import get_db
from app.models import User
from app.schemas import AdminPinUpdate, Token, UserCreate, UserLogin, UserResponse
from app.security import (
    create_access_token,
    get_current_user,
    get_password_hash,
    get_pin_hash,
    require_admin,
    verify_password,
    verify_pin,
)


# Δημιουργία δρομολογητή για τις λειτουργίες αυθεντικοποίησης
router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


# Endpoint επιστροφής λίστας προφίλ μελών για το 1-Click Quick Profile Switcher
@router.get("/profiles", response_model=List[UserResponse])
async def get_family_profiles(db: AsyncSession = Depends(get_db)):
    # Ανάκτηση όλων των ενεργών μελών της οικογένειας
    result = await db.execute(select(User).where(User.is_active == True).order_by(User.id.asc()))
    profiles = result.scalars().all()
    return profiles


# Endpoint σύνδεσης με επιλογή προφίλ & PIN (Ελεύθερη είσοδος για απλούς χρήστες, PIN μόνο για Admin)
@router.post("/login-pin", response_model=Token)
async def login_with_pin(
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    # Αναζήτηση χρήστη βάσει user_id ή email
    query = select(User).where(User.is_active == True)
    if login_data.user_id:
        query = query.where(User.id == login_data.user_id)
    elif login_data.email:
        query = query.where(User.email == login_data.email)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Απαιτείται user_id ή email για τη σύνδεση"
        )

    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ο χρήστης δεν βρέθηκε"
        )

    # Αν ο χρήστης είναι Admin, απαιτείται επαλήθευση του 4-ψηφιου PIN
    if user.role == "admin":
        if not login_data.pin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Απαιτείται 4-ψηφιο PIN για τη σύνδεση του Διαχειριστή"
            )
        if not verify_pin(login_data.pin, user.pin):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Εσφαλμένο 4-ψηφιο PIN Διαχειριστή"
            )

    # Δημιουργία JWT access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


# Endpoint άμεσης ταχείας σύνδεσης (Quick Login) χωρίς κωδικό για τοπικό δίκτυο
@router.post("/quick-login/{user_id}", response_model=Token)
async def quick_login_by_user_id(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    # Αναζήτηση χρήστη βάσει ID
    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Το μέλος με ID {user_id} δεν βρέθηκε"
        )

    # Αν ο χρήστης είναι Admin, δεν επιτρέπεται quick login χωρίς PIN
    if user.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ο Διαχειριστής πρέπει να συνδεθεί με το 4-ψηφιο PIN του"
        )

    # Δημιουργία JWT access token χωρίς κωδικό για απλό χρήστη
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


# Endpoint αλλαγής PIN Admin (μόνο από Admin)
@router.put("/admin/pin", status_code=status.HTTP_200_OK)
async def update_admin_pin(
    pin_data: AdminPinUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    # Ενημέρωση PIN του Admin
    current_user.pin = get_pin_hash(pin_data.pin)
    await db.commit()
    return {"message": "Το 4-ψηφιο PIN του Διαχειριστή ενημερώθηκε επιτυχώς"}


# Endpoint δημιουργίας νέου μέλους οικογένειας (μόνο από Admin)
@router.post("/admin/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_family_member(
    user_in: UserCreate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    # Έλεγχος αν το email χρησιμοποιείται ήδη
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Το συγκεκριμένο email χρησιμοποιείται ήδη"
        )

    # Δημιουργία νέου μέλους
    new_user = User(
        email=user_in.email,
        hashed_password="",
        pin=get_pin_hash(user_in.pin) if user_in.pin and user_in.role == "admin" else None,
        full_name=user_in.full_name,
        role=user_in.role,
        is_active=True
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


# Endpoint διαγραφής μέλους (μόνο από Admin)
@router.delete("/admin/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_family_member(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Δεν μπορείτε να διαγράψετε τον εαυτό σας"
        )

    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalar_one_or_none()

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ο χρήστης δεν βρέθηκε"
        )

    await db.delete(target_user)
    await db.commit()


# Endpoint επιστροφής στοιχείων του τρέχοντος συνδεδεμένου χρήστη
@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

