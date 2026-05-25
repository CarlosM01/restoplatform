import React from 'react';
import Modal from '../common/Modal.jsx';
import ProductWizard from './ProductWizard.jsx';
import ClassicEntityForm from './ClassicEntityForm.jsx';

export default function EntityModal({ entityName, editEntity, lookupLists, apis, onClose, onSaved }) {
  const isEdit = !!editEntity;

  if (entityName === 'items') {
    return (
      <Modal
        onClose={onClose}
        title={isEdit ? `Editar Plato` : `Crear Nuevo Plato`}
        width={980}
        cardStyle={{ maxHeight: '92vh', padding: 0, overflow: 'hidden' }}
      >
        <ProductWizard
          editEntity={editEntity}
          lookupLists={lookupLists}
          apis={apis}
          onClose={onClose}
          onSaved={onSaved}
        />
      </Modal>
    );
  }

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? `Editar ${entityName.replace('-', ' ')}` : `Nueva ${entityName.replace('-', ' ')}`}
      width={480}
      cardStyle={{ maxHeight: '90vh' }}
    >
      <ClassicEntityForm
        entityName={entityName}
        editEntity={editEntity}
        lookupLists={lookupLists}
        apis={apis}
        onClose={onClose}
        onSaved={onSaved}
      />
    </Modal>
  );
}
