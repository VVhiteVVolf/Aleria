import { HttpsError } from 'firebase-functions/v2/https';
import { STANDARD_ITEMS } from '../generated/item-register/item-register-standard.js';
import { normalizeOffer } from '../generated/item-register/item-register-model.js';
import { resolveModuleProduct } from './item-register-module-source.js';

export async function resolveRegisterItemTemplate(database, transaction, reference) {
  if (!reference.template) return null;
  let template = STANDARD_ITEMS.find(item => item.id === reference.template);
  if (!template && reference.moduleId) template = await resolveModuleProduct({ database, transaction, standards: STANDARD_ITEMS,
    input: { moduleId: reference.moduleId, productId: reference.template, sourceRevision: reference.sourceRevision } });
  if (!template && /^offer:[\w:.-]{1,210}$/.test(reference.template)) {
    const snapshot = await transaction.get(database.collection('item_register_offers').doc(reference.template));
    if (snapshot.exists) template = normalizeOffer({ ...snapshot.data(), id: snapshot.id }, STANDARD_ITEMS);
  }
  if (!template || template.archived || ['pferde', 'vieh'].includes(template.category)) {
    throw new HttpsError('invalid-argument', 'Diese Registervorlage ist nicht als Gegenstand verfügbar.');
  }
  return template;
}
