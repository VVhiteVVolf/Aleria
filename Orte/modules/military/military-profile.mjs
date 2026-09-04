const FORCE_KINDS = Object.freeze({
  house: Object.freeze({ label: "Hauseigene Streitkräfte", color: "#8f3328", symbol: "♜" }),
  vassal: Object.freeze({ label: "Vasallenaufgebot", color: "#b7792b", symbol: "◆" }),
  cityWatch: Object.freeze({ label: "Stadtwache", color: "#355d70", symbol: "♟" }),
  localWatch: Object.freeze({ label: "Ortswache", color: "#527348", symbol: "♙" }),
  fleet: Object.freeze({ label: "Flotte und Seestreitkräfte", color: "#43598a", symbol: "⚓" }),
  militia: Object.freeze({ label: "Miliz und Landwehr", color: "#7b6945", symbol: "⚔" }),
  other: Object.freeze({ label: "Weitere Streitkräfte", color: "#67536f", symbol: "✦" })
});

export function normalizeMilitaryProfile(rawProfile, context = {}) {
  const raw = isRecord(rawProfile) ? rawProfile : {};
  const placeName = cleanText(context.placeName, "Unbekannter Ort");
  const forces = asArray(raw.forces).map(normalizeForce).filter(Boolean);
  const units = asArray(raw.units).map(normalizeUnit).filter(Boolean);
  const total = resolveTotal(raw.total, forces);
  const normalizedForces = forces.map((force) => Object.freeze({
    ...force,
    share: force.share ?? calculateShare(force.count, total)
  }));
  const hasDetails = normalizedForces.length > 0 || units.length > 0;

  return Object.freeze({
    placeId: cleanText(context.placeId),
    placeName,
    status: raw.status === "ready" || hasDetails ? "ready" : "placeholder",
    title: cleanText(raw.title, `Streitkräfte von ${placeName}`),
    subtitle: cleanText(raw.subtitle, "Aufstellung, Kontingente und Truppengattungen"),
    total,
    totalLabel: cleanText(raw.totalLabel, "Gesamtstärke"),
    note: cleanText(raw.note),
    crest: normalizeImage(raw.crest || context.crest),
    heroImage: normalizeImage(raw.heroImage || context.heroImage),
    forces: Object.freeze(normalizedForces),
    units: Object.freeze(units)
  });
}

export function formatForceStrength(force) {
  const values = [];
  if (force?.count !== null && force?.count !== undefined) {
    values.push(new Intl.NumberFormat("de-DE").format(force.count));
  }
  if (force?.share !== null && force?.share !== undefined) {
    values.push(`${formatPercentage(force.share)} %`);
  }
  return values.join(" · ") || "nicht erfasst";
}

export function formatPercentage(value) {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value);
}

export function getForceKind(kind) {
  return FORCE_KINDS[normalizeKind(kind)] || FORCE_KINDS.other;
}

function normalizeForce(value, index) {
  if (!isRecord(value)) return null;
  const kindId = normalizeKind(value.kind);
  const kind = getForceKind(kindId);
  const name = cleanText(value.name, `${kind.label} ${index + 1}`);

  return Object.freeze({
    id: cleanText(value.id, slugify(name) || `kontingent-${index + 1}`),
    name,
    kind: kindId,
    kindLabel: cleanText(value.kindLabel, kind.label),
    count: normalizeNonNegativeNumber(value.count),
    share: normalizePercentage(value.share),
    color: normalizeColor(value.color, kind.color),
    crest: normalizeImage(value.crest),
    image: normalizeImage(value.image),
    note: cleanText(value.note)
  });
}

function normalizeUnit(value, index) {
  if (!isRecord(value)) return null;
  const name = cleanText(value.name, `Truppengattung ${index + 1}`);
  return Object.freeze({
    id: cleanText(value.id, slugify(name) || `truppengattung-${index + 1}`),
    name,
    branch: cleanText(value.branch, "Truppengattung"),
    tier: cleanText(value.tier),
    count: normalizeNonNegativeNumber(value.count),
    image: normalizeImage(value.image),
    note: cleanText(value.note)
  });
}

function normalizeImage(value) {
  if (typeof value === "string") {
    return Object.freeze({ src: value, alt: "", fit: "contain" });
  }
  if (!isRecord(value)) {
    return Object.freeze({ src: "", alt: "", fit: "contain" });
  }
  return Object.freeze({
    src: cleanText(value.src),
    alt: cleanText(value.alt),
    fit: value.fit === "cover" ? "cover" : "contain"
  });
}

function resolveTotal(value, forces) {
  const explicit = normalizeNonNegativeNumber(value);
  if (explicit !== null) return explicit;
  const knownCounts = forces.map((force) => force.count).filter((count) => count !== null);
  return knownCounts.length ? knownCounts.reduce((sum, count) => sum + count, 0) : null;
}

function calculateShare(count, total) {
  if (count === null || total === null || total <= 0) return null;
  return Math.round((count / total) * 1000) / 10;
}

function normalizeNonNegativeNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : null;
}

function normalizePercentage(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.min(100, Math.max(0, Math.round(number * 10) / 10));
}

function normalizeKind(value) {
  const key = String(value || "other")
    .trim()
    .replace(/[-_\s]+(.)/g, (_, letter) => letter.toUpperCase());
  return Object.hasOwn(FORCE_KINDS, key) ? key : "other";
}

function normalizeColor(value, fallback) {
  const color = cleanText(value);
  return /^#[0-9a-f]{3,8}$/i.test(color) ? color : fallback;
}

function cleanText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
