import { DEFAULT_PUBLICATION_DATE } from "../../assets/js/newspaper-aleria-date.mjs?v=20260903a";
import {
  createArticle,
  createAuthor as author,
  createIssue
} from "../../assets/js/newspaper-model.mjs?v=20260903a";
import {
  createCeltigernsEchoPublication,
  createVacantEchoAuthor
} from "../celtigerns-echo/publication.mjs";

const portraitRoot = "/Stammbäume/assets/images/portraits/haus-falchdyn";
const articleRoot = "/Zeitungen/data/celtigerns-echo-gwynthor/articles";

const authors = Object.freeze([
  author({
    id: "aneirin-falchdyn",
    name: "Aneirin Falchdyn",
    role: "Herausgeber & Chefredakteur",
    beat: "Leitung, Leitartikel & redaktionelle Abwägung",
    portrait: `${portraitRoot}/aneirin-falchdyn.webp`,
    biography: [
      "Aneirin führt Haus und Hauptredaktion mit prüfendem Blick. Er entscheidet, welche Geschichte groß genug für die Titelseite ist und welche gerade deshalb gedruckt werden muss, weil sie sonst niemand hört.",
      "Er verlangt belastbare Quellen, räumt aber auch einfachen Stimmen Raum ein. Nähe zum Volk bedeutet für ihn weder Gefälligkeit noch das Verschweigen unbequemer Tatsachen."
    ]
  }),
  author({
    id: "dafydd-falchdyn",
    name: "Dafydd Falchdyn",
    role: "Seniorautor & Leseranwalt",
    beat: "Leserbriefe, Erinnerungen & Sorgen des Alltags",
    portrait: `${portraitRoot}/dafydd-falchdyn.webp`,
    biography: [
      "Dafydd ist auch 1740 noch die herzlichste Stimme der Redaktion. Er hört geduldig zu, kennt zahllose Familien beim Namen und findet selbst in einer kurzen Nachricht den Menschen, um den es eigentlich geht.",
      "Leserbriefe und Anliegen, die andernorts als zu klein gelten, landen häufig zuerst auf seinem Tisch."
    ]
  }),
  author({
    id: "iorwerth-falchdyn",
    name: "Iorwerth Falchdyn",
    role: "Chronist & Quellenprüfer",
    beat: "Stadtgeschichte, Archiv & sachliche Einordnung",
    portrait: `${portraitRoot}/iorwerth-falchdyn.webp`,
    biography: [
      "Iorwerth bewahrt das lange Gedächtnis von Celtigerns Echo. Er vergleicht Aussagen mit alten Ausgaben, Ratsnotizen und Briefen, bevor aus einer Behauptung eine gedruckte Tatsache wird.",
      "Seine Skepsis ist streng, aber nie selbstgefällig: Was sich nicht belegen lässt, wird als offene Frage gekennzeichnet."
    ]
  }),
  author({
    id: "rhodri-falchdyn",
    name: "Rhodri Falchdyn",
    role: "Leiter des Korrespondentennetzes",
    beat: "Gwynthors Bannkreis & Verbindung zu den Außenredaktionen",
    portrait: `${portraitRoot}/rhodri-falchdyn.webp`,
    biography: [
      "Rhodri trägt Meldungen nicht nur durch die Redaktion, sondern über Straßen und Botenwege. Er hält Kontakt zu Dörfern, Herbergen und den vorbereiteten Redaktionsstuben der größeren Städte.",
      "Sein nüchterner Blick schützt die Hauptredaktion davor, eine Nachricht aus der Ferne voreilig zu drucken."
    ]
  }),
  author({
    id: "emrys-falchdyn",
    name: "Emrys Falchdyn",
    role: "Politikbeobachter & Kolumnist",
    beat: "Stadtrat, Verwaltung & Folgen politischer Entscheidungen",
    portrait: `${portraitRoot}/emrys-falchdyn.webp`,
    biography: [
      "Emrys beobachtet Gwynthors Amtsträger mit spitzer Feder und einem ausgeprägten Gespür für Ausflüchte. Ihn interessiert weniger das höfische Schauspiel als die Frage, was ein Beschluss auf Straßen, Märkten und in Werkstätten verändert.",
      "Seine Kolumnen sind pointiert, müssen Iorwerths Quellenprüfung aber ebenso bestehen wie jeder nüchterne Bericht."
    ]
  }),
  author({
    id: "owain-falchdyn",
    name: "Owain Falchdyn",
    role: "Ausbilder & Redaktionsverwalter",
    beat: "Schreiberschule, Verträge & redaktionelle Abläufe",
    portrait: `${portraitRoot}/owain-falchdyn.webp`,
    biography: [
      "Owain sorgt dafür, dass aus guten Absichten verlässliche Arbeit wird. Er verwaltet Honorare und Fristen, bildet neue Schreibende aus und vermittelt zwischen freien Federn und der Familienredaktion.",
      "Wer bei Celtigerns Echo anfangen möchte, begegnet meist zuerst seinem höflichen, aber gründlichen Urteil."
    ]
  }),
  author({
    id: "catrin-spouse-falchdyn",
    name: "Catrin Pencaletwch",
    role: "Autorin bei Celtigerns Echo",
    beat: "Marktleben, Handel & Stimmen aus den Gassen",
    portrait: `${portraitRoot}/catrin-pencaletwch.webp`,
    biography: [
      "Catrin stammt aus dem Norden; die genauere Herkunft ihrer Familie bleibt vorerst offen. In Gwynthor sucht sie das Gespräch dort, wo Händler, Reisende und Nachbarn ohne Förmlichkeit miteinander reden."
    ]
  }),
  author({
    id: "enid-spouse-falchdyn",
    name: "Enid Braffwrdd",
    role: "Autorin bei Celtigerns Echo",
    beat: "Nachbarschaft, Bildung & stille Alltagsgeschichten",
    portrait: `${portraitRoot}/enid-braffwrdd.webp`,
    biography: [
      "Enid sammelt ihre Beobachtungen ruhig und sorgfältig. Ihr fallen jene Menschen auf, die eine Straße oder Gemeinschaft zusammenhalten, ohne je in einer großen Chronik genannt zu werden."
    ]
  }),
  author({
    id: "lowri-spouse-falchdyn",
    name: "Lowri Llawen",
    role: "Autorin bei Celtigerns Echo",
    beat: "Gegendarstellungen, Beschwerden & Prüfung strittiger Aussagen",
    portrait: `${portraitRoot}/lowri-llawen.webp`,
    biography: [
      "Lowri hört auch dann weiter zu, wenn zwei Seiten einander widersprechen. Sie ordnet Beschwerden, fordert Antworten ein und achtet darauf, dass eine Gegendarstellung nicht unter bequemeren Nachrichten verschwindet."
    ]
  }),
  author({
    id: "nerys-spouse-falchdyn",
    name: "Nerys Anfoesgarwch",
    role: "Autorin bei Celtigerns Echo",
    beat: "Bürgeranliegen, Stadtnachrichten & Begegnungen vor Ort",
    portrait: `${portraitRoot}/nerys-anfoesgarwch.webp`,
    biography: [
      "Nerys ist gern unterwegs und kommt leicht mit Menschen ins Gespräch. Ihre Berichte verbinden schnelle Stadtnachrichten mit den Stimmen derjenigen, die von ihnen unmittelbar betroffen sind."
    ]
  }),
  author({
    id: "ceredig-falchdyn",
    name: "Ceredig Falchdyn",
    role: "Lokalreporter von Gwynthors Bannkreis",
    beat: "Gwynthor und sein Bannkreis",
    portrait: `${portraitRoot}/ceredig-falchdyn.webp`,
    biography: [
      "Ceredig berichtet aus Gwynthor und den Siedlungen seines Bannkreises. Er kennt die Wege, Märkte und Brunnen ebenso gut wie die Orte, an denen ein Gerücht zur überprüfbaren Nachricht werden kann."
    ]
  }),
  author({
    id: "branwen-falchdyn",
    name: "Branwen Falchdyn",
    role: "Freche Nachwuchsreporterin",
    beat: "Straßenleben, Handwerk & junge Stimmen",
    portrait: `${portraitRoot}/branwen-falchdyn.webp`,
    biography: [
      "Branwen fragt direkt, schreibt lebendig und lässt sich von Rang oder Amtsstube wenig beeindrucken. Ihre freche Art öffnet ihr manche Tür und bringt sie vor andere umso schneller wieder hinaus."
    ]
  }),
  author({
    id: "taliesin-falchdyn",
    name: "Taliesin Falchdyn",
    role: "Karikaturist und Satiriker",
    beat: "Karikatur, Alltagswidersprüche & volksnahe Satire",
    portrait: `${portraitRoot}/taliesin-falchdyn.webp`,
    biography: [
      "Taliesin zeichnet Eitelkeit größer, Ausreden dünner und den Alltag ein wenig ehrlicher. Seine Satire zielt auf Verhalten und Missstände; unbestätigter Klatsch allein ist ihm zu billig."
    ]
  }),
  ...Array.from({ length: 4 }, (_, index) => createVacantEchoAuthor(index + 1, "Gwynthor"))
]);

