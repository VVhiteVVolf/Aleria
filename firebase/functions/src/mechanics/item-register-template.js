import { HttpsError } from 'firebase-functions/v2/https';
import { STANDARD_ITEMS } from '../generated/item-register/item-register-standard.js';
import { normalizeOffer } from '../generated/item-register/item-register-model.js';
import { resolveModuleProduct } from './item-register-module-source.js';
import { readItemDefinition } from '../items/item-definition-repository.js';
import { definitionTemplate } from '../generated/item-definitions/item-definition-model.js';

export async function resolveRegisterItemTemplate(database, transaction, reference, { allowCreatures = false } = {}) {
  if (reference.definitionRef) {
    const published = await readItemDefinition(database, transaction, reference.definitionRef, { required: false });
    if (published) {
      if (!allowCreatures && ['pferde', 'vieh'].includes(published.category)) throw new HttpsError('invalid-argument', 'Tierdefinitionen werden über den Begleiterablauf zugeteilt.');
      return { ...definitionTemplate(published), id: reference.template || published.id, templateId: published.id };
    }
    if (reference.moduleId && reference.template?.startsWith('module:')) {
      const product = await resolveModuleProduct({ database, transaction, standards: STANDARD_ITEMS,
        input: { moduleId: reference.moduleId, productId: reference.template, sourceRevision: reference.sourceRevision } });
      if (product.definitionRef?.id !== reference.definitionRef.id || product.definitionRef?.revision !== reference.definitionRef.revision) throw new HttpsError('aborted', 'Die Definition des Angebots wurde inzwischen geändert.');
      return product;
    }
    const definition = await readItemDefinition(database, transaction, reference.definitionRef);
    if (!allowCreatures && ['pferde', 'vieh'].includes(definition.category)) throw new HttpsError('invalid-argument', 'Tierdefinitionen werden über den Begleiterablauf zugeteilt.');
    return definitionTemplate(definition);
  }
  if (!reference.template) return null;
  let template = STANDARD_ITEMS.find(item => item.id === reference.template || item.aliases?.includes(reference.template));
  if (!template && reference.moduleId) template = await resolveModuleProduct({ database, transaction, standards: STANDARD_ITEMS,
    input: { moduleId: reference.moduleId, productId: reference.template, sourceRevision: reference.sourceRevision } });
  if (!template && /^offer:[\w:.-]{1,210}$/.test(reference.template)) {
    const snapshot = await transaction.get(database.collection('item_register_offers').doc(reference.template));
    if (snapshot.exists) template = normalizeOffer({ ...snapshot.data(), id: snapshot.id }, STANDARD_ITEMS);
  }
  if (!template || template.archived || (!allowCreatures && ['pferde', 'vieh'].includes(template.category))) {
    throw new HttpsError('invalid-argument', 'Diese Registervorlage ist nicht als Gegenstand verfügbar.');
  }
  return template;
}
