import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, AlertCircle, Loader, X, Eye, User, Tag, Heart, FileText, MessageSquare, Image as ImageIcon } from 'lucide-react';
import ModCard from '../ModCard';
import './ModsTab.css';

const ModsTab = ({ mods, onToggle, onDelete }) => {
  const [activeView, setActiveView] = useState('installed'); // 'installed' or 'browser'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEnabled, setFilterEnabled] = useState(null);
  const [orbisSearchQuery, setOrbisSearchQuery] = useState('');
  const [orbisMods, setOrbisMods] = useState([]);
  const [orbisLoading, setOrbisLoading] = useState(false);
  const [orbisError, setOrbisError] = useState(null);
  const [selectedMod, setSelectedMod] = useState(null);
  const [installingMod, setInstallingMod] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'description', 'comments', 'gallery', 'versions'

  const filteredMods = mods.filter((mod) => {
    const matchesSearch = mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (mod.author && mod.author.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterEnabled === null) return matchesSearch;
    return matchesSearch && mod.enabled === filterEnabled;
  });

  const fetchOrbisModsBrowser = async (query = '') => {
    setOrbisLoading(true);
    setOrbisError(null);
    try {
      const result = await window.electronAPI.fetchOrbisMods(query);
      if (result.success) {
        // Map the response data to ensure all needed properties are available
        const mappedMods = (result.data || []).map(mod => ({
          id: mod.id,
          name: mod.name,
          tagline: mod.tagline || mod.description || '',
          description: mod.description || '',
          downloadCount: mod.downloadCount || mod.downloads || 0,
          viewCount: mod.viewCount || 0,
          likeCount: mod.likeCount || 0,
          commentCount: mod.commentCount || 0,
          iconUrl: mod.iconUrl,
          bannerUrl: mod.bannerUrl,
          status: mod.status,
          licenseType: mod.licenseType,
          categories: mod.categories || [],
          ownerUser: mod.ownerUser || { username: 'Unknown' },
          latestVersion: mod.latestVersion || {},
          latestVersionId: mod.latestVersionId || mod.latestVersion?.id,
          downloadUrl: mod.downloadUrl || mod.original?.downloadUrl || `https://api.orbis.place/resources/${mod.id}/download`,
          original: mod
        }));
        setOrbisMods(mappedMods);
      } else {
        setOrbisError(result.error || 'Failed to fetch mods');
      }
    } catch (err) {
      setOrbisError('Error: ' + err.message);
    } finally {
      setOrbisLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'browser') {
      fetchOrbisModsBrowser();
    }
  }, [activeView]);

  const handleSearchOrbis = (e) => {
    e.preventDefault();
    fetchOrbisModsBrowser(orbisSearchQuery);
  };

  const handleInstallMod = async (mod) => {
    if (!window.electronAPI.getModsPath) {
      setOrbisError('Mod path not configured. Go to Settings.');
      return;
    }

    setInstallingMod(mod.id);
    try {
      const modsPath = await window.electronAPI.getModsPath();
      if (!modsPath) {
        setOrbisError('Please configure mods directory in Settings first');
        setInstallingMod(null);
        return;
      }

      // Get the download URL - use downloadUrl first, then construct one
      const downloadUrl = mod.downloadUrl || `https://api.orbis.place/resources/${mod.id}/download`;
      
      console.log('Installing mod:', mod.name, 'URL:', downloadUrl);
      
      const result = await window.electronAPI.orbisDownloadMod(downloadUrl, modsPath, `${mod.name}.zip`);
      if (result.success) {
        setOrbisError(null);
        // Refresh the installed mods list
        setTimeout(() => {
          setActiveView('installed');
          setSelectedMod(null);
        }, 1000);
      } else {
        setOrbisError('Failed to install: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      setOrbisError('Install error: ' + err.message);
    } finally {
      setInstallingMod(null);
    }
  };

  const closeModal = () => {
    setSelectedMod(null);
    setActiveTab('overview');
  };

  return (
    <div className="mods-tab">
      <div className="mods-header">
        <div>
          <h1>Mods</h1>
          <p>Manage and install your mods</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="view-tabs">
        <button
          className={`view-tab ${activeView === 'installed' ? 'active' : ''}`}
          onClick={() => setActiveView('installed')}
        >
          Installed Mods ({mods.length})
        </button>
        <button
          className={`view-tab ${activeView === 'browser' ? 'active' : ''}`}
          onClick={() => setActiveView('browser')}
        >
          <Download size={16} />
          Browse & Install
        </button>
      </div>

      {/* Installed Mods View */}
      {activeView === 'installed' && (
        <>
          <div className="mods-controls">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search mods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-buttons">
              <button
                className={`filter-btn ${filterEnabled === null ? 'active' : ''}`}
                onClick={() => setFilterEnabled(null)}
              >
                All
              </button>
              <button
                className={`filter-btn ${filterEnabled === true ? 'active' : ''}`}
                onClick={() => setFilterEnabled(true)}
              >
                Enabled
              </button>
              <button
                className={`filter-btn ${filterEnabled === false ? 'active' : ''}`}
                onClick={() => setFilterEnabled(false)}
              >
                Disabled
              </button>
            </div>
          </div>

          <div className="mods-count">
            <p>Showing {filteredMods.length} of {mods.length} mods</p>
          </div>

          {filteredMods.length === 0 ? (
            <div className="empty-state">
              <p>No mods installed</p>
              <button
                className="install-mod-btn secondary"
                onClick={() => setActiveView('browser')}
              >
                <Plus size={18} />
                <span>Browse & Install Mods</span>
              </button>
            </div>
          ) : (
            <div className="mods-grid">
              {filteredMods.map((mod) => (
                <ModCard
                  key={mod.path}
                  mod={mod}
                  onToggle={() => onToggle(mod.path, !mod.enabled)}
                  onDelete={() => onDelete(mod.path)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Orbis Browser View */}
      {activeView === 'browser' && (
        <>
          <div className="orbis-controls">
            <form onSubmit={handleSearchOrbis} className="orbis-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search Orbis.place mods..."
                value={orbisSearchQuery}
                onChange={(e) => setOrbisSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-btn">
                Search
              </button>
            </form>
          </div>

          {orbisError && (
            <div className="error-box">
              <AlertCircle size={18} />
              <span>{orbisError}</span>
              <button onClick={() => setOrbisError(null)}>Ã—</button>
            </div>
          )}

          {orbisLoading ? (
            <div className="loading-state">
              <Loader size={32} className="spin-icon" />
              <p>Fetching mods from Orbis...</p>
            </div>
          ) : orbisMods.length === 0 ? (
            <div className="empty-state">
              <p>No mods found on Orbis.place</p>
              <p className="empty-subtext">Try searching for specific mods or browse all</p>
              <button
                className="install-mod-btn secondary"
                onClick={() => fetchOrbisModsBrowser('')}
              >
                <Plus size={18} />
                <span>Browse All Mods</span>
              </button>
            </div>
          ) : (
            <>
              <div className="mods-count">
                <p>Found {orbisMods.length} mods on Orbis.place</p>
              </div>
              <div className="browser-mods-grid">
                {orbisMods.map((mod) => (
                  <div 
                    key={mod.id} 
                    className="browser-mod-card"
                    onClick={() => setSelectedMod(mod)}
                  >
                    {mod.iconUrl && (
                      <div className="browser-mod-icon">
                        <img src={mod.iconUrl} alt={mod.name} />
                      </div>
                    )}
                    <div className="browser-mod-content">
                      <h3>{mod.name}</h3>
                      <p className="browser-mod-author">
                        {mod.ownerUser?.username || mod.ownerUser?.name || 'Unknown'}
                      </p>
                      <p className="browser-mod-tagline">{mod.tagline}</p>
                  <div className="browser-mod-footer">
                        <span className="browser-mod-downloads">
                          <Download size={14} /> {(mod.downloadCount || 0).toLocaleString()}
                        </span>
                        <span className="click-hint">Click for details</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Detailed Mod Modal */}
      {selectedMod && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content mod-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <X size={24} />
            </button>

            <div className="modal-header mod-detail-header">
              {selectedMod.iconUrl && (
                <img src={selectedMod.iconUrl} alt={selectedMod.name} className="modal-icon" />
              )}
              <div className="modal-header-content">
                <h2>{selectedMod.name}</h2>
                <p className="modal-author">
                  by {selectedMod.ownerUser?.username || selectedMod.ownerUser?.name || 'Unknown'}
                </p>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="info-item">
                <Download size={18} />
                <div>
                  <span className="info-label">Downloads</span>
                  <span className="info-value">{(selectedMod.downloadCount || 0).toLocaleString()}</span>
                </div>
              </div>
              {selectedMod.latestVersion && selectedMod.latestVersion.versionNumber && (
                <div className="info-item">
                  <Tag size={18} />
                  <div>
                    <span className="info-label">Version</span>
                    <span className="info-value">v{selectedMod.latestVersion.versionNumber}</span>
                  </div>
                </div>
              )}
              {selectedMod.viewCount !== undefined && selectedMod.viewCount > 0 && (
                <div className="info-item">
                  <Eye size={18} />
                  <div>
                    <span className="info-label">Views</span>
                    <span className="info-value">{(selectedMod.viewCount || 0).toLocaleString()}</span>
                  </div>
                </div>
              )}
              {selectedMod.likeCount !== undefined && selectedMod.likeCount > 0 && (
                <div className="info-item">
                  <Heart size={18} />
                  <div>
                    <span className="info-label">Likes</span>
                    <span className="info-value">{(selectedMod.likeCount || 0).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="modal-tabs">
              <button 
                className={`modal-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`modal-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                <FileText size={14} /> Description
              </button>
              <button 
                className={`modal-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
                onClick={() => setActiveTab('gallery')}
              >
                <ImageIcon size={14} /> Gallery
              </button>
              <button 
                className={`modal-tab-btn ${activeTab === 'versions' ? 'active' : ''}`}
                onClick={() => setActiveTab('versions')}
              >
                <Tag size={14} /> Versions
              </button>
              <button 
                className={`modal-tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveTab('comments')}
              >
                <MessageSquare size={14} /> Comments
              </button>
            </div>

            <div className="modal-body mod-detail-body">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="tab-content">
                  {selectedMod.tagline && (
                    <div className="info-section">
                      <h4>Overview</h4>
                      <p>{selectedMod.tagline}</p>
                    </div>
                  )}
                  
                  {selectedMod.licenseType && (
                    <div className="info-section">
                      <h4>License</h4>
                      <p>{selectedMod.licenseType}</p>
                    </div>
                  )}

                  {selectedMod.categories && selectedMod.categories.length > 0 && (
                    <div className="info-section">
                      <h4>Categories</h4>
                      <div className="category-tags">
                        {selectedMod.categories.map((cat) => (
                          <span key={cat.id} className="category-tag">{cat.name}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMod.status && (
                    <div className="info-section">
                      <h4>Status</h4>
                      <p>
                        <span className="status-badge">{selectedMod.status}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Description Tab */}
              {activeTab === 'description' && (
                <div className="tab-content">
                  {selectedMod.description ? (
                    <div 
                      className="mod-description-full"
                      dangerouslySetInnerHTML={{ __html: selectedMod.description }}
                    />
                  ) : (
                    <p className="text-muted">No description available</p>
                  )}
                </div>
              )}

              {/* Gallery Tab */}
              {activeTab === 'gallery' && (
                <div className="tab-content">
                  {selectedMod.bannerUrl ? (
                    <div className="gallery-container">
                      <img src={selectedMod.bannerUrl} alt="Banner" className="gallery-image" />
                    </div>
                  ) : (
                    <p className="text-muted">No gallery images available</p>
                  )}
                </div>
              )}

              {/* Versions Tab */}
              {activeTab === 'versions' && (
                <div className="tab-content">
                  {selectedMod.latestVersion ? (
                    <div className="versions-list">
                      <div className="version-item">
                        <div className="version-header">
                          <h4>v{selectedMod.latestVersion.versionNumber}</h4>
                          <span className="version-badge">Latest</span>
                        </div>
                        <p className="version-date">
                          Released: {new Date(selectedMod.latestVersion.createdAt || selectedMod.updatedAt).toLocaleDateString()}
                        </p>
                        {selectedMod.latestVersion.changelog && (
                          <p className="version-changelog">{selectedMod.latestVersion.changelog}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted">No version information available</p>
                  )}
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className="tab-content">
                  {selectedMod.commentCount > 0 ? (
                    <div className="comments-list">
                      <p className="text-muted">Comments ({selectedMod.commentCount})</p>
                      <p className="text-muted" style={{ fontSize: '12px', marginTop: '10px' }}>
                        Comments are managed through Orbis.place
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted">No comments yet</p>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className={`btn-download ${installingMod === selectedMod.id ? 'installing' : ''}`}
                onClick={() => handleInstallMod(selectedMod)}
                disabled={installingMod === selectedMod.id}
              >
                {installingMod === selectedMod.id ? (
                  <>
                    <Loader size={16} className="spin-icon" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Download & Install
                  </>
                )}
              </button>
              <button className="btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModsTab;
