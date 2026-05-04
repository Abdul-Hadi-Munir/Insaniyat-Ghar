// ==============================================================================
// ReportsPage.js — Financial reports with donor summary and campaign data
// ==============================================================================
import React, { useState, useEffect } from 'react';
import { fetchCampaignReport, fetchDonorSummary, fetchMonthlyReport } from '../services/api';

function ReportsPage({ addToast }) {
  const [campaigns, setCampaigns] = useState([]);
  const [donors, setDonors] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [campRes, donorRes, monthRes] = await Promise.all([
        fetchCampaignReport(), fetchDonorSummary(), fetchMonthlyReport()
      ]);
      setCampaigns(campRes.data || []);
      setDonors(donorRes.data || []);
      setMonthly(monthRes.data || []);
    } catch (err) {
      addToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatPKR = (v) => v ? `PKR ${Number(v).toLocaleString()}` : 'PKR 0';

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <>
      <div className="page-header">
        <h2>Financial Reports</h2>
        <p>Database views providing real-time financial insights</p>
      </div>
      <div className="page-body">
        {/* Tabs */}
        <div className="flex gap-1 mb-3">
          <button className={`btn ${activeTab === 'campaigns' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('campaigns')}>
            Campaign Status
          </button>
          <button className={`btn ${activeTab === 'donors' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('donors')}>
            Donor Summary
          </button>
          <button className={`btn ${activeTab === 'monthly' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('monthly')}>
            Monthly Report
          </button>
        </div>

        {/* Campaign Financial Status */}
        {activeTab === 'campaigns' && (
          <div className="content-card">
            <div className="card-header"><h3>Campaign Financial Status (View: vw_campaign_financial_status)</h3></div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Target</th>
                    <th>Collected</th>
                    <th>Remaining</th>
                    <th>Status</th>
                    <th>Period</th>
                    <th>Donors</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.title}</td>
                      <td>{formatPKR(c.target_amount)}</td>
                      <td className="text-green">{formatPKR(c.collected_amount)}</td>
                      <td className="text-orange">{formatPKR(c.remaining_amount)}</td>
                      <td><span className={`badge badge-${(c.status || '').toLowerCase()}`}>{c.status}</span></td>
                      <td>{c.start_date?.split('T')[0]} → {c.end_date?.split('T')[0]}</td>
                      <td>{c.donor_count}</td>
                    </tr>
                  ))}
                  {campaigns.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Donor Summary */}
        {activeTab === 'donors' && (
          <div className="content-card">
            <div className="card-header"><h3>Donor Donation Summary (View: vw_donor_donation_summary)</h3></div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Type</th>
                    <th>Total Donations</th>
                    <th>Total Amount</th>
                    <th>Last Donation</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.map((d, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{d.donor_name}</td>
                      <td><span className={`badge badge-${d.donor_type === 'Corporate' ? 'approved' : 'active'}`}>{d.donor_type}</span></td>
                      <td>{d.total_donations}</td>
                      <td className="text-green">{formatPKR(d.total_amount_donated)}</td>
                      <td>{d.last_donation_date ? new Date(d.last_donation_date).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                  {donors.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Monthly Report */}
        {activeTab === 'monthly' && (
          <div className="content-card">
            <div className="card-header"><h3>Monthly Donation Report (View: vw_monthly_donation_report)</h3></div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Total Transactions</th>
                    <th>Total Amount Collected</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((m, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{m.donation_month}</td>
                      <td>{m.total_transactions}</td>
                      <td className="text-green">{formatPKR(m.total_amount_collected)}</td>
                    </tr>
                  ))}
                  {monthly.length === 0 && (
                    <tr><td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ReportsPage;
