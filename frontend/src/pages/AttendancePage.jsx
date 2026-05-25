import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { attendanceAPI, formatDate, formatTime } from '../utils/api';
import './Attendance.css';

const STATUS_MAP = {
  present:  { cls: 'badge-green',  label: 'Present' },
  absent:   { cls: 'badge-red',    label: 'Absent' },
  half_day: { cls: 'badge-yellow', label: 'Half Day' },
};

export default function AttendancePage() {
  const { token, canManage } = useAuth();
  const toast = useToast();

  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [checking, setChecking]   = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const data = await attendanceAPI.getAll(token);
      setRecords(data);
      // Find today's record for current user
      const today = new Date().toDateString();
      const todayRec = data.find(r => new Date(r.date).toDateString() === today);
      setTodayRecord(todayRec || null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const handleCheckIn = async () => {
    setChecking(true);
    try {
      await attendanceAPI.checkIn(token);
      toast.success('Checked in successfully!');
      fetchAttendance();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setChecking(false);
    }
  };

  const handleCheckOut = async () => {
    setChecking(true);
    try {
      await attendanceAPI.checkOut(token);
      toast.success('Checked out successfully!');
      fetchAttendance();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setChecking(false);
    }
  };

  const todayStr = new Date().toDateString();
  const todayRecords = records.filter(r => new Date(r.date).toDateString() === todayStr);
  const presentToday = todayRecords.filter(r => r.status === 'present' || r.status === 'half_day').length;

  // Hours worked calculation
  const getHours = (rec) => {
    if (!rec.checkIn || !rec.checkOut) return null;
    const diff = (new Date(rec.checkOut) - new Date(rec.checkIn)) / (1000 * 60 * 60);
    return diff.toFixed(1);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track employee check-ins and work hours</p>
        </div>
      </div>

      {/* Today's Status Card */}
      <div className="attendance-hero fade-in">
        <div className="att-hero-left">
          <div className="att-clock">
            <ClockDisplay />
          </div>
          <div>
            <div className="att-date-label">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="att-status-text">
              {!todayRecord && 'You haven\'t checked in yet'}
              {todayRecord?.checkIn && !todayRecord?.checkOut && (
                <span style={{ color: 'var(--green)' }}>
                  ● Checked in at {formatTime(todayRecord.checkIn)}
                </span>
              )}
              {todayRecord?.checkOut && (
                <span style={{ color: 'var(--text-muted)' }}>
                  Checked out at {formatTime(todayRecord.checkOut)} · {getHours(todayRecord)}h worked
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="att-hero-actions">
          {!todayRecord && (
            <button
              className="btn btn-primary btn-lg att-btn"
              onClick={handleCheckIn}
              disabled={checking}
            >
              {checking ? 'Processing...' : '⏎ Check In'}
            </button>
          )}
          {todayRecord?.checkIn && !todayRecord?.checkOut && (
            <button
              className="btn btn-secondary btn-lg att-btn"
              onClick={handleCheckOut}
              disabled={checking}
            >
              {checking ? 'Processing...' : '⏏ Check Out'}
            </button>
          )}
          {todayRecord?.checkOut && (
            <div className="att-done">
              <span style={{ fontSize: 24 }}>✓</span>
              <span>Day complete</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>📋</div>
          <div className="stat-info">
            <div className="stat-label">Total Records</div>
            <div className="stat-value">{records.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>✓</div>
          <div className="stat-info">
            <div className="stat-label">Present Today</div>
            <div className="stat-value">{presentToday}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--yellow-bg)', color: 'var(--yellow)' }}>◐</div>
          <div className="stat-info">
            <div className="stat-label">Half Days</div>
            <div className="stat-value">{records.filter(r => r.status === 'half_day').length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>✕</div>
          <div className="stat-info">
            <div className="stat-label">Absent Days</div>
            <div className="stat-value">{records.filter(r => r.status === 'absent').length}</div>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="card fade-in">
        <div className="card-header">
          <span className="card-title">Attendance Records</span>
          <span className="card-count">{records.length} records</span>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◷</div>
            <div className="empty-title">No attendance records yet</div>
            <div className="empty-desc">Check in to start tracking attendance</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {canManage && <th>Employee</th>}
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map(rec => {
                  const sm = STATUS_MAP[rec.status] || { cls: 'badge-gray', label: rec.status || '—' };
                  return (
                    <tr key={rec._id}>
                      {canManage && (
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>
                              {(rec.employee?.user?.name || 'U').charAt(0)}
                            </div>
                            {rec.employee?.user?.name || '—'}
                          </div>
                        </td>
                      )}
                      <td>{formatDate(rec.date)}</td>
                      <td>{rec.checkIn ? formatTime(rec.checkIn) : '—'}</td>
                      <td>{rec.checkOut ? formatTime(rec.checkOut) : <span style={{ color: 'var(--green)', fontSize: 12 }}>● Still in</span>}</td>
                      <td>{getHours(rec) ? `${getHours(rec)}h` : '—'}</td>
                      <td><span className={`badge ${sm.cls}`}>{sm.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ClockDisplay() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="live-clock">
      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
}
