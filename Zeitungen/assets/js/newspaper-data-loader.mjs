import { findNewspaperEntry } from "./newspaper-registry.mjs?v=20260903a";
import { findIssueEntry } from "./newspaper-archive.mjs?v=20260903a";
import {
  isValidPublicationDate,
  publicationDateToOrdinal
} from "./newspaper-aleria-date.mjs?v=20260903a";

export async function loadRequestedNewspaper() {
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id") || params.get("zeitung") || "";
  const entry = findNewspaperEntry(requestedId);

  if (!entry) {
    throw new NewspaperLoadError("Diese Zeitung ist im Archiv nicht verzeichnet.", "missing-newspaper");
  }

  const requestedIssueId = params.get("ausgabe") || params.get("issue") || "";
  const issueEntry = findIssueEntry(entry, requestedIssueId);
  if (!issueEntry) {
    const message = requestedIssueId
      ? "Diese Ausgabe ist im Archiv nicht verzeichnet."
      : "Für diese Zeitung ist noch keine Ausgabe verzeichnet.";
    throw new NewspaperLoadError(message, "missing-issue");
  }

  const module = await import(issueEntry.dataModule);
  const newspaper = module.default;
  assertNewspaperData(newspaper, entry, issueEntry);
  return Object.freeze({ entry, issueEntry, newspaper, params });
}

export function findArticle(newspaper, articleId) {
  return newspaper.articles.find((article) => article.id === articleId) || null;
}

export function findAuthor(newspaper, authorId) {
  return newspaper.authors.find((author) => author.id === authorId) || null;
}

export function findArticleType(newspaper, typeId) {
  return newspaper.articleTypes.find((type) => type.id === typeId) || null;
}

export class NewspaperLoadError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "NewspaperLoadError";
    this.code = code;
  }
}

function assertNewspaperData(newspaper, entry, issueEntry) {
  const requiredArrays = ["authors", "articles", "articleTypes"];
  if (!newspaper || typeof newspaper !== "object") {
    throw new NewspaperLoadError("Die Ausgabedaten sind beschädigt.", "invalid-data");
  }
  if (!newspaper.id || !newspaper.name || !newspaper.edition) {
    throw new NewspaperLoadError("Der Ausgabe fehlen grundlegende Blattangaben.", "invalid-data");
  }
  if (requiredArrays.some((key) => !Array.isArray(newspaper[key]))) {
    throw new NewspaperLoadError("Autoren, Artikelarten oder Artikel fehlen.", "invalid-data");
  }
  if (newspaper.publicationDate && !isValidPublicationDate(newspaper.publicationDate)) {
    throw new NewspaperLoadError("Das Erscheinungsdatum liegt außerhalb des Aleria-Kalenders.", "invalid-publication-date");
  }
  if (newspaper.id !== entry.id || newspaper.issueId !== issueEntry.id) {
    throw new NewspaperLoadError("Die Ausgabe ist dem falschen Blatt oder Archivstand zugeordnet.", "invalid-issue-reference");
  }
  if (publicationDateToOrdinal(newspaper.publicationDate) !== publicationDateToOrdinal(issueEntry.publicationDate)) {
    throw new NewspaperLoadError("Das Erscheinungsdatum stimmt nicht mit dem Ausgabenarchiv überein.", "invalid-issue-date");
  }

  const authorIds = new Set(newspaper.authors.map((author) => author.id));
  const typeIds = new Set(newspaper.articleTypes.map((type) => type.id));
  newspaper.articles.forEach((article) => {
    if (!article.id || !article.title || !article.bodyPath) {
      throw new NewspaperLoadError("Ein Artikel ist unvollständig verzeichnet.", "invalid-article");
    }
    if (!authorIds.has(article.authorId) || !typeIds.has(article.typeId)) {
      throw new NewspaperLoadError(`Der Artikel „${article.title}“ verweist auf unbekannte Redaktionsdaten.`, "invalid-reference");
    }
  });
}
