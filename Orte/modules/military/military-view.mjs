import {
  formatForceStrength,
  formatPercentage,
  getForceKind,
  normalizeMilitaryProfile
} from "./military-profile.mjs?v=20260904a";

const root = document.querySelector("[data-military-view]");

if (root) start();

async function start() {
  const placeId = readPlaceId();
  const entry = findPlaceEntry(placeId);

  if (!entry) {
    renderMessage("Ort nicht gefunden", "Für diese Adresse ist keine Ortsseite registriert.");
    return;
  }

  try {
    const data = await loadPlaceData(entry);
    renderPlace(entry, data);
  } catch (error) {
    console.warn("Militärdaten konnten nicht geladen werden.", error);
    renderPlace(entry, createFallbackData(entry));
  }
}

function renderPlace(entry, data) {
  const placeName = String(data?.name || entry.name || "Unbekannter Ort").trim();
  const images = data?.presentation?.images || {};
  const catalogImages = window.ALERIA_CELTIGERNS_PLACES?.find(entry.id)?.images || {};
  const profile = normalizeMilitaryProfile(data?.militaryView, {
    placeId: entry.id,
    placeName,
    crest: images["icon-png"] || catalogImages["icon-png"],
    heroImage: images["bild-einer-stadtwache-png"]
  });
  const enabled = data?.features?.militaryView !== false
    && data?.militaryView?.enabled !== false;

  document.title = `${profile.title} - Aleria`;
  root.dataset.placeId = entry.id;
  root.replaceChildren(
    renderNavigation(entry.id, placeName),
    renderHero(profile),
    enabled
      ? profile.status === "ready" ? renderDetails(profile) : renderPlaceholder(profile)
      : renderDisabled(placeName)
  );
}

function renderNavigation(placeId, placeName) {
  const navigation = element("nav", "military-navigation");
  navigation.setAttribute("aria-label", "Seitennavigation");

  const back = element("a", "military-back", `← Zurück nach ${placeName}`);
  back.href = `/Orte/grossstadt.html?id=${encodeURIComponent(placeId)}#militar`;
  navigation.append(back, element("span", "military-archive-label", "Militärarchiv · Ortsansicht"));
  return navigation;
}

function renderHero(profile) {
  const hero = element("header", "military-hero");
  const copy = element("div", "military-hero__copy");
  const headingRow = element("div", "military-hero__heading");

  if (profile.crest.src) {
    headingRow.append(renderImage(profile.crest, `${profile.placeName} – Wappen`, "military-hero__crest"));
  } else {
    headingRow.append(element("span", "military-hero__crest military-media-fallback", "♜"));
  }

  const titles = element("div");
  titles.append(
    element("span", "military-eyebrow", "Streitkräfte und Aufgebote"),
    element("h1", "", profile.title),
    element("p", "military-subtitle", profile.subtitle)
  );
  headingRow.append(titles);
  copy.append(headingRow);

  const tags = element("div", "military-hero__tags");
  tags.append(
    tag(profile.status === "ready" ? "Aufstellung erfasst" : "In Vorbereitung"),
    tag(profile.placeName)
  );
  copy.append(tags);

  const visual = element("figure", "military-hero__visual");
  if (profile.heroImage.src) {
    visual.append(renderImage(profile.heroImage, `Militär von ${profile.placeName}`));
  } else {
    visual.classList.add("is-missing");
    visual.append(element("span", "military-hero__symbol", "⚔"));
  }

  hero.append(copy, visual);
  return hero;
}

function renderPlaceholder(profile) {
  const section = element("section", "military-placeholder");
  section.setAttribute("aria-labelledby", "military-placeholder-title");

  const heading = element("h2", "", "Aufstellung in Vorbereitung");
  heading.id = "military-placeholder-title";
  section.append(
    element("span", "military-placeholder__mark", "⌁⚔⌁"),
    heading,
    element("p", "", `Für ${profile.placeName} wurde noch keine detaillierte Verteilung der Streitkräfte hinterlegt.`),
    renderPlaceholderFields()
  );
  return section;
}

function renderPlaceholderFields() {
  const fields = element("div", "military-placeholder__fields");
  [
    ["Streitkräfte", "Haus, Wache und Aufgebote"],
    ["Vasallen", "Wappen und Truppenanteile"],
    ["Truppengattungen", "Ausrüstung und Bildgalerie"]
  ].forEach(([title, subtitle]) => {
    const field = element("article", "military-placeholder__field");
    field.append(
      element("span", "military-placeholder__empty", "–"),
      element("strong", "", title),
      element("small", "", subtitle)
    );
    fields.append(field);
  });
  return fields;
}

function renderDisabled(placeName) {
  const section = element("section", "military-placeholder is-disabled");
  section.append(
    element("span", "military-placeholder__mark", "◇"),
    element("h2", "", "Militäransicht nicht verfügbar"),
    element("p", "", `Für ${placeName} ist dieses optionale Modul derzeit deaktiviert.`)
  );
  return section;
}

function renderDetails(profile) {
  const content = element("div", "military-details");
  content.append(renderSummary(profile));
  if (profile.forces.length) content.append(renderForces(profile));
  if (profile.units.length) content.append(renderUnits(profile));
  if (profile.note) content.append(element("p", "military-note", profile.note));
  return content;
}

function renderSummary(profile) {
  const summary = element("section", "military-summary");
  summary.setAttribute("aria-label", "Zusammenfassung der Streitkräfte");
  summary.append(
    stat(profile.total === null ? "–" : formatNumber(profile.total), profile.totalLabel),
    stat(formatNumber(profile.forces.length), "Kontingente"),
    stat(formatNumber(profile.units.length), "Truppengattungen")
  );
  return summary;
}

