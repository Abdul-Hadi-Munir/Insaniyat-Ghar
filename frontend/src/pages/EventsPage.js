// ==============================================================================
// EventsPage.js — Events listing
// ==============================================================================
import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { fetchEvents } from '../services/api';

function EventsPage({ addToast }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEvents()
      .then(res => setData(res.data || []))
      .catch(() => addToast('Failed to load events', 'error'))
      .finally(() => setLoading(false));
  }, [addToast]);

  const filtered = data.filter(e =>
    e.event_title?.toLowerCase().includes(search.toLowerCase()) ||
    e.location?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <>
      <div className="page-header">
        <h2>Events</h2>
        <p>Upcoming and past charity events</p>
      </div>
      <div className="page-body">
        <div className="action-bar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="content-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Event Title</th>
                  <th>Campaign</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.event_id}>
                    <td>{e.event_id}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{e.event_title}</td>
                    <td>{e.campaign_title || '—'}</td>
                    <td>{e.event_date ? new Date(e.event_date).toLocaleDateString() : '—'}</td>
                    <td>{e.location || '—'}</td>
                    <td><span className={`badge badge-${(e.status || '').toLowerCase()}`}>{e.status}</span></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="6" className="empty-state"><h4>No events found</h4></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default EventsPage;
