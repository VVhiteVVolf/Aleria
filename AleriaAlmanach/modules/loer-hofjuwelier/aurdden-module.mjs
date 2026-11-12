import { POST_SECTION } from '../klingende-muenze-gwynthor/post-section.mjs';
import { AURDDEN_ART, AURDDEN_BROTHERS, AURDDEN_PEOPLE, AURDDEN_STAFF } from './aurdden-people.mjs';
import { buildAurddenCatalog } from './aurdden-catalog.mjs';
import { buildAurddenHierarchy } from './aurdden-hierarchy.mjs';
import { buildAurddenServicesPage } from './aurdden-services.mjs';
import { buildAurddenEconomyPage } from './aurdden-economy.mjs';

export const AURDDEN_MODULE_ID = 'der-sternenfang-aurdden';
export const AURDDEN_SECTION = POST_SECTION;
const paragraphs = (...texts) => texts.map(text => `<p>${text}</p>`).join('');
const illustration = key => ({ image: `${AURDDEN_ART}/${key}.png`, imageWidth: 36, imageTall: true, imageFit: 'cover', imagePosition: 'center' });
export const AURDDEN_ROOMS = Object.freeze([
  { key: 'verkaufsraum', title: 'Der Verkaufsraum', intro: 'Tageslicht fällt durch hohe Bleiglasfenster auf Vitrinen aus dunklem Holz. Goldene Zierleisten rahmen nachtblaue Samtflächen; Ringe, Ketten und steinbesetzte Arbeiten liegen mit großzügigem Abstand in der Auslage. Weinrote Vorhänge schirmen die ruhigeren Räume ab.', hint: 'Beratung, Auswahl und die geprüfte Übergabe fertiger Schmuckstücke beginnen hier.' },
  { key: 'beratungssalon', title: 'Der Beratungssalon', intro: 'Hinter schweren Vorhängen steht ein runder, fein gearbeiteter Tisch. Drei gepolsterte Stühle, verschlossene Schmuckkästchen und eine leere Vorlage aus blauem Samt schaffen Raum für ein vertrauliches Gespräch. Der Lärm des Verkaufsraums bleibt gedämpft.', hint: 'Hier lassen sich ein persönlicher Entwurf, ein Erbstück oder ein besonderer Loer-Auftrag besprechen.' },
  { key: 'werkstatt', title: 'Die Goldschmiedewerkstatt', intro: 'An ausgeschnittenen Werkbänken liegen Zangen, Feilen und kleine Handhämmer bereit. Lederne Auffangschürzen bewahren die Späne; Schubladen trennen Metall, Besatz und angenommene Arbeiten. Helles Fensterlicht erreicht die feinen Arbeitsplätze. Ein kleiner Kohlenherd steht in einer steinernen Nische.', hint: 'Werkstattbesuche und Begutachtungen erfolgen nach Absprache. Fassungen, Reparaturen und Sonderanfertigungen werden unter fachlicher Verantwortung bearbeitet.' }
]);

function biographyPage() {
  const branch = ids => AURDDEN_PEOPLE.filter(person => ids.includes(person.id)).map(person => person.name).join(', ');
  return { pageTitle: 'Die Aurdden · drei Linien im Juwelierhaus', commentThreadKey: 'sternenfang-familie', biographyPage: true,
    ...illustration('beratungssalon'), biography: { biographyTitle: 'Goldschmiede im Dienst der Loer',
      biographyText: paragraphs('Die wohlhabende bürgerliche Familie Aurdden ist mit dem ritterlichen Haus Loer durch Dienst, gemeinsame Geschäfte und wiederkehrende Heiraten verbunden. Die Loer liefern Rohmaterial und erhalten einen Anteil am Ertrag; die Aurdden verantworten Entwurf, Verarbeitung und Verkauf. Im Sternenfang führen drei Brüder dieselbe Werkstatt und denselben Laden.',
        ...AURDDEN_BROTHERS.map(person => `<strong>${person.name}</strong> · ${person.notes}`),
        'Ihre Eltern Iwrwyn und Brenella sind bereits verstorben. Die Schwestern Cyrwen und Lleirena sind in noch unbekannte Häuser wegverheiratet und arbeiten nicht im Juwelier. Auch Avelin, Kyrwyns älteste Tochter, hat als wegverlobte Braut Aeron Loers keine Ladenaufgabe.',
        'Saithens unehelicher Sohn Cyrion ist 22 Jahre alt, trägt keinen Familiennachnamen und hat mit dem Geschäft nichts zu tun. Seine Mutter bleibt unbekannt. Die jüngeren Kinder wachsen im Familienhaushalt auf; sie erhalten keinen eigenständigen Ladenposten.',
        'Das Bankgeschäft liegt beim eigenen Vetternzweig um Pereth Aurdden und Uffyria mit Ellric, Kyria und Neddan. Dieser Zweig bleibt im Stammbaum sichtbar und erhält vorerst keine Porträts. Er leitet weder die Rote Bank noch besitzt er ein Münzprägerecht.'),
      connectionsTitle: 'Die drei Brüder', connections: AURDDEN_BROTHERS.map(person => ({ name: person.name, detail: `${person.age} Jahre · ${person.title}`, image: person.portrait, imageFormat: 'portrait' })),
      worksTitle: 'Die drei Familienlinien', works: [
        `Kyrwyn und Avelena: ${branch(['avelin-aurdden', 'iwria-aurdden', 'dyrwen-aurdden', 'saithwen-aurdden'])}.`,
        `Thalan und Firwen: ${branch(['kyran-aurdden', 'gwaeden-aurdden', 'janeth-aurdden'])}.`,
        `Saithen und Perdella: ${branch(['oenric-aurdden', 'helygen-aurdden', 'thalric-aurdden', 'nerella-aurdden', 'iwrin-aurdden', 'firian-aurdden'])}; außerdem Cyrion aus einer Affäre.`
      ], footer: 'Der vollständige Stammbaum zeigt auch die älteren Generationen und den getrennten Bankzweig.' } };
}

