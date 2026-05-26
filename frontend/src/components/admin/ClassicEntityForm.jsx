import React, { useState } from 'react';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';
import Checkbox from '../common/Checkbox.jsx';
import Textarea from '../common/Textarea.jsx';
import { FIELD_CONFIGS } from './FieldConfigs.js';
import { initFormState, parseFormFields } from '../../lib/formHelpers.js';

export default function ClassicEntityForm({ entityName, editEntity, lookupLists, apis, onClose, onSaved }) {
  const isEdit = !!editEntity;
  const configs = FIELD_CONFIGS[entityName] || [];

  const [form, setForm] = useState(() => {
    const init = initFormState(configs, editEntity);
    configs.forEach(field => {
      if (field.type === 'color' && !init[field.name]) {
        init[field.name] = '#FF9F43';
      }
    });
    return init;
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setErr(null);

    // Cast data cleanly to match Pydantic schemas
    const parsed = parseFormFields(configs, form);

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

          if (field.type === 'color') {
            const presets = ['#2ECC71', '#FF9F43', '#1B1916', '#E74C3C', '#9B59B6', '#3498DB', '#F1C40F'];
            const currentColor = form[field.name] || '#FF9F43';
            return (
              <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--color-dark)' }}>{field.label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {presets.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm({ ...form, [field.name]: p })}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: p,
                          border: currentColor === p ? '2px solid var(--color-dark)' : '1px solid rgba(0,0,0,0.15)',
                          boxShadow: currentColor === p ? '0 0 0 2px #fff, 0 4px 8px rgba(0,0,0,0.15)' : 'none',
                          cursor: 'pointer',
                          transform: currentColor === p ? 'scale(1.1)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>Personalizado:</span>
                    <input
                      type="color"
                      value={currentColor}
                      onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                      style={{
                        width: 34,
                        height: 34,
                        border: '1px solid rgba(0,0,0,0.15)',
                        borderRadius: 8,
                        padding: 0,
                        background: 'none',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>
              </div>
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
  );
}
