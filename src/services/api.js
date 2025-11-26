import axios from 'axios';

// API base URL - change this to your backend URL
// const API_URL = import.meta.env.VITE_API_URL || 'http://103.122.85.61:5001/api';
const API_URL = import.meta.env.VITE_API_URL || 'https://jobs.wizoneit.com/api/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔑 Request interceptor - Token exists:', !!token);
    console.log('🔑 Request URL:', config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token attached to request');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on 401 if it's from auth endpoints or if token is definitely invalid
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      const hasToken = localStorage.getItem('token');
      
      // Only force logout if it's an auth endpoint or there's no token at all
      if (isAuthEndpoint || !hasToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        window.location.href = '/admin/login';
      }
      // For other 401s, just let the component handle it
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  createDefaultAdmin: () => api.post('/auth/create-admin')
};

// Tenant Auth API
export const tenantAuthAPI = {
  register: (data) => api.post('/tenant-auth/register', data),
  login: (credentials) => api.post('/tenant-auth/login', credentials),
  getMe: () => api.get('/tenant-auth/me')
};

// Super Admin API
export const superAdminAPI = {
  getAllTenants: (params) => api.get('/super-admin/tenants', { params }),
  getTenant: (id) => api.get(`/super-admin/tenants/${id}`),
  approveTenant: (id) => api.post(`/super-admin/tenants/${id}/approve`),
  rejectTenant: (id, reason) => api.post(`/super-admin/tenants/${id}/reject`, { reason }),
  suspendTenant: (id) => api.post(`/super-admin/tenants/${id}/suspend`),
  updatePayment: (id, data) => api.post(`/super-admin/tenants/${id}/payment`, data),
  updateTenant: (id, data) => api.put(`/super-admin/tenants/${id}`, data),
  deleteTenant: (id) => api.delete(`/super-admin/tenants/${id}`)
};

// Positions API
export const positionsAPI = {
  getAll: (params) => api.get('/positions', { params }),
  getById: (id) => api.get(`/positions/${id}`),
  create: (data) => api.post('/positions', data),
  update: (id, data) => api.put(`/positions/${id}`, data),
  delete: (id, params) => api.delete(`/positions/${id}`, { params })
};

// Applications API
export const applicationsAPI = {
  submit: (formData, onUploadProgress) => {
    return api.post('/applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },
  getAll: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
  delete: (id) => api.delete(`/applications/${id}`),
  getDashboardStats: () => api.get('/applications/stats/dashboard')
};

// Files API
export const filesAPI = {
  getResume: (filename) => `${API_URL}/files/resume/${filename}`,
  getPhoto: (filename) => `${API_URL}/files/photo/${filename}`,
  downloadResume: (filename) => {
    const token = localStorage.getItem('token');
    return axios({
      url: `${API_URL}/files/download/resume/${filename}`,
      method: 'GET',
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

// Company Settings API
export const companySettingsAPI = {
  get: () => api.get('/company-settings'),
  update: (data) => api.put('/company-settings', data),
  uploadLogo: (formData) => api.post('/company-settings/upload-logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

// Email Config API
export const emailConfigAPI = {
  get: () => api.get('/email-config'),
  create: (data) => api.post('/email-config', data),
  update: (id, data) => api.put(`/email-config/${id}`, data),
  test: () => api.post('/email-config/test'),
  sendTest: (email) => api.post('/email-config/test-send', { email })
};

// Email Templates API
export const emailTemplatesAPI = {
  getAll: () => api.get('/email-templates'),
  getById: (id) => api.get(`/email-templates/${id}`),
  getByType: (type) => api.get(`/email-templates/type/${type}`),
  create: (data) => api.post('/email-templates', data),
  update: (id, data) => api.put(`/email-templates/${id}`, data),
  delete: (id) => api.delete(`/email-templates/${id}`),
  reset: (type) => api.post(`/email-templates/${type}/reset`),
  preview: (data) => api.post('/email-templates/preview', data)
};

// Selected Candidates API
export const selectedCandidatesAPI = {
  getAll: (params) => api.get('/selected-candidates', { params }),
  getById: (id) => api.get(`/selected-candidates/${id}`),
  selectFromApplication: (applicationId, data) => 
    api.post(`/selected-candidates/select-application/${applicationId}`, data),
  update: (id, data) => api.put(`/selected-candidates/${id}`, data),
  sendOfferLetter: (id, data) => api.post(`/selected-candidates/${id}/send-offer`, data),
  sendJoiningLetter: (id, data) => api.post(`/selected-candidates/${id}/send-joining-letter`, data),
  delete: (id) => api.delete(`/selected-candidates/${id}`)
};

// Candidate Documents API
export const candidateDocumentsAPI = {
  getAll: (params) => api.get('/candidate-documents', { params }),
  getByCandidate: (selectedCandidateId) => 
    api.get(`/candidate-documents/candidate/${selectedCandidateId}`),
  upload: (formData) => api.post('/candidate-documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  verify: (id, data) => api.put(`/candidate-documents/${id}/verify`, data),
  download: (id) => api.get(`/candidate-documents/${id}/download`, {
    responseType: 'blob'
  }),
  delete: (id) => api.delete(`/candidate-documents/${id}`)
};

export default api;
