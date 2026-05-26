import React, { useState, useEffect } from 'react';
import useAdminDashboard from '../../hooks/useAdminDashboard.js';
import Header from '../common/Header.jsx';
import Button from '../common/Button.jsx';
import Select from '../common/Select.jsx';
import AdminTable from './AdminTable.jsx';
import UserModal from './UserModal.jsx';
import EntityModal from './EntityModal.jsx';
import { SECTIONS } from './FieldConfigs.js';
import { fmt } from '../../lib/api.js';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const {
    user,
    activeTab,
    setActiveTab,
    data,
    loading,
    showCreate,
    setShowCreate,
    editTarget,
    setEditTarget,
    roleFilter,
    setRoleFilter,
    searchQuery,
    setSearchQuery,
    loadAll,
    ban,
    unban,
    removeUser,
    removeEntity,
    logout,
    getNameLookup,
    getFilteredData,
    apis,
  } = useAdminDashboard();

  // State for collapsible categories in navigation
  const [expandedCats, setExpandedCats] = useState({
    'GENERAL': true,
    'MENÚ': true,
    'LOGÍSTICA / SALUD': true
  });

  // Automatically expand category of the active tab when tab changes
  useEffect(() => {
    const activeSection = SECTIONS.find(s => s.id === activeTab);
    if (activeSection) {
      setExpandedCats(prev => ({
        ...prev,
        [activeSection.category]: true
      }));
    }
  }, [activeTab]);

  const toggleCategory = (cat) => {
    setExpandedCats(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  if (!user) return null;

  // Group sections by category
  const categories = ['GENERAL', 'MENÚ', 'LOGÍSTICA / SALUD'];

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div>
          <div className="admin-brand">RestoApp</div>
          <div className="admin-venue">Restaurante Demo</div>
        </div>

        <div className="admin-nav">
          {categories.map(cat => {
            const catSections = SECTIONS.filter(s => s.category === cat);
            const isExpanded = !!expandedCats[cat];
            return (
              <div key={cat} className="admin-nav-group">
                <button
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`admin-category-header ${isExpanded ? 'expanded' : ''}`}
                >
                  <span className="category-title">{cat}</span>
                  <span className="category-chevron">
                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                      <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
                <div className={`admin-submenu-wrapper ${isExpanded ? 'expanded' : ''}`}>
                  <div className="admin-submenu-inner">
                    {catSections.map(sec => (
                      <button
                        key={sec.id}
                        onClick={() => {
                          setActiveTab(sec.id);
                          setSearchQuery('');
                          setRoleFilter('');
                        }}
                        className={`admin-nav-item ${activeTab === sec.id ? 'active' : ''}`}
                      >
                        {sec.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div style={{ borderTop: '1px solid var(--color-dark-2)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-gold)' }}>{user.name}</div>
            <div style={{ fontSize: 9, color: 'var(--color-muted)' }}>Administrador</div>
          </div>
          <button
            onClick={logout}
            style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: 16 }}
            title="Cerrar sesión"
          >
            ↪
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-content">
        <Header
          title="PANEL ADMINISTRADOR"
          subtitle="Gestión Centralizada"
        />

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, flex: 1, minHeight: 0 }}>
          {/* Section title & Create CTA */}
          <div className="admin-header-row">
            <h2 className="admin-title">
              {SECTIONS.find(s => s.id === activeTab)?.label || activeTab}
            </h2>
            <Button
              onClick={() => setShowCreate(true)}
              variant="gold"
              style={{ padding: '10px 18px', fontSize: 13, fontWeight: 600 }}
            >
              + Agregar Nuevo
            </Button>
          </div>

          {/* Filters toolbar */}
          <div className="admin-toolbar">
            <input
              type="text"
              placeholder="Buscar..."
              className="admin-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />

            {activeTab === 'users' && (
              <Select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                style={{ width: 180, padding: '7px 10px', fontSize: 12 }}
                options={[
                  { value: '', label: 'Todos los roles' },
                  { value: 'admin', label: 'Administrador' },
                  { value: 'manager', label: 'Encargado' },
                  { value: 'customer', label: 'Cliente' },
                ]}
              />
            )}
          </div>

          {/* Table Container */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-muted)' }}>
              Cargando datos...
            </div>
          ) : (
            <AdminTable
              activeTab={activeTab}
              filteredData={getFilteredData()}
              getNameLookup={getNameLookup}
              setEditTarget={setEditTarget}
              removeEntity={removeEntity}
              removeUser={removeUser}
              ban={ban}
              unban={unban}
              currentUser={user}
              fmt={fmt}
            />
          )}
        </div>
      </div>

      {/* UserModal / EntityModal Popup */}
      {(showCreate || editTarget) && (
        activeTab === 'users' ? (
          <UserModal
            editTarget={editTarget}
            apis={apis}
            onClose={() => { setShowCreate(false); setEditTarget(null); }}
            onSaved={() => { setShowCreate(false); setEditTarget(null); loadAll(); }}
          />
        ) : (
          <EntityModal
            entityName={activeTab}
            editEntity={editTarget}
            lookupLists={data}
            apis={apis}
            onClose={() => { setShowCreate(false); setEditTarget(null); }}
            onSaved={() => { setShowCreate(false); setEditTarget(null); loadAll(); }}
          />
        )
      )}
    </div>
  );
}
