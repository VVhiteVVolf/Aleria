import {
  CHARACTER_ANCESTRY_TEMPLATES,
  CHARACTER_BACKGROUND_TEMPLATES,
  CHARACTER_CLASS_TEMPLATES
} from '../combat/character-creation-templates.js?v=20260909-dragon-parent-v2';
import { getArchiveCombatStyles } from './character-archive-combat-catalog.js';
import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { buildStandardWeaponArchiveEntries, buildBuiltinStarterWeaponArchiveEntry } from './character-archive-standard-weapons.js';
import { getArchiveAbilityIconSource } from './character-archive-ability-icons.js';
import { getClassPageIconSource } from '../classes/class-icon-registry.js?v=20260911-venalys-v1';
import {
  mergeCharacterArchiveEntries,
  normalizeCharacterArchiveEntry,
  projectItemRegisterArchiveEntries
} from './character-archive-model.js?v=20260928-equipment-art-v4';
import { FIRE_SPELL_ARSENAL } from './fire-spell-arsenal.js?v=20260810-fire-spell-arsenal-v1';
import { DEVELOPMENT_TRAITS } from '../character-development/development-traits.js';
import { buildSpellCatalogArchiveEntries } from '../spell-catalog/spell-catalog-archive.js';
import { ARCHIVE_PAGE_CLASSES, ARCHIVE_PAGE_MOUNTS } from './character-archive-page-data.js?v=20260913-morgorn-names-v1';
import { classifyCharacterArchiveEntries, createArchiveMountEntry } from './character-archive-classification.js?v=20260928-equipment-art-v4';

const SPELL_ATTACK_LIBRARY_URL = new URL('../../data/spell-attack-library.json', import.meta.url);

function templateEntry(kind, template, description = '') {
  const icon = kind === 'class' ? getClassPageIconSource(template.id) : String(template.icon || '').trim();
  return normalizeCharacterArchiveEntry({
    id: `builtin--${kind}--${template.id}`,
    kind,
    name: template.label || template.name,
    description: description || template.description || template.subtitle || '',
    tags: [template.group, template.subtitle].filter(Boolean),
    icon,
    data: { ...template, name: template.label || template.name, ...(icon ? { icon } : {}) },
    sources: [{ kind: 'system', id: template.id, name: 'Aleria-Regelvorlagen' }],
    builtin: true
  });
}

