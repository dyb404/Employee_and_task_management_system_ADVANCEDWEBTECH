export const API_BASE = 'http://localhost:5000/api';

export async function apiFetch(endpoint, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
}

// Auth
export const authAPI = {
  login:    (body)          => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body)          => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
};

// Employees
export const employeeAPI = {
  getAll:   (token)         => apiFetch('/employees', {}, token),
  getById:  (id, token)     => apiFetch(`/employees/${id}`, {}, token),
  create:   (body, token)   => apiFetch('/employees', { method: 'POST', body: JSON.stringify(body) }, token),
  update:   (id, body, token) => apiFetch(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(body) }, token),
  remove:   (id, token)     => apiFetch(`/employees/${id}`, { method: 'DELETE' }, token),
};

// Tasks
export const taskAPI = {
  getAll:   (token, status) => apiFetch(`/tasks${status ? `?status=${status}` : ''}`, {}, token),
  create:   (body, token)   => apiFetch('/tasks', { method: 'POST', body: JSON.stringify(body) }, token),
  updateStatus: (id, status, token) => apiFetch(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token),
  remove:   (id, token)     => apiFetch(`/tasks/${id}`, { method: 'DELETE' }, token),
};

// Users
export const userAPI = {
  getAll:   (token)         => apiFetch('/users', {}, token),
  create:   (body, token)   => apiFetch('/users', { method: 'POST', body: JSON.stringify(body) }, token),
};

// Attendance
export const attendanceAPI = {
  checkIn:  (token)         => apiFetch('/attendance/checkin', { method: 'POST' }, token),
  checkOut: (token)         => apiFetch('/attendance/checkout', { method: 'PATCH' }, token),
  getAll:   (token)         => apiFetch('/attendance', {}, token),
};

// Helpers
export function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

export function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}
