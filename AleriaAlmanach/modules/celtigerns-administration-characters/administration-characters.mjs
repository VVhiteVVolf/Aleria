import assert from 'node:assert/strict';
import { getRegisteredFamily } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyPersonCandidate, buildImportedCharacter } from '../character-genealogy/genealogy-mapping.js';
import { normalizeCharacterGenealogy, normalizeCharacterIdentity } from '../character-genealogy/person-identity.js';
import { getPersonBiographyModule, normalizePersonBiographyModule, sanitizeBiographyStatsForFirestore } from '../../../Stammbäume/assets/js/modules/person-biography/person-biography-model.js';
import { EUDDOGWY } from '../gwynthor-cathedral/patriarch-adjutant.mjs';
import '../image-library/image-library-model.js';
import militaer from '../../../Kontinente/modules/administration/data/celtigerns-militaer.mjs';
import klerus from '../../../Kontinente/modules/administration/data/celtigerns-klerus.mjs';
import gerichtsbarkeit from '../../../Kontinente/modules/administration/data/celtigerns-gerichtsbarkeit.mjs';
import finanzen from '../../../Kontinente/modules/administration/data/celtigerns-finanzen.mjs';
import spionage from '../../../Kontinente/modules/administration/data/celtigerns-spionage.mjs';
import diplomatie from '../../../Kontinente/modules/administration/data/celtigerns-diplomatie.mjs';
import magie from '../../../Kontinente/modules/administration/data/celtigerns-magie.mjs';
import unterhaltung from '../../../Kontinente/modules/administration/data/celtigerns-unterhaltung.mjs';
import { administrationRoleBrief } from '../../../Kontinente/modules/administration/administration-role-briefs.mjs';

export const ADMINISTRATION_CHARACTER_FEATURE = 'celtigerns-administration-characters';
const areas = { militaer, klerus, gerichtsbarkeit, finanzen, spionage, diplomatie, magie, unterhaltung };
const paragraph = text => String(text || '').split(/\n\s*\n/).filter(Boolean).map(value => `<p>${value}</p>`).join('');

function officeSource(reference) {
  const area = areas[reference.areaId];
  const group = area?.groups.find(group => group.roles.some(role => role.id === reference.roleId));
  const role = group?.roles.find(role => role.id === reference.roleId);
  assert(role?.name, `Benannte Amtsquelle fehlt: ${reference.areaId}/${reference.roleId}`);
  return { area, group, role, brief: administrationRoleBrief({ role, group, area }) };
}

export function administrationFamilyCandidate(spec) {
  if (!spec.familyId) return null;
  const family = getRegisteredFamily(spec.familyId);
  const person = family?.family.persons.find(person => person.id === spec.personId);
  assert(person, `Stammbaumperson fehlt: ${spec.familyId}/${spec.personId}`);
  const candidate = createFamilyPersonCandidate(family, person);
  assert.equal(candidate.worldPersonId, spec.worldPersonId);
  assert.equal(candidate.status, 'alive', `Historische Namensgleiche darf kein aktuelles Amt übernehmen: ${spec.name}`);
  assert.equal(candidate.death, '');
  return candidate;
}

