import os
import uuid
import bcrypt
import sqlite3
from dotenv import load_dotenv

load_dotenv()

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from database import get_db

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SECRET_KEY = os.getenv("SECRET_KEY", "cardamo-secret-key-change-in-production-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

CREDITS_PER_AI_USE = 20

# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------
security = HTTPBearer()


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------
def create_access_token(user_id: int, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": expire,
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ---------------------------------------------------------------------------
# FastAPI dependencies
# ---------------------------------------------------------------------------
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Returns the current user row as a dict-like sqlite3.Row."""
    payload = decode_token(credentials.credentials)
    user_id = int(payload["sub"])

    with get_db() as conn:
        user = conn.execute(
            "SELECT id, name, email, credits, role, created_at FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )
    return dict(user)


def require_admin(current_user: dict = Depends(get_current_user)):
    """Only allows admin users."""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return current_user


# ---------------------------------------------------------------------------
# Credit deduction
# ---------------------------------------------------------------------------
def deduct_credits(current_user: dict = Depends(get_current_user)):
    """
    Deducts CREDITS_PER_AI_USE credits from the user's balance.
    Raises 402 if the user does not have enough credits.
    Returns the updated user dict.
    """
    user_id = current_user["id"]

    with get_db() as conn:
        # Re-read credits with a row lock via exclusive transaction
        row = conn.execute(
            "SELECT credits FROM users WHERE id = ?", (user_id,)
        ).fetchone()

        if row is None:
            raise HTTPException(status_code=404, detail="User not found.")

        current_credits = row["credits"]

        if current_credits < CREDITS_PER_AI_USE:
            raise HTTPException(
                status_code=402,
                detail=(
                    f"Insufficient credits. You have {current_credits} credits "
                    f"but this action requires {CREDITS_PER_AI_USE}. "
                    "Please purchase a plan to continue."
                ),
            )

        new_balance = current_credits - CREDITS_PER_AI_USE
        conn.execute(
            "UPDATE users SET credits = ? WHERE id = ?",
            (new_balance, user_id),
        )

    current_user["credits"] = new_balance
    return current_user
