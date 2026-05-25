import React, { useState } from 'react';
import Input from '../common/Input.jsx';

export default function VariationSelector({ sizes = [], extras = [], onSizesChange, onExtrasChange }) {
  const [newSizeName, setNewSizeName] = useState('');
  const [newSizeDelta, setNewSizeDelta] = useState('');

  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraPrice, setNewExtraPrice] = useState('');

  const G = 'var(--color-gold)';
  const D = 'var(--color-dark)';
  const M = 'var(--color-muted)';
  const B = 'var(--color-border)';

  const handleAddSize = () => {
    if (!newSizeName.trim()) return;
    const price_delta = Number(newSizeDelta) || 0.0;
    onSizesChange([...sizes, { name: newSizeName.trim(), price_delta }]);
    setNewSizeName('');
    setNewSizeDelta('');
  };

  const handleRemoveSize = (idx) => {
    const list = [...sizes];
    list.splice(idx, 1);
    onSizesChange(list);
  };

  const handleAddExtra = () => {
    if (!newExtraName.trim()) return;
    const price = Number(newExtraPrice) || 0.0;
    onExtrasChange([...extras, { name: newExtraName.trim(), price }]);
    setNewExtraName('');
    setNewExtraPrice('');
  };

  const handleRemoveExtra = (idx) => {
    const list = [...extras];
    list.splice(idx, 1);
    onExtrasChange(list);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* A. PRODUCT SIZE VARIATIONS */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: '700', color: D, margin: '0 0 4px 0' }}>
          🍕 Variantes de Tamaño (Opcional)
        </h3>
        <p style={{ fontSize: 11, color: M, margin: '0 0 10px 0' }}>
          Crea variaciones y sus diferencias de precio respecto al precio base.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          {sizes.map((s, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAF9F6', border: `1px solid ${B}`, borderRadius: 8, padding: '6px 12px' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: '700', color: D }}>{s.name}</span>
                <span style={{ fontSize: 11, color: G, fontWeight: '600' }}>
                  {s.price_delta === 0 ? 'Precio base' : `+$${s.price_delta.toLocaleString()}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSize(idx)}
                style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: 11, fontWeight: '600' }}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'end', background: '#FFFDF9', border: `1px dashed ${G}`, borderRadius: 10, padding: 12 }}>
          <div style={{ flex: 2 }}>
            <Input
              label="Nombre Tamaño"
              placeholder="Ej: Familiar, Doble filete"
              value={newSizeName}
              onChange={e => setNewSizeName(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Input
              type="number"
              label="+$ Delta Precio"
              placeholder="Ej: 3000"
              value={newSizeDelta}
              onChange={e => setNewSizeDelta(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleAddSize}
            className="btn-gold"
            style={{ padding: '8px 14px', fontSize: 12, borderRadius: 8, height: 35 }}
          >
            + Añadir
          </button>
        </div>
      </div>

      {/* B. PRODUCT EXTRAS & ADDITIONS */}
      <div style={{ borderTop: `1px solid ${B}`, paddingTop: 14 }}>
        <h3 style={{ fontSize: 14, fontWeight: '700', color: D, margin: '0 0 4px 0' }}>
          🍟 Extras / Adiciones Opcionales
        </h3>
        <p style={{ fontSize: 11, color: M, margin: '0 0 10px 0' }}>
          Permite a los usuarios añadir extras a su plato con costos asociados.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          {extras.map((e, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAF9F6', border: `1px solid ${B}`, borderRadius: 8, padding: '6px 12px' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: '700', color: D }}>{e.name}</span>
                <span style={{ fontSize: 11, color: G, fontWeight: '600' }}>+${e.price.toLocaleString()}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveExtra(idx)}
                style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: 11, fontWeight: '600' }}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'end', background: '#FFFDF9', border: `1px dashed ${G}`, borderRadius: 10, padding: 12 }}>
          <div style={{ flex: 2 }}>
            <Input
              label="Nombre Extra"
              placeholder="Ej: Huevo Frito, Queso Extra"
              value={newExtraName}
              onChange={e => setNewExtraName(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Input
              type="number"
              label="Precio Extra ($)"
              placeholder="Ej: 800"
              value={newExtraPrice}
              onChange={e => setNewExtraPrice(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleAddExtra}
            className="btn-gold"
            style={{ padding: '8px 14px', fontSize: 12, borderRadius: 8, height: 35 }}
          >
            + Añadir
          </button>
        </div>
      </div>
    </div>
  );
}
