import os
from typing import List

from fastapi import UploadFile
from pypdf import PdfReader

from services.documind_rag import chunk_text


TEMP_UPLOAD_DIRECTORY = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data",
    "uploads",
)


def validate_pdf(file: UploadFile, max_size_mb: int = 200):
    if not file.filename:
        raise ValueError("A filename is required.")
    if not file.filename.lower().endswith(".pdf"):
        raise ValueError("Only PDF files are supported by the document processor.")

    current = file.file.tell()
    file.file.seek(0, os.SEEK_END)
    size_mb = file.file.tell() / (1024 * 1024)
    file.file.seek(current)

    if size_mb > max_size_mb:
        raise ValueError(f"PDF exceeds the {max_size_mb} MB limit.")


async def save_uploaded_file(file: UploadFile) -> str:
    os.makedirs(TEMP_UPLOAD_DIRECTORY, exist_ok=True)
    validate_pdf(file)

    safe_name = os.path.basename(file.filename)
    file_path = os.path.join(TEMP_UPLOAD_DIRECTORY, safe_name)

    # Avoid collisions when two users upload the same filename.
    stem, ext = os.path.splitext(safe_name)
    counter = 1
    while os.path.exists(file_path):
        file_path = os.path.join(TEMP_UPLOAD_DIRECTORY, f"{stem}_{counter}{ext}")
        counter += 1

    content = await file.read()
    with open(file_path, "wb") as output:
        output.write(content)

    return file_path


def load_document_from_path(file_path: str):
    reader = PdfReader(file_path)
    documents = []
    for page_number, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        if text.strip():
            documents.append(
                {
                    "page_content": text,
                    "metadata": {
                        "source": file_path,
                        "page": page_number,
                    },
                }
            )
    return documents


def split_document_into_chunks(documents):
    chunks = []
    for doc in documents:
        for text in chunk_text(doc["page_content"], chunk_size=500, overlap=50):
            chunks.append(
                {
                    "page_content": text,
                    "metadata": dict(doc["metadata"]),
                }
            )
    return chunks
