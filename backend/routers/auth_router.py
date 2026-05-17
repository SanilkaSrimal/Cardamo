import uuid
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from database import get_db
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register", status_code=201)
def register(body: RegisterRequest):
    with get_db() as conn:
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?", (body.email,)
        ).fetchone()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )
        hashed = hash_password(body.password)
        cursor = conn.execute(
            "INSERT INTO users (name, email, hashed_password, credits, role) VALUES (?, ?, ?, 0, 'user')",
            (body.name, body.email, hashed),
        )
        user_id = cursor.lastrowid
        user = conn.execute(
            "SELECT id, name, email, credits, role, created_at FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

    token = create_access_token(user["id"], user["role"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": dict(user),
    }


@router.post("/login")
def login(body: LoginRequest):
    with get_db() as conn:
        user = conn.execute(
            "SELECT id, name, email, hashed_password, credits, role, created_at FROM users WHERE email = ?",
            (body.email,),
        ).fetchone()

    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(user["id"], user["role"])
    user_dict = dict(user)
    user_dict.pop("hashed_password", None)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_dict,
    }


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    return current_user
