import React from 'react';

export default function ModifierGroupAccordion({ modifiers = [], onModifiersChange, modifierGroups = [], fmt }) {
  const G = 'var(--color-gold)';
  const D = 'var(--color-dark)';
  const M = 'var(--color-muted)';
  const B = 'var(--color-border)';

  const handleRemoveGroup = (groupIdx) => {
    const nextMods = [...modifiers];
    nextMods.splice(groupIdx, 1);
    onModifiersChange(nextMods);
  };

  const handleRemoveOption = (groupIdx, optIdx) => {
    const nextMods = JSON.parse(JSON.stringify(modifiers));
    nextMods[groupIdx].options.splice(optIdx, 1);
    onModifiersChange(nextMods);
  };

  const handleAddOption = (groupIdx) => {
    const nameInput = document.getElementById(`new-opt-name-${groupIdx}`);
    const priceInput = document.getElementById(`new-opt-price-${groupIdx}`);
    const optName = nameInput.value.trim();
    const optPrice = Number(priceInput.value) || 0;
    if (!optName) return;

    const nextMods = JSON.parse(JSON.stringify(modifiers));
    nextMods[groupIdx].options = nextMods[groupIdx].options || [];
    nextMods[groupIdx].options.push({ name: optName, price_delta: optPrice });
    onModifiersChange(nextMods);

    nameInput.value = '';
    priceInput.value = '';
  };

  const handleAddGroup = () => {
    const selectEl = document.getElementById('select-existing-group');
    const customInput = document.getElementById('new-group-custom-name');
    let groupName = '';
    if (selectEl.value === 'CUSTOM') {
      groupName = customInput.value.trim();
    } else {
      groupName = selectEl.value;
    }

    if (!groupName) return;

    if (modifiers.find(m => m.name.toLowerCase() === groupName.toLowerCase())) {
      alert('Este grupo de modificadores ya está agregado.');
      return;
    }

    const nextMods = [...modifiers, { name: groupName, options: [] }];
    onModifiersChange(nextMods);

    selectEl.value = '';
    customInput.value = '';
    customInput.style.display = 'none';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h3 style={{ fontSize: 15, fontWeight: '700', color: D, margin: 0 }}>
        🛠️ Grupos de Modificadores (Opciones de Preparación)
      </h3>
      <p style={{ fontSize: 11, color: M, margin: '0 0 6px 0' }}>
        Configura listas de selección múltiple o única (Ej: Término de la carne, Salsas, etc.).
      </p>

      {modifiers.map((group, groupIdx) => (
        <div key={groupIdx} style={{ background: '#FAF9F6', border: `1px solid ${B}`, borderRadius: 10, padding: 12, position: 'relative' }}>
          <button
            type="button"
            onClick={() => handleRemoveGroup(groupIdx)}
            style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: 13, fontWeight: '700' }}
          >
            ✕
          </button>

          <div style={{ fontWeight: '700', fontSize: 12.5, color: D, marginBottom: 8 }}>
            Grupo: {group.name}
          </div>

          {/* Display added options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8 }}>
            {(group.options || []).map((opt, optIdx) => (
              <div key={optIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF', border: `1px solid ${B}`, borderRadius: 6, padding: '4px 8px' }}>
                <span style={{ fontSize: 11, color: D }}>{opt.name}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: '600', color: G }}>+{fmt(opt.price_delta)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(groupIdx, optIdx)}
                    style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: 10 }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Option inside this Group Form */}
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              placeholder="Opción (ej: Salsa Picante)"
              id={`new-opt-name-${groupIdx}`}
              className="input"
              style={{ flex: 2, padding: '4px 8px', fontSize: 11 }}
            />
            <input
              type="number"
              placeholder="+$ Delta"
              id={`new-opt-price-${groupIdx}`}
              className="input"
              style={{ flex: 1, padding: '4px 8px', fontSize: 11 }}
            />
            <button
              type="button"
              onClick={() => handleAddOption(groupIdx)}
              className="btn-gold"
              style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6 }}
            >
              + Opción
            </button>
          </div>
        </div>
      ))}

      {/* Add Group Form */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#FFFDF9', border: `1px dashed ${G}`, borderRadius: 10, padding: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: '600', color: D, marginBottom: 4 }}>
            Vincular o Crear Categoría de Modificador
          </div>
          <select
            id="select-existing-group"
            className="input"
            style={{ padding: '6px 10px', fontSize: 11, marginBottom: 4 }}
            onChange={(e) => {
              const val = e.target.value;
              const customInput = document.getElementById('new-group-custom-name');
              if (val === 'CUSTOM') {
                customInput.style.display = 'block';
              } else {
                customInput.style.display = 'none';
                customInput.value = '';
              }
            }}
          >
            <option value="">Selecciona categoría existente...</option>
            {modifierGroups.map(g => (
              <option key={g.id} value={g.name}>{g.name}</option>
            ))}
            <option value="CUSTOM">+ Crear nueva categoría...</option>
          </select>
          <input
            type="text"
            id="new-group-custom-name"
            placeholder="Nombre (ej: Salsas, Extras)"
            className="input"
            style={{ display: 'none', padding: '6px 10px', fontSize: 11 }}
          />
        </div>
        <button
          type="button"
          onClick={handleAddGroup}
          className="btn-gold"
          style={{ padding: '8px 14px', fontSize: 12, height: 'fit-content' }}
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
