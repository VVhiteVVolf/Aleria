import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createParentages } from './family-record-builders.js';
import { CADWGAN_FAMILY_EMBLEM, CADWGAN_ID, CADWGAN_NAME, CADWGAN_PORTRAIT, CADWGAN_WORLD_PERSON_ID } from '../../../../AleriaAlmanach/modules/schwarze-zitteraale/sumpfnattern-people.mjs';
import { buildCadwganBiography } from '../../../../AleriaAlmanach/modules/schwarze-zitteraale/sumpfnattern-biography.mjs';

const id = 'haus-bwach';
const houseId = 'house-bwach';
const description = 'Haus Bwach übte früher unter den Gafyr die Herrschaft über Gwaulwyn aus. Heute gilt das Haus als ausgestoßen. Gwaulwyn steht weiterhin unter Haus Gafyr.';
const base = createFounderTimeJumpPlaceholderHouseFamily({
  id, title: 'Haus Bwach', emblem: CADWGAN_FAMILY_EMBLEM, description,
  houseProfile: {
    rankId: 'unknown', kingdom: 'Cenyr', county: 'Celtigerns Wacht',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Herrschaft der Gafyr', 'Gwaulwyn'],
    folderIcons: ['assets/images/regions/koenigreich-cenyr.png', 'assets/images/regions/celtigerns-wacht.png',
      'assets/images/houses/Llamreis Ankunft/haus-gafyr.png', 'assets/images/regions/Cenyr/Celtigerns Wacht/Llamreis Ankunft/Gwaulwyn.png']
  },
  toYear: 'unbekannt', timeJumpLabel: 'Nicht überlieferte Generationen bis Cadwgan'
});
const founderMarriage = { ...base.partnerships[0], status: 'ended', certainty: 'unknown', notes: '' };
const member = createFamilyPerson({
  id: 'cadwgan-bwach', worldPersonId: CADWGAN_WORLD_PERSON_ID, name: CADWGAN_NAME,
  houseId, sex: 'male', status: 'alive', portrait: CADWGAN_PORTRAIT, title: 'Die Grüne Natter',
  extensions: { characterId: CADWGAN_ID, biographyModule: buildCadwganBiography() }
});
const gap = { ...base.timeJumps[0], childIds: [member.id], fromYear: '', toYear: '', extensions: { preparedPlaceholder: false } };

export const HOUSE_BWACH_FAMILY = Object.freeze({
  ...base,
  houses: [{ ...base.houses[0], status: 'outcast' }],
  persons: [...base.persons.map(person => createFamilyPerson({
    ...person, name: person.sex === 'female' ? 'Unbekannte Gründerin' : 'Unbekannter Gründer',
    title: '', status: 'dead', death: '', notes: 'Name und Lebensdaten sind nicht überliefert.'
  })), member],
  partnerships: [founderMarriage],
  parentages: createParentages([member.id], founderMarriage.participantIds, founderMarriage.id, {
    type: 'claimed', certainty: 'unknown',
    notes: 'Cadwgan ist als Angehöriger des Hauses belegt. Die einzelnen Zwischengenerationen sind offen.',
    extensions: { timeJumpId: gap.id }
  }),
  timeJumps: [gap],
  lineage: { ...base.lineage, crestSubtitle: 'Ausgestoßen · ehemals über Gwaulwyn' },
  view: { ...base.view, focusPersonId: member.id, limitGenerations: false },
  extensions: {
    ...base.extensions, blankFamily: false, sourceRevision: 1, chartLayoutPolicy: 'strict-v1',
    historicalStatus: 'outcast',
    houseBiographyModule: {
      schema: 'aleria.house-module', schemaVersion: 1, pageTitle: 'Haus Bwach', housePage: true, description,
      stats: [['Voller Name', 'Haus Bwach'], ['Status', 'Ausgestoßen'], ['Ehemalige Herrschaft', 'Gwaulwyn']],
      house: {
        crestImage: CADWGAN_FAMILY_EMBLEM,
        biographyTitle: 'Haus Bwach aus Gwaulwyn', biographyText: description,
        historyTitle: 'Wappen und Überlieferung',
        historyText: 'Im Wappen zertritt ein heller Geißbock eine grüne Natter. Weinrot, Elfenbein und Dunkelgrün sind die überlieferten Hausfarben. Cadwgan Bwach ist als lebender Angehöriger bekannt.',
        documentsTitle: 'Überlieferte Angehörige', documents: [{
          title: 'Cadwgan Bwach', text: 'Die Grüne Natter · Die Sumpfnattern',
          link: '/AleriaAlmanach/AleriaAlmanach.html?entry=zitteraale-gruppe-ii'
        }]
      }
    },
    sourceNote: 'Nutzerfestlegung vom 22.11.2026 zur ehemaligen Herrschaft über Gwaulwyn und zum Status Ausgestoßen. Cadwgan, Porträt und Wappen stammen aus der bestehenden Sumpfnattern-Akte. Zeitpunkt, Anlass der Ausstoßung und weitere Familienmitglieder bleiben offen.'
  }
});
