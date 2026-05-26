import React from 'react';
import useLoginForm from '../../hooks/useLoginForm.js';
import Header from '../common/Header.jsx';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import './LoginForm.css';

export default function LoginForm() {
  const {
    mode,
    setMode,
    form,
    setFormField,
    error,
    loading,
    submit,
  } = useLoginForm();

  const brandGold = 'var(--color-gold)';

  const backLink = (
    <a href="/" style={{ color: brandGold, fontSize: 12 }}>← Volver</a>
  );

  return (
    <div className="app-shell">
      <Header
        title="RestoApp"
        subtitle="Restaurante Demo"
        actions={backLink}
      />

      <div className="login-container">
        <div className="login-title">
          {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
        </div>
        <div className="login-subtitle">
          {mode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'}
          {' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'registro' : 'login')}
            className="login-toggle-btn"
          >
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </div>

        <form onSubmit={submit} className="login-form">
          {mode === 'registro' && (
            <>
              <Input
                label="Nombre completo"
                value={form.name}
                onChange={e => setFormField('name', e.target.value)}
                required
              />
              <Input
                label="RUT"
                placeholder="12345678-9"
                value={form.rut}
                onChange={e => setFormField('rut', e.target.value)}
                required
              />
            </>
          )}

          <Input
            type="email"
            label="Email"
            value={form.email}
            onChange={e => setFormField('email', e.target.value)}
            required
          />

          <Input
            type="password"
            label="Contraseña"
            value={form.password}
            onChange={e => setFormField('password', e.target.value)}
            required
            minLength={6}
          />

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="gold"
            disabled={loading}
            loading={loading}
            className="login-submit-btn btn-gold"
          >
            {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </Button>
        </form>

      </div>
    </div>
  );
}
