import assert from 'node:assert/strict';
import test from 'node:test';
import { groupMerchants } from '../modules/merchants/merchant-groups.mjs';

test('Hauptgewerbe bestimmen die Gruppen, nicht weitere Begriffe im Angebot', () => {
  const tavern = Object.freeze({name:'Taverne',category:'gastwirtschaft',trade:'Taverne · Brauerei · Vertrieb'});
  const shop = Object.freeze({name:'Schneiderei',category:'handwerk',trade:'Kleidungshandel'});
  const groups = groupMerchants(Object.freeze([tavern,shop]));
  assert.deepEqual(groups.map(g=>g.key),['handwerk','gastwirtschaft']);
  assert.equal(groups[0].merchants[0],shop);
  assert.equal(groups[1].merchants[0],tavern);
});

test('Deutsche alphabetische Sortierung ändert weder die Quellenreihenfolge noch Texte', () => {
  const source=Object.freeze(['Zunft 10','Ährenhof','Zunft 2'].map(name=>Object.freeze({name,category:'handel',description:'Unveränderter Text'})));
  const group=groupMerchants(source)[0];
  assert.deepEqual(group.merchants.map(m=>m.name),['Ährenhof','Zunft 2','Zunft 10']);
  assert.deepEqual(source.map(m=>m.name),['Zunft 10','Ährenhof','Zunft 2']);
  assert.ok(group.merchants.every(m=>source.includes(m)));
});

test('Unzugeordnete Einträge bleiben vollständig erhalten und leere Gruppen verschwinden', () => {
  const missing={name:'Ungeklärt'};
  const custom={name:'Unbekannte Kategorie',category:'unbekannt'};
  assert.deepEqual(groupMerchants([]),[]);
  const groups=groupMerchants([missing,custom]);
  assert.deepEqual(groups.map(g=>g.key),['sonstige']);
  assert.equal(groups[0].merchants.length,2);
});
