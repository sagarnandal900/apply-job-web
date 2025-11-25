import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://103.122.85.61:5001/api';

// Company Settings API
export const companySettingsAPI = {
  get: () => axios.get(`${API_URL}/company-settings`),
  update: (data) => axios.put(`${API_URL}/company-settings`, data)
};
