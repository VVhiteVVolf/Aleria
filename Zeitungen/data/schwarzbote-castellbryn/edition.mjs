import {
  createPlaceholderIssue,
  createPlaceholderPublication
} from "../../assets/js/newspaper-placeholder-edition.mjs?v=20260903a";

const dataRoot = "/Zeitungen/data/schwarzbote-castellbryn";

const config = Object.freeze({
  id: "schwarzbote-castellbryn",
  placeId: "castellbryn",
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

export const publication = createPlaceholderPublication(config);
export default createPlaceholderIssue(publication, config);
