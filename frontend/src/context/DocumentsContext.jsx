import { useEffect, useMemo, useState } from 'react';
import { DocumentsContext } from './DocumentsContext';
import { fetchRecentDocuments } from '../api/client';

export function DocumentsProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [activeDocumentId, setActiveDocumentId] = useState('');

  useEffect(() => {
    const loadDocuments = async () => {
      const savedDocs = localStorage.getItem('recentDocuments');
      if (savedDocs) {
        setDocuments(JSON.parse(savedDocs));
      }

      try {
        const remoteDocs = await fetchRecentDocuments();
        if (Array.isArray(remoteDocs)) {
          setDocuments(remoteDocs);
        }
      } catch (error) {
        console.warn('Unable to load remote documents yet.', error);
      }
    };

    loadDocuments();
  }, []);

  useEffect(() => {
    localStorage.setItem('recentDocuments', JSON.stringify(documents));
  }, [documents]);

  const addDocument = (doc) => {
    setDocuments((prev) => [doc, ...prev]);
    setActiveDocumentId(doc.id);
  };

  const upsertDocument = (doc) => {
    setDocuments((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === doc.id);
      if (existingIndex === -1) {
        setActiveDocumentId(doc.id);
        return [doc, ...prev];
      }
      const updated = [...prev];
      updated[existingIndex] = { ...updated[existingIndex], ...doc };
      return updated;
    });
    setActiveDocumentId(doc.id);
  };

  const updateDocument = (id, updates) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc))
    );
  };

  const value = useMemo(
    () => ({
      documents,
      setDocuments,
      activeDocumentId,
      setActiveDocumentId,
      addDocument,
      upsertDocument,
      updateDocument
    }),
    [documents, activeDocumentId]
  );

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
}
