import {
  createPlaceholderIssue,
  createPlaceholderPublication
} from "../../assets/js/newspaper-placeholder-edition.mjs?v=20260903a";

const dataRoot = "/Zeitungen/data/schwarzbote-rhosmere";

const config = Object.freeze({
  id: "schwarzbote-rhosmere",
  placeId: "rhosmere",
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

export const publication = createPlaceholderPublication(config);
export default createPlaceholderIssue(publication, config);
