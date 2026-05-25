import React, { useState } from 'react';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';
import Checkbox from '../common/Checkbox.jsx';
import Textarea from '../common/Textarea.jsx';
import { FIELD_CONFIGS } from './FieldConfigs.js';

export default function ClassicEntityForm({ entityName, editEntity, lookupLists, apis, onClose, onSaved }) {
  const isEdit = !!editEntity;
  const configs = FIELD_CONFIGS[entityName] || [];

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
    return init;
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setErr(null);

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
