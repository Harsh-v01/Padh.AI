import { useMemo, useState } from 'react';
import './LearningWorkspace.css';
import {
  calculatePlagiarismScore,
  chunkText,
  cleanText,
  cosineSimilarity,
  createEmbedding,
  generateQuizFromText,
  generateStructuredSummary
} from '../../utils/pipeline';
import { useDocuments } from '../../context/useDocuments';

function LearningWorkspace() {
  const {
    documents,
    activeDocumentId,
    setActiveDocumentId,
    upsertDocument,
    updateDocument
  } = useDocuments();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [retrievalQuery, setRetrievalQuery] = useState('');
  const [retrievalResults, setRetrievalResults] = useState([]);
  const [generationOutput, setGenerationOutput] = useState('');
  const [structuredSummary, setStructuredSummary] = useState([]);
  const [quizOutput, setQuizOutput] = useState([]);
  const [previousYearOutput, setPreviousYearOutput] = useState([]);

  const selectedDocument = useMemo(
    () => documents.find((doc) => doc.id === activeDocumentId),
    [documents, activeDocumentId]
  );
  const plagiarismScore = selectedDocument?.plagiarismScore ?? null;

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0] || null);
  };

  const readFileText = (file) =>
    new Promise((resolve) => {
      if (!file) {
        resolve('');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result?.toString() || '');
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    const content = await readFileText(selectedFile);
    const doc = {
      id: `${Date.now()}`,
      name: selectedFile.name,
      date: new Date().toISOString().split('T')[0],
      type: selectedFile.name.split('.').pop()?.toLowerCase() || 'file',
      content: content || `Extracted text placeholder for ${selectedFile.name}.`,
      plagiarismScore: calculatePlagiarismScore(content || ''),
      plagiarismFlag: calculatePlagiarismScore(content || '') > 10
    };
    upsertDocument(doc);
    setActiveDocumentId(doc.id);
    setUploadStatus('done');
  };

  const handleCleanAndChunk = () => {
    if (!selectedDocument?.content) {
      return;
    }
    const cleaned = cleanText(selectedDocument.content);
    const chunks = chunkText(cleaned, 120);
    updateDocument(selectedDocument.id, {
      cleanedContent: cleaned,
      chunks
    });
  };

  const handleEmbeddings = () => {
    if (!selectedDocument?.chunks?.length) {
      return;
    }
    const embeddings = selectedDocument.chunks.map((chunk) => createEmbedding(chunk));
    updateDocument(selectedDocument.id, { embeddings });
  };

  const handleRetrieval = () => {
    if (!selectedDocument?.chunks?.length || !selectedDocument?.embeddings?.length) {
      return;
    }
    const queryEmbedding = createEmbedding(retrievalQuery);
    const scored = selectedDocument.embeddings.map((vector, index) => ({
      chunk: selectedDocument.chunks[index],
      score: cosineSimilarity(queryEmbedding, vector)
    }));
    const top = scored.sort((a, b) => b.score - a.score).slice(0, 3);
    setRetrievalResults(top);
  };

  const handleGeneration = () => {
    if (!retrievalResults.length) {
      return;
    }
    const combined = retrievalResults.map((item) => item.chunk).join(' ');
    setGenerationOutput(`Answer grounded in retrieval:\n${combined}`);
  };

  const handleStructuredOutput = () => {
    const baseText =
      selectedDocument?.cleanedContent ||
      selectedDocument?.content ||
      generationOutput;
    if (!baseText) {
      return;
    }
    setStructuredSummary(generateStructuredSummary(baseText));
  };

  const handleQuizOutput = () => {
    const baseText = selectedDocument?.cleanedContent || selectedDocument?.content;
    if (!baseText) {
      return;
    }
    setQuizOutput(generateQuizFromText(baseText, 5));
  };

  const handlePreviousYearOutput = () => {
    const baseText = selectedDocument?.cleanedContent || selectedDocument?.content;
    if (!baseText) {
      return;
    }
    setPreviousYearOutput(generateQuizFromText(baseText, 4));
  };

  const handleFullRun = () => {
    handleCleanAndChunk();
    handleEmbeddings();
    setRetrievalQuery('Key themes and exam focus');
    setTimeout(() => {
      handleRetrieval();
      handleGeneration();
      handleStructuredOutput();
      handleQuizOutput();
      handlePreviousYearOutput();
    }, 200);
  };

  const canProcess = selectedDocument?.plagiarismScore != null && !selectedDocument?.plagiarismFlag;

  return (
    <div className="workspace">
      <div className="workspace-header">
        <div>
          <h2>Processing Workspace</h2>
          <p>
            Upload a document, check originality, and then choose what you want to generate.
          </p>
        </div>
        <div className="workspace-select">
          <label htmlFor="document-select">Active Document</label>
          <select
            id="document-select"
            value={activeDocumentId}
            onChange={(event) => setActiveDocumentId(event.target.value)}
          >
            <option value="">Select a document</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="workspace-grid">
        <section id="section-upload" className="workspace-card">
          <h3>Upload Document</h3>
          <p>Upload files and extract text automatically.</p>
          <form onSubmit={handleUpload} className="workspace-form">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
            <button type="submit">Upload & Extract</button>
          </form>
          <div className="workspace-meta">
            <span>Status: {uploadStatus}</span>
            <span>Extracted characters: {selectedDocument?.content?.length || 0}</span>
          </div>
        </section>

        <section id="section-plagiarism" className="workspace-card">
          <h3>Plagiarism Status</h3>
          <p>Originality is checked automatically after upload.</p>
          <div className="workspace-meta">
            <span>Similarity score: {plagiarismScore ?? '--'}%</span>
            <span className={selectedDocument?.plagiarismFlag ? 'danger' : 'safe'}>
              {selectedDocument?.plagiarismScore === undefined
                ? 'Upload a document to check plagiarism'
                : selectedDocument?.plagiarismFlag
                ? 'Plagiarism detected - processing stopped'
                : 'Clear to proceed'}
            </span>
          </div>
        </section>

        <section id="section-generation" className="workspace-card">
          <h3>Choose What to Generate</h3>
          <p>Pick the outputs you want once originality is verified.</p>
          <div className="workspace-actions">
            <button type="button" onClick={handleStructuredOutput} disabled={!canProcess}>
              Generate Summary
            </button>
            <button type="button" onClick={handleQuizOutput} disabled={!canProcess}>
              Generate Quiz
            </button>
            <button type="button" onClick={handlePreviousYearOutput} disabled={!canProcess}>
              Previous-Year Questions
            </button>
            <button type="button" onClick={handleFullRun} disabled={!canProcess}>
              Run Full Flow
            </button>
          </div>
          {!canProcess && (
            <p className="workspace-muted">Processing options unlock after a clean plagiarism check.</p>
          )}
          {generationOutput && <pre className="workspace-output">{generationOutput}</pre>}
        </section>

        <section id="section-dashboard" className="workspace-card workspace-card-wide">
          <div className="dashboard-header">
            <div>
              <h3>Dashboard Outputs</h3>
              <p>Summary, quiz questions, and previous-year style questions.</p>
            </div>
            <div className="dashboard-meta">
              <span>Storage: {structuredSummary.length ? 'Saved' : 'Pending'}</span>
              <span>Last update: {selectedDocument?.date || '--'}</span>
            </div>
          </div>
          <div className="dashboard-grid">
            <div className="workspace-output">
              <h4>Summary</h4>
              {structuredSummary.length > 0 ? (
                <ol>
                  {structuredSummary.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ol>
              ) : (
                <p>No summary generated yet.</p>
              )}
            </div>
            <div className="workspace-output">
              <h4>Quiz Questions</h4>
              {quizOutput.length > 0 ? (
                <ol>
                  {quizOutput.map((question) => (
                    <li key={question.id}>
                      <p>{question.question}</p>
                      <ul>
                        {question.options.map((option) => (
                          <li key={option}>{option}</li>
                        ))}
                      </ul>
                      <p className="workspace-answer">Answer: {question.answer}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>No quiz generated yet.</p>
              )}
            </div>
            <div className="workspace-output">
              <h4>Previous-Year Style Questions</h4>
              {previousYearOutput.length > 0 ? (
                <ol>
                  {previousYearOutput.map((question) => (
                    <li key={question.id}>
                      <p>{question.question}</p>
                      <p className="workspace-answer">Answer: {question.answer}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>No previous-year questions generated yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LearningWorkspace;
