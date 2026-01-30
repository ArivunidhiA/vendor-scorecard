import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for error handling
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Vendor API endpoints
export const vendorAPI = {
  getVendors: (params = {}) => api.get('/api/vendors', { params }),
  getVendor: (id) => api.get(`/api/vendors/${id}`),
  getVendorScore: (id) => api.get(`/api/vendors/${id}/score`),
  getVendorHistory: (id, days = 30) => api.get(`/api/vendors/${id}/history`, { params: { days } }),
  getVendorJurisdictions: (id) => api.get(`/api/vendors/${id}/jurisdictions`),
  getBenchmark: () => api.get('/api/vendors/benchmark/all'),
};

// Comparison API endpoints
export const comparisonAPI = {
  compareVendors: (data) => api.post('/api/compare', data),
  whatIfAnalysis: (data) => api.post('/api/whatif', data),
  calculateTCO: (data) => api.post('/api/tco', data),
  getJurisdictions: () => api.get('/api/jurisdictions'),
  getBenchmarks: () => api.get('/api/benchmarks'),
  getCoverageHeatmap: () => api.get('/api/coverage-heatmap'),
};

// Alert API endpoints
export const alertAPI = {
  getAlerts: (params = {}) => api.get('/api/alerts', { params }),
  getAlertSummary: (days = 30) => api.get('/api/alerts/summary', { params: { days } }),
  getVendorAlerts: (vendorId, params = {}) => api.get(`/api/alerts/vendor/${vendorId}`, { params }),
  checkSLA: (vendorId) => api.get(`/api/alerts/vendor/${vendorId}/sla-check`),
  configureAlerts: (data) => api.post('/api/alerts/configure', data),
  acknowledgeAlert: (id) => api.post(`/api/alerts/${id}/acknowledge`),
  resolveAlert: (id) => api.post(`/api/alerts/${id}/resolve`),
  getAlertConfigurations: (vendorId) => api.get(`/api/alerts/configurations/${vendorId}`),
  getAlertTypes: () => api.get('/api/alerts/types'),
};

// Analysis API endpoints
export const analysisAPI = {
  getSchemaChanges: (params = {}) => api.get('/api/schema-changes', { params }),
  getVendorSchemaChanges: (vendorId, days = 90) => api.get(`/api/schema-changes/vendor/${vendorId}`, { params: { days } }),
  getChangeImpact: (changeId) => api.get(`/api/impact-assessment/${changeId}`),
  getQualityTrends: (vendorId, days = 90) => api.get(`/api/quality-trends/${vendorId}`, { params: { days } }),
  getPerformanceMetrics: (params = {}) => api.get('/api/performance-metrics', { params }),
  getRecommendations: (params = {}) => api.get('/api/recommendations', { params }),
};

export default api;
