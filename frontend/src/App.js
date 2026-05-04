// Main App shell — React SPA with role-based routing
// ==============================================================================
// App.js — Main Application Shell for Insaniyat Ghar
// STRICT Role-Based Access Control
//
// Super Admin      → Everything
// Charity Manager  → Campaigns, Help Requests, Inventory, Beneficiaries, Volunteers, Events
// Donor            → Dashboard (own donations) + Donations page ONLY
// Beneficiary      → Dashboard (own requests) + Help Requests page ONLY
// Volunteer        → Dashboard (upcoming events) ONLY
// Finance Officer  → Donations, Financial Reports, Audit Logs
// Inventory Officer → Inventory ONLY
// ==============================================================================
import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { FiHome, FiUsers, FiTarget, FiHeart, FiPackage, FiFileText, FiUserCheck, FiCalendar, FiShield, FiDollarSign, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';

import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import CampaignsPage from './pages/CampaignsPage';
import DonationsPage from './pages/DonationsPage';
import HelpRequestsPage from './pages/HelpRequestsPage';
import InventoryPage from './pages/InventoryPage';
import BeneficiariesPage from './pages/BeneficiariesPage';
import VolunteersPage from './pages/VolunteersPage';
import EventsPage from './pages/EventsPage';
import ReportsPage from './pages/ReportsPage';
import AuditPage from './pages/AuditPage';
import LoginPage from './pages/LoginPage';

function App() {
  const [toasts, setToasts] = useState([]);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
      document.body.setAttribute('data-theme', storedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const t = theme === 'dark' ? 'light' : 'dark';
    setTheme(t);
    localStorage.setItem('theme', t);
    document.body.setAttribute('data-theme', t);
  };

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    addToast('Logged out successfully', 'info');
  };

  // ─── Unauthenticated → Login ──────────────────
  if (!user) {
    return (
      <>
        <LoginPage setLoggedInUser={setUser} addToast={addToast} />
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'} {t.message}
            </div>
          ))}
        </div>
      </>
    );
  }

  const role = user.role_name;

  // ─── STRICT Permission Map ─────────────────────
  const perms = {
    users:         role === 'Super Admin',
    campaigns:     ['Super Admin', 'Charity Manager'].includes(role),
    donations:     ['Super Admin', 'Finance Officer', 'Donor'].includes(role),
    requests:      ['Super Admin', 'Charity Manager', 'Beneficiary'].includes(role),
    inventory:     ['Super Admin', 'Charity Manager', 'Inventory Officer'].includes(role),
    beneficiaries: ['Super Admin', 'Charity Manager'].includes(role),
    volunteers:    ['Super Admin', 'Charity Manager'].includes(role),
    events:        ['Super Admin', 'Charity Manager'].includes(role),
    reports:       ['Super Admin', 'Finance Officer'].includes(role),
    audit:         ['Super Admin'].includes(role),
  };

  // Build nav items based on permissions
  const managementNav = [];
  if (perms.users)     managementNav.push({ to: '/users',     icon: FiUsers,      label: 'Users' });
  if (perms.campaigns) managementNav.push({ to: '/campaigns', icon: FiTarget,     label: 'Campaigns' });
  if (perms.donations) managementNav.push({ to: '/donations', icon: FiDollarSign, label: 'Donations' });
  if (perms.requests)  managementNav.push({ to: '/requests',  icon: FiHeart,      label: 'Help Requests' });
  if (perms.inventory) managementNav.push({ to: '/inventory', icon: FiPackage,    label: 'Inventory' });

  const peopleNav = [];
  if (perms.beneficiaries) peopleNav.push({ to: '/beneficiaries', icon: FiUserCheck, label: 'Beneficiaries' });
  if (perms.volunteers)    peopleNav.push({ to: '/volunteers',    icon: FiUsers,     label: 'Volunteers' });
  if (perms.events)        peopleNav.push({ to: '/events',        icon: FiCalendar,  label: 'Events' });

  const reportsNav = [];
  if (perms.reports) reportsNav.push({ to: '/reports', icon: FiFileText, label: 'Financial Reports' });
  if (perms.audit)   reportsNav.push({ to: '/audit',   icon: FiShield,   label: 'Audit Logs' });

  return (
    <Router>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <img src="/logo.png" alt="Insaniyat Ghar" />
            <div>
              <h1>Insaniyat Ghar</h1>
              <span>Charity Management</span>
            </div>
          </div>

          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.full_name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-teal-light)' }}>{role}</div>
          </div>

          <nav className="sidebar-nav">
            {/* Dashboard — Everyone */}
            <div className="nav-section">
              <div className="nav-section-title">Main</div>
              <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <FiHome className="nav-icon" /> Dashboard
              </NavLink>
            </div>

            {managementNav.length > 0 && (
              <div className="nav-section">
                <div className="nav-section-title">Management</div>
                {managementNav.map(n => (
                  <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <n.icon className="nav-icon" /> {n.label}
                  </NavLink>
                ))}
              </div>
            )}

            {peopleNav.length > 0 && (
              <div className="nav-section">
                <div className="nav-section-title">People</div>
                {peopleNav.map(n => (
                  <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <n.icon className="nav-icon" /> {n.label}
                  </NavLink>
                ))}
              </div>
            )}

            {reportsNav.length > 0 && (
              <div className="nav-section">
                <div className="nav-section-title">Reports</div>
                {reportsNav.map(n => (
                  <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <n.icon className="nav-icon" /> {n.label}
                  </NavLink>
                ))}
              </div>
            )}
          </nav>

          <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={toggleTheme}>
              {theme === 'dark' ? <><FiSun /> Light Mode</> : <><FiMoon /> Dark Mode</>}
            </button>
            <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard addToast={addToast} />} />
            <Route path="/users" element={perms.users ? <UsersPage addToast={addToast} /> : <Navigate to="/" />} />
            <Route path="/campaigns" element={perms.campaigns ? <CampaignsPage addToast={addToast} /> : <Navigate to="/" />} />
            <Route path="/donations" element={perms.donations ? <DonationsPage addToast={addToast} /> : <Navigate to="/" />} />
            <Route path="/requests" element={perms.requests ? <HelpRequestsPage addToast={addToast} /> : <Navigate to="/" />} />
            <Route path="/inventory" element={perms.inventory ? <InventoryPage addToast={addToast} /> : <Navigate to="/" />} />
            <Route path="/beneficiaries" element={perms.beneficiaries ? <BeneficiariesPage addToast={addToast} /> : <Navigate to="/" />} />
            <Route path="/volunteers" element={perms.volunteers ? <VolunteersPage addToast={addToast} /> : <Navigate to="/" />} />
            <Route path="/events" element={perms.events ? <EventsPage addToast={addToast} /> : <Navigate to="/" />} />
            <Route path="/reports" element={perms.reports ? <ReportsPage addToast={addToast} /> : <Navigate to="/" />} />
            <Route path="/audit" element={perms.audit ? <AuditPage addToast={addToast} /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'} {t.message}
            </div>
          ))}
        </div>
      </div>
    </Router>
  );
}

export default App;
