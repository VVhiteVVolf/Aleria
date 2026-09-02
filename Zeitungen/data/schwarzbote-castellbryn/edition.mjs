import { createPlaceholderEdition } from "../../assets/js/newspaper-placeholder-edition.mjs";

const dataRoot = "/Zeitungen/data/schwarzbote-castellbryn";

export default createPlaceholderEdition({
  id: "schwarzbote-castellbryn",
  edition: "Castellbryn",
  subtitle: "Nachrichten, Gerüchte und Wahrheiten aus Rhonwens Tränen",
  tagline: "Das Castellbryner Blatt",
  logo: `${dataRoot}/assets/schwarzbote-castellbryn.png`,
  region: "Herrschaft Rhonwens Tränen",
  printLocation: "Schwarzbote zu Castellbryn",
  location: {
    name: "Castellbryn",
    href: "/Orte/grossstadt.html?id=castellbryn"
  },
  articleBodyPath: `${dataRoot}/articles/hauptartikel.html`
});
