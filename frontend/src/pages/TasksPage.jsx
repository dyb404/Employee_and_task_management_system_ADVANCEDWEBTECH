import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { taskAPI, employeeAPI, formatDate, formatDateTime } from '../utils/api';
import './Tasks.css';

const STATUS_OPTS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function TasksPage() {
  const { token, canManage } = useAuth();
  const toast = useToast();

  const [tasks, setTasks]         = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('');
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [delTarget, setDelTarget] = useState(null);

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

  useEffect(() => {
    if (canManage) {
      employeeAPI.getAll(token).then(setEmployees).catch(() => {});
    }
  }, [token, canManage]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskAPI.updateStatus(taskId, newStatus, token);
      toast.success('Task status updated');
      fetchTasks();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await taskAPI.remove(id, token);
      toast.success('Task deleted');
      setDelTarget(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = tasks.filter(t => {
    const q = search.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.assignedBy?.name?.toLowerCase().includes(q) ||
      t.assignedTo?.user?.name?.toLowerCase().includes(q)
    );
  });

  const grouped = {
    pending:     filtered.filter(t => t.status === 'pending'),
    in_progress: filtered.filter(t => t.status === 'in_progress'),
    completed:   filtered.filter(t => t.status === 'completed'),
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} tasks total</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 180 }}
          />
          <select
            className="form-select"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ width: 160 }}
          >
            {STATUS_OPTS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {canManage && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + New Task
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <div className="empty-title">No tasks found</div>
            <div className="empty-desc">Adjust filters or create a new task</div>
          </div>
        </div>
      ) : (
        <div className="kanban-board fade-in">
          {Object.entries(grouped).map(([status, items]) => (
            <KanbanColumn
              key={status}
              status={status}
              items={items}
              canManage={canManage}
              onStatusChange={handleStatusChange}
              onDelete={setDelTarget}
            />
          ))}
        </div>
      )}

      {showModal && (
        <TaskModal
          token={token}
          employees={employees}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchTasks(); }}
          toast={toast}
        />
      )}

      {delTarget && (
        <ConfirmModal
          title="Delete Task"
          message={`Delete "${delTarget.title}"? This action cannot be undone.`}
          onConfirm={() => handleDelete(delTarget._id)}
          onCancel={() => setDelTarget(null)}
          danger
        />
      )}
    </div>
  );
}

const STATUS_META = {
  pending:     { label: 'Pending',     color: 'var(--yellow)', cls: 'badge-yellow', icon: '⏳' },
  in_progress: { label: 'In Progress', color: 'var(--purple)', cls: 'badge-purple', icon: '⚡' },
  completed:   { label: 'Completed',   color: 'var(--green)',  cls: 'badge-green',  icon: '✓' },
};

const NEXT_STATUS = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: null,
};

function KanbanColumn({ status, items, canManage, onStatusChange, onDelete }) {
  const meta = STATUS_META[status];
  return (
    <div className="kanban-col">
      <div className="kanban-col-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{meta.icon}</span>
          <span className="kanban-col-title">{meta.label}</span>
        </div>
        <span className="kanban-col-count">{items.length}</span>
      </div>
      <div className="kanban-cards">
        {items.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
            No tasks here
          </div>
        ) : (
          items.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              canManage={canManage}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, canManage, onStatusChange, onDelete }) {
  const meta = STATUS_META[task.status];
  const next = NEXT_STATUS[task.status];
  const nextMeta = next ? STATUS_META[next] : null;

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed';

  return (
    <div className="task-card fade-in">
      <div className="task-card-header">
        <span className={`badge ${meta.cls}`}>{meta.label}</span>
        {isOverdue && <span className="badge badge-red">Overdue</span>}
      </div>

      <h3 className="task-card-title">{task.title}</h3>
      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      <div className="task-card-meta">
        {task.assignedTo?.user?.name && (
          <div className="task-meta-row">
            <span className="task-meta-label">Assigned to</span>
            <span className="task-meta-val">{task.assignedTo.user.name}</span>
          </div>
        )}
        {task.assignedBy?.name && (
          <div className="task-meta-row">
            <span className="task-meta-label">Assigned by</span>
            <span className="task-meta-val">{task.assignedBy.name}</span>
          </div>
        )}
        {task.deadline && (
          <div className="task-meta-row">
            <span className="task-meta-label">Deadline</span>
            <span className="task-meta-val" style={{ color: isOverdue ? 'var(--red)' : undefined }}>
              {formatDate(task.deadline)}
            </span>
          </div>
        )}
        <div className="task-meta-row">
          <span className="task-meta-label">Created</span>
          <span className="task-meta-val">{formatDateTime(task.createdAt)}</span>
        </div>
      </div>

      <div className="task-card-actions">
        {next && (
          <button
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
            onClick={() => onStatusChange(task._id, next)}
          >
            → {nextMeta.label}
          </button>
        )}
        {canManage && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(task)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

function TaskModal({ token, employees, onClose, onSaved, toast }) {
  const [form, setForm] = useState({
    title: '', description: '', assignedTo: '', deadline: '', status: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Task title is required'); return; }
    setLoading(true);
    try {
      const body = { ...form };
      if (!body.assignedTo) delete body.assignedTo;
      if (!body.deadline)   delete body.deadline;
      await taskAPI.create(body, token);
      toast.success('Task created successfully');
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title">Create New Task</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠ {error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="Enter task title"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              placeholder="Task details..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select name="assignedTo" className="form-select" value={form.assignedTo} onChange={handleChange}>
                <option value="">Unassigned</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.user?.name || emp.user?.email || emp._id}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input
                type="date"
                name="deadline"
                className="form-input"
                value={form.deadline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel, danger }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal-box" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
