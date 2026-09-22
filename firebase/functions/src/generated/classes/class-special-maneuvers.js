import { createDrachentanzDamageProfile } from '../combat-styles/drachentanz/drachentanz-damage-progression.js';

// Class features supplement the earned technique slots. They never replace a
// player's training choices and cannot be exchanged for free aura payments.
export const CLASS_SPECIAL_MILESTONES = Object.freeze([5, 8, 12, 16, 20]);
const curricula = {
  'cenyr-milwr': ['Milwr', 'Mut der Reihe', 'Entschlossener Vorstoß'],
  teulu: ['Teulu', 'Atem unter Stahl', 'Hieb des Eides'],
  cantref: ['Cantref', 'Ruhe der Speerwacht', 'Stoß durch die Linie'],
  uchelwyr: ['Uchelwyr', 'Atem des Grenzreiters', 'Stoß des Wappenträgers'],
  helwyr: ['Helwyr', 'Atem des Waldläufers', 'Jägers Entscheidung'],
  arthwyr: ['Arthwyr', 'Zäher Seebär', 'Pranke des Bären'],
  barddwyr: ['Barddwyr', 'Standvers', 'Klingender Schlusshieb'],
  morwyr: ['Morwyr', 'Atem im Seegang', 'Brecherhieb'],
  rhyfelwyr: ['Rhyfelwyr', 'Zorn im Zaum', 'Klinge des Sturmritters'],
  ceidwynr: ['Ceidwynr', 'Ruhe über den Wellen', 'Schuss des Küstenwächters'],
  rhiddwyrr: ['Rhiddwyrr', 'Ruhe am Zügel', 'Klinge der Vorhut'],
  derwyn: ['Derwyn', 'Stille des Ufers', 'Gesammelte Andacht', 'caster'],
  'hird-maid': ['Hird/Maid', 'Atem der Hofwacht', 'Vorstoß des Clans'],
  skjoldr: ['Skjoldr', 'Ruhe hinter Eisen', 'Eiserner Durchbruch'],
  thegnar: ['Thegnar', 'Atem des Wegwächters', 'Schlag der Thanengarde'],
  skeidr: ['Skeidr', 'Atem an der Reling', 'Hieb des Enterführers'],
  skjaldr: ['Skjaldr', 'Gezügelter Kampfatem', 'Wolfskeil'],
  skytte: ['Skytte', 'Ruhe des Fährtenlesers', 'Entschlossener Jagdangriff'],
  skalde: ['Skalde', 'Strophe des Durchhaltens', 'Betonter Schlusshieb'],
  kern: ['Kern', 'Atem der Heide', 'Hieb des Freien'],
  cateran: ['Cateran', 'Ruhe der Klinge', 'Entschlossener Klingengang'],
  mormaer: ['Mormaer', 'Atem des Bannerreiters', 'Schlag des Hochlands'],
  serf: ['Serf', 'Ruhe im Blattwerk', 'Jagdentscheidung'],
  airig: ['Airig', 'Atem am Speerschaft', 'Stoß des Grenzhüters'],
  currach: ['Currach', 'Ruhe im Wellengang', 'Hieb über die Bordwand'],
  'ceolaire-piobaire': ['Ceólaire & Piobaire', 'Tragender Atem', 'Klinge im Marschtakt'],
  riada: ['Riada', 'Atem des Freischärlers', 'Entschlossener Überfall'],
  silvaner: ['Silvaner', 'Ruhe zwischen Wurzeln', 'Angriff des Pfadfinders'],
  galloghlaigh: ['Galloghlaigh', 'Atem unter Eisen', 'Hieb der schweren Wacht'],
  fathach: ['Fathach', 'Atem des Felsens', 'Schlag des Felsenkinds'],
  magier: ['Magier', 'Arkanes Sammeln', 'Fokussierte Anrufung', 'caster'],
  kleriker: ['Kleriker', 'Tragende Andacht', 'Entschlossene Fürbitte', 'caster'],
  hexer: ['Paktträger', 'Atem des Paktes', 'Gesammelte Paktmacht', 'caster'],
  asket: ['Asket', 'Geordneter Atem', 'Schlag aus der Mitte'],
  kampfer: ['Kämpfer', 'Atem des Veteranen', 'Entschlossener Waffengang'],
  reiter: ['Reiter', 'Ruhe am Zügel', 'Hieb der Vorhut'],
  alchemist: ['Alchemist', 'Ruhige Hand', 'Gezielter Waffenschlag'],
  druide: ['Druide', 'Atem des Hains', 'Sammlung des Hains', 'caster'],
  schurke: ['Schurke', 'Ruhe im Schatten', 'Entschlossener Stich'],
  barde: ['Barde', 'Tragender Atem', 'Gesammelter Klang', 'caster'],
  eidgeschworener: ['Eidgeschworener', 'Atem des Eides', 'Bekräftigter Schwur'],
  barbar: ['Barbar', 'Zäher Kampfatem', 'Hieb der Wildheit'],
  waldlaufer: ['Waldläufer', 'Ruhe am Wildpfad', 'Entschlossener Jagdhieb'],
  seefahrer: ['Seefahrer', 'Atem im Seegang', 'Klinge an der Reling'],
  schamane: ['Schamane', 'Atem der Ahnen', 'Gesammelter Geisterruf', 'caster'],
  karnach: ['Grungar', 'Atem der Halle', 'Hieb des Bergknechts'],
  haldr: ['Varor', 'Atem der Obhut', 'Schlag des Hüters'],
  zernach: ['Thalor', 'Atem am Tor', 'Hieb der Festungswacht'],
  wairg: ['Kuralan', 'Ruhe der Herdenwacht', 'Stoß des Hirten'],
  dornach: ['Toran', 'Atem am Grenzpfad', 'Entschlossener Grenzhieb'],
  skarrach: ['Bragan', 'Atem des Stürmers', 'Wuchtiger Vorstoß'],
  rheach: ['Rhean', 'Tragende Weihe', 'Hieb der Weihe'],
  garnach: ['Falgar', 'Ruhige Luntierhand', 'Gezielter Waffengang'],
  limita: ['Limita', 'Atem der Grenze', 'Entschlossener Grenzstoß'],
  condottieri: ['Condottieri', 'Atem des Veteranen', 'Hieb des Vertragsschwerts'],
  gondoleri: ['Gondoleri', 'Ruhe im Kanal', 'Hieb am Brückenpfeiler'],
  lancieri: ['Lancieri', 'Ruhe am Schaft', 'Stoß der Vorhut'],
  stralieri: ['Stralieri', 'Ruhe der Schützen', 'Entschlossener Fernangriff'],
  'hird-kona': ['Hird/Kona', 'Atem der Sippe', 'Hieb der Heimwehr'],
  stjorn: ['Stjorn', 'Ruhe unter Eisen', 'Entschlossener Waffengang'],
  ravnar: ['Ravnar', 'Ruhe des Raben', 'Hieb der Rabenwacht'],
  ulfhednar: ['Ulfhednar', 'Atem des Wolfs', 'Hieb des Wolfszahns'],
  berserkir: ['Berserkir', 'Zorn im Zaum', 'Entschlossener Zornhieb'],
  veigir: ['Veigir', 'Atem des Seemanns', 'Entschlossener Enterhieb'],
  tungur: ['Tungur', 'Tragender Atem', 'Klingender Schlusshieb'],
  hestgar: ['Hestgar', 'Ruhe am Zügel', 'Hieb des Rosswächters']
};
export const CLASS_SPECIAL_IDS = Object.freeze(Object.keys(curricula));
const prefix = 'class-special-';
const labels = { action: 'Aktion', 'bonus-action': 'Bonusaktion', reaction: 'Reaktion', 'special-action': 'Besondere Aktion' };
const costsFor = (id, ids) => [...ids, 'special-action'].map(resourceId => ({ id: `${id}-${resourceId}`, resourceId,
  name: labels[resourceId], amount: 1, scope: resourceId === 'special-action' ? 'persistent' : 'comment' }));
