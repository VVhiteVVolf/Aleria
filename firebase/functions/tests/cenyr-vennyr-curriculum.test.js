import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeCharacterCombatProfile as browserNormalize } from '../../../AleriaAlmanach/modules/combat/combat-profile-model.js';
import { sanitizeCharacterCombatProfile as serverNormalize } from '../src/generated/combat/combat-profile-model.js';
import { resolveCombatProfile as browserResolve } from '../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { resolveCombatProfile as serverResolve } from '../src/generated/combat/combat-profile-resolver.js';
import { getVennyrClassProgression as browserVennyr } from '../../../AleriaAlmanach/modules/classes/vennyr/vennyr-class-progression.js';
import { getVennyrClassProgression as serverVennyr } from '../src/generated/classes/vennyr/vennyr-class-progression.js';
import { getCenyrClassProgression as browserCenyr } from '../../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-progression.js';
import { getCenyrClassProgression as serverCenyr } from '../src/generated/classes/cenyr/cenyr-class-progression.js';
import { getCombatTechniqueIconSource } from '../../../AleriaAlmanach/modules/combat-styles/combat-technique-icons.js';

function technique(classId, slug) {
  const projection = ['cantref', 'teulu'].includes(classId) ? browserCenyr : browserVennyr;
  const entry = projection(classId, 20).attackCatalog.find(entry => entry.id.endsWith(`-${slug}`));
  assert(entry, `${classId}: ${slug}`);
  return { ...entry, icon: getCombatTechniqueIconSource(entry), active: true, live: true };
}
const weapon = (weaponType, weaponProfileId, name = weaponProfileId) => ({
  id: 'held-weapon', weaponType, weaponProfileId, name, damageFormula: '1d10', equipped: true
});

function fixture(source, held, { mounted = false, shield = false, classId = 'teulu' } = {}) {
  const sourceClass = source.cultureTraining?.allowedClassIds?.[0] || 'cantref';
  const normalized = browserNormalize({
    identity: { ancestry: 'Cenyr', archetype: classId }, templateSelections: { classId },
    progression: { level: 20, development: { mode: 'purchase', purchases: [{ techniqueId: source.id, classId: sourceClass, cost: 7, level: 20 }] } },
    hitPoints: { current: 9, maximumOverride: 50 },
    combat: { mounted }, armorClass: { shieldBonus: shield ? 1 : 0 },
    techniques: [source], weapons: [held],
    resources: [{ id: 'special-action', name: 'Besondere Aktion', current: 1, maximum: 6, scope: 'persistent' }]
  });
  // Persistent exhaustion must survive a read-only projection. The three
  // per-comment pools get their active values from scene-history overlay.
  normalized.resources.forEach(resource => { if (resource.id !== 'special-action') resource.current = 0; });
  return { id: 'curriculum-parity', name: 'Curriculum parity', combatProfile: normalized,
    inventory: { items: [{ id: 'retained-item', name: 'Persönlicher Gegenstand', quantity: '3' }] },
    priorCombatReceipt: { damage: { total: 13 }, version: 'historical-fixture' } };
}

function assertParity(character, source) {
  const before = structuredClone(character);
  assert.deepEqual(serverNormalize(character.combatProfile), browserNormalize(character.combatProfile));
  const options = { actionId: `technique:${source.id}`, includeAiSnapshot: false };
  const client = browserResolve(character, options), server = serverResolve(character, options);
  assert.deepEqual(server.actions, client.actions, 'Action formula, costs, target cap and compatibility agree');
  assert.deepEqual(server.selectedAction, client.selectedAction);
  assert.deepEqual(server.actionCosts, client.actionCosts);
  assert.deepEqual(server.resourceCosts, client.resourceCosts);
  assert.deepEqual(server.resources, client.resources);
  const persistent = resources => resources.filter(resource => resource.scope !== 'comment').map(({ id, current }) => ({ id, current }));
  assert.deepEqual(persistent(server.resources), persistent(before.combatProfile.resources));
  assert.equal(server.hitPoints.current, before.combatProfile.hitPoints.current);
  const clientTechnique = client.techniques.find(entry => entry.id === source.id);
  const serverTechnique = server.techniques.find(entry => entry.id === source.id);
  assert.equal(serverTechnique.icon, source.icon);
  assert.equal(serverTechnique.weaponLabel, clientTechnique.weaponLabel);
  assert.deepEqual(serverTechnique.cultureTraining, clientTechnique.cultureTraining);
  assert.equal(serverTechnique.combatStyleFormId, source.combatStyleFormId);
  assert.deepEqual(character, before, 'Normalization and resolution do not mutate source, inventory or historical receipt');
  return server.selectedAction;
}