function renderForces(profile) {
  const section = element("section", "military-section");
  section.append(sectionHeading("Verteilung der Streitkräfte", "Hausmacht, Wachen und Vasallen"));

  const measurableForces = profile.forces.filter((force) => force.share !== null && force.share > 0);
  if (measurableForces.length) {
    const bar = element("div", "military-composition");
    bar.setAttribute("aria-label", "Prozentuale Verteilung der Streitkräfte");
    measurableForces.forEach((force) => {
      const segment = element("span", "military-composition__segment");
      segment.style.setProperty("--military-force-color", force.color);
      segment.style.flexGrow = String(force.share);
      segment.title = `${force.name}: ${formatPercentage(force.share)} %`;
      segment.setAttribute("aria-label", segment.title);
      bar.append(segment);
    });
    section.append(bar);
  }

  const grid = element("div", "military-force-grid");
  profile.forces.forEach((force) => grid.append(renderForceCard(force)));
  section.append(grid);
  return section;
}

function renderForceCard(force) {
  const card = element("article", "military-force-card");
  card.style.setProperty("--military-force-color", force.color);
  const emblem = element("div", "military-force-card__emblem");
  const kind = getForceKind(force.kind);

  if (force.crest.src) {
    emblem.append(renderImage(force.crest, `${force.name} – Wappen`));
  } else {
    emblem.append(element("span", "military-force-card__symbol", kind.symbol));
  }

  const copy = element("div", "military-force-card__copy");
  copy.append(
    element("small", "", force.kindLabel),
    element("h3", "", force.name),
    element("strong", "military-force-card__strength", formatForceStrength(force))
  );
  if (force.note) copy.append(element("p", "", force.note));
  card.append(emblem, copy);
  return card;
}

function renderUnits(profile) {
  const section = element("section", "military-section");
  section.append(sectionHeading("Truppengattungen", "Vom einfachen Aufgebot bis zu den Eliterittern"));

  const gallery = element("div", "military-unit-gallery");
  profile.units.forEach((unit) => {
    const card = element("article", "military-unit-card");
    const visual = element("figure", "military-unit-card__visual");
    if (unit.image.src) {
      visual.append(renderImage(unit.image, `${unit.name} – Darstellung`));
    } else {
      visual.classList.add("is-missing");
      visual.append(element("span", "military-unit-card__symbol", "♞"));
    }

    const copy = element("div", "military-unit-card__copy");
    copy.append(element("small", "", unit.branch), element("h3", "", unit.name));
    const meta = [unit.tier, unit.count === null ? "" : `${formatNumber(unit.count)} Mann`].filter(Boolean);
    if (meta.length) copy.append(element("strong", "", meta.join(" · ")));
    if (unit.note) copy.append(element("p", "", unit.note));
    card.append(visual, copy);
    gallery.append(card);
  });
  section.append(gallery);
  return section;
}

function sectionHeading(title, subtitle) {
  const heading = element("div", "military-section__heading");
  heading.append(element("h2", "", title), element("p", "", subtitle));
  return heading;
}

function stat(value, label) {
  const item = element("div", "military-stat");
  item.append(element("strong", "", value), element("span", "", label));
  return item;
}

function tag(text) {
  return element("span", "military-tag", text);
}

function renderImage(media, fallbackAlt, className = "") {
  const image = element("img", className);
  image.src = media.src;
  image.alt = media.alt || fallbackAlt;
  image.loading = "lazy";
  image.decoding = "async";
  image.style.objectFit = media.fit || "contain";
  image.addEventListener("error", () => {
    image.closest("figure, .military-force-card__emblem, .military-hero__heading")?.classList.add("is-missing");
    image.remove();
  }, { once: true });
  return image;
}

function renderMessage(title, message) {
  const section = element("section", "military-load-state");
  section.append(element("span", "", "⚔"), element("h1", "", title), element("p", "", message));
  root.replaceChildren(section);
}

function readPlaceId() {
  const params = new URLSearchParams(window.location.search);
  return normalizeId(params.get("id") || params.get("ort") || window.location.hash.slice(1));
}

function findPlaceEntry(placeId) {
  if (!placeId) return null;
  return (window.ORTE_REGISTRY || []).find((entry) => {
    const aliases = [entry.id, entry.slug, ...(entry.aliases || [])].map(normalizeId);
    return aliases.includes(placeId);
  }) || null;
}

function loadPlaceData(entry) {
  if (!entry.data) return Promise.resolve(createFallbackData(entry));

  window.ORTE_CONFIG = {
    ...(window.ORTE_CONFIG || {}),
    registryEntry: entry,
    docId: normalizeId(entry.id),
    dataPath: entry.data
  };

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = new URL(entry.data, `${window.location.origin}/Orte/`).href;
    script.dataset.militaryPlaceData = entry.id;
    script.addEventListener("load", () => resolve(window.ORT_DATA || createFallbackData(entry)), { once: true });
    script.addEventListener("error", () => reject(new Error(`Ortsdaten für ${entry.id} fehlen.`)), { once: true });
    document.head.append(script);
  });
}

function createFallbackData(entry) {
  return window.ALERIA_CELTIGERNS_PLACES?.createPlaceData(entry.id) || {
    meta: { id: entry.id },
    name: entry.name,
    features: { militaryView: true },
    presentation: { images: {} }
  };
}

function element(tagName, className = "", text = "") {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function formatNumber(value) {
  return new Intl.NumberFormat("de-DE").format(value);
}

function normalizeId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
