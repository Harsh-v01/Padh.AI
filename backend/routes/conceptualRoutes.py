from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from services.conceptualService import (
    generate_questions,
    evaluate_answer,
    rewrite_answer,
    generate_questions_from_pdf,
    generate_more_questions
)

from services.supabaseClient import supabase_admin
from utils.auth import get_current_user


router = APIRouter()


# ---------------------- REQUEST MODEL ----------------------
class Req(BaseModel):
    topic: str = ""
    question: str = ""
    answer: str = ""
    # content: str = "" 

# -----------------Topic-based question generation------------------
@router.post("/generate")
def gen(req: Req):
    return generate_questions(req.topic)
    
# ----------------PDF-based question generation----------------
@router.post("/generate-pdf")
async def gen_pdf(file: UploadFile = File(...)):
    try:
        file_path = f"temp_{file.filename}"

        with open(file_path, "wb") as f:
            f.write(await file.read())

        return await generate_questions_from_pdf(file_path)

# ----------------Evaluation---------------
@router.post("/evaluate")
def eval(req: Req):
    return evaluate_answer(req.question, req.answer)

# ----------------Rewrite answer---------------
@router.post("/rewrite")
def rewrite(req: Req):
    return rewrite_answer(req.answer)
