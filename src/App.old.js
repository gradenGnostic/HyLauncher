import React, { useState, useEffect } from 'react';
import './App.css';
import ModList from './components/ModList';
import Settings from './components/Settings';
import Header from './components/Header';
import ModBrowser from './components/ModBrowser';
import LaunchButton from './components/LaunchButton';

function App() {
  const [modsPath, setModsPath] = useState('');
  const [hytaleExePath, setHytaleExePath] = useState('');
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('mods'); // 'mods', 'browse', 'settings'
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Wait a bit for preload script to execute if needed
      let retries = 10;
      while (!window.electronAPI && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries--;
      }
      
      // Check if electronAPI is available
      if (!window.electronAPI) {
        setError('Electron API not available. Please run this app in Electron.');
        console.error('window.electronAPI is undefined');
        setLoading(false);
        return;
      }
      
      // Load custom mods path
      const savedModsPath = await window.electronAPI.getModsPath();
      if (savedModsPath) {
        setModsPath(savedModsPath);
        await loadMods(savedModsPath);
      }
      
      // Load saved Hytale executable path
      const savedExePath = await window.electronAPI.getHytaleExePath();
      if (savedExePath) {
        setHytaleExePath(savedExePath);
      } else {
        // Try to find it
        const foundExe = await window.electronAPI.findHytaleExecutable();
        if (foundExe.success) {
          setHytaleExePath(foundExe.path);
        }
      }
    } catch (err) {
      setError('Failed to initialize: ' + err.message);
      console.error('Initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMods = async (path) => {
    try {
      setLoading(true);
      const modsList = await window.electronAPI.getMods(path);
      setMods(modsList);
      setError(null);
    } catch (err) {
      setError('Failed to load mods: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModsPathChange = async (newPath) => {
    setModsPath(newPath);
    await loadMods(newPath);
  };

  const handleHytaleExePathChange = (newPath) => {
    setHytaleExePath(newPath);
  };

  const handleToggleMod = async (modPath, enable) => {
    const result = await window.electronAPI.toggleMod(modPath, enable);
    if (result.success) {
      await loadMods(modsPath);
    } else {
      setError('Failed to toggle mod: ' + result.error);
    }
  };

  const handleDeleteMod = async (modPath) => {
    if (window.confirm('Are you sure you want to delete this mod?')) {
      const result = await window.electronAPI.deleteMod(modPath);
      if (result.success) {
        await loadMods(modsPath);
      } else {
        setError('Failed to delete mod: ' + result.error);
      }
    }
  };

  const handleInstallMod = async () => {
    const modFilePath = await window.electronAPI.selectModFile();
    if (modFilePath) {
      const result = await window.electronAPI.installMod(modsPath, modFilePath);
      if (result.success) {
        await loadMods(modsPath);
      } else {
        setError('Failed to install mod: ' + result.error);
      }
    }
  };

  const handleModInstalled = async () => {
    await loadMods(modsPath);
    setCurrentView('mods');
  };

  const handleLaunch = () => {
    // Game is launching
    console.log('Hytale launched successfully');
  };

  if (loading && mods.length === 0) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading mods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header 
        onSettingsClick={() => setCurrentView('settings')}
        onInstallClick={handleInstallMod}
        onBrowseClick={() => setCurrentView('browse')}
        modCount={mods.length}
      />
      
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="app-content">
        {currentView === 'settings' ? (
          <Settings
            modsPath={modsPath}
            hytaleExePath={hytaleExePath}
            onModsPathChange={handleModsPathChange}
            onHytaleExePathChange={handleHytaleExePathChange}
            onClose={() => setCurrentView('mods')}
          />
        ) : currentView === 'browse' ? (
          <ModBrowser
            modsPath={modsPath}
            onModInstalled={handleModInstalled}
            onClose={() => setCurrentView('mods')}
          />
        ) : (
          <div className="main-view">
            <div className="launch-section">
              <LaunchButton
                modsPath={modsPath}
                hytaleExePath={hytaleExePath}
                onLaunch={handleLaunch}
              />
            </div>
            
            <div className="mods-section">
              <ModList
                mods={mods}
                onToggleMod={handleToggleMod}
                onDeleteMod={handleDeleteMod}
                onRefresh={() => loadMods(modsPath)}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

