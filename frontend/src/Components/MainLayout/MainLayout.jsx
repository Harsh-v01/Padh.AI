import React from 'react';
import './MainLayout.css';
import QuickActions from '../QuickActions/QuickActions';
import RecentDocuments from '../RecentDocuments/RecentDocuments';

function MainLayout() {
  return (
    <div className="main-layout-wrapper">
      <div className="main-layout-container">
        {/* Left Side - Quick Actions */}
        <div className="quick-actions-panel">
          <QuickActions />
        </div>
        
        {/* Right Side - Recent Documents */}
        <div className="recent-docs-panel">
          <RecentDocuments />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;