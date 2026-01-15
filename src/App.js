import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import HomeTab from './components/tabs/HomeTab';
import ModsTab from './components/tabs/ModsTab';
import SettingsTab from './components/tabs/SettingsTab';
import LaunchBar from './components/LaunchBar';

const GaiaLauncher = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isHoveringLaunch, setIsHoveringLaunch] = useState(false);
  const [launchStatus, setLaunchStatus] = useState('READY');
  const [modsPath, setModsPath] = useState('');
  const [hytaleExePath, setHytaleExePath] = useState('');
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      let retries = 10;
      while (!window.electronAPI && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries--;
      }

      if (!window.electronAPI) {
        setError('Electron API not available');
        setLoading(false);
        return;
      }

      const savedModsPath = await window.electronAPI.getModsPath();
      if (savedModsPath) {
        setModsPath(savedModsPath);
        await loadMods(savedModsPath);
      }

      const savedExePath = await window.electronAPI.getHytaleExePath();
      if (savedExePath) {
        setHytaleExePath(savedExePath);
      } else {
        const foundExe = await window.electronAPI.findHytaleExecutable();
        if (foundExe.success) {
          setHytaleExePath(foundExe.path);
        }
      }
    } catch (err) {
      setError('Failed to initialize: ' + err.message);
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

  const handleLaunch = async () => {
    if (launchStatus === 'READY') {
      setLaunchStatus('LAUNCHING');
      try {
        const result = await window.electronAPI.launchHytale(hytaleExePath, modsPath);
        if (result.success) {
          setLaunchStatus('PLAYING');
        } else {
          setError('Failed to launch: ' + result.error);
          setLaunchStatus('READY');
        }
      } catch (err) {
        setError('Launch error: ' + err.message);
        setLaunchStatus('READY');
      }
    } else if (launchStatus === 'PLAYING') {
      setLaunchStatus('READY');
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

  if (loading) {
    return (
      <div className="gaia-container loading">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="gaia-container">
      <div className="gaia-background"></div>
      <div className="gaia-content">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="gaia-main">
          <TopBar />
          
          <div className="gaia-viewport">
            {activeTab === 'home' && <HomeTab />}
            {activeTab === 'mods' && (
              <ModsTab 
                mods={mods} 
                onToggle={handleToggleMod}
                onDelete={handleDeleteMod}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsTab
                modsPath={modsPath}
                hytaleExePath={hytaleExePath}
                onModsPathChange={handleModsPathChange}
                onHytaleExePathChange={handleHytaleExePathChange}
              />
            )}
          </div>

          <LaunchBar 
            launchStatus={launchStatus}
            onLaunch={handleLaunch}
            isHovering={isHoveringLaunch}
            onHoverChange={setIsHoveringLaunch}
          />
        </div>
      </div>

      {error && (
        <div className="error-notification">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  );
};

export default GaiaLauncher;
