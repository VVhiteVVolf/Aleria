import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ARGALL_CAPTAIN_PEOPLE } from '../../AleriaAlmanach/modules/fleischsammler-argall/household.mjs';
import { HOUSE_ARGALL_FAMILY } from '../assets/js/data/house-argall-family.js';
import { ARGALL_GWYNTHOR_MARRIAGE_ID, ARGALL_GWYNTHOR_UNION_ID } from '../assets/js/data/argall-gwynthor-household.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { createFamilyGraph } from '../assets/js/domain/family-graph.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { createFamilyChartOverview } from '../assets/js/adapters/family-chart-overview-policy.js';
import { getPersonBiographyModule } from '../assets/js/modules/person-biography/person-biography-model.js';
import { buildRelationshipMatrix } from '../assets/js/modules/relationship-matrix/relationship-matrix-model.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { reconcileFamilyWithProjectOrigin } from '../assets/js/modules/family-sync/project-origin-reconciliation.js';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { HOUSE_CONTENT } from '../../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Argall/haus.content.mjs';
import { createHousePageData, createHouseBiography } from '../../Familien Häuser und Clans/modules/house-content/house-content-outputs.mjs';

const family = assertValidFamily(HOUSE_ARGALL_FAMILY).family;
const graph = createFamilyGraph(family);
const { captain, squire, mother, bard } = ARGALL_CAPTAIN_PEOPLE;
const newIds = new Set(Object.values(ARGALL_CAPTAIN_PEOPLE).map(person => person.id));

test('Rhydric is Dyrwyns eleven-years-younger full brother and shares Brinthans and Uthyrs grandparents', () => {
  assert.deepEqual(assertValidFamily(HOUSE_ARGALL_FAMILY).diagnostics, []);
  assert.deepEqual(graph.getParents(captain.id).map(person => person.id).sort(), ['avelyn-spouse-argall', 'iwrian-argall']);
  assert.deepEqual(graph.getSiblings(captain.id).map(entry => [entry.person.id, entry.kind]), [['dyrwyn-argall', 'full']]);
  assert.equal(Number(graph.getPerson(captain.id).birth) - Number(graph.getPerson('dyrwyn-argall').birth), 11);
  for (const cousinId of ['brinthan-argall', 'uthyr-argall']) {
    const grandparents = graph.getAncestors(cousinId).filter(entry => entry.depth === 2).map(entry => entry.person.id).sort();
    assert.deepEqual(graph.getAncestors(captain.id).filter(entry => entry.depth === 2).map(entry => entry.person.id).sort(), grandparents);
    assert.deepEqual(grandparents, ['cyran-argall', 'gweneth-spouse-argall']);
  }
});

test('the divorced marriage retains Perwyns biological parentage while Gwenellas affair has its exact reason and no children', () => {
  const marriage = family.partnerships.find(partnership => partnership.id === ARGALL_GWYNTHOR_MARRIAGE_ID);
  assert.equal(marriage.type, 'marriage');
  assert.equal(marriage.status, 'divorced');
  assert.equal(marriage.end, '');
  assert.equal(1740 - Number(graph.getPerson(squire.id).birth), 17);
  assert.deepEqual(graph.getParents(squire.id).map(person => person.id).sort(), [mother.id, captain.id].sort());
  assert.equal(graph.getParentages(squire.id)[0].partnershipId, marriage.id);
  assert.equal(graph.getParentages(squire.id)[0].type, 'biological');
  assert.equal(graph.getParentages(squire.id)[0].legitimacy, 'legitimate');
  assert.deepEqual(graph.getChildren(bard.id), []);
  const matrix = buildRelationshipMatrix(family, mother.id);
  assert.deepEqual(matrix.partnerships.groups.find(group => group.partnership.id === marriage.id).children.map(child => child.person.id), [squire.id]);
  const current = matrix.partnerships.groups.find(group => group.partnership.id === ARGALL_GWYNTHOR_UNION_ID);
  assert.equal(current.partnership.type, 'affair');
  assert.equal(current.partnership.status, 'active');
  assert.equal(current.partnership.notes, 'Durchgebrannt nach Aberon');
  assert.deepEqual(current.children, []);
});

