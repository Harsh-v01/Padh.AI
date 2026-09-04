import json
import re
from typing import Optional

from services.groqService import groq_chat


def _clean_json(text: str) -> str:
    cleaned = (text or "").strip()
    match = re.search(r"```(?:json)?\s*(.*?)\s*```", cleaned, re.DOTALL | re.IGNORECASE)
    return (match.group(1) if match else cleaned).strip()


async def _ask(prompt: str, max_tokens: int = 900):
    return await groq_chat(
        [{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=max_tokens,
    )


def _difficulty(level: int) -> tuple[str, str]:
    return {
        1: ("EASY", "basic understanding and definitions"),
        2: ("MEDIUM", "application and reasoning"),
        3: ("HARD", "deep analysis and critical thinking"),
    }.get(level, ("EASY", "basic understanding and definitions"))


def _fallback(text: str):
    base = " ".join((text or "this topic").split())[:80] or "this topic"
    return {"questions": [
        f"What is the main idea related to {base}?",
        f"How would you explain {base} in simple terms?",
        f"Why is {base} important?",
        f"Where could the ideas in {base} be applied?",
        f"What is one common misconception about {base}?",
    ]}


async def generate_questions(
    input_text: str,
    difficulty_level: int = 1,
    existing_questions: Optional[list[str]] = None,
):
    label, instruction = _difficulty(difficulty_level)
    existing = "\n".join(f"- {q}" for q in (existing_questions or [])) or "None"

    prompt = f"""
Generate EXACTLY 5 conceptual study questions.

Difficulty: {label}
Focus: {instruction}

Use ONLY the supplied learning material.
Avoid repeating these existing questions:
{existing}

Learning material:
{input_text[:12000]}

Return ONLY valid JSON:
{{"questions":["Q1","Q2","Q3","Q4","Q5"]}}
"""
    try:
        result = await _ask(prompt)
        data = json.loads(_clean_json(result))
        if isinstance(data.get("questions"), list) and len(data["questions"]) == 5:
            return {"questions": [str(q).strip() for q in data["questions"]]}
    except Exception as exc:
        print("[CONCEPTUAL JSON ERROR]", exc)

    return _fallback(input_text)


async def evaluate_answer(question: str, answer: str):
    prompt = f"""
Evaluate the student's answer against the question.

Question: {question}
Student answer: {answer}

Return ONLY JSON:
{{
  "correctness": "Correct/Partially Correct/Incorrect",
  "percentage": 0-100,
  "wrong": "what is missing or incorrect",
  "correct_answer": "concise model answer",
  "feedback": "short actionable feedback"
}}
"""
    try:
        return json.loads(_clean_json(await _ask(prompt, 700)))
    except Exception as exc:
        print("[EVALUATE JSON ERROR]", exc)
        return {
            "correctness": "Unable to evaluate",
            "percentage": 0,
            "wrong": "Evaluation failed.",
            "correct_answer": "",
            "feedback": "Please try again.",
        }


async def rewrite_answer(answer: str):
    result = await _ask(f"Improve this student's answer while preserving its meaning:\n\n{answer}", 700)
    return {"rewritten": result or answer}
