import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { taskAPI, formatDate } from '../utils/api';

const STATUS_META = {
  pending:     { cls: 'badge-yellow', label: 'Pending',     color: 'var(--yellow)', icon: '⏳' },
  in_progress: { cls: 'badge-purple', label: 'In Progress', color: 'var(--purple)', icon: '⚡' },
  completed:   { cls: 'badge-green',  label: 'Completed',   color: 'var(--green)',  icon: '✓' },
};

const NEXT_STATUS = {
  pending:     'in_progress',
  in_progress: 'completed',
  completed:   null,
};

export default function MyTasksPage() {
  const { token } = useAuth();
  const toast = useToast();

  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await taskAPI.getAll(token, filter);
      setTasks(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskAPI.updateStatus(taskId, newStatus, token);
      toast.success(`Task moved to ${STATUS_META[newStatus].label}`);
      fetchTasks();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const completed  = tasks.filter(t => t.status === 'completed').length;
  const total      = tasks.length;
  const progress   = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">Tasks assigned to you</p>
        </div>
        <select
          className="form-select"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ width: 160 }}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Progress Bar */}
      {total > 0 && (
        <div className="card fade-in" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Overall Progress
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--green)' }}>
              {progress}%
            </span>
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 100, height: 8, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--accent), var(--green))',
              borderRadius: 100,
              transition: 'width 0.6s ease'
            }} />
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
            {Object.entries(STATUS_META).map(([key, meta]) => (
              <span key={key} style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: meta.color }}>{meta.icon}</span>
                {tasks.filter(t => t.status === key).length} {meta.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : tasks.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <div className="empty-title">No tasks assigned to you</div>
            <div className="empty-desc">Check back later or contact your manager</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tasks.map(task => {
            const meta = STATUS_META[task.status];
            const next = NEXT_STATUS[task.status];
            const nextMeta = next ? STATUS_META[next] : null;
            const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed';

            return (
              <div key={task._id} className="card fade-in" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {/* Status Indicator */}
                <div style={{
                  width: 4, alignSelf: 'stretch', borderRadius: 4,
                  background: meta.color, flexShrink: 0
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          {task.description}
                        </p>
                      )}
                    </div>
                    <span className={`badge ${meta.cls}`}>{meta.label}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    {task.deadline && (
                      <span style={{ fontSize: 13, color: isOverdue ? 'var(--red)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {isOverdue ? '⚠' : '◷'} Due {formatDate(task.deadline)}
                      </span>
                    )}
                    {task.assignedBy?.name && (
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        Assigned by {task.assignedBy.name}
                      </span>
                    )}

                    {next && (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ marginLeft: 'auto' }}
                        onClick={() => handleStatusChange(task._id, next)}
                      >
                        {meta.icon} Mark as {nextMeta.label}
                      </button>
                    )}
                    {!next && (
                      <span style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: 13, fontWeight: 600 }}>
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
