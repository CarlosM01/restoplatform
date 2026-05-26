import React from 'react';
import useCustomerMenu from '../../hooks/useCustomerMenu.js';
import Header from '../common/Header.jsx';
import Button from '../common/Button.jsx';
import MenuStep from './MenuStep.jsx';
import CartStep from './CartStep.jsx';
import PaymentStep from './PaymentStep.jsx';
import CustomizerModal from './CustomizerModal.jsx';
import ProductDetailDrawer from './ProductDetailDrawer.jsx';
import { fmt } from '../../lib/api.js';
import './CustomerMenu.css';

const STEPS = ['menu', 'cart', 'payment'];

export default function CustomerMenu() {
  const {
    user,
    step,
    setStep,
    products,
    cats,
    cat,
    setCat,
    cart,
    flash,
    customizingItem,
    setCustomizingItem,
    selectedOptions,
    activeDetailProduct,
    setActiveDetailProduct,
    loading,
    error,
    processing,
    items,
    total,
    cnt,
    customTotal,
    toggleOption,
    handleAddCustomized,
    handleAddDetailedProduct,
    add,
    upd,
    procesarCheckout,
    logout,
  } = useCustomerMenu();

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-muted)' }}>Cargando...</div>;
  if (error) return <div style={{ padding: 20, color: 'var(--color-danger)' }}>Error: {error}</div>;

  const stepIdx = STEPS.indexOf(step);
  const canNext = {
    menu: cnt > 0,
    cart: cnt > 0,
    payment: false,
  };

  const loginButton = !user && (
    <a
      href="/login"
      style={{
        background: 'var(--color-gold)',
        color: '#fff',
        padding: '6px 12px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      Ingresar
    </a>
  );

  return (
    <div className="app-shell">
      {/* Header */}
      <Header
        title="RestoApp"
        subtitle="Restaurante Demo"
        user={user}
        logoutAction={logout}
        actions={loginButton}
      />

      {/* Progress steps */}
      <div className="progress-bar-container">
        <div className="progress-steps">
          {['Menú', 'Carrito', 'Pago'].map((label, i) => (
            <div
              key={i}
              className={`progress-step-item ${i < 2 ? 'expanded' : ''}`}
            >
              <div className={`progress-step-circle ${stepIdx >= i ? 'active' : 'inactive'}`}>
                {i + 1}
              </div>
              <span className={`progress-step-label ${stepIdx === i ? 'active' : 'inactive'}`}>
                {label}
              </span>
              {i < 2 && (
                <div className={`progress-step-line ${stepIdx > i ? 'active' : 'inactive'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Steps area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {step === 'menu' && (
          <MenuStep
            cats={cats}
            cat={cat}
            setCat={setCat}
            items={items}
            products={products}
            cart={cart}
            flash={flash}
            add={add}
            upd={upd}
            fmt={fmt}
            setActiveDetailProduct={setActiveDetailProduct}
            cnt={cnt}
            total={total}
            setStep={setStep}
          />
        )}

        {step === 'cart' && (
          <CartStep
            cart={cart}
            upd={upd}
            total={total}
            fmt={fmt}
          />
        )}

        {step === 'payment' && (
          <PaymentStep
            user={user}
            total={total}
            processing={processing}
            error={error}
            procesarCheckout={procesarCheckout}
            fmt={fmt}
          />
        )}
      </div>

      {/* Bottom Nav Bar */}
      <div className="bottom-bar">
        {step !== 'menu' && (
          <Button
            onClick={() => setStep(STEPS[stepIdx - 1])}
            variant="ghost"
          >
            ← Volver
          </Button>
        )}
        {step !== 'payment' && (
          <Button
            onClick={() => canNext[step] && setStep(STEPS[stepIdx + 1])}
            disabled={!canNext[step]}
            variant="gold"
            style={{ flex: 1, padding: 12, fontWeight: 700 }}
          >
            {step === 'menu' && `Siguiente — ${cnt} ${cnt === 1 ? 'plato' : 'platos'} (${fmt(total)})`}
            {step === 'cart' && `Ir a pagar — ${fmt(total)}`}
          </Button>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '6px 0 10px', fontSize: 8, color: '#C4B8A8', letterSpacing: 1.5 }}>
        POWERED BY RESTOAPP · BETA v0.1
      </div>

      {/* Customizer Modal */}
      {customizingItem && (
        <CustomizerModal
          customizingItem={customizingItem}
          selectedOptions={selectedOptions}
          toggleOption={toggleOption}
          customTotal={customTotal}
          handleAddCustomized={handleAddCustomized}
          onClose={() => setCustomizingItem(null)}
          fmt={fmt}
        />
      )}

      {/* Product Detail Drawer */}
      {activeDetailProduct && (
        <ProductDetailDrawer
          product={activeDetailProduct}
          onClose={() => setActiveDetailProduct(null)}
          onAdd={handleAddDetailedProduct}
          fmt={fmt}
        />
      )}
    </div>
  );
}
