import assert from 'node:assert/strict';
import test from 'node:test';
import { access, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { PORTRAIT_PLACEHOLDER, tierFor, withVassals } from '../modules/administration/administration-model.mjs';
import { renderStructuredAdministration } from '../modules/administration/administration-structured.mjs';
import vassals, { territorialContacts } from '../modules/administration/data/celtigerns-vassals.generated.mjs';
import { HOUSE_GWYLLACH_FAMILY } from '../../Stammbäume/assets/js/data/house-gwyllach-family.js';
import { HOUSE_SWYLL_PORTRAITS } from '../../Stammbäume/assets/js/data/house-swyll-portraits.js';
import { ADMINISTRATION_PORTRAIT_ARCHIVE, resolveAdministrationPortrait } from '../modules/administration/administration-portrait-sources.mjs';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { protectedAlbicFamilies, reviewHash } from './support/albic-review-baseline.mjs';

const areaIds = ['militaer', 'klerus', 'gerichtsbarkeit', 'finanzen', 'spionage', 'diplomatie', 'magie', 'unterhaltung'];
const sources = Object.fromEntries(await Promise.all(areaIds.map(async id => [
  id, (await import(`../modules/administration/data/celtigerns-${id}.mjs`)).default,
])));
const areas = Object.fromEntries(areaIds.map(id => [id, withVassals(sources[id], vassals)]));
const repositoryRoot = new URL('../../', import.meta.url);
const rolesIn = area => area.groups.flatMap(group => group.roles);
const roleNamed = (area, name) => rolesIn(area).find(role => role.name === name);
const groupById = (area, id) => area.groups.find(group => group.id === id);

test('Gareths vorhandenes veröffentlichtes Portrait wird unverändert statt einer Silhouette übernommen', async () => {
  const role = roleNamed(areas.diplomatie, 'Gareth Swyll');
  const sourceUrl = new URL('../../AleriaAlmanach/AvatarWerkstatt/Charaktere/Einzelcharaktere/Gareth Swyll/Referenzen/', import.meta.url);
  const evidence = JSON.parse(await readFile(new URL('quellen.json', sourceUrl), 'utf8'));
  const family = JSON.parse(await readFile(new URL('../../Stammbäume/assets/data/published-families/haus-swyll.json', import.meta.url), 'utf8'));
  assert.equal(evidence.bindingPortrait.source, family.family.persons.find(person => person.id === 'gareth-swyll').portrait);
  assert.equal(role.portrait, `/Stammbäume/${HOUSE_SWYLL_PORTRAITS['gareth-swyll']}`);
  const bytes = await readFile(new URL(`.${role.portrait}`, repositoryRoot));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), evidence.bindingPortrait.sha256);
});

test('Die freigegebene Portraitergänzung ist die einzige Änderung am geschützten historischen Familienbestand', async () => {
  const review = JSON.parse(await readFile(new URL('./support/albic-family-review-20261024.json', import.meta.url), 'utf8'));
  const capturedIds = new Set(JSON.parse(await readFile(new URL('./support/family-baseline-20261023.json', import.meta.url), 'utf8')));
  const captured = protectedAlbicFamilies(FAMILY_REGISTRY.filter(record => capturedIds.has(record.id)));
  const approval = review.portraitFollowupReview;
  assert.equal(reviewHash(captured), review.protectedSha256);
  const person = captured.find(record => record.id === approval.familyId).family.persons.find(person => person.id === approval.personId);
  assert.equal(person.portrait, approval.after);
  person.portrait = approval.before;
  assert.equal(reviewHash(captured), approval.previousProtectedSha256, 'Keine andere Person, Verwandtschaft, Unterstellung oder Bildzuordnung darf sich nebenbei ändern');
});

