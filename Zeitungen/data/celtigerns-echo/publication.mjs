import { DEFAULT_PUBLICATION_DATE } from "../../assets/js/newspaper-aleria-date.mjs?v=20260903a";
import {
  createArticle,
  createAuthor,
  createIssue,
  createPublication
} from "../../assets/js/newspaper-model.mjs?v=20260903a";

const echoAssetRoot = "/Zeitungen/data/celtigerns-echo/assets";
const sharedArticleRoot = "/Zeitungen/data/celtigerns-echo/articles";
const unknownPortrait = "/Stammbäume/assets/images/placeholders/unknown.png";

export const CELTIGERNS_ECHO_ARTICLE_TYPES = Object.freeze([
  articleType("hauptgeschichte", "Hauptgeschichte", "Eine ausführliche Geschichte aus dem Leben der Menschen vor Ort."),
  articleType("bannkreis", "Aus dem Bannkreis", "Berichte aus Stadt, Dörfern, Straßen und den Wegen dazwischen."),
  articleType("nachbarschaft", "Aus der Nachbarschaft", "Kleine Begebenheiten, Sorgen und Erfolge, die sonst leicht überhört würden."),
  articleType("handwerk", "Handwerk & Alltag", "Werkstätten, Märkte, Arbeit und das praktische Leben in Celtigerns Wacht."),
  articleType("leserstimme", "Leserstimme", "Briefe, Fragen und Hinweise aus der Bevölkerung, sorgfältig geprüft und eingeordnet."),
  articleType("bekanntmachung", "Bekanntmachung", "Nützliche öffentliche Mitteilungen ohne höfisches Getöse."),
  articleType("chronik", "Chronik & Einordnung", "Geschichte und Quellenkunde in verständlicher Sprache."),
  articleType("karikatur", "Karikatur & Satire", "Pointierter Spott über Eitelkeit und Missstände, ohne Gerüchte zur Wahrheit zu erklären.")
]);

export function createCeltigernsEchoPublication({ id, placeId, edition, region, printLocation, location, authors }) {
  return createPublication({
    id,
    titleId: "celtigerns-echo",
    placeId,
    name: "Celtigerns Echo",
    edition,
    subtitle: "Die kleinen Geschichten der Wacht, aufmerksam gehört und sorgsam gedruckt",
    tagline: "Nah am Volk · Sorgfältig im Wort",
    logo: "/Stammbäume/assets/images/houses/Llamreis%20Ankunft/Bürgerliche/Gwynthor/Celtigerns-Echo.png",
    imprints: Object.freeze({
      inkStamp: `${echoAssetRoot}/celtigerns-echo-stempel.png`,
      waxSeal: `${echoAssetRoot}/celtigerns-echo-wachssiegel.png`
    }),
    price: "3 Kupferstücke",
    region,
    printLocation,
    language: "Gemeine Zunge",
    location: Object.freeze({ ...location }),
    authors: Object.freeze([...authors]),
    articleTypes: CELTIGERNS_ECHO_ARTICLE_TYPES
  });
}

export function createVacantEchoAuthor(position, edition = "") {
  return createAuthor({
    id: `freie-autorenstelle-${normalizeId(edition) || "redaktion"}-${position}`,
    name: `Freie Autorenstelle ${position}`,
    role: "Freie Autorenstelle",
    beat: "Schwerpunkt frei wählbar",
    portrait: unknownPortrait,
    biography: [
      `Celtigerns Echo sucht für die Redaktion ${edition ? `in ${edition}` : "vor Ort"} eine verlässliche Stimme, die zuhört, prüft und verständlich schreibt.`
    ]
  });
}

export function createCeltigernsEchoPlaceholderEdition(config) {
  const authors = Object.freeze(Array.from(
    { length: config.vacancies || 8 },
    (_, index) => createVacantEchoAuthor(index + 1, config.edition)
  ));
  const publication = createCeltigernsEchoPublication({ ...config, authors });

  return createIssue(publication, {
    id: "1740-03-18",
    publicationDate: DEFAULT_PUBLICATION_DATE,
    summary: `Die örtliche Redaktion von Celtigerns Echo in ${config.edition} ist vorbereitet, aber noch nicht besetzt. Themen, Stimmen und Verantwortlichkeiten folgen später.`,
    articles: Object.freeze([
      createPreparationArticle(authors[0].id, config.edition)
    ])
  });
}

export function createPreparationArticle(authorId, edition) {
  return createArticle({
    id: "redaktion-in-vorbereitung",
    title: `Die Redaktion ${edition} wird vorbereitet`,
    authorId,
    typeId: "bekanntmachung",
    tone: "Offen, einladend, vorläufig",
    length: "Kurz",
    teaser: "Räume und Druckwege sind vorgemerkt; die örtlichen Stimmen und ihre ersten Themen folgen später.",
    bylineNote: "Ein Platzhalter für die künftige lokale Ausgabe von Celtigerns Echo.",
    bodyPath: `${sharedArticleRoot}/redaktion-in-vorbereitung.html`
  });
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
