from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.summaryService import summarize_document
from services.databaseService import get_document

router = APIRouter()


class SummaryRequest(BaseModel):
    document_id: str


@router.post("/")
async def summary(req: SummaryRequest):
    try:
        doc = get_document(req.document_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        content = doc.get("content") or ""
        if not content.strip():
            raise HTTPException(status_code=400, detail="Document content is empty")

        return {
            "summary": await summarize_document(
                doc.get("file_name", "Document"),
                content,
                document_id=str(req.document_id),
            )
        }
    except HTTPException:
        raise
    except Exception as exc:
        print("[SUMMARY ERROR]", exc)
        raise HTTPException(status_code=500, detail=str(exc))
