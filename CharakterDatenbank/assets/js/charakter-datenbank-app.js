const state = {
  characters: [],
  filtered: [],
};

const els = {};
let localRepositoryPromise = null;

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  bindEvents();
  loadCharacters();
});

function bindElements() {
  [
    "searchInput", "landFilter", "countyFilter", "settlementFilter", "genderFilter",
    "clanFilter", "orgFilter", "statusFilter", "ageMin", "ageMax", "resetBtn",
    "reloadDataBtn", "sortSelect", "resultCount", "resultList", "emptyState",
    "characterCardTemplate", "syncDot", "syncText",
  ].forEach((id) => els[id] = document.getElementById(id));
}

function bindEvents() {
  ["searchInput", "landFilter", "countyFilter", "settlementFilter", "genderFilter",
    "clanFilter", "orgFilter", "statusFilter", "ageMin", "ageMax", "sortSelect"]
    .forEach((id) => els[id].addEventListener("input", applyFilters));

  els.resetBtn.addEventListener("click", resetFilters);
  els.reloadDataBtn.addEventListener("click", () => loadCharacters({ forceLocal: true }));
}

async function loadCharacters({ forceLocal = false } = {}) {
  setSync("loading", "lade");
  const repository = await loadLocalRepository();
  const local = await repository.loadLocalCharacterDatabase({ force: forceLocal });
  let online = [];
  try {
    await waitForFirebase();
    online = await window.CharacterDB.loadAll();
    setSync("ok", online.length ? "online + lokal" : "lokal");
  } catch (error) {
    console.warn(error);
    setSync(local.characters.length ? "" : "err", local.characters.length ? "lokal" : "nicht verfügbar");
  }
  state.characters = normalizeCharacters(repository.mergeCharacterDatabases(online, local.characters));
  populateFilters();
  applyFilters();
}

function loadLocalRepository() {
  if (!localRepositoryPromise) localRepositoryPromise = import("./character-database-client.mjs?v=20260906-character-vitality-v1");
  return localRepositoryPromise;
}

function applyFilters() {
  const query = normalizeText(els.searchInput.value);
  const minAge = parseInt(els.ageMin.value, 10);
  const maxAge = parseInt(els.ageMax.value, 10);
  const filters = {
    land: els.landFilter.value,
    county: els.countyFilter.value,
    settlement: els.settlementFilter.value,
    gender: els.genderFilter.value,
    clan: els.clanFilter.value,
    status: els.statusFilter.value,
    org: els.orgFilter.value,
  };

  state.filtered = state.characters.filter((character) => {
    if (query && !character.searchIndex.includes(query)) return false;
    if (filters.land && character.land !== filters.land) return false;
    if (filters.county && character.county !== filters.county) return false;
    if (filters.settlement && character.settlement !== filters.settlement) return false;
    if (filters.gender && character.gender !== filters.gender) return false;
    if (filters.clan && character.clan !== filters.clan) return false;
    if (filters.status && character.status !== filters.status) return false;
    if (filters.org && !(character.organizations || []).includes(filters.org)) return false;
    if (!Number.isNaN(minAge) && Number.isFinite(character.age) && character.age < minAge) return false;
    if (!Number.isNaN(maxAge) && Number.isFinite(character.age) && character.age > maxAge) return false;
    return true;
  });

  sortResults();
  renderResults();
}

function sortResults() {
  const mode = els.sortSelect.value;
  state.filtered.sort((a, b) => {
    if (mode === "age") return (a.age ?? 9999) - (b.age ?? 9999);
    if (mode === "land") return cmp(a.landName || a.land, b.landName || b.land) || cmp(a.fullName, b.fullName);
    if (mode === "organization") return cmp((a.organizationNames || [])[0], (b.organizationNames || [])[0]) || cmp(a.fullName, b.fullName);
    return cmp(a.fullName, b.fullName);
  });
}

function renderResults() {
  els.resultCount.textContent = state.filtered.length;
  els.resultList.innerHTML = "";
  els.emptyState.classList.toggle("show", state.filtered.length === 0);

  state.filtered.forEach((character) => {
    const node = els.characterCardTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector('[data-field="initials"]').textContent = initials(character);
    node.querySelector('[data-field="fullName"]').textContent = character.fullName;
    node.querySelector('[data-field="meta"]').textContent = [
      character.age ? `${character.age} Jahre` : "",
      character.genderName || character.gender,
      character.species,
      character.role,
    ].filter(Boolean).join(" · ");
    node.querySelector('[data-field="description"]').textContent = character.description || "";
    renderFacts(node.querySelector(".facts"), character);
    renderTags(node.querySelector(".tags"), character.tags || []);
    els.resultList.appendChild(node);
  });
}

function renderFacts(list, character) {
  const facts = [
    ["Land", character.landName || character.land],
    ["Region", character.countyName || character.county],
    ["Ort", character.settlementName || character.settlement],
    ["Clan/Haus", character.clanName || character.clan],
    ["Organisation", (character.organizationNames || character.organizations || []).join(", ")],
    ["Status", character.statusName || character.status],
  ].filter(([, value]) => value);

  list.innerHTML = facts.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join("");
}

function renderTags(target, tags) {
  target.innerHTML = tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
}

