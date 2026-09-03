import { DEFAULT_PUBLICATION_DATE } from "../../assets/js/newspaper-aleria-date.mjs?v=20260903a";
import {
  createArticle,
  createIssue
} from "../../assets/js/newspaper-model.mjs?v=20260904a";
import { createFluesterfaecherPublication } from "../fluesterfaecher/publication.mjs";

const publication = createFluesterfaecherPublication({
  id: "fluesterfaecher-gwynthor",
  placeId: "gwynthor",
  edition: "Gwynthor",
  region: "Celtigerns Wacht",
  printLocation: "Salonredaktion des Flüsterfächers zu Gwynthor",
  location: Object.freeze({
    name: "Gwynthor",
    href: "/Orte/grossstadt.html?id=gwynthor"
  })
});

export default createIssue(publication, {
  id: "1740-03-18",
  publicationDate: DEFAULT_PUBLICATION_DATE,
  summary: "Gwynthor hebt erstmals den Fächer: Das neue Gesellschaftsmagazin widmet sich den Salons und Schlafzimmern, den Spieltischen und Modehäusern, den begehrten Namen und den gefürchteten Urteilen der Stadt. Seine Lokalredaktion ist vorbereitet, aber noch vollständig unbesetzt.",
  articles: Object.freeze([
    createArticle({
      id: "der-erste-faecherschlag",
      title: "Der erste Fächerschlag",
      authorId: "fluesterfaecher-gwynthor-chefredaktion",
      typeId: "hinter-dem-faecher",
      tone: "Verführerisch, selbstbewusst und scharfzüngig",
      length: "Eröffnungsstück",
      teaser: "Warum Gwynthor ein Magazin braucht, das nicht an der Salontür stehen bleibt – und weshalb Samt eine scharfe Kante besitzen darf.",
      bylineNote: "Programmatische Eröffnung der noch zu besetzenden Gwynthorer Lokalredaktion.",
      bodyPath: "/Zeitungen/data/fluesterfaecher-gwynthor/articles/der-erste-faecherschlag.html"
    })
  ])
});
