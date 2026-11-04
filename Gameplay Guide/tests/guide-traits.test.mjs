import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gawainGuide } from '../modules/gawain-guide.mjs';
import { buildGuideModel } from '../modules/guide-model.mjs';
import { renderGuide } from '../modules/guide-template.mjs';
import { guideCatalogTraitAdvice, withCurrentGuideTraits } from '../modules/guide-trait-rules.mjs';
import { DEVELOPMENT_TRAITS } from '../../AleriaAlmanach/modules/character-development/development-traits.js';
import { PREVIOUS_DEVELOPMENT_TRAITS } from '../../AleriaAlmanach/modules/character-development/development-trait-revision-source.js';
import { normalizeCombatTrait, getSkillTotal, getSavingThrowTotal } from '../../AleriaAlmanach/modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { getSkillIdentity } from '../../AleriaAlmanach/modules/skill-checks/skill-definitions.js';

const catalogTrait = id => DEVELOPMENT_TRAITS.find(entry => entry.id === `development-trait-${id}`);
const { characters } = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));

test('guide trait advice derives names and rule prose from the normalized shared catalogue', () => {
  for (const id of ['neugier-vor-vorsicht', 'eigensinn']) {
    const canonical = normalizeCombatTrait(catalogTrait(id));
    const advice = guideCatalogTraitAdvice(canonical.id, 'Zusätzliche Einordnung.');
    assert.equal(advice[0], canonical.name);
    assert.equal(advice[2], `${canonical.description} Zusätzliche Einordnung.`);
    assert.ok(gawainGuide.techniques.find(([name]) => name === canonical.name)[2].startsWith(canonical.description));
  }
  assert.throws(() => guideCatalogTraitAdvice('development-trait-missing'), /fehlt/);
});

test('guide-only catalogue projection retains instance identities, active flags and personal entries without mutating a source', () => {
  const canonical = catalogTrait('neugier-vor-vorsicht');
  const personal = { id: 'personal-house-rule', name: 'Eigene belegte Prägung', description: 'Persönlicher Kontext.', active: true,
    mechanics: { skillModifiers: [{ name: 'Geschichte', bonus: 1 }] } };
  const source = { id: 'guide-source', biography: { html: '<p>Die Biografie bleibt erhalten.</p>' }, combatProfile: { quirks: [
    { id: 'archive-copy', developmentTraitId: canonical.id, active: false, mechanics: { skill: 90 } }, personal
  ] } };
  const before = structuredClone(source);
  const projected = withCurrentGuideTraits(source);
  assert.equal(projected.combatProfile.quirks[0].id, 'archive-copy');
  assert.equal(projected.combatProfile.quirks[0].developmentTraitId, canonical.id);
  assert.equal(projected.combatProfile.quirks[0].active, false);
  assert.deepEqual(projected.combatProfile.quirks[0].mechanics, normalizeCombatTrait(source.combatProfile.quirks[0]).mechanics);
  assert.equal(projected.combatProfile.quirks[0].mechanics.skill, 90, 'Eine persönliche Variante ist keine alte Standardkopie.');
  assert.deepEqual(projected.combatProfile.quirks[1], personal);
  assert.deepEqual(projected.biography, before.biography);
  assert.deepEqual(source, before);
});

test('proven old Gawain catalogue copies adopt current rules while personal variants keep their authored modifiers', () => {
  for (const id of ['neugier-vor-vorsicht', 'eigensinn']) {
    const canonical = catalogTrait(id);
    const previous = PREVIOUS_DEVELOPMENT_TRAITS.find(entry => entry.id === canonical.id);
    assert.ok(previous);
    const old = { ...structuredClone(previous), id: `archive-${id}`, developmentTraitId: canonical.id, active: false };
    const variant = structuredClone(old);
    variant.id = `personal-${id}`;
    variant.description = 'Eigene ausdrücklich vereinbarte Ausprägung.';
    variant.mechanics.skill = 6;
    const source = { combatProfile: { quirks: [old, variant] } }, before = structuredClone(source);
    const projected = withCurrentGuideTraits(source).combatProfile.quirks;
    assert.equal(projected[0].description, canonical.description);
    assert.deepEqual(projected[0].mechanics, normalizeCombatTrait(canonical).mechanics);
    assert.equal(projected[0].id, old.id);
    assert.equal(projected[0].active, false);
    assert.equal(projected[1].description, variant.description);
    assert.equal(projected[1].mechanics.skill, 6);
    assert.deepEqual(projected[1], normalizeCombatTrait(variant));
    assert.deepEqual(source, before);
  }
});

test('Gawain guide prose, passive cards and probe examples use the same current trait modifiers', () => {
  const source = characters.find(character => character.id === gawainGuide.id);
  const before = structuredClone(source);
  const model = buildGuideModel(gawainGuide, source);
  const curiosity = catalogTrait('neugier-vor-vorsicht'), obstinacy = catalogTrait('eigensinn');
  const plain = structuredClone(source);
  plain.combatProfile.quirks = plain.combatProfile.quirks.filter(trait => ![curiosity.id, obstinacy.id].includes(trait.id));
  const base = resolveCombatProfile(plain, { includeAiSnapshot: false });
  const skill = name => getSkillTotal(base, base.skills.find(entry => getSkillIdentity(entry.name) === getSkillIdentity(name)));
  const check = id => model.checkExamples.find(entry => entry.id === id);
  assert.equal(check('investigation').modifier, skill('Nachforschungen') + curiosity.mechanics.skillModifiers.find(entry => entry.name === 'Nachforschungen').bonus);
  assert.equal(check('save:dexterity').modifier, getSavingThrowTotal(base, 'dexterity') + curiosity.mechanics.saveAttributeModifiers.find(entry => entry.attributeKey === 'dexterity').bonus);
  assert.equal(check('save:charisma').modifier, getSavingThrowTotal(base, 'charisma') + obstinacy.mechanics.saveAttributeModifiers.find(entry => entry.attributeKey === 'charisma').bonus);
  assert.equal(check('persuasion').modifier, skill('Überzeugen') + obstinacy.mechanics.skillModifiers.find(entry => entry.name === 'Überzeugen').bonus);
  for (const trait of [curiosity, obstinacy]) {
    assert.equal(model.arsenal.entries.find(entry => entry.id === `trait:${trait.id}`).description, normalizeCombatTrait(trait).description);
  }
  const html = renderGuide(model);
  assert.match(html, /Proben mit den aktuellen Eigenschaften/);
  for (const example of model.checkExamples) assert.ok(html.includes(example.formula));
  assert.doesNotMatch(html, /\+3 auf Nachforschungen/);
  assert.doesNotMatch(html, /\+2 auf CHA-Rettungswürfe und −2 auf Überzeugen/);
  assert.deepEqual(source, before);
});
