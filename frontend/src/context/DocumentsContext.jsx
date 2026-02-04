import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DocumentsContext = createContext(null);

export function DocumentsProvider({ children }) {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const savedDocs = localStorage.getItem('recentDocuments');
    if (savedDocs) {
      setDocuments(JSON.parse(savedDocs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('recentDocuments', JSON.stringify(documents));
  }, [documents]);

  const addDocument = (doc) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const value = useMemo(
    () => ({
      documents,
      setDocuments,
      addDocument
    }),
    [documents]
  );

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentsProvider');
  }
  return context;
}