test('Jede benannte Verwaltungskarte besitzt eine lokale Bildquelle; externe Altquellen werden lokal aufgelöst', async () => {
  const roles = [...Object.values(areas).flatMap(rolesIn), ...territorialContacts];
  for (const role of roles.filter(role => role.name)) {
    const portrait = resolveAdministrationPortrait(role.portrait);
    assert.ok(portrait?.startsWith('/'), `${role.name}: vorhandenes Bild darf nicht leer oder nur extern sein`);
    await access(new URL(`.${portrait}`, repositoryRoot));
    assert.ok(!portrait.includes('/placeholders/'), `${role.name}: kein technisch eingesetzter Ersatz für ein vorhandenes Portrait`);
  }
  for (const archived of ADMINISTRATION_PORTRAIT_ARCHIVE) {
    assert.equal(resolveAdministrationPortrait(archived.source), archived.local);
    await access(new URL(`.${archived.local}`, repositoryRoot));
  }
  assert.equal(ADMINISTRATION_PORTRAIT_ARCHIVE.find(entry => entry.source === 'https://i.imgur.com/7yB9PR6.png').placeholder, true, 'Arawns überlieferte Quelle ist selbst eine Silhouette');
  assert.equal(resolveAdministrationPortrait('https://example.org/unbekannt.png'), 'https://example.org/unbekannt.png', 'Unbekannte Bilder nicht anderen Personen zuordnen');
});

test('Fünf Kernämter bleiben je Bereich gleichrangig und haben dieselbe unmittelbare Leitung', () => {
  for (const id of ['militaer', 'gerichtsbarkeit', 'finanzen', 'spionage', 'diplomatie', 'unterhaltung']) {
    const core = areas[id].groups.filter(group => group.kind === 'core');
    assert.equal(core.length, 1, `${id}: eine gemeinsame Kernebene`);
    assert.equal(core[0].roles.length, 5, `${id}: genau fünf Kernämter`);
    assert.equal(new Set(core[0].roles.map(role => role.reportsTo)).size, 1, `${id}: kein Kernamt ist einem anderen untergeordnet`);
    for (const role of core[0].roles) {
      assert.ok(role.reportsTo, `${id}/${role.id}: unmittelbarer Dienstweg`);
      assert.equal(tierFor(core[0], role), 'silver', `${id}/${role.id}: gleicher Silberrang`);
    }
  }
});

test('Das Kathedralrecht behält neun Prälaten vor den örtlichen Vikaren', () => {
  const clergy = areas.klerus;
  const coreIndex = clergy.groups.findIndex(group => group.kind === 'core');
  const vassalIndex = clergy.groups.findIndex(group => group.kind === 'vassals');
  const prelates = clergy.groups[coreIndex];
  assert.equal(prelates.roles.length, 9);
  assert.deepEqual(prelates.roles.filter(role => role.name).map(role => role.name), ['Peredur Eneiniog']);
  assert.equal(prelates.roles.filter(role => !role.name).length, 8, 'Unbekannte Prälaten werden nicht mit erfundenen Personen besetzt');
  assert.ok(coreIndex < vassalIndex, 'Die neun Prälaten stehen vor den Vasallengeistlichen');
  assert.ok(prelates.roles.every(role => tierFor(prelates, role) === 'silver'));
  assert.ok(roleNamed(clergy, 'Gwalchgwyn Saethwyr'));
});

