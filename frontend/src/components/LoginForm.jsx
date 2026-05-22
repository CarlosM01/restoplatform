import { useState } from 'react';
import { login, register, setAuth } from '../lib/api.js';

const G = '#C4A97D', D = '#1B1916', M = '#A89B8C';

export default function LoginForm() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '', rut: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await login(form.email, form.password);
        // Redirigir según rol
        const dest = data.role === 'admin' ? '/admin' : data.role === 'manager' ? '/manager' : '/';
        window.location.href = dest;
      } else {
        await register({
          email: form.email,
          password: form.password,
          name: form.name,
          rut: form.rut,
        });
        const data = await login(form.email, form.password);
        window.location.href = '/';
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="app-header">
        <div>
          <div className="brand">RestoPlatform</div>
          <div className="name">La Leña Restaurante</div>
        </div>
        <a href="/" style={{ color: G, fontSize: 12 }}>← Volver</a>
      </div>

      <div style={{ flex: 1, padding: 24 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
          {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
        </div>
        <div style={{ fontSize: 12, color: M, marginBottom: 24 }}>
          {mode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'}
          {' '}
          <button onClick={() => setMode(mode === 'login' ? 'registro' : 'login')} style={{ background: 'none', border: 'none', color: G, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'registro' && (
            <>
              <div>
                <label className="label">Nombre completo</label>
                <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div>
                <label className="label">RUT</label>
                <input className="input" placeholder="12345678-9" value={form.rut} onChange={e => setForm({...form, rut: e.target.value})} required />
              </div>
            </>
          )}
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input type="password" className="input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
          </div>

          {error && (
            <div style={{ background: '#FFEBEE', color: '#C62828', padding: 10, borderRadius: 8, fontSize: 12 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-gold" disabled={loading} style={{ padding: 14, fontWeight: 700 }}>
            {loading ? 'Procesando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>

        {mode === 'login' && (
          <div style={{ marginTop: 30, padding: 14, background: '#FFF8F0', borderRadius: 10, fontSize: 11, color: M, lineHeight: 1.7 }}>
            <strong style={{ color: D }}>Usuarios de prueba:</strong><br />
            Admin: admin@lalena.cl / admin123<br />
            Encargado: manager@lalena.cl / encargado123<br />
            Cliente: customer@test.cl / cliente123
          </div>
        )}
      </div>
    </div>
  );
}
