import axios from 'axios';
import { API_URL } from './api';

// Company Settings API
export const companySettingsAPI = {
  get: () => axios.get(`${API_URL}/company-settings`),
  update: (data) => axios.put(`${API_URL}/company-settings`, data)
};
