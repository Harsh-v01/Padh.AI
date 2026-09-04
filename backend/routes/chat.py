from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.chatService import socratic_chat
from services.databaseService import get_document
from services.documind_rag import retrieve

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    document_id: Optional[str] = None


@router.post("")
async def chat(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="messages required")

    try:
        messages = [{"role": m.role, "content": m.content} for m in req.messages]

        if req.document_id:
            doc = get_document(req.document_id)
            if not doc:
                raise HTTPException(status_code=404, detail="Document not found")

            latest_user = next(
                (m["content"] for m in reversed(messages) if m["role"] == "user"),
                "",
            )
            chunks = retrieve(latest_user, req.document_id, k=5)
            context = "\n\n".join(
                f"[Source {i + 1}]\n{item['text']}" for i, item in enumerate(chunks)
            )

            if context:
                messages.insert(
                    0,
                    {
                        "role": "system",
                        "content": (
                            "Use the retrieved document context below to answer the student's "
                            "question. Do not invent facts that are not supported by it. "
                            "If the document does not contain the answer, say so clearly.\n\n"
                            f"Document: {doc.get('file_name', 'Document')}\n{context}"
                        ),
                    },
                )

        return {"message": await socratic_chat(messages)}

    except HTTPException:
        raise
    except Exception as exc:
        print("[CHAT ERROR]", exc)
        raise HTTPException(status_code=500, detail=str(exc))