test('Sechs Vasallenämter werden in jeden Bereich eingefügt, ohne die Quellen zu verändern', () => {
  assert.equal(vassals.length, 6);
  assert.equal(new Set(vassals.map(vassal => vassal.scopeId)).size, 6);
  for (const id of areaIds) {
    const before = JSON.stringify(sources[id]);
    const once = withVassals(sources[id], vassals);
    const twice = withVassals(once, vassals);
    assert.equal(JSON.stringify(sources[id]), before, `${id}: Quelldaten bleiben unverändert`);
    const groups = twice.groups.filter(group => group.kind === 'vassals');
    assert.equal(groups.length, 1, `${id}: wiederholte Aufbereitung verdoppelt keine Ämter`);
    assert.equal(groups[0].roles.length, 6, `${id}: alle sechs territorialen Ratsämter`);
    for (const vassal of vassals) {
      const role = groups[0].roles.find(role => role.id === `vassal-${vassal.id}`);
      assert.ok(role, `${id}: ${vassal.name}`);
      assert.equal(role.name, vassal.offices[id].name);
      assert.equal(role.title, vassal.offices[id].title);
      assert.equal(role.portrait, vassal.offices[id].portrait);
      assert.ok(role.reportsTo, `${id}/${vassal.id}: fachliche Verantwortung gegenüber der Grafschaft`);
      assert.ok(role.links.some(link => link.href === vassal.href), `${id}/${vassal.id}: eigene Verwaltung bleibt erreichbar`);
    }
    const vassalIndex = twice.groups.indexOf(groups[0]);
    const adjutantIndex = twice.groups.findIndex(group => group.kind === 'adjutant');
    assert.ok(vassalIndex > adjutantIndex, `${id}: Vasallen nach der Adjutantur`);
    if (id !== 'klerus') {
      const nextIndex = twice.groups.findIndex(group => group.kind === 'core' || group.kind === 'service');
      assert.ok(vassalIndex < nextIndex, `${id}: Vasallen vor den Kernämtern beziehungsweise Diensten`);
    }
  }
  assert.equal(areas.gerichtsbarkeit.groups.find(group => group.kind === 'vassals').roles.find(role => role.id === 'vassal-gafyr').name, 'Hywell Gafyr');
  assert.equal(areas.gerichtsbarkeit.groups.find(group => group.kind === 'vassals').roles.find(role => role.id === 'vassal-saethwyr').name, 'Morwenna Saethwyr');
  assert.equal(areas.gerichtsbarkeit.groups.find(group => group.kind === 'vassals').roles.find(role => role.id === 'vassal-wyrm').name, 'Derwen Wyrm');
});

test('Freigegebene gebürtige Gwyllach sind einmal vertreten; ausgeschlossene Angehörige bleiben ohne Amt', () => {
  const excludedIds = new Set(['talaneth-gwyllach', 'saerwyn-gwyllach', 'eryndor-gwyllach', 'liora-gwyllach', 'rhufaed-gwyllach', 'olyndor-gwyllach']);
  const bornMembers = HOUSE_GWYLLACH_FAMILY.persons.filter(person =>
    person.houseId === 'house-gwyllach' && person.familyRole === 'core' && person.status === 'alive' && !person.death,
  );
  assert.equal(bornMembers.length, 15, 'Abgleich gegen die tatsächliche Familienakte');
  const allOffices = sources.spionage.groups.flatMap(group => group.roles.map(role => ({ role, kind: group.kind })));
  const assignments = allOffices.filter(({ role }) => role.name);
  const eligible = bornMembers.filter(person => !excludedIds.has(person.id));
  assert.equal(eligible.length, 9);
  assert.deepEqual(assignments.map(({ role }) => role.id).sort(), eligible.map(person => person.id).sort(), 'Keine angeheirateten, historischen oder ausdrücklich ausgeschlossenen Familienmitglieder');
  for (const id of excludedIds) assert.ok(!JSON.stringify(sources.spionage).includes(id), `${id}: keine versteckte Zuordnung`);
  assert.equal(allOffices.find(({ role }) => role.id === 'gegenspionage').role.name, '');
  for (const person of eligible) {
    const matching = assignments.filter(({ role }) => role.id === person.id);
    assert.equal(matching.length, 1, person.id);
    assert.equal(matching[0].role.name, person.name);
    if (1740 - Number(person.birth) < 27) assert.equal(matching[0].kind, 'special', `${person.id}: keine Führungsstelle unter 27`);
  }
  assert.match(allOffices.find(({ role }) => role.id === 'nachtgreif').role.title, /Nachtgreif/u);
  assert.ok(!assignments.some(({ role }) => role.title === 'Zugriffsdienst'));
});

