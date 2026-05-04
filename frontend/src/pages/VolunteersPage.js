// ==============================================================================
// VolunteersPage.js — Volunteers listing
// ==============================================================================
import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { fetchVolunteers } from '../services/api';

function VolunteersPage({ addToast }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchVolunteers()
      .then(res => setData(res.data || []))
      .catch(() => addToast('Failed to load volunteers', 'error'))
      .finally(() => setLoading(false));
  }, [addToast]);

  const filtered = data.filter(v =>
    v.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.skills?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <>
      <div className="page-header">
        <h2>Volunteers</h2>
        <p>Registered volunteers and their availability</p>
      </div>
      <div className="page-body">
        <div className="action-bar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input placeholder="Search volunteers..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="content-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Skills</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.volunteer_id}>
                    <td>{v.volunteer_id}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v.full_name}</td>
                    <td>{v.email}</td>
                    <td>{v.phone || '—'}</td>
                    <td>{v.skills || '—'}</td>
                    <td><span className={`badge badge-${v.availability_status === 'Available' ? 'active' : v.availability_status === 'Busy' ? 'pending' : 'cancelled'}`}>{v.availability_status}</span></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="6" className="empty-state"><h4>No volunteers found</h4></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default VolunteersPage;
