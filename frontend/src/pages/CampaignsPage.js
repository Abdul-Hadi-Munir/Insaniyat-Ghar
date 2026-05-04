// ==============================================================================
// CampaignsPage.js — Campaigns CRUD
// ==============================================================================
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import { fetchCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../services/api';

function CampaignsPage({ addToast }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', target_amount: '', start_date: '', end_date: '', status: 'Draft', created_by: 1 });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await fetchCampaigns();
      setCampaigns(res.data || []);
    } catch (err) {
      addToast('Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await updateCampaign(editItem.campaign_id, form);
        addToast('Campaign updated (ACID committed)');
      } else {
        await createCampaign(form);
        addToast('Campaign created (ACID committed)');
      }
      setShowModal(false);
      setEditItem(null);
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await deleteCampaign(id);
      addToast('Campaign deleted');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const openEdit = (c) => {
    setEditItem(c);
    setForm({
      title: c.title, description: c.description || '', target_amount: c.target_amount,
      start_date: c.start_date?.split('T')[0] || '', end_date: c.end_date?.split('T')[0] || '',
      status: c.status, created_by: c.created_by
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ title: '', description: '', target_amount: '', start_date: '', end_date: '', status: 'Draft', created_by: 1 });
    setShowModal(true);
  };

  const filtered = campaigns.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));
  const formatPKR = (v) => v ? `PKR ${Number(v).toLocaleString()}` : 'PKR 0';

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <>
      <div className="page-header">
        <h2>Campaigns</h2>
        <p>Manage charity campaigns — create, track progress, and update status</p>
      </div>
      <div className="page-body">
        <div className="action-bar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openCreate}><FiPlus /> New Campaign</button>
        </div>

        <div className="content-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Target</th>
                  <th>Collected</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.campaign_id}>
                    <td>{c.campaign_id}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.title}</td>
                    <td>{formatPKR(c.target_amount)}</td>
                    <td className="text-green">{formatPKR(c.collected_amount)}</td>
                    <td>{c.start_date?.split('T')[0]}</td>
                    <td>{c.end_date?.split('T')[0]}</td>
                    <td><span className={`badge badge-${(c.status || '').toLowerCase()}`}>{c.status}</span></td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn-icon" onClick={() => openEdit(c)}><FiEdit2 /></button>
                        <button className="btn-icon" onClick={() => handleDelete(c.campaign_id)} style={{ color: 'var(--accent-red)' }}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="8" className="empty-state"><h4>No campaigns found</h4></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editItem ? 'Edit Campaign' : 'Create Campaign'}</h3>
                <button className="btn-icon" onClick={() => setShowModal(false)}><FiX /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Title *</label>
                    <input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-control" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Target Amount (PKR) *</label>
                    <input className="form-control" type="number" value={form.target_amount} onChange={e => setForm({...form, target_amount: e.target.value})} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date *</label>
                      <input className="form-control" type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>End Date *</label>
                      <input className="form-control" type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} required />
                    </div>
                  </div>
                  {editItem && (
                    <div className="form-group">
                      <label>Status</label>
                      <select className="form-control" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                        <option>Draft</option><option>Active</option><option>Completed</option><option>Cancelled</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CampaignsPage;
