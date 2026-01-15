import React from 'react';
import './TopBar.css';

const TopBar = () => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2>Gaia Launcher</h2>
      </div>
      <div className="topbar-right">
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span className="status-text">Ready</span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
