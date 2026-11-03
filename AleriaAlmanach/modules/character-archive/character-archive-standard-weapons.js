import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { normalizeCharacterArchiveEntry } from './character-archive-model.js';

// Only the authored class starter rows use these aliases. Personal weapons and
// existing character equipment retain their own rules and instance identities.
const BUILTIN_STARTER_STANDARDS = Object.freeze({
  Dolch: 'dolch', Dreizack: 'dreizack', Enteraxt: 'enteraxt',
  Großschwert: 'ritterschwert', Handaxt: 'handaxt', Harpunenspeer: 'harpunenspeer',
  Kampfstab: 'kampfstab', Kurzbogen: 'kurzbogen', Kurzschwert: 'kurzschwert',
  Langbogen: 'langbogen', Langschwert: 'langschwert', Lanze: 'lanze',
  Morgenstern: 'morgenstern', Partisane: 'partisane', Rapier: 'rapier',
  Säbel: 'saebel', Speer: 'speer', Streitaxt: 'streitaxt', Streitkolben: 'streitkolben'
});

export function buildBuiltinStarterWeaponArchiveEntry(attack = {}, source = {}, items = STANDARD_ITEMS) {
  if (!String(attack.id || '').startsWith('starter-') || source.kind !== 'class') return null;
  const sourceId = BUILTIN_STARTER_STANDARDS[attack.name];
  if (!sourceId) return null;
  const standard = items.find(item => item.id === `standard:waffen-rustungen:${sourceId}`);
  if (!standard) return null;
  const entry = buildStandardWeaponArchiveEntries([standard])[0];
  return entry ? normalizeCharacterArchiveEntry({ ...entry, sources: [...entry.sources, source] }) : null;
}

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
