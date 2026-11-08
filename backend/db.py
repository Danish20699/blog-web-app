import os
import sqlite3
from pathlib import Path
from sqlmodel import Session, create_engine

BASE_DIR = Path(__file__).resolve().parent.parent
DB_DIR = BASE_DIR / "db"
DB_FILENAME = DB_DIR / "blog_app.db"
INIT_SQL_PATH = DB_DIR / "init.sql"

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    user = os.getenv("POSTGRES_USER")
    password = os.getenv("POSTGRES_PASSWORD")
    host = os.getenv("POSTGRES_HOST", "db")
    port = os.getenv("POSTGRES_PORT", "5432")
    db_name = os.getenv("POSTGRES_DB")
    if user and password and db_name:
        DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/{db_name}"

if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL, echo=False)
else:
    engine = create_engine(
        f"sqlite:///{DB_FILENAME}",
        connect_args={"check_same_thread": False},
    )


def init_db():
    if DATABASE_URL:
        from models import SQLModel

        SQLModel.metadata.create_all(engine)
    else:
        DB_DIR.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(DB_FILENAME)
        conn.execute("PRAGMA foreign_keys = ON;")
        root_init_sql = BASE_DIR / "init.sql"
        sql_path = root_init_sql if root_init_sql.exists() else INIT_SQL_PATH
        if sql_path.exists():
            try:
                with open(sql_path, "r", encoding="utf-8") as file:
                    conn.executescript(file.read())
            except Exception:
                pass
        conn.commit()
        conn.close()


def get_session():
    with Session(engine) as session:
        yield session