const condition = (id, name, mechanics) => ({ id: `${id}-effect`, type: 'buff', target: 'self', on: 'always', condition: {
  id: 'class-special-preparation', name, description: 'Gilt bis zum Ende des nächsten eigenen Beitrags. Ersetzt eine andere besondere Klassenvorbereitung.',
  active: true, mechanics, durationModel: { kind: 'actor-comments', amount: 1 }
} });
const vitality = (id, formula) => ({ id: `${id}-vitality`, type: 'temporary-hit-points', target: 'self', on: 'always', formula,
  notes: 'Ersetzt nur einen niedrigeren Vorrat; keine Heilung und kein Addieren temporärer TP.' });

export function getClassSpecialCurriculum(classId) {
  const key = String(classId || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/^(?:aldrimar|cenyr|vennyr|morgorn|venalys|nordmaenner|alben)-/, '');
  const canonical = ({ milwr: 'cenyr-milwr', ceidwyn: 'ceidwynr', rhiddwyr: 'rhiddwyrr', pakttrager: 'hexer', hexenmeister: 'hexer',
    krieger: 'kampfer', monch: 'asket', paladin: 'eidgeschworener', grungar: 'karnach', varor: 'haldr', thalor: 'zernach',
    kuralan: 'wairg', toran: 'dornach', bragan: 'skarrach', rhean: 'rheach', falgar: 'garnach' })[key] || key;
  return curricula[canonical] ? { id: canonical, name: curricula[canonical][0], caster: curricula[canonical][3] === 'caster' } : null;
}

