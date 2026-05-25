import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';
import Checkbox from '../common/Checkbox.jsx';
import Textarea from '../common/Textarea.jsx';
import { FIELD_CONFIGS } from './FieldConfigs.js';
import { fmt } from '../../lib/api.js';

export default function EntityModal({ entityName, editEntity, lookupLists, apis, onClose, onSaved }) {
  const isEdit = !!editEntity;
  const configs = FIELD_CONFIGS[entityName] || [];

  const G = 'var(--color-gold)';
  const D = 'var(--color-dark)';
  const M = 'var(--color-muted)';
  const B = 'var(--color-border)';

  // Initialize form state
  const [form, setForm] = useState(() => {
    const init = {};
    configs.forEach(field => {
      if (isEdit) {
        init[field.name] = editEntity[field.name] !== null && editEntity[field.name] !== undefined
          ? editEntity[field.name]
          : (field.type === 'checkbox' ? false : '');
      } else {
        init[field.name] = field.default !== undefined
          ? field.default
          : (field.type === 'checkbox' ? false : '');
      }
    });
    if (entityName === 'items') {
      init.modifiers = editEntity?.modifiers || [];
    }
    return init;
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setErr(null);

    // Custom validation for items category
    if (entityName === 'items' && !form.category) {
      setErr('La categoría es obligatoria.');
      setSaving(false);
      return;
    }

    // Cast data cleanly to match Pydantic schemas
    const parsed = {};
    configs.forEach(field => {
      const val = form[field.name];
      if (field.type === 'number') {
        if (val === '' || val === null || val === undefined) {
          parsed[field.name] = (field.nullable || field.name.endsWith('_id') || field.name === 'price_override' || field.name === 'prep_time_minutes' || field.name === 'max_quantity') ? null : 0;
        } else {
          parsed[field.name] = Number(val);
        }
      } else if (field.type === 'checkbox') {
        parsed[field.name] = !!val;
      } else if (field.type === 'select') {
        parsed[field.name] = val === '' ? null : val;
      } else {
        parsed[field.name] = val === '' ? (field.nullable ? null : '') : val;
      }
    });

    if (entityName === 'items') {
      parsed.modifiers = form.modifiers || [];
    }

    try {
      if (isEdit) {
        await apis[entityName].update(editEntity.id, parsed);
      } else {
        await apis[entityName].create(parsed);
      }
      onSaved();
    } catch (e) {
      setErr(e.message || 'Error en la petición');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? `Editar ${entityName.replace('-', ' ')}` : `Nueva ${entityName.replace('-', ' ')}`}
      width={480}
      cardStyle={{ maxHeight: '90vh' }}
    >
      <form onSubmit={submit} className="admin-form-group">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {configs.map(field => {
            if (field.hideOnEdit && isEdit) return null;

            if (field.type === 'checkbox') {
              return (
                <Checkbox
                  key={field.name}
                  id={field.name}
                  label={field.label}
                  checked={!!form[field.name]}
                  onChange={e => setForm({ ...form, [field.name]: e.target.checked })}
                />
              );
            }

            if (field.type === 'textarea') {
              return (
                <Textarea
                  key={field.name}
                  label={field.label}
                  rows={3}
                  value={form[field.name] || ''}
                  onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                />
              );
            }

            if (field.type === 'select') {
              if (entityName === 'items' && field.name === 'category') {
                return (
                  <div key={field.name} className="admin-category-selector" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="label" style={{ fontWeight: '700', fontSize: 13, color: D, marginBottom: 2 }}>
                      {field.label} {field.required && <span style={{ color: '#C62828' }}>*</span>}
                    </label>

                    {form.category ? (
                      <div style={{ background: '#FAF9F6', border: `1px solid ${B}`, borderRadius: 10, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 10, color: M, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Categoría Seleccionada</span>
                          <span style={{ fontSize: 13, fontWeight: '700', color: D, marginTop: 2 }}>{form.category}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, category: '' })}
                          style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: 14, fontWeight: '700', padding: '4px 8px' }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#FFFDF9', border: `1px dashed ${G}`, borderRadius: 10, padding: 12 }}>
                        <div style={{ flex: 1 }}>
                          <select
                            id="select-existing-category"
                            className="input"
                            style={{ padding: '6px 10px', fontSize: 12, marginBottom: 4, width: '100%', borderRadius: 8 }}
                            onChange={(e) => {
                              const val = e.target.value;
                              const customInput = document.getElementById('new-category-custom-name');
                              if (val === 'CUSTOM') {
                                customInput.style.display = 'block';
                              } else {
                                customInput.style.display = 'none';
                                customInput.value = '';
                              }
                            }}
                          >
                            <option value="">Selecciona categoría existente...</option>
                            {(lookupLists['categories'] || []).map(cat => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                            <option value="CUSTOM">+ Crear nueva categoría...</option>
                          </select>
                          <input
                            type="text"
                            id="new-category-custom-name"
                            placeholder="Nombre de nueva categoría (ej: Pizzas, Postres)"
                            className="input"
                            style={{ display: 'none', padding: '6px 10px', fontSize: 12, width: '100%', marginTop: 6, borderRadius: 8 }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            const selectEl = document.getElementById('select-existing-category');
                            const customInput = document.getElementById('new-category-custom-name');
                            let catName = '';
                            if (selectEl.value === 'CUSTOM') {
                              catName = customInput.value.trim();
                            } else {
                              catName = selectEl.value;
                            }

                            if (!catName) return;

                            if (selectEl.value === 'CUSTOM') {
                              try {
                                setSaving(true);
                                const newCat = await apis.categories.create({ name: catName });
                                if (newCat) {
                                  lookupLists['categories'] = lookupLists['categories'] || [];
                                  lookupLists['categories'].push(newCat);
                                }
                              } catch (e) {
                                alert('Error al crear categoría: ' + e.message);
                                setSaving(false);
                                return;
                              } finally {
                                setSaving(false);
                              }
                            }

                            setForm({ ...form, category: catName });

                            if (selectEl) selectEl.value = '';
                            if (customInput) {
                              customInput.value = '';
                              customInput.style.display = 'none';
                            }
                          }}
                          className="btn-gold"
                          style={{ padding: '8px 14px', fontSize: 12, height: 'fit-content', cursor: 'pointer', whiteSpace: 'nowrap', borderRadius: 8 }}
                        >
                          Agregar
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              const list = lookupLists[field.relation] || [];
              const filteredList = (entityName === 'categories' && field.relation === 'categories' && isEdit)
                ? list.filter(item => item.id !== editEntity.id)
                : list;

              return (
                <Select
                  key={field.name}
                  label={field.label}
                  value={form[field.name] || ''}
                  onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                  required={field.required}
                >
                  <option value="">Seleccione una opción...</option>
                  {filteredList.map(item => (
                    <option key={item.id} value={field.name === 'category' ? item.name : item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              );
            }

            return (
              <Input
                key={field.name}
                type={field.type}
                label={field.label}
                value={form[field.name] === null || form[field.name] === undefined ? '' : form[field.name]}
                onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                min={field.min}
                required={field.required}
              />
            );
          })}

          {/* Sub-Modifiers List builder inside Product Form */}
          {entityName === 'items' && (
            <div style={{ marginTop: 10, borderTop: `1px solid ${B}`, paddingTop: 16 }}>
              <label className="label" style={{ fontWeight: '700', fontSize: 13, color: D, marginBottom: 4, display: 'block' }}>
                🛠️ Modificadores (ej: Salsas, Queso Extra)
              </label>
              <p style={{ fontSize: 11, color: M, marginBottom: 12 }}>
                Vincule o cree categorías de modificadores con sus opciones y diferenciales de precio.
              </p>

              {(form.modifiers || []).map((group, groupIdx) => (
                <div key={groupIdx} style={{ background: '#FAF9F6', border: `1px solid ${B}`, borderRadius: 10, padding: 12, marginBottom: 12, position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const nextMods = [...form.modifiers];
                      nextMods.splice(groupIdx, 1);
                      setForm({ ...form, modifiers: nextMods });
                    }}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: 13, fontWeight: '700' }}
                  >
                    ✕
                  </button>

                  <div style={{ fontWeight: '700', fontSize: 12, color: D, marginBottom: 8 }}>
                    Grupo: {group.name}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                    {(group.options || []).map((opt, optIdx) => (
                      <div key={optIdx} style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', background: '#FFF', border: `1px solid ${B}`, borderRadius: 6, padding: '4px 8px' }}>
                        <span style={{ fontSize: 11, color: '#4A4A4A' }}>{opt.name}</span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: '600', color: G }}>+{fmt(opt.price_delta)}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextMods = JSON.parse(JSON.stringify(form.modifiers));
                              nextMods[groupIdx].options.splice(optIdx, 1);
                              setForm({ ...form, modifiers: nextMods });
                            }}
                            style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: 10 }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      placeholder="Opción (ej: Salsa Picante)"
                      id={`new-opt-name-${groupIdx}`}
                      className="input"
                      style={{ flex: 2, padding: '4px 8px', fontSize: 11 }}
                    />
                    <input
                      type="number"
                      placeholder="+$ Delta"
                      id={`new-opt-price-${groupIdx}`}
                      className="input"
                      style={{ flex: 1, padding: '4px 8px', fontSize: 11 }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nameInput = document.getElementById(`new-opt-name-${groupIdx}`);
                        const priceInput = document.getElementById(`new-opt-price-${groupIdx}`);
                        const optName = nameInput.value.trim();
                        const optPrice = Number(priceInput.value) || 0;
                        if (!optName) return;

                        const nextMods = JSON.parse(JSON.stringify(form.modifiers));
                        nextMods[groupIdx].options = nextMods[groupIdx].options || [];
                        nextMods[groupIdx].options.push({ name: optName, price_delta: optPrice });
                        setForm({ ...form, modifiers: nextMods });

                        nameInput.value = '';
                        priceInput.value = '';
                      }}
                      className="btn-gold"
                      style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6 }}
                    >
                      + Opción
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, background: '#FFFDF9', border: `1px dashed ${G}`, borderRadius: 10, padding: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: '600', color: D, marginBottom: 4 }}>Vincular/Crear Categoría</div>
                  <select
                    id="select-existing-group"
                    className="input"
                    style={{ padding: '6px 10px', fontSize: 11, marginBottom: 4 }}
                    onChange={(e) => {
                      const val = e.target.value;
                      const customInput = document.getElementById('new-group-custom-name');
                      if (val === 'CUSTOM') {
                        customInput.style.display = 'block';
                      } else {
                        customInput.style.display = 'none';
                        customInput.value = '';
                      }
                    }}
                  >
                    <option value="">Selecciona categoría existente...</option>
                    {(lookupLists['modifier-groups'] || []).map(g => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                    <option value="CUSTOM">+ Crear nueva categoría...</option>
                  </select>
                  <input
                    type="text"
                    id="new-group-custom-name"
                    placeholder="Nombre (ej: Salsas, Extras)"
                    className="input"
                    style={{ display: 'none', padding: '6px 10px', fontSize: 11 }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const selectEl = document.getElementById('select-existing-group');
                    const customInput = document.getElementById('new-group-custom-name');
                    let groupName = '';
                    if (selectEl.value === 'CUSTOM') {
                      groupName = customInput.value.trim();
                    } else {
                      groupName = selectEl.value;
                    }

                    if (!groupName) return;

                    const currentMods = form.modifiers || [];
                    if (currentMods.find(m => m.name.toLowerCase() === groupName.toLowerCase())) {
                      alert('Este grupo de modificadores ya está agregado.');
                      return;
                    }

                    const nextMods = [...currentMods, { name: groupName, options: [] }];
                    setForm({ ...form, modifiers: nextMods });

                    selectEl.value = '';
                    customInput.value = '';
                    customInput.style.display = 'none';
                  }}
                  className="btn-gold"
                  style={{ padding: '8px 14px', fontSize: 12, height: 'fit-content' }}
                >
                  Agregar
                </button>
              </div>
            </div>
          )}
        </div>

        {err && (
          <div style={{ background: '#FFEBEE', color: '#C62828', padding: 10, borderRadius: 8, fontSize: 12, marginTop: 10 }}>
            {err}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexShrink: 0 }}>
          <Button onClick={onClose} variant="ghost" style={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving} loading={saving} variant="gold" style={{ flex: 1 }}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
