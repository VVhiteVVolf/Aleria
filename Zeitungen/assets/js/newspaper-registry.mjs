const entries = Object.freeze([
  Object.freeze({
    id: "schwarzbote-gwynthor",
    aliases: Object.freeze(["schwarzbote", "gwynthor"]),
    name: "Der Schwarzbote",
    edition: "Gwynthor",
    dataModule: "/Zeitungen/data/schwarzbote-gwynthor/edition.mjs?v=20260901a"
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
