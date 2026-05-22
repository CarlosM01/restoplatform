import { useState, useEffect } from 'react';
import {
  adminListUsers, adminCreateUser, adminUpdateUser,
  adminBanUser, adminUnbanUser, adminDeleteUser,
  getUser, clearAuth,
} from '../lib/api.js';

const G = '#C4A97D', D = '#1B1916', M = '#A89B8C', B = '#F0EBE4';

const ROLE_COLOR = {
  admin: { bg: '#FFEBEE', color: '#C62828' },
  manager: { bg: '#E3F2FD', color: '#1976D2' },
  customer: { bg: '#F5F5F5', color: '#616161' },
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== 'admin') { window.location.href = '/login'; return; }
    setUser(u);
    load();
  }, []);

  const load = () => adminListUsers().then(setUsers).catch(e => alert(e.message));

  const ban = async (id) => {
    if (!confirm('¿Banear usuario?')) return;
    await adminBanUser(id); load();
  };
  const unban = async (id) => { await adminUnbanUser(id); load(); };
  const remove = async (id) => {
    if (!confirm('¿ELIMINAR usuario permanentemente? Esto no se puede deshacer.')) return;
    await adminDeleteUser(id); load();
  };

  const filteredUsers = roleFilter ? users.filter(u => u.role === roleFilter) : users;
  const logout = () => { clearAuth(); window.location.href = '/login'; };

  if (!user) return null;

  return (
    <div className="app-shell wide" style={{ maxWidth: 1200 }}>
      <div className="app-header" style={{ padding: '14px 24px' }}>
        <div>
          <div className="brand">PANEL ADMINISTRADOR</div>
          <div className="name">RestoPlatform · Dueño</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/manager" style={{ color: G, fontSize: 12 }}>Panel manager</a>
          <button onClick={logout} className="btn-ghost" style={{ padding: '6px 14px', fontSize: 11 }}>Salir</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 24, background: '#FAFAFA' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22 }}>Gestión de Usuarios</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input" style={{ width: 180 }}>
              <option value="">Todos los roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Encargado</option>
              <option value="customer">Cliente</option>
            </select>
            <button onClick={() => setShowCreate(true)} className="btn-gold" style={{ padding: '10px 16px' }}>+ Nuevo usuario</button>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ background: '#FFF8F0' }}>
              <tr>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>ID</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>NOMBRE</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>EMAIL</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>RUT</th>
                <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ROL</th>
                <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>SEDE</th>
                <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ESTADO</th>
                <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => {
                const rolColor = ROLE_COLOR[u.role] || ROLE_COLOR.customer;
                return (
                  <tr key={u.id} style={{ borderTop: `1px solid ${B}`, opacity: u.is_banned ? 0.5 : 1 }}>
                    <td style={{ padding: 12, color: M, fontSize: 11 }}>#{u.id}</td>
                    <td style={{ padding: 12, fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: 12, fontSize: 12 }}>{u.email}</td>
                    <td style={{ padding: 12, fontSize: 12, color: M }}>{u.rut}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <span style={{ background: rolColor.bg, color: rolColor.color, padding: '4px 10px', borderRadius: 12, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{u.role}</span>
                    </td>
                    <td style={{ padding: 12, textAlign: 'center', fontSize: 11 }}>{u.venue_id || '—'}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      {u.is_banned ? (
                        <span style={{ background: '#FFEBEE', color: '#C62828', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>Baneado</span>
                      ) : u.is_active ? (
                        <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>Activo</span>
                      ) : (
                        <span style={{ background: '#F5F5F5', color: M, padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>Inactivo</span>
                      )}
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <button onClick={() => setEditUser(u)} style={{ background: 'none', border: `1px solid ${G}`, color: G, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginRight: 4 }}>Editar</button>
                      {u.id !== user.id && (
                        <>
                          {u.is_banned ? (
                            <button onClick={() => unban(u.id)} style={{ background: '#E8F5E9', color: '#2E7D32', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginRight: 4 }}>Desbanear</button>
                          ) : (
                            <button onClick={() => ban(u.id)} style={{ background: '#FFF3E0', color: '#F57C00', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginRight: 4 }}>Banear</button>
                          )}
                          <button onClick={() => remove(u.id)} style={{ background: '#FFEBEE', color: '#C62828', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>Eliminar</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal crear/editar */}
      {(showCreate || editUser) && (
        <UserModal
          user={editUser}
          onClose={() => { setShowCreate(false); setEditUser(null); }}
          onSaved={() => { setShowCreate(false); setEditUser(null); load(); }}
        />
      )}
    </div>
  );
}

function UserModal({ user, onClose, onSaved }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    rut: user?.rut || '',
    password: '',
    role: user?.role || 'customer',
    venue_id: user?.venue_id || '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async () => {
    setSaving(true); setErr(null);
    try {
      if (isEdit) {
        const data = {};
        if (form.name !== user.name) data.name = form.name;
        if (form.email !== user.email) data.email = form.email;
        if (form.role !== user.role) data.role = form.role;
        if (form.venue_id !== user.venue_id) data.venue_id = form.venue_id ? +form.venue_id : null;
        await adminUpdateUser(user.id, data);
      } else {
        await adminCreateUser({
          ...form,
          venue_id: form.venue_id ? +form.venue_id : null,
        });
      }
      onSaved();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#FFF', borderRadius: 16, padding: 24, width: 420, maxWidth: '90%' }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, marginBottom: 16 }}>
          {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div><label className="label">Nombre</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          {!isEdit && (
            <>
              <div><label className="label">RUT</label><input className="input" value={form.rut} onChange={e => setForm({...form, rut: e.target.value})} /></div>
              <div><label className="label">Contraseña</label><input type="password" className="input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
            </>
          )}
          <div>
            <label className="label">Rol</label>
            <select className="input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="customer">Cliente</option>
              <option value="manager">Encargado</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {form.role === 'manager' && (
            <div><label className="label">Sede ID</label><input type="number" className="input" value={form.venue_id} onChange={e => setForm({...form, venue_id: e.target.value})} placeholder="1" /></div>
          )}
        </div>

        {err && <div style={{ background: '#FFEBEE', color: '#C62828', padding: 10, borderRadius: 8, fontSize: 12, marginTop: 10 }}>{err}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancelar</button>
          <button onClick={submit} disabled={saving} className="btn-gold" style={{ flex: 1 }}>{saving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );
}
