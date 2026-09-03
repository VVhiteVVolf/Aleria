import { DEFAULT_PUBLICATION_DATE } from "../../assets/js/newspaper-aleria-date.mjs?v=20260904a";
import { createArticle } from "../../assets/js/newspaper-model.mjs?v=20260904a";

export const KRONENSPIEGEL_CURRENT_ISSUE = Object.freeze({
  id: "1740-03-18",
  publicationDate: DEFAULT_PUBLICATION_DATE,
  summary: "Der Kronenspiegel eröffnet seine cenyrweite Berichterstattung mit einem Versprechen: Er betrachtet Handel, Politik, Personen, Adel, Wirtschaft, Kriminalität und Beziehungen dort, wo sie das Königreich im Großen bewegen. Er urteilt neutral-konservativ, beschönigt nichts und bleibt auch im harten Urteil fair.",
  articles: Object.freeze([
    createArticle({
      id: "ein-koenigreich-darf-nicht-im-dunkeln-liegen",
      title: "Ein Königreich darf nicht im Dunkeln liegen",
      authorId: "kronenspiegel-hauptredaktion-leitung",
      typeId: "lagebild",
      tone: "Nüchtern, bestimmt und fair",
      length: "Grundsatzartikel",
      teaser: "Warum eine Nachricht aus Celtigerns Wacht auch einen Bauern auf den Klaueninseln angeht – und weshalb Größe mehr Prüfung statt mehr Geschrei verlangt.",
      bylineNote: "Grundsatz der noch zu besetzenden Hauptredaktion in Mathragon.",
      bodyPath: "/Zeitungen/data/kronenspiegel/articles/ein-koenigreich-darf-nicht-im-dunkeln-liegen.html"
    })
  ])
});
