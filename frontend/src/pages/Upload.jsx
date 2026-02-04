import { useState } from 'react';
import { uploadDocument } from '../api/client';
import { useDocuments } from '../context/DocumentsContext';

function Upload() {
  const { addDocument } = useDocuments();
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0] || null);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please choose a file before uploading.');
      return;
    }

    setStatus('uploading');
    setError('');

    try {
      const response = await uploadDocument(selectedFile);
      const doc = response?.document || {
        id: Date.now(),
        name: selectedFile.name,
        date: new Date().toISOString().split('T')[0],
        type: selectedFile.name.split('.').pop()?.toLowerCase() || 'file'
      };
      addDocument(doc);
      setStatus('success');
    } catch (uploadError) {
      setError(uploadError.message || 'Upload failed.');
      setStatus('error');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Upload Document</h1>
      <p>Upload a document to start the AI processing pipeline.</p>

      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          onChange={handleFileChange}
        />
        <div style={{ marginTop: '1rem' }}>
          <button type="submit" disabled={status === 'uploading'}>
            {status === 'uploading' ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>

      {status === 'success' && (
        <p style={{ marginTop: '1rem', color: '#2f855a' }}>
          Upload complete! Your document is ready for summaries and quizzes.
        </p>
      )}

      {error && (
        <p style={{ marginTop: '1rem', color: '#c53030' }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default Upload;
