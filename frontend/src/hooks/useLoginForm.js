import { useState } from 'react';
import { login, register } from '../lib/api.js';

export default function useLoginForm() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '', rut: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const setFormField = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await login(form.email, form.password);
        const dest = data.role === 'admin' ? '/admin' : data.role === 'manager' ? '/manager' : '/';
        window.location.href = dest;
        return data;
      } else {
        await register({
          email: form.email,
          password: form.password,
          name: form.name,
          rut: form.rut,
        });
        const data = await login(form.email, form.password);
        window.location.href = '/';
        return data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    setMode,
    form,
    setFormField,
    error,
    setError,
    loading,
    submit,
  };
}
