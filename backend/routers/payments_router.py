import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_db
from auth import get_current_user, require_admin

router = APIRouter(prefix="/api/payments", tags=["Payments"])


class ActivateRequest(BaseModel):
    plan_id: int


@router.post("/activate", status_code=201)
def activate_plan(body: ActivateRequest, current_user: dict = Depends(get_current_user)):
    """
    Self-service plan activation.
    Immediately adds credits to the user's balance and records the payment.
    """
    user_id = current_user["id"]

    with get_db() as conn:
        plan = conn.execute(
            "SELECT id, name, price, total_credits, is_active FROM plans WHERE id = ?",
            (body.plan_id,),
        ).fetchone()

        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found.")
        if not plan["is_active"]:
            raise HTTPException(status_code=400, detail="This plan is no longer available.")

        ref = f"REF-{uuid.uuid4().hex[:8].upper()}"
        cursor = conn.execute(
            """
            INSERT INTO payments (user_id, plan_id, amount_lkr, credits_purchased, payment_ref, status)
            VALUES (?, ?, ?, ?, ?, 'completed')
            """,
            (user_id, plan["id"], plan["price"], plan["total_credits"], ref),
        )
        payment_id = cursor.lastrowid

        conn.execute(
            "UPDATE users SET credits = credits + ? WHERE id = ?",
            (plan["total_credits"], user_id),
        )

        updated_user = conn.execute(
            "SELECT credits FROM users WHERE id = ?", (user_id,)
        ).fetchone()

        payment = conn.execute(
            "SELECT * FROM payments WHERE id = ?", (payment_id,)
        ).fetchone()

    return {
        "message": f"Successfully activated '{plan['name']}'. {plan['total_credits']} credits added.",
        "new_credit_balance": updated_user["credits"],
        "payment": dict(payment),
    }


@router.get("/my")
def my_payments(current_user: dict = Depends(get_current_user)):
    """Returns the current user's payment / purchase history."""
    user_id = current_user["id"]
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT p.id, p.amount_lkr, p.credits_purchased, p.payment_ref, p.status, p.created_at,
                   pl.name AS plan_name, pl.price AS plan_price
            FROM payments p
            LEFT JOIN plans pl ON pl.id = p.plan_id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
            """,
            (user_id,),
        ).fetchall()
    return [dict(r) for r in rows]


@router.get("/")
def all_payments(admin: dict = Depends(require_admin)):
    """Admin only — all payments across all users."""
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT p.id, p.amount_lkr, p.credits_purchased, p.payment_ref, p.status, p.created_at,
                   pl.name AS plan_name,
                   u.name AS user_name, u.email AS user_email
            FROM payments p
            LEFT JOIN plans pl ON pl.id = p.plan_id
            LEFT JOIN users u  ON u.id  = p.user_id
            ORDER BY p.created_at DESC
            """
        ).fetchall()
    return [dict(r) for r in rows]
