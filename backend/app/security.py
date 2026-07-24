from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.database import get_db
from app.models import User
from app.schemas import TokenData


# Ορισμός σχήματος αυθεντικοποίησης OAuth2 για λήψη του token από την επικεφαλίδα Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# Συνάρτηση επαλήθευσης κωδικού πρόσβασης με χρήση της εγγενούς βιβλιοθήκης bcrypt
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


# Συνάρτηση δημιουργίας κρυπτογραφημένου hash για νέο κωδικό πρόσβασης
def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


# Συνάρτηση επαλήθευσης 4-ψηφιου PIN
def verify_pin(plain_pin: str, hashed_pin: Optional[str]) -> bool:
    if not hashed_pin:
        return False
    try:
        return bcrypt.checkpw(plain_pin.encode("utf-8"), hashed_pin.encode("utf-8"))
    except Exception:
        return False


# Συνάρτηση δημιουργίας hash για 4-ψηφιο PIN
def get_pin_hash(pin: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pin.encode("utf-8"), salt)
    return hashed.decode("utf-8")



# Συνάρτηση δημιουργίας JWT πρόσβασης (Access Token)
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    
    # Υπολογισμός χρόνου λήξης του token
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
        
    to_encode.update({"exp": expire})
    
    # Δημιουργία και υπογραφή του JWT token
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


# Συνάρτηση εξάρτησης (Dependency) για ανάκτηση και επαλήθευση του τρέχοντος συνδεδεμένου χρήστη
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Δεν ήταν δυνατή η επαλήθευση των διαπιστευτηρίων πρόσβασης",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Αποκρυπτογράφηση του JWT token
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        role: str = payload.get("role")
        
        if email is None or user_id is None:
            raise credentials_exception
            
        token_data = TokenData(email=email, role=role, user_id=user_id)
    except JWTError:
        raise credentials_exception

    # Αναζήτηση του χρήστη στη βάση δεδομένων
    result = await db.execute(select(User).where(User.id == token_data.user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ο λογαριασμός χρήστη είναι απενεργοποιημένος"
        )
        
    return user


# Συνάρτηση εξάρτησης (Dependency) για έλεγχο δικαιωμάτων διαχειριστή (Admin Role Required)
async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Απαιτούνται δικαιώματα διαχειριστή για αυτή την ενέργεια"
        )
    return current_user
