import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getInitials } from '../utils/api';

const ROLE_PERMS = {
  admin:    ['View all employees', 'Manage employees', 'Create & delete tasks', 'View all attendance', 'Access all modules'],
  manager:  ['View all employees', 'Manage employees', 'Create & delete tasks', 'View all attendance'],
  employee: ['View own tasks', 'Update task status', 'Check in/out attendance', 'View own attendance'],
};

const ROLE_COLORS = {
  admin:    { bg: 'var(--red-bg)',    color: 'var(--red)' },
  manager:  { bg: 'var(--purple-bg)', color: 'var(--purple)' },
  employee: { bg: 'var(--green-bg)', color: 'var(--green)' },
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const colors = ROLE_COLORS[user?.role] || { bg: 'var(--accent-glow)', color: 'var(--accent)' };
  const perms  = ROLE_PERMS[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Profile Header */}
      <div className="card fade-in" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div
            className="avatar"
            style={{
              width: 80, height: 80, fontSize: 28,
              background: colors.bg, color: colors.color,
              border: `2px solid ${colors.color}`,
              flexShrink: 0
            }}
          >
            {getInitials(user?.name)}
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              {user?.name}
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 12 }}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </p>
            <span
              className="badge"
              style={{ background: colors.bg, color: colors.color, padding: '5px 14px', fontSize: 13 }}
            >
              {user?.role}
            </span>
          </div>

          <button className="btn btn-danger" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Account Info */}
      <div className="card fade-in" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
          Account Information
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { label: 'Full Name', value: user?.name },
            { label: 'User ID',   value: user?.id },
            { label: 'Role',      value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) },
          ].map(row => (
            <div
              key={row.label}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 0',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>{row.label}</span>
              <span style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: row.label === 'User ID' ? 'monospace' : undefined, fontSize: row.label === 'User ID' ? 12 : 14 }}>
                {row.value || '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions */}
      <div className="card fade-in">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
          Your Permissions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {perms.map(perm => (
            <div
              key={perm}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}
            >
              <span style={{ color: 'var(--green)', fontSize: 14, fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{perm}</span>
            </div>
          ))}
        </div>

        {user?.role === 'employee' && (
          <div
            style={{ marginTop: 16, padding: '14px 16px', background: 'var(--accent-glow)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--accent)' }}
          >
            ℹ You have employee-level access. Contact your manager or admin to change your role.
          </div>
        )}
      </div>
    </div>
  );
}
