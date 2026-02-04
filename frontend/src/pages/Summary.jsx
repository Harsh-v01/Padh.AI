import { useState } from 'react';
import { generateSummary } from '../api/client';

function Summary() {
  const [documentId, setDocumentId] = useState('');
  const [question, setQuestion] = useState('');
  const [status, setStatus] = useState('idle');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const response = await generateSummary({
        documentId: documentId.trim(),
        question: question.trim()
      });
      setSummary(response?.summary || 'Summary generated, but no text was returned.');
      setStatus('success');
    } catch (summaryError) {
      setError(summaryError.message || 'Unable to generate summary.');
      setStatus('error');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>AI Summary</h1>
      <p>Generate a structured summary grounded in your uploaded content.</p>

      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="summary-document-id">Document ID</label>
          <input
            id="summary-document-id"
            type="text"
            value={documentId}
            onChange={(event) => setDocumentId(event.target.value)}
            placeholder="e.g. doc_123"
            style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="summary-question">Focus (optional)</label>
          <textarea
            id="summary-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What should the summary focus on?"
            style={{ display: 'block', width: '100%', marginTop: '0.5rem', minHeight: '120px' }}
          />
        </div>
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Generating...' : 'Generate Summary'}
        </button>
      </form>

      {error && (
        <p style={{ marginTop: '1rem', color: '#c53030' }}>{error}</p>
      )}

      {summary && (
        <div style={{ marginTop: '1.5rem' }}>
          <h2>Summary Output</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{summary}</p>
        </div>
      )}
    </div>
  );
}

export default Summary;
