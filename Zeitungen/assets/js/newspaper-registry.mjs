const CURRENT_ISSUE_ID = "1740-03-18";
const CURRENT_PUBLICATION_DATE = Object.freeze({ day: 18, month: 3, year: 1740 });

const entries = Object.freeze([
  publicationEntry({
    id: "schwarzbote-gwynthor",
    aliases: Object.freeze(["schwarzbote", "gwynthor"]),
    titleId: "schwarzbote",
    placeId: "gwynthor",
    isDefaultForPlace: true,
    name: "Der Schwarzbote",
    edition: "Gwynthor",
    cover: "/Zeitungen/data/schwarzbote-gwynthor/assets/schwarzbote-gwynthor.png",
    themeId: "schwarzbote",
    issues: [issueEntry("/Zeitungen/data/schwarzbote-gwynthor/edition.mjs?v=20260903a")]
  }),
  publicationEntry({
    id: "celtigerns-echo-gwynthor",
    aliases: Object.freeze(["echo-gwynthor"]),
    titleId: "celtigerns-echo",
    placeId: "gwynthor",
    name: "Celtigerns Echo",
    edition: "Gwynthor",
    cover: "/Stammbäume/assets/images/houses/Llamreis%20Ankunft/Bürgerliche/Gwynthor/Celtigerns-Echo.png",
    themeId: "celtigerns-echo",
    issues: [issueEntry("/Zeitungen/data/celtigerns-echo-gwynthor/edition.mjs?v=20260903a")]
  }),
  publicationEntry({
    id: "schwarzbote-abergwint",
    aliases: Object.freeze(["abergwint"]),
    titleId: "schwarzbote",
    placeId: "abergwint",
    isDefaultForPlace: true,
    name: "Der Schwarzbote",
    edition: "Abergwint",
    cover: "/Zeitungen/data/schwarzbote-abergwint/assets/schwarzbote-abergwint.png",
    themeId: "schwarzbote",
    issues: [issueEntry("/Zeitungen/data/schwarzbote-abergwint/edition.mjs?v=20260903a")]
  }),
  publicationEntry({
    id: "celtigerns-echo-abergwint",
    aliases: Object.freeze(["echo-abergwint"]),
    titleId: "celtigerns-echo",
    placeId: "abergwint",
    name: "Celtigerns Echo",
    edition: "Abergwint",
    cover: "/Stammbäume/assets/images/houses/Llamreis%20Ankunft/Bürgerliche/Gwynthor/Celtigerns-Echo.png",
    themeId: "celtigerns-echo",
    issues: [issueEntry("/Zeitungen/data/celtigerns-echo-abergwint/edition.mjs?v=20260903a")]
  }),
  publicationEntry({
    id: "schwarzbote-castellbryn",
    aliases: Object.freeze(["castellbryn"]),
    titleId: "schwarzbote",
    placeId: "castellbryn",
    isDefaultForPlace: true,
    name: "Der Schwarzbote",
    edition: "Castellbryn",
    cover: "/Zeitungen/data/schwarzbote-castellbryn/assets/schwarzbote-castellbryn.png",
    themeId: "schwarzbote",
    issues: [issueEntry("/Zeitungen/data/schwarzbote-castellbryn/edition.mjs?v=20260903a")]
  }),
  publicationEntry({
    id: "celtigerns-echo-castellbryn",
    aliases: Object.freeze(["echo-castellbryn"]),
    titleId: "celtigerns-echo",
    placeId: "castellbryn",
    name: "Celtigerns Echo",
    edition: "Castellbryn",
    cover: "/Stammbäume/assets/images/houses/Llamreis%20Ankunft/Bürgerliche/Gwynthor/Celtigerns-Echo.png",
    themeId: "celtigerns-echo",
    issues: [issueEntry("/Zeitungen/data/celtigerns-echo-castellbryn/edition.mjs?v=20260903a")]
  }),
  publicationEntry({
    id: "schwarzbote-rhosmere",
    aliases: Object.freeze(["rhosmere"]),
    titleId: "schwarzbote",
    placeId: "rhosmere",
    isDefaultForPlace: true,
    name: "Der Schwarzbote",
    edition: "Rhosmere",
    cover: "/Zeitungen/data/schwarzbote-rhosmere/assets/schwarzbote-rhosmere.png",
    themeId: "schwarzbote",
    issues: [issueEntry("/Zeitungen/data/schwarzbote-rhosmere/edition.mjs?v=20260903a")]
  }),
  publicationEntry({
    id: "celtigerns-echo-rhosmere",
    aliases: Object.freeze(["echo-rhosmere"]),
    titleId: "celtigerns-echo",
    placeId: "rhosmere",
    name: "Celtigerns Echo",
    edition: "Rhosmere",
    cover: "/Stammbäume/assets/images/houses/Llamreis%20Ankunft/Bürgerliche/Gwynthor/Celtigerns-Echo.png",
    themeId: "celtigerns-echo",
    issues: [issueEntry("/Zeitungen/data/celtigerns-echo-rhosmere/edition.mjs?v=20260903a")]
  })
]);

export function findNewspaperEntry(requestedId) {
  const id = normalizeId(requestedId);
  if (!id) return entries[0] || null;

  return entries.find((entry) => [entry.id, ...(entry.aliases || [])]
    .map(normalizeId)
    .includes(id)) || null;
}

export function getNewspaperEntries() {
  return entries;
}

export function getNewspaperEntriesForPlace(placeId) {
  const normalizedPlaceId = normalizeId(placeId);
  return entries.filter((entry) => normalizeId(entry.placeId) === normalizedPlaceId);
}

export function findDefaultNewspaperEntryForPlace(placeId) {
  const placeEntries = getNewspaperEntriesForPlace(placeId);
  return placeEntries.find((entry) => entry.isDefaultForPlace) || placeEntries[0] || null;
}

function publicationEntry(value) {
  const issues = Object.freeze((value.issues || []).map((issue) => Object.freeze({ ...issue })));
  return Object.freeze({
    ...value,
    aliases: Object.freeze([...(value.aliases || [])]),
    issues,
    dataModule: issues[0]?.dataModule || ""
  });
}

function issueEntry(dataModule) {
  return Object.freeze({
    id: CURRENT_ISSUE_ID,
    publicationDate: CURRENT_PUBLICATION_DATE,
    dataModule
  });
}

function normalizeId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
