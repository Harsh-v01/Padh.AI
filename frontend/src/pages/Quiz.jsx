import { useState } from 'react';
import { generateQuiz } from '../api/client';

function Quiz() {
  const [documentId, setDocumentId] = useState('');
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [status, setStatus] = useState('idle');
  const [quiz, setQuiz] = useState([]);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const response = await generateQuiz({
        documentId: documentId.trim(),
        topic: topic.trim(),
        count: Number(count)
      });
      setQuiz(response?.questions || []);
      setStatus('success');
    } catch (quizError) {
      setError(quizError.message || 'Unable to generate quiz.');
      setStatus('error');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Practice Quiz</h1>
      <p>Create quiz questions based on your uploaded content.</p>

      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="quiz-document-id">Document ID</label>
          <input
            id="quiz-document-id"
            type="text"
            value={documentId}
            onChange={(event) => setDocumentId(event.target.value)}
            placeholder="e.g. doc_123"
            style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="quiz-topic">Topic (optional)</label>
          <input
            id="quiz-topic"
            type="text"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Topic focus"
            style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="quiz-count">Number of questions</label>
          <input
            id="quiz-count"
            type="number"
            min="1"
            max="20"
            value={count}
            onChange={(event) => setCount(event.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
          />
        </div>
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Generating...' : 'Generate Quiz'}
        </button>
      </form>

      {error && (
        <p style={{ marginTop: '1rem', color: '#c53030' }}>{error}</p>
      )}

      {quiz.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h2>Quiz Output</h2>
          <ol>
            {quiz.map((question, index) => (
              <li key={`${question.id || index}`}>
                <p>{question.prompt || question.question}</p>
                {question.options && (
                  <ul>
                    {question.options.map((option, optionIndex) => (
                      <li key={`${index}-${optionIndex}`}>{option}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default Quiz;
