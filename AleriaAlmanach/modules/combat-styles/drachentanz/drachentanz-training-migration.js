import { DRACHENTANZ_CLASS_PATH_IDS, DRACHENTANZ_FORM_IDS as F } from './drachentanz-ids.js?v=20260909-dragon-parent-v2';
import { DRACHENTANZ_COMBAT_STYLE } from './drachentanz-registry.js?v=20260909-dragon-parent-v2';

const FORMER_PATH_IDS = Object.freeze({
  saddle: 'drachentanz-pfad-satteldrache', lance: 'drachentanz-pfad-lanzendrache', bow: 'drachentanz-pfad-bogendrache'
});

const SPEAR_REPLACEMENTS = Object.freeze({
  [F.schwertdrache]: F.speerdrache,
  [F.abwartender]: F.huetender,
  [F.fliegender]: F.peitschender,
  [F.bruellender]: F.peitschender,
  [F.ausgeglichener]: F.speerdrache,
  [F.aufsteigender]: F.peitschender
});

export const DRACHENTANZ_FORM_MIGRATIONS = Object.freeze({
  cantref: Object.freeze({ ...SPEAR_REPLACEMENTS, [FORMER_PATH_IDS.lance]: F.peitschender }),
  uchelwyr: Object.freeze({ ...SPEAR_REPLACEMENTS, [F.zwillingsdrache]: F.schweifender, [FORMER_PATH_IDS.saddle]: F.stuermender }),
  helwyr: Object.freeze({ [FORMER_PATH_IDS.bow]: F.lauernder }),
  barddwyr: Object.freeze({ [F.abwartender]: F.schwertdrache, [F.fliegender]: F.schwertdrache, [F.ausgeglichener]: F.schwertdrache })
});

const KNOWN_FORM_IDS = new Set([...Object.values(F), ...Object.values(FORMER_PATH_IDS)]);
const TECHNIQUES = new Map(DRACHENTANZ_COMBAT_STYLE.forms.flatMap(form => form.techniques || []).map(technique => [technique.id, technique]));
const LEGACY_CHARACTER_TECHNIQUE_IDS = new Set([
  'gawain-dragon-bite', 'gawain-dragon-claw', 'gawain-silver-scale-dance',
  'gawain-dragon-tail', 'gawain-dragon-whirl', 'legacy-dragon-bite'
]);

/** The reserved catalog namespace and these pre-registry IDs are managed data.
 * A user's ordinary class-tagged attack is never identified by name or category.
 */
export function isDrachentanzCanonicalTechniqueId(id) {
  const key = String(id || '');
  return key.startsWith('combat-style-drachentanz-') || LEGACY_CHARACTER_TECHNIQUE_IDS.has(key);
}

/** Unknown user-authored IDs pass through; retired or foreign catalog forms do not. */
export function migrateDrachentanzFormId(classId, formId) {
  const key = String(classId || '').replace(/^cenyr-/, '').toLowerCase();
  const id = String(formId || '');
  const replacement = DRACHENTANZ_FORM_MIGRATIONS[key]?.[id] || id;
  if (!KNOWN_FORM_IDS.has(id)) return id;
  if ([F.jungdrache, F.vertiefung].includes(replacement)) return replacement;
  if (key === 'barddwyr' && replacement === F.traellernder) return replacement;
  return DRACHENTANZ_CLASS_PATH_IDS[key]?.includes(replacement) ? replacement : '';
}

const OLD_SWORD_SLUGS = Object.freeze([
  'eroeffnung-des-einen', 'gebundene-spitze', 'antwort-der-krone', 'halbmondfinte',
  'abgezaehlter-atem', 'tiefe-bindung', 'siebter-wechsel', 'richtertritt',
  'auraeid', 'ungebrochener-blick', 'gnadenloses-mass', 'letztes-urteil'
]);
const SPEAR_SLUGS = Object.freeze([
  'fliessende-eroeffnung', 'gleitende-bindung', 'rankenspitze', 'albischer-halbkreis',
  'steter-atem', 'gewundener-schaft', 'siebter-strom', 'uferwechsel',
  'aura-im-strom', 'ungebrochener-kreis', 'ferne-linie', 'ewiger-reigen'
]);
const SWORD_TO_SPEAR = Object.freeze(Object.fromEntries(OLD_SWORD_SLUGS.map((slug, index) => [
  `combat-style-drachentanz-schwertdrache-${slug}`, `combat-style-drachentanz-speerdrache-${SPEAR_SLUGS[index]}`
])));

/** Retained lance, bow, rider and Barddwyr attack IDs resolve to their new catalog form.
 * Removed shared techniques free their old slot for a fresh valid choice; they are
 * never silently exchanged for an unrelated attack. User-authored IDs stay intact.
 */
export function migrateDrachentanzTechniqueId(classId, techniqueId) {
  const key = String(classId || '').replace(/^cenyr-/, '').toLowerCase();
  const id = String(techniqueId || '');
  if (LEGACY_CHARACTER_TECHNIQUE_IDS.has(id)) return '';
  if (['cantref', 'uchelwyr'].includes(key) && SWORD_TO_SPEAR[id]) return SWORD_TO_SPEAR[id];
  const technique = TECHNIQUES.get(id);
  if (!technique) return id;
  const allowed = technique.cenyrTraining?.allowedClassIds || [];
  return (!allowed.length || allowed.includes(key)) && migrateDrachentanzFormId(key, technique.combatStyleFormId)
    ? id : '';
}
