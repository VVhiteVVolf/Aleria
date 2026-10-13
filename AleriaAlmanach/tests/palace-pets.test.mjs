import test from 'node:test';
import assert from 'node:assert/strict';
import { DRAIG_PALACE_PETS } from '../modules/creatures/catalog/draig-palace-pets.js';
import { IDWAL_SHIP_CATS } from '../modules/creatures/catalog/idwal-ship-cats.js';
import { sanitizeCreature } from '../modules/creatures/creature-model.js';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { attachCreatureToInventory, detachCreatureFromInventory } from '../modules/creatures/creature-companion-link.js';

test('palace pets resolve the actual breed profiles and retain both sides of the mixed ancestry', () => {
  const [cat,dog] = DRAIG_PALACE_PETS.map(sanitizeCreature);
  assert.equal(cat.bestiaryReference.name, 'Lethin');
  assert.equal(cat.level, 2);
  assert.equal(dog.level, 3);
  assert.equal(dog.bestiaryReference, null);
  assert.deepEqual(dog.bestiaryAncestry.references.map(r=>r.name).sort(), ['Rhedwyr','Trywydd']);
  assert.match(cat.biography.sections[0].text, /Bethy/);
  assert.match(dog.biography.history, /Roisin Cumhail/);
  for (const c of [cat,dog]) {
    const owner={id:c.itemOrigin.ownerCharacterId,name:c.itemOrigin.ownerCharacterName,inventory:{items:[],companions:[]}};
    const inventory=attachCreatureToInventory(owner,c);
    assert.equal(inventory.items[0].creatureId,c.id);
    assert.deepEqual(attachCreatureToInventory({...owner,inventory},c),inventory);
  }
});

test('Uffel belongs to the crew and removing his old ownership preserves Bwmbo and all other state', () => {
  const [bwmbo,uffel]=IDWAL_SHIP_CATS.map(sanitizeCreature);
  assert.equal(uffel.itemOrigin,null);
  assert.equal(uffel.classification.location,'Tiefenwyrm');
  assert.match(uffel.biography.bonds,/Kein persönlicher Besitzer/);
  const owner={id:bwmbo.itemOrigin.ownerCharacterId,inventory:{money:17,items:[{id:'uffel-item',creatureId:uffel.id},{id:'sword'}],companions:[{id:'uffel-card',creatureId:uffel.id,inventoryItemId:'uffel-item'},{id:'bwmbo-card',creatureId:bwmbo.id}]}};
  const inventory=detachCreatureFromInventory(owner,uffel.id);
  assert.deepEqual(inventory,{money:17,items:[{id:'sword'}],companions:[{id:'bwmbo-card',creatureId:bwmbo.id}]});
  assert.deepEqual(detachCreatureFromInventory({...owner,inventory},uffel.id),inventory);
  assert.equal(owner.inventory.items.length,2);
});

test('the existing horse IDs identify Freyas Eldfaxi and Fenrirs Gaul in Celtigerns Wacht', () => {
  for(const [id,owner] of [['companion-eldfaxi','Freya Skald'],['companion-gaul','Fenrir Varulv']]){
    const c=getBuiltinCreatureTemplates().find(c=>c.id===id);
    assert.equal(c.itemOrigin.ownerCharacterName,owner);
    assert.equal(c.classification.location,'Celtigerns Wacht');
    assert.equal(c.bestiaryReference.name,'Hest');
  }
});
