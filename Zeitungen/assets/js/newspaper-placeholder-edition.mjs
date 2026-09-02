import { DEFAULT_PUBLICATION_DATE } from "./newspaper-aleria-date.mjs";
import {
  createArticle,
  createAuthor,
  STANDARD_ARTICLE_TYPES
} from "./newspaper-model.mjs";

const PLACEHOLDER_PORTRAIT = "/Stammbäume/assets/images/placeholders/unknown.png";
const DEFAULT_IMPRINTS = Object.freeze({
  inkStamp: "/IconOrdner/StempelSchwarzbote.png",
  waxSeal: "/IconOrdner/Wachssiegel Schwarzbote.png"
});

export function createPlaceholderEdition(config) {
  const authors = Object.freeze(Array.from({ length: 8 }, (_, index) => createAuthor({
    id: `redaktionsplatz-${index + 1}`,
    name: "...",
    role: `Redaktionsplatz ${index + 1}`,
    beat: "...",
    portrait: PLACEHOLDER_PORTRAIT,
    biography: []
  })));

  const articles = Object.freeze([
    createArticle({
      id: "hauptartikel",
      title: "...",
      authorId: authors[0].id,
      typeId: "hauptartikel",
      tone: "...",
      length: "...",
      teaser: "...",
      bylineNote: "",
      bodyPath: config.articleBodyPath
    })
  ]);

  return Object.freeze({
    id: config.id,
    name: "Der Schwarzbote",
    edition: config.edition,
    subtitle: config.subtitle,
    tagline: config.tagline,
    summary: "...",
    logo: config.logo,
    imprints: DEFAULT_IMPRINTS,
    publicationDate: DEFAULT_PUBLICATION_DATE,
    year: "1740",
    price: "5 Kupferstücke",
    region: config.region,
    printLocation: config.printLocation,
    language: "Gemeine Zunge",
    location: Object.freeze({ ...config.location }),
    authors,
    articleTypes: STANDARD_ARTICLE_TYPES,
    articles
  });
}
