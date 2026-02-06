import './QuickActions.css';
import {
  FiUpload,
  FiFileText,
  FiCheckSquare,
  FiCpu,
  FiChevronRight,
  FiZap
} from 'react-icons/fi';
import { calculatePlagiarismScore } from '../../utils/pipeline';
import { useDocuments } from '../../context/useDocuments';

function QuickActions() {
  const { addDocument } = useDocuments();

  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCardClick = (action) => {
    console.log(`Clicked: ${action}`);
    
    // Handle upload separately
    if (action === 'Upload Document') {
      handleUpload();
      return;
    }

    if (action === 'AI Summary') {
      scrollToSection('section-generation');
    }

    if (action === 'Practice Quiz') {
      scrollToSection('section-generation');
    }

    if (action === 'AI Assistant') {
      scrollToSection('section-generation');
    }
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

  const handleUpload = () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png';
    
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const fileName = file.name;
        const fileType = fileName.split('.').pop().toLowerCase();
        const content = await readFileText(file);
        const plagiarismScore = calculatePlagiarismScore(content);
        
        // Add to recent documents
        const documentId = Date.now();
        addDocument({
          id: documentId,
          name: fileName,
          date: new Date().toISOString().split('T')[0],
          type: fileType,
          content,
          plagiarismScore,
          plagiarismFlag: plagiarismScore > 10
        });
        
        // Simulate upload process
        console.log(`Uploading: ${fileName}`);
        alert(`Document "${fileName}" uploaded successfully!`);
        scrollToSection('section-plagiarism');
        
        // Here you would typically:
        // 1. Upload to your backend server
        // 2. Process the file
        // 3. Update state/redux store
        // 4. Show success message
      }
    };
    
    input.click();
  };

  return (
    <div className="quick-actions-wrapper">
      <section className="quick-actions">
        <div className="qa-container">
          {/* Quick Actions Section */}
          <div className="qa-section">
            <div className="qa-header">
              <h2 className="qa-title">Quick Actions</h2>
            </div>

            <div className="qa-scroll-container">
              <div className="qa-cards">
                {/* Upload Card */}
                <div 
                  className="qa-card upload"
                  onClick={() => handleCardClick('Upload Document')}
                >
                  <div className="card-content">
                    <div className="card-icon-wrapper floating-icon">
                      <FiUpload className="qa-icon" />
                    </div>
                    <div className="card-text">
                      <h3 className="card-title">Upload Document</h3>
                      <p className="card-desc">Start learning with AI</p>
                    </div>
                  </div>
                  <FiChevronRight className="card-arrow" />
                </div>

                {/* Summary Card */}
                <div 
                  className="qa-card summary"
                  onClick={() => handleCardClick('AI Summary')}
                >
                  <div className="card-content">
                    <div className="card-icon-wrapper floating-icon" style={{animationDelay: '0.2s'}}>
                      <FiFileText className="qa-icon" />
                    </div>
                    <div className="card-text">
                      <h3 className="card-title">AI Summary</h3>
                      <p className="card-desc">Quick insights & notes</p>
                    </div>
                  </div>
                  <FiChevronRight className="card-arrow" />
                </div>

                {/* Quiz Card */}
                <div 
                  className="qa-card quiz"
                  onClick={() => handleCardClick('Practice Quiz')}
                >
                  <div className="card-content">
                    <div className="card-icon-wrapper floating-icon" style={{animationDelay: '0.4s'}}>
                      <FiCheckSquare className="qa-icon" />
                    </div>
                    <div className="card-text">
                      <h3 className="card-title">Practice Quiz</h3>
                      <p className="card-desc">Test your knowledge</p>
                    </div>
                  </div>
                  <FiChevronRight className="card-arrow" />
                </div>

                {/* Assistant Card */}
                <div 
                  className="qa-card assistant"
                  onClick={() => handleCardClick('AI Assistant')}
                >
                  <div className="card-content">
                    <div className="card-icon-wrapper floating-icon" style={{animationDelay: '0.6s'}}>
                      <FiCpu className="qa-icon" />
                    </div>
                    <div className="card-text">
                      <h3 className="card-title">AI Assistant</h3>
                      <p className="card-desc">Get instant help</p>
                    </div>
                  </div>
                  <FiChevronRight className="card-arrow" />
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Section - Professional */}
          <div className="recommended-section">
            <div className="qa-header">
              <h2 className="qa-title">Recommended</h2>
            </div>

            <div className="recommended-card">
              <div className="recommended-content">
                <div className="recommended-icon">
                  <FiZap />
                </div>
                
                <div className="recommended-text">
                  <h3 className="recommended-title">Anti-Lazy AI</h3>
                  <p className="recommended-tagline">Learn by thinking, not copying.</p>
                </div>
              </div>
              
              <div className="recommended-footer">
                <p className="recommended-desc">Transform your learning with intelligent questioning</p>
                <button className="try-now-btn">
                  Try Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default QuickActions;
