import { NEWSPAPER_ALERIA_CALENDAR } from "../../assets/js/newspaper-aleria-date.mjs?v=20260904a";
import {
  createAuthor,
  createIssue,
  createPublication
} from "../../assets/js/newspaper-model.mjs?v=20260904a";
import { KRONENSPIEGEL_CURRENT_ISSUE } from "./current-issue.mjs";

const assetRoot = "/Zeitungen/data/kronenspiegel/assets";
const unknownPortrait = "/Stammbäume/assets/images/placeholders/unknown.png";

export const KRONENSPIEGEL_PUBLICATION_DAYS = Object.freeze([
  1,
  18,
  NEWSPAPER_ALERIA_CALENDAR.daysPerMonth
]);

export const KRONENSPIEGEL_ARTICLE_TYPES = Object.freeze([
  articleType("lagebild", "Das große Bild", "Die maßgebliche Geschichte einer Ausgabe und ihre Bedeutung für ganz Cenyr."),
  articleType("politik", "Krone & Politik", "Entscheidungen, Machtverhältnisse und ihre Folgen ohne höfische Schonung."),
  articleType("handel", "Handel & Wirtschaft", "Warenströme, Münze, Zölle, Versorgung und Veränderungen von nationaler Tragweite."),
  articleType("personen", "Personen & Adel", "Einflussreiche Personen und Häuser, beurteilt nach Handlungen statt nach Gerüchten."),
  articleType("kriminalitaet", "Recht & Kriminalität", "Schwere Verbrechen, Rechtsprechung und Gefahren, die über einen einzelnen Ort hinausreichen."),
  articleType("beziehungen", "Beziehungen & Ausland", "Bündnisse, Spannungen, Diplomatie und Cenyrs Verhältnis zu seinen Nachbarn."),
  articleType("regionen", "Aus den Regionen", "Große Entwicklungen aus den Grafschaften, Inseln und Grenzlanden Cenyrs."),
  articleType("einordnung", "Prüfung & Einordnung", "Quellenprüfung, Gegendarstellungen und die faire Korrektur eines harten Urteils.")
]);

export const KRONENSPIEGEL_CENTRAL_AUTHORS = Object.freeze([
  centralPlaceholder("leitung", "Leitung noch unbesetzt", "Herausgabe und Chefredaktion", "Gesamtlinie, Titelauswahl und letzte Abwägung"),
  centralPlaceholder("politik", "Politikressort noch unbesetzt", "Leitung Krone und Politik", "Krone, Rat, Verwaltung und Machtverschiebungen"),
  centralPlaceholder("wirtschaft", "Wirtschaftsressort noch unbesetzt", "Leitung Handel und Wirtschaft", "Handel, Zölle, Versorgung und Münzwesen"),
  centralPlaceholder("personen", "Personenressort noch unbesetzt", "Leitung Personen und Adel", "Einflussreiche Personen, Adelshäuser und öffentliche Verantwortung"),
  centralPlaceholder("recht", "Rechtsressort noch unbesetzt", "Leitung Recht und Kriminalität", "Schwere Verbrechen, Gerichte und Sicherheit"),
  centralPlaceholder("beziehungen", "Beziehungsressort noch unbesetzt", "Leitung Beziehungen und Ausland", "Diplomatie, Bündnisse und Nachbarreiche"),
  centralPlaceholder("regionen", "Regionenressort noch unbesetzt", "Leitung des Korrespondentennetzes", "Grafschaften, Inseln, Grenzen und Standortmeldungen"),
  centralPlaceholder("pruefung", "Prüfressort noch unbesetzt", "Leitung Quellenprüfung", "Belege, Gegendarstellungen und redaktionelle Korrekturen")
]);

