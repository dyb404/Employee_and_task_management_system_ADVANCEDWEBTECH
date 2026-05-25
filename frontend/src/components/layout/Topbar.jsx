import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Topbar.css';

const TITLES = {
  '/dashboard':  { title: 'Dashboard',    sub: 'Overview of your workspace' },
  '/employees':  { title: 'Employees',    sub: 'Manage your team members' },
  '/tasks':      { title: 'Tasks',        sub: 'Track and manage all tasks' },
  '/attendance': { title: 'Attendance',   sub: 'Check-in/out and attendance records' },
  '/my-tasks':   { title: 'My Tasks',     sub: 'Your assigned tasks' },
  '/profile':    { title: 'Profile',      sub: 'Your account information' },
};

export default function Topbar() {
  const location = useLocation();
  const { user } = useAuth();
  const info = TITLES[location.pathname] || { title: 'WorkFlow', sub: '' };

  const now = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{info.title}</h1>
        <span className="topbar-sub">{info.sub}</span>
      </div>
      <div className="topbar-right">
        <span className="topbar-date">{now}</span>
        <div className="topbar-user">
          <span className="topbar-greeting">Hi, {user?.name?.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  );
}
