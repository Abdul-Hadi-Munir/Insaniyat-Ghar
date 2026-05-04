// ==============================================================================
// BeneficiariesPage.js — Beneficiaries listing
// ==============================================================================
import React, { useState, useEffect } from 'react';
import { FiSearch, FiCheck } from 'react-icons/fi';
import { fetchBeneficiaries, verifyBeneficiary } from '../services/api';

function BeneficiariesPage({ addToast }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = () => {
    setLoading(true);
    fetchBeneficiaries()
      .then(res => setData(res.data || []))
      .catch(() => addToast('Failed to load beneficiaries', 'error'))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (id) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await verifyBeneficiary({ beneficiary_id: id, verified_by: user.user_id });
      addToast('Beneficiary verified successfully (ACID transaction)');
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to verify', 'error');
    }
  };

  const filtered = data.filter(b =>
    b.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.cnic_passport_no?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <>
      <div className="page-header">
        <h2>Beneficiaries</h2>
        <p>Registered beneficiaries with verification status</p>
      </div>
      <div className="page-body">
        <div className="action-bar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input placeholder="Search beneficiaries..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="content-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>CNIC/Passport</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Family Members</th>
                  <th>Income Level</th>
                  <th>Verification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.beneficiary_id}>
                    <td>{b.beneficiary_id}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{b.full_name}</td>
                    <td><code style={{ color: 'var(--accent-teal-light)', fontSize: '0.78rem' }}>{b.cnic_passport_no}</code></td>
                    <td>{b.email}</td>
                    <td>{b.phone || '—'}</td>
                    <td>{b.family_members}</td>
                    <td>PKR {Number(b.income_level || 0).toLocaleString()}</td>
                    <td><span className={`badge badge-${(b.verification_status || '').toLowerCase()}`}>{b.verification_status}</span></td>
                    <td>
                      {b.verification_status === 'Pending' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleVerify(b.beneficiary_id)}>
                          <FiCheck /> Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="9" className="empty-state"><h4>No beneficiaries found</h4></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default BeneficiariesPage;
