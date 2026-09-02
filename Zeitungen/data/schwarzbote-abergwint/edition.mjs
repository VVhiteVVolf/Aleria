import { DEFAULT_PUBLICATION_DATE } from "../../assets/js/newspaper-aleria-date.mjs?v=20260903a";
import {
  createArticle as article,
  createAuthor as author,
  createIssue,
  createPublication,
  STANDARD_ARTICLE_TYPES
} from "../../assets/js/newspaper-model.mjs?v=20260903a";

const assetRoot = "/Zeitungen/data/schwarzbote-abergwint/assets";
const articleRoot = "/Zeitungen/data/schwarzbote-abergwint/articles";

const authors = Object.freeze([
  author({
    id: "luca-acria",
    name: "Luca Acria",
    role: "Herausgeber & Chefredaktor",
    beat: "Leitung und Geschäfte der Zeitung",
    portrait: `${assetRoot}/luca-acria.webp`,
    biography: [
      "Luca Acria ist nicht bloß Redaktor, sondern das geschäftstüchtige Sprachrohr des Hauses Acria. Über Anteile an der Roten Bank und Verbindungen zur Klingenden Münze reicht der Einfluss seiner Familie tief in Abergwints Handel hinein.",
      "Nach Studienjahren in Venalys kehrte er mit der Überzeugung zurück, dass sich Gerüchte ebenso handeln lassen wie Waren. Wahrheit ist für ihn ein Gut, Worte sind seine Münzen und jede Ausgabe muss ihren Preis rechtfertigen."
    ]
  }),
  author({
    id: "claudia-acria",
    name: "Claudia Acria",
    role: "Schreiberin",
    beat: "Klatsch, Skandalchronik & Gerüchteküche",
    portrait: `${assetRoot}/claudia-acria.webp`,
    biography: [
      "Claudia Acria lernte Luca während seiner Jahre in Venalys kennen und wurde an seiner Seite zur gefürchteten Chronistin der Abergwinter Gerüchteküche. Kaum ein Fehltritt des Adels entgeht ihrer scharfen Feder.",
      "Sie schreibt berechnend, rücksichtslos und mit sicherem Gespür für das, was ihr Publikum empören oder belustigen wird. Wahrheit ist für sie ein Kleid, das erst dann Aufmerksamkeit verdient, wenn man es vor aller Augen auftrennt."
    ]
  }),
  author({
    id: "tywill-bran",
    name: "Tywill Brân",
    role: "Schreiber",
    beat: "Kunstkritik, Geschichte & Politik",
    portrait: `${assetRoot}/tywill-bran.webp`,
    biography: [
      "Tywill Brân wurde in Abergwint geboren und lehrte einst Geschichte und Lyrik an der Universität. Eigene Versuche als Barde und Künstler brachten ihm wenig Ruhm, schärften jedoch sein Urteil über die Werke anderer.",
      "Heute gilt er als strenger Kunstkritiker und stoischer Chronist. Wo andere sich von Rang oder Pracht beeindrucken lassen, prüft er Herkunft, Wirkung und handwerkliche Substanz."
    ]
  }),
  author({
    id: "angharad-corryn",
    name: "Angharad Corryn",
    role: "Schreiberin",
    beat: "Satire, Komik & Gesellschaft",
    portrait: `${assetRoot}/angharad-corryn.webp`,
    biography: [
      "Angharad Corryn ist eine Tochter Abergwints und machte schon während ihrer Studienzeit mit Spottversen über Professoren von sich reden. Ihre schnelle Zunge und ihr leichter Ton öffneten ihr später die Spalten des Schwarzboten.",
      "In Satiren, Essays und Gesellschaftsberichten verspottet sie große Namen, ohne den Blick für die kleinen Absurditäten des Alltags zu verlieren. Ihre Leser lieben sie gerade deshalb, weil niemand vor ihrem Witz vollkommen sicher ist."
    ]
  }),
  author({
    id: "elenwyn-meddal",
    name: "Elenwyn Meddal",
    role: "Schreiberin",
    beat: "Chronik, Moral & gemeine Berichterstattung",
    portrait: `${assetRoot}/elenwyn-meddal.webp`,
    biography: [
      "Elenwyn Meddal wuchs in den einfachen Straßen Abergwints auf und ging an die Universität, um die Geschichten jener Menschen festzuhalten, die in höfischen Chroniken selten vorkommen.",
      "Sie schreibt über Arbeit, kleine Freuden und alltägliche Sorgen mit ruhiger Menschlichkeit. Ihre Texte suchen weder Skandal noch Schmeichelei; ihr ehrliches, gedrucktes Lächeln gehört den Bürgern der Stadt."
    ]
  }),
  author({
    id: "cadwell-gywir",
    name: "Cadwell Gywir",
    role: "Schreiber",
    beat: "Politik, Berichterstattung & Aktuelles",
    portrait: `${assetRoot}/cadwell-gywir.webp`,
    biography: [
      "Cadwell Gywir wurde in Abergwint geboren und berichtet mit aufrichtigem Ernst über Politik und aktuelle Ereignisse. Tugend, Pflicht und Wahrhaftigkeit bilden den Maßstab seiner Arbeit.",
      "Sein Blick auf Cenyr ist unverkennbar patriotisch. Mitunter wirkt sein Vertrauen in das tugendhafte Ideal des Königreichs beinahe naiv, doch seine Überzeugung und seine Absicht sind aufrichtig."
    ]
  })
]);

const articles = Object.freeze([
  article({
    id: "salzwasser-statt-samt-und-seide",
    title: "Salzwasser – Statt Samt und Seide!",
    authorId: "claudia-acria",
    typeId: "hauptartikel",
    tone: "Spöttisch, skandalös, polemisch",
    length: "Lang",
    teaser: "Gwynthor bereitet eine Hochzeit vor, während Abergwints erhofftes Bündnis zwischen Idwal Draig und Tegwen Gwyvern im Salzwasser zu versinken scheint.",
    bylineNote: "Claudia Acria über verschwiegene Glocken, ehrgeizige Mütter und die verweigerte Hand einer Prinzessin.",
    bodyPath: `${articleRoot}/salzwasser-statt-samt-und-seide.html`
  })
]);

export const publication = createPublication({
  id: "schwarzbote-abergwint",
  titleId: "schwarzbote",
  placeId: "abergwint",
  name: "Der Schwarzbote",
  edition: "Abergwint",
  subtitle: "Nachrichten, Gerüchte und Wahrheiten aus Gwendolyns Ufer",
  tagline: "Das Abergwinter Blatt",
  logo: `${assetRoot}/schwarzbote-abergwint.png`,
  imprints: Object.freeze({
    inkStamp: "/IconOrdner/StempelSchwarzbote.png",
    waxSeal: "/IconOrdner/Wachssiegel Schwarzbote.png"
  }),
  price: "5 Kupferstücke",
  region: "Baronie Gwendolyns Ufer",
  printLocation: "Schwarzbote zu Abergwint",
  language: "Gemeine Zunge",
  location: Object.freeze({
    name: "Abergwint",
    href: "/Orte/grossstadt.html?id=abergwint"
  }),
  authors,
  articleTypes: STANDARD_ARTICLE_TYPES
});

export default createIssue(publication, {
  id: "1740-03-18",
  publicationDate: DEFAULT_PUBLICATION_DATE,
  summary: "Die Abergwinter Ausgabe wird von Luca Acrias Redaktion getragen. Ihr erster vorbereiteter Leitartikel stammt von Claudia Acria und berichtet mit scharfer Feder über das gescheiterte Bündnis zwischen den Häusern Draig und Gwyvern.",
  articles
});