test('Ferydnands Verbandskette führt über zwei Stellvertreter und vier Hauptmänner vor die allgemeinen Hauptleute', () => {
  const military = areas.militaer;
  const ids = ['militaer-kommandanten', 'militaer-cochllamwyr-stellvertreter', 'militaer-cochllamwyr-hauptmaenner', 'militaer-hauptleute', 'militaer-banner-und-offiziere'];
  const positions = ids.map(id => military.groups.findIndex(group => group.id === id));
  assert.ok(positions.every(index => index >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.equal(groupById(military, ids[0]).roles[0].name, 'Ferydnand Gafyr');
  const deputies = groupById(military, ids[1]).roles;
  const captains = groupById(military, ids[2]).roles;
  assert.equal(deputies.length, 2);
  assert.equal(captains.length, 4);
  assert.ok(deputies.every(role => /Ferydnand Gafyr/u.test(role.reportsTo)));
  assert.ok(captains.every(role => /Stellvertreter/u.test(role.reportsTo)));
  assert.ok([...deputies, ...captains].every(role => !role.name), 'Neu vorbereitete Stellen erfinden keine Amtsträger');
});

test('Seeführung und Flottillen besitzen Mannschaften; Idwal steht neben Meredithe und öffnet sein vorhandenes Modul', () => {
  const military = areas.militaer;
  for (const name of ['Huw Saethwyr', 'Niniane Chwedlonol']) assert.ok(roleNamed(military, name)?.crew?.label, name);
  const admirals = groupById(military, 'militaer-flottillen').roles;
  assert.equal(admirals.length, 5);
  assert.ok(admirals.every(role => role.crew?.label));
  const captains = groupById(military, 'militaer-kapitaene').roles;
  assert.deepEqual(captains.map(role => role.name), ['Meredithe Chwedlonol', 'Idwal Draig']);
  const idwal = captains.find(role => role.name === 'Idwal Draig');
  assert.equal(idwal.crew.href, '/AleriaAlmanach/AleriaAlmanach.html?entry=idwals-schiffsmannschaft');
  assert.ok(idwal.crew.image, 'Das echte Mannschaftswappen ist verknüpft');
  assert.ok(idwal.links.some(link => link.href === idwal.crew.href));
});

test('Gareth, Kane, Godwyn und Tegan besitzen die angeforderten begrenzten Sonderaufgaben', () => {
  const gareth = roleNamed(areas.diplomatie, 'Gareth Swyll');
  assert.match(gareth?.title || '', /Schreibgehilfe/u);
  assert.match(gareth.reportsTo, /Iestyn Swyll/u);
  const kane = roleNamed(areas.finanzen, 'Kane Draig');
  assert.ok(areas.finanzen.groups.some(group => group.kind === 'special' && group.roles.includes(kane)));
  assert.match(kane.authority, /keine eigene Steuer-, Prüfungs- oder Haushaltsgewalt/u);
  const special = areas.unterhaltung.groups.filter(group => group.kind === 'special').flatMap(group => group.roles);
  assert.equal(special.find(role => role.name === 'Godwyn Sgrechiwr')?.title, 'Schreier des Offenen Gerichts');
  assert.match(special.find(role => role.name === 'Tegan Draig')?.title || '', /Schreierin/u);
  assert.ok(special.find(role => role.name === 'Godwyn Sgrechiwr').connections.some(connection => connection.area === 'gerichtsbarkeit'));
});

test('Magie bewahrt den persönlichen Stab und ergänzt die belegten Vasallenmagier', () => {
  const expectedStaff = ['Myrddin Draig', 'Rhiannon Draig', 'Rhianu Penwyn', 'Rhoswyn Awenydd', 'Brychan Awenydd', 'Rhys Awenor', 'Rhyd Awenor', 'Bors Awenydd', 'Ludd Awenydd', 'Ruarc Balguen', 'Afallith „Lilith“ Tanwyn', 'Gethor Awenor'];
  assert.deepEqual(rolesIn(sources.magie).map(role => role.name).sort(), expectedStaff.sort());
  const mages = areas.magie.groups.find(group => group.kind === 'vassals').roles;
  for (const name of ['Ceridwen Lhuyd', 'Maelona Gwefrydd', 'Ceridwyn Saethwyr']) assert.ok(mages.some(role => role.name === name), name);
  assert.equal(mages.filter(role => !role.name).length, 3, 'Unbenannte Ratsmagier werden nicht erfunden');
});

test('Aberllans territoriale Verbindung erfindet keinen Rat und bezieht Oilean nicht in die Grafschaft ein', () => {
  assert.equal(territorialContacts.length, 1);
  const contact = territorialContacts[0];
  assert.equal(contact.name, 'Lyonnel Garrael');
  assert.equal(contact.title, 'Lehenswart Aberllans');
  assert.match(contact.jurisdiction, /Aberllan/u);
  assert.ok(!contact.jurisdiction.includes('Oilean'));
  assert.match(contact.description, /Oilean untersteht Leitheach/u);
  assert.match(contact.description, /gehört nicht zu dieser Grafschaftsverbindung/u);
  assert.equal(contact.offices, undefined, 'Keine acht unbelegten Fachämter für die Diarchie');
  assert.ok(!vassals.some(vassal => vassal.scopeId === 'insel-camruisge'));
});

test('Ämterkennungen sind innerhalb ihrer Bereiche eindeutig und Querverbindungen zeigen auf vorhandene Bereiche', () => {
  for (const area of Object.values(areas)) {
    assert.equal(new Set(area.groups.map(group => group.id)).size, area.groups.length, `${area.id}: eindeutige Gruppen`);
    const roles = rolesIn(area);
    assert.equal(new Set(roles.map(role => role.id)).size, roles.length, `${area.id}: eindeutige Ämter`);
    assert.ok(roles.every(role => role.id && role.title && role.description), `${area.id}: jedes Amt ist beschrieben`);
    for (const role of roles) {
      for (const connection of role.connections || []) {
        assert.ok(areaIds.includes(connection.area), `${area.id}/${role.id}: gültiges Querverweisziel`);
        assert.notEqual(connection.area, area.id, `${area.id}/${role.id}: echte Verbindung zu einem anderen Bereich`);
      }
    }
  }
});

test('Alle lokalen Portraits, Mannschaftsbilder und verlinkten Dateien existieren', async () => {
  const paths = new Set([PORTRAIT_PLACEHOLDER]);
  function collect(value) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(collect); return; }
    for (const [key, child] of Object.entries(value)) {
      if (['portrait', 'image', 'href', 'source'].includes(key) && typeof child === 'string' && child.startsWith('/')) paths.add(child);
      else if (child && typeof child === 'object') collect(child);
    }
  }
  Object.values(areas).forEach(collect);
  collect(vassals);
  collect(territorialContacts);
  for (const path of paths) {
    const url = new URL(path, 'https://aleria.invalid');
    const file = new URL(`.${decodeURIComponent(url.pathname)}`, repositoryRoot);
    assert.ok(file.href.startsWith(repositoryRoot.href), `Lokales Ziel bleibt im Repository: ${path}`);
    await assert.doesNotReject(access(file), `Fehlendes lokales Ziel: ${path}`);
  }
});

test('Grafschaftsinhalte werden nicht an andere Verwaltungsbereiche oder Herrschaften vererbt', async () => {
  for (const scope of ['baronie-gwendolyns-ufer', 'herrschaft-gafyr', 'herrschaft-wyrm', 'herrschaft-saethwyr', 'insel-camruisge', 'unbekannt']) {
    for (const id of areaIds) assert.equal(await renderStructuredAdministration(scope, id), null, `${scope}/${id}`);
  }
  assert.equal(await renderStructuredAdministration('grafschaft-celtigerns-wacht', 'unbekannt'), null);
  const context = { window: {} };
  vm.runInNewContext(await readFile(new URL('../modules/administration/administration-content.js', import.meta.url), 'utf8'), context);
  const content = context.window.ALERIA_ADMINISTRATION_CONTENT;
  for (const id of areaIds) {
    assert.equal(content.sourceFor('baronie-gwendolyns-ufer', id), `/Kontinente/modules/administration/content/gwendolyns-ufer/${id}.html`);
    assert.equal(content.sourceFor('herrschaft-gafyr', id), '');
  }
});
