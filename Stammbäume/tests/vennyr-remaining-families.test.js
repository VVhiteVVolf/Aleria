import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { withVennyrSourceCounterUpgrade } from '../assets/js/data/vennyr-source-counter-upgrade.js';
import { VENNYR_SOURCE_COUNTER_PATCHES } from '../assets/js/data/vennyr-source-counter-patches.js';
import { VENNYR_REMAINING_SOURCE_CATALOG } from '../assets/js/data/vennyr-remaining-source-catalog.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { PORTRAIT_PLACEHOLDERS, resolvePortraitSource } from '../assets/js/config/portrait-placeholders.js';

const expected = { caerdyn:[34,15,18,6,1], drewi:[56,26,29,10,2], gwanrhyd:[30,13,17,5,1], bochdew:[50,23,26,12,1], udgorn:[26,12,13,6,1], balauric:[24,11,12,4,1], morgryn:[36,16,19,8,1], gwenyen:[47,22,24,13,1], crwynog:[32,15,16,7,1] };
const records = Object.keys(expected).map(slug => getRegisteredFamily(`haus-${slug}`));
const audit = JSON.parse(fs.readFileSync(new URL('../assets/data/source-inventories/vennyr-remaining-families-2026-10-05.json',import.meta.url),'utf8'));

test('neun Quellenakten enthalten alle belegten Personen und Kanten unter ihrer bestehenden Herrschaft', () => {
  for(const record of records){
    const family=record.family;
    assertValidFamily(family);
    assert.deepEqual(['persons','partnerships','parentages','cadetBranches','timeJumps'].map(key=>family[key].length),expected[record.id.slice(5)],record.id);
    assert.equal(family.extensions.blankFamily,false);
    assert.equal(family.document.houseProfile.rankId,'unknown');
    assert.equal(family.extensions.chartLayoutPolicy,'strict-v1');
    assert.equal(new Set(family.persons.map(p=>p.worldPersonId)).size,family.persons.length);
    assert.ok(toFamilyChartData(family).diagnostics.every(d=>d.severity!=='error'),record.id);
    assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues,[],record.id);
    for(const branch of family.cadetBranches.filter(b=>b.linkType==='married-away')){
      assert.ok(!family.parentages.some(p=>p.partnershipId===branch.parentPartnershipId),branch.id);
      assert.equal(branch.extensions.chartAlignBelowPartnership,true);
    }
    for(const gap of family.timeJumps){
      const edges=family.parentages.filter(p=>p.extensions.timeJumpId===gap.id);
      assert.deepEqual(new Set(edges.map(p=>p.childId)),new Set(gap.childIds));
      assert.ok(edges.every(p=>p.type==='claimed'&&p.certainty==='probable'));
    }
  }
});

test('geteilte Weltpersonen und Partnerschaften bleiben in allen Gegenakten identisch', () => {
  const fields=['id','name','worldPersonId','sex','birth','death','status','portrait','portraitPlaceholder'];
  for(const record of records)for(const person of record.family.persons)for(const otherRecord of FAMILY_REGISTRY){
    const other=otherRecord.family.persons.find(p=>p.worldPersonId===person.worldPersonId);
    if(!other)continue;
    for(const field of fields)assert.equal(other[field],person[field],`${person.id}: ${field} / ${otherRecord.id}`);
  }
  for(const record of records)for(const pair of record.family.partnerships)for(const otherRecord of FAMILY_REGISTRY){
    const other=otherRecord.family.partnerships.find(p=>p.id===pair.id);
    if(other)assert.deepEqual(other.participantIds,pair.participantIds,`${pair.id} / ${otherRecord.id}`);
  }
});

test('Gwanrhyd wiederholt seine hausinterne Ehe nur für die Darstellung, ohne doppelte Weltpersonen oder Kinder', () => {
  const family=getRegisteredFamily('haus-gwanrhyd').family;
  const pair=family.partnerships.find(p=>p.participantIds.includes('gwyron-gwanrhyd')&&p.participantIds.includes('lilifer-gwanrhyd'));
  assert.ok(pair);
  assert.equal(family.persons.filter(p=>p.id==='lilifer-gwanrhyd').length,1);
  assert.deepEqual(family.persons.find(p=>p.id==='lilifer-gwanrhyd').extensions.chartRepeatForPartnershipIds,[pair.id]);
  assert.deepEqual(family.persons.find(p=>p.id==='gwyron-gwanrhyd').extensions.chartPartnerMirrorForPartnershipIds,[pair.id]);
  assert.equal(family.parentages.filter(p=>p.partnershipId===pair.id).length,3);
});