function sourceBiography(spec, candidate, sources, knownCharacter) {
  const person = spec.familyId && getRegisteredFamily(spec.familyId).family.persons.find(person => person.id === spec.personId);
  const existing = knownCharacter?.biography ? structuredClone(knownCharacter.biography) : person && getPersonBiographyModule(person);
  if (existing) {
    existing.stats = sanitizeBiographyStatsForFirestore(existing.stats);
    return existing;
  }
  const first = sources[0], birth = candidate?.birth || spec.contextualIdentity?.birth || '';
  const stats = [{ label: 'Name', value: spec.name },
    ...(birth ? [{ label: 'Geboren', value: birth }] : []),
    ...(/^\d{4}$/.test(birth) ? [{ label: 'Alter im Jahr 1740', value: `${1740 - Number(birth)} Jahre` }] : []),
    ...(candidate?.houseName ? [{ label: 'Haus', value: candidate.houseName }] : []),
    { label: 'Amt', value: sources.map(source => source.role.title).join(' · ') },
    { label: 'Dienstort', value: 'Celtigerns Wacht' },
    { label: 'Berichtet an', value: first.role.reportsTo || first.area.reportsTo || '' }];
  const relations = candidate?.relationships || {};
  const named = relation => relation.name && !/^(?:Unbekannt|\?)/i.test(relation.name);
  const parents = (relations.parents || []).filter(parent => named(parent) && parent.type === 'biological' && parent.certainty === 'confirmed');
  const adoptive = (relations.parents || []).filter(parent => named(parent) && parent.type === 'adoptive' && parent.certainty === 'confirmed');
  const uncertain = (relations.parents || []).filter(parent => named(parent) && (parent.type === 'claimed' || parent.certainty !== 'confirmed'));
  const marriages = (relations.partners || []).filter(partner => partner.type === 'marriage' && partner.status === 'active' && partner.certainty === 'confirmed');
  const knownSpouses = marriages.filter(named), unknownSpouses = marriages.filter(partner => !named(partner));
  const children = (relations.children || []).filter(child => named(child) && child.certainty === 'confirmed' && ['biological', 'adoptive'].includes(child.type));
  const familyText = [parents.length && (parents.length === 1 ? `Als Elternteil ist ${parents[0].name} überliefert.` : `Die Eltern sind ${parents.map(parent => parent.name).join(' und ')}.`),
    adoptive.length && `Als Adoptiveltern sind ${adoptive.map(parent => parent.name).join(' und ')} überliefert.`,
    uncertain.length && `Eine nicht gesicherte Abstammung von ${uncertain.map(parent => parent.name).join(' und ')} wird überliefert.`,
    knownSpouses.length && `Verheiratet mit ${knownSpouses.map(partner => partner.name).join(' und ')}.`,
    unknownSpouses.length && 'Eine Ehe ist überliefert; der Name der Eheperson ist nicht bekannt.',
    children.length && `Zu den bekannten Kindern gehören ${children.map(child => child.name).join(', ')}.`].filter(Boolean).join(' ');
  if (parents.length) stats.push({ label: parents.length === 1 ? 'Bekannter Elternteil' : 'Eltern', value: parents.map(parent => parent.name).join(' und ') });
  if (adoptive.length) stats.push({ label: 'Adoptiveltern', value: adoptive.map(parent => parent.name).join(' und ') });
  if (knownSpouses.length || unknownSpouses.length) stats.push({ label: 'Ehe', value: [...knownSpouses.map(partner => partner.name), ...unknownSpouses.map(() => 'Name nicht überliefert')].join(' · ') });
  const background = spec.worldPersonId === 'person--haus-gwyllach--efael-gwyllach'
    ? 'Efael war bei der Geburt seiner Zwillingstöchter Meirawen und Morwella dreiundzwanzig Jahre alt. Beide Töchter wurden 1721 geboren.'
    : person?.notes || '';
  const module = normalizePersonBiographyModule({ schema: 'aleria.biography-module', schemaVersion: 1, stats,
    biography: { biographyTitle: `${spec.name} – ${first.role.title}`,
      biographyText: sources.map(source => paragraph(source.role.description)).join(''),
      historyTitle: familyText ? 'Herkunft & Familie' : '', historyText: paragraph(familyText),
      worksTitle: 'Aufgaben im Amt', works: sources.flatMap(source => source.brief.duties.map(duty => duty.text)),
      extraSections: [...(background ? [{ title: 'Hintergrund', mode: 'text', position: 'afterWorks', text: paragraph(background) }] : []),
        ...sources.map(source => ({ title: source.role.title, mode: 'text', position: 'afterWorks', text: paragraph(source.brief.practice) }))],
      documentsTitle: spec.familyId ? 'Familienakte' : 'Zugehörige Orte',
      documents: spec.familyId ? [{ title: candidate.houseName, link: `../Stammbäume/Stammbaum.html?family=${encodeURIComponent(spec.familyId)}&mode=view&person=${encodeURIComponent(spec.personId)}`,
        text: 'Herkunft und Angehörige.' }] : first.role.links?.map(link => ({ title: link.label, link: link.href, icon: link.image || '', text: '' })) || [],
      footer: `Personenakte · ${spec.name} · Celtigerns Wacht`
    } });
  module.stats = sanitizeBiographyStatsForFirestore(module.stats);
  return module;
}

