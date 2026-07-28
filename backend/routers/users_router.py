from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from database import get_db
from auth import require_admin, get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])


class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    credits: Optional[int] = None


@router.get("/")
def list_users(admin: dict = Depends(require_admin)):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, name, email, credits, role, created_at FROM users ORDER BY created_at DESC"
        ).fetchall()
    return [dict(r) for r in rows]


@router.get("/{user_id}")
def get_user(user_id: int, admin: dict = Depends(require_admin)):
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, name, email, credits, role, created_at FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found.")
    return dict(row)


@router.patch("/{user_id}")
def update_user(user_id: int, body: UpdateUserRequest, admin: dict = Depends(require_admin)):
    fields = []
    values = []

    if body.name is not None:
        fields.append("name = ?")
        values.append(body.name)
    if body.role is not None:
        if body.role not in ("admin", "user"):
            raise HTTPException(status_code=400, detail="Role must be 'admin' or 'user'.")
        fields.append("role = ?")
        values.append(body.role)
    if body.credits is not None:
        if body.credits < 0:
            raise HTTPException(status_code=400, detail="Credits cannot be negative.")
        fields.append("credits = ?")
        values.append(body.credits)

    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update.")

    values.append(user_id)
    with get_db() as conn:
        conn.execute(
            f"UPDATE users SET {', '.join(fields)} WHERE id = ?",
            values,
        )
        row = conn.execute(
            "SELECT id, name, email, credits, role, created_at FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="User not found.")
    return dict(row)


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, admin: dict = Depends(require_admin)):
    with get_db() as conn:
        row = conn.execute("SELECT id FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found.")
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