export function createKronenspiegelEdition(site) {
  const localAuthors = createLocalPlaceholders(site);
  const authors = Object.freeze([...KRONENSPIEGEL_CENTRAL_AUTHORS, ...localAuthors]);
  const publication = createPublication({
    id: `kronenspiegel-${site.id}`,
    titleId: "kronenspiegel",
    placeId: site.id,
    name: "Der Kronenspiegel",
    edition: "Gesamtausgabe Cenyr",
    subtitle: "Die nationale Volkszeitung aus Mathragon",
    tagline: "Hart, aber fair.",
    logo: `${assetRoot}/kronenspiegel-gildensymbol.png`,
    showLogoInMasthead: true,
    imprints: Object.freeze({
      inkStamp: `${assetRoot}/kronenspiegel-stempel.png`,
      waxSeal: `${assetRoot}/kronenspiegel-wachssiegel.png`
    }),
    price: "5 Kupferstücke",
    region: "Königreich Cenyr",
    printLocation: site.printLocation,
    language: "Gemeine Zunge",
    location: Object.freeze({ name: site.name, href: site.href }),
    publicationSchedule: Object.freeze({
      days: KRONENSPIEGEL_PUBLICATION_DAYS,
      label: "Am 1., 18. und letzten Tag jedes Monats"
    }),
    distributionSite: site,
    authors,
    editorialSections: Object.freeze([
      Object.freeze({
        id: "hauptredaktion",
        kicker: "Aus Mathragon für ganz Cenyr",
        title: "Die Hauptredaktion in Mathragon",
        description: "Haus Pengair trägt die Verantwortung für den Kronenspiegel. Die Familie ist noch nicht ausgearbeitet; deshalb bleiben alle Sitze der zentralen Redaktion vorerst als klar bezeichnete Platzhalter erhalten.",
        authorIds: Object.freeze(KRONENSPIEGEL_CENTRAL_AUTHORS.map((author) => author.id))
      }),
      Object.freeze({
        id: `standort-${site.id}`,
        kicker: "Nachrichten sammeln · Ausgabe unverändert drucken",
        title: `Die Korrespondenten zu ${site.name}`,
        description: site.remit,
        authorIds: Object.freeze(localAuthors.map((author) => author.id))
      })
    ]),
    articleTypes: KRONENSPIEGEL_ARTICLE_TYPES
  });

  return createIssue(publication, KRONENSPIEGEL_CURRENT_ISSUE);
}

export function isKronenspiegelPublicationDay(date) {
  return KRONENSPIEGEL_PUBLICATION_DAYS.includes(Number(date?.day));
}

function centralPlaceholder(id, name, role, beat) {
  return createAuthor({
    id: `kronenspiegel-hauptredaktion-${id}`,
    name,
    role,
    beat,
    portrait: unknownPortrait,
    biography: ["Dieser Sitz der Mathragoner Hauptredaktion wird mit einem Mitglied oder Angestellten des Hauses Pengair besetzt, sobald die Familie ausgearbeitet ist."]
  });
}

function createLocalPlaceholders(site) {
  const roles = Object.freeze([
    ["leitung", "Standortleitung noch unbesetzt", "Standortleitung", "Quellenannahme und Verbindung nach Mathragon"],
    ["politik", "Regionalkorrespondenz noch unbesetzt", "Korrespondenz Politik und Gesellschaft", "Entwicklungen von cenyrweiter Tragweite"],
    ["wirtschaft", "Wirtschaftskorrespondenz noch unbesetzt", "Korrespondenz Handel und Wirtschaft", "Handelswege, Versorgung und Märkte"],
    ["recht", "Rechtskorrespondenz noch unbesetzt", "Korrespondenz Recht und Kriminalität", "Schwere Fälle, Gerichte und Sicherheit"]
  ]);
  return Object.freeze(roles.map(([id, name, role, beat]) => createAuthor({
    id: `kronenspiegel-${site.id}-${id}`,
    name,
    role,
    beat,
    portrait: unknownPortrait,
    biography: [`Dieser Platz gehört zum Druck- und Korrespondenzstandort ${site.name}. Die Person sammelt und prüft große regionale Themen für die Hauptredaktion, gestaltet aber keine abweichende Lokalausgabe.`]
  })));
}

function articleType(id, label, description) {
  return Object.freeze({ id, label, description });
}
