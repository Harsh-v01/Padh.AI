# Padh.AI + DocuMind + Supabase integration

This version keeps the existing Padh.AI frontend/UI and moves document intelligence into the backend.

## Architecture

Browser
  -> Padh.AI FastAPI backend
      -> Supabase (documents + Storage, when configured)
      -> DocuMind RAG engine
          -> local ChromaDB
          -> Sentence Transformers embeddings
      -> Groq/Gemini for generation

The vector database is local by design. This avoids paying for a hosted vector database.
Supabase is used for your application data and file storage.

## What is now document-aware

- Upload and text extraction
- Document indexing into ChromaDB
- Assistant/chat retrieval
- Document summaries
- Conceptual question generation
- Quiz generation
- Generate-more quiz questions
- Document deletion removes its vector index

## Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Put your own Supabase URL, anon key and service-role key in it.
3. Put your Groq key in `GROQ_API_KEY`.
4. Run `backend/supabase/schema.sql` in the Supabase SQL editor.
5. From `backend` install dependencies:

   `pip install -r requirements.txt`

6. Start:

   `uvicorn main:app --reload --port 8000`

7. Start the existing frontend normally.

The first document indexing run downloads the embedding model if it is not already cached.

## Important security rule

`SUPABASE_SERVICE_KEY` is backend-only. Never put it in the React/Vite frontend or commit it to Git.
