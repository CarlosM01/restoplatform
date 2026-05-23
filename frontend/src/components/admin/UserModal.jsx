import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';

export default function UserModal({ editTarget, apis, onClose, onSaved }) {
  const isEdit = !!editTarget;
  const [form, setForm] = useState({
    name: editTarget?.name || '',
    email: editTarget?.email || '',
    rut: editTarget?.rut || '',
    password: '',
    role: editTarget?.role || 'customer',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      if (isEdit) {
        await apis.users.update(editTarget.id, {
          name: form.name,
          email: form.email,
          role: form.role,
        });
      } else {
        await apis.users.create({
          name: form.name,
          email: form.email,
          rut: form.rut,
          password: form.password,
          role: form.role,
        });
      }
      onSaved();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const roleOptions = [
    { value: 'customer', label: 'Cliente' },
    { value: 'manager', label: 'Encargado' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? 'Editar usuario' : 'Nuevo usuario'}
      width={420}
    >
      <form onSubmit={submit} className="admin-form-group">
        <Input
          label="Nombre"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          type="email"
          label="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />

        {!isEdit && (
          <>
            <Input
              label="RUT"
              value={form.rut}
              onChange={e => setForm({ ...form, rut: e.target.value })}
              required
            />
            <Input
              type="password"
              label="Contraseña"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </>
        )}

        <Select
          label="Rol"
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
          options={roleOptions}
          required
        />

        {err && (
          <div style={{ background: '#FFEBEE', color: '#C62828', padding: 10, borderRadius: 8, fontSize: 12, marginTop: 10 }}>
            {err}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
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
