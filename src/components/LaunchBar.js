import React from 'react';
import { Play, Square, Loader } from 'lucide-react';
import './LaunchBar.css';

const LaunchBar = ({ launchStatus, onLaunch, isHovering, onHoverChange }) => {
  const getButtonContent = () => {
    switch (launchStatus) {
      case 'LAUNCHING':
        return (
          <>
            <Loader size={20} className="spin-icon" />
            <span>LAUNCHING...</span>
          </>
        );
      case 'PLAYING':
        return (
          <>
            <Square size={20} />
            <span>PLAYING</span>
          </>
        );
      default:
        return (
          <>
            <Play size={20} />
            <span>LAUNCH HYTALE</span>
          </>
        );
    }
  };

  return (
    <div className="launch-bar">
      <button
        className={`launch-button ${launchStatus.toLowerCase()}`}
        onClick={onLaunch}
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
      >
        {getButtonContent()}
      </button>
    </div>
  );
};

export default LaunchBar;
