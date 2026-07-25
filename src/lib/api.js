let authToken = localStorage.getItem('subpilot_auth_token') || '';

export function setApiToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('subpilot_auth_token', token);
  } else {
    localStorage.removeItem('subpilot_auth_token');
  }
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Auth
  login: (userId, email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId, email, password })
    }),
  loginWithCredentials: ({ emailOrId, password, userId, email }) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrId, password, userId, email })
    }),
  register: (name, email, role, department, password) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, department })
    }),
  getMe: () => request('/api/auth/me'),
  getUsers: () => request('/api/auth/users'),
  toggleMfa: () => request('/api/auth/mfa/toggle', { method: 'POST' }),

  // Boards
  getBoards: () => request('/api/boards'),
  getBoard: (id) => request(`/api/boards/${id}`),
  createBoard: (data) => request('/api/boards', { method: 'POST', body: JSON.stringify(data) }),
  updateBoard: (id, data) => request(`/api/boards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBoard: (id) => request(`/api/boards/${id}`, { method: 'DELETE' }),
  createColumn: (boardId, title, color) =>
    request(`/api/boards/${boardId}/columns`, {
      method: 'POST',
      body: JSON.stringify({ title, color })
    }),

  // Tasks
  getTasks: (boardId) => request(`/api/tasks${boardId ? `?boardId=${boardId}` : ''}`),
  createTask: (data) => request('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
  moveTask: (id, targetListId, targetPosition) =>
    request(`/api/tasks/${id}/move`, {
      method: 'PUT',
      body: JSON.stringify({ targetListId, targetPosition })
    }),
  updateTask: (id, data) => request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),

  // Comments & Activities
  getComments: (taskId) => request(`/api/tasks/${taskId}/comments`),
  addComment: (taskId, content, mentions = []) =>
    request(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, mentions })
    }),
  getTaskActivities: (taskId) => request(`/api/tasks/${taskId}/activities`),

  // AI Service
  decomposeTask: (title, description) =>
    request('/api/ai/decompose-task', {
      method: 'POST',
      body: JSON.stringify({ title, description })
    }),
  summarizeComments: (taskId, taskTitle) =>
    request('/api/ai/summarize-comments', {
      method: 'POST',
      body: JSON.stringify({ taskId, taskTitle })
    }),

  // Analytics
  getCapacityMetrics: (boardId) => request(`/api/analytics/capacity${boardId ? `?boardId=${boardId}` : ''}`),
  getVelocityMetrics: (boardId) => request(`/api/analytics/velocity${boardId ? `?boardId=${boardId}` : ''}`),

  // Automations
  getAutomations: (boardId) => request(`/api/automations${boardId ? `?boardId=${boardId}` : ''}`),
  createAutomation: (data) => request('/api/automations', { method: 'POST', body: JSON.stringify(data) }),
  toggleAutomation: (id) => request(`/api/automations/${id}/toggle`, { method: 'PUT' }),
  testAutomation: (id) => request(`/api/automations/${id}/test`, { method: 'POST' }),
  deleteAutomation: (id) => request(`/api/automations/${id}`, { method: 'DELETE' }),

  // Security Audit
  getSecurityLogs: (params = {}) => {
    const query = new URLSearchParams();
    if (params.severity) query.append('severity', params.severity);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit);
    const qStr = query.toString();
    return request(`/api/security${qStr ? `?${qStr}` : ''}`);
  },
  logSecurityEvent: (action, details, severity = 'low') =>
    request('/api/security/log', {
      method: 'POST',
      body: JSON.stringify({ action, details, severity })
    }),
  clearSecurityLogs: () => request('/api/security/clear', { method: 'DELETE' }),

  // Matchmaking & Project Discovery
  getPostings: () => request('/api/matchmaking/postings'),
  createPosting: (data) =>
    request('/api/matchmaking/postings', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getApplications: () => request('/api/matchmaking/applications'),
  applyToProject: (projectId, pitchMessage, roleRequested) =>
    request('/api/matchmaking/applications', {
      method: 'POST',
      body: JSON.stringify({ projectId, pitchMessage, roleRequested })
    }),
  updateApplicationStatus: (id, status) =>
    request(`/api/matchmaking/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
  updateProfile: (data) =>
    request('/api/matchmaking/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Workspace Real-time Team Chat
  getChatMessages: (boardId) => request(`/api/chat/${boardId}`),
  sendChatMessage: (boardId, message) =>
    request(`/api/chat/${boardId}`, {
      method: 'POST',
      body: JSON.stringify({ message })
    })
};

// SSE Realtime Subscription Helper
export function subscribeRealtimeEvents(onEvent) {
  const eventSource = new EventSource('/api/realtime/stream');

  eventSource.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);
      if (data.event) {
        onEvent(data.event, data.payload);
      }
    } catch (e) {
      // ignore parse errors
    }
  };

  return () => {
    eventSource.close();
  };
}
