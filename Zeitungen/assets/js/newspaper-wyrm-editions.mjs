const places = Object.freeze([
  ["twr-brynmawr", "Tŵr Brynmawr"],
  ["mwyncreig", "Mwyncreig"],
  ["craithglyn", "Craithglyn"],
  ["lysfaen", "Llysfaen"],
  ["bronhir", "Bronhir"]
]);

const titles = Object.freeze([
  {
    id: "celtigerns-echo",
    name: "Celtigerns Echo",
    cover: "/Stammbäume/assets/images/houses/Llamreis%20Ankunft/Bürgerliche/Gwynthor/Celtigerns-Echo.png"
  },
  {
    id: "schwarzbote",
    name: "Der Schwarzbote",
    cover: "/IconOrdner/StempelSchwarzbote.png"
  }
]);

export const wyrmNewspaperEditions = Object.freeze(places.flatMap(([placeId, edition]) =>
  titles.map((title) => Object.freeze({
    id: `${title.id}-${placeId}`,
    titleId: title.id,
    placeId,
    name: title.name,
    edition,
    cover: title.cover,
    themeId: title.id,
    isDefaultForPlace: title.id === "celtigerns-echo",
    dataModule: `/Zeitungen/data/${title.id}-${placeId}/edition.mjs?v=20260913a`
  }))
));
