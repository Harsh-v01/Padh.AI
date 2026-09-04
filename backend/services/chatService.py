from typing import List

from services.groqService import groq_chat


ASSISTANT_SYSTEM = """
You are Padh.AI, a Socratic learning assistant for students.

When a student asks a question:
1. First understand what they already know when the question is conceptual.
2. Correct misconceptions clearly.
3. When document context is supplied, ground claims in that context and never fabricate document facts.
4. Explain difficult ideas in simple language, using examples when useful.
5. Encourage active learning rather than blindly giving answers.
6. End with one useful bonus insight when appropriate.

Be concise, friendly and student-friendly.
"""


async def socratic_chat(messages: List[dict]) -> str:
    try:
        api_messages = [{"role": "system", "content": ASSISTANT_SYSTEM}] + messages
        return await groq_chat(
            api_messages,
            temperature=0.5,
            max_tokens=700,
        )
    except Exception as exc:
        print("[CHAT SERVICE ERROR]", exc)
        raise
