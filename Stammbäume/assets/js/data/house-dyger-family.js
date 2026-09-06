import { createBlankHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createParentages } from './family-record-builders.js';
import { KLAUENINSEL_HOUSE_EMBLEMS, KLAUENINSEL_HOUSE_PROFILES } from './klaueninseln-house-profiles.js';

const base = createBlankHouseFamily({
  id: 'haus-dyger',
  title: 'Haus Dyger',
  emblem: KLAUENINSEL_HOUSE_EMBLEMS.dyger,
  houseProfile: KLAUENINSEL_HOUSE_PROFILES.dyger,
  description: 'Niederes Rittergeschlecht aus Talgarth auf den Klaueninseln und direkte Rittervasallen des Hauses Arth. Musikanten und Seefahrer mit einer einfachen Musikantenschule in Talgarth. Angesehene Bardenhäuser wie die Ceirwyn belächeln sie als Säufer und Tavernenschläger. Die Dyger bilden keine Barddwyr aus.'
});

export const HOUSE_DYGER_FAMILY = Object.freeze({
  ...base,
  persons: Object.freeze([
    createFamilyPerson({
      id: 'tudur-dyger', name: 'Tudur Dyger', sex: 'male', status: 'alive', houseId: 'house-dyger',
      title: 'Schiffsmusikant Lord Parzifal Arths',
      notes: 'Vater von Rhy Dyger. Dient als Schiffsmusikant auf dem Schiff des Grafen Lord Parzifal Arth. Weitere Lebensdaten, Partnerin und eine mögliche Stellung als Hausoberhaupt sind nicht festgelegt.'
    }),
    createFamilyPerson({
      id: 'rhy-dyger', name: 'Rhy Dyger', sex: 'male', status: 'alive', houseId: 'house-dyger',
      title: 'Morwyr und Schiffsmusikant der Tiefenwyrm',
      portrait: 'assets/images/portraits/haus-dyger/rhy-dyger.png',
      tags: ['Rüdiger', 'Seefahrer', 'Musikant'],
      notes: '27 Jahre. Sohn Tudur Dygers. Von Parzifal Arth gemeinsam mit Ifor Beryn in Idwal Draigs neu gegründete Mannschaft entsandt. Parzifal prägte den Rufnamen Rüdiger. Morwyr mit musikalischem Talent und amateurhaften Zaubertricks, kein ausgebildeter Barddwyr. Mutter und weitere Angehörige sind noch nicht benannt.',
      extensions: { almanachCharacterId: 'tiefenwyrm--rhy-dyger' }
    })
  ]),
  parentages: Object.freeze(createParentages(['rhy-dyger'], ['tudur-dyger'], '', {
    legitimacy: 'unknown', notes: 'Vater-Sohn-Beziehung ausdrücklich durch den Benutzer belegt. Keine Mutter oder Ehe festgelegt.'
  })),
  lineage: Object.freeze({ ...base.lineage, crestFrame: 'silver' }),
  view: Object.freeze({ ...base.view, focusPersonId: 'tudur-dyger' }),
  extensions: Object.freeze({
    ...base.extensions,
    blankFamily: false,
    sourceRevision: 1,
    pendingFamilySituation: Object.freeze({
      source: 'Benutzervorgaben vom 06.09.2026',
      knownParentage: 'Tudur Dyger ist der Vater von Rhy Dyger.',
      openQuestions: Object.freeze(['Rhys Mutter und weitere Angehörige', 'Tudurs Lebensdaten und Partnerin', 'Weitere Generationen und Hausoberhaupt'])
    })
  })
});
