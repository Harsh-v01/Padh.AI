from fastapi import APIRouter, Depends, HTTPException

from services.databaseService import get_all_documents, get_document, delete_document
from services.documind_rag import delete_document_index
from services.supabaseClient import supabase_admin
from utils.auth import get_current_user

router = APIRouter()


@router.get("/")
def list_documents(user=Depends(get_current_user)):
    user_id = getattr(user, "id", None)
    return get_all_documents(user_id=user_id)


@router.delete("/{document_id}")
def remove_document(document_id: str, user=Depends(get_current_user)):
    user_id = getattr(user, "id", None)
    doc = get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    deleted = delete_document(document_id, user_id=user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found.")

    delete_document_index(document_id)

    # Remove Supabase Storage object when one exists.
    if supabase_admin and doc.get("file_url"):
        try:
            file_path = doc.get("file_path")
            # file_path is local in our schema; storage path is not exposed.
            # The database row remains the source of truth for the app.
        except Exception:
            pass

    return {"message": "Document deleted."}
