const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || 'Request failed.');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  return request('/documents', {
    method: 'POST',
    body: formData
  });
}

export async function fetchRecentDocuments() {
  return request('/documents', { method: 'GET' });
}

export async function generateSummary({ documentId, question }) {
  return request('/summaries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, question })
  });
}

export async function generateQuiz({ documentId, topic, count }) {
  return request('/quizzes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, topic, count })
  });
}

export async function sendAssistantMessage({ documentId, message }) {
  return request('/assistant/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, message })
  });
}
