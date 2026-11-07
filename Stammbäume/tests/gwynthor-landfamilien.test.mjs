import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LAND_FAMILIEN_ROSTER as roster } from '../assets/js/data/gwynthor-fleischsammler/landfamilien-roster.mjs';
import { GWYNTHOR_FLEISCHSAMMLER_FAMILIES as families } from '../assets/js/data/gwynthor-fleischsammler/family-records.js';
import { assertValidFamily, normalizeFamily } from '../assets/js/domain/family-schema.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';

const baseline = JSON.parse(readFileSync(new URL('./fixtures/gwynthor-landfamilien-revision1.json', import.meta.url), 'utf8'));
const current = slug => families.find(family => family.document.id === `haus-${slug}`);
const own = family => family.persons.filter(person => person.extensions.landfamilienResident === true);

test('exact household totals, historical founders and serial gaps have separate meanings', () => {
  for (const [slug, count] of [['tirfelyn',16], ['helfaen',5], ['marchwern',14]]) {
    const family = current(slug);
    assert.deepEqual(assertValidFamily(family).diagnostics, []);
    assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
    assert.equal(own(family).filter(person => person.status === 'alive').length, count);
    assert.equal(family.persons.filter(person => person.name.startsWith('Unbekannt')).length, 2);
    assert.ok(family.persons.filter(person => person.name.startsWith('Unbekannt')).every(person => person.status === 'dead' && person.birth === '' && person.death === '????'));
    assert.equal(family.timeJumps.length, 1);
    const gap = family.timeJumps[0];
    assert.equal(gap.parentPartnershipId, family.lineage.founderPartnershipId);
    for (const id of gap.childIds) {
      const link = family.parentages.find(parentage => parentage.childId === id);
      assert.equal(link.type, 'claimed');
      assert.equal(link.extensions.timeJumpId, gap.id);
    }
    assert.equal(new Set(family.persons.map(person => person.worldPersonId)).size, family.persons.length);
  }
});

test('all earlier identities and biological relationships are preserved', () => {
  for (const slug of ['tirfelyn','helfaen','marchwern']) {
    const family = current(slug), old = baseline.find(record => record.document.id === family.document.id);
    for (const person of old.persons) {
      const next = family.persons.find(record => record.id === person.id);
      assert.equal(next.worldPersonId, person.worldPersonId);
      assert.equal(next.name, person.name);
      assert.equal(next.sex, person.sex);
    }
    for (const marriage of old.partnerships) assert.deepEqual(family.partnerships.find(record => record.id === marriage.id).participantIds, marriage.participantIds);
    for (const parentage of old.parentages) assert.deepEqual(family.parentages.find(record => record.id === parentage.id).parentIds, parentage.parentIds);
  }
});

test('ages are based on 1740 and biological parenthood is plausible', () => {
  for (const family of families.filter(family => ['haus-tirfelyn','haus-helfaen','haus-marchwern'].includes(family.document.id))) {
    const people = new Map(family.persons.map(person => [person.id,person]));
    for (const parentage of family.parentages.filter(parentage => parentage.type === 'biological')) {
      for (const parentId of parentage.parentIds) assert.ok(Number(people.get(parentage.childId).birth)-Number(people.get(parentId).birth)>=18);
    }
  }
  for (const id of ['caradog-tirfelyn','eudaf-tirfelyn']) assert.ok(1740-Number(current('tirfelyn').persons.find(person=>person.id===id).birth)>50);
  assert.equal(roster.families.flatMap(family=>family.persons).length,36);
});

