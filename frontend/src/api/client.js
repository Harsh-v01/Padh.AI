const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to upload document.');
  }

  return response.json();
}

export async function fetchRecentDocuments() {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: 'GET'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch documents.');
  }

  return response.json();
}
