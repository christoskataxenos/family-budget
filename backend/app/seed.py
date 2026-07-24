from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.models import User
from app.security import get_password_hash, get_pin_hash


# Συνάρτηση αρχικής σποράς δεδομένων (Database Seeder)
async def seed_initial_data(db: AsyncSession) -> None:
    # Έλεγχος αν υπάρχει ήδη ο αρχικός διαχειριστής
    result = await db.execute(select(User).where(User.email == settings.first_admin_email))
    existing_admin = result.scalar_one_or_none()

    if not existing_admin:
        # Δημιουργία αρχικού διαχειριστή με default 4-ψηφιο PIN "1234"
        hashed_pwd = get_password_hash(settings.first_admin_password)
        hashed_pin = get_pin_hash("1234")
        admin_user = User(
            email=settings.first_admin_email,
            hashed_password=hashed_pwd,
            pin=hashed_pin,
            full_name=settings.first_admin_name,
            role="admin",
            is_active=True
        )
        db.add(admin_user)
        await db.commit()
    elif not existing_admin.pin:
        # Ενημέρωση PIN αν δεν έχει οριστεί
        existing_admin.pin = get_pin_hash("1234")
        await db.commit()

    # Δημιουργία παραδείγματος απλού μέλους οικογένειας (με ελεύθερη είσοδο)
    member_email = "member@family.local"
    res_member = await db.execute(select(User).where(User.email == member_email))
    existing_member = res_member.scalar_one_or_none()

    if not existing_member:
        sample_member = User(
            email=member_email,
            hashed_password="",
            pin=None,
            full_name="Μέλος Οικογένειας",
            role="user",
            is_active=True
        )
        db.add(sample_member)
        await db.commit()

