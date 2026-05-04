// ==============================================================================
// api.js — Centralized API Service for Insaniyat Ghar Frontend
// ==============================================================================
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
});

// Request interceptor for Auth
api.interceptors.request.use(config => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        config.headers['X-User-Id'] = user.user_id;
        config.headers['X-User-Role'] = user.role_name;
    }
    return config;
});

// Response interceptor
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || error.message || 'Network error';
        return Promise.reject(new Error(message));
    }
);

// ─── Dashboard ───────────────────────────────────────────────────────
export const fetchDashboard = () => api.get('/dashboard');

// ─── Reports ─────────────────────────────────────────────────────────
export const fetchCampaignReport = () => api.get('/reports/campaigns');
export const fetchDonorSummary = () => api.get('/reports/donations/summary');
export const fetchMonthlyReport = () => api.get('/reports/donations/monthly');
export const fetchPendingRequests = () => api.get('/reports/requests/pending');
export const fetchInventoryReport = () => api.get('/reports/inventory');
export const fetchAuditLogs = () => api.get('/reports/audit');

// ─── Users ───────────────────────────────────────────────────────────
export const fetchUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// ─── Campaigns ───────────────────────────────────────────────────────
export const fetchCampaigns = () => api.get('/campaigns');
export const createCampaign = (data) => api.post('/campaigns', data);
export const updateCampaign = (id, data) => api.put(`/campaigns/${id}`, data);
export const deleteCampaign = (id) => api.delete(`/campaigns/${id}`);

// ─── Donations ───────────────────────────────────────────────────────
export const fetchDonations = () => api.get('/donations');
export const registerDonation = (data) => api.post('/donations/register', data);
export const verifyDonation = (data) => api.post('/donations/verify', data);

// ─── Help Requests ───────────────────────────────────────────────────
export const fetchHelpRequests = () => api.get('/requests');
export const submitHelpRequest = (data) => api.post('/requests/submit', data);
export const approveRequest = (data) => api.post('/requests/approve', data);
export const rejectRequest = (data) => api.post('/requests/reject', data);
export const distributeFunds = (data) => api.post('/requests/distribute', data);

// ─── Inventory ───────────────────────────────────────────────────────
export const fetchInventory = () => api.get('/inventory');
export const addInventory = (data) => api.post('/inventory/add', data);
export const distributeInventory = (data) => api.post('/inventory/distribute', data);

// ─── Lookup ──────────────────────────────────────────────────────────
export const fetchDonors = () => api.get('/donors');
export const fetchBeneficiaries = () => api.get('/lookups/beneficiaries');
export const verifyBeneficiary = (data) => api.post('/lookups/beneficiaries/verify', data);
export const fetchVolunteers = () => api.get('/lookups/volunteers');
export const fetchEvents = () => api.get('/events');
export const fetchRoles = () => api.get('/roles');
export const fetchCategories = () => api.get('/categories');

// ─── Payments ────────────────────────────────────────────────────────
export const verifyPayment = (data) => api.post('/payments/verify', data);

// ─── Auth ────────────────────────────────────────────────────────────
export const loginUser = (data) => api.post('/auth/login', data);

export default api;
