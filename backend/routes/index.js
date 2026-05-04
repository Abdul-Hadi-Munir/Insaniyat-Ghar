// Route definitions — RESTful API for Insaniyat Ghar
// ==============================================================================
// routes/index.js — API Route Definitions for Insaniyat Ghar
// ==============================================================================
const express = require('express');
const router = express.Router();
const c = require('../controllers/apiController');

// ─── Dashboard ───────────────────────────────────────────────────────
router.get('/dashboard', c.getDashboardStats);

// ─── Reports (View-based — read-only) ───────────────────────────────
router.get('/reports/campaigns', c.getCampaignFinancialStatus);
router.get('/reports/donations/summary', c.getDonorDonationSummary);
router.get('/reports/donations/monthly', c.getMonthlyDonationReport);
router.get('/reports/requests/pending', c.getPendingHelpRequests);
router.get('/reports/inventory', c.getInventoryStatus);
router.get('/reports/audit', c.getAuditLogs);

// ─── Auth ────────────────────────────────────────────────────────────
router.post('/auth/login', c.loginUser);

// ─── Users CRUD ──────────────────────────────────────────────────────
router.get('/users', c.getUsers);
router.post('/users', c.createUser);
router.put('/users/:user_id', c.updateUser);
router.delete('/users/:user_id', c.deleteUser);

// ─── Campaigns CRUD ─────────────────────────────────────────────────
router.get('/campaigns', c.getCampaigns);
router.post('/campaigns', c.createCampaign);
router.put('/campaigns/:campaign_id', c.updateCampaign);
router.delete('/campaigns/:campaign_id', c.deleteCampaign);

// ─── Donations (ACID transactional operations) ──────────────────────
router.get('/donations', c.getDonations);
router.post('/donations/register', c.registerDonation);
router.post('/donations/verify', c.verifyDonation);

// ─── Payments ────────────────────────────────────────────────────────
router.post('/payments/verify', c.verifyPayment);

// ─── Help Requests ──────────────────────────────────────────────────
router.get('/requests', c.getHelpRequests);
router.post('/requests/submit', c.submitHelpRequest);
router.post('/requests/approve', c.approveHelpRequest);
router.post('/requests/reject', c.rejectHelpRequest);
router.post('/requests/distribute', c.distributeFunds);

// ─── Inventory ──────────────────────────────────────────────────────
router.get('/inventory', c.getInventory);
router.post('/inventory/add', c.addInventoryItem);
router.post('/inventory/distribute', c.distributeInventoryItem);

// ─── Lookup Data ────────────────────────────────────────────────────
router.get('/donors', c.getDonors);
router.get('/lookups/beneficiaries', c.getBeneficiaries);
router.post('/lookups/beneficiaries/verify', c.verifyBeneficiary);
router.get('/lookups/volunteers', c.getVolunteers);
router.get('/events', c.getEvents);
router.get('/roles', c.getRoles);
router.get('/categories', c.getCategories);

module.exports = router;
