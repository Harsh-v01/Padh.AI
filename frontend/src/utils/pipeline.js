export function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\S\r\n]+/g, ' ')
    .trim();
}

export function chunkText(text, chunkSize = 400) {
  const words = text.split(' ');
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  return chunks;
}

export function createEmbedding(text) {
  const base = [0, 0, 0, 0, 0, 0, 0, 0];
  const normalized = text.toLowerCase();
  for (const char of normalized) {
    const index = char.charCodeAt(0) % base.length;
    base[index] += 1;
  }
  return base;
}

export function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, value, index) => sum + value * b[index], 0);
  const magA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const magB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  if (!magA || !magB) {
    return 0;
  }
  return dot / (magA * magB);
}

export function generateStructuredSummary(text) {
  const sentences = text.split('. ').filter(Boolean).slice(0, 6);
  return sentences.map((sentence, index) => `${index + 1}. ${sentence.trim()}.`);
}

export function generateQuizFromText(text, count = 5) {
  const words = text.split(' ').filter((word) => word.length > 4);
  const quiz = [];
  for (let i = 0; i < count; i += 1) {
    const focus = words[i % words.length] || `Concept ${i + 1}`;
    quiz.push({
      id: `${focus}-${i}`,
      question: `What best describes "${focus}" in this document?`,
      options: [
        `Definition of ${focus}`,
        `Example of ${focus}`,
        `Common mistake about ${focus}`,
        `Unrelated detail`
      ],
      answer: `Definition of ${focus}`
    });
  }
  return quiz;
}

export function calculatePlagiarismScore(text) {
  const score = Math.min(12, Math.max(2, Math.floor(text.length % 13)));
  return score;
}
