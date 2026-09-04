import json
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "padh_ai.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)


def _supabase():
    try:
        from services.supabaseClient import supabase_admin
        return supabase_admin
    except Exception:
        return None


def _use_supabase() -> bool:
    return bool(os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_SERVICE_KEY"))


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    connection = get_connection()
    connection.executescript("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        file_name TEXT NOT NULL,
        file_path TEXT,
        file_url TEXT,
        plagiarism_score REAL DEFAULT 0,
        content TEXT DEFAULT '',
        created_at TEXT NOT NULL
    );
    """)
    connection.commit()
    connection.close()


def create_document(
    file_name: str,
    file_path: str,
    content: str,
    plagiarism_score: float = 0.0,
    user_id: Optional[str] = None,
    file_url: Optional[str] = None,
) -> str:
    document_id = str(uuid.uuid4())

    if _use_supabase():
        payload = {
            "id": document_id,
            "user_id": user_id,
            "file_name": file_name,
            "file_path": file_path,
            "file_url": file_url,
            "plagiarism_score": plagiarism_score,
            "content": content,
        }
        res = _supabase().table("documents").insert(payload).execute()
        if getattr(res, "data", None):
            return str(res.data[0]["id"])

    connection = get_connection()
    connection.execute(
        """INSERT INTO documents
           (id,user_id,file_name,file_path,file_url,plagiarism_score,content,created_at)
           VALUES (?,?,?,?,?,?,?,?)""",
        (
            document_id,
            user_id,
            file_name,
            file_path,
            file_url,
            plagiarism_score,
            content,
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    connection.commit()
    connection.close()
    return document_id


def get_document(document_id: str) -> Optional[dict]:
    if _use_supabase():
        try:
            res = _supabase().table("documents").select("*").eq("id", str(document_id)).single().execute()
            if getattr(res, "data", None):
                return res.data
        except Exception as exc:
            print("[SUPABASE GET DOCUMENT ERROR]", exc)

    connection = get_connection()
    row = connection.execute("SELECT * FROM documents WHERE id = ?", (str(document_id),)).fetchone()
    connection.close()
    return dict(row) if row else None


def get_all_documents(user_id: Optional[str] = None) -> list[dict]:
    if _use_supabase():
        try:
            query = _supabase().table("documents").select("*").order("created_at", desc=True)
            if user_id:
                query = query.eq("user_id", user_id)
            res = query.execute()
            return res.data or []
        except Exception as exc:
            print("[SUPABASE LIST DOCUMENTS ERROR]", exc)

    connection = get_connection()
    if user_id:
        rows = connection.execute(
            "SELECT * FROM documents WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC",
            (user_id,),
        ).fetchall()
    else:
        rows = connection.execute("SELECT * FROM documents ORDER BY created_at DESC").fetchall()
    connection.close()
    return [dict(row) for row in rows]


def delete_document(document_id: str, user_id: Optional[str] = None) -> bool:
    if _use_supabase():
        try:
            query = _supabase().table("documents").delete().eq("id", str(document_id))
            if user_id:
                query = query.eq("user_id", user_id)
            res = query.execute()
            return bool(getattr(res, "data", None))
        except Exception as exc:
            print("[SUPABASE DELETE DOCUMENT ERROR]", exc)

    connection = get_connection()
    if user_id:
        cur = connection.execute("DELETE FROM documents WHERE id = ? AND (user_id = ? OR user_id IS NULL)",
                                 (str(document_id), user_id))
    else:
        cur = connection.execute("DELETE FROM documents WHERE id = ?", (str(document_id),))
    connection.commit()
    deleted = cur.rowcount > 0
    connection.close()
    return deleted


init_db()
