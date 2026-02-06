import { useState } from 'react';
import { sendAssistantMessage } from '../api/client';

function Assistant() {
  const [documentId, setDocumentId] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }

    const userMessage = { role: 'user', content: message.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setStatus('loading');
    setError('');

    try {
      const response = await sendAssistantMessage({
        documentId: documentId.trim(),
        message: userMessage.content
      });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response?.reply || 'Assistant responded.' }
      ]);
      setStatus('success');
    } catch (assistantError) {
      setError(assistantError.message || 'Unable to reach assistant.');
      setStatus('error');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>AI Assistant</h1>
      <p>Chat with the assistant, grounded in your uploaded content.</p>

      <div style={{ marginTop: '1.5rem' }}>
        <label htmlFor="assistant-document-id">Document ID (optional)</label>
        <input
          id="assistant-document-id"
          type="text"
          value={documentId}
          onChange={(event) => setDocumentId(event.target.value)}
          placeholder="e.g. doc_123"
          style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
        />
      </div>

      <div style={{ marginTop: '1.5rem', minHeight: '200px' }}>
        {messages.length === 0 ? (
          <p>No messages yet. Ask a question to get started.</p>
        ) : (
          messages.map((entry, index) => (
            <div key={`${entry.role}-${index}`} style={{ marginBottom: '1rem' }}>
              <strong>{entry.role === 'user' ? 'You' : 'Assistant'}:</strong>
              <p style={{ marginTop: '0.25rem' }}>{entry.content}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask a question about your document..."
          style={{ width: '100%', minHeight: '120px' }}
        />
        <button type="submit" disabled={status === 'loading'} style={{ marginTop: '1rem' }}>
          {status === 'loading' ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {error && (
        <p style={{ marginTop: '1rem', color: '#c53030' }}>{error}</p>
      )}
    </div>
  );
}

export default Assistant;
