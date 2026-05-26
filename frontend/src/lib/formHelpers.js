/**
 * Shared form-initialization and field-parsing helpers.
 * Eliminates duplication between ProductWizard and ClassicEntityForm.
 */

/**
 * Build initial form state from a FIELD_CONFIGS array and an optional edit entity.
 *
 * @param {Array<{name: string, type: string, default?: any}>} configs
 * @param {object|null} editEntity - The entity being edited, or null for creation.
 * @returns {object} Initial form state keyed by field name.
 */
export function initFormState(configs, editEntity) {
  const isEdit = !!editEntity;
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

  return init;
}

/**
 * Cast/parse raw form values to match backend Pydantic schemas.
 *
 * @param {Array<{name: string, type: string, nullable?: boolean}>} configs
 * @param {object} form - Current form state.
 * @returns {object} Parsed values ready for the API.
 */
export function parseFormFields(configs, form) {
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

  return parsed;
}
