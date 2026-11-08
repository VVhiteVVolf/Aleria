import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildMaerllysModule, MAERLLYS_MODULE_ID } from '../modules/maerllys/maerllys-module.mjs';
import { MAERLLYS_GARMENTS, MAERLLYS_COLLECTION } from '../modules/maerllys/maerllys-collection.mjs';
import { MAERLLYS_STAFF, MAERLLYS_VACANCIES } from '../modules/maerllys/maerllys-hierarchy.mjs';
import { buildGoettlicheEleganz } from '../modules/goettliche-eleganz/eleganz-module.mjs';
import { HOUSE_MAERLLYS_FAMILY } from '../../Stammbäume/assets/js/data/house-maerllys-family.js';
const module=buildMaerllysModule();

test('Maerllys hat den vollständigen nativen Umfang der Eleganz mit eigenem Dienstfokus',()=>{
 const reference=buildGoettlicheEleganz();
 assert.equal(module.pages.length,reference.pages.length);
 assert.equal(module.pages[4].tradeCatalog.items.length,reference.pages[4].tradeCatalog.items.length);
 assert.equal(module.id,MAERLLYS_MODULE_ID);
 assert.equal(module.pages.filter(p=>p.sessionPage).length,1);
 assert.equal(module.pages.filter(p=>p.tradeCatalogPage).length,1);
 assert.equal(module.pages[3].hierarchy.trees.length,3);
 assert.match(module.subtitle,/Dienstkleidung/);
});

test('51 verschiedene Dienstgarnituren behalten ihre nativen Preise und Kategorien',()=>{
 assert.equal(MAERLLYS_GARMENTS.length,51);
 assert.equal(new Set(MAERLLYS_GARMENTS.map(x=>x.id)).size,51);
 assert.deepEqual(Object.values(MAERLLYS_COLLECTION).map(x=>x.length),[15,15,13,8]);
 for(const item of MAERLLYS_GARMENTS){assert.ok(Number.isSafeInteger(item.copper)&&item.copper>0);assert.ok(item.appearance.length>80);assert.ok(item.purpose.length>80);assert.equal(item.features.length,3);}
 assert.equal(Math.min(...MAERLLYS_GARMENTS.map(x=>x.copper)),18);
 assert.equal(Math.max(...MAERLLYS_GARMENTS.map(x=>x.copper)),1200);
 for(const item of module.pages[4].tradeCatalog.items){const source=MAERLLYS_GARMENTS.find(x=>x.id===item.id);const factor={KT:1,ST:100,GT:1000}[item.currencyCode];assert.equal(Math.round(Number(item.priceMin.replace(',','.'))*factor),source.copper);assert.equal(item.unit,'1 Garnitur');assert.deepEqual(item.attributes,[]);}
});

test('Nur die vier heutigen Werkstattangehörigen gehören zum Szenencast',()=>{
 assert.deepEqual(MAERLLYS_STAFF.map(x=>x.id),['iorwerth-maerllys','bronwen-swyll','geraint-maerllys','llio-falchdyn']);
 assert.equal(module.sessionCast.length,4);
 for(const id of module.sessionCast)assert.ok(typeof id==='string'&&id.startsWith('person--'));
 for(const id of ['nia-maerllys','rhys-maerllys']){const p=HOUSE_MAERLLYS_FAMILY.persons.find(x=>x.id===id);assert.ok(!module.sessionCast.includes(p.worldPersonId));}
});

test('Offene Stellen bleiben echte leere Hierarchiekarten ohne erfundene Personen',()=>{
 assert.equal(MAERLLYS_VACANCIES.length,11);
 const nodes=module.pages[3].hierarchy.trees.flatMap(t=>t.levels.flatMap(l=>l.nodes));
 const slots=nodes.filter(x=>x.id.startsWith('maerllys-post-'));
 assert.equal(slots.length,11);
 for(const slot of slots){assert.equal(slot.portrait,'');assert.match(slot.subtitle,/Unbesetzter Posten/);}
 assert.equal(slots.filter(x=>x.id.includes('lehrling')).length,2);
});

test('Alle sechs Seiten haben eigene Szenen und Dienstleistungen erklären den Arbeitgeberauftrag',()=>{
 assert.equal(new Set(module.pages.map(x=>x.image)).size,6);
 for(const page of module.pages)assert.match(page.image,/assets\/maerllys\/szenen\//);
 const services=module.pages[2].guild;
 assert.equal(services.abilities.length,6);
 assert.match(services.historyText,/Muster/);
 assert.match(services.historyText,/Anproben/);
 assert.match(services.contracts.map(x=>x.text).join(' '),/Nachbestellung|Folgearbeit/);
 assert.match(module.pages[1].guild.historyText,/Gwniwr/);
});

test('Modulcode verwendet weder Inlinehandler noch neue Gegenstands- oder Beschäftigungswrites',async()=>{
 const source=await readFile(new URL('../modules/maerllys/maerllys-module.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(source,/\bon(click|input|change)\s*=|firebase|setDoc\(|updateDoc\(/i);
 assert.equal(module.pages[4].tradeCatalog.items.filter(x=>x.category==='verwaltung').length,15);
});
