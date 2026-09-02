import { DEFAULT_PUBLICATION_DATE } from "./newspaper-aleria-date.mjs?v=20260903a";
import {
  createArticle,
  createAuthor,
  createIssue,
  createPublication,
  STANDARD_ARTICLE_TYPES
} from "./newspaper-model.mjs?v=20260903a";

const PLACEHOLDER_PORTRAIT = "/Stammbäume/assets/images/placeholders/unknown.png";
const DEFAULT_IMPRINTS = Object.freeze({
  inkStamp: "/IconOrdner/StempelSchwarzbote.png",
  waxSeal: "/IconOrdner/Wachssiegel Schwarzbote.png"
});

export function createPlaceholderEdition(config) {
  const publication = createPlaceholderPublication(config);
  return createPlaceholderIssue(publication, config);
}

export function createPlaceholderPublication(config) {
  const authors = Object.freeze(Array.from({ length: 8 }, (_, index) => createAuthor({
    id: `redaktionsplatz-${index + 1}`,
    name: "...",
    role: `Redaktionsplatz ${index + 1}`,
    beat: "...",
    portrait: PLACEHOLDER_PORTRAIT,
    biography: []
  })));

  return createPublication({
    id: config.id,
    titleId: "schwarzbote",
    placeId: config.placeId,
    name: "Der Schwarzbote",
    edition: config.edition,
    subtitle: config.subtitle,
    tagline: config.tagline,
    logo: config.logo,
    imprints: DEFAULT_IMPRINTS,
    price: "5 Kupferstücke",
    region: config.region,
    printLocation: config.printLocation,
    language: "Gemeine Zunge",
    location: Object.freeze({ ...config.location }),
    authors,
    articleTypes: STANDARD_ARTICLE_TYPES
  });
}

export function createPlaceholderIssue(publication, config) {
  const articles = Object.freeze([
    createArticle({
      id: "hauptartikel",
      title: "...",
      authorId: publication.authors[0].id,
      typeId: "hauptartikel",
      tone: "...",
      length: "...",
      teaser: "...",
      bylineNote: "",
      bodyPath: config.articleBodyPath
    })
  ]);

  return createIssue(publication, {
    id: "1740-03-18",
    publicationDate: DEFAULT_PUBLICATION_DATE,
    summary: "...",
    articles
  });
}
