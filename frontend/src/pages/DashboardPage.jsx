import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { employeeAPI, taskAPI, attendanceAPI, formatDate, formatTime } from '../utils/api';
import './Dashboard.css';

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="stat-card fade-in">
      <div className="stat-icon" style={{ background: bg, color }}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value ?? '—'}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, token, canManage, isEmployee } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks]         = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [t, a] = await Promise.all([
          taskAPI.getAll(token),
          attendanceAPI.getAll(token),
        ]);
        setTasks(t);
        setAttendance(a);

        if (canManage) {
          const e = await employeeAPI.getAll(token);
          setEmployees(e);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token, canManage]);

  const pendingTasks    = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completedTasks  = tasks.filter(t => t.status === 'completed').length;

  const todayStr = new Date().toDateString();
  const todayAttendance = attendance.filter(a => new Date(a.date).toDateString() === todayStr);

  const recentTasks = [...tasks].reverse().slice(0, 5);
  const recentAttendance = [...attendance].reverse().slice(0, 5);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
    </div>
  );

  return (
    <div>
      {/* Welcome Banner */}
      <div className="welcome-banner fade-in">
        <div className="welcome-text">
          <h2 className="welcome-title">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h2>
          <p className="welcome-sub">Here's what's happening across your workspace today.</p>
        </div>
        <div className="welcome-badge">
          <span className={`role-badge role-${user?.role}`} style={{ fontSize: 13, padding: '6px 14px' }}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {canManage && (
          <StatCard
            icon="👥"
            label="Total Employees"
            value={employees.length}
            color="var(--accent)"
            bg="var(--accent-glow)"
          />
        )}
        <StatCard
          icon="⏳"
          label="Pending Tasks"
          value={pendingTasks}
          color="var(--yellow)"
          bg="var(--yellow-bg)"
        />
        <StatCard
          icon="⚡"
          label="In Progress"
          value={inProgressTasks}
          color="var(--purple)"
          bg="var(--purple-bg)"
        />
        <StatCard
          icon="✅"
          label="Completed"
          value={completedTasks}
          color="var(--green)"
          bg="var(--green-bg)"
        />
        <StatCard
          icon="📋"
          label="Today's Check-ins"
          value={todayAttendance.length}
          color="var(--accent)"
          bg="var(--accent-glow)"
        />
      </div>

      {/* Bottom Grid */}
      <div className="dashboard-grid">
        {/* Recent Tasks */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Tasks</span>
            <span className="card-count">{tasks.length} total</span>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-icon">✦</div>
              <div className="empty-title">No tasks yet</div>
            </div>
          ) : (
            <div className="task-list">
              {recentTasks.map(task => (
                <div key={task._id} className="task-row">
                  <div className="task-row-left">
                    <div className="task-dot" data-status={task.status} />
                    <div>
                      <div className="task-row-title">{task.title}</div>
                      <div className="task-row-meta">
                        {task.assignedBy?.name && `by ${task.assignedBy.name}`}
                        {task.deadline && ` · Due ${formatDate(task.deadline)}`}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Attendance */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Attendance Log</span>
            <span className="card-count">{attendance.length} records</span>
          </div>
          {recentAttendance.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-icon">◷</div>
              <div className="empty-title">No records yet</div>
            </div>
          ) : (
            <div className="task-list">
              {recentAttendance.map(rec => (
                <div key={rec._id} className="task-row">
                  <div className="task-row-left">
                    <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                      {(rec.employee?.user?.name || 'U').charAt(0)}
                    </div>
                    <div>
                      <div className="task-row-title">
                        {rec.employee?.user?.name || 'Employee'}
                      </div>
                      <div className="task-row-meta">
                        In: {formatTime(rec.checkIn)} {rec.checkOut ? `· Out: ${formatTime(rec.checkOut)}` : '· Still in'}
                      </div>
                    </div>
                  </div>
                  <AttBadge status={rec.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:     { cls: 'badge-yellow', label: 'Pending' },
    in_progress: { cls: 'badge-purple', label: 'In Progress' },
    completed:   { cls: 'badge-green',  label: 'Completed' },
  };
  const s = map[status] || { cls: 'badge-gray', label: status };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

function AttBadge({ status }) {
  const map = {
    present:  { cls: 'badge-green',  label: 'Present' },
    absent:   { cls: 'badge-red',    label: 'Absent' },
    half_day: { cls: 'badge-yellow', label: 'Half Day' },
  };
  const s = map[status] || { cls: 'badge-gray', label: status || '—' };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
