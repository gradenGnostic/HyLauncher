import React, { useState, useEffect } from 'react';
import { Loader, X, Download, User, Tag, Eye } from 'lucide-react';
import './HomeTab.css';

const HomeTab = () => {
  const [featuredMods, setFeaturedMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMod, setSelectedMod] = useState(null);

  useEffect(() => {
    fetchFeaturedMods();
  }, []);

  const fetchFeaturedMods = async () => {
    try {
      setLoading(true);
      const result = await window.electronAPI.fetchOrbisMods('');
      if (result.success) {
        setFeaturedMods((result.data || []).slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to load featured mods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModClick = (mod) => {
    setSelectedMod(mod);
  };

  const closeModal = () => {
    setSelectedMod(null);
  };

  return (
    <div className="home-tab">
      {/* Hero Banner with Planet Icon */}
      <div className="home-hero">
        <div className="hero-content">
          <div className="hero-planet-icon">
            <img src={process.env.PUBLIC_URL + '/icon.webp'} alt="Gaia" onError={(e) => console.log('Image failed to load:', e)} />
          </div>
          <div className="hero-text">
            <h1>Welcome to Gaia</h1>
          </div>
        </div>
      </div>

      <div className="home-header"></div>

      <div className="home-content">

        {/* Featured Section */}
        <div className="featured-section">
          <h2>Featured Mods</h2>
          <p className="section-subtitle">Popular mods from the Orbis marketplace</p>
          {loading ? (
            <div className="loading-state">
              <Loader size={32} className="spin-icon" />
              <p>Loading featured mods...</p>
            </div>
          ) : featuredMods.length === 0 ? (
            <div className="empty-state">
              <p>No mods available</p>
            </div>
          ) : (
            <div className="featured-grid">
              {featuredMods.map((mod) => (
                <div 
                  key={mod.id} 
                  className="featured-mod-card"
                  onClick={() => handleModClick(mod)}
                >
                  {mod.iconUrl && (
                    <div className="mod-icon-container">
                      <img src={mod.iconUrl} alt={mod.name} className="mod-icon" />
                    </div>
                  )}
                  
                  <div className="featured-mod-header">
                    <h3>{mod.name}</h3>
                    {mod.ownerUser && <p className="mod-author">by {mod.ownerUser.username || mod.ownerUser.name}</p>}
                  </div>

                  {mod.latestVersion && (
                    <div className="mod-meta">
                      <span className="mod-version">v{mod.latestVersion.versionNumber}</span>
                    </div>
                  )}

                  {mod.tagline && (
                    <p className="mod-description">{mod.tagline}</p>
                  )}

                  <div className="mod-stats">
                    {mod.downloadCount !== undefined && (
                      <div className="stat">
                        <span className="stat-label">Downloads</span>
                        <span className="stat-value">
                          {mod.downloadCount > 1000 ? `${(mod.downloadCount / 1000).toFixed(1)}k` : mod.downloadCount}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="card-hover-hint">Click for details</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Mod Detail Modal */}
      {selectedMod && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <X size={24} />
            </button>

            <div className="modal-header">
              {selectedMod.iconUrl && (
                <img src={selectedMod.iconUrl} alt={selectedMod.name} className="modal-icon" />
              )}
              <div>
                <h2>{selectedMod.name}</h2>
                <p className="modal-author">
                  by {selectedMod.ownerUser?.username || selectedMod.ownerUser?.name || 'Unknown'}
                </p>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="info-item">
                <Download size={18} />
                <span>{selectedMod.downloadCount || 0} downloads</span>
              </div>
              {selectedMod.latestVersion && (
                <div className="info-item">
                  <Tag size={18} />
                  <span>v{selectedMod.latestVersion.versionNumber}</span>
                </div>
              )}
              {selectedMod.viewCount !== undefined && (
                <div className="info-item">
                  <Eye size={18} />
                  <span>{selectedMod.viewCount} views</span>
                </div>
              )}
              {selectedMod.likeCount !== undefined && (
                <div className="info-item">
                  <span>❤️</span>
                  <span>{selectedMod.likeCount} likes</span>
                </div>
              )}
            </div>

            <div className="modal-body">
              {selectedMod.tagline && (
                <div className="info-section">
                  <h4>Overview</h4>
                  <p>{selectedMod.tagline}</p>
                </div>
              )}

              {selectedMod.description && (
                <div className="info-section">
                  <h4>Description</h4>
                  <div 
                    className="mod-description-full"
                    dangerouslySetInnerHTML={{ __html: selectedMod.description }}
                  />
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
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeTab;