export function buildAurddenModule() {
  const entry = { id: AURDDEN_MODULE_ID, title: 'Der Sternenfang', subtitle: 'Aurdden · Gwynthors vornehmster Juwelier und Goldschmied',
    type: 'Juwelier & Goldschmiede', category: 'Klingende Münze · Gwynthor-Stadt', symbol: `${AURDDEN_ART}/schild.png`, icon: '✦', stamp: 'AURDDEN · LOER',
    image: `${AURDDEN_ART}/verkaufsraum.png`, previewImage: `${AURDDEN_ART}/verkaufsraum.png`, schemaVersion: 1, multipage: true,
    appendCommentsPage: false, enablePageComments: true, sessionCast: AURDDEN_STAFF.map(person => person.characterId), pages: [
      { pageTitle: 'Der Sternenfang', commentThreadKey: 'sternenfang-laden', ...illustration('verkaufsraum'),
        description: paragraphs('Ein goldener Schwan hebt sich über dunkle Wellen, drei blaue Sterne leuchten auf purpurnem Grund. Das bemalte Holzschild hängt an zwei geschmiedeten Scharnierbeschlägen über dem Eingang zum <strong>Sternenfang</strong>, dem vornehmsten Juwelier und Goldschmied Gwynthors im Bezirk der Klingenden Münze.',
          'Hohe Fenster, dunkles edles Holz, goldene Einfassungen und tiefer blauer Samt geben den Arbeiten einen großzügigen Rahmen. Die Auslage reicht vom sorgfältig gearbeiteten Silberring bis zum großen steinbesetzten Festschmuck. Wer hier bestellt, bezahlt für ausgesuchte Materialien, aufwendige Fassungen und die Zeit erfahrener Hände.',
          'Kyrwyn, Thalan und Saithen Aurdden führen das Haus gemeinsam. Ihre Familie dient den Loer und übernimmt deren Goldschmiede- und Juwelierarbeiten. Auch vermögende Privatkundschaft findet Beratung, ausgesuchte Handelssteine und eigene Entwürfe. Vertrauliche Wünsche werden im Salon besprochen; gefertigt wird in der angeschlossenen Werkstatt.'),
        stats: [['Ort', 'Klingende Münze · Gwynthor-Stadt'], ['Familie', 'Aurdden · wohlhabende bürgerliche Goldschmiede'], ['Dienstherr', 'Ritterhaus Loer'], ['Schmucksortiment', '95–14.500 Kupfertaler']],
        quote: 'Was die Tiefe birgt, bringen wir ans Licht.', quoteBy: 'Aurdden' },
      biographyPage(),
      { pageTitle: 'Stammbaum · Familie Aurdden', commentThreadKey: 'sternenfang-stammbaum', familyTreePage: true,
        familyTree: { familyId: 'haus-aurdden', source: '../Stammb%C3%A4ume/Stammbaum.html?family=haus-aurdden&mode=view', title: 'Familie Aurdden', height: 760,
          intro: 'Die drei Juwelierslinien und der eigene Bankzweig. Unbekannte Gründer und die nicht überlieferten Zwischengenerationen bleiben als solche sichtbar.' } },
      { pageTitle: 'Hierarchie · Laden und Werkstatt', commentThreadKey: 'sternenfang-hierarchie', hierarchyPage: true, ...illustration('verkaufsraum'), hierarchy: buildAurddenHierarchy() },
      ...[['ringe', 'Ringe'], ['amulette', 'Amulette'], ['schmuck', 'Weiterer Schmuck'], ['rohstoffe', 'Rohmaterialien']].map(([key, title]) => ({
        pageTitle: `Sortiment · ${title}`, commentThreadKey: `sternenfang-${key}`, tradeCatalogPage: true, tradeCatalog: buildAurddenCatalog(key) })),
      buildAurddenServicesPage(),
      ...AURDDEN_ROOMS.map(room => ({ pageTitle: room.title, commentThreadKey: `sternenfang-${room.key}`, sessionPage: true, ...illustration(room.key),
        sessionIntro: room.intro, sessionHint: room.hint, sessionEmptyTitle: room.title, sessionEmptyText: 'Der Raum ist bereit für die nächste Szene.', sessionDateAleria: { year: null, month: null, day: null } }))
    ].map(page => ({ schemaVersion: 1, ...page })) };
  entry.pages.push(buildAurddenEconomyPage(entry));
  return entry;
}