function populateFilters() {
  setOptions(els.landFilter, state.characters, "land", "landName");
  setOptions(els.countyFilter, state.characters, "county", "countyName");
  setOptions(els.settlementFilter, state.characters, "settlement", "settlementName");
  setOptions(els.genderFilter, state.characters, "gender", "genderName");
  setOptions(els.clanFilter, state.characters, "clan", "clanName");
  setOptions(els.statusFilter, state.characters, "status", "statusName");
  setOptionsFromArrays(els.orgFilter, state.characters, "organizations", "organizationNames");
}

function setOptions(select, rows, valueKey, labelKey) {
  const current = select.value;
  const pairs = rows
    .filter((row) => row[valueKey])
    .map((row) => [row[valueKey], row[labelKey] || row[valueKey]]);
  writeOptions(select, pairs, current);
}

function setOptionsFromArrays(select, rows, valueKey, labelKey) {
  const current = select.value;
  const pairs = [];
  rows.forEach((row) => {
    (row[valueKey] || []).forEach((value, index) => {
      pairs.push([value, (row[labelKey] || [])[index] || value]);
    });
  });
  writeOptions(select, pairs, current);
}

function writeOptions(select, pairs, current) {
  const unique = new Map(pairs.sort((a, b) => cmp(a[1], b[1])));
  select.innerHTML = '<option value="">Alle</option>' + [...unique]
    .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
    .join("");
  if ([...unique.keys()].includes(current)) select.value = current;
}

function resetFilters() {
  ["searchInput", "landFilter", "countyFilter", "settlementFilter", "genderFilter",
    "clanFilter", "orgFilter", "statusFilter", "ageMin", "ageMax"].forEach((id) => els[id].value = "");
  applyFilters();
}

function normalizeCharacters(rows) {
  return rows.map((row) => {
    const genealogy = row.genealogy || {};
    const classification = row.localRecord?.classification || {};
    const primary = classification.primary || {};
    const family = classification.families?.[0] || null;
    const taxonomy = String(row.taxonomyPath || "").split(">").map((part) => part.trim()).filter(Boolean);
    const groupLinks = classification.groups || [];
    const placeLinks = classification.places || [];
    const fullName = row.fullName || [row.name, row.surname].filter(Boolean).join(" ");
    const landName = row.landName || taxonomy[0] || "";
    const countyName = row.countyName || taxonomy[1] || "";
    const settlementName = row.settlementName || row.currentLocation || placeLinks[0]?.label
      || (primary.kind === "place" ? primary.label : "");
    const clanName = row.clanName || genealogy.houseName || family?.familyTitle
      || (primary.kind === "family" ? primary.label : "");
    const organizations = uniqueStrings([
      ...(row.organizations || []),
      ...groupLinks.map(group => group.id),
      ...(primary.kind === "group" ? [primary.id] : [])
    ]);
    const organizationNames = uniqueStrings([
      ...(row.organizationNames || []),
      ...groupLinks.map(group => group.label),
      ...(primary.kind === "group" ? [primary.label] : [])
    ]);
    const gender = row.gender || genealogy.sex || "";
    const status = row.status || genealogy.status || "";
    const tags = uniqueStrings([
      ...(row.tags || []),
      ...(genealogy.tags || []),
      primary.kind,
      row.playerOwner ? `spieler:${row.playerOwner}` : ""
    ]);
    const searchParts = [
      fullName, row.name, row.surname, landName, countyName, row.baronyName,
      settlementName, clanName, ...organizationNames, ...tags, row.fraktion, row.title,
      row.bio, row.identity?.worldPersonId,
      ...(row.searchTokens || []),
    ];
    return {
      ...row,
      fullName,
      gender,
      genderName: row.genderName || genderLabel(gender),
      status,
      statusName: row.statusName || statusLabel(status),
      land: row.land || slugify(landName),
      landName,
      county: row.county || slugify(countyName),
      countyName,
      settlement: row.settlement || slugify(settlementName),
      settlementName,
      clan: row.clan || family?.familyId || (primary.kind === "family" ? primary.id : ""),
      clanName,
      organizations,
      organizationNames,
      role: row.role || row.title || "",
      description: row.description || row.bio || "",
      tags,
      searchIndex: normalizeText(searchParts.filter(Boolean).join(" ")),
    };
  });
}

function waitForFirebase() {
  if (window.CharacterDB) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("Firebase-Zeitüberschreitung")), 4000);
    window.addEventListener("character-db-ready", () => {
      window.clearTimeout(timeout);
      resolve();
    }, { once: true });
  });
}

function setSync(stateName, text) {
  els.syncDot.className = stateName || "";
  els.syncText.textContent = text;
}

function initials(character) {
  return (character.fullName || "?").split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0]?.toUpperCase()).join("");
}

function normalizeText(value) {
  return String(value || "").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function slugify(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function uniqueStrings(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function genderLabel(value) {
  return ({ male: "männlich", female: "weiblich", unknown: "unbekannt" })[value] || value;
}

function statusLabel(value) {
  return ({ alive: "lebendig", dead: "verstorben", missing: "vermisst", unknown: "unbekannt" })[value] || value;
}

function cmp(a, b) {
  return String(a || "").localeCompare(String(b || ""), "de", { sensitivity: "base" });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}
