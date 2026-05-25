import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/api';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard',   icon: '⬡', label: 'Dashboard',   roles: ['admin','manager','employee'] },
  { to: '/employees',   icon: '👥', label: 'Employees',   roles: ['admin','manager'] },
  { to: '/tasks',       icon: '✦',  label: 'Tasks',       roles: ['admin','manager','employee'] },
  { to: '/attendance',  icon: '◷',  label: 'Attendance',  roles: ['admin','manager','employee'] },
  { to: '/my-tasks',    icon: '◈',  label: 'My Tasks',    roles: ['employee'] },
  { to: '/profile',     icon: '◉',  label: 'Profile',     roles: ['admin','manager','employee'] },
];

export default function Sidebar() {
  const { user, logout, canManage } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">P</div>
        {!collapsed && (
          <div className="logo-text">
            <span className="logo-name">ProDesk</span>
            <span className="logo-sub">Workspace</span>
          </div>
        )}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="sidebar-role">
          <span className={`role-badge role-${user?.role}`}>
            {user?.role}
          </span>
        </div>
      )}

      {/* Nav Links */}
      <nav className="sidebar-nav">
        {visibleItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item--active' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">
            {getInitials(user?.name)}
          </div>
          {!collapsed && (
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-email">{user?.role}</span>
            </div>
          )}
        </div>
        <button
          className="logout-btn"
          onClick={handleLogout}
          title="Logout"
        >
          {collapsed ? '⊗' : '⊗ Logout'}
        </button>
      </div>
    </aside>
  );
}
