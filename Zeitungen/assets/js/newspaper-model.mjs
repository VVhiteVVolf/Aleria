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

function articleType(id, label, description) {
  return Object.freeze({ id, label, description });
}
