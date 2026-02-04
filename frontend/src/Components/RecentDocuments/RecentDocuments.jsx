import { useMemo, useState } from 'react';
import { FiFile, FiChevronRight } from 'react-icons/fi';
import './RecentDocuments.css';
import { useDocuments } from '../../context/DocumentsContext';

const RecentDocuments = () => {
  const [showAll, setShowAll] = useState(false);
  const { documents } = useDocuments();

  // Function to format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Function to handle document click
  const handleDocumentClick = (doc) => {
    console.log('Opening document:', doc.name);
    alert(`Opening: ${doc.name}\n\nThis would open/download the document in a real implementation.`);
  };

  // Toggle between showing 3 documents and all documents
  const toggleViewAll = () => {
    setShowAll((prev) => !prev);
  };

  // Get documents to display
  const displayDocs = useMemo(() => {
    if (showAll) {
      return documents;
    }
    return documents.slice(0, 3);
  }, [documents, showAll]);
  
  // If not showing all and less than 3 documents, add empty slots
  const rows = [...displayDocs];
  if (!showAll && rows.length < 3) {
    while (rows.length < 3) {
      rows.push({ id: `empty-${rows.length}`, empty: true });
    }
  }

  return (
    <div className="recent-docs-wrapper">
      <section className="recent-docs">
        {/* Header matching QuickActions exactly */}
        <div className="qa-header">
          <h2 className="qa-title">Recent Documents</h2>
        </div>

        <div className="recent-card">
          {/* Document List */}
          <div className="recent-list">
            {rows.length > 0 ? (
              rows.map((doc, index) => (
                <div 
                  key={doc.id || index}
                  className={`recent-row ${doc.empty ? 'empty-row' : ''}`}
                  onClick={() => !doc.empty && handleDocumentClick(doc)}
                >
                  <div className="doc-content">
                    <div className="doc-icon-text">
                      <div className="doc-icon-wrapper">
                        <FiFile className="doc-icon" />
                      </div>
                      <div className="doc-details">
                        {doc.empty ? (
                          <>
                            <span className="doc-name empty-name">No document uploaded</span>
                            <span className="doc-date empty-date">Upload a document</span>
                          </>
                        ) : (
                          <>
                            <span className="doc-name">{doc.name}</span>
                            <span className="doc-date">{formatDate(doc.date)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {!doc.empty && <FiChevronRight className="doc-arrow" />}
                </div>
              ))
            ) : (
              // Only show empty state when there are truly no documents
              <div className="no-documents">
                <div className="doc-icon-wrapper empty-icon">
                  <FiFile className="doc-icon" />
                </div>
                <span>No documents uploaded yet</span>
                <p className="no-docs-hint">Upload your first document using the "Upload Document" button</p>
              </div>
            )}
          </div>

          {/* Footer with View All button - Inside the card like Recommended section */}
          {documents.length > 0 && (
            <div className="recent-footer">
              <p className="recent-desc">
                {showAll ? 'Showing all documents' : 'View all your uploaded documents'}
              </p>
              <button 
                className="view-all-btn"
                onClick={toggleViewAll}
              >
                {showAll ? 'Show Less' : 'View All'}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default RecentDocuments;
