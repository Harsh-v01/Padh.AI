import { useEffect, useMemo, useState } from 'react';
import { DocumentsContext } from './DocumentsContext';
import { fetchRecentDocuments } from '../api/client';

export function DocumentsProvider({ children }) {
  const [documents, setDocuments] = useState([]);

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
  };

  const upsertDocument = (doc) => {
    setDocuments((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === doc.id);
      if (existingIndex === -1) {https://github.com/Harsh-v01/Padh.AI/pull/3/conflict?name=frontend%252Fsrc%252Fcontext%252FDocumentsContext.jsx&base_oid=256e47a9d64d20d78f977c55bcfdce9aea611724&head_oid=8a4e65d84d922b59d2791c325dff1b2d5c203bf2
        return [doc, ...prev];
      }
      const updated = [...prev];
      updated[existingIndex] = { ...updated[existingIndex], ...doc };
      return updated;
    });
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
      addDocument,
      upsertDocument,
      updateDocument
    }),
    [documents]
  );

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
}
