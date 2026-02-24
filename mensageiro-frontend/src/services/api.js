import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
};

export const usersApi = {
  me: () => api.get('/api/users/me'),
  list: () => api.get('/api/users'),
};

export const templatesApi = {
  create: (data) => api.post('/api/templates', data),
  listMine: () => api.get('/api/templates/mine'),
  listAll: () => api.get('/api/templates'),
  getById: (id) => api.get(`/api/templates/${id}`),
  update: (id, data) => api.put(`/api/templates/${id}`, data),
  delete: (id) => api.delete(`/api/templates/${id}`),
};

export const emailsApi = {
  send: (data) => api.post('/api/emails/send', data),
  history: () => api.get('/api/emails/history'),
};

export default api;