import { normalizeArchiveSearchText } from './character-archive-model.js?v=20260905-archive-order-v2';
import { ensureArchiveGroup, addArchiveGroupEntry, sortArchiveGroups } from './character-archive-group-tree.js?v=20260905-cenyr-character-training-v1';
import { isArchiveWeapon, getArchiveWeaponRelation } from './character-archive-weapon-groups.js?v=20260905-cenyr-character-training-v1';

function hasDamageEffect(value) {
  if (Array.isArray(value)) return value.some(hasDamageEffect);
  if (!value || typeof value !== 'object') return false;
  if (String(value.type || '').toLowerCase().includes('damage')) return true;
  return Object.values(value).some(hasDamageEffect);
}

export function isCharacterArchiveCombatAbility(entry = {}) {
  const data = entry.data || {};
  return entry.kind === 'ability' && (data.combatUsable === true
    || Boolean(String(data.damageFormula || data.rollFormula || '').trim())
    || data.delivery === 'attack' || hasDamageEffect(data.effects) || hasDamageEffect(data.mechanics));
}

export function matchesCharacterArchiveKind(entry = {}, kind = '') {
  if (kind === 'all' || !kind) return true;
  if (kind === 'technique') return !getArchiveWeaponRelation(entry) && (entry.kind === 'technique' || entry.kind === 'combat-style'
    || isCharacterArchiveCombatAbility(entry) || (entry.kind === 'attack' && !isArchiveWeapon(entry)));
  if (kind === 'attack') return isArchiveWeapon(entry) || Boolean(getArchiveWeaponRelation(entry));
  return entry.kind === kind;
}

function lookup(entries, kind, reference) {
  if (!reference) return null;
  const key = normalizeArchiveSearchText(reference);
  return entries.find(entry => entry.kind === kind && [entry.id, entry.data?.id, entry.name]
    .some(value => normalizeArchiveSearchText(value) === key)) || null;
}

function styleOwners(style, entries, explicitClass = '', allowedClassIds = []) {
  if (explicitClass) return [{ name: lookup(entries, 'class', explicitClass)?.name || explicitClass, entry: lookup(entries, 'class', explicitClass) }];
  const allowedClasses = new Set(Array.isArray(allowedClassIds) ? allowedClassIds : []);
  return entries.filter(entry => entry.kind === 'class').flatMap(entry => {
    const cultural = entry.data?.cultureClassProfiles;
    if (cultural?.length) return cultural.filter(profile => profile.combatStyleGrants.some(grant => grant.styleId === style.data?.id)
        && (!allowedClasses.size || allowedClasses.has(profile.classId)))
      .map(profile => ({ name: entry.data.cultures?.length > 1 ? `${entry.name} · ${profile.culture}` : entry.name, entry }));
    return entry.data?.combatStyleGrants?.some(grant => grant.styleId === style.data?.id) ? [{ name: entry.name, entry }] : [];
  });
}

function stylePaths(groups, style, entries, explicitClass = '', allowedClassIds = []) {
  const owners = styleOwners(style, entries, explicitClass, allowedClassIds);
  const branches = owners.length ? owners.map(owner => ensureArchiveGroup(groups, 'class', owner.name, owner.entry).children) : [groups];
  return branches.map(branch => ensureArchiveGroup(branch, 'style', style.name, style));
}

function canonicalPaths(groups, entry, entries) {
  const data = entry.data || {};
  const placement = data.archivePlacement || {};
  if (placement.personName || placement.weaponName) return [];
  const isDefinition = entry.kind === 'combat-style';
  const form = isDefinition && (data.parentStyleId || placement.styleId) ? entry : lookup(entries, 'combat-style', placement.formId || data.combatStyleFormId);
  const styleId = form?.data?.parentStyleId || form?.data?.archivePlacement?.styleId || placement.styleId || data.combatStyleId;
  const style = isDefinition && !form ? entry : lookup(entries, 'combat-style', styleId);
  if (!style) return [];
  const styles = stylePaths(groups, style, entries, placement.className || style.data?.archivePlacement?.className,
    isDefinition ? [] : data.cenyrTraining?.allowedClassIds);
  return form ? styles.map(group => ensureArchiveGroup(group.children, 'form', form.name, form)) : styles;
}

function personalPaths(groups, entry) {
  const data = entry.data || {};
  if (data.archivePlacement?.className || data.archivePlacement?.styleId || data.archivePlacement?.formId) return [];
  const explicitName = data.archivePlacement?.personName || data.sourceCharacter;
  const sources = (entry.sources || []).filter(source => source.kind === 'character' || source.kind === 'creature');
  if (!sources.length && explicitName) sources.push({ kind: 'character', name: explicitName });
  if (data.archivePlacement?.personName) sources.splice(0, sources.length, { kind: 'character', name: data.archivePlacement.personName });
  return sources.filter(source => source.name).map(source => {
    const root = ensureArchiveGroup(groups, source.kind === 'creature' ? 'creature' : 'persons', source.kind === 'creature' ? 'Kreaturen' : 'Personen');
    const person = ensureArchiveGroup(root.children, 'person', source.name);
    return ensureArchiveGroup(person.children, 'attacks', 'Attacken');
  });
}

export function getCharacterArchiveAttackGroups(entries = [], allEntries = entries) {
  const groups = [];
  entries.forEach(entry => {
    // Equipment requirements are not weapon-owned attacks; only explicit assignments are.
    if (getArchiveWeaponRelation(entry)) return;
    const paths = canonicalPaths(groups, entry, allEntries);
    if (paths.length) {
      if (entry.kind !== 'combat-style') paths.forEach(group => addArchiveGroupEntry(group, entry));
      return;
    }
    // Profile trainingForm strings record training, not additional canonical forms.
    if (entry.kind === 'combat-style' && entry.archivedFromProfile) return;
    const personal = personalPaths(groups, entry);
    if (personal.length) {
      personal.forEach(group => addArchiveGroupEntry(group, entry));
      return;
    }
    const placement = entry.data?.archivePlacement || {};
    if (placement.className) {
      const owner = lookup(allEntries, 'class', placement.className);
      const classGroup = ensureArchiveGroup(groups, 'class', owner?.name || placement.className, owner);
      const style = ensureArchiveGroup(classGroup.children, 'style', placement.styleName || 'Kampftechnik noch zuordnen');
      addArchiveGroupEntry(ensureArchiveGroup(style.children, 'form', entry.data?.trainingForm || 'Form noch zuordnen'), entry);
      return;
    }
    addArchiveGroupEntry(ensureArchiveGroup(groups, 'general', 'Weitere Techniken & Attacken'), entry);
  });
  return sortArchiveGroups(groups);
}
