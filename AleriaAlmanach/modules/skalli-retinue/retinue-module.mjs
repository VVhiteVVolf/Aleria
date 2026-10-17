import { RETINUE_ID, RETINUE_ART, RETINUE_EMBLEM, RETINUE_PEOPLE, RETINUE_EXISTING_IDS, retinuePerson } from './retinue-people.mjs';
import { buildRetinueHierarchy } from './retinue-hierarchy.mjs';
import { migrateGroupLandingEntry } from '../landing/group-landing-migration.js';
import { normalizeGroupLandingState } from '../landing/group-landing-model.js';
import { collectGroupRoster } from '../landing/group-landing-roster.js';

export const RETINUE_TRAINING_TEXT = 'Gundel Varulv und Svala Bärenherz lernen als Skallis persönliche Maer, der aldrimarischen Bezeichnung für weibliche Knappen. Embla Varulv gehört ebenfalls zum weiblichen Nachwuchs. Kjell Rotstahl wird von Torben als Drengr ausgebildet; auch Hati Varulv gehört zum jungen Nachwuchs der Schar.';
const p = text => `<p>${text}</p>`;
const art = name => ({ image: `${RETINUE_ART}/${name}.png`, imageWidth: 40, imageTall: true, imageFit: 'contain', imagePosition: 'center' });

export function buildSkalliRetinue(biographySource) {
  const skalli = retinuePerson('skalli-varulv');
  const entry = { id: RETINUE_ID, title: 'Skallis Gefolge', subtitle: 'Junge Klingen im Dienst Roriksheims',
    type: 'Kriegerschar', category: 'Aldrimar · Roriksheim · Haus Varulv',
    image: `${RETINUE_ART}/skalli-fenrir-freya-v2.png`, previewImage: `${RETINUE_ART}/skalli-fenrir-freya-v2.png`,
    symbol: RETINUE_EMBLEM, icon: '✦', stamp: 'RORIKSHEIM · GEFÄHRTEN · HEIMAT', schemaVersion: 1,
    multipage: true, appendCommentsPage: true, enablePageComments: true,
    sessionCast: RETINUE_PEOPLE.map(person => RETINUE_EXISTING_IDS[person.key] || person.worldPersonId),
    pages: [
      { pageTitle: 'Skallis Gefolge', ...art('skalli-fenrir-freya-v2'), commentThreadKey: 'skalli-intro',
        stats: [['Art', 'Kriegerschar'], ['Heimat', 'Roriksheim · Aldrimar'], ['Unterstellung', 'Kriegsherr von Roriksheim'], ['Anführerin', 'Skalli Varulv'], ['Rechte Hand', 'Ragna Bärenherz'], ['Linke Hand', 'Torben Rotstahl']],
        description: p('Wo in Roriksheim die Not am größten ist, soll Skallis Gefolge helfen. Die Kriegerschar untersteht dem Kriegsherrn von Roriksheim; Skalli besitzt zugleich den Freiraum, mit ihren Gefährten dorthin zu ziehen, wo es am heftigsten brennt.') +
          p('Um sie sammeln sich junge Sprösslinge der Clans: Vettern und Geschwister, Freunde, Huskarle und Walküren. Viele kommen aus adligen Familien. Gemeinsam lernen sie, dass ein Name allein noch niemanden schützt. Auf den Wegen zwischen den Ortschaften, beim Wachdienst und am gemeinsamen Feuer wachsen aus den jungen Clansleuten Gefährten, die Verantwortung füreinander tragen.') +
          p('Ragna Bärenherz und Torben Rotstahl stehen Skalli als rechte und linke Hand zur Seite. Zwischen Waffenübungen und Einsätzen bleibt Raum für Freyas Laute, offene Worte und den Streit darüber, wer die nächste Wache übernimmt. Die Jüngsten ziehen als Maer und Drengr mit und lernen unter den Augen ihrer älteren Gefährten.'), commentSequence: [] },
      { pageTitle: 'Skalli Varulv', biographyPage: true, image: skalli.portrait, imageWidth: 38, imageTall: true, imageFit: 'contain', commentThreadKey: 'skalli-biography',
        stats: [['Name', skalli.name], ['Geboren', '1716 · 24 Jahre'], ['Eltern', 'Sleipnir Varulv und Svantje, geb. Skaal'], ['Heimat', 'Roriksheim'], ['Aufgabe', 'Anführerin der Kriegerschar']],
        biography: { biographyTitle: 'Eine Beschützerin ihrer Heimat', biographyText: biographySource.biographyText,
          abilitiesTitle: 'Wesen und Führung', abilities: biographySource.abilities,
          historyTitle: 'Ein eigenes Gefolge', historyText: biographySource.retinueText + p(RETINUE_TRAINING_TEXT),
          worksTitle: 'Für ihre Heimat', works: biographySource.works,
          triviaTitle: 'Eigenarten', trivia: biographySource.trivia,
          quotesTitle: 'Wünsche und Haltung', quotes: biographySource.quotes,
          connectionsTitle: 'An ihrer Seite', connections: ['ragna-baerenherz', 'torben-rotstahl', 'fenrir-varulv', 'freya-skald'].map(key => {
            const person = retinuePerson(key); return { name: person.name, detail: person.role, image: person.portrait, imageFormat: 'portrait', link: person.link };
          }), documentsTitle: 'Familie', documents: [{ title: 'Clan Varulv', text: 'Skallis Familienakte.', icon: RETINUE_EMBLEM, link: skalli.link }], footer: 'Skalli Varulv · Roriksheim' } },
      { pageTitle: 'Hierarchie der Kriegerschar', hierarchyPage: true, commentThreadKey: 'skalli-hierarchy', hierarchy: buildRetinueHierarchy(), commentSequence: [] },
      { pageTitle: 'Am Lagerfeuer', ...art('lagerfeuer-v2'), sessionPage: true, commentThreadKey: 'skalli-camp',
        sessionIntro: 'Zwischen den Zelten brennt ein kleines Feuer. Skalli sitzt mit Ragna, Torben, Fenrir und Freya im warmen Licht; die Laute begleitet das leise Gespräch. Für einen Augenblick dürfen Berichte und Waffen ruhen.',
        sessionHint: 'Eine Begegnung, ein Gespräch oder der nächste Auftrag der Schar beginnt hier.',
        sessionEmptyTitle: 'Ein Platz am Feuer', sessionEmptyText: 'Das Lager wartet auf die nächste Geschichte seiner Gefährten.',
        sessionDateAleria: { year: null, month: null, day: null }, commentSequence: [] }
    ].map(page => ({ schemaVersion: 1, ...page })) };
  const result = migrateGroupLandingEntry(entry, { tab: 'Gruppen' });
  const overview = result.pages.find(page => page.landingPage);
  overview.commentThreadKey = 'skalli-overview';
  overview.landing.memberTitle = 'Die Gefährten der Schar';
  overview.landing.subtitle = 'Gemeinsame Wege, Aufgaben und Ausbildung';
  overview.landing.group = normalizeGroupLandingState({ location: 'Roriksheim',
    members: collectGroupRoster(result).map(person => ({ id: person.id, assignment: 'active' })) });
  return result;
}