test('Illtyd und die auf Nutzerwunsch ergänzte Ilwen erhalten getrennte Identitäten und die richtigen Walwrs-Ehen', () => {
  const drewi=getRegisteredFamily('haus-drewi').family,walwrs=getRegisteredFamily('haus-walwrs').family;
  const illtyd=drewi.persons.find(p=>p.id==='illtyd-drewi'),ilwen=drewi.persons.find(p=>p.id==='ilwen-drewi');
  assert.deepEqual([illtyd.birth,illtyd.death,illtyd.sex],['1629','1700','male']);
  assert.deepEqual([ilwen.birth,ilwen.death,ilwen.sex],['1632','1689','female']);
  assert.notEqual(illtyd.worldPersonId,ilwen.worldPersonId);
  assert.equal(resolvePortraitSource(ilwen),PORTRAIT_PLACEHOLDERS.female);
  const addedParentage=drewi.parentages.find(p=>p.childId===ilwen.id);
  assert.equal(addedParentage.type,'claimed');assert.equal(addedParentage.certainty,'uncertain');
  for(const family of [drewi,walwrs]){
    assert.ok(family.partnerships.some(p=>p.participantIds.includes('ilwen-drewi')&&p.participantIds.includes('meinir-walwrs')));
    assert.ok(family.partnerships.some(p=>p.participantIds.includes('illtyd-drewi')&&p.participantIds.includes('gwendolen-walwrs')));
    assert.ok(!family.partnerships.some(p=>p.participantIds.includes('illtyd-drewi')&&p.participantIds.includes('meinir-walwrs')));
  }
});

test('die alte Walwrs-Akte trennt Illtyd und Ilwen beim Abgleich ohne Verlust lokaler Daten', () => {
  const registered=getRegisteredFamily('haus-walwrs').family;
  const stale=structuredClone(registered);
  stale.extensions.sourceRevision=2;
  stale.persons=stale.persons.filter(p=>p.id!=='ilwen-drewi');
  const illtyd=stale.persons.find(p=>p.id==='illtyd-drewi');
  Object.assign(illtyd,{birth:'1632',death:'1689',portrait:''});
  const neighbor=stale.persons.find(p=>!VENNYR_SOURCE_COUNTER_PATCHES['haus-walwrs'].persons[p.id]);
  neighbor.notes='Lokale Notiz';
  stale.partnerships=stale.partnerships.filter(p=>!p.participantIds.includes('gwendolen-walwrs')||!p.participantIds.includes('illtyd-drewi'));
  const meinirPair=stale.partnerships.find(p=>p.participantIds.includes('meinir-walwrs'));
  meinirPair.participantIds=meinirPair.participantIds.map(id=>id==='ilwen-drewi'?'illtyd-drewi':id);
  stale.cadetBranches=stale.cadetBranches.filter(b=>b.id!=='married-away-walwrs-illtyd-gwendolen-drewi');
  stale.persons.find(p=>p.id==='gwendolen-walwrs').title='Wegverheiratet an das Haus Gwaedlyd';
  stale.view.ancestorDepth=3;
  stale.lineage.crestSubtitle='Lokales Hauswort';
  const upgraded=resolveRegisteredFamilyUpgrade(registered,stale);
  assertValidFamily(upgraded);
  assert.equal(upgraded.persons.find(p=>p.id===neighbor.id).notes,'Lokale Notiz');
  assert.deepEqual(['birth','death','portrait'].map(field=>upgraded.persons.find(p=>p.id==='illtyd-drewi')[field]),
    ['birth','death','portrait'].map(field=>registered.persons.find(p=>p.id==='illtyd-drewi')[field]));
  assert.equal(upgraded.view.ancestorDepth,3);
  assert.equal(upgraded.lineage.crestSubtitle,'Lokales Hauswort');
  assert.equal(upgraded.persons.filter(p=>p.id==='ilwen-drewi').length,1);
  assert.deepEqual(upgraded.partnerships.find(p=>p.id===meinirPair.id).participantIds,['ilwen-drewi','meinir-walwrs']);
  assert.ok(upgraded.partnerships.some(p=>p.participantIds.includes('illtyd-drewi')&&p.participantIds.includes('gwendolen-walwrs')));
  assert.ok(upgraded.partnerships.some(p=>p.participantIds.includes('ywain-gwaedlyd')&&p.participantIds.includes('gwendolen-walwrs')));
  assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,upgraded),upgraded);
});

