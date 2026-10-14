import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { gaisGuide } from '../modules/gais-guide.mjs';
import { GUIDE_REGISTRY } from '../modules/guide-registry.mjs';
import { buildGuideModel } from '../modules/guide-model.mjs';
import { renderGuide } from '../modules/guide-template.mjs';
import { getCharacterGameplayGuide } from '../../AleriaAlmanach/modules/characters/gameplay-guide-link.js';
import { GAIS_COMPANION } from '../../AleriaAlmanach/modules/creatures/catalog/gais-companion.js';
import { sanitizeCreature } from '../../AleriaAlmanach/modules/creatures/creature-model.js';
import { planGameplayGuideRelease } from '../../firebase/functions/scripts/gameplay-guide-release-model.mjs';
import { loadHorseBreedingData } from '../../Bestiarium/modules/horse-breeding/horse-breeding-data.mjs';
import { resolveCombatProfile } from '../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { resolveGuideTaxonomy, buildGuideDirectoryTree } from '../modules/guide-taxonomy.mjs';
import { renderActionPreview } from '../modules/guide-arsenal-view.mjs';
import { entryIcon, isCrusaderKingsIcon } from '../modules/guide-assets.mjs';
const root = new URL('../../', import.meta.url);
const { characters } = JSON.parse(await readFile(new URL('CharakterDatenbank/generated/characters.snapshot.json', root), 'utf8'));

