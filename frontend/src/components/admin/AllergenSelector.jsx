import React from 'react';

const DEFAULT_ALLERGEN_MAP = {
  'huevo': { icon: '🥚', label: 'EGGS' },
  'gluten': { icon: '🌾', label: 'GLUTEN' },
  'lácteos': { icon: '🥛', label: 'DAIRY' },
  'pescado': { icon: '🐟', label: 'FISH' },
  'maní': { icon: '🥜', label: 'PEANUT' },
  'lupino': { icon: '🌱', label: 'LUPIN' },
  'moluscos': { icon: '🐚', label: 'MOLLUSK' },
  'mostaza': { icon: '🍯', label: 'MUSTARD' }
};

export default function AllergenSelector({ selectedAllergens, onAllergensChange, dbAllergens = [] }) {
  const D = 'var(--color-dark)';
  const M = 'var(--color-muted)';

  const getDynamicAllergenInfo = (dbAllergen) => {
    const key = dbAllergen.name.toLowerCase();
    const defaults = DEFAULT_ALLERGEN_MAP[key] || { icon: '⚠️', label: dbAllergen.name.toUpperCase() };
    return {
      name: dbAllergen.name,
      icon: dbAllergen.icon_url || defaults.icon,
      label: dbAllergen.internal_ref_url || defaults.label,
      severity: dbAllergen.severity || 'Alta'
    };
  };

  const handleToggleAllergen = (info) => {
    const exists = selectedAllergens.find(a => a.name.toLowerCase() === info.name.toLowerCase());
    if (exists) {
      onAllergensChange(selectedAllergens.filter(a => a.name.toLowerCase() !== info.name.toLowerCase()));
    } else {
      onAllergensChange([
        ...selectedAllergens,
        {
          name: info.name,
          severity: info.severity,
          icon: info.icon,
          label: info.label
        }
      ]);
    }
  };

  const handleSeverityChange = (name, severity) => {
    const next = selectedAllergens.map(a =>
      a.name.toLowerCase() === name.toLowerCase()
        ? { ...a, severity }
        : a
    );
    onAllergensChange(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label className="label" style={{ fontWeight: '700', fontSize: 12.5, color: D }}>
        Alérgenos del Alimento
      </label>
      <p style={{ fontSize: 11, color: M, margin: '0 0 6px 0' }}>
        Selecciona los alérgenos que contiene este plato para guiar a los clientes intolerantes.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {dbAllergens.map(dbAll => {
          const info = getDynamicAllergenInfo(dbAll);
          const activeAllergen = selectedAllergens.find(a => a.name.toLowerCase() === info.name.toLowerCase());
          const isChecked = !!activeAllergen;

          return (
            <div
              key={dbAll.id || info.name}
              onClick={() => handleToggleAllergen(info)}
              style={{
                border: `1px solid ${isChecked ? '#FFB74D' : '#E0E0E0'}`,
                borderRadius: 8,
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: isChecked ? '#FFF8E1' : '#FFF',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: 15 }}>{info.icon}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 11, fontWeight: '700', color: D }}>{info.name}</span>
                {isChecked && (
                  <select
                    onClick={e => e.stopPropagation()}
                    value={activeAllergen.severity || 'Alta'}
                    onChange={e => handleSeverityChange(info.name, e.target.value)}
                    style={{
                      padding: '1px 4px',
                      fontSize: 9,
                      border: 'none',
                      background: 'transparent',
                      color: '#E65100',
                      fontWeight: '700',
                      outline: 'none'
                    }}
                  >
                    <option value="Alta">Alta</option>
                    <option value="Moderada">Mod.</option>
                    <option value="Leve">Leve</option>
                  </select>
                )}
              </div>
            </div>
          );
        })}
        {dbAllergens.length === 0 && (
          <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: 10, fontSize: 12, color: M, background: '#FAF9F6', borderRadius: 8, border: '1px dashed #E0E0E0' }}>
            No hay alérgenos definidos en la base de datos.
          </div>
        )}
      </div>
    </div>
  );
}
