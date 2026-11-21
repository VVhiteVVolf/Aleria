import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createParentages } from './family-record-builders.js';
import { GWYNTHOR_COMMONER_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { TAL_DER_MILANE_HOUSE_EMBLEMS, TAL_DER_MILANE_HOUSE_PROFILES } from './tal-der-milane-house-profiles.js';
import { DRAIG_GARDE_PEOPLE_BY_ID as people, DRAIG_GARDE_EURGAIN_PARENTAGE } from './draig-garde-people.js';

const EMBLEM_ROOT = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor';
const PELLINARD_YSABEL_MARRIAGE_ID = 'marriage-pellinard-brandyddyn-ysabel-bronnor';
const YSABEL_SOURCE_REVISION = 3;
const PREPARED_FAMILY_SOURCE = 'Nutzerauftrag Draig-Garde vom 12. November 2026. Unbekanntes Gründerpaar, Hauswappen und genau ein serieller Zeitsprung. Die ersten bekannten Mitglieder besitzen keine erfundenen Eltern. Namensgleiche Angehörige werden ohne belegte nähere Beziehung nicht zu Geschwistern oder Eltern und Kindern erklärt. Altersschätzungen sind ausschließlich textlich; keine Geburtsjahre daraus errechnet.';
const YSABEL_FORMER_DEFAULT_NOTES = 'Mitglied des Ritterhauses Bronnor aus dem Tal der Milane. Kindheitsfreundin der Gräfin Gwendolyn Aderyn. Mutter Eurgains. Alterserscheinung: etwa 35–45 Jahre; reine Schätzung nach dem aktuellen Portrait, keine gesicherten Lebensdaten.';
const definition = (slug, name, members, emblemDescription, martial = false) => Object.freeze({
  slug, name, title: name, members: Object.freeze(members), martial,
  file: `${name}/${slug}-emblem.png`, emblem: `${EMBLEM_ROOT}/${name}/${slug}-emblem.png`,
  emblemDescription
});

export const DRAIG_GARDE_COMMONER_HOUSE_DEFINITIONS = Object.freeze([
  definition('brandyddyn', 'Brândyddyn', ['pellinard-brandyddyn', 'eurgain-brandyddyn'],
    'Zwei gekreuzte silberne Schwerter vor einer kupferroten Flamme auf nachtblauem Grund.', true),
  definition('curiad', 'Curiad', ['marared-curiad', 'mathon-curiad', 'morcant-curiad'],
    'Eine silberne gepanzerte Faust mit aufrechter Streitkeule auf dunkelrotem Grund.', true),
  definition('caelrith', 'Caelrith', ['urien-caelrith'],
    'Ein silberner Reiher über drei silbernen Wellenlinien auf dunkelgrünem Grund.'),
  definition('myrgath', 'Myrgath', ['lleucu-myrgath'],
    'Ein silberner Luchskopf unter einem achtzackigen Stern auf nachtblauem Grund.'),
  definition('aelgorn', 'Aelgorn', ['angharad-aelgorn'],
    'Ein goldener Erlenzweig mit fünf Blättern und zwei dunkelroten Fruchtständen auf tiefgrünem Grund.')
]);

function familyPerson(id) {
  const source = people[id];
  const appearance = source.ageEstimate ? `Alterserscheinung: ${source.ageEstimate}; reine Schätzung nach dem aktuellen Portrait, keine gesicherten Lebensdaten.` : '';
  return createFamilyPerson({
    ...source, title: source.role, birth: source.birth || '', death: '', status: 'alive',
    familyRole: 'core', lineageRole: 'branch',
    notes: [source.notes, appearance].filter(Boolean).join(' '),
    extensions: {
      authoredSource: 'draig-garde-20261112',
      sourceNote: [source.birth
        ? 'Name und Gardeamt nach der gelieferten beschrifteten Übersicht.'
        : 'Name und Gardeamt nach der gelieferten beschrifteten Übersicht; Lebensdaten bleiben offen.',
      source.sourceNote].filter(Boolean).join(' '),
      ...(source.ageEstimate ? { ageEstimate: source.ageEstimate } : {}),
      ...(id === 'ysabel-bronnor' ? {
        registryManagedFields: ['birth', 'notes'],
        registryManagedFieldRevisions: { birth: YSABEL_SOURCE_REVISION, notes: YSABEL_SOURCE_REVISION },
        registryManagedFieldPreviousValues: { birth: [''], notes: [YSABEL_FORMER_DEFAULT_NOTES] },
        registryManagedExtensionFields: ['ageEstimate', 'sourceNote'],
        registryManagedExtensionFieldRevisions: { ageEstimate: YSABEL_SOURCE_REVISION, sourceNote: YSABEL_SOURCE_REVISION }
      } : {}),
      ...(source.existingCharacterId ? { almanachCharacterId: source.existingCharacterId } : {})
    }
  });
}

function buildFamily({ id, title, emblem, houseProfile, roots, members, martial = false, sourceRevision = 1 }) {
  const base = createFounderTimeJumpPlaceholderHouseFamily({
    id, title, emblem, houseProfile, toYear: '',
    description: `${title}: vorbereitete Familienakte mit unbekanntem Gründerpaar, Hauswappen und Überlieferungslücke vor den namentlich bekannten Angehörigen.`,
    timeJumpLabel: 'Nicht einzeln überlieferte Generationen', pendingDescendantReview: false
  });
  const jump = {
    ...base.timeJumps[0], id: `gap-${id.replace(/^haus-/, '')}-unrecorded-generations`,
    childIds: [...roots], fromYear: '', toYear: '',
    notes: 'Reiner Darstellungsanker für die unvollständig überlieferte Hauslinie. Keine unmittelbare Elternschaft, Geschwisterschaft oder genaue Generationenzahl wird daraus abgeleitet.',
    extensions: { preparedPlaceholder: true }
  };
  const hasEurgain = members.includes(DRAIG_GARDE_EURGAIN_PARENTAGE.childId);
  const externalHouseIds = [...new Set(members.map(id => people[id].houseId))].filter(houseId => houseId !== base.lineage.houseId);
  return Object.freeze({
    ...base,
    houses: [...base.houses, ...externalHouseIds.map(houseId => {
      const slug = houseId.replace(/^house-/, '');
      const commoner = DRAIG_GARDE_COMMONER_HOUSE_DEFINITIONS.find(record => record.slug === slug);
      return { id: houseId, name: `Haus ${commoner?.name || 'Bronnor'}`, motto: '',
        emblem: commoner?.emblem || TAL_DER_MILANE_HOUSE_EMBLEMS.bronnor, status: 'active' };
    })],
    persons: [
      ...base.persons.map(person => createFamilyPerson({
        ...person, name: person.sex === 'male' ? 'Unbekannter Gründer' : 'Unbekannte Gründerin',
        worldPersonId: `person--${id}--${person.id}`, status: 'unknown', death: '',
        notes: 'Historische Platzhalterfigur; Name und genaue Lebensdaten sind nicht überliefert.',
        extensions: { registryManagedFields: ['name'], registryManagedFieldPreviousValues: { name: ['???'] } }
      })),
      ...members.map(familyPerson)
    ],
    partnerships: [
      ...base.partnerships.map(pair => ({
        ...pair, certainty: 'unknown',
        notes: 'Platzhalter des unbekannten Gründerpaares; keine Ehejahre oder Namen sind belegt.'
      })),
      ...(hasEurgain ? [createMarriage(PELLINARD_YSABEL_MARRIAGE_ID, ...DRAIG_GARDE_EURGAIN_PARENTAGE.parentIds, {
        notes: 'Heirat vor der Hochzeit von Galahad Draig und Gwendolyn Aderyn.',
        extensions: {
          chartAlignParentPairOverChildPersonId: DRAIG_GARDE_EURGAIN_PARENTAGE.childId,
          chartAutomaticSingleChildAlignment: true
        }
      })] : [])
    ],
    parentages: hasEurgain ? createParentages(
      [DRAIG_GARDE_EURGAIN_PARENTAGE.childId], DRAIG_GARDE_EURGAIN_PARENTAGE.parentIds, PELLINARD_YSABEL_MARRIAGE_ID,
      {
        ...DRAIG_GARDE_EURGAIN_PARENTAGE,
        extensions: {
          registryManagedFields: ['partnershipId', 'notes'],
          registryManagedFieldRevisions: { partnershipId: YSABEL_SOURCE_REVISION, notes: YSABEL_SOURCE_REVISION },
          registryManagedFieldPreviousValues: {
            partnershipId: [''],
            notes: ['Ausdrücklich bestätigte Elternschaft; Ehe, Verlobung und heutiger Beziehungsstatus der Eltern bleiben offen.']
          },
          chartPairParentsWithoutPartnership: false,
          registryManagedExtensionFields: ['chartPairParentsWithoutPartnership'],
          registryManagedExtensionFieldRevisions: { chartPairParentsWithoutPartnership: YSABEL_SOURCE_REVISION }
        }
      }
    ) : [],
    timeJumps: [jump],
    lineage: { ...base.lineage, crestSubtitle: martial
      ? 'Bürgerliches Haus · Erhebung noch ausstehend'
      : houseProfile.rankId === 'knight' ? 'Ritterhaus · Tal der Milane' : 'Bürgerliches Haus · Gwynthor' },
    view: { ...base.view, limitGenerations: false },
    extensions: {
      ...base.extensions, blankFamily: false, preparedTimeJump: true, sourceRevision,
      chartLayoutPolicy: 'strict-v1', authoredOn: '2026-11-12',
      ...(roots.length === 1 ? { chartAlignLineageOriginOverPersonId: roots[0] } : {}),
      sourceNote: hasEurgain
        ? `${PREPARED_FAMILY_SOURCE} Die Nutzerbiografie vom 21. November 2026 bestätigt die Ehe von Ysabel und Pellinard. Eurgain bleibt das einzige namentlich belegte ihrer drei Kinder.`
        : PREPARED_FAMILY_SOURCE
    }
  });
}

export const DRAIG_GARDE_COMMONER_HOUSE_FAMILIES = Object.freeze(
  DRAIG_GARDE_COMMONER_HOUSE_DEFINITIONS.map(record => buildFamily({
    id: `haus-${record.slug}`, title: `Haus ${record.name}`, emblem: record.emblem,
    houseProfile: GWYNTHOR_COMMONER_HOUSE_PROFILES[record.slug], martial: record.martial,
    sourceRevision: record.slug === 'brandyddyn' ? YSABEL_SOURCE_REVISION : 1,
    roots: record.members.filter(id => id !== 'eurgain-brandyddyn'),
    members: record.slug === 'brandyddyn' ? [...record.members, 'ysabel-bronnor'] : record.members
  }))
);

export const HOUSE_BRONNOR_FAMILY = buildFamily({
  id: 'haus-bronnor', title: 'Haus Bronnor',
  emblem: TAL_DER_MILANE_HOUSE_EMBLEMS.bronnor,
  houseProfile: TAL_DER_MILANE_HOUSE_PROFILES.bronnor, sourceRevision: YSABEL_SOURCE_REVISION,
  roots: ['ysabel-bronnor'],
  members: ['ysabel-bronnor', 'pellinard-brandyddyn', 'eurgain-brandyddyn']
});
