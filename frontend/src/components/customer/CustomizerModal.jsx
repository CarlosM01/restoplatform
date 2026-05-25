import React from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';

const isUrl = (str) => typeof str === 'string' && (str.startsWith('http') || str.startsWith('/') || str.startsWith('data:'));

export default function CustomizerModal({ customizingItem, selectedOptions, toggleOption, customTotal, handleAddCustomized, onClose, fmt }) {
  if (!customizingItem) return null;

  const BG = 'var(--color-bg-2)';
  const M = 'var(--color-muted)';

  return (
    <Modal
      onClose={onClose}
      width={440}
      cardStyle={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)', maxHeight: '85vh' }}
    >
      {/* Modal Header */}
      <div className="customizer-header-row">
        <div className="customizer-image">
          {isUrl(customizingItem.image) ? (
            <img src={customizingItem.image} alt={customizingItem.name} />
          ) : (
            customizingItem.image || '🍽️'
          )}
        </div>
        <div>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 700, margin: '0 0 2px 0' }}>
            {customizingItem.name}
          </h3>
          <div style={{ fontSize: 11, color: M }}>{customizingItem.description}</div>
        </div>
      </div>

      {/* Modal Content - Modifier Groups */}
      <div className="customizer-body">
        {(customizingItem.modifiers || []).map((group, groupIdx) => (
          <div key={groupIdx} className="customizer-group-section">
            <div className="customizer-group-title">
              {group.name}
            </div>
            <div className="customizer-options-list">
              {(group.options || []).map((opt, optIdx) => {
                const groupSelection = selectedOptions[group.name] || [];
                const isSelected = !!groupSelection.find(o => o.name === opt.name);

                return (
                  <div
                    key={optIdx}
                    onClick={() => toggleOption(group.name, opt)}
                    className={`customizer-option-item ${isSelected ? 'selected' : 'unselected'}`}
                  >
                    <div className="customizer-option-info">
                      <div className={`customizer-option-check ${isSelected ? 'selected' : 'unselected'}`}>
                        {isSelected ? '✓' : ''}
                      </div>
                      <span className={`customizer-option-label ${isSelected ? 'selected' : 'unselected'}`}>
                        {opt.name}
                      </span>
                    </div>
                    <span className={`customizer-option-price ${isSelected ? 'selected' : 'unselected'}`}>
                      {opt.price_delta > 0 ? `+ ${fmt(opt.price_delta)}` : 'Gratis'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Footer with Pricing & Button */}
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: M }}>Precio unitario final</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-gold)' }}>{fmt(customTotal)}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            onClick={onClose}
            variant="ghost"
            style={{ flex: 1, padding: 12 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddCustomized}
            variant="gold"
            style={{ flex: 2, padding: 12, fontWeight: 700 }}
          >
            Agregar al Carrito
          </Button>
        </div>
      </div>
    </Modal>
  );
}
