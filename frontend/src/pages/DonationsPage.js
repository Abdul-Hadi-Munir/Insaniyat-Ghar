// ==============================================================================
// DonationsPage.js — Role-aware Donations with ACID transactions
//
// Donor:           Auto-detects their donor_id, no dropdown. Can donate only.
// Finance Officer: Sees all donations + "Verify" button for Pending ones.
// Admin:           Sees all + can verify.
// ==============================================================================
import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiX, FiCheck } from 'react-icons/fi';
import { fetchDonations, registerDonation, verifyDonation, fetchDonors, fetchCampaigns } from '../services/api';

function DonationsPage({ addToast }) {
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ donor_id: '', campaign_id: '', donation_type: 'Money', amount: '' });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role_name;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [donRes, campRes] = await Promise.all([fetchDonations(), fetchCampaigns()]);
      setDonations(donRes.data || []);
      setCampaigns(campRes.data || []);

      // Only admin needs the donors list (to pick from dropdown)
      if (role === 'Super Admin') {
        const donorRes = await fetchDonors();
        setDonors(donorRes.data || []);
      }
    } catch (err) {
      addToast('Failed to load donations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let submitData = { ...form };
      
      if (role === 'Donor') {
        // Auto-lookup donor_id from backend
        const donorRes = await fetchDonors();
        const myDonor = (donorRes.data || []).find(d => d.user_id === user.user_id);
        if (!myDonor) {
          addToast('Donor profile not found. Contact admin.', 'error');
          return;
        }
        submitData.donor_id = myDonor.donor_id;
      }

      const res = await registerDonation(submitData);
      addToast(`Donation registered! Receipt: ${res.data?.receipt_no} (ACID committed)`);
      setShowModal(false);
      setForm({ donor_id: '', campaign_id: '', donation_type: 'Money', amount: '' });
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleVerify = async (donationId) => {
    try {
      await verifyDonation({ donation_id: donationId });
      addToast('Donation verified (ACID committed) — Dashboard updated!');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const canVerify = ['Super Admin', 'Finance Officer'].includes(role);
  const canDonate = ['Super Admin', 'Donor'].includes(role);

  const filtered = donations.filter(d =>
    d.donor_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.receipt_no?.toLowerCase().includes(search.toLowerCase())
  );

  const formatPKR = (v) => v ? `PKR ${Number(v).toLocaleString()}` : '—';

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <>
      <div className="page-header">
        <h2>Donations</h2>
        <p>{role === 'Donor' ? 'Your donation history — make new donations here' : 'Register and verify donations — each operation is an ACID transaction'}</p>
      </div>
      <div className="page-body">
        <div className="action-bar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input placeholder="Search by donor or receipt..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {canDonate && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> {role === 'Donor' ? 'Make Donation' : 'Register Donation'}</button>
          )}
        </div>

        <div className="content-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Donor</th>
                  <th>Campaign</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Receipt No</th>
                  <th>Status</th>
                  <th>Date</th>
                  {canVerify && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.donation_id}>
                    <td>{d.donation_id}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{d.donor_name}</td>
                    <td>{d.campaign_title || '—'}</td>
                    <td><span className={`badge ${d.donation_type === 'Money' ? 'badge-active' : 'badge-approved'}`}>{d.donation_type}</span></td>
                    <td className="text-green">{formatPKR(d.amount)}</td>
                    <td><code style={{ color: 'var(--accent-teal-light)', fontSize: '0.78rem' }}>{d.receipt_no}</code></td>
                    <td><span className={`badge badge-${(d.payment_status || '').toLowerCase()}`}>{d.payment_status}</span></td>
                    <td>{d.donation_date ? new Date(d.donation_date).toLocaleDateString() : '—'}</td>
                    {canVerify && (
                      <td>
                        {d.payment_status === 'Pending' && (
                          <button className="btn btn-success btn-sm" onClick={() => handleVerify(d.donation_id)}>
                            <FiCheck /> Verify
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={canVerify ? 9 : 8} className="empty-state"><h4>No donations found</h4></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{role === 'Donor' ? 'Make a Donation' : 'Register New Donation'}</h3>
                <button className="btn-icon" onClick={() => setShowModal(false)}><FiX /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Donor: no dropdown needed. Admin: picks from list */}
                  {role === 'Donor' ? (
                    <div className="form-group">
                      <label>Donating As</label>
                      <input className="form-control" value={user.full_name} disabled />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>Donor *</label>
                      <select className="form-control" value={form.donor_id} onChange={e => setForm({...form, donor_id: e.target.value})} required>
                        <option value="">Select Donor</option>
                        {donors.map(d => <option key={d.donor_id} value={d.donor_id}>{d.full_name} ({d.donor_type})</option>)}
                      </select>
                    </div>
                  )}
                  <div className="form-group">
                    <label>Campaign</label>
                    <select className="form-control" value={form.campaign_id} onChange={e => setForm({...form, campaign_id: e.target.value})}>
                      <option value="">General (No Campaign)</option>
                      {campaigns.filter(c => c.status === 'Active').map(c => <option key={c.campaign_id} value={c.campaign_id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Type *</label>
                      <select className="form-control" value={form.donation_type} onChange={e => setForm({...form, donation_type: e.target.value})}>
                        <option>Money</option><option>Item</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Amount (PKR) *</label>
                      <input className="form-control" type="number" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{role === 'Donor' ? 'Donate' : 'Register'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default DonationsPage;
