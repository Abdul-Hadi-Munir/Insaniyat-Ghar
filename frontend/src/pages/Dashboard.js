// ==============================================================================
// Dashboard.js — Role-Based Professional Dashboard
// Each user role sees ONLY their relevant data
// ==============================================================================
import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiTarget, FiHeart, FiPackage, FiDollarSign, FiUserCheck, FiCalendar, FiAlertCircle, FiMapPin, FiClock, FiCheckCircle } from 'react-icons/fi';
import { fetchDashboard, fetchCampaignReport, fetchMonthlyReport, fetchDonations, fetchHelpRequests, fetchEvents } from '../services/api';

function Dashboard({ addToast }) {
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role_name;

  const loadData = useCallback(async () => {
    try {
      const dashRes = await fetchDashboard();
      setStats(dashRes.data);

      // Load role-specific data
      if (['Super Admin', 'Charity Manager', 'Finance Officer'].includes(role)) {
        const [campRes, monthRes] = await Promise.all([
          fetchCampaignReport(),
          fetchMonthlyReport()
        ]);
        setCampaigns(campRes.data || []);
        setMonthly(monthRes.data || []);
      }
      if (role === 'Donor') {
        const donRes = await fetchDonations();
        setMyDonations(donRes.data || []);
      }
      if (role === 'Beneficiary') {
        const reqRes = await fetchHelpRequests();
        setMyRequests(reqRes.data || []);
      }
      if (role === 'Volunteer') {
        const evRes = await fetchEvents();
        setUpcomingEvents(evRes.data || []);
      }
    } catch (err) {
      addToast('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  }, [role, addToast]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  const formatPKR = (val) => val ? `PKR ${Number(val).toLocaleString()}` : 'PKR 0';

  // ──────────────────────────────────────────────
  // ADMIN DASHBOARD — Full system overview
  // ──────────────────────────────────────────────
  if (role === 'Super Admin') {
    return (
      <>
        <div className="page-header">
          <h2>Admin Dashboard</h2>
          <p>Complete system overview — All modules and data</p>
        </div>
        <div className="page-body">
          <div className="stats-grid">
            <div className="stat-card teal"><div className="stat-icon"><FiUsers /></div><div className="stat-value">{stats?.totalUsers || 0}</div><div className="stat-label">Total Users</div></div>
            <div className="stat-card orange"><div className="stat-icon"><FiDollarSign /></div><div className="stat-value">{formatPKR(stats?.totalDonationsAmount)}</div><div className="stat-label">Verified Donations</div></div>
            <div className="stat-card blue"><div className="stat-icon"><FiTarget /></div><div className="stat-value">{stats?.activeCampaigns || 0}</div><div className="stat-label">Active Campaigns</div></div>
            <div className="stat-card purple"><div className="stat-icon"><FiAlertCircle /></div><div className="stat-value">{stats?.pendingRequests || 0}</div><div className="stat-label">Pending Requests</div></div>
            <div className="stat-card teal"><div className="stat-icon"><FiHeart /></div><div className="stat-value">{stats?.totalDonors || 0}</div><div className="stat-label">Total Donors</div></div>
            <div className="stat-card orange"><div className="stat-icon"><FiUserCheck /></div><div className="stat-value">{stats?.totalBeneficiaries || 0}</div><div className="stat-label">Beneficiaries</div></div>
            <div className="stat-card blue"><div className="stat-icon"><FiCalendar /></div><div className="stat-value">{stats?.totalVolunteers || 0}</div><div className="stat-label">Volunteers</div></div>
            <div className="stat-card purple"><div className="stat-icon"><FiPackage /></div><div className="stat-value">{stats?.totalCampaigns || 0}</div><div className="stat-label">Total Campaigns</div></div>
          </div>
          {renderCampaignTable(campaigns, formatPKR)}
          {renderMonthlyTable(monthly, formatPKR)}
        </div>
      </>
    );
  }

  // ──────────────────────────────────────────────
  // MANAGER DASHBOARD — Campaign & Operations focus
  // ──────────────────────────────────────────────
  if (role === 'Charity Manager') {
    return (
      <>
        <div className="page-header">
          <h2>Manager Dashboard</h2>
          <p>Campaign operations and help request management</p>
        </div>
        <div className="page-body">
          <div className="stats-grid">
            <div className="stat-card blue"><div className="stat-icon"><FiTarget /></div><div className="stat-value">{stats?.activeCampaigns || 0}</div><div className="stat-label">Active Campaigns</div></div>
            <div className="stat-card purple"><div className="stat-icon"><FiAlertCircle /></div><div className="stat-value">{stats?.pendingRequests || 0}</div><div className="stat-label">Pending Requests</div></div>
            <div className="stat-card orange"><div className="stat-icon"><FiUserCheck /></div><div className="stat-value">{stats?.totalBeneficiaries || 0}</div><div className="stat-label">Beneficiaries</div></div>
            <div className="stat-card teal"><div className="stat-icon"><FiCalendar /></div><div className="stat-value">{stats?.totalVolunteers || 0}</div><div className="stat-label">Volunteers</div></div>
          </div>
          {renderCampaignTable(campaigns, formatPKR)}
        </div>
      </>
    );
  }

  // ──────────────────────────────────────────────
  // DONOR DASHBOARD — My donations only
  // ──────────────────────────────────────────────
  if (role === 'Donor') {
    const verified = myDonations.filter(d => d.payment_status === 'Verified');
    const pending = myDonations.filter(d => d.payment_status === 'Pending');
    const totalDonated = verified.reduce((sum, d) => sum + (d.amount || 0), 0);
    return (
      <>
        <div className="page-header">
          <h2>My Donations</h2>
          <p>Welcome {user.full_name} — Your contribution history</p>
        </div>
        <div className="page-body">
          <div className="stats-grid">
            <div className="stat-card teal"><div className="stat-icon"><FiDollarSign /></div><div className="stat-value">{formatPKR(totalDonated)}</div><div className="stat-label">Total Donated (Verified)</div></div>
            <div className="stat-card blue"><div className="stat-icon"><FiCheckCircle /></div><div className="stat-value">{verified.length}</div><div className="stat-label">Verified Donations</div></div>
            <div className="stat-card orange"><div className="stat-icon"><FiClock /></div><div className="stat-value">{pending.length}</div><div className="stat-label">Pending Verification</div></div>
            <div className="stat-card purple"><div className="stat-icon"><FiHeart /></div><div className="stat-value">{myDonations.length}</div><div className="stat-label">Total Transactions</div></div>
          </div>

          <div className="content-card">
            <div className="card-header"><h3>My Donation History</h3></div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Receipt #</th><th>Campaign</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {myDonations.map((d, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{d.receipt_no}</td>
                      <td>{d.campaign_title || '—'}</td>
                      <td className="text-green">{formatPKR(d.amount)}</td>
                      <td>{d.donation_date?.split(' ')[0]}</td>
                      <td><span className={`badge badge-${(d.payment_status || '').toLowerCase()}`}>{d.payment_status}</span></td>
                    </tr>
                  ))}
                  {myDonations.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No donations yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ──────────────────────────────────────────────
  // BENEFICIARY DASHBOARD — My help requests only
  // ──────────────────────────────────────────────
  if (role === 'Beneficiary') {
    const approved = myRequests.filter(r => r.request_status === 'Approved' || r.request_status === 'Completed');
    const pendingReqs = myRequests.filter(r => r.request_status === 'Pending');
    return (
      <>
        <div className="page-header">
          <h2>My Requests</h2>
          <p>Welcome {user.full_name} — Your help request status</p>
        </div>
        <div className="page-body">
          <div className="stats-grid">
            <div className="stat-card blue"><div className="stat-icon"><FiHeart /></div><div className="stat-value">{myRequests.length}</div><div className="stat-label">Total Requests</div></div>
            <div className="stat-card orange"><div className="stat-icon"><FiClock /></div><div className="stat-value">{pendingReqs.length}</div><div className="stat-label">Pending</div></div>
            <div className="stat-card teal"><div className="stat-icon"><FiCheckCircle /></div><div className="stat-value">{approved.length}</div><div className="stat-label">Approved / Completed</div></div>
          </div>

          <div className="content-card">
            <div className="card-header"><h3>My Help Requests</h3></div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Type</th><th>Campaign</th><th>Amount</th><th>Description</th><th>Status</th><th>Submitted</th></tr></thead>
                <tbody>
                  {myRequests.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.request_type}</td>
                      <td>{r.campaign_name || '—'}</td>
                      <td>{r.requested_amount ? formatPKR(r.requested_amount) : '—'}</td>
                      <td style={{ maxWidth: '200px' }} className="truncate">{r.description || '—'}</td>
                      <td><span className={`badge badge-${(r.request_status || '').toLowerCase()}`}>{r.request_status}</span></td>
                      <td>{r.submitted_at?.split(' ')[0]}</td>
                    </tr>
                  ))}
                  {myRequests.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No help requests yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ──────────────────────────────────────────────
  // VOLUNTEER DASHBOARD — Upcoming events & tasks
  // ──────────────────────────────────────────────
  if (role === 'Volunteer') {
    const planned = upcomingEvents.filter(e => e.status === 'Planned' || e.status === 'Ongoing');
    return (
      <>
        <div className="page-header">
          <h2>Volunteer Dashboard</h2>
          <p>Welcome {user.full_name} — Your upcoming events and assignments</p>
        </div>
        <div className="page-body">
          <div className="stats-grid">
            <div className="stat-card blue"><div className="stat-icon"><FiCalendar /></div><div className="stat-value">{planned.length}</div><div className="stat-label">Upcoming Events</div></div>
            <div className="stat-card teal"><div className="stat-icon"><FiCheckCircle /></div><div className="stat-value">{upcomingEvents.filter(e => e.status === 'Completed').length}</div><div className="stat-label">Completed Events</div></div>
            <div className="stat-card orange"><div className="stat-icon"><FiTarget /></div><div className="stat-value">{upcomingEvents.length}</div><div className="stat-label">Total Events</div></div>
          </div>

          <div className="content-card">
            <div className="card-header"><h3>Upcoming Events</h3></div>
            <div style={{ padding: '16px', display: 'grid', gap: '16px' }}>
              {planned.length === 0 && <div className="empty-state"><div className="empty-icon">📅</div><h4>No upcoming events</h4><p>Check back later for new event assignments</p></div>}
              {planned.map((e, i) => (
                <div key={i} className="content-card" style={{ marginBottom: 0 }}>
                  <div className="card-body" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                      <FiCalendar />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{e.event_title}</div>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiClock /> {e.event_date}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiMapPin /> {e.location || 'TBD'}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiTarget /> {e.campaign_title || 'General'}</span>
                      </div>
                    </div>
                    <span className={`badge badge-${(e.status || '').toLowerCase()}`}>{e.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {upcomingEvents.filter(e => e.status === 'Completed').length > 0 && (
            <div className="content-card">
              <div className="card-header"><h3>Past Events</h3></div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Event</th><th>Date</th><th>Location</th><th>Status</th></tr></thead>
                  <tbody>
                    {upcomingEvents.filter(e => e.status === 'Completed').map((e, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{e.event_title}</td>
                        <td>{e.event_date}</td>
                        <td>{e.location || '—'}</td>
                        <td><span className="badge badge-completed">Completed</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // ──────────────────────────────────────────────
  // FINANCE OFFICER DASHBOARD — Financials
  // ──────────────────────────────────────────────
  if (role === 'Finance Officer') {
    return (
      <>
        <div className="page-header">
          <h2>Finance Dashboard</h2>
          <p>Financial overview and donation verification</p>
        </div>
        <div className="page-body">
          <div className="stats-grid">
            <div className="stat-card orange"><div className="stat-icon"><FiDollarSign /></div><div className="stat-value">{formatPKR(stats?.totalDonationsAmount)}</div><div className="stat-label">Total Verified Donations</div></div>
            <div className="stat-card blue"><div className="stat-icon"><FiTarget /></div><div className="stat-value">{stats?.activeCampaigns || 0}</div><div className="stat-label">Active Campaigns</div></div>
            <div className="stat-card teal"><div className="stat-icon"><FiHeart /></div><div className="stat-value">{stats?.totalDonors || 0}</div><div className="stat-label">Total Donors</div></div>
          </div>
          {renderCampaignTable(campaigns, formatPKR)}
          {renderMonthlyTable(monthly, formatPKR)}
        </div>
      </>
    );
  }

  // ──────────────────────────────────────────────
  // INVENTORY OFFICER DASHBOARD — Stock overview
  // ──────────────────────────────────────────────
  if (role === 'Inventory Officer') {
    return (
      <>
        <div className="page-header">
          <h2>Inventory Dashboard</h2>
          <p>Stock management overview</p>
        </div>
        <div className="page-body">
          <div className="stats-grid">
            <div className="stat-card teal"><div className="stat-icon"><FiPackage /></div><div className="stat-value">{stats?.activeCampaigns || 0}</div><div className="stat-label">Active Campaigns</div></div>
            <div className="stat-card purple"><div className="stat-icon"><FiAlertCircle /></div><div className="stat-value">{stats?.pendingRequests || 0}</div><div className="stat-label">Pending Item Requests</div></div>
          </div>
        </div>
      </>
    );
  }

  // Fallback for any other role
  return (
    <>
      <div className="page-header"><h2>Dashboard</h2><p>Welcome, {user.full_name}</p></div>
      <div className="page-body"><div className="empty-state"><h4>No dashboard configured for your role.</h4></div></div>
    </>
  );
}

// ─── Shared Sub-Components ────────────────────────────────────────
function renderCampaignTable(campaigns, formatPKR) {
  return (
    <div className="content-card">
      <div className="card-header"><h3>Campaign Financial Status</h3></div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead><tr><th>Campaign</th><th>Target</th><th>Collected</th><th>Remaining</th><th>Status</th><th>Donors</th></tr></thead>
          <tbody>
            {campaigns.map((c, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.title}</td>
                <td>{formatPKR(c.target_amount)}</td>
                <td className="text-green">{formatPKR(c.collected_amount)}</td>
                <td className="text-orange">{formatPKR(c.remaining_amount)}</td>
                <td><span className={`badge badge-${(c.status || '').toLowerCase()}`}>{c.status}</span></td>
                <td>{c.donor_count}</td>
              </tr>
            ))}
            {campaigns.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No campaign data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderMonthlyTable(monthly, formatPKR) {
  return (
    <div className="content-card">
      <div className="card-header"><h3>Monthly Donation Report</h3></div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead><tr><th>Month</th><th>Transactions</th><th>Total Amount</th></tr></thead>
          <tbody>
            {monthly.map((m, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{m.donation_month}</td>
                <td>{m.total_transactions}</td>
                <td className="text-green">{formatPKR(m.total_amount_collected)}</td>
              </tr>
            ))}
            {monthly.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No monthly data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
