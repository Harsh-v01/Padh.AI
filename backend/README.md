# Backend Service (Separate Folder)

This folder is reserved for the backend API that powers document ingestion, OCR, plagiarism checking,
summary generation, quiz creation, and persistence. Keep backend services and configuration here so
the frontend can remain a clean, Vite-only UI layer.

Planned endpoints:

- `POST /documents` → upload + extract text
- `POST /documents/:id/plagiarism` → run plagiarism scan
- `POST /documents/:id/summary` → generate summary
- `POST /documents/:id/questions` → generate quiz + previous-year questions
- `GET /documents/:id/results` → fetch processed outputs

Use this space for the Node/Python service when ready.
