import React from 'react';
import { Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import './ModCard.css';

const ModCard = ({ mod, onToggle, onDelete }) => {
  return (
    <div className="mod-card">
      <div className="mod-card-header">
        <div>
          <h3>{mod.name || 'Unknown Mod'}</h3>
          {mod.author && <p className="mod-author">by {mod.author}</p>}
        </div>
        <button
          className="toggle-mod-btn"
          onClick={onToggle}
          title={mod.enabled ? 'Disable mod' : 'Enable mod'}
        >
          {mod.enabled ? (
            <ToggleRight size={24} className="toggle-icon enabled" />
          ) : (
            <ToggleLeft size={24} className="toggle-icon disabled" />
          )}
        </button>
      </div>

      {mod.version && (
        <div className="mod-meta">
          <span className="mod-version">v{mod.version}</span>
        </div>
      )}

      {mod.description && (
        <p className="mod-description">{mod.description}</p>
      )}

      <div className="mod-stats">
        {mod.downloads !== undefined && (
          <div className="stat">
            <span className="stat-label">Downloads</span>
            <span className="stat-value">
              {mod.downloads > 1000 ? `${(mod.downloads / 1000).toFixed(1)}k` : mod.downloads}
            </span>
          </div>
        )}
        <div className="stat">
          <span className="stat-label">Status</span>
          <span className={`stat-value ${mod.enabled ? 'enabled' : 'disabled'}`}>
            {mod.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      <div className="mod-card-footer">
        <button className="delete-btn" onClick={onDelete}>
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default ModCard;