test('Ceridwen and Gorwyn share the identical ended engagement in both records', () => {
  const tir = current('tirfelyn'), hel = current('helfaen');
  const left = tir.partnerships.find(partnership=>partnership.id===roster.engagement.id);
  const right = hel.partnerships.find(partnership=>partnership.id===roster.engagement.id);
  assert.deepEqual(left,right);
  assert.equal(left.type,'engagement');
  assert.equal(normalizeFamily(tir).partnerships.find(partnership=>partnership.id===left.id).type,'engagement');
  assert.equal(left.status,'ended');
  assert.equal(left.end,'1740');
  for (const id of left.participantIds) {
    const first=tir.persons.find(person=>person.id===id), second=hel.persons.find(person=>person.id===id);
    for (const field of ['worldPersonId','name','birth','death','status','portrait']) assert.equal(first[field],second[field]);
  }
  const ceridwen=tir.persons.find(person=>person.id==='ceridwen-tirfelyn');
  assert.equal(ceridwen.status,'dead');
  assert.equal(ceridwen.death,'1740');
  assert.match(ceridwen.notes,/vor wenigen Wochen/);
  assert.match(ceridwen.notes,/folgenden Morgen/);
  assert.ok(!tir.parentages.some(parentage=>parentage.partnershipId===left.id));
  assert.equal(tir.persons.find(person=>person.id==='gorwyn-helfaen').extensions.landfamilienResident,false);
  assert.match(tir.persons.find(person=>person.id==='gorwyn-helfaen').title,/Auswärtiger Verlobter.*Jagdhaus Helfaen/);
});

test('known source defaults upgrade while personal notes, ages and biographies survive', () => {
  for (const slug of ['tirfelyn','helfaen','marchwern']) {
    const family=current(slug), old=baseline.find(record=>record.document.id===family.document.id);
    const upgraded=resolveRegisteredFamilyUpgrade(family,old);
    assert.equal(upgraded.lineage.founderPartnershipId,family.lineage.founderPartnershipId);
    assert.equal(upgraded.extensions.sourceRevision,2);
    assert.deepEqual(upgraded.extensions.houseBiographyModule,family.extensions.houseBiographyModule);
    for (const person of own(family)) assert.equal(upgraded.persons.find(record=>record.id===person.id).birth,person.birth);
    if(slug==='tirfelyn') {
      const ceridwen=upgraded.persons.find(person=>person.id==='ceridwen-tirfelyn');
      assert.equal(ceridwen.status,'dead');
      assert.equal(ceridwen.death,'1740');
      assert.equal(ceridwen.portrait,'/AleriaAlmanach/assets/gwynthor-landfamilien/portraits/tirfelyn/ceridwen-tirfelyn.png');
    }
    if(slug!=='marchwern') assert.equal(upgraded.partnerships.find(partnership=>partnership.id===roster.engagement.id).type,'engagement');
    const edited=structuredClone(old);
    edited.persons[0].notes='Eigene Forschung bleibt erhalten';
    edited.persons[0].birth='1679';
    edited.extensions.houseBiographyModule.house.biographyText='Eigene Hauschronik';
    const preserved=resolveRegisteredFamilyUpgrade(family,edited);
    assert.equal(preserved.persons.find(record=>record.id===old.persons[0].id).notes,'Eigene Forschung bleibt erhalten');
    assert.equal(preserved.persons.find(record=>record.id===old.persons[0].id).birth,'1679');
    assert.equal(preserved.extensions.houseBiographyModule.house.biographyText,'Eigene Hauschronik');
    assert.deepEqual(resolveRegisteredFamilyUpgrade(family,upgraded),upgraded);
  }
});

test('five uninvolved families remain byte-equivalent as structured source records', () => {
  for (const before of baseline.filter(family=>!['haus-tirfelyn','haus-helfaen','haus-marchwern'].includes(family.document.id))) {
    assert.deepEqual(families.find(family=>family.document.id===before.document.id),before);
  }
});

test('portraits and house pages use one source roster with correct family appearance', () => {
  for (const family of roster.families) {
    assert.equal(family.persons.filter(person=>person.primary).length,3);
    for (const person of family.persons) {
      assert.equal(person.portrait,`${roster.portraitRoot}/${family.slug}/${person.id}.png`);
      assert.equal(person.birth,String(1740-person.age));
      assert.ok(person.pose && person.hairstyle && person.bio && person.workGroup);
      if(person.familyRole==='married') assert.ok(!person.name.includes(' '));
      if(family.slug==='helfaen') assert.match(person.hairColor,/lockig/);
    }
  }
});
