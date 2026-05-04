// ==============================================================================
// InventoryPage.js — Inventory management with ACID stock operations
// ==============================================================================
import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiX } from 'react-icons/fi';
import { fetchInventory, addInventory, fetchCategories } from '../services/api';

function InventoryPage({ addToast }) {
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category_id: '', item_name: '', quantity: '' });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [invRes, catRes] = await Promise.all([fetchInventory(), fetchCategories()]);
      setInventory(invRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      addToast('Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addInventory({ ...form, quantity: Number(form.quantity) });
      addToast('Inventory updated (ACID committed)');
      setShowModal(false);
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const filtered = inventory.filter(i =>
    i.item_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <>
      <div className="page-header">
        <h2>Inventory</h2>
        <p>Track and manage charity inventory — stock operations use ACID transactions</p>
      </div>
      <div className="page-body">
        <div className="action-bar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Add Stock</button>
        </div>

        <div className="content-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Item Name</th>
                  <th>Total Qty</th>
                  <th>Available</th>
                  <th>Used</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(i => (
                  <tr key={i.inventory_id}>
                    <td>{i.inventory_id}</td>
                    <td><span className="badge badge-approved">{i.category_name}</span></td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{i.item_name}</td>
                    <td>{i.total_quantity}</td>
                    <td className="text-green">{i.available_quantity}</td>
                    <td className="text-orange">{i.total_quantity - i.available_quantity}</td>
                    <td>{i.last_updated ? new Date(i.last_updated).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="7" className="empty-state"><h4>No inventory items found</h4></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add Inventory Stock</h3>
                <button className="btn-icon" onClick={() => setShowModal(false)}><FiX /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Category *</label>
                    <select className="form-control" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} required>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Item Name *</label>
                    <input className="form-control" value={form.item_name} onChange={e => setForm({...form, item_name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input className="form-control" type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Stock</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default InventoryPage;