test('expanded Cenyr and Vennyr catalogues are identical in generated server mechanics', () => {
  for (const classId of ['morwyr', 'rhyfelwyr', 'ceidwyn', 'rhiddwyr', 'derwyn', 'milwr']) {
    assert.deepEqual(serverVennyr(classId, 20), browserVennyr(classId, 20), classId);
  }
  for (const classId of ['teulu', 'cantref', 'uchelwyr', 'helwyr', 'arthwyr', 'barddwyr']) {
    assert.deepEqual(serverCenyr(classId, 20), browserCenyr(classId, 20), classId);
  }
});

test('a purchased Rhiddwyr charge requires mounted status on browser and server without spending resources', () => {
  const source = technique('rhiddwyr', 'streifender-anritt');
  const held = weapon('polearm', 'rider-spear', 'Reiterspieß');
  const foot = assertParity(fixture(source, held), source);
  assert.equal(foot.compatible, false);
  assert.match(foot.disabledReason, /beritten/);
  const riding = assertParity(fixture(source, held, { mounted: true }), source);
  assert.equal(riding.compatible, true, 'Foreign-class purchase retains its equipment requirements and remains usable');
  assert.equal(riding.maximumTargets, 1);
  assert.deepEqual(riding.costs.map(cost => cost.resourceId), ['action', 'bonus-action']);
});

test('Vennyr precise weapon routes survive normalization and reject the wrong weapon on both runtimes', () => {
  const bow = technique('ceidwyn', 'gischtpfeil');
  assert.equal(assertParity(fixture(bow, weapon('bow', 'shortbow', 'Kurzbogen')), bow).compatible, true);
  const wrongBow = assertParity(fixture(bow, weapon('bow', 'longbow', 'Langbogen')), bow);
  assert.equal(wrongBow.compatible, false);
  assert.match(wrongBow.disabledReason, /Kurzbogen/);
  const harpoon = technique('morwyr', 'leinenwurf');
  assert.equal(assertParity(fixture(harpoon, weapon('spear', 'harpoon', 'Harpunenspeer')), harpoon).compatible, true);
  assert.equal(assertParity(fixture(harpoon, weapon('spear', 'spear', 'Speer')), harpoon).compatible, false);
  const staff = technique('derwyn', 'saphirkreis');
  assert.equal(assertParity(fixture(staff, weapon('staff', 'staff', 'Kampfstab'), { classId: 'derwyn' }), staff).compatible, true);
  const shielded = assertParity(fixture(staff, weapon('staff', 'staff', 'Kampfstab'), { classId: 'derwyn', shield: true }), staff);
  assert.equal(shielded.compatible, false);
  assert.match(shielded.disabledReason, /beide Hände/);
});

test('the Cantref halberd receives the area damage cap while the single-target spear route retains training damage', () => {
  const source = technique('cantref', 'sechszackige-linie');
  const halberd = assertParity(fixture(source, weapon('polearm', 'halberd', 'Hellebarde'), { classId: 'cantref' }), source);
  const partisan = assertParity(fixture(source, weapon('polearm', 'partisan', 'Partisane'), { classId: 'cantref' }), source);
  assert.equal(halberd.compatible, true);
  assert.equal(halberd.maximumTargets, 4);
  assert.equal(halberd.formula, '1d10+1d6', 'Area expansion caps the additional die and removes the single-target training die');
  assert.equal(partisan.maximumTargets, 1);
  assert.equal(partisan.formula, '3d10');
  assert.deepEqual(halberd.costs, partisan.costs, 'Target count does not introduce hidden extra actions');
  const duelling = technique('cantref', 'speerdrache-fliessende-eroeffnung');
  assert.equal(assertParity(fixture(duelling, weapon('polearm', 'halberd', 'Hellebarde'), { classId: 'cantref' }), duelling).maximumTargets, 1,
    'Explicit single-target spear techniques never become an area attack');
});
