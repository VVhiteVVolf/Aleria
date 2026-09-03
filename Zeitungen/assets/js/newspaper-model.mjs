export const STANDARD_ARTICLE_TYPES = Object.freeze([
  articleType("hauptartikel", "Hauptartikel", "Die große Geschichte auf der ersten Seite – ausführlich, dringlich und meinungsstark."),
  articleType("nebenartikel", "Nebenartikel", "Kürzere Meldungen und ergänzende Stimmen aus Stadt und Herrschaft."),
  articleType("bekanntmachung", "Bekanntmachung", "Amtliche Verlautbarungen, Aufrufe und öffentliche Mitteilungen."),
  articleType("predigt", "Predigt", "Geistliche Worte, Mahnungen und Auslegungen für die Gläubigen."),
  articleType("bericht", "Bericht", "Sachkundige Betrachtungen zu Geschichte, Natur, Heraldik und öffentlichem Leben."),
  articleType("kanzel", "Kanzel", "Scharfe moralische Kommentare aus der Feder der Sittenwächter."),
  articleType("klatsch", "Klatsch", "Gerüchte, Skandale und höfische Fehltritte – bissig zu Papier gebracht."),
  articleType("satirekritik", "Satirekritik", "Kunst, Politik und Gesellschaft unter dem Vergrößerungsglas einer besonders spitzen Feder.")
]);

export function createAuthor(value) {
  return Object.freeze({
    ...value,
    biography: Object.freeze([...(value.biography || [])])
  });
}

export function createArticle(value) {
  return Object.freeze({ language: "Gemeine Zunge", ...value });
}

export function createPublication(value) {
  return Object.freeze({
    ...value,
    imprints: Object.freeze({ ...(value.imprints || {}) }),
    location: Object.freeze({ ...(value.location || {}) }),
    publicationSchedule: freezePublicationSchedule(value.publicationSchedule),
    authors: Object.freeze([...(value.authors || [])]),
    editorialSections: Object.freeze((value.editorialSections || []).map(freezeEditorialSection)),
    articleTypes: Object.freeze([...(value.articleTypes || STANDARD_ARTICLE_TYPES)])
  });
}

export function createIssue(publication, value) {
  if (!publication?.id) {
    throw new TypeError("Eine Zeitungsausgabe benötigt ein gültiges Blattprofil.");
  }

  return Object.freeze({
    ...publication,
    issueId: String(value?.id || "").trim(),
    publicationDate: Object.freeze({ ...(value?.publicationDate || {}) }),
    summary: String(value?.summary || ""),
    articles: Object.freeze([...(value?.articles || [])])
  });
}

function articleType(id, label, description) {
  return Object.freeze({ id, label, description });
}

function freezeEditorialSection(section) {
  return Object.freeze({
    ...section,
    authorIds: Object.freeze([...(section?.authorIds || [])])
  });
}

function freezePublicationSchedule(schedule) {
  if (!schedule) return Object.freeze({ days: Object.freeze([]), label: "" });
  return Object.freeze({
    ...schedule,
    days: Object.freeze([...(schedule.days || [])])
  });
}
