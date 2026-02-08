import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Layout,
  Home,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
  UserPlus,
  Users,
  Info
} from 'lucide-react';
import Button from './Button';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard', roles: ['Admin', 'Project Lead', 'Developer'] },
    { path: '/guide', icon: Info, label: 'Functionality Guide', roles: ['Admin', 'Project Lead', 'Developer'] },
    { path: '/settings', icon: Settings, label: 'Settings', roles: ['Admin', 'Project Lead', 'Developer'] },
  ];

  const adminItems = [
    { path: '/users', icon: Users, label: 'User Management', roles: ['Admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));
  const filteredAdminItems = adminItems.filter(item => item.roles.includes(user?.role));

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="mobile-sidebar-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      <div className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Layout className="sidebar-logo-icon" />
            {(!isCollapsed || isMobileOpen) && <span className="sidebar-logo-text">PixelForge Nexus</span>}
          </div>
          <button
            className="sidebar-toggle desktop-only"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const linkClass = `sidebar-nav-item ${isActive ? 'active' : ''}`;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={linkClass}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon className="sidebar-nav-icon" size={20} />
                {(!isCollapsed || isMobileOpen) && <span className="sidebar-nav-label">{item.label}</span>}
              </Link>
            );
          })}

          {filteredAdminItems.length > 0 && (
            <>
              {(!isCollapsed || isMobileOpen) && <div className="sidebar-divider">Admin</div>}
              {filteredAdminItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon className="sidebar-nav-icon" size={20} />
                    {(!isCollapsed || isMobileOpen) && <span className="sidebar-nav-label">{item.label}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user?.name}</div>
                <div className="sidebar-user-role">{user?.role}</div>
              </div>
            )}
          </div>
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            className="sidebar-logout w-full justify-start"
          >
            <LogOut size={20} />
            {(!isCollapsed || isMobileOpen) && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
