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
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Layout className="sidebar-logo-icon" />
          {!isCollapsed && <span className="sidebar-logo-text">PixelForge Nexus</span>}
        </div>
        <button
          className="sidebar-toggle"
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
            >
              <Icon className="sidebar-nav-icon" size={20} />
              {!isCollapsed && <span className="sidebar-nav-label">{item.label}</span>}
            </Link>
          );
        })}

        {filteredAdminItems.length > 0 && (
          <>
            {!isCollapsed && <div className="sidebar-divider">Admin</div>}
            {filteredAdminItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon className="sidebar-nav-icon" size={20} />
                  {!isCollapsed && <span className="sidebar-nav-label">{item.label}</span>}
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
          {!isCollapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          )}
        </div>
        <button
          className="sidebar-logout"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
