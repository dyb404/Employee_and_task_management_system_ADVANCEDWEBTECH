import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { employeeAPI, getInitials, formatDate } from '../utils/api';
import './Employees.css';

export default function EmployeesPage() {
  const { token } = useAuth();
  const toast = useToast();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [delTarget, setDelTarget] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await employeeAPI.getAll(token);
      setEmployees(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleDelete = async (id) => {
    try {
      await employeeAPI.remove(id, token);
      toast.success('Employee deactivated');
      setDelTarget(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = employees.filter(emp => {
    const name = emp.user?.name?.toLowerCase() || '';
    const email = emp.user?.email?.toLowerCase() || '';
    const dept = emp.department?.name?.toLowerCase() || '';
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q) || dept.includes(q);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{employees.length} team members registered</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 220 }}
          />
          <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowModal(true); }}>
            + Add Employee
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <div className="empty-title">No employees found</div>
            <div className="empty-desc">Try adjusting your search or add a new employee</div>
          </div>
        </div>
      ) : (
        <div className="employees-grid fade-in">
          {filtered.map(emp => (
            <EmployeeCard
              key={emp._id}
              emp={emp}
              onEdit={() => { setEditTarget(emp); setShowModal(true); }}
              onDelete={() => setDelTarget(emp)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <EmployeeModal
          token={token}
          initial={editTarget}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchEmployees(); }}
          toast={toast}
        />
      )}

      {delTarget && (
        <ConfirmModal
          title="Deactivate Employee"
          message={`Are you sure you want to deactivate ${delTarget.user?.name}? They will no longer be able to access the system.`}
          onConfirm={() => handleDelete(delTarget._id)}
          onCancel={() => setDelTarget(null)}
          danger
        />
      )}
    </div>
  );
}

function EmployeeCard({ emp, onEdit, onDelete }) {
  return (
    <div className="emp-card fade-in">
      <div className="emp-card-top">
        <div className="avatar avatar-lg" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
          {getInitials(emp.user?.name)}
        </div>
        <div className="emp-status-dot" data-active={emp.isActive} title={emp.isActive ? 'Active' : 'Inactive'} />
      </div>

      <div className="emp-name">{emp.user?.name || '—'}</div>
      <div className="emp-designation">{emp.designation || 'No designation'}</div>

      <div className="emp-meta">
        <div className="emp-meta-row">
          <span className="emp-meta-label">Email</span>
          <span className="emp-meta-value">{emp.user?.email || '—'}</span>
        </div>
        <div className="emp-meta-row">
          <span className="emp-meta-label">Phone</span>
          <span className="emp-meta-value">{emp.phone || '—'}</span>
        </div>
        <div className="emp-meta-row">
          <span className="emp-meta-label">Department</span>
          <span className="emp-meta-value">{emp.department?.name || '—'}</span>
        </div>
        <div className="emp-meta-row">
          <span className="emp-meta-label">Hired</span>
          <span className="emp-meta-value">{formatDate(emp.hireDate)}</span>
        </div>
      </div>

      <div className="emp-role-badge">
        <span className={`badge badge-${emp.user?.role === 'admin' ? 'red' : emp.user?.role === 'manager' ? 'purple' : 'blue'}`}>
          {emp.user?.role}
        </span>
        <span className={`badge ${emp.isActive ? 'badge-green' : 'badge-gray'}`}>
          {emp.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="emp-actions">
        <button className="btn btn-secondary btn-sm" onClick={onEdit}>Edit</button>
        <button className="btn btn-danger btn-sm" onClick={onDelete}>Deactivate</button>
      </div>
    </div>
  );
}

function EmployeeModal({ token, initial, onClose, onSaved, toast }) {
  const [form, setForm] = useState({
    user: initial?.user?._id || '',
    designation: initial?.designation || '',
    phone: initial?.phone || '',
    hireDate: initial?.hireDate ? initial.hireDate.slice(0, 10) : '',
    isActive: initial?.isActive !== false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [e.target.name]: val }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initial) {
        await employeeAPI.update(initial._id, form, token);
        toast.success('Employee updated');
      } else {
        if (!form.user) { setError('User ID is required'); setLoading(false); return; }
        await employeeAPI.create(form, token);
        toast.success('Employee created');
      }
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
          <span className="modal-title">{initial ? 'Edit Employee' : 'Add Employee'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠ {error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!initial && (
            <div className="form-group">
              <label className="form-label">User ID (MongoDB ObjectId)</label>
              <input
                type="text"
                name="user"
                className="form-input"
                placeholder="User ID from Users collection"
                value={form.user}
                onChange={handleChange}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                The user must already be registered. Use their ID from the database.
              </small>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                name="designation"
                className="form-input"
                placeholder="e.g. Software Engineer"
                value={form.designation}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                name="phone"
                className="form-input"
                placeholder="+1 234 567 8900"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Hire Date</label>
            <input
              type="date"
              name="hireDate"
              className="form-input"
              value={form.hireDate}
              onChange={handleChange}
            />
          </div>

          {initial && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                style={{ width: 16, height: 16 }}
              />
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Active employee</span>
            </label>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : initial ? 'Update' : 'Create'}
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
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
