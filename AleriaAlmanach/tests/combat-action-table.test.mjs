import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderActionPicker } from '../modules/combat/ui/combat-action-picker.js';
import { renderActionTable } from '../modules/combat/ui/combat-action-table.js';
import { getActionGroups } from '../modules/combat/ui/combat-action-card.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { planCharacterArsenalRelease } from '../../firebase/functions/scripts/character-arsenal-release-model.mjs';

const load = async slug => JSON.parse(await readFile(new URL(`../../Charakter%20Archiv%20Exporte/${slug}.json`, import.meta.url),'utf8')).character;
const choices = html => [...html.matchAll(/data-combat-action-option="([^"]+)"/g)].map(match => match[1]);

test('Liste und Tabelle enthalten dieselben Handlungen und eine Spalte pro Bereich', async () => {
  for (const slug of ['asgeir-wolfshorn','ylva-wolfshorn','gildas-gafyr']) {
    const actor = resolveCombatProfile(await load(slug));
    const table = renderActionTable(actor, actor.selectedAction.id);
    assert.deepEqual(choices(table),choices(renderActionPicker(actor,actor.selectedAction.id)));
    assert.equal((table.match(/<th scope="col"/g)||[]).length,getActionGroups(actor).size);
    assert.ok(table.includes('data-action="available-actions-only"'));
    assert.doesNotMatch(table,/onclick=|oninput=/);
  }
});

test('Popup schützt Freitext und sperrt dieselben unzulässigen Handlungen', () => {
  const action={id:'blocked',name:'<Angriff>',kind:'technique',compatible:false,disabledReason:'Schild <fehlt>',costs:[{resourceId:'action',amount:1}]};
  const table=renderActionTable({name:'<Figur>',actions:[action]},'blocked');
  assert.match(table,/&lt;Angriff&gt;/);assert.match(table,/&lt;Figur&gt;/);assert.match(table,/Schild &lt;fehlt&gt;/);
  assert.match(table,/aria-pressed="true" disabled/);
});

test('Duncans vollständiges Meisterarsenal behält späte Techniken und besondere Angriffe jenseits von 60 Einträgen', async () => {
  const character=await load('duncan-gafyr');
  const patch=planCharacterArsenalRelease(character);
  const expected=patch['combatProfile.techniques'];
  assert.ok(expected.length>60);
  const actor=resolveCombatProfile(character);
  assert.equal(actor.techniques.length,expected.length);
  for(const id of ['combat-style-drachentanz-vollendeter-waffenmeister','class-special-teulu-mastery']) {
    assert.ok(actor.techniques.some(technique=>technique.id===id),id);
    assert.ok(actor.actions.some(action=>action.sourceId===id),id);
    assert.ok(choices(renderActionTable(actor,actor.selectedAction.id)).includes(`technique:${id}`),id);
  }
});

test('Bestandsabgleich ergänzt Klassenarsenale ohne Ressourcen, Besitz oder individuelle Techniken zu ändern', async () => {
  const character=await load('asgeir-wolfshorn');
  character.combatProfile.resources.forEach(resource=>{resource.current=0;});
  const custom={id:'my-personal-move',name:'Eigene Auslegung',notes:'Behalten'};
  character.combatProfile.techniques.push(custom);
  const before=structuredClone(character);
  const patch=planCharacterArsenalRelease(character);
  assert.ok(patch);
  assert.ok(Object.keys(patch).every(field=>['combatProfile.techniques','combatProfile.abilities','combatProfile.classTraining'].includes(field)));
  assert.deepEqual(character,before);
  assert.deepEqual(patch['combatProfile.techniques'].find(t=>t.id===custom.id),custom);
  for(const [path,value] of Object.entries(patch)) character.combatProfile[path.split('.')[1]]=value;
  assert.equal(planCharacterArsenalRelease(character),null);
  assert.deepEqual(character.combatProfile.resources,before.combatProfile.resources);
  assert.deepEqual(character.combatProfile.hitPoints,before.combatProfile.hitPoints);
  assert.deepEqual(character.inventory,before.inventory);
  assert.equal(planCharacterArsenalRelease({combatProfile:{progression:{level:1}}}),null);
});
