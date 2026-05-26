import React, { useState } from 'react';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import Checkbox from '../common/Checkbox.jsx';
import Textarea from '../common/Textarea.jsx';
import CategorySelector from './CategorySelector.jsx';
import IngredientSelector from './IngredientSelector.jsx';
import AllergenSelector from './AllergenSelector.jsx';
import VariationSelector from './VariationSelector.jsx';
import ModifierGroupAccordion from './ModifierGroupAccordion.jsx';
import ProductPreviewCard from './ProductPreviewCard.jsx';
import ImageGalleryEditor from './ImageGalleryEditor.jsx';
import { FIELD_CONFIGS } from './FieldConfigs.js';
import { fmt } from '../../lib/api.js';

export default function ProductWizard({ editEntity, lookupLists, apis, onClose, onSaved }) {
  const isEdit = !!editEntity;
  const configs = FIELD_CONFIGS['items'] || [];

  const G = 'var(--color-gold)';
  const D = 'var(--color-dark)';
  const M = 'var(--color-muted)';
  const B = 'var(--color-border)';

  // Initialize form state
  const [form, setForm] = useState(() => {
    const init = {};
    configs.forEach(field => {
      if (isEdit) {
        init[field.name] = editEntity[field.name] !== null && editEntity[field.name] !== undefined
          ? editEntity[field.name]
          : (field.type === 'checkbox' ? false : '');
      } else {
        init[field.name] = field.default !== undefined
          ? field.default
          : (field.type === 'checkbox' ? false : '');
      }
    });
    init.modifiers = editEntity?.modifiers || [];
    init.ingredients = editEntity?.ingredients || [];
    init.stock_inicial = editEntity?.inventory?.stock !== undefined ? editEntity.inventory.stock : 0;
    init.minimum_stock = editEntity?.inventory?.minimum_stock !== undefined ? editEntity.inventory.minimum_stock : 5;
    init.allergens = editEntity?.allergens ? editEntity.allergens.map(a => ({ name: a.name, severity: a.severity, icon: a.icon, label: a.label })) : [];
    init.sizes = editEntity?.sizes ? editEntity.sizes.map(s => ({ name: s.name, price_delta: s.price_delta })) : [];
    init.extras = editEntity?.extras ? editEntity.extras.map(e => ({ name: e.name, price: e.price })) : [];
    // Gallery: initialize from existing gallery data or seed with primary image
    if (editEntity?.gallery && editEntity.gallery.length > 0) {
      init.gallery = editEntity.gallery.map((g, i) => ({ url: g.url, alt_text: g.alt_text || '', sort_order: i }));
    } else if (editEntity?.image) {
      init.gallery = [{ url: editEntity.image, alt_text: '', sort_order: 0 }];
    } else {
      init.gallery = [];
    }
    return init;
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  // Wizard step state
  const [activeStep, setActiveStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);

  const handleNext = () => {
    setErr(null);
    if (activeStep === 0) {
      if (!form.name || !form.price || Number(form.price) <= 0) {
        setErr('El nombre y el precio base son obligatorios.');
        return;
      }
    }
    if (activeStep === 1) {
      if (!form.category) {
        setErr('La categoría es obligatoria.');
        return;
      }
    }
    
    const next = activeStep + 1;
    setActiveStep(next);
    if (next > maxStepReached) {
      setMaxStepReached(next);
    }
  };

  const handleBack = () => {
    setErr(null);
    setActiveStep(prev => Math.max(0, prev - 1));
  };

  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setErr(null);

    // Custom validation for items category
    if (!form.category) {
      setErr('La categoría es obligatoria.');
      setSaving(false);
      return;
    }

    // Cast data cleanly to match Pydantic schemas
    const parsed = {};
    configs.forEach(field => {
      const val = form[field.name];
      if (field.type === 'number') {
        if (val === '' || val === null || val === undefined) {
          parsed[field.name] = (field.nullable || field.name.endsWith('_id') || field.name === 'price_override' || field.name === 'prep_time_minutes' || field.name === 'max_quantity') ? null : 0;
        } else {
          parsed[field.name] = Number(val);
        }
      } else if (field.type === 'checkbox') {
        parsed[field.name] = !!val;
      } else if (field.type === 'select') {
        parsed[field.name] = val === '' ? null : val;
      } else {
        parsed[field.name] = val === '' ? (field.nullable ? null : '') : val;
      }
    });

    parsed.modifiers = form.modifiers || [];
    parsed.ingredients = form.ingredients || [];
    parsed.stock_inicial = Number(form.stock_inicial) || 0;
    parsed.minimum_stock = Number(form.minimum_stock) || 5;
    parsed.allergens = form.allergens || [];
    parsed.sizes = form.sizes || [];
    parsed.extras = form.extras || [];
    // Sync primary image from first gallery item
    if (form.gallery && form.gallery.length > 0 && form.gallery[0].url) {
      parsed.image = form.gallery[0].url;
    }
    parsed.gallery = form.gallery || [];

    try {
      if (isEdit) {
        await apis.items.update(editEntity.id, parsed);
      } else {
        await apis.items.create(parsed);
      }
      onSaved();
    } catch (e) {
      setErr(e.message || 'Error en la petición');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { title: 'Información', icon: '📝' },
    { title: 'Categoría y Stock', icon: '📦' },
    { title: 'Salud', icon: '🌱' },
    { title: 'Variaciones', icon: '🍕' },
    { title: 'Modificadores', icon: '🛠️' }
  ];

  return (
    <div style={{ display: 'flex', height: '78vh', minHeight: 560 }}>
      {/* LEFT WIZARD CONTENT */}
      <div style={{ flex: '1.2', padding: '24px 30px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* Horizontal Stepper Progress Tracking */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${B}` }}>
          {steps.map((s, idx) => {
            const isCompleted = idx < activeStep;
            const isActive = idx === activeStep;
            const isClickable = idx <= maxStepReached;
            
            return (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  flex: 1, 
                  position: 'relative',
                  cursor: isClickable ? 'pointer' : 'not-allowed'
                }}
                onClick={() => isClickable && setActiveStep(idx)}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isActive ? G : (isCompleted ? '#E0F2F1' : '#F5F5F5'),
                  color: isActive ? '#FFF' : (isCompleted ? '#00796B' : M),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: 13,
                  border: isActive ? `2px solid ${G}` : '2px solid transparent',
                  transition: 'all 0.25s ease',
                  transform: isActive ? 'scale(1.15)' : 'none',
                  zIndex: 2
                }}>
                  {isCompleted ? '✓' : s.icon}
                </div>
                <span style={{ 
                  fontSize: 10, 
                  fontWeight: isActive || isCompleted ? '700' : '500', 
                  color: isActive ? D : M,
                  marginTop: 6,
                  textAlign: 'center',
                }}>
                  {s.title}
                </span>
                {idx < steps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    top: 16,
                    left: 'calc(50% + 16px)',
                    right: 'calc(-50% + 16px)',
                    height: 2,
                    background: isCompleted ? '#00796B' : '#E0E0E0',
                    zIndex: 1,
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ERROR NOTIFICATION PANEL */}
        {err && (
          <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: '#C62828', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {err}</span>
            <button type="button" onClick={() => setErr(null)} style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontWeight: '700' }}>✕</button>
          </div>
        )}

        {/* STEP CONTAINER BODY */}
        <div style={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* STEP 1: BASIC INFORMATION */}
          {activeStep === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: '700', color: D, margin: '0 0 6px 0' }}>📝 Información General del Plato</h3>
              
              <Input
                label="Nombre del Plato *"
                placeholder="Ej: Lomo Vetado a lo Pobre"
                value={form.name || ''}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Input
                  type="number"
                  label="Precio Base ($) *"
                  placeholder="Ej: 8990"
                  min={1}
                  value={form.price === null || form.price === undefined ? '' : form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  required
                />
                <Input
                  type="number"
                  label="Calificación / Rating (1-5)"
                  placeholder="Ej: 4.5"
                  min={1}
                  max={5}
                  step={0.1}
                  value={form.rating === null || form.rating === undefined ? '' : form.rating}
                  onChange={e => setForm({ ...form, rating: e.target.value })}
                />
              </div>

              <Textarea
                label="Descripción del Plato"
                placeholder="Describe los ingredientes, punto de cocción o acompañamientos principales..."
                rows={3}
                value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />

              <ImageGalleryEditor
                gallery={form.gallery || []}
                onChange={(newGallery) => {
                  const primaryUrl = newGallery.length > 0 ? newGallery[0].url : '';
                  setForm({ ...form, gallery: newGallery, image: primaryUrl });
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="label" style={{ fontWeight: '700', fontSize: 12.5, color: D }}>Etiqueta Destacada / Badge</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { label: '🔥 Popular', class: 'popular' },
                    { label: '👨‍🍳 Chef\'s choice', class: 'chef' },
                    { label: '🌱 Vegano', class: 'vegan' },
                    { label: 'Ninguno', class: '' }
                  ].map(badge => {
                    const isSel = form.tag_class === badge.class && (badge.class === '' ? !form.tag_label : form.tag_label === badge.label);
                    return (
                      <button
                        key={badge.label}
                        type="button"
                        onClick={() => setForm({ 
                          ...form, 
                          tag_class: badge.class, 
                          tag_label: badge.class === '' ? '' : badge.label 
                        })}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 20,
                          fontSize: 11.5,
                          fontWeight: '600',
                          border: `1px solid ${isSel ? G : '#E0E0E0'}`,
                          background: isSel ? '#FFFDF0' : '#FFF',
                          color: isSel ? G : D,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {badge.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CATEGORY & STOCK CONFIGURATION */}
          {activeStep === 1 && (
            <>
              <CategorySelector
                selectedCategory={form.category}
                onCategorySelect={cat => setForm({ ...form, category: cat })}
                categories={lookupLists.categories}
                apis={apis}
                saving={saving}
                setSaving={setSaving}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 10 }}>
                {!isEdit && (
                  <Input
                    type="number"
                    label="Stock Inicial Disponible"
                    placeholder="Ej: 20"
                    min={0}
                    value={form.stock_inicial === null || form.stock_inicial === undefined ? '' : form.stock_inicial}
                    onChange={e => setForm({ ...form, stock_inicial: e.target.value })}
                  />
                )}
                <Input
                  type="number"
                  label="Stock Mínimo (Alerta de Reposición)"
                  placeholder="Ej: 5"
                  min={0}
                  value={form.minimum_stock === null || form.minimum_stock === undefined ? '' : form.minimum_stock}
                  onChange={e => setForm({ ...form, minimum_stock: e.target.value })}
                />
              </div>
              <div style={{ background: '#FAF9F6', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${B}`, marginTop: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 13, fontWeight: '700', color: D }}>Disponibilidad Inmediata</span>
                  <span style={{ fontSize: 11, color: M }}>Si se desactiva, el plato no aparecerá en el menú del cliente.</span>
                </div>
                <Checkbox
                  id="wizard-is-active"
                  label="Activo"
                  checked={!!form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })}
                />
              </div>
            </>
          )}

          {/* STEP 3: INGREDIENTS & ALLERGENS (HEALTH & WELLNESS) */}
          {activeStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: '700', color: D, margin: 0 }}>🌱 Composición Dietética y Alérgenos</h3>
              <IngredientSelector
                selectedIngredients={form.ingredients}
                onIngredientsChange={list => setForm({ ...form, ingredients: list })}
                lookupIngredients={lookupLists.ingredients}
              />
              <AllergenSelector
                selectedAllergens={form.allergens}
                onAllergensChange={list => setForm({ ...form, allergens: list })}
                dbAllergens={lookupLists.allergens}
              />
            </div>
          )}

          {/* STEP 4: VARIATIONS & CUSTOMIZATIONS */}
          {activeStep === 3 && (
            <VariationSelector
              sizes={form.sizes}
              extras={form.extras}
              onSizesChange={list => setForm({ ...form, sizes: list })}
              onExtrasChange={list => setForm({ ...form, extras: list })}
            />
          )}

          {/* STEP 5: INTERACTIVE MODIFIERS ACCORDION */}
          {activeStep === 4 && (
            <ModifierGroupAccordion
              modifiers={form.modifiers}
              onModifiersChange={list => setForm({ ...form, modifiers: list })}
              modifierGroups={lookupLists['modifier-groups']}
              fmt={fmt}
            />
          )}

        </div>

        {/* STEPPING CONTROLS - FOOTER */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24, borderTop: `1px solid ${B}`, paddingTop: 18, flexShrink: 0 }}>
          <Button onClick={onClose} variant="ghost" style={{ flex: 1 }}>
            Cancelar
          </Button>
          {activeStep > 0 && (
            <Button onClick={handleBack} variant="ghost" style={{ flex: 1 }}>
              Atrás
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button onClick={handleNext} variant="gold" style={{ flex: 1 }}>
              Siguiente
            </Button>
          ) : (
            <Button onClick={submit} disabled={saving} loading={saving} variant="gold" style={{ flex: 1 }}>
              Guardar Plato
            </Button>
          )}
        </div>

      </div>

      {/* RIGHT SIDEBAR: LIVE PRODUCT PREVIEW CUSTOMER CARD */}
      <ProductPreviewCard form={form} fmt={fmt} />
    </div>
  );
}
