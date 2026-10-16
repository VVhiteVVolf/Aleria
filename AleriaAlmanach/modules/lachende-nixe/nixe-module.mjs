import { NIXE_ART, SONNENFELS_EMBLEM, nixePerson } from './nixe-family-people.mjs';
import { buildNixeHierarchy } from './nixe-hierarchy.mjs';
import { buildNixeCatalog } from './nixe-catalog.mjs';
import { NIXE_ROOMS } from './nixe-rooms.mjs';
import { expandGuestVacancies } from '../guest-register/guest-register-vacancies.mjs';
import { buildNixeServicesPage } from './nixe-services.mjs';

const traitIcons = [
  '../IconOrdner/Cktraits/Trait_education_diplomacy_3.png',
  '../IconOrdner/Cktraits/Trait_education_stewardship_3.png',
  '../IconOrdner/Big Traits/Trait_patient.png',
  '../IconOrdner/Cktraits/Trait_education_intrigue_3.png'
];

/** Editorial completion of the captured module. Original page identities and
 * owner prose remain the source of truth; new sections are appended explicitly. */
export function completeLachendeNixe(source, catalogs) {
  const entry = structuredClone(source);
  entry.image = entry.previewImage = `${NIXE_ART}/scenes/aussenansicht.png`;
  entry.symbol = `${NIXE_ART}/references/schild.png`;
  if (/^[\s.…—-]+$/.test(entry.pages[0].quote || '')) {
    entry.pages[0].quote = '„Ein guter Abend endet selten dort, wo er begonnen hat.“';
    entry.pages[0].quoteBy = '— Albrecht Sonnenfels';
  }
  for (const room of NIXE_ROOMS) {
    const page = entry.pages[room.page];
    Object.assign(page, { image: `${NIXE_ART}/scenes/${room.id}.png`, imageWidth: 30,
      imageTall: true, imageFit: 'cover', imagePosition: 'center' });
    delete page.imageSquare;
    if (room.title) page.pageTitle = room.title;
    if (room.intro) page.sessionIntro = room.intro;
  }
  const bio = entry.pages[1].biography;
  bio.abilities.forEach((ability, index) => { ability.icon = traitIcons[index]; });
  bio.extraSections.push({ title: 'Das Haus und seine Menschen', text: '<p>Johanna hält den Alltag zusammen, Simon die Unruhe von der Tür fern und David die Bücher in Ordnung. Rosalinde übernimmt Briefe und besondere Empfangstermine; Kaspar kennt die Wege zu den Lieferanten. Über die Verwandtschaft auf Burg Sonnenfels spricht Albrecht seltener als über sein Haus am Hafen.</p>' });
  for (const key of ['rosalinde', 'kaspar']) {
    const person = nixePerson(key);
    bio.connections.push({ type: 'connection', name: person.name, detail: person.role,
      image: person.portrait, imageFormat: 'portrait' });
  }
  bio.documentsTitle = 'Das Haus Sonnenfels';
  bio.documents = [{ icon: `../Stammbäume/${SONNENFELS_EMBLEM}`, title: 'Sonnenfels',
    text: 'Die Familie auf Burg Sonnenfels und Albrechts Zweig in Gwynthor.',
    link: '../Stammbäume/Stammbaum.html?family=haus-sonnenfels&mode=view' }];
  entry.pages[2].hierarchy = buildNixeHierarchy(source);
  const offer = entry.pages[3];
  offer.tradeCatalog = buildNixeCatalog(source.pages[3], catalogs);
  offer.tradeCatalogPage = true;
  delete offer.goodsTable;
  delete offer.goodsTablePage;
  const guests = entry.pages[4].guestRegister;
  Object.assign(guests, { subtitle: 'Johannas Hausbuch · Gäste & Aufenthalte',
    location: 'Die Lachende Nixe · südliches Hafenviertel, Gwynthor',
    note: 'Johanna führt das Hausbuch unter Verschluss. Zimmer, Ankunft und besondere Wünsche werden mit dem Empfang abgestimmt.' });
  expandGuestVacancies(guests, { prefix: 'nixe', sectionCount: 5 });
  entry.pages.splice(4, 0, buildNixeServicesPage());
  return entry;
}
