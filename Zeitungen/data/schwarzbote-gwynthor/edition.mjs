import { DEFAULT_PUBLICATION_DATE } from "../../assets/js/newspaper-aleria-date.mjs";
import {
  createArticle as article,
  createAuthor as author,
  STANDARD_ARTICLE_TYPES
} from "../../assets/js/newspaper-model.mjs";

const assetRoot = "/Zeitungen/data/schwarzbote-gwynthor/assets";
const articleRoot = "/Zeitungen/data/schwarzbote-gwynthor/articles";

const authors = Object.freeze([
  author({
    id: "bors-brwyn",
    name: "Bors Brwyn",
    role: "Herausgeber & Chefredaktor",
    beat: "Leitung und Geschäfte der Zeitung",
    portrait: `${assetRoot}/bors-brwyn.jpg`,
    biography: [
      "Bors Brwyn ist der langjährige Herausgeber der einflussreichsten Zeitung Gwynthors. Mit seiner massigen Gestalt, dem wettergegerbten Gesicht und dem stets streng gekniffenen Blick wirkt er wie ein Mann, der schon alles gesehen – und noch mehr gedruckt – hat. Hinter der silbergrauen Mähne und dem gepflegten Vollbart lauert der kalte Geschäftssinn eines Mannes, für den Wahrheit ein dehnbarer Begriff ist.",
      "Seit Jahrzehnten kennt Bors die politischen Strömungen der Grafschaft und weiß, welche Türen er eintreten und welche er leise öffnen muss. Beschwerden hochrangiger Adliger prallen an ihm ab; sein Blatt soll die Nachricht zuerst bringen, ganz gleich, wem sie weh tut."
    ]
  }),
  author({
    id: "meurig-llwyd",
    name: "Meurig Llwyd",
    role: "Schreiber",
    beat: "Kriminalität & Berichterstattung",
    portrait: `${assetRoot}/meurig-llwyd.jpg`,
    biography: [
      "Meurig Llwyd ist in Gwynthor geboren und aufgewachsen und entstammt einer angesehenen Familie von Gelehrten. Er gilt als Vertreter strenger Neutralität, doch sein Herz schlägt glühend patriotisch für Cenyr. Jede Gefahr für die Grafschaft will er aufdecken und öffentlich benennen, weshalb er mit besonderer Härte gegen die Schwarzen Zitteraale schreibt.",
      "Als investigativer Chronist hat er zu viel Leid gesehen, um noch an das Gute in jedem Menschen zu glauben. Er spricht wenig, dafür präzise, und schreibt nicht, um zu unterhalten, sondern um zu erinnern – und zu warnen."
    ]
  }),
  author({
    id: "cadfael-gwatwar",
    name: "Cadfael Gwatwar",
    role: "Schreiber",
    beat: "Moral, Predigt & Gesellschaftskritik",
    portrait: `${assetRoot}/cadfael-gwatwar.jpg`,
    biography: [
      "Cadfael Gwatwar entstammt einer tief religiösen Priesterfamilie. Schon als Kind war er Messdiener, später Kurator und Schreiber heiliger Texte in der Kathedrale von Gwynthor. Er verließ den Kirchendienst, weil er als Meinungsschreiber mehr Menschen belehren konnte, als es ihm je von einer Kanzel möglich gewesen wäre.",
      "Cadfael ist ein unerbittlicher Moralwächter. Er glaubt, dass die Welt in einer Spirale des Lasters untergeht, und betrachtet öffentliche Schande als ersten Schritt zur Besserung. Humor nutzt er nur als scharfes Messer, damit eine Lektion tiefer einschneidet."
    ]
  }),
  author({
    id: "albrecht-von-hohenquell",
    name: "Albrecht von Hohenquell",
    role: "Schreiber",
    beat: "Klatsch, Skandalchronik & Gerüchte",
    portrait: `${assetRoot}/albrecht-von-hohenquell.jpg`,
    biography: [
      "Albrecht von Hohenquell verschlug es aus dem fernen Hohenquell nach Gwynthor. Elegant gekleidet und scharfzüngig gilt er als Meister einer besonderen Hofkunst: Spott, Klatsch und Tratsch so zu setzen, dass selbst hochgeborene Damen erröten oder erzürnen.",
      "Er bewegt sich mit der Leichtigkeit eines Mannes, der in jedem Raum willkommen ist, auch wenn die Hälfte der Anwesenden lieber sähe, er wäre anderswo. Sein Charme ist Werkzeug, seine Freundlichkeit Fassade – und jede Bekanntschaft kann auf der schneidenden Seite seiner Feder enden."
    ]
  }),
  author({
    id: "briallen-chwerthin",
    name: "Briallen Chwerthin",
    role: "Schreiberin",
    beat: "Kunst, Kulturkritik, Satire & Mode",
    portrait: `${assetRoot}/briallen-chwerthin.jpg`,
    biography: [
      "Briallen Chwerthin stammt aus einer wohlhabenden Händlerfamilie, die für feine Krämerwaren und exotische Gewürze bekannt ist. Sie studierte in Lynthor Lyrik, Dichtkunst und Heraldik, entdeckte dann jedoch ihre Leidenschaft für Kritik. Ihr Urteil kann Karrieren begründen oder zerstören.",
      "Ihre Texte sind verschachtelt, geistreich und voller spitzer Anspielungen. Sie liebt den stillen Sieg zwischen den Zeilen und hält Langeweile für das Schlimmste, was man einer Kunstform antun kann."
    ]
  }),
  author({
    id: "eleri-gwyddor",
    name: "Eleri Gwyddor",
    role: "Schreiberin",
    beat: "Geschichte, Heraldik & Naturkunde",
    portrait: `${assetRoot}/eleri-gwyddor.jpg`,
    biography: [
      "Eleri Gwyddor ist die Verkörperung unstillbarer Neugier. Seit ihrer Jugend wuchs sie in den Archiven von Mathragon zwischen staubigen Schriftrollen und brüchigen Landkarten auf. Ob Mauerrest, Knochenfund oder Gerücht über ein Fabelwesen: Eleri will es sehen, prüfen und verstehen.",
      "Ihre Feder ist eine höflich geführte Waffe gegen Aberglauben und Unwissenheit. Sie schreibt mit klaren Beschreibungen, bildhaften Vergleichen und didaktischer Wärme, kann aber spitz werden, wenn ein Mythos nur dazu dient, Angst oder Macht zu schüren."
    ]
  })
]);

