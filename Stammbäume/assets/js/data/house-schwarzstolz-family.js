import { createBlankHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson } from './family-record-builders.js';
import { KRAEHENMOOR_HOUSE_EMBLEMS, KRAEHENMOOR_HOUSE_PROFILES } from './kraehenmoor-house-profiles.js';

const base = createBlankHouseFamily({
  id: 'haus-schwarzstolz',
  title: 'Clan Schwarzstolz',
  emblem: KRAEHENMOOR_HOUSE_EMBLEMS.schwarzstolz,
  houseProfile: KRAEHENMOOR_HOUSE_PROFILES.schwarzstolz,
  description: 'Clan aus Eldvik im Hesirentum von Schwarzfjord. Sindre Brandstolz stammt als Bastard aus diesem Clan und kehrte ihm den Rücken, nachdem man ihn und seine Mutter nicht mehr dort haben wollte. Weitere Angehörige und die genaue Stellung des Clans werden noch ausgearbeitet.'
});

const familySituation = Object.freeze({
  source: 'Benutzervorgaben vom 06.09.2026',
  characterId: 'tiefenwyrm--sindre-brandstolz',
  age: 24,
  father: 'Angehöriger des Clans Schwarzstolz; Name und genaue Zuordnung noch offen.',
  mother: 'Name noch offen. Sie und Sindre waren im Clan nicht mehr erwünscht. Ihr heutiger Verbleib ist nicht festgelegt.',
  halfBrother: 'Schwarzstolz-Halbbruder, Name und genaue Zuordnung noch offen. Drückte Sindres Gesicht bei einer eskalierten Prügelei in die Herdglut; seitdem Brandnarbe und Augenklappe.',
  openQuestions: Object.freeze(['Namen und Lebensdaten der Angehörigen', 'Genaue Eltern- und Halbbruderzuordnung', 'Heutiger Verbleib der Mutter', 'Rang und Lehnsherr des Clans'])
});

export const HOUSE_SCHWARZSTOLZ_FAMILY = Object.freeze({
  ...base,
  persons: Object.freeze([createFamilyPerson({
    id: 'sindre-brandstolz',
    name: 'Sindre Brandstolz',
    sex: 'male',
    status: 'alive',
    houseId: 'house-schwarzstolz',
    familyRole: 'bastard',
    title: 'Bootsmann der Tiefenwyrm',
    portrait: 'assets/images/portraits/haus-schwarzstolz/sindre-brandstolz.png',
    tags: ['Verstoßen', 'Seefahrer'],
    notes: '24 Jahre. Bastard des Clans Schwarzstolz. Verließ den Clan, als er und seine Mutter dort nicht mehr erwünscht waren. Sein unbenannter Halbbruder verursachte bei einer Prügelei durch Herdglut die Brandnarbe im Gesicht; seither trägt Sindre eine Augenklappe. Nach einem Schiffbruch von Idwals Mannschaft als einziger Überlebender gerettet, heute Bootsmann der Tiefenwyrm. Namen und genaue Zuordnung der Eltern und des Halbbruders bleiben offen.',
    extensions: { almanachCharacterId: familySituation.characterId, pendingFamilySituation: familySituation }
  })]),
  view: Object.freeze({ ...base.view, focusPersonId: 'sindre-brandstolz' }),
  extensions: Object.freeze({
    ...base.extensions,
    blankFamily: false,
    sourceRevision: 1,
    pendingFamilySituation: familySituation
  })
});
