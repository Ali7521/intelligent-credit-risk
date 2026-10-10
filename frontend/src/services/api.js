import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const predictCreditRisk = async (applicantData) => {
  const response = await apiClient.post('/api/predict', applicantData);
  return response.data;
};

export const submitApplication = async (applicantData, notes = '') => {
  const response = await apiClient.post('/api/applications', {
    applicant: applicantData,
    notes,
  });
  return response.data;
};

export const getApplications = async (params = {}) => {
  const response = await apiClient.get('/api/applications', { params });
  return response.data;
};

export const getApplicationById = async (id) => {
  const response = await apiClient.get(`/api/applications/${id}`);
  return response.data;
};

export const getDashboardAnalytics = async () => {
  const response = await apiClient.get('/api/dashboard');
  return response.data;
};

export const getModelMetrics = async () => {
  const response = await apiClient.get('/api/model-metrics');
  return response.data;
};

export const checkHealth = async () => {
  const response = await apiClient.get('/api/health');
  return response.data;
};

export default apiClient;
