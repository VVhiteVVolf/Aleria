import { getCombatStyleRegistry } from '../combat-styles/combat-style-registry.js';
import { listCombatTechniqueCatalog } from '../combat-styles/combat-technique-catalog.js';
import { getSirenentanzForms } from '../combat-styles/sirenentanz/sirenentanz-forms.js';

// Global style grants intentionally contain only selected curricula. The archive
// also exposes the other confirmed purchase catalogues without granting them.
export function getArchiveCombatStyles() {
  const styles = getCombatStyleRegistry().styles;
  const confirmed = listCombatTechniqueCatalog().filter(technique => technique.status === 'confirmed');
  return styles.map(style => {
    const forms = new Map(style.forms.map(form => [form.id, form]));
    if (style.id === 'sirenentanz') for (const form of getSirenentanzForms()) {
      if (!forms.has(form.id)) forms.set(form.id, form);
    }
    return { ...style, forms: [...forms.values()].map(form => ({ ...form,
      techniques: [...new Map([...(form.techniques || []), ...confirmed.filter(technique => technique.combatStyleId === style.id
        && technique.combatStyleFormId === form.id)].map(technique => [technique.id, technique])).values()]
    })) };
  });
}
