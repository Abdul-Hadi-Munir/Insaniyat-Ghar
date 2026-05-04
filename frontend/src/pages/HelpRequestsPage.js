// ==============================================================================
// HelpRequestsPage.js — Help Requests with approve/reject ACID operations
// ==============================================================================
import React, { useState, useEffect } from 'react';
import { FiSearch, FiCheck, FiX as FiXIcon, FiPlus } from 'react-icons/fi';
import { fetchHelpRequests, approveRequest, rejectRequest, distributeFunds, submitHelpRequest } from '../services/api';

function HelpRequestsPage({ addToast }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ request_type: 'Money', requested_amount: '', description: '' });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role_name;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await fetchHelpRequests();
      setRequests(res.data || []);
    } catch (err) {
      addToast('Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveRequest({ request_id: id, approved_by: user.user_id });
      addToast('Request approved (ACID transaction)');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleReject = async (id) => {
    const remarks = prompt('Rejection reason:');
    if (!remarks) return;
    try {
      await rejectRequest({ request_id: id, rejected_by: user.user_id, remarks });
      addToast('Request rejected (ACID transaction)');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDistribute = async (id) => {
    const amount = prompt('Amount to distribute (PKR):');
    if (!amount) return;
    try {
      await distributeFunds({ request_id: id, amount: Number(amount), distributed_by: user.user_id, remarks: 'Fund distribution' });
      addToast('Funds distributed (ACID committed)');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const filtered = requests.filter(r =>
    r.beneficiary_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.request_type?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      await submitHelpRequest(formData);
      addToast('Help request submitted successfully (ACID transaction)');
      setShowModal(false);
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <>
      <div className="page-header">
        <h2>Help Requests</h2>
        <p>Review and process help requests — approve/reject with ACID transactions</p>
      </div>
      <div className="page-body">
        <div className="action-bar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {role === 'Beneficiary' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <FiPlus /> New Request
            </button>
          )}
        </div>

        <div className="content-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Beneficiary</th>
                  <th>Campaign</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Status</th>
                  {role !== 'Beneficiary' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.request_id}>
                    <td>{r.request_id}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.beneficiary_name}</td>
                    <td>{r.campaign_name || '—'}</td>
                    <td><span className={`badge ${r.request_type === 'Money' ? 'badge-active' : 'badge-approved'}`}>{r.request_type}</span></td>
                    <td>{r.requested_amount ? `PKR ${Number(r.requested_amount).toLocaleString()}` : '—'}</td>
                    <td className="truncate" style={{ maxWidth: 200 }}>{r.description || '—'}</td>
                    <td><span className={`badge badge-${(r.request_status || '').toLowerCase()}`}>{r.request_status}</span></td>
                    {role !== 'Beneficiary' && (
                      <td>
                        <div className="flex gap-1">
                          {r.request_status === 'Pending' && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => handleApprove(r.request_id)}><FiCheck /> Approve</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleReject(r.request_id)}><FiXIcon /> Reject</button>
                            </>
                          )}
                          {r.request_status === 'Approved' && r.request_type === 'Money' && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleDistribute(r.request_id)}>💰 Distribute</button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="8" className="empty-state"><h4>No help requests found</h4></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Submit New Help Request</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}><FiXIcon /></button>
            </div>
            <form onSubmit={handleSubmitRequest}>
              <div className="form-group">
                <label>Request Type</label>
                <select className="form-control" value={formData.request_type} onChange={e => setFormData({...formData, request_type: e.target.value})}>
                  <option value="Money">Money</option>
                  <option value="Ration">Ration</option>
                  <option value="Medical">Medical</option>
                  <option value="Education">Education</option>
                </select>
              </div>
              <div className="form-group">
                <label>Requested Amount (PKR)</label>
                <input type="number" className="form-control" required={formData.request_type === 'Money'}
                  value={formData.requested_amount} onChange={e => setFormData({...formData, requested_amount: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" required rows="3"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default HelpRequestsPage;
