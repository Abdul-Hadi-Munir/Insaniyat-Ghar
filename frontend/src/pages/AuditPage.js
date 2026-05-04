// ==============================================================================
// AuditPage.js — Audit logs (ACID Durability demonstration)
// ==============================================================================
import React, { useState, useEffect } from 'react';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import { fetchAuditLogs } from '../services/api';

function AuditPage({ addToast }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAuditLogs();
      setLogs(res.data || []);
    } catch (err) {
      addToast('Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(l =>
    l.action_type?.toLowerCase().includes(search.toLowerCase()) ||
    l.table_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getActionColor = (action) => {
    switch (action) {
      case 'INSERT': return 'badge-active';
      case 'UPDATE': return 'badge-approved';
      case 'DELETE': return 'badge-cancelled';
      case 'VERIFICATION': return 'badge-completed';
      case 'STATUS_CHANGE': return 'badge-pending';
      case 'DISTRIBUTION': return 'badge-active';
      default: return 'badge-draft';
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <>
      <div className="page-header">
        <h2>Audit Logs</h2>
        <p>ACID Durability — All committed transactions are permanently logged</p>
      </div>
      <div className="page-body">
        <div className="action-bar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-secondary" onClick={loadData}><FiRefreshCw /> Refresh</button>
        </div>

        <div className="content-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Table</th>
                  <th>Record ID</th>
                  <th>Description</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.log_id}>
                    <td>{l.log_id}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{l.user_name || 'System'}</td>
                    <td><span className={`badge ${getActionColor(l.action_type)}`}>{l.action_type}</span></td>
                    <td><code style={{ color: 'var(--accent-teal-light)', fontSize: '0.78rem' }}>{l.table_name}</code></td>
                    <td>{l.record_id || '—'}</td>
                    <td className="truncate" style={{ maxWidth: 250 }}>{l.description || '—'}</td>
                    <td>{l.action_time ? new Date(l.action_time).toLocaleString() : '—'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="7" className="empty-state"><h4>No audit logs found</h4></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default AuditPage;
