const entries = Object.freeze([
  Object.freeze({
    id: "schwarzbote-gwynthor",
    aliases: Object.freeze(["schwarzbote", "gwynthor"]),
    name: "Der Schwarzbote",
    edition: "Gwynthor",
    dataModule: "/Zeitungen/data/schwarzbote-gwynthor/edition.mjs?v=20260901a"
  }),
  Object.freeze({
    id: "schwarzbote-abergwint",
    aliases: Object.freeze(["abergwint"]),
    name: "Der Schwarzbote",
    edition: "Abergwint",
    dataModule: "/Zeitungen/data/schwarzbote-abergwint/edition.mjs?v=20260902a"
  }),
  Object.freeze({
    id: "schwarzbote-castellbryn",
    aliases: Object.freeze(["castellbryn"]),
    name: "Der Schwarzbote",
    edition: "Castellbryn",
    dataModule: "/Zeitungen/data/schwarzbote-castellbryn/edition.mjs?v=20260902a"
  }),
  Object.freeze({
    id: "schwarzbote-rhosmere",
    aliases: Object.freeze(["rhosmere"]),
    name: "Der Schwarzbote",
    edition: "Rhosmere",
    dataModule: "/Zeitungen/data/schwarzbote-rhosmere/edition.mjs?v=20260902a"
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

function normalizeId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
