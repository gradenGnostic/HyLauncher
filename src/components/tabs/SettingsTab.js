import React, { useState } from 'react';
import { Folder, AlertCircle } from 'lucide-react';
import './SettingsTab.css';

const SettingsTab = ({
  modsPath,
  hytaleExePath,
  onModsPathChange,
  onHytaleExePathChange,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSelectModsPath = async () => {
    try {
      const result = await window.electronAPI.selectModsPath();
      if (result.success) {
        onModsPathChange(result.path);
      }
    } catch (err) {
      console.error('Failed to select mods path:', err);
    }
  };

  const handleSelectHytaleExe = async () => {
    try {
      const result = await window.electronAPI.selectHytaleExe();
      if (result.success) {
        onHytaleExePathChange(result.path);
      }
    } catch (err) {
      console.error('Failed to select Hytale executable:', err);
    }
  };

  const handleSaveApiKey = async () => {
    if (apiKey.trim()) {
      try {
        await window.electronAPI.setOrbisApiKey(apiKey);
        alert('API Key saved successfully');
      } catch (err) {
        alert('Failed to save API Key: ' + err.message);
      }
    }
  };

  const handleLoadApiKey = async () => {
    try {
      const key = await window.electronAPI.getOrbisApiKey();
      if (key) {
        setApiKey(key);
      }
    } catch (err) {
      console.error('Failed to load API Key:', err);
    }
  };

  return (
    <div className="settings-tab">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Configure your Gaia launcher</p>
      </div>

      <div className="settings-sections">
        {/* Paths Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Paths</h2>
            <p>Configure mod and game locations</p>
          </div>

          <div className="setting-item">
            <label className="setting-label">Mods Directory</label>
            <div className="path-input-group">
              <input
                type="text"
                value={modsPath}
                readOnly
                className="path-input"
                placeholder="No path selected"
              />
              <button className="browse-btn" onClick={handleSelectModsPath}>
                <Folder size={18} />
                <span>Browse</span>
              </button>
            </div>
            <p className="setting-description">
              Where your mod files are stored
            </p>
          </div>

          <div className="setting-item">
            <label className="setting-label">Hytale Executable</label>
            <div className="path-input-group">
              <input
                type="text"
                value={hytaleExePath}
                readOnly
                className="path-input"
                placeholder="No path selected"
              />
              <button className="browse-btn" onClick={handleSelectHytaleExe}>
                <Folder size={18} />
                <span>Browse</span>
              </button>
            </div>
            <p className="setting-description">
              Path to your Hytale game executable
            </p>
          </div>
        </div>

        {/* API Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>API Configuration</h2>
            <p>Configure Orbis API access</p>
          </div>

          <div className="setting-item">
            <label className="setting-label">Orbis API Key</label>
            <div className="api-key-group">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Orbis API Key"
                className="api-key-input"
              />
              <button
                className="toggle-btn"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
              <button className="save-btn" onClick={handleSaveApiKey}>
                Save
              </button>
            </div>
            <p className="setting-description">
              Optional: Provide your Orbis API key for extended functionality
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>About</h2>
            <p>Application information</p>
          </div>

          <div className="about-content">
            <div className="about-item">
              <span className="about-label">Application</span>
              <span className="about-value">Gaia Launcher</span>
            </div>
            <div className="about-item">
              <span className="about-label">Version</span>
              <span className="about-value">v1.0.4</span>
            </div>
            <div className="about-item">
              <span className="about-label">Platform</span>
              <span className="about-value">Electron + React</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="info-box">
        <AlertCircle size={18} />
        <p>
          Changes are saved automatically. If you experience any issues, please
          check your paths and API configuration.
        </p>
      </div>
    </div>
  );
};

export default SettingsTab;