export function getClassSpecialManeuvers(classId, level = 1) {
  const curriculum = getClassSpecialCurriculum(classId);
  if (!curriculum || Number(level) < 5) return { abilities: [], techniques: [] };
  const [className, weakName, strongName] = curricula[curriculum.id];
  const abilities = [], techniques = [];
  const make = (slug, minimumLevel, name, ids, description) => {
    const id = `${prefix}${curriculum.id}-${slug}`;
    return { id, name, minimumLevel, active: true, status: 'confirmed', description, effect: description, costs: costsFor(id, ids),
      activationType: ids[0], auraBypass: { allowed: false, resourceId: '', cost: 1 },
      tags: `${className} · Besondere Klassenmanöver`, requirements: `Ab Stufe ${minimumLevel}.`,
      trainingForm: `${className} · Besondere Klassenmanöver`, maximumTargets: 1 };
  };
  const self = (slug, minimumLevel, name, ids, description, effects) => {
    if (Number(level) < minimumLevel) return;
    const entry = make(slug, minimumLevel, name, ids, description);
    abilities.push({ ...entry, combatUsable: true, delivery: 'ability', resolutionType: 'automatic',
      target: 'Selbst', range: 'Selbst', usesMaximum: 0, usesCurrent: 0, effects: effects(entry.id) });
  };
  const strike = (slug, minimumLevel, name, ids) => {
    if (Number(level) < minimumLevel) return;
    const entry = make(slug, minimumLevel, name, ids, 'Ein verstärkter Einzelangriff mit der tatsächlich geführten Waffe. Waffenreichweite, Munition und Waffeneffekte gelten; kein zusätzlicher Angriff.');
    techniques.push({ ...entry, category: 'technique', target: 'Ein Gegner', range: 'Waffenreichweite',
      weaponTypes: [], compatibleWeaponIds: [], damageType: '', attackBonus: 0, damageBonus: 0, criticalThreshold: 20,
      ...createDrachentanzDamageProfile({ minimumLevel, allowedClassIds: [curriculum.id], maximumTargets: 1 }, entry.costs),
      effects: [{ id: `${entry.id}-damage`, type: 'damage', target: 'target', on: 'hit', formula: '', inheritWeaponDamageType: true }],
      secondarySave: { enabled: false }, followUpAttack: { enabled: false } });
  };
  self('reserve', 5, weakName, ['bonus-action'], '1W6 temporäre TP. Ein höherer vorhandener Vorrat bleibt bestehen; keine Heilung.', id => [vitality(id, '1d6')]);
  if (curriculum.caster) self('focus', 5, strongName, ['action'], '1W8 temporäre TP und +1 Zauberangriff für einen eigenen Beitrag. Keine Manaregeneration und kein zusätzlicher Zauber.',
    id => [vitality(id, '1d8'), condition(id, strongName, { spellAttack: 1 })]);
  else strike('strike', 5, strongName, ['action']);
  self('guard', 8, `${className} · Standhalten`, ['reaction'], '1W8 temporäre TP und +1 auf Rettungswürfe für einen eigenen Beitrag; vor dem gegnerischen Angriff einsetzen.',
    id => [vitality(id, '1d8'), condition(id, 'Standhalten', { savingThrow: 1 })]);
  if (curriculum.caster) self('greater-focus', 12, `${className} · Tiefe Sammlung`, ['action', 'reaction'], '2W8 temporäre TP und +2 Zauberangriff für einen eigenen Beitrag. Ersetzt andere besondere Klassenvorbereitungen.',
    id => [vitality(id, '2d8'), condition(id, 'Tiefe Sammlung', { spellAttack: 2 })]);
  else strike('breakthrough', 12, `${className} · Entscheidender Durchbruch`, ['action', 'reaction']);
  self('second-wind', 16, `${className} · Zweiter Atem`, ['bonus-action', 'reaction'], '2W8 temporäre TP und +3 m Bewegungsbudget für einen eigenen Beitrag; keine freie Bewegung.',
    id => [vitality(id, '2d8'), condition(id, 'Zweiter Atem', { movement: 3 })]);
  if (curriculum.caster) self('mastery', 20, `${className} · Ungebrochener Wille`, ['action', 'bonus-action', 'reaction'], '3W8 temporäre TP, +2 Zauberangriff und +2 auf Rettungswürfe für einen eigenen Beitrag; keine zusätzlichen Aktionen.',
    id => [vitality(id, '3d8'), condition(id, 'Ungebrochener Wille', { spellAttack: 2, savingThrow: 2 })]);
  else strike('mastery', 20, `${className} · Vollendeter Angriff`, ['action', 'bonus-action', 'reaction']);
  return { abilities, techniques };
}

export function reconcileClassSpecialManeuvers(profile = {}) {
  const additions = getClassSpecialManeuvers(profile.templateSelections?.classId || profile.identity?.archetype || profile.identity?.className, profile.progression?.level);
  const merge = (previous, canonical) => [...(previous || []).filter(entry => !String(entry.id).startsWith(prefix)), ...canonical];
  return { ...profile, abilities: merge(profile.abilities, additions.abilities), techniques: merge(profile.techniques, additions.techniques) };
}
