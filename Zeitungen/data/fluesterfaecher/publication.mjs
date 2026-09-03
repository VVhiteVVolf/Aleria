import {
  createAuthor,
  createPublication
} from "../../assets/js/newspaper-model.mjs?v=20260904a";

const assetRoot = "/Zeitungen/data/fluesterfaecher/assets";
const unknownPortrait = "/Stammbäume/assets/images/placeholders/unknown.png";

export const FLUESTERFAECHER_ARTICLE_TYPES = Object.freeze([
  articleType("hinter-dem-faecher", "Hinter dem Fächer", "Die große Enthüllung der Ausgabe – kunstvoll erzählt und gesellschaftlich folgenschwer."),
  articleType("wer-mit-wem", "Wer mit wem?", "Affären, Liebschaften und auffällig vertraute Begegnungen in Cenyrs feiner Gesellschaft."),
  articleType("samt-und-suende", "Samt & Sünde", "Erotik, Begehren und die diskreten Vergnügungen erwachsener Gesellschaft."),
  articleType("salonfaehig", "Salonfähig", "Wer eingeladen, bewundert, geduldet oder demonstrativ gemieden wird."),
  articleType("spitze-seide-schnitt", "Spitze, Seide & Schnitt", "Mode, Stoffe, Schnitte und der letzte Schrei der Saison."),
  articleType("duftspur", "Die Duftspur", "Parfüms, Kosmetik, Schönheitspflege und die Düfte, über die ganz Cenyr spricht."),
  articleType("goldene-begierden", "Goldene Begierden", "Prestigegüter, seltene Genüsse und die Adressen, an denen man sie erhält."),
  articleType("nachtregister", "Das Nachtregister", "Bordelle, Spielhäuser, exklusive Tavernen und andere Orte nach Sonnenuntergang."),
  articleType("stallgefluester", "Stallgeflüster", "Die begehrtesten volljährigen Frauen und Männer der Saison – bewundert, umstritten und gezeichnet."),
  articleType("gezeichnetes-auge", "Das gezeichnete Auge", "Portraits, Skizzen und Karikaturen der Personen, die gerade jeder sehen will."),
  articleType("giftige-feder", "Die giftige Feder", "Das scharfzüngige Urteil der Redaktion über Geschmack, Auftreten und gesellschaftliche Fehltritte."),
  articleType("schluesselloch", "Durchs Schlüsselloch", "Noch nicht vollständig belegte Gerüchte, ausdrücklich als Flüstern und nicht als Tatsache geführt.")
]);

export const FLUESTERFAECHER_LOCAL_POSITIONS = Object.freeze([
  position("chefredaktion", "Chefredaktion noch unbesetzt", "Chefredaktion", "Auswahl der Themen, Ton der Ausgabe und letzte Entscheidung über diskrete Veröffentlichungen"),
  position("gesellschaft", "Gesellschaftsressort noch unbesetzt", "Gesellschaft und Adel", "Häuser, Salons, Einladungen und gesellschaftliche Rangordnung"),
  position("mode", "Moderessort noch unbesetzt", "Mode und Luxus", "Kleidung, Schmuck, Parfüm und Prestigegüter"),
  position("nachtleben", "Nachtressort noch unbesetzt", "Nachtleben und Vergnügen", "Spielhäuser, Bordelle, Tavernen und exklusive Veranstaltungen"),
  position("beziehungen", "Diskretionsressort noch unbesetzt", "Beziehungen und diskrete Angelegenheiten", "Affären, Liebschaften, Trennungen und vertrauliche Verbindungen"),
  position("portrait", "Portraitatelier noch unbesetzt", "Portraitzeichnung", "Skizzen, Portraits, Modebilder und gesellschaftliche Karikaturen"),
  position("giftige-feder", "Giftige Feder noch unbesetzt", "Kolumne der Giftigen Feder", "Bissige Urteile über Personen, Trends und modische Verfehlungen"),
  position("salon-eins", "Salonkorrespondenz I noch unbesetzt", "Freie Salonkorrespondenz", "Empfänge, Feste und Gespräche hinter vorgehaltenem Fächer"),
  position("salon-zwei", "Salonkorrespondenz II noch unbesetzt", "Freie Salonkorrespondenz", "Künstlerkreise, Bühnen, Gesellschaften und wechselnde Moden"),
  position("informanten-eins", "Vertrauliche Informantenstelle I", "Freie Informantenstelle", "Diskrete Hinweise aus Häusern, Betrieben und dem Nachtleben"),
  position("informanten-zwei", "Vertrauliche Informantenstelle II", "Freie Informantenstelle", "Quellenpflege, Gegenprüfung und geschützte Übergabe brisanter Hinweise")
]);

export function createFluesterfaecherPublication({ id, placeId, edition, region, printLocation, location }) {
  const authors = createVacantLocalEditorialTeam(edition);
  return createPublication({
    id,
    titleId: "fluesterfaecher",
    placeId,
    name: "Der Flüsterfächer",
    edition,
    subtitle: `${edition}s Magazin für Gesellschaft, Geschmack und geheime Türen`,
    tagline: "Samt & Sünde",
    logo: `${assetRoot}/fluesterfaecher-gildenemblem.png`,
    showLogoInMasthead: true,
    imprints: Object.freeze({
      inkStamp: `${assetRoot}/fluesterfaecher-stempel.png`,
      waxSeal: `${assetRoot}/fluesterfaecher-wachssiegel.png`
    }),
    price: "8 Kupferstücke",
    region,
    printLocation,
    language: "Gemeine Zunge",
    location: Object.freeze({ ...location }),
    authors,
    editorialSections: Object.freeze([
      Object.freeze({
        id: `lokalredaktion-${normalizeId(edition)}`,
        kicker: "Zwischen Salon und Schlüsselloch",
        title: `Die Lokalredaktion zu ${edition}`,
        description: `Der Flüsterfächer wird in ${edition} vollständig vor Ort gestaltet. Der Hauptsitz in der Blutstadt schützt Namen und Stil des Magazins; Themen, Quellen, Zeichnungen und Urteile dieser Ausgabe verantwortet allein die örtliche Redaktion.`,
        authorIds: Object.freeze(authors.map((author) => author.id))
      })
    ]),
    articleTypes: FLUESTERFAECHER_ARTICLE_TYPES
  });
}

export function createVacantLocalEditorialTeam(edition) {
  const placeId = normalizeId(edition);
  return Object.freeze(FLUESTERFAECHER_LOCAL_POSITIONS.map((entry) => createAuthor({
    id: `fluesterfaecher-${placeId}-${entry.id}`,
    name: entry.name,
    role: entry.role,
    beat: entry.beat,
    portrait: unknownPortrait,
    biography: [
      `Dieser Platz gehört zur eigenständigen Lokalredaktion des Flüsterfächers in ${edition}. Die Besetzung entscheidet später über Stimme, Kontakte und besondere Handschrift des Ressorts.`
    ]
  })));
}

function position(id, name, role, beat) {
  return Object.freeze({ id, name, role, beat });
}

function articleType(id, label, description) {
  return Object.freeze({ id, label, description });
}

function normalizeId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