const articleTypes = STANDARD_ARTICLE_TYPES;

const articles = Object.freeze([
  article({
    id: "treiben-der-schwarzen-zitteraale",
    title: "Das Treiben der Schwarzen Zitteraale",
    authorId: "meurig-llwyd",
    typeId: "hauptartikel",
    tone: "Anklagend, moralisierend, hasserfüllt",
    length: "Lang",
    teaser: "Zeugnisse, Beichten und eine bittere Frage: Warum entzieht sich die gefürchtete Bande seit Jahren dem Zugriff der Obrigkeit?",
    bylineNote: "Eine schonungslose Chronik über die gefürchtete Bande und die Narben, die sie in Celtigerns Wacht hinterlässt.",
    bodyPath: `${articleRoot}/treiben-der-schwarzen-zitteraale.html`
  }),
  article({
    id: "wappentier-der-gafyr",
    title: "Das Wappentier der Gafyr",
    authorId: "eleri-gwyddor",
    typeId: "bericht",
    tone: "Wissbegierig, erklärend, akademisch",
    length: "Mittel",
    teaser: "Zwei aufbäumende Böcke, ein gehörnter Helm und das Erbe eines Hauses – Eleri Gwyddor trennt Spott von Geschichte.",
    bylineNote: "Eine historische Einordnung des Gafyr-Wappens und seiner Bedeutung für das Haus.",
    bodyPath: `${articleRoot}/wappentier-der-gafyr.html`
  }),
  article({
    id: "predigt-auf-taube-ohren",
    title: "Die Predigt, die auf taube Ohren fiel",
    authorId: "cadfael-gwatwar",
    typeId: "kanzel",
    tone: "Streng, altväterlich, verurteilend",
    length: "Mittel",
    teaser: "Cadfael Gwatwar prüft die Sprösslinge des Hauses Draig an den Worten des Patriarchen – und findet wenig Tugend.",
    bylineNote: "Eine Zurechtweisung aus der Druckerpresse, gerichtet an die jüngere Generation des Hauses Draig.",
    bodyPath: `${articleRoot}/predigt-auf-taube-ohren.html`
  }),
  article({
    id: "fall-von-sir-roderic",
    title: "Der Fall von Sir Roderic",
    authorId: "albrecht-von-hohenquell",
    typeId: "klatsch",
    tone: "Spöttisch, bissig, rufschädigend",
    length: "Lang",
    teaser: "Eine Ziege, ein Ritter und genügend Zeugen für den Skandal des Jahres – zumindest wenn man Albrecht von Hohenquell glaubt.",
    bylineNote: "Die Skandalchronik, über die in Gwynthors Schenken und Sälen gleichermaßen gesprochen wird.",
    bodyPath: `${articleRoot}/fall-von-sir-roderic.html`
  }),
  article({
    id: "galerie-des-grauens",
    title: "Die Galerie des Grauens",
    authorId: "briallen-chwerthin",
    typeId: "satirekritik",
    tone: "Spöttisch, geistreich, doppeldeutig",
    length: "Kurz",
    teaser: "Hofmagier Myrddin hat den Pinsel erhoben. Briallen Chwerthin wünscht, jemand hätte ihn rechtzeitig wieder fortgenommen.",
    bylineNote: "Eine Kunstkritik für alle, die vor abstrakter Meisterschaft und höfischem Donnerkeil nicht zurückschrecken.",
    bodyPath: `${articleRoot}/galerie-des-grauens.html`
  })
]);

export default Object.freeze({
  id: "schwarzbote-gwynthor",
  name: "Der Schwarzbote",
  edition: "Gwynthor",
  subtitle: "Nachrichten, Gerüchte und Wahrheiten aus Celtigerns Wacht",
  tagline: "Das meistgelesene Blatt der Grafschaft",
  summary: "Diese Gwynthorer Ausgabe führt von den Verbrechen der Schwarzen Zitteraale über das Wappenerbe der Gafyr bis zu Predigt, Hofskandal und Kunstkritik. Fünf Federn berichten, urteilen und spotten – jede mit ihrer eigenen Stimme.",
  logo: `${assetRoot}/schwarzbote-gwynthor.png`,
  imprints: Object.freeze({
    inkStamp: "/IconOrdner/StempelSchwarzbote.png",
    waxSeal: "/IconOrdner/Wachssiegel Schwarzbote.png"
  }),
  publicationDate: DEFAULT_PUBLICATION_DATE,
  year: "1740",
  price: "5 Kupferstücke",
  region: "Gräfische Baronie Llamreis Ankunft",
  printLocation: "Schwarzbote zu Gwynthor",
  language: "Gemeine Zunge",
  location: Object.freeze({
    name: "Gwynthor",
    href: "/Orte/grossstadt.html?id=gwynthor"
  }),
  authors,
  articleTypes,
  articles
});
