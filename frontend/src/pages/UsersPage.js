// ==============================================================================
// UsersPage.js — Users CRUD with ACID transaction operations
// ==============================================================================
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import { fetchUsers, createUser, updateUser, deleteUser, fetchRoles } from '../services/api';

function UsersPage({ addToast }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', address: '', role_id: '', status: 'Active' });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([fetchUsers(), fetchRoles()]);
      setUsers(usersRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (err) {
      addToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editUser) {
        await updateUser(editUser.user_id, form);
        addToast('User updated (ACID transaction committed)');
      } else {
        await createUser(form);
        addToast('User created (ACID transaction committed)');
      }
      setShowModal(false);
      setEditUser(null);
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This action uses ACID rollback on failure.')) return;
    try {
      await deleteUser(id);
      addToast('User deleted (ACID transaction committed)');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ full_name: user.full_name, email: user.email, phone: user.phone || '', address: user.address || '', role_id: '', status: user.status });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditUser(null);
    setForm({ full_name: '', email: '', phone: '', address: '', role_id: roles[0]?.role_id || '', status: 'Active' });
    setShowModal(true);
  };

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <>
      <div className="page-header">
        <h2>Users Management</h2>
        <p>CRUD operations with ACID transaction support — all changes are atomic</p>
      </div>
      <div className="page-body">
        <div className="action-bar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add User</button>
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
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.user_id}>
                    <td>{u.user_id}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td><span className="badge badge-approved">{u.role_name}</span></td>
                    <td><span className={`badge badge-${(u.status || '').toLowerCase()}`}>{u.status}</span></td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn-icon" onClick={() => openEdit(u)}><FiEdit2 /></button>
                        <button className="btn-icon" onClick={() => handleDelete(u.user_id)} style={{ color: 'var(--accent-red)' }}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="7" className="empty-state"><h4>No users found</h4></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editUser ? 'Edit User' : 'Create User'}</h3>
                <button className="btn-icon" onClick={() => setShowModal(false)}><FiX /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input className="form-control" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email *</label>
                      <input className="form-control" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input className="form-control" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                  </div>
                  {!editUser && (
                    <div className="form-group">
                      <label>Role *</label>
                      <select className="form-control" value={form.role_id} onChange={e => setForm({...form, role_id: e.target.value})} required>
                        <option value="">Select Role</option>
                        {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
                      </select>
                    </div>
                  )}
                  {editUser && (
                    <div className="form-group">
                      <label>Status</label>
                      <select className="form-control" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editUser ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default UsersPage;