export const publication = createCeltigernsEchoPublication({
  id: "celtigerns-echo-gwynthor",
  placeId: "gwynthor",
  edition: "Gwynthor",
  region: "Gräfische Baronie Llamreis Ankunft",
  printLocation: "Hauptredaktion von Celtigerns Echo zu Gwynthor",
  location: Object.freeze({
    name: "Gwynthor",
    href: "/Orte/grossstadt.html?id=gwynthor"
  }),
  authors
});

export default createIssue(publication, {
  id: "1740-03-18",
  publicationDate: DEFAULT_PUBLICATION_DATE,
  summary: "Celtigerns Echo bereitet seine erste Gwynthorer Ausgabe mit dreizehn benannten Redaktionsmitgliedern und vier offenen Autorenstellen vor. Im Mittelpunkt stehen der Bannkreis, seine Nachbarschaften und die kleinen Geschichten, die für die Menschen vor Ort groß sind.",
  articles: Object.freeze([
    createArticle({
      id: "willkommen-bei-celtigerns-echo",
      title: "Was bewegt euren Bannkreis?",
      authorId: "aneirin-falchdyn",
      typeId: "hauptgeschichte",
      tone: "Einladend, aufmerksam, volksnah",
      length: "Kurz",
      teaser: "Die neue Redaktion öffnet ihre Anliegenbücher und bittet Gwynthor um jene Geschichten, die sonst zwischen Markt, Werkstatt und Ratssaal verloren gehen.",
      bylineNote: "Aneirin Falchdyn über den Anspruch der ersten Gwynthorer Ausgabe.",
      bodyPath: `${articleRoot}/willkommen-bei-celtigerns-echo.html`
    })
  ])
});
