import { useState } from 'react';
import { 
  FiUser, FiSettings, FiFileText, 
  FiBookOpen, FiHeadphones, FiBell, FiCalendar, 
  FiHelpCircle, FiUserPlus, FiLogOut, 
  FiChevronRight
} from 'react-icons/fi';
import './Header.css';

// Import the upload image
import uploadImage from '../../assets/update.png';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [activeItem, setActiveItem] = useState('');

  const handleMenuClick = () => {
    if (!menuOpen) {
      setClicked(true);
      setTimeout(() => setClicked(false), 400);
    }
    setMenuOpen(!menuOpen);
  };

  const closeSidebar = () => {
    setMenuOpen(false);
  };

  const handleItemClick = (itemName) => {
    setActiveItem(itemName);
    setTimeout(() => {
      setActiveItem('');
      closeSidebar();
    }, 300);
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        {/* Hamburger Button */}
        <div
          className={`menu-btn ${menuOpen ? 'open' : ''} ${clicked ? 'clicked' : ''}`}
          onClick={handleMenuClick}
        >
          <div className="menu-btn__inner">
            <span className="menu-btn__line top"></span>
            <span className="menu-btn__line bottom"></span>
          </div>
        </div>

        {/* Logo - Padh.AI */}
        <div className="logo-wrapper">
          <div className="logo">
            <span className="padh">Padh</span>
            <span className="ai">.AI</span>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`sidebar ${menuOpen ? 'active' : ''}`}>
        <div className="sidebar-content">
          {/* Upload Card - Just Image as Button */}
          <div 
            className="upload-card-btn"
            onClick={() => handleItemClick('upload')}
          >
            <img src={uploadImage} alt="Upload Document" className="upload-card-img" />
          </div>

          {/* Account Section */}
          <div className="sidebar-section">
            <h4 className="section-title">Account</h4>
            <ul className="sidebar-list">
              <li 
                className={`sidebar-item ${activeItem === 'profile' ? 'active' : ''}`}
                onClick={() => handleItemClick('profile')}
              >
                <FiUser className="item-icon" size={16} />
                <span className="item-text">Your Profile</span>
                <FiChevronRight className="arrow-icon" size={14} />
              </li>
              <li 
                className={`sidebar-item ${activeItem === 'settings' ? 'active' : ''}`}
                onClick={() => handleItemClick('settings')}
              >
                <FiSettings className="item-icon" size={16} />
                <span className="item-text">Account Settings</span>
                <FiChevronRight className="arrow-icon" size={14} />
              </li>
            </ul>
          </div>

          {/* Learning Section */}
          <div className="sidebar-section">
            <h4 className="section-title">Learning</h4>
            <ul className="sidebar-list">
              <li 
                className={`sidebar-item ${activeItem === 'upload-doc' ? 'active' : ''}`}
                onClick={() => handleItemClick('upload-doc')}
              >
                <FiFileText className="item-icon" size={16} />
                <span className="item-text">Upload Document</span>
                <FiChevronRight className="arrow-icon" size={14} />
              </li>
              <li 
                className={`sidebar-item ${activeItem === 'summary' ? 'active' : ''}`}
                onClick={() => handleItemClick('summary')}
              >
                <FiFileText className="item-icon" size={16} />
                <span className="item-text">Generate Summary</span>
                <FiChevronRight className="arrow-icon" size={14} />
              </li>
              <li 
                className={`sidebar-item ${activeItem === 'quiz' ? 'active' : ''}`}
                onClick={() => handleItemClick('quiz')}
              >
                <FiBookOpen className="item-icon" size={16} />
                <span className="item-text">Practice Quiz</span>
                <FiChevronRight className="arrow-icon" size={14} />
              </li>
              <li 
                className={`sidebar-item ${activeItem === 'assistant' ? 'active' : ''}`}
                onClick={() => handleItemClick('assistant')}
              >
                <FiHeadphones className="item-icon" size={16} />
                <span className="item-text">AI Assistant</span>
                <FiChevronRight className="arrow-icon" size={14} />
              </li>
            </ul>
          </div>

          {/* Other Section */}
          <div className="sidebar-section">
            <h4 className="section-title">Other</h4>
            <ul className="sidebar-list">
              <li 
                className={`sidebar-item ${activeItem === 'notifications' ? 'active' : ''}`}
                onClick={() => handleItemClick('notifications')}
              >
                <FiBell className="item-icon" size={16} />
                <span className="item-text">Notifications</span>
                <FiChevronRight className="arrow-icon" size={14} />
              </li>
              <li 
                className={`sidebar-item ${activeItem === 'calendar' ? 'active' : ''}`}
                onClick={() => handleItemClick('calendar')}
              >
                <FiCalendar className="item-icon" size={16} />
                <span className="item-text">Calendar</span>
                <FiChevronRight className="arrow-icon" size={14} />
              </li>
              <li 
                className={`sidebar-item ${activeItem === 'help' ? 'active' : ''}`}
                onClick={() => handleItemClick('help')}
              >
                <FiHelpCircle className="item-icon" size={16} />
                <span className="item-text">Help & Support</span>
                <FiChevronRight className="arrow-icon" size={14} />
              </li>
              <li 
                className={`sidebar-item ${activeItem === 'invite' ? 'active' : ''}`}
                onClick={() => handleItemClick('invite')}
              >
                <FiUserPlus className="item-icon" size={16} />
                <span className="item-text">Invite Friends</span>
                <FiChevronRight className="arrow-icon" size={14} />
              </li>
            </ul>
          </div>

          {/* Logout - Centered Content */}
          <div className="sidebar-bottom">
            <div 
              className={`logout-btn ${activeItem === 'logout' ? 'active' : ''}`}
              onClick={() => handleItemClick('logout')}
            >
              <div className="logout-content">
                <FiLogOut className="logout-icon" size={16} />
                <span className="logout-text">Logout</span>
              </div>
            </div>
          </div>

          {/* Footer Text */}
          <div className="sidebar-footer">
            <p className="footer-text">New features coming soon</p>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
    </>
  );
}

export default Header;