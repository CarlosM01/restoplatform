import React, { useState } from 'react';
import Input from '../common/Input.jsx';

export default function CategorySelector({ selectedCategory, onCategorySelect, categories = [], apis, saving, setSaving }) {
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatImg, setNewCatImg] = useState('');

  const G = 'var(--color-gold)';
  const D = 'var(--color-dark)';
  const M = 'var(--color-muted)';
  const B = 'var(--color-border)';

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      setSaving(true);
      const newCat = await apis.categories.create({ 
        name: newCatName.trim(), 
        image_url: newCatImg.trim() || undefined 
      });
      if (newCat) {
        categories.push(newCat);
        onCategorySelect(newCat.name);
      }
      setNewCatName('');
      setNewCatImg('');
      setShowNewCatInput(false);
    } catch (e) {
      alert('Error al crear categoría: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const isUrl = (str) => typeof str === 'string' && (str.startsWith('http') || str.startsWith('/') || str.startsWith('data:'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h3 style={{ fontSize: 15, fontWeight: '700', color: D, margin: 0 }}>📦 Clasificación y Control de Stock</h3>
        <button
          type="button"
          onClick={() => setShowNewCatInput(!showNewCatInput)}
          style={{ background: 'none', border: 'none', color: G, fontWeight: '700', fontSize: 12, cursor: 'pointer' }}
        >
          {showNewCatInput ? '✕ Cancelar' : '+ Crear Nueva Categoría'}
        </button>
      </div>

      {/* Inline Category Creation Drawer */}
      {showNewCatInput && (
        <div style={{ background: '#FAF9F6', border: `1px dashed ${G}`, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: '700', color: D }}>Nueva Categoría de Menú</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr auto', gap: 10, alignItems: 'end' }}>
            <Input
              label="Nombre"
              placeholder="Ej: Postres"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
            />
            <Input
              label="Imagen URL"
              placeholder="Ej: https://unsplash..."
              value={newCatImg}
              onChange={e => setNewCatImg(e.target.value)}
            />
            <button
              type="button"
              disabled={saving}
              onClick={handleCreateCategory}
              className="btn-gold"
              style={{ padding: '8px 14px', fontSize: 12, height: 35, borderRadius: 8 }}
            >
              Crear
            </button>
          </div>
        </div>
      )}

      {/* Grid Selection for Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label className="label" style={{ fontWeight: '700', fontSize: 12.5, color: D }}>
          Selecciona una Categoría *
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxHeight: 180, overflowY: 'auto', padding: 2 }}>
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.name;
            return (
              <div
                key={cat.id}
                onClick={() => onCategorySelect(cat.name)}
                style={{
                  border: `1.5px solid ${isSelected ? G : '#E0E0E0'}`,
                  borderRadius: 10,
                  padding: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: isSelected ? '#FFFDF0' : '#FFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 10px rgba(212,175,55,0.15)' : 'none'
                }}
              >
                <div style={{ width: 30, height: 30, borderRadius: 6, background: '#FAF9F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, overflow: 'hidden' }}>
                  {isUrl(cat.image) ? (
                    <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    '🍽️'
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: isSelected ? '700' : '600', color: D }}>
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