function namedTrait(name, description, sourceId, sourceName, icon = '') {
  return normalizeCharacterArchiveEntry({
    id: `builtin--trait--${sourceId}--${String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    kind: 'trait',
    name,
    description,
    icon,
    data: {
      name,
      type: 'trait',
      description,
      appliesWhen: 'Wenn Herkunft, Kultur oder Ausbildung relevant sind',
      target: 'Selbst',
      duration: 'Dauerhaft',
      active: true,
      ...(icon ? { icon } : {}),
      mechanics: {}
    },
    sources: [{ kind: 'template', id: sourceId, name: sourceName }],
    builtin: true
  });
}

function buildTemplateEntries() {
  const entries = [];
  CHARACTER_ANCESTRY_TEMPLATES.forEach(template => {
    entries.push(templateEntry('ancestry', template));
    (template.culturalTraits || []).forEach(name => entries.push(namedTrait(name, template.description, template.id, template.label, template.icon)));
  });
  CHARACTER_BACKGROUND_TEMPLATES.forEach(template => {
    entries.push(templateEntry('background', template));
    (template.traits || []).forEach(name => entries.push(namedTrait(name, template.description, template.id, template.label)));
  });
  CHARACTER_CLASS_TEMPLATES.forEach(template => {
    entries.push(templateEntry('class', template));
    (template.weapons || []).forEach(attack => entries.push(buildBuiltinStarterWeaponArchiveEntry(attack,
      { kind: 'class', id: template.id, name: template.label }) || normalizeCharacterArchiveEntry({
      kind: 'attack',
      name: attack.name,
      description: attack.notes || attack.properties || template.description,
      data: attack,
      tags: [template.group, template.label, attack.weaponType],
      sources: [{ kind: 'class', id: template.id, name: template.label }],
      builtin: true
    })));
    (template.abilities || []).forEach(ability => entries.push(normalizeCharacterArchiveEntry({
      kind: 'ability',
      name: ability.name,
      description: ability.description,
      data: ability,
      tags: [template.group, template.label, ability.tags],
      sources: [{ kind: 'class', id: template.id, name: template.label }],
      builtin: true
    })));
  });
  ARCHIVE_PAGE_CLASSES.forEach(page => entries.push(normalizeCharacterArchiveEntry({
    id: `class-page--${page.id}`, kind: 'class', name: page.name, description: page.description,
    icon: page.icon, data: { ...page, pageOrder: page.order }, tags: page.cultures,
    sources: [{ kind: 'system', id: page.sourcePage, name: 'Klassenseite' }], builtin: true
  })));
  return entries;
}

function buildFireSpellArsenalEntries() {
  return FIRE_SPELL_ARSENAL.map(spell => normalizeCharacterArchiveEntry({
    id: `builtin--spell--${spell.id}`,
    kind: 'spell',
    name: spell.name,
    description: spell.description,
    data: spell,
    tags: [spell.school, spell.damageType, `Grad ${spell.level}`],
    sources: [{ kind: 'system', id: 'fire-spell-arsenal', name: 'Feuerarsenal · Aleria-Regelvorlagen' }],
    builtin: true
  }));
}

function buildCombatStyleEntries() {
  const entries = [];
  getArchiveCombatStyles().forEach(style => {
    entries.push(normalizeCharacterArchiveEntry({
      id: `builtin--combat-style--${style.id}`,
      kind: 'combat-style',
      name: style.name,
      description: style.description,
      data: style,
      tags: [style.culture, ...(style.weaponFocus || [])],
      sources: [{ kind: 'combat-style', id: style.id, name: style.name }],
      builtin: true
    }));
    (style.forms || []).forEach(form => {
      entries.push(normalizeCharacterArchiveEntry({
        id: `builtin--combat-style--${form.id}`,
        kind: 'combat-style',
        name: form.name,
        description: form.unlockRule || style.description,
        data: { ...form, parentStyleId: style.id, parentStyleName: style.name },
        tags: [style.name, style.culture, form.trainingTier],
        sources: [{ kind: 'combat-style', id: style.id, name: style.name }],
        builtin: true
      }));
      (form.techniques || []).forEach(technique => entries.push(normalizeCharacterArchiveEntry({
        kind: 'technique',
        name: technique.name,
        description: technique.description || technique.effect,
        data: technique,
        tags: [style.name, form.shortName, technique.tags],
        sources: [{ kind: 'combat-style', id: form.id, name: form.name }],
        builtin: true
      })));
    });
  });
  return entries;
}

function entryFromLibrary(kind, item, classId, className) {
  const icon = item.icon || (kind === 'ability' ? getArchiveAbilityIconSource({ kind, name: item.name, data: item,
    sources: [{ kind: 'character-library', id: classId, name: item.sourceCharacter || className }] }) : '');
  return normalizeCharacterArchiveEntry({
    kind,
    name: item.name,
    description: item.description || item.effect || '',
    icon,
    data: item,
    tags: [className, item.school, item.trainingForm, item.tags],
    sources: [{
      kind: 'character-library',
      id: classId,
      name: item.sourceCharacter || className
    }],
    builtin: true
  });
}

async function loadSpellAttackLibraryEntries() {
  try {
    const response = await fetch(SPELL_ATTACK_LIBRARY_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const library = await response.json();
    const entries = [];
    Object.entries(library.byClass || {}).forEach(([classId, group]) => {
      (group.spells || []).forEach(item => entries.push(entryFromLibrary('spell', item, classId, group.className)));
      (group.techniques || []).forEach(item => {
        const kind = item.category === 'technique' || item.trainingForm ? 'technique' : 'ability';
        entries.push(entryFromLibrary(kind, item, classId, group.className));
      });
    });
    return { entries, libraryRevision: String(library.sourceRevision || '') };
  } catch (error) {
    console.info('Zauber- und Attackenbibliothek konnte nicht geladen werden.', error);
    return { entries: [], libraryRevision: '' };
  }
}

let catalogPromise = null;

export function loadBuiltinCharacterArchiveSnapshot() {
  if (!catalogPromise) {
    catalogPromise = loadSpellAttackLibraryEntries().then(({ entries: libraryEntries, libraryRevision }) => ({ libraryRevision,
      entries: mergeCharacterArchiveEntries(classifyCharacterArchiveEntries([
      buildTemplateEntries(),
      buildCombatStyleEntries(),
      buildFireSpellArsenalEntries(),
      buildSpellCatalogArchiveEntries(),
      DEVELOPMENT_TRAITS.map(trait => normalizeCharacterArchiveEntry({ id: trait.id, kind: 'trait', name: trait.name,
        description: trait.description, icon: trait.icon, data: trait, builtin: true,
        sources: [{ kind: 'system', id: 'character-development', name: 'Individuelle Charakterentwicklung' }] })),
      libraryEntries,
      projectItemRegisterArchiveEntries(STANDARD_ITEMS),
      buildStandardWeaponArchiveEntries(),
      ARCHIVE_PAGE_MOUNTS.map(createArchiveMountEntry)
    ].flat())) }));
  }
  return catalogPromise;
}

export async function loadBuiltinCharacterArchiveEntries() {
  return (await loadBuiltinCharacterArchiveSnapshot()).entries;
}
