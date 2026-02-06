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
  const { documents, upsertDocument, updateDocument } = useDocuments();
  const [selectedId, setSelectedId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [retrievalQuery, setRetrievalQuery] = useState('');
  const [retrievalResults, setRetrievalResults] = useState([]);
  const [generationOutput, setGenerationOutput] = useState('');
  const [structuredSummary, setStructuredSummary] = useState([]);
  const [quizOutput, setQuizOutput] = useState([]);

  const selectedDocument = useMemo(
    () => documents.find((doc) => doc.id === selectedId),
    [documents, selectedId]
  );

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
      content: content || `Extracted text placeholder for ${selectedFile.name}.`
    };
    upsertDocument(doc);
    setSelectedId(doc.id);
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
    setQuizOutput(generateQuizFromText(baseText, 5));
  };

  const plagiarismScore = selectedDocument?.content
    ? calculatePlagiarismScore(selectedDocument.content)
    : null;

  return (
    <div className="workspace">
      <div className="workspace-header">
        <div>
          <h2>Learning Pipeline Workspace</h2>
          <p>Follow phases 1 to 6 to transform documents into structured learning assets.</p>
        </div>
        <div className="workspace-select">
          <label htmlFor="document-select">Active Document</label>
          <select
            id="document-select"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
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
        <section id="phase-1-upload" className="workspace-card">
          <h3>Phase 1 · Document Ingestion</h3>
          <p>Upload documents, extract text, and validate originality.</p>
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
            {plagiarismScore !== null && (
              <span>Plagiarism check: {plagiarismScore}% overlap</span>
            )}
          </div>
        </section>

        <section id="phase-2-clean" className="workspace-card">
          <h3>Phase 2 · Cleaning & Chunking</h3>
          <p>Normalize text and split it into learning-sized chunks.</p>
          <button type="button" onClick={handleCleanAndChunk}>
            Run Cleaning + Chunking
          </button>
          <div className="workspace-meta">
            <span>Chunks: {selectedDocument?.chunks?.length || 0}</span>
            <span>Cleaned length: {selectedDocument?.cleanedContent?.length || 0}</span>
          </div>
        </section>

        <section id="phase-3-embed" className="workspace-card">
          <h3>Phase 3 · Embeddings & Storage</h3>
          <p>Create vector representations for semantic search readiness.</p>
          <button type="button" onClick={handleEmbeddings}>
            Generate Embeddings
          </button>
          <div className="workspace-meta">
            <span>Embedding rows: {selectedDocument?.embeddings?.length || 0}</span>
          </div>
        </section>

        <section id="phase-4-retrieval" className="workspace-card">
          <h3>Phase 4 · Retrieval</h3>
          <p>Find the most relevant chunks using similarity search.</p>
          <div className="workspace-form">
            <input
              type="text"
              placeholder="Ask a question..."
              value={retrievalQuery}
              onChange={(event) => setRetrievalQuery(event.target.value)}
            />
            <button type="button" onClick={handleRetrieval}>
              Retrieve Top Chunks
            </button>
          </div>
          <ul className="workspace-list">
            {retrievalResults.map((result, index) => (
              <li key={`${result.score}-${index}`}>
                <strong>Score {result.score.toFixed(2)}</strong>
                <p>{result.chunk}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="phase-5-rag" className="workspace-card">
          <h3>Phase 5 · Augmented Generation</h3>
          <p>Generate grounded answers with retrieved context.</p>
          <button type="button" onClick={handleGeneration}>
            Generate Grounded Answer
          </button>
          {generationOutput && <pre className="workspace-output">{generationOutput}</pre>}
        </section>

        <section id="phase-6-structure" className="workspace-card">
          <h3>Phase 6 · Structured Output</h3>
          <p>Deliver summaries and quizzes that are exam-ready.</p>
          <button type="button" onClick={handleStructuredOutput}>
            Build Structured Output
          </button>
          {structuredSummary.length > 0 && (
            <div className="workspace-output">
              <h4>Summary</h4>
              <ol>
                {structuredSummary.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </div>
          )}
          {quizOutput.length > 0 && (
            <div className="workspace-output">
              <h4>Quiz</h4>
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
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default LearningWorkspace;
