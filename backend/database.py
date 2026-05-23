import sqlite3
from pathlib import Path
from contextlib import contextmanager
import bcrypt

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "cardamo.db"


def _hash_pw(password: str) -> str:
    """Hash a password using bcrypt directly."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def create_tables() -> None:
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                name             TEXT    NOT NULL,
                email            TEXT    UNIQUE NOT NULL,
                hashed_password  TEXT    NOT NULL,
                credits          INTEGER NOT NULL DEFAULT 0,
                role             TEXT    NOT NULL DEFAULT 'user',
                created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS plans (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                name           TEXT    NOT NULL,
                price          REAL    NOT NULL,
                total_credits  INTEGER NOT NULL,
                is_active      INTEGER NOT NULL DEFAULT 1,
                created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS payments (
                id                 INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                plan_id            INTEGER NOT NULL REFERENCES plans(id),
                amount_lkr         REAL    NOT NULL,
                credits_purchased  INTEGER NOT NULL,
                payment_ref        TEXT,
                status             TEXT    NOT NULL DEFAULT 'completed',
                created_at         DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS harvesting (
                id                              INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id                         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                current_fresh_price_lkr_per_kg  REAL    NOT NULL,
                drying_cost_total_lkr           REAL    NOT NULL,
                storage_cost_total_lkr          REAL    NOT NULL,
                quality_loss_pct_est            REAL    NOT NULL DEFAULT 2.5,
                conversion_ratio                REAL    NOT NULL DEFAULT 4.0,
                harvest_fresh_kg                REAL,
                notes                           TEXT,
                created_at                      DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at                      DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)
    print("Database tables created / verified.")


def seed_data() -> None:
    """Seed admin user and 3 starter plans if the DB is empty."""
    with get_db() as conn:
        # --- Seed admin user ---
        existing_admin = conn.execute(
            "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
        ).fetchone()

        if not existing_admin:
            hashed = _hash_pw("Admin@1234")
            conn.execute(
                """
                INSERT INTO users (name, email, hashed_password, credits, role)
                VALUES (?, ?, ?, ?, ?)
                """,
                ("Admin", "admin@cardamo.lk", hashed, 9999, "admin"),
            )
            print("Seeded admin user: admin@cardamo.lk / Admin@1234")

        # --- Seed plans ---
        existing_plans = conn.execute("SELECT COUNT(*) FROM plans").fetchone()[0]

        if existing_plans == 0:
            plans = [
                ("Starter",      500.00,  50),
                ("Professional", 1500.00, 200),
                ("Enterprise",   4000.00, 600),
            ]
            conn.executemany(
                "INSERT INTO plans (name, price, total_credits) VALUES (?, ?, ?)",
                plans,
            )
            print("Seeded 3 starter plans: Starter, Professional, Enterprise.")
