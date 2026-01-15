import React from 'react';
import { Home, Package, Settings } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'mods', label: 'Mods', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={`${process.env.PUBLIC_URL}/icon.webp`} alt="Gaia" className="logo-icon" />
        <h1>GAIA</h1>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
              title={item.label}
            >
              <Icon size={24} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="version-badge">v1.0.4</div>
      </div>
    </aside>
  );
};

export default Sidebar;
