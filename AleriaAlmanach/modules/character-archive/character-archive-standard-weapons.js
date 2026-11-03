import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { normalizeCharacterArchiveEntry } from './character-archive-model.js';

// A weapon reference is separate from both a market offer and somebody's actual
// possession. Taking an archive reference never creates or equips inventory.
export function buildStandardWeaponArchiveEntries(items = STANDARD_ITEMS) {
  return items.filter(item => item.category === 'waffen' && item.combatDefinition?.kind === 'weapon')
    .map(item => normalizeCharacterArchiveEntry({
      id: `builtin--weapon-standard--${item.id}`, kind: 'attack', name: item.title,
      description: item.description, icon: item.image,
      tags: ['Waffenstandard', item.type, item.combatDefinition.damageType, ...(item.tags || [])],
      sources: [{ kind: 'standard-weapon', id: item.id, name: 'Zeughaus · Waffenmaßstab' }], builtin: true,
      data: { ...structuredClone(item.combatDefinition), id: `standard-weapon--${item.sourceRefs?.[0]?.sourceId || item.id}`,
        name: item.title, image: item.image, icon: item.image, templateId: item.id,
        archiveStandardWeaponId: item.id, equipped: false, proficient: false,
        notes: [item.description, item.combatDefinition.notes].filter(Boolean).join('\n\n') }
    }));
}
