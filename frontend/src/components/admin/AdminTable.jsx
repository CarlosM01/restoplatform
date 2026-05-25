import React from 'react';

const isUrl = (str) => typeof str === 'string' && (str.startsWith('http') || str.startsWith('/') || str.startsWith('data:'));

const ROLE_COLOR = {
  admin: { bg: '#FFEBEE', color: '#C62828' },
  manager: { bg: '#E3F2FD', color: '#1976D2' },
  customer: { bg: '#F5F5F5', color: '#616161' },
};

export default function AdminTable({
  activeTab,
  filteredData,
  getNameLookup,
  setEditTarget,
  removeEntity,
  removeUser,
  ban,
  unban,
  currentUser,
  fmt
}) {
  const G = 'var(--color-gold)';
  const M = 'var(--color-muted)';
  const B = 'var(--color-border)';

  return (
    <div className="admin-table-container" style={{ padding: 0, overflow: 'auto', flex: 1, background: '#FFF' }}>
      <table className="admin-table">
        <thead>
          {activeTab === 'users' && (
            <tr>
              <th>ID</th>
              <th>NOMBRE</th>
              <th>EMAIL</th>
              <th>RUT</th>
              <th style={{ textAlign: 'center' }}>ROL</th>
              <th style={{ textAlign: 'center' }}>ESTADO</th>
              <th style={{ textAlign: 'center' }}>ACCIONES</th>
            </tr>
          )}

          {activeTab === 'categories' && (
            <tr>
              <th>IMG</th>
              <th>NOMBRE</th>
              <th>PADRE</th>
              <th>SUBTÍTULO</th>
              <th style={{ textAlign: 'center' }}>ORDEN</th>
              <th style={{ textAlign: 'center' }}>ESTADO</th>
              <th style={{ textAlign: 'center' }}>ACCIONES</th>
            </tr>
          )}

          {activeTab === 'items' && (
            <tr>
              <th>IMG</th>
              <th>NOMBRE</th>
              <th>CATEGORÍA</th>
              <th style={{ textAlign: 'right' }}>PRECIO</th>
              <th style={{ textAlign: 'center' }}>STOCK</th>
              <th style={{ textAlign: 'center' }}>ESTADO</th>
              <th style={{ textAlign: 'center' }}>ACCIONES</th>
            </tr>
          )}

          {activeTab === 'variants' && (
            <tr>
              <th>NOMBRE</th>
              <th>PLATO BASE</th>
              <th>SKU</th>
              <th style={{ textAlign: 'right' }}>PRECIO OVERRIDE</th>
              <th style={{ textAlign: 'center' }}>DISP.</th>
              <th style={{ textAlign: 'center' }}>ACCIONES</th>
            </tr>
          )}

          {activeTab === 'modifier-groups' && (
            <tr>
              <th>NOMBRE</th>
              <th>DESCRIPCIÓN</th>
              <th style={{ textAlign: 'center' }}>ORDEN</th>
              <th style={{ textAlign: 'center' }}>ACCIONES</th>
            </tr>
          )}

          {activeTab === 'modifiers' && (
            <tr>
              <th>NOMBRE</th>
              <th>GRUPO</th>
              <th style={{ textAlign: 'right' }}>DIF. PRECIO</th>
              <th style={{ textAlign: 'center' }}>CANT. MÁX</th>
              <th style={{ textAlign: 'center' }}>DISP.</th>
              <th style={{ textAlign: 'center' }}>ACCIONES</th>
            </tr>
          )}

          {activeTab === 'suppliers' && (
            <tr>
              <th>NOMBRE</th>
              <th>CONTACT EMAIL</th>
              <th>PAÍS</th>
              <th style={{ textAlign: 'center' }}>ESTADO</th>
              <th style={{ textAlign: 'center' }}>ACCIONES</th>
            </tr>
          )}

          {activeTab === 'ingredients' && (
            <tr>
              <th>IMG</th>
              <th>NOMBRE</th>
              <th>PROVEEDOR</th>
              <th>PAÍS ORIGEN</th>
              <th style={{ textAlign: 'center' }}>UNIDAD</th>
              <th style={{ textAlign: 'center' }}>ESTADO</th>
              <th style={{ textAlign: 'center' }}>ACCIONES</th>
            </tr>
          )}

          {activeTab === 'dietary-tags' && (
            <tr>
              <th>BADGE</th>
              <th>NOMBRE</th>
              <th>DESCRIPCIÓN</th>
              <th>REF. INTERNA</th>
              <th style={{ textAlign: 'center' }}>ACCIONES</th>
            </tr>
          )}

          {activeTab === 'allergens' && (
            <tr>
              <th>NOMBRE</th>
              <th>DESCRIPCIÓN</th>
              <th style={{ textAlign: 'center' }}>GRAVEDAD</th>
              <th>REF. INTERNA</th>
              <th style={{ textAlign: 'center' }}>ACCIONES</th>
            </tr>
          )}
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={10} style={{ padding: 40, textAlign: 'center', color: M }}>
                No se encontraron elementos.
              </td>
            </tr>
          ) : (
            filteredData.map(item => (
              <tr key={item.id}>
                {activeTab === 'users' && (
                  <>
                    <td style={{ color: M, fontSize: 11 }}>#{String(item.id).slice(0, 8)}</td>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td style={{ fontSize: 12 }}>{item.email}</td>
                    <td style={{ fontSize: 12, color: M }}>{item.rut}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: (ROLE_COLOR[item.role] || ROLE_COLOR.customer).bg, color: (ROLE_COLOR[item.role] || ROLE_COLOR.customer).color, padding: '4px 10px', borderRadius: 12, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                        {item.role}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.is_banned ? (
                        <span style={{ background: '#FFEBEE', color: '#C62828', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>Baneado</span>
                      ) : item.is_active ? (
                        <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>Activo</span>
                      ) : (
                        <span style={{ background: '#F5F5F5', color: M, padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>Inactivo</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => setEditTarget(item)} className="admin-action-btn edit">Editar</button>
                      {item.id !== currentUser?.id && (
                        <>
                          {item.is_banned ? (
                            <button onClick={() => unban(item.id)} className="admin-action-btn edit" style={{ color: '#2E7D32' }}>Desbanear</button>
                          ) : (
                            <button onClick={() => ban(item.id)} className="admin-action-btn ban">Banear</button>
                          )}
                          <button onClick={() => removeUser(item.id)} className="admin-action-btn delete">Eliminar</button>
                        </>
                      )}
                    </td>
                  </>
                )}

                {activeTab === 'categories' && (
                  <>
                    <td>
                      {isUrl(item.image_url) ? (
                        <img src={item.image_url} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', border: `1px solid ${B}` }} />
                      ) : item.image_url ? (
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{item.image_url}</div>
                      ) : (
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: M }}>📁</div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td style={{ color: M }}>{getNameLookup('categories', item.parent_id)}</td>
                    <td style={{ fontSize: 12 }}>{item.subtitle || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{item.sort_order}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: item.is_active ? '#E8F5E9' : '#FFEBEE', color: item.is_active ? '#2E7D32' : '#C62828', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                        {item.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => setEditTarget(item)} className="admin-action-btn edit">Editar</button>
                      <button onClick={() => removeEntity('categories', item.id)} className="admin-action-btn delete">Eliminar</button>
                    </td>
                  </>
                )}

                {activeTab === 'items' && (
                  <>
                    <td>
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, overflow: 'hidden' }}>
                        {isUrl(item.image) ? (
                          <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          item.image || '🍽️'
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td>{item.category}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(item.price)}</td>
                    <td style={{ textAlign: 'center' }}>{item.inventory?.stock ?? 0}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: item.is_active ? '#E8F5E9' : '#FFEBEE', color: item.is_active ? '#2E7D32' : '#C62828', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                        {item.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => setEditTarget(item)} className="admin-action-btn edit">Editar</button>
                      <button onClick={() => removeEntity('items', item.id)} className="admin-action-btn delete">Eliminar</button>
                    </td>
                  </>
                )}

                {activeTab === 'variants' && (
                  <>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td>{getNameLookup('items', item.menu_item_id)}</td>
                    <td style={{ color: M }}>{item.sku || '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.price_override ? fmt(item.price_override) : '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: item.is_available ? '#E8F5E9' : '#FFEBEE', color: item.is_available ? '#2E7D32' : '#C62828', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                        {item.is_available ? 'Disponible' : 'No'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => setEditTarget(item)} className="admin-action-btn edit">Editar</button>
                      <button onClick={() => removeEntity('variants', item.id)} className="admin-action-btn delete">Eliminar</button>
                    </td>
                  </>
                )}

                {activeTab === 'modifier-groups' && (
                  <>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td style={{ fontSize: 12 }}>{item.description || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{item.sort_order}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => setEditTarget(item)} className="admin-action-btn edit">Editar</button>
                      <button onClick={() => removeEntity('modifier-groups', item.id)} className="admin-action-btn delete">Eliminar</button>
                    </td>
                  </>
                )}

                {activeTab === 'modifiers' && (
                  <>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td>{getNameLookup('modifier-groups', item.modifier_group_id)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(item.price_delta)}</td>
                    <td style={{ textAlign: 'center' }}>{item.max_quantity || 'Sinfín'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: item.is_available ? '#E8F5E9' : '#FFEBEE', color: item.is_available ? '#2E7D32' : '#C62828', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                        {item.is_available ? 'Disponible' : 'No'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => setEditTarget(item)} className="admin-action-btn edit">Editar</button>
                      <button onClick={() => removeEntity('modifiers', item.id)} className="admin-action-btn delete">Eliminar</button>
                    </td>
                  </>
                )}

                {activeTab === 'suppliers' && (
                  <>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td style={{ fontSize: 12 }}>{item.contact_email || '—'}</td>
                    <td>{item.country || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: item.is_active ? '#E8F5E9' : '#FFEBEE', color: item.is_active ? '#2E7D32' : '#C62828', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                        {item.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => setEditTarget(item)} className="admin-action-btn edit">Editar</button>
                      <button onClick={() => removeEntity('suppliers', item.id)} className="admin-action-btn delete">Eliminar</button>
                    </td>
                  </>
                )}

                {activeTab === 'ingredients' && (
                  <>
                    <td>
                      {isUrl(item.image_url) ? (
                        <img src={item.image_url} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', border: `1px solid ${B}` }} />
                      ) : item.image_url ? (
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{item.image_url}</div>
                      ) : (
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: M }}>📦</div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td>{getNameLookup('suppliers', item.supplier_id)}</td>
                    <td>{item.origin_country || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{item.unit || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: item.is_active ? '#E8F5E9' : '#FFEBEE', color: item.is_active ? '#2E7D32' : '#C62828', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                        {item.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => setEditTarget(item)} className="admin-action-btn edit">Editar</button>
                      <button onClick={() => removeEntity('ingredients', item.id)} className="admin-action-btn delete">Eliminar</button>
                    </td>
                  </>
                )}

                {activeTab === 'dietary-tags' && (
                  <>
                    <td>
                      <span style={{ background: item.badge_color || '#FDFAF6', border: `1px solid ${B}`, color: '#2D2A26', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                        {item.icon_url ? item.icon_url + ' ' : ''} {item.name}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td style={{ fontSize: 12 }}>{item.description || '—'}</td>
                    <td style={{ fontSize: 11, color: M }}>{item.internal_ref_url || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => setEditTarget(item)} className="admin-action-btn edit">Editar</button>
                      <button onClick={() => removeEntity('dietary-tags', item.id)} className="admin-action-btn delete">Eliminar</button>
                    </td>
                  </>
                )}

                {activeTab === 'allergens' && (
                  <>
                    <td style={{ fontWeight: 600 }}>
                      {item.icon_url ? item.icon_url + ' ' : ''} {item.name}
                    </td>
                    <td style={{ fontSize: 12 }}>{item.description || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: item.severity === 'Alta' ? '#FFEBEE' : '#FFF3E0', color: item.severity === 'Alta' ? '#C62828' : '#E65100', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                        {item.severity || 'Media'}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: M }}>{item.internal_ref_url || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => setEditTarget(item)} className="admin-action-btn edit">Editar</button>
                      <button onClick={() => removeEntity('allergens', item.id)} className="admin-action-btn delete">Eliminar</button>
                    </td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
