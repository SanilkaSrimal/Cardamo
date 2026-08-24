from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from database import get_db
from auth import require_admin

router = APIRouter(prefix="/api/plans", tags=["Plans"])


class PlanRequest(BaseModel):
    name: str
    price: float
    total_credits: int


class UpdatePlanRequest(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    total_credits: Optional[int] = None
    is_active: Optional[bool] = None


@router.get("/")
def list_plans():
    """Public endpoint — returns all active plans."""
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, name, price, total_credits, is_active, created_at FROM plans WHERE is_active = 1 ORDER BY price ASC"
        ).fetchall()
    return [dict(r) for r in rows]


@router.get("/all")
def list_all_plans(admin: dict = Depends(require_admin)):
    """Admin only — returns all plans including inactive."""
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, name, price, total_credits, is_active, created_at FROM plans ORDER BY price ASC"
        ).fetchall()
    return [dict(r) for r in rows]


@router.post("/", status_code=201)
def create_plan(body: PlanRequest, admin: dict = Depends(require_admin)):
    if body.price <= 0:
        raise HTTPException(status_code=400, detail="Price must be positive.")
    if body.total_credits <= 0:
        raise HTTPException(status_code=400, detail="Credits must be positive.")

    with get_db() as conn:
        cursor = conn.execute(
            "INSERT INTO plans (name, price, total_credits) VALUES (?, ?, ?)",
            (body.name, body.price, body.total_credits),
        )
        row = conn.execute(
            "SELECT id, name, price, total_credits, is_active, created_at FROM plans WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()
    return dict(row)


@router.patch("/{plan_id}")
def update_plan(plan_id: int, body: UpdatePlanRequest, admin: dict = Depends(require_admin)):
    fields, values = [], []

    if body.name is not None:
        fields.append("name = ?")
        values.append(body.name)
    if body.price is not None:
        fields.append("price = ?")
        values.append(body.price)
    if body.total_credits is not None:
        fields.append("total_credits = ?")
        values.append(body.total_credits)
    if body.is_active is not None:
        fields.append("is_active = ?")
        values.append(1 if body.is_active else 0)

    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update.")

    values.append(plan_id)
    with get_db() as conn:
        conn.execute(f"UPDATE plans SET {', '.join(fields)} WHERE id = ?", values)
        row = conn.execute(
            "SELECT id, name, price, total_credits, is_active, created_at FROM plans WHERE id = ?",
            (plan_id,),
        ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Plan not found.")
    return dict(row)


@router.delete("/{plan_id}", status_code=204)
def delete_plan(plan_id: int, admin: dict = Depends(require_admin)):
    with get_db() as conn:
        row = conn.execute("SELECT id FROM plans WHERE id = ?", (plan_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Plan not found.")
        # Soft delete — mark inactive so payment history still references it
        conn.execute("UPDATE plans SET is_active = 0 WHERE id = ?", (plan_id,))