test('the four people reuse public identities and biographies while Argalls register remains in Llysfaen', () => {
  for (const spec of Object.values(ARGALL_CAPTAIN_PEOPLE)) {
    const person = graph.getPerson(spec.id);
    assert.equal(person.worldPersonId, spec.worldPersonId);
    assert.equal(person.portrait, `..${spec.portrait}`);
    assert.equal(person.houseId, spec.houseId);
    // The shared public biography catalog may wrap the same prose in paragraphs.
    assert.equal(getPersonBiographyModule(person).biography.biographyText.replace(/<\/?p>/g, ''), spec.biography);
  }
  for (const id of [captain.id, squire.id]) {
    const stats = getPersonBiographyModule(graph.getPerson(id)).stats;
    assert.deepEqual(stats.find(([label]) => label === 'Wohnsitz'), ['Wohnsitz', 'Caer Ysgellfor · Gwynthor']);
  }
  const registered = FAMILY_REGISTRY.filter(record => record.id === 'haus-argall');
  assert.equal(registered.length, 1);
  assert.deepEqual(registered[0].folderPath, ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Llysfaen']);
  assert.equal(family.document.houseProfile.rankId, 'commoner');
  assert.equal(family.document.houseProfile.seat, 'Llysfaen');
  assert.deepEqual(family.cadetBranches, []);
});

test('the additive source upgrade preserves existing people, relationships and edited notes', () => {
  const prior = structuredClone(family);
  prior.extensions.sourceRevision = 1;
  prior.persons = prior.persons.filter(person => !newIds.has(person.id));
  prior.partnerships = prior.partnerships.filter(partnership => !partnership.participantIds.some(id => newIds.has(id)));
  prior.parentages = prior.parentages.filter(parentage => !newIds.has(parentage.childId));
  prior.persons.find(person => person.id === 'dyrwyn-argall').notes = 'Lokale Notiz zu Dyrwyn';
  prior.partnerships.find(partnership => partnership.id === 'marriage-dyrwyn-ellena-argall').notes = 'Eigene Überlieferung';
  const previous = structuredClone(prior);
  const upgraded = resolveRegisteredFamilyUpgrade(family, prior);
  for (const collection of ['persons', 'partnerships', 'parentages']) {
    for (const record of previous[collection]) assert.deepEqual(upgraded[collection].find(item => item.id === record.id), record);
  }
  for (const id of newIds) assert.equal(upgraded.persons.filter(person => person.id === id).length, 1);
  assert.equal(upgraded.extensions.sourceRevision, 7);
  assert.deepEqual(resolveRegisteredFamilyUpgrade(family, upgraded), upgraded);
});

test('the source correction updates only the new households managed relationship and biography fields', () => {
  const prior = structuredClone(family);
  prior.extensions.sourceRevision = 2;
  const affair = prior.partnerships.find(p => p.id === ARGALL_GWYNTHOR_UNION_ID);
  affair.type = 'union'; affair.notes = 'Alter Entwurf';
  prior.persons.find(p => p.id === mother.id).extensions.biographyModule.stats = [];
  prior.persons.find(p => p.id === 'dyrwyn-argall').notes = 'Eigene Notiz bleibt erhalten';
  const corrected = resolveRegisteredFamilyUpgrade(family, prior);
  assert.equal(corrected.partnerships.find(p => p.id === affair.id).type, 'affair');
  assert.equal(corrected.partnerships.find(p => p.id === affair.id).notes, 'Durchgebrannt nach Aberon');
  assert.equal(corrected.persons.find(p => p.id === 'dyrwyn-argall').notes, 'Eigene Notiz bleibt erhalten');
  assert.ok(corrected.persons.find(p => p.id === mother.id).extensions.biographyModule.stats.some(row => row.value === 'Aberon'));
});

for (const savedRevision of [3, 4, 5, 6]) test(`saved source revision ${savedRevision} gains missing portraits and the authored affair without replacing personal work`, () => {
  const saved = structuredClone(family);
  saved.extensions.sourceRevision = savedRevision;
  for (const id of newIds) saved.persons.find(person => person.id === id).portrait = '';
  const customPortrait = '/eigene-bilder/perwyn.png';
  saved.persons.find(person => person.id === squire.id).portrait = customPortrait;
  saved.persons.find(person => person.id === captain.id).notes = 'Eigene Recherche zum Hauptmann';
  saved.persons.find(person => person.id === mother.id).extensions.biographyModule.biography.biographyText = 'Eigene Biografie zu Gwenella';
  saved.persons.find(person => person.id === mother.id).extensions.chartRepeatForPartnershipIds = [ARGALL_GWYNTHOR_UNION_ID];
  saved.view.orientation = 'horizontal';
  saved.view.focusPersonId = captain.id;
  const affair = saved.partnerships.find(partnership => partnership.id === ARGALL_GWYNTHOR_UNION_ID);
  if (savedRevision < 6) { affair.type = 'union'; affair.status = 'unknown'; affair.notes = ''; }
  const before = structuredClone(saved);

  const { family: corrected, upgraded } = reconcileFamilyWithProjectOrigin({ family: saved, projectOriginFamily: family });
  assert.equal(upgraded, true);
  assert.equal(corrected.extensions.sourceRevision, 7);
  for (const spec of Object.values(ARGALL_CAPTAIN_PEOPLE)) {
    const person = corrected.persons.find(person => person.id === spec.id);
    assert.equal(person.portrait, spec.id === squire.id ? customPortrait : `..${spec.portrait}`);
  }
  assert.equal(corrected.persons.find(person => person.id === captain.id).notes, 'Eigene Recherche zum Hauptmann');
  assert.equal(corrected.persons.find(person => person.id === mother.id).extensions.biographyModule.biography.biographyText, 'Eigene Biografie zu Gwenella');
  assert.deepEqual(corrected.persons.find(person => person.id === mother.id).extensions.chartRepeatForPartnershipIds, []);
  assert.deepEqual(corrected.view, before.view);
  for (const collection of ['persons', 'partnerships', 'parentages', 'houses', 'cadetBranches', 'timeJumps']) {
    for (const record of before[collection]) {
      if (collection === 'persons' && newIds.has(record.id)) continue;
      if (collection === 'partnerships' && record.id === ARGALL_GWYNTHOR_UNION_ID) continue;
      const actual = corrected[collection].find(item => item.id === record.id);
      assert.deepEqual({ ...actual, extensions: actual.extensions || {} }, { ...record, extensions: record.extensions || {} }, `${collection}.${record.id}`);
    }
  }
  const correctedAffair = corrected.partnerships.find(partnership => partnership.id === ARGALL_GWYNTHOR_UNION_ID);
  assert.deepEqual([correctedAffair.type, correctedAffair.status, correctedAffair.notes], ['affair', 'active', 'Durchgebrannt nach Aberon']);
  const graph = createFamilyGraph(corrected);
  assert.deepEqual(graph.getParents(squire.id).map(person => person.id).sort(), [captain.id, mother.id].sort());
  assert.deepEqual(graph.getChildren(bard.id), []);
  assert.deepEqual(reconcileFamilyWithProjectOrigin({ family: corrected, projectOriginFamily: family }), { family: corrected, upgraded: false });
  assert.deepEqual(saved, before);
});

test('source revision seven is the final aggregated boundary and later personal removals are not refilled', () => {
  const registered = FAMILY_REGISTRY.find(record => record.id === 'haus-argall').family;
  assert.equal(family.extensions.sourceRevision, 7);
  assert.equal(registered.extensions.sourceRevision, 7);
  const saved = structuredClone(registered);
  saved.persons.find(person => person.id === captain.id).portrait = '';
  saved.persons.find(person => person.id === mother.id).extensions.chartRepeatForPartnershipIds = [];
  const corrected = reconcileFamilyWithProjectOrigin({ family: saved, projectOriginFamily: registered });
  assert.equal(corrected.upgraded, false);
  assert.deepEqual(corrected.family, saved);
});

test('source six repairs only the four exact former image defaults and authored duplicate view', () => {
  const saved = structuredClone(family);
  saved.extensions.sourceRevision = 6;
  for (const spec of Object.values(ARGALL_CAPTAIN_PEOPLE)) {
    const person = saved.persons.find(person => person.id === spec.id);
    person.portrait = spec.portrait;
    person.extensions.biographyModule.biography.portrait = spec.portrait;
    person.extensions.biographyModule.biography.biographyText = `Persönlicher Text ${spec.id}`;
  }
  const motherPerson = saved.persons.find(person => person.id === mother.id);
  motherPerson.extensions.chartRepeatForPartnershipIds = [ARGALL_GWYNTHOR_MARRIAGE_ID, ARGALL_GWYNTHOR_UNION_ID];
  saved.persons.find(person => person.id === squire.id).extensions.biographyModule.biography.portrait = '/eigene-bilder/bio-perwyn.png';
  const corrected = resolveRegisteredFamilyUpgrade(family, saved);
  for (const spec of Object.values(ARGALL_CAPTAIN_PEOPLE)) {
    const person = corrected.persons.find(person => person.id === spec.id);
    assert.equal(person.portrait, `..${spec.portrait}`);
    assert.equal(person.extensions.biographyModule.biography.portrait,
      spec.id === squire.id ? '/eigene-bilder/bio-perwyn.png' : `..${spec.portrait}`);
    assert.equal(person.extensions.biographyModule.biography.biographyText, `Persönlicher Text ${spec.id}`);
  }
  assert.deepEqual(corrected.persons.find(person => person.id === mother.id).extensions.chartRepeatForPartnershipIds,
    [ARGALL_GWYNTHOR_MARRIAGE_ID]);
  assert.deepEqual(corrected.parentages, saved.parentages);
  assert.deepEqual(corrected.partnerships, saved.partnerships);
});

for (const pageUrl of [
  'https://dieweltvonaleria.netlify.app/Stammb%C3%A4ume/Stammbaum.html',
  'http://127.0.0.1:5500/Aleria/Stammb%C3%A4ume/Stammbaum.html',
  'file:///E:/Aleria/Stammb%C3%A4ume/Stammbaum.html'
]) test(`the family portrait projection resolves beside the project root: ${pageUrl}`, () => {
  const projectRoot = new URL('../', pageUrl);
  for (const spec of Object.values(ARGALL_CAPTAIN_PEOPLE)) {
    const person = family.persons.find(person => person.id === spec.id);
    const expected = new URL(spec.portrait.slice(1), projectRoot).href;
    assert.equal(new URL(person.portrait, pageUrl).href, expected);
    assert.equal(new URL(person.extensions.biographyModule.biography.portrait, pageUrl).href, expected);
  }
});

test('the bounded correction preserves authored relationship notes, supplied portraits and additional person views', () => {
  const saved = structuredClone(family);
  saved.extensions.sourceRevision = 5;
  saved.persons.find(person => person.id === captain.id).portrait = '/eigene-bilder/rhydric.png';
  const motherPerson = saved.persons.find(person => person.id === mother.id);
  motherPerson.extensions.chartRepeatForPartnershipIds = [ARGALL_GWYNTHOR_MARRIAGE_ID];
  const affair = saved.partnerships.find(partnership => partnership.id === ARGALL_GWYNTHOR_UNION_ID);
  affair.type = 'union';
  affair.notes = 'Eigene belegte Recherche zur Verbindung';
  affair.status = 'ended';
  const corrected = resolveRegisteredFamilyUpgrade(family, saved);
  assert.equal(corrected.persons.find(person => person.id === captain.id).portrait, '/eigene-bilder/rhydric.png');
  assert.deepEqual(corrected.persons.find(person => person.id === mother.id).extensions.chartRepeatForPartnershipIds,
    [ARGALL_GWYNTHOR_MARRIAGE_ID]);
  const correctedAffair = corrected.partnerships.find(partnership => partnership.id === ARGALL_GWYNTHOR_UNION_ID);
  assert.equal(correctedAffair.type, 'affair');
  assert.equal(correctedAffair.notes, affair.notes);
  assert.equal(correctedAffair.status, affair.status);
});

test('the overview includes the divorced household and Gwenellas childless affair through the same person identity', () => {
  const chart = toFamilyChartData(family);
  const overview = createFamilyChartOverview(family, chart.data);
  const byId = new Map(overview.data.map(node => [node.id, node]));
  const visited = new Set();
  const pending = [overview.rootId];
  while (pending.length) {
    const id = pending.pop();
    if (visited.has(id)) continue;
    visited.add(id);
    const node = byId.get(id);
    if (node) pending.push(...node.rels.children, ...node.rels.spouses);
  }
  for (const id of newIds) assert.ok(visited.has(id), `${id} must remain reachable in the complete overview.`);
  assert.equal(overview.componentCount, 1);
  assert.equal(byId.get(mother.id).data.aleria.personId, mother.id);
  assert.equal(chart.getPartnershipLine(mother.id, bard.id).type, 'affair');
  assert.deepEqual(byId.get(bard.id).rels.children, []);
  assert.equal(overview.data.filter(node => node.data.aleria.personId === mother.id).length, 1);
  assert.equal(family.persons.filter(person => person.id === mother.id).length, 1);
});

test('only Argalls authored house content drives its regenerated page and biography', async () => {
  const root = new URL('../../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Argall/', import.meta.url);
  const header = '// Generated by scripts/build-house-content.mjs. Edit haus.content.mjs instead.\n';
  assert.equal(await readFile(new URL('haus.data.js', root), 'utf8'), `${header}window.HAEUSER_DATA = ${JSON.stringify(createHousePageData(HOUSE_CONTENT), null, 2)};\n`);
  assert.equal(await readFile(new URL('haus.biography.mjs', root), 'utf8'), `${header}export const HOUSE_BIOGRAPHY = ${JSON.stringify(createHouseBiography(HOUSE_CONTENT), null, 2)};\n`);
  assert.equal(HOUSE_CONTENT.profile.seat, 'Llysfaen');
  assert.equal(HOUSE_CONTENT.currentHead, 'Brinthan Argall');
  assert.ok(HOUSE_CONTENT.offices.some(person => person.id === captain.id));
  assert.ok(HOUSE_CONTENT.offices.some(person => person.id === squire.id));
});