for (const registration of GUIDE_REGISTRY) {
const g = (await import(`../modules/${registration.editorialModule}`))[registration.editorialExport];
test(`${g.name}: legal action budgets, existing techniques, owned companions and working local links`, async () => {
  const character = characters.find(c => c.id === g.id);
  const before = structuredClone(character);
  const model = buildGuideModel(g, character);
  assert.deepEqual(character, before, 'A guide must not alter resources, equipment or saved combat data');
  const profile = resolveCombatProfile(character, { includeAiSnapshot: false });
  const ids = new Set(model.arsenal.entries.map(entry => entry.id));
  assert.equal(ids.size, model.arsenal.entries.length);
  for (const entry of model.arsenal.entries.filter(e => e.kind === 'weapon')) {
    assert.ok(entry.variants.every(v => `weapon:${v.weaponId}` === entry.id), `${entry.name}: misleading weapon loadout`);
  }
  for (const [kind, entries] of [['weapon',profile.weapons],['technique',profile.techniques],['ability',profile.abilities],['trait',profile.quirks]]) {
    for (const entry of entries) assert.ok(ids.has(`${kind}:${entry.id}`), `Arsenal missing ${kind}: ${entry.name}`);
  }
  assert.deepEqual(model.taxonomy.path.slice(0,2).map(n => n.label), ['Cenyr','Celtigerns Wacht']);
  assert.equal(model.taxonomy.fullPath.length,5);
  assert.equal(model.taxonomy.familyId, registration.familyId);
  if (g.slug === 'ylva') {
    assert.equal(model.name,'Lady Ylva Bleiddorn / Wolfshorn');
    assert.equal(model.taxonomy.path.at(-1).label,'Haus Bleiddorn / Wolfshorn');
    const lever = model.arsenal.entries.find(e => e.name === 'Schafthebel');
    assert.ok(lever.variants.every(v => v.damage === 'Kein direkter Schaden' && v.save === 'KRF SG 14'));
    assert.ok(lever.variants.every(v => v.weaponId === 'ylva-speer'));
    const double = model.arsenal.entries.find(e => e.name === 'Der fallende Dorn').variants.find(v => v.id === 'ylva-speer:foot:two-handed');
    assert.equal(double.attack,'1W20 +7'); assert.equal(double.damage,'1W10+5'); assert.equal(double.followUp.enhancedDamage,'2W10+5');
  } else if (g.slug === 'gais') {
    const mounted = model.arsenal.entries.find(e => e.name === 'Sattelantritt');
    assert.ok(mounted.variants.length && mounted.variants.every(v => v.mounted));
    const counter = model.arsenal.entries.find(e => e.name === 'Lauernde Klaue');
    assert.ok(counter.variants.every(v => v.counter && v.attack === 'Automatisch' && v.damage === 'Kein direkter Schaden'));
  } else if (g.slug === 'gawain') {
    assert.equal(model.arsenal.entries.length,33);
    const sword = model.arsenal.entries.find(e => e.id === 'weapon:gawain-draig-knightly-sword');
    assert.equal(sword.variants.find(v => v.grip === 'two-handed').attack, '1W20 +4');
    assert.equal(sword.variants.find(v => v.grip === 'two-handed').damage, '1W10+3');
    const light = model.arsenal.entries.find(e => e.name === 'Erster Hieb des Jungdrachens');
    assert.ok(light.variants.every(v => v.damage === '1W4+1'));
    const perfume = model.arsenal.entries.find(e => e.name === 'Liebt Düfte');
    const preview = renderActionPreview(perfume,model.arsenal);
    assert.match(preview,/1× pro Tag/); assert.match(preview,/kein passendes Verbrauchsitem/); assert.match(preview,/Voraussetzungen/);
    assert.ok(ids.has('condition:gawain-strenge-gerueche'));
    const tanor = model.companions.find(c => c.id === 'companion-tanor');
    assert.deepEqual(tanor.weaponActions.map(a => a.name), ['Tritt','Biss']);
    assert.ok(tanor.weaponActions.every(a => a.damage === '1W4+3' && a.costs[0].resourceId === 'action'));
    assert.equal(getCharacterGameplayGuide({identity:{worldPersonId:registration.worldPersonId}}),'/Gameplay%20Guide/gawain.html');
    assert.throws(()=>buildGuideModel({...g,permanentConditionIds:['transient-or-missing']},character),/Dauerhafter Regeleintrag fehlt/);
  }
  assert.equal(model.combos.length, 6);
  assert.equal(getCharacterGameplayGuide(character), `/Gameplay%20Guide/${g.slug}.html`);
  const html = renderGuide(model) + model.arsenal.entries.map(entry => renderActionPreview(entry,model.arsenal)).join('');
  assert.ok(html.includes('data-action="filter-style"')); assert.ok(!html.includes('onclick='));
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    assert.equal(isCrusaderKingsIcon(match[1]),false, `Forbidden Crusader Kings icon: ${match[1]}`);
    if (/^(#|https?:)/.test(match[1])) continue;
    const path = decodeURIComponent(match[1].split('#')[0]);
    const base = path.startsWith('/') ? root : new URL('Gameplay%20Guide/', root);
    await access(new URL(path.replace(/^\//, ''), base));
  }
  assert.equal(planGameplayGuideRelease(character), null, 'Repeated preparation must be a no-op');
});
}

test('Guide-specific icon policy rejects inherited Crusader Kings icons', () => {
  for (const source of ['/IconOrdner/Traits%20Icon/Crusader.png','../IconOrdner/Cktraits/Trait_education.png','/IconOrdner/CK3%20icons%20alt/Martial.png']) {
    assert.equal(isCrusaderKingsIcon(source),true);
    assert.match(entryIcon('ability',{name:'Kulturelle Ausbildung',icon:source}),/training-and-heritage-ui.png$/);
  }
  assert.equal(isCrusaderKingsIcon('/IconOrdner/Zauber%20Icons/Baldurs%20Gate/Würfel%20Icons/D20.png'),false);
});

test('Family-free guides use stable group paths; secondary groups do not displace a family', () => {
  const group = { id:'test-company',path:[{id:'kingdom:cenyr',label:'Cenyr'},{id:'windreiter',label:'Windreiter'},{id:'schwarzfische',label:'Schwarzfische'}] };
  const taxonomy = resolveGuideTaxonomy({slug:'fixture',groupPaths:[group]}, {}, []);
  assert.equal(taxonomy.kind,'group'); assert.deepEqual(taxonomy.path,group.path);
  const guide = {slug:'fixture',taxonomy};
  assert.equal(buildGuideDirectoryTree([guide])[0].children[0].children[0].label,'Schwarzfische');
  const family = {id:'family-a',title:'Haus A',hierarchy:[{level:'kingdom',slug:'cenyr',title:'Cenyr'},{level:'family',slug:'family-a',title:'Haus A'}],family:{persons:[{id:'p',worldPersonId:'person-p'}],houses:[]}};
  const primary = resolveGuideTaxonomy({slug:'fixture',familyId:'family-a',worldPersonId:'person-p',groupPaths:[group]}, {}, [family]);
  assert.equal(primary.kind,'family'); assert.equal(primary.path.at(-1).id,'family-a');
  assert.equal(buildGuideDirectoryTree([{slug:'fixture',taxonomy:primary}],'group')[0].children[0].id,'windreiter');
  assert.throws(()=>resolveGuideTaxonomy({slug:'unclassified'},{},[]),/Familie oder Gruppenzuordnung/);
});

test('Stored prose stays text in preview cards', () => {
  const html = renderActionPreview({name:'<script>bad()</script>',category:'Test',description:'<img src=x onerror=bad()>',variants:[],passive:true}, {passiveIcon:''});
  assert.ok(html.includes('&lt;script&gt;')); assert.ok(!html.includes('<script>')); assert.ok(!html.includes('<img src=x'));
});

test('Edelsale is the existing matrix crossing, Saithor has a real anchored reference and owner', async () => {
  const data = await loadHorseBreedingData();
  const matches = data.crossings.filter(c => [c.mareId, c.sireId].sort().join('|') === 'ceffyl|sale');
  assert.equal(matches.length, 1); assert.equal(matches[0].name, 'Edelsale'); assert.equal(matches[0].bestiaryId, 'edelsale');
  const c = sanitizeCreature(GAIS_COMPANION);
  assert.equal(c.bestiaryReference.name, 'Edelsale'); assert.ok(c.bestiaryReference.url.includes('#'));
  assert.equal(c.level, 3); assert.equal(c.itemOrigin.ownerCharacterId, gaisGuide.id);
  assert.equal(getCharacterGameplayGuide({ id: 'another-character', name: 'Gais Wyrm' }), '');
});

test('grant only patches personal techniques, new companion and the horse biography; Gais combat remains intact', () => {
  const source = structuredClone(characters.find(c => c.id === gaisGuide.id));
  source.inventory.items = source.inventory.items.filter(i => i.creatureId !== GAIS_COMPANION.id);
  source.inventory.companions = source.inventory.companions.filter(i => i.creatureId !== GAIS_COMPANION.id);
  const before = structuredClone(source);
  const patch = planGameplayGuideRelease(source);
  assert.deepEqual(source, before); assert.ok(patch.inventory);
  assert.ok(Object.keys(patch).every(k => ['inventory','biography'].includes(k)));
  for (const item of before.inventory.items) assert.deepEqual(patch.inventory.items.find(i => i.id === item.id), item);
});
