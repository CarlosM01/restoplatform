import React, { useState } from 'react';
import Input from '../common/Input.jsx';
import { COLORS } from '../../lib/utils.js';

/**
 * Reusable sub-component for a named list of items with name + price fields.
 * Eliminates the near-identical Sizes and Extras sections.
 */
function VariationList({ title, description, items, onAdd, onRemove, nameLabel, namePlaceholder, priceLabel, pricePlaceholder, priceFormatter }) {
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const { G, D, M, B } = COLORS;

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim(), Number(newPrice) || 0);
    setNewName('');
    setNewPrice('');
  };

  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: '700', color: D, margin: '0 0 4px 0' }}>
        {title}
      </h3>
      <p style={{ fontSize: 11, color: M, margin: '0 0 10px 0' }}>
        {description}
      </p>

      {/* Existing items list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAF9F6', border: `1px solid ${B}`, borderRadius: 8, padding: '6px 12px' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: '700', color: D }}>{item.name}</span>
              <span style={{ fontSize: 11, color: G, fontWeight: '600' }}>
                {priceFormatter(item)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onRemove(idx)}
              style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: 11, fontWeight: '600' }}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {/* Add new item form */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'end', background: '#FFFDF9', border: `1px dashed ${G}`, borderRadius: 10, padding: 12 }}>
        <div style={{ flex: 2 }}>
          <Input
            label={nameLabel}
            placeholder={namePlaceholder}
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Input
            type="number"
            label={priceLabel}
            placeholder={pricePlaceholder}
            value={newPrice}
            onChange={e => setNewPrice(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="btn-gold"
          style={{ padding: '8px 14px', fontSize: 12, borderRadius: 8, height: 35 }}
        >
          + Añadir
        </button>
      </div>
    </div>
  );
}

export default function VariationSelector({ sizes = [], extras = [], onSizesChange, onExtrasChange }) {
  const { B } = COLORS;

  const handleAddSize = (name, priceDelta) => {
    onSizesChange([...sizes, { name, price_delta: priceDelta }]);
  };

  const handleRemoveSize = (idx) => {
    onSizesChange(sizes.filter((_, i) => i !== idx));
  };

  const handleAddExtra = (name, price) => {
    onExtrasChange([...extras, { name, price }]);
  };

  const handleRemoveExtra = (idx) => {
    onExtrasChange(extras.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <VariationList
        title="🍕 Variantes de Tamaño (Opcional)"
        description="Crea variaciones y sus diferencias de precio respecto al precio base."
        items={sizes}
        onAdd={handleAddSize}
        onRemove={handleRemoveSize}
        nameLabel="Nombre Tamaño"
        namePlaceholder="Ej: Familiar, Doble filete"
        priceLabel="+$ Delta Precio"
        pricePlaceholder="Ej: 3000"
        priceFormatter={(s) => s.price_delta === 0 ? 'Precio base' : `+$${s.price_delta.toLocaleString()}`}
      />

      <div style={{ borderTop: `1px solid ${B}`, paddingTop: 14 }}>
        <VariationList
          title="🍟 Extras / Adiciones Opcionales"
          description="Permite a los usuarios añadir extras a su plato con costos asociados."
          items={extras}
          onAdd={handleAddExtra}
          onRemove={handleRemoveExtra}
          nameLabel="Nombre Extra"
          namePlaceholder="Ej: Huevo Frito, Queso Extra"
          priceLabel="Precio Extra ($)"
          pricePlaceholder="Ej: 800"
          priceFormatter={(e) => `+$${e.price.toLocaleString()}`}
        />
      </div>
    </div>
  );
}
