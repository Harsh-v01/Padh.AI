from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.conceptualService import (
    generate_questions,
    evaluate_answer,
    rewrite_answer,
)
from services.databaseService import get_document
from services.documind_rag import document_context

router = APIRouter()


class Req(BaseModel):
    topic: Optional[str] = ""
    question: Optional[str] = ""
    answer: Optional[str] = ""
    current_questions: List[str] = []
    document_id: Optional[str] = None
    difficulty_level: Optional[int] = 1


def _context(req: Req) -> str:
    if not req.document_id:
        return req.topic or ""

    doc = get_document(req.document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        rag_context = document_context(
            req.document_id,
            purpose="generate conceptual questions from important concepts, definitions, relationships and applications",
            k=8,
        )
    except Exception as exc:
        print("[CONCEPTUAL RAG ERROR]", exc)
        rag_context = ""

    return rag_context or doc.get("content", "")


@router.post("/generate")
async def gen(req: Req):
    text = _context(req)
    if not text.strip():
        raise HTTPException(status_code=400, detail="No input provided")
    return await generate_questions(text, req.difficulty_level)


@router.post("/generate-more")
async def gen_more(req: Req):
    text = _context(req)
    if not text.strip():
        raise HTTPException(status_code=400, detail="No input provided")
    return await generate_questions(
        text,
        req.difficulty_level,
        existing_questions=req.current_questions,
    )


@router.post("/evaluate")
async def eval(req: Req):
    if not req.question or not req.answer:
        raise HTTPException(status_code=400, detail="Question and answer required")
    return await evaluate_answer(req.question, req.answer)


@router.post("/rewrite")
async def rewrite(req: Req):
    if not req.answer:
        raise HTTPException(status_code=400, detail="Answer required")
    return await rewrite_answer(req.answer)