test('alle 25 unter 16 verstorbenen Kinder verwenden die Kindersilhouette; Ysolts Ergänzung bleibt gekennzeichnet', () => {
  const children=records.flatMap(r=>r.family.persons.filter(p=>p.portraitPlaceholder==='child'));
  assert.equal(children.length,25);
  for(const child of children){assert.equal(child.portrait,'');assert.ok(Number(child.death)-Number(child.birth)<16);assert.equal(resolvePortraitSource(child),PORTRAIT_PLACEHOLDERS.child);}
  const ysolt=getRegisteredFamily('haus-balauric').family.persons.find(p=>p.id==='ysolt-balauric');
  assert.equal(ysolt.birth,'1715');assert.match(ysolt.notes,/Nutzerwunsch.*plausibles/);
  const bochdew=getRegisteredFamily('haus-bochdew').family;
  assert.equal(bochdew.persons.find(p=>p.id==='dalvin-bochdew').sex,'male');
  assert.equal(bochdew.persons.find(p=>p.id==='endellion-arfordir').sex,'female');
});

test('Isottas leibliche Morgryn-Eltern und Wivern-Aufnahme bleiben getrennt', () => {
  const morgryn=getRegisteredFamily('haus-morgryn').family,wivern=getRegisteredFamily('haus-wivern').family;
  assert.deepEqual(new Set(morgryn.parentages.find(p=>p.childId==='isotta-morgryn').parentIds),new Set(['jeston-morgryn','maygann-gwenyen']));
  const foster=wivern.parentages.find(p=>p.childId==='isotta-morgryn');
  assert.ok(['foster','adoptive'].includes(foster.type));
  assert.ok(foster.parentIds.includes('brynmor-wivern'));
  assert.equal(morgryn.persons.find(p=>p.id==='isotta-morgryn').familyRole,'ward-away');
});

test('Leerakten werden ergänzt; spätere Gegenkorrekturen erhalten lokale Nachbardaten und sind wiederholungsfest', () => {
  for(const record of records){
    const stale=structuredClone(record.family);for(const key of ['persons','partnerships','parentages','cadetBranches','timeJumps'])stale[key]=[];
    stale.extensions.sourceRevision=1;stale.extensions.blankFamily=true;stale.extensions.localNote='Erhalten';stale.view.focusPersonId='';stale.lineage.founderPartnershipId='';
    const upgraded=resolveRegisteredFamilyUpgrade(record.family,stale);
    assert.equal(upgraded.persons.length,record.family.persons.length);assert.equal(upgraded.extensions.localNote,'Erhalten');
    assert.deepEqual(resolveRegisteredFamilyUpgrade(record.family,upgraded),upgraded);
  }
  for(const [id,patch] of Object.entries(VENNYR_SOURCE_COUNTER_PATCHES)){
    const registered=getRegisteredFamily(id).family,stale=structuredClone(registered);
    stale.extensions.sourceRevision=patch.revision-1;
    stale.view.focusPersonId=stale.persons.at(-1).id;stale.view.ancestorDepth=3;stale.lineage.crestSubtitle='Lokales Hauswort';
    const unaffected=stale.persons.find(p=>!patch.persons[p.id]);
    unaffected.notes='Lokale Nachbarnotiz';unaffected.title='Lokaler Titel';
    for(const [personId,fields]of Object.entries(patch.persons))for(const field of fields)stale.persons.find(p=>p.id===personId)[field]=field==='portrait'?'':'Veralteter Wert';
    const upgraded=resolveRegisteredFamilyUpgrade(registered,stale);
    assert.equal(upgraded.view.focusPersonId,stale.view.focusPersonId,id);
    assert.equal(upgraded.view.ancestorDepth,3,id);
    assert.equal(upgraded.lineage.crestSubtitle,'Lokales Hauswort',id);
    assert.equal(upgraded.persons.find(p=>p.id===unaffected.id).notes,'Lokale Nachbarnotiz',id);
    assert.equal(upgraded.persons.find(p=>p.id===unaffected.id).title,'Lokaler Titel',id);
    for(const [personId,fields]of Object.entries(patch.persons))for(const field of fields)assert.equal(upgraded.persons.find(p=>p.id===personId)[field],registered.persons.find(p=>p.id===personId)[field],`${id}: ${personId}/${field}`);
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,upgraded),upgraded,id);
    assert.equal(withVennyrSourceCounterUpgrade(registered),registered,id);
  }
});

test('neun Kriegerdarstellungen und Stammbaumgrafiken sind lokal mit Herkunft und Prüfsummen gesichert', () => {
  assert.equal(audit.sources.length,9);assert.equal(audit.warriorReferences.length,18);
  for(const asset of audit.warriorReferences){
    const bytes=fs.readFileSync(new URL('../../'+asset.path,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
  }
  for(const path of Object.values(VENNYR_REMAINING_SOURCE_CATALOG.portraits))assert.ok(fs.existsSync(new URL('../'+path,import.meta.url)),path);
});
