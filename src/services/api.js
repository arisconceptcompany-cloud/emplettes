import axios from 'axios';

const API_URL = 'https://empletteapi.aris-cc.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const articleAPI = {
  getAll: () => api.get('/articles'),
  getById: (id) => api.get(`/articles/${id}`),
  create: (data) => api.post('/articles', data),
  update: (id, data) => api.put(`/articles/${id}`, data),
  delete: (id) => api.delete(`/articles/${id}`)
};

export const venteAPI = {
  getAll: () => api.get('/ventes'),
  create: (data) => api.post('/ventes', data)
};

export const alerteAPI = {
  getLowStock: () => api.get('/alertes')
};

export default api;