import { DRACHENTANZ_FORM_NAMES } from './drachentanz/drachentanz-ids.js?v=20260909-dragon-parent-v2';
import { getSirenentanzForms } from './sirenentanz/sirenentanz-forms.js?v=20260909-dragon-parent-v2';
import { getHuskarlForms } from './huskarl/huskarl-forms.js';

// Small presentation index; never load or clone complete attack catalogues for a label.
const forms = new Map([
  ...Object.entries(DRACHENTANZ_FORM_NAMES).map(([id, name]) => [id, { styleId: 'drachentanz', label: `Drachentanz · ${name}` }]),
  ...getSirenentanzForms().map(form => [form.id, { styleId: 'sirenentanz', label: `Wyrmtanz · ${form.name}` }]),
  ...getHuskarlForms().map(form => [form.id, { styleId: 'huskarl-waffenlehre', label: `Huskarl-Waffenlehre · ${form.name}` }])
]);

export function getCombatFormPresentation(entry = {}) {
  const formId = String(entry.combatStyleFormId || '').trim();
  const styleId = String(entry.combatStyleId || '').trim();
  const known = forms.get(formId);
  const canonical = known && (!styleId || styleId === known.styleId) ? known : null;
  const label = canonical?.label || String(entry.trainingForm || entry.combatStyleFormName || '').trim();
  if (!formId && !label) return null;
  return {
    key: formId ? `form:${styleId || canonical?.styleId || ''}:${formId}` : `form-label:${label}`,
    label: label || 'Weitere Kampfform'
  };
}
