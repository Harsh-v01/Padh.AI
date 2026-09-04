import io
import os
import uuid

import aiofiles
from fastapi import APIRouter, UploadFile, File, HTTPException
from pypdf import PdfReader

from services.databaseService import create_document
from services.documind_rag import index_document
from services.plagiarismService import (
    check_plagiarism,
    PLAGIARISM_THRESHOLD,
    PLAGIARISM_MAX_CHARS_FOR_CHECK,
    PLAGIARISM_FAIL_OPEN_ON_BALANCE_ERROR,
    is_balance_error,
)
from services.ocrService import extract_text_from_image
from services.supabaseClient import supabase_admin
from utils.auth import get_current_user

router = APIRouter()


async def _save_local(file_bytes: bytes, filename: str) -> str:
    upload_directory = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "data", "uploads"
    )
    os.makedirs(upload_directory, exist_ok=True)
    safe_name = os.path.basename(filename or "document")
    file_path = os.path.join(upload_directory, f"{uuid.uuid4()}_{safe_name}")
    async with aiofiles.open(file_path, "wb") as output_file:
        await output_file.write(file_bytes)
    return file_path


def _supabase_upload(file_bytes: bytes, filename: str, user_id: str | None):
    if not supabase_admin:
        return None, None

    folder = user_id or "guest"
    file_path = f"{folder}/{uuid.uuid4()}_{os.path.basename(filename or 'document')}"
    result = supabase_admin.storage.from_("documents").upload(
        file_path,
        file_bytes,
        {"content-type": "application/pdf" if filename.lower().endswith(".pdf") else "application/octet-stream"},
    )
    if hasattr(result, "error") and result.error:
        raise RuntimeError(str(result.error))

    # The bucket is configured as public by the supplied schema.sql.
    public_url = supabase_admin.storage.from_("documents").get_public_url(file_path)
    return file_path, public_url


@router.post("/")
async def upload_file(file: UploadFile = File(...), user=__import__("fastapi").Depends(get_current_user)):
    try:
        filename = os.path.basename(file.filename or "document")
        file_bytes = await file.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        text_content = ""

        if filename.lower().endswith(".pdf"):
            try:
                reader = PdfReader(io.BytesIO(file_bytes))
                text_content = "\n\n".join(
                    page.extract_text() or "" for page in reader.pages
                )
            except Exception as exc:
                print("[PDF ERROR]", exc)

            if not text_content.strip():
                try:
                    text_content = extract_text_from_image(file_bytes, "application/pdf")
                except Exception as exc:
                    print("[OCR FALLBACK ERROR]", exc)

        elif file.content_type and file.content_type.startswith("image/"):
            text_content = extract_text_from_image(file_bytes, file.content_type)
        else:
            text_content = file_bytes.decode(errors="ignore")

        full_text = text_content.strip()

        if full_text:
            try:
                plagiarism_score = await check_plagiarism(
                    full_text[:PLAGIARISM_MAX_CHARS_FOR_CHECK]
                )
            except HTTPException as exc:
                detail = str(exc.detail).lower()
                if PLAGIARISM_FAIL_OPEN_ON_BALANCE_ERROR and is_balance_error(detail):
                    plagiarism_score = 0.0
                else:
                    raise
        else:
            plagiarism_score = 0.0

        if plagiarism_score >= PLAGIARISM_THRESHOLD:
            raise HTTPException(status_code=400, detail="High plagiarism detected.")

        user_id = getattr(user, "id", None)

        # Supabase Storage is primary when configured; local storage remains a free fallback.
        storage_path = None
        public_url = None
        if supabase_admin:
            try:
                storage_path, public_url = _supabase_upload(file_bytes, filename, user_id)
            except Exception as exc:
                print("[SUPABASE STORAGE ERROR] Falling back to local storage:", exc)

        local_path = await _save_local(file_bytes, filename)

        document_id = create_document(
            file_name=filename,
            file_path=local_path,
            content=full_text,
            plagiarism_score=plagiarism_score,
            user_id=user_id,
            file_url=public_url,
        )

        # Index the extracted content in the integrated DocuMind vector store.
        chunk_count = 0
        if full_text:
            try:
                chunk_count = index_document(document_id, full_text, filename)
            except Exception as exc:
                # Upload must still succeed if the optional local vector dependencies are unavailable.
                print("[RAG INDEX ERROR]", exc)

        return {
            "message": "Document successfully uploaded and indexed.",
            "file_url": public_url,
            "file_path": local_path,
            "plagiarism_score": plagiarism_score,
            "id": document_id,
            "chunks_indexed": chunk_count,
        }

    except HTTPException:
        raise
    except Exception as exc:
        print("[UPLOAD ERROR]", exc)
        raise HTTPException(status_code=500, detail=str(exc))
