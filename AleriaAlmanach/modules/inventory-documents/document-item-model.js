import { normalizeItemDocumentRef } from '../item-definitions/item-definition-model.js';
import { materializeInventoryItem } from '../item-definitions/item-definition-resolver.js';
import { documentLink } from '../../DokumentenWerkstatt/js/document-schema.js';

export function inventoryDocument(item, definitions) {
  const reference = normalizeItemDocumentRef(materializeInventoryItem(item, definitions).documentRef);
  if (!reference) return null;
  const query = item.ownerCharacterId && (item.instanceId || item.id) ? new URLSearchParams({ kind: 'characters', holder: item.ownerCharacterId, item: item.instanceId || item.id }) : null;
  return { ...reference, href: documentLink(reference.id) + (query ? `&${query}` : '') };
}
