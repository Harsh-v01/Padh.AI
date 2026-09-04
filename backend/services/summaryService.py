from services.groqService import groq_chat
from services.documind_rag import document_context


SUMMARY_SYSTEM = """
You are an expert document summarizer for Padh.AI.

Create a student-friendly, accurate summary grounded in the supplied document context.
Use this exact structure:

## Summary
2-4 sentences explaining the document's central idea.

## Key Points
- Important point
- Important point
- Important point

Do not invent information. If the supplied context is incomplete, summarize only what it supports.
"""


async def summarize_document(document_name: str, content: str, document_id: str | None = None) -> str:
    context = ""
    if document_id:
        try:
            context = document_context(
                document_id,
                purpose="identify the main ideas, definitions, arguments, processes and important facts",
                k=16,
            )
        except Exception as exc:
            print("[SUMMARY RAG ERROR]", exc)

    if not context:
        context = content[:14000]

    user = (
        f'Document title: "{document_name}"\n\n'
        "Document context:\n"
        f"{context[:14000]}"
    )

    return await groq_chat(
        [
            {"role": "system", "content": SUMMARY_SYSTEM},
            {"role": "user", "content": user},
        ],
        temperature=0.3,
        max_tokens=2048,
    )
