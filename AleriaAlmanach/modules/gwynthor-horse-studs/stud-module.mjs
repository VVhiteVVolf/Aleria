import { STUD_PLACES, STUD_SECTION } from './stud-places.mjs';
import { STUD_ART, buildStudHorseCatalog, buildStudSaddleryCatalog } from './stud-catalog.mjs';
import { STUD_PEOPLE, studPerson } from './stud-people.mjs';
import { buildStudHierarchy } from './stud-hierarchy.mjs';
import { buildStudEconomy } from './stud-economy.mjs';
const paragraphs = (...texts) => texts.map(text => `<p>${text}</p>`).join('');
const illustration = (venue, room) => ({ image: `${STUD_ART}/scenes/${venue.key}-${room}-v${venue.key === 'rhosmere' && room === 'verkaufsraum' ? 2 : 1}.png`, imageWidth: 36, imageTall: true, imageFit: 'cover', imagePosition: 'center' });
const familyLink = venue => `../Stammbäume/Stammbaum.html?family=${venue.familyId}&mode=view`;
const partnership = 'Die Gilde kann Siedlungen pachten, Pferde kaufen oder mit eigenständigen Aufzuchtbetrieben zusammenarbeiten. Bei Partnerschaften werden Investitionen, Weide- und Aufzuchtleistungen, Tier-/Eigentumsanteile und Erlösbeteiligungen vereinbart. Betreiber, Gilde und zuständiger Lehnsherr handeln gemeinsam; die Zustimmung des Adels und bestehende Pacht- und Abgabenansprüche bleiben erhalten. Das Pferd kann ganz oder teilweise der Gilde gehören, während der Hof beim Betreiber bleibt.';
function guildBiography(venue) {
  return { pageTitle: venue.key === 'halenrhyd' ? 'Gestütsbio · Die Halenrhyd' : 'Zunftsbio · Rhosmeres Rösser', commentThreadKey: `${venue.key}-betrieb-bio`,
    biographyPage: true, ...illustration(venue, 'stall'), biography: { biographyTitle: 'Betrieb, Herkunft und Verbindungen', biographyText: paragraphs(venue.history,
      venue.key === 'rhosmere' ? partnership : 'Die Halenrhyd verbinden direkten Pferdehandel mit dem eigenen Familiengestüt und der eigenen Landwirtschaft. Die Sattlerei bietet passende Ausrüstung und Reparaturen. Die Dienstbindung an Wyrm bleibt dabei bestehen; aus ihrem Ratssitz entsteht kein Eigentum an anderen Betrieben.',
      venue.key === 'rhosmere' ? 'Die Marchwern liefern Pferde direkt an die Gilde. Als Vasallen der Wyrm erfüllen sie einen Teil ihres Pacht- und Abgabensolls in Pferden; nur über ihren verfügbaren Anteil können sie selbst verfügen. Neue Aufzuchtpartnerschaften werden deshalb mit dem Hof und den Wyrm abgestimmt. Feste Quoten sind nicht pauschal vorgegeben.' : 'Gorweth und Eirfena leben beim Stadtbetrieb. Bryndors Haushalt führt die Landzucht; Odrigs Haushalt trägt Futterwirtschaft, Getreide und Vieh. Angehörige haben eigene Aufgaben und Wohnorte, ohne den Familienzusammenhang zu verlieren.'),
      worksTitle: 'Arbeitsbereiche', works: ['Ankauf, Herkunftsprüfung und Verkauf', 'Zucht, Aufzucht und fachliche Bereitung', 'Sattlerei, Riemenwerk und Hufpflege', venue.connections],
      documentsTitle: 'Familie und Fachwissen', documents: [{ title: 'Die Familie im Stammbaum', text: 'Verwandtschaft, Ehe und familiäre Herkunft.', link: familyLink(venue) },
        { title: 'Zuchtbuch und Nachzuchtrechner', text: 'Rassenwissen und bestehende Nachzuchtberechnung.', link: '../Bestiarium/tiere/pferde/zuchtbuch/' }],
      footer: venue.key === 'rhosmere' ? 'Globale Gilde · in Rhosmere gegründet · Niederlassung Gwynthor' : 'Bürgerliche Familie · im Dienst Haus Wyrms · ein Sitz im Achterrat' } };
}
function ownerBiography(venue) {
  const owner = studPerson(venue.ownerId), wife = studPerson(venue.wifeId);
  return { pageTitle: `${venue.key === 'rhosmere' ? 'Standortleiter' : 'Inhaber'} · ${owner.name}`, commentThreadKey: `${venue.key}-leitung-bio`, biographyPage: true,
    image: owner.portrait, imageWidth: 36, imageTall: true, imageFit: 'cover', imagePosition: 'center top', biography: {
      biographyTitle: `${owner.name} · ${owner.age} Jahre`, biographyText: paragraphs(owner.notes,
        venue.key === 'rhosmere' ? 'Maelrig ist ein kräftiger älterer Mann mit grauem Haar und grauem Bart. Er tritt nüchtern und geschäftsmäßig auf, prüft Angebote genau und handelt wirtschaftlich. Seine Haltung ist weder arglistig noch weichherzig: Herkunft, Kosten und verlässliche Leistung müssen stimmen. Die Niederlassung gehört zur Gilde; er führt sie als Standortleiter.' : 'Gorweth kennt den Ankauf ebenso wie den Alltag der eigenen Zucht. Er verbindet die drei Familienzweige und vertritt ihre Interessen nach außen. Pferdekenntnis und kaufmännische Verantwortung liegen für ihn nahe beieinander.'),
      connectionsTitle: 'Seine Frau und Mitverantwortliche', connections: [{ name: wife.name, detail: `${wife.age} Jahre · ${wife.title}. ${wife.notes}`, image: wife.portrait, imageFormat: 'portrait' }],
      documentsTitle: 'Verwandtschaft', documents: [{ title: 'Zum Familienbaum', text: venue.key === 'rhosmere' ? 'Maelrig und Kyria · noch keine Kinder. Weitere Caeffyn-Verwandte werden zunächst übersprungen.' : 'Drei Betriebszweige und mehrere Generationen der Familie Halenrhyd.', link: familyLink(venue) }],
      footer: venue.key === 'rhosmere' ? 'Kyria behält ihre Aurdden-Abstammung und führt die Standortfinanzen.' : 'Stadtgestüt · Landzucht · eigener Futterhof' } };
}
export function buildStudModule(venue) {
  const cast = venue.key === 'halenrhyd' ? STUD_PEOPLE.filter(p => p.familyId === 'haus-halenrhyd' && p.status === 'alive') : [studPerson(venue.ownerId), studPerson(venue.wifeId)];
  const entry = { id: venue.id, title: venue.title, subtitle: venue.subtitle, type: 'Gestüt & Pferdehandel', category: 'Gwynthor-Stadt',
    symbol: venue.sign, icon: '♞', stamp: venue.key === 'halenrhyd' ? 'HALENRHYD · ZUM SILBERHALM' : 'RHOSMERES RÖSSER · GWYNTHOR',
    image: illustration(venue, 'verkaufsraum').image, previewImage: illustration(venue, 'verkaufsraum').image, schemaVersion: 1, multipage: true,
    appendCommentsPage: false, enablePageComments: true, sessionCast: cast.map(p => p.worldPersonId), pages: [
      { pageTitle: venue.title, commentThreadKey: `${venue.key}-einleitung`, ...illustration(venue, 'verkaufsraum'), description: paragraphs(venue.introduction,
        'Rhyfel, Ceffyl, Hest und Tirashan stehen neben gezielten Veredelungen und angekauften Mischlingen im Angebot. Die benannten Einzelpferde haben eigene Herkunftsgeschichten; in der Sattlerei finden Reiter passende Ausrüstung.'),
        stats: [['Ort', 'Gwynthor-Stadt'], ['Betrieb', venue.subtitle], ['Leitung', studPerson(venue.ownerId).name], ['Verbindungen', venue.connections]] },
      guildBiography(venue), ownerBiography(venue),
      { pageTitle: 'Hierarchie · Die gesamte Rosszucht', commentThreadKey: `${venue.key}-hierarchie`, hierarchyPage: true, hierarchy: buildStudHierarchy(venue, STUD_PEOPLE) },
      { pageTitle: 'Güterregister · Pferde', commentThreadKey: `${venue.key}-pferde`, tradeCatalogPage: true, tradeCatalog: buildStudHorseCatalog(venue) },
      { pageTitle: 'Güterregister · Sattlerei', commentThreadKey: `${venue.key}-zubehoer`, tradeCatalogPage: true, tradeCatalog: buildStudSaddleryCatalog(venue) },
      ...[['verkaufsraum', 'Verkaufsraum', venue.saleIntro], ['stall', 'Stall', venue.stallIntro], ['sattlerei', 'Sattlerei', venue.saddleryIntro]].map(([key, title, intro]) => ({
        pageTitle: `Szene · ${title}`, commentThreadKey: `${venue.key}-szene-${key}`, sessionPage: true, ...illustration(venue, key), sessionIntro: paragraphs(intro),
        sessionLocation: `${venue.title} · ${title}`, sessionHint: 'Eine Beratung, Pferdevorstellung, Übergabe oder ein Besuch kann diese Szene beginnen.',
        sessionEmptyTitle: title, sessionEmptyText: 'Der Raum ist bereit für die nächste Begegnung.', sessionDateAleria: { year: null, month: null, day: null } }))
    ].map(page => ({ schemaVersion: 1, ...page })) };
  entry.pages.push(buildStudEconomy(entry, venue, STUD_PEOPLE));
  return entry;
}
export function buildStudRegistrations() { return STUD_PLACES.map(venue => ({ ...STUD_SECTION, description: venue.subtitle, icon: venue.sign, entry: buildStudModule(venue) })); }
