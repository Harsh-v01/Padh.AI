"""
Padh.AI's integrated DocuMind RAG engine.

Pipeline:
PDF -> text extraction -> overlapping chunks -> local embeddings -> ChromaDB
-> similarity retrieval -> grounded LLM prompts.

The vector store is intentionally local so there is no per-query vector database bill.
Supabase remains the application database/storage layer.
"""

import os
import re
import hashlib
from pathlib import Path
from typing import Any, Optional

DATA_DIR = Path(os.path.dirname(os.path.dirname(__file__))) / "data"
VECTOR_DIR = Path(os.getenv("DOCUMIND_VECTORSTORE_DIR", DATA_DIR / "documind_chroma"))
EMBEDDING_MODEL = os.getenv("DOCUMIND_EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L12-v2")
COLLECTION_NAME = os.getenv("DOCUMIND_COLLECTION", "padh_ai_documents")

_embedder = None
_chroma = None


def _imports():
    global _embedder, _chroma
    if _embedder is None:
        from sentence_transformers import SentenceTransformer
        _embedder = SentenceTransformer(EMBEDDING_MODEL)
    if _chroma is None:
        import chromadb
        VECTOR_DIR.mkdir(parents=True, exist_ok=True)
        _chroma = chromadb.PersistentClient(path=str(VECTOR_DIR))
    return _embedder, _chroma


def _collection():
    _, client = _imports()
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """
    DocuMind-style overlapping chunks. We use words as a stable, dependency-light
    approximation of token chunks so the backend remains easy to run on Windows.
    """
    words = normalize_text(text).split()
    if not words:
        return []
    step = max(1, chunk_size - overlap)
    chunks = []
    for start in range(0, len(words), step):
        chunk = " ".join(words[start:start + chunk_size])
        if chunk:
            chunks.append(chunk)
        if start + chunk_size >= len(words):
            break
    return chunks


def _doc_namespace(document_id: str) -> str:
    return hashlib.sha256(str(document_id).encode()).hexdigest()[:16]


def index_document(document_id: str, text: str, file_name: str = "") -> int:
    chunks = chunk_text(text)
    if not chunks:
        return 0

    embedder, _ = _imports()
    collection = _collection()
    namespace = _doc_namespace(document_id)

    # Re-indexing the same document should replace its previous chunks.
    try:
        collection.delete(where={"document_id": str(document_id)})
    except Exception:
        pass

    embeddings = embedder.encode(chunks, normalize_embeddings=True).tolist()
    ids = [f"{namespace}-{i}" for i in range(len(chunks))]
    metadatas = [
        {
            "document_id": str(document_id),
            "file_name": file_name or "Document",
            "chunk_index": i,
        }
        for i in range(len(chunks))
    ]

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas,
    )
    return len(chunks)


def retrieve(
    query: str,
    document_id: Optional[str] = None,
    k: int = 5,
) -> list[dict[str, Any]]:
    if not normalize_text(query):
        return []

    embedder, _ = _imports()
    collection = _collection()
    where = {"document_id": str(document_id)} if document_id is not None else None

    count = collection.count()
    if count == 0:
        return []

    query_embedding = embedder.encode([query], normalize_embeddings=True).tolist()
    result = collection.query(
        query_embeddings=query_embedding,
        n_results=min(k, count),
        where=where,
        include=["documents", "metadatas", "distances"],
    )

    docs = (result.get("documents") or [[]])[0]
    metas = (result.get("metadatas") or [[]])[0]
    distances = (result.get("distances") or [[]])[0]

    return [
        {
            "text": docs[i],
            "metadata": metas[i] if i < len(metas) else {},
            "distance": distances[i] if i < len(distances) else None,
        }
        for i in range(len(docs))
    ]


def document_context(
    document_id: str,
    purpose: str = "answer the student's question",
    k: int = 8,
) -> str:
    results = retrieve(
        query=f"important information needed to {purpose}",
        document_id=document_id,
        k=k,
    )
    if not results:
        return ""

    # Put chunks back in document order for more coherent prompts.
    results.sort(key=lambda item: item.get("metadata", {}).get("chunk_index", 0))
    return "\n\n".join(
        f"[Document chunk {i + 1}]\n{item['text']}"
        for i, item in enumerate(results)
    )


def delete_document_index(document_id: str) -> None:
    try:
        _collection().delete(where={"document_id": str(document_id)})
    except Exception as exc:
        print("[RAG DELETE ERROR]", exc)
