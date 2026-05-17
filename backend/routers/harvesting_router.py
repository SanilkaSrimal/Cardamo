from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/api/harvesting", tags=["Harvesting"])


class HarvestingCreate(BaseModel):
    current_fresh_price_lkr_per_kg: float
    drying_cost_total_lkr: float
    storage_cost_total_lkr: float
    quality_loss_pct_est: float = 2.5
    conversion_ratio: float = 4.0
    harvest_fresh_kg: Optional[float] = None
    notes: Optional[str] = None


class HarvestingUpdate(BaseModel):
    current_fresh_price_lkr_per_kg: Optional[float] = None
    drying_cost_total_lkr: Optional[float] = None
    storage_cost_total_lkr: Optional[float] = None
    quality_loss_pct_est: Optional[float] = None
    conversion_ratio: Optional[float] = None
    harvest_fresh_kg: Optional[float] = None
    notes: Optional[str] = None


@router.get("/my")
def my_harvesting(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT id, current_fresh_price_lkr_per_kg, drying_cost_total_lkr,
                   storage_cost_total_lkr, quality_loss_pct_est, conversion_ratio,
                   harvest_fresh_kg, notes, created_at, updated_at
            FROM harvesting
            WHERE user_id = ?
            ORDER BY created_at DESC
            """,
            (user_id,),
        ).fetchall()
    return [dict(r) for r in rows]


@router.post("/", status_code=201)
def create_harvesting(body: HarvestingCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO harvesting
                (user_id, current_fresh_price_lkr_per_kg, drying_cost_total_lkr,
                 storage_cost_total_lkr, quality_loss_pct_est, conversion_ratio,
                 harvest_fresh_kg, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                body.current_fresh_price_lkr_per_kg,
                body.drying_cost_total_lkr,
                body.storage_cost_total_lkr,
                body.quality_loss_pct_est,
                body.conversion_ratio,
                body.harvest_fresh_kg,
                body.notes,
            ),
        )
        row = conn.execute(
            "SELECT * FROM harvesting WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
    return dict(row)


@router.put("/{record_id}")
def update_harvesting(
    record_id: int, body: HarvestingUpdate, current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    with get_db() as conn:
        existing = conn.execute(
            "SELECT id, user_id FROM harvesting WHERE id = ?", (record_id,)
        ).fetchone()

        if not existing:
            raise HTTPException(status_code=404, detail="Record not found.")
        if existing["user_id"] != user_id and current_user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Not your record.")

        fields, values = [], []
        for field, value in body.model_dump(exclude_none=True).items():
            fields.append(f"{field} = ?")
            values.append(value)

        if not fields:
            raise HTTPException(status_code=400, detail="No fields to update.")

        fields.append("updated_at = CURRENT_TIMESTAMP")
        values.append(record_id)

        conn.execute(
            f"UPDATE harvesting SET {', '.join(fields)} WHERE id = ?", values
        )
        row = conn.execute("SELECT * FROM harvesting WHERE id = ?", (record_id,)).fetchone()
    return dict(row)


@router.delete("/{record_id}", status_code=204)
def delete_harvesting(record_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        existing = conn.execute(
            "SELECT id, user_id FROM harvesting WHERE id = ?", (record_id,)
        ).fetchone()

        if not existing:
            raise HTTPException(status_code=404, detail="Record not found.")
        if existing["user_id"] != user_id and current_user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Not your record.")

        conn.execute("DELETE FROM harvesting WHERE id = ?", (record_id,))