export function buildAdministrationCharacterExports(roster, artwork, knownCharacters = []) {
  assert.equal(roster.people.length, 19);
  assert.equal(new Set(roster.people.map(spec => spec.worldPersonId)).size, 19);
  return roster.people.map(spec => {
    assert.notEqual(spec.worldPersonId, 'person--haus-coeddu--brenric-coeddu', 'Brenric besitzt eine eigene Autorenquelle.');
    const candidate = administrationFamilyCandidate(spec), sources = spec.officeSources.map(officeSource);
    const first = sources[0], media = artwork[spec.worldPersonId];
    assert(media?.portrait && media.imageSets?.length, `Bildbibliothek fehlt: ${spec.name}`);
    const prepared = globalThis.AleriaCharacterImageSets.prepareStorage({ ...media,
      imageSets: media.imageSets.map(set => ({ ...set, createdAt: set.createdAt || roster.authoredAt, updatedAt: set.updatedAt || roster.authoredAt })) });
    assert.equal(prepared.imageSets.length, media.imageSets.length);
    assert.equal(prepared.activeImageSetId, media.activeImageSetId);
    for (const [i, set] of prepared.imageSets.entries()) assert.equal(set.emotes.length, media.imageSets[i].emotes.length);
    const independent = !candidate && spec.worldPersonId === EUDDOGWY.worldPersonId ? EUDDOGWY : null;
    const base = candidate ? buildImportedCharacter(candidate, null, roster.authoredAt) : {
      name: spec.name, status: 'active', createdAt: roster.authoredAt, updatedAt: roster.authoredAt,
      identity: normalizeCharacterIdentity({ worldPersonId: spec.worldPersonId }),
      genealogy: normalizeCharacterGenealogy({ worldPersonId: spec.worldPersonId,
        ...(independent ? { sex: independent.sex, birth: independent.birth, status: 'alive' } : {}), sources: [] })
    };
    const knownCharacter = spec.worldPersonId === EUDDOGWY.worldPersonId
      ? knownCharacters.find(character => character.id === spec.worldPersonId) : null;
    const biography = sourceBiography(spec, candidate, sources, knownCharacter);
    const character = { ...base, ...prepared, id: spec.worldPersonId, name: spec.name,
      aliases: spec.aliases.filter(alias => alias !== spec.name),
      title: sources.map(source => source.role.title).join(' · '), role: sources.map(source => source.role.title).join(' · '),
      portrait: media.portrait, bio: [...new Set([knownCharacter?.bio, ...sources.map(source => source.role.description)].filter(Boolean))].join('\n\n'), biography,
      currentLocation: spec.worldPersonId === EUDDOGWY.worldPersonId ? 'Große Kathedrale der Neun · Gwynthor'
        : spec.personId === 'gwenydd-anghof' ? 'Baronie Gwendolyns Ufer'
          : spec.personId === 'torri-vikar-wyrm' ? 'Herrschaft der Wyrm' : 'Celtigerns Wacht', archived: false,
      ...(independent ? { race: independent.race, age: independent.age, origin: independent.origin } : {}),
      ...(candidate && /^\d{4}$/.test(candidate.birth) ? { age: 1740 - Number(candidate.birth) } : {}) };
    delete character.inventory;
    delete character.playerOwner;
    assert(!Object.hasOwn(character, 'combatProfile'));
    assert.equal(character.identity.worldPersonId, character.id);
    assert.equal(character.genealogy.worldPersonId, character.id);
    return { type: 'aleria-character', version: 3, mergeStrategy: 'replace-exported-fields',
      exportedAt: roster.authoredAt, assignedTab: 'Gwynthor',
      sourcePath: `Charakter Archiv Exporte/Celtigerns Verwaltung/${spec.personId}.json`,
      sourceNote: `Begrenzte Neuanlage nach Identitätsabgleich der 70 benannten Rollen. Quellen: ${spec.officeSources.map(source => `Kontinente/modules/administration/data/celtigerns-${source.areaId}.mjs#${source.roleId}`).join('; ')}.${spec.contextualIdentity ? ` ${spec.contextualIdentity.note}` : ''} Keine Vergabe von Inventar, Besitz oder Kampfwerten.`,
      character };
  });
}
