import React, { useState } from 'react';
import { COLORS } from '../../lib/utils.js';

export default function IngredientSelector({ selectedIngredients = [], onIngredientsChange, lookupIngredients = [] }) {
  const [ingSearch, setIngSearch] = useState('');
  const [showIngSuggestions, setShowIngSuggestions] = useState(false);

  const { G, D, M, B } = COLORS;

  const handleAddIngredient = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (selectedIngredients.includes(trimmed)) {
      setIngSearch('');
      setShowIngSuggestions(false);
      return;
    }
    onIngredientsChange([...selectedIngredients, trimmed]);
    setIngSearch('');
    setShowIngSuggestions(false);
  };

  const handleRemoveIngredient = (idx) => {
    const list = [...selectedIngredients];
    list.splice(idx, 1);
    onIngredientsChange(list);
  };

  const suggestedIngredients = lookupIngredients
    .filter(i => i.name.toLowerCase().includes(ingSearch.toLowerCase()))
    .filter(i => !selectedIngredients.includes(i.name));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
      <label className="label" style={{ fontWeight: '700', fontSize: 12.5, color: D }}>
        Ingredientes Compuestos
      </label>
      <p style={{ fontSize: 11, color: M, margin: '0 0 6px 0' }}>
        Busca y selecciona ingredientes oficiales o agrega uno personalizado pulsando Enter.
      </p>
      
      {/* Visual Ingredient Pill List */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 12px', background: '#FFF', border: `1px solid ${B}`, borderRadius: 10, minHeight: 40 }}>
        {selectedIngredients.length === 0 ? (
          <span style={{ fontSize: 12, color: M }}>No hay ingredientes asignados...</span>
        ) : (
          selectedIngredients.map((ing, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#FAF9F6',
                border: `1px solid ${G}`,
                borderRadius: 20,
                padding: '3px 10px',
                fontSize: 11.5,
                fontWeight: '600',
                color: D
              }}
            >
              <span>{ing}</span>
              <button
                type="button"
                onClick={() => handleRemoveIngredient(idx)}
                style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', padding: 0, fontSize: 11, fontWeight: '700' }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Search & Add field */}
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <input
          type="text"
          placeholder="Escribir o buscar ingredientes..."
          className="input"
          value={ingSearch}
          onChange={e => {
            setIngSearch(e.target.value);
            setShowIngSuggestions(true);
          }}
          onFocus={() => setShowIngSuggestions(true)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddIngredient(ingSearch);
            }
          }}
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 12.5 }}
        />
        <button
          type="button"
          onClick={() => handleAddIngredient(ingSearch)}
          className="btn-gold"
          style={{ padding: '8px 16px', fontSize: 12, borderRadius: 8 }}
        >
          + Agregar
        </button>
      </div>

      {/* Suggestion Dropdown panel */}
      {showIngSuggestions && ingSearch.trim() && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#FFF',
          border: `1px solid ${B}`,
          borderRadius: 8,
          boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
          zIndex: 10,
          maxHeight: 150,
          overflowY: 'auto',
          marginTop: 4
        }}>
          {suggestedIngredients.map(ing => (
            <div
              key={ing.id}
              onClick={() => handleAddIngredient(ing.name)}
              style={{
                padding: '8px 12px',
                fontSize: 12,
                cursor: 'pointer',
                borderBottom: '1px solid #F5F5F5',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>{ing.name}</span>
              <span style={{ fontSize: 9.5, color: M }}>De base de datos</span>
            </div>
          ))}
          {suggestedIngredients.length === 0 && (
            <div
              onClick={() => handleAddIngredient(ingSearch)}
              style={{ padding: '8px 12px', fontSize: 12, cursor: 'pointer', color: G, fontWeight: '700' }}
            >
              + Agregar ingrediente personalizado: "{ingSearch}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
