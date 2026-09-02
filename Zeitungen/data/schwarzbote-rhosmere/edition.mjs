import { createPlaceholderEdition } from "../../assets/js/newspaper-placeholder-edition.mjs";

const dataRoot = "/Zeitungen/data/schwarzbote-rhosmere";

export default createPlaceholderEdition({
  id: "schwarzbote-rhosmere",
  edition: "Rhosmere",
  subtitle: "Nachrichten, Gerüchte und Wahrheiten aus Arthus Streben",
  tagline: "Das Rhosmerer Blatt",
  logo: `${dataRoot}/assets/schwarzbote-rhosmere.png`,
  region: "Baronie Arthus Streben",
  printLocation: "Schwarzbote zu Rhosmere",
  location: {
    name: "Rhosmere",
    href: "/Orte/grossstadt.html?id=rhosmere"
  },
  articleBodyPath: `${dataRoot}/articles/hauptartikel.html`
});
