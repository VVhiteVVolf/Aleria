import test from 'node:test';
import assert from 'node:assert/strict';
import { getVennyrTechniqueUnavailableReason as reason } from '../modules/classes/vennyr/vennyr-technique-weapon-rules.js';
import { getSirenentanzBasicTechniques } from '../modules/combat-styles/sirenentanz/sirenentanz-basic-techniques.js';
import { getSirenentanzExpertTechniques } from '../modules/combat-styles/sirenentanz/sirenentanz-expert-techniques.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { getCombatTechniqueIconMotif } from '../modules/combat-styles/combat-technique-icons.js';

const technique = (classId, slug) => [...getSirenentanzBasicTechniques(classId), ...getSirenentanzExpertTechniques(classId)]
  .find(entry => entry.id.endsWith(`-${slug}`));
const weapon = (weaponType, name, weaponProfileId) => ({ id: 'weapon', weaponType, name, weaponProfileId, equipped: true });
const profile = (main, overrides = {}) => ({ progression: { level: 20, development: { mode: 'purchase' } },
  templateSelections: { classId: 'teulu' }, combat: {}, weapons: [main], ...overrides });

test('Vennyr equipment requirements follow canonical data even for foreign-class purchases', () => {
  const source = technique('ceidwyn', 'gischtpfeil');
  const shortbow = weapon('bow', 'Kurzbogen');
  const longbow = weapon('bow', 'Langbogen');
  assert.equal(reason(profile(shortbow), source, shortbow), '');
  assert.match(reason(profile(longbow), source, longbow), /Kurzbogen/);
  assert.match(reason(profile(longbow), { ...source, cultureTraining: { weaponProfileIds: [] } }, longbow), /Kurzbogen/);
  assert.match(reason(profile(shortbow, { progression: { level: 1 } }), technique('ceidwyn', 'flutbolzen'), shortbow), /Stufe 8/);
  const crossbow = weapon('crossbow', 'Armbrust');
  assert.equal(reason(profile(crossbow, { progression: { level: 7, specialLevels: 1 } }), technique('ceidwyn', 'flutbolzen'), crossbow), '');
});

test('a mounted Rhiddwyr attack needs a real mounted state; foot alternatives remain usable', () => {
  const spear = weapon('polearm', 'Reiterspieß');
  const mounted = technique('rhiddwyr', 'streifender-anritt');
  assert.match(reason(profile(spear), mounted, spear), /berittenen Status/);
  assert.equal(reason(profile(spear, { combat: { mounted: true } }), mounted, spear), '');
  assert.equal(reason(profile(spear), technique('rhiddwyr', 'abgesessene-glefe'), spear), '');
});

test('Vennyr aliases preserve real weapon distinctions and recognize existing authored equipment', () => {
  const cases = [
    ['morwyr', 'leinenwurf', 'spear', 'Harpunenspeer'],
    ['ceidwyn', 'saebel-der-gasse', 'sword', 'Säbel'],
    ['rhyfelwyr', 'axt-der-kante', 'axe', 'Großaxt'],
    ['rhyfelwyr', 'hammerhut', 'mace', 'Kriegshammer'],
    ['rhyfelwyr', 'stern-am-griff', 'mace', 'Flegel'],
    ['rhyfelwyr', 'ruhender-kolben', 'mace', 'Streitkolben']
  ];
  for (const [classId, slug, type, name] of cases) {
    const saved = sanitizeCharacterCombatProfile(profile(weapon(type, name)));
    const item = saved.weapons[0];
    assert.equal(item.weaponType, type, name);
    assert.equal(reason(saved, technique(classId, slug), item), '', name);
  }
  const wrong = weapon('spear', 'Speer');
  assert.match(reason(profile(wrong), technique('morwyr', 'leinenwurf'), wrong), /Harpunen/);
});

test('real hammer, flail and crossbow standards retain precise family access and icons', () => {
  for (const [classId, slug, type, name, weaponProfileId] of [
    ['rhyfelwyr', 'hammerhut', 'mace', 'Zweihand-Kriegshammer', 'maul'],
    ['rhyfelwyr', 'hammerhut', 'mace', 'Einhand-Kriegshammer', 'warhammer'],
    ['rhyfelwyr', 'stern-am-griff', 'mace', 'Flegel', 'flail'],
    ['ceidwyn', 'flutbolzen', 'crossbow', 'Einfache Armbrust', 'light-crossbow'],
    ['ceidwyn', 'flutbolzen', 'crossbow', 'Schwere Armbrust', 'heavy-crossbow']
  ]) {
    const saved = sanitizeCharacterCombatProfile(profile(weapon(type, name, weaponProfileId)));
    assert.equal(reason(saved, technique(classId, slug), saved.weapons[0]), '', name);
  }
  assert.equal(getCombatTechniqueIconMotif(technique('rhyfelwyr', 'hammer-der-brandung')), 'hammer-strike');
  assert.equal(getCombatTechniqueIconMotif(technique('rhyfelwyr', 'stern-der-front')), 'flail-swing');
});

test('Derwyn staff techniques reserve both hands after sanitization removes copied training', () => {
  const staff = weapon('staff', 'Kampfstab');
  const source = { id: technique('derwyn', 'saphirkreis').id, combatStyleId: 'sirenentanz' };
  assert.equal(reason(profile(staff), source, staff), '');
  assert.match(reason(profile(staff, { armorClass: { shieldBonus: 1 } }), source, staff), /beide Hände/);
  const dagger = { id: 'left', weaponType: 'dagger', name: 'Dolch' };
  assert.match(reason(profile(staff, { weapons: [staff, dagger], combat: { offHandWeaponId: 'left' } }), source, staff), /beide Hände/);
});
