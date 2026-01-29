import './QuickActions.css';
import {
  FiUpload,
  FiFileText,
  FiCheckSquare,
  FiCpu,
  FiChevronRight
} from 'react-icons/fi';

function QuickActions() {
  const handleCardClick = (action) => {
    console.log(`Clicked: ${action}`);
    // Add your click handler logic here
  };

  return (
    <section className="quick-actions">
      <div className="qa-container">
        <div className="qa-header">
          <h2 className="qa-title">Quick Actions</h2>
        </div>

        <div className="qa-scroll">
          <div className="qa-cards">
            {/* Upload Card */}
            <div 
              className="qa-card upload"
              onClick={() => handleCardClick('Upload Document')}
            >
              <div className="card-content">
                <div className="card-text">
                  <h3 className="card-title">Upload Document</h3>
                  <p className="card-desc">Start learning with AI</p>
                </div>
                <div className="card-icon-wrapper">
                  <FiUpload className="qa-icon" />
                </div>
              </div>
              <div className="card-hover">
                <span>Get Started</span>
                <FiChevronRight className="hover-arrow" />
              </div>
            </div>

            {/* Summary Card */}
            <div 
              className="qa-card summary"
              onClick={() => handleCardClick('AI Summary')}
            >
              <div className="card-content">
                <div className="card-text">
                  <h3 className="card-title">AI Summary</h3>
                  <p className="card-desc">Quick insights & notes</p>
                </div>
                <div className="card-icon-wrapper">
                  <FiFileText className="qa-icon" />
                </div>
              </div>
              <div className="card-hover">
                <span>Try Now</span>
                <FiChevronRight className="hover-arrow" />
              </div>
            </div>

            {/* Quiz Card */}
            <div 
              className="qa-card quiz"
              onClick={() => handleCardClick('Practice Quiz')}
            >
              <div className="card-content">
                <div className="card-text">
                  <h3 className="card-title">Practice Quiz</h3>
                  <p className="card-desc">Test your knowledge</p>
                </div>
                <div className="card-icon-wrapper">
                  <FiCheckSquare className="qa-icon" />
                </div>
              </div>
              <div className="card-hover">
                <span>Start Quiz</span>
                <FiChevronRight className="hover-arrow" />
              </div>
            </div>

            {/* Assistant Card */}
            <div 
              className="qa-card assistant"
              onClick={() => handleCardClick('AI Assistant')}
            >
              <div className="card-content">
                <div className="card-text">
                  <h3 className="card-title">AI Assistant</h3>
                  <p className="card-desc">Get instant help</p>
                </div>
                <div className="card-icon-wrapper">
                  <FiCpu className="qa-icon" />
                </div>
              </div>
              <div className="card-hover">
                <span>Ask AI</span>
                <FiChevronRight className="hover-arrow" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default QuickActions;