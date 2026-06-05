const state = {
  characters: [],
  filtered: [],
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  bindEvents();
  loadCharacters();
});

function bindElements() {
  [
    "searchInput", "landFilter", "countyFilter", "settlementFilter", "genderFilter",
    "clanFilter", "orgFilter", "statusFilter", "ageMin", "ageMax", "resetBtn",
    "loadSeedBtn", "sortSelect", "resultCount", "resultList", "emptyState",
    "characterCardTemplate", "syncDot", "syncText",
  ].forEach((id) => els[id] = document.getElementById(id));
}

function bindEvents() {
  ["searchInput", "landFilter", "countyFilter", "settlementFilter", "genderFilter",
    "clanFilter", "orgFilter", "statusFilter", "ageMin", "ageMax", "sortSelect"]
    .forEach((id) => els[id].addEventListener("input", applyFilters));

  els.resetBtn.addEventListener("click", resetFilters);
  els.loadSeedBtn.addEventListener("click", loadSeedData);
}

async function loadCharacters() {
  setSync("loading", "lade");
  try {
    await waitForFirebase();
    state.characters = normalizeCharacters(await window.CharacterDB.loadAll());
    if (!state.characters.length) {
      state.characters = normalizeCharacters(await fetchJson("data/example.characters.json"));
      setSync("", "lokale Beispieldaten");
    } else {
      setSync("ok", "firebase");
    }
  } catch (error) {
    console.warn(error);
    state.characters = normalizeCharacters(await fetchJson("data/example.characters.json"));
    setSync("err", "offline");
  }
  populateFilters();
  applyFilters();
}

async function loadSeedData() {
  setSync("loading", "import");
  const seed = normalizeCharacters(await fetchJson("data/example.characters.json"));
  try {
    await waitForFirebase();
    for (const character of seed) await window.CharacterDB.upsert(character);
    state.characters = normalizeCharacters(await window.CharacterDB.loadAll());
    setSync("ok", "firebase");
  } catch (error) {
    console.error(error);
    state.characters = seed;
    setSync("err", "import fehlgeschlagen");
  }
  populateFilters();
  applyFilters();
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
    const fullName = row.fullName || [row.name, row.surname].filter(Boolean).join(" ");
    const searchParts = [
      fullName, row.name, row.surname, row.landName, row.countyName, row.baronyName,
      row.settlementName, row.clanName, ...(row.organizationNames || []), ...(row.tags || []),
      ...(row.searchTokens || []),
    ];
    return {
      ...row,
      fullName,
      searchIndex: normalizeText(searchParts.filter(Boolean).join(" ")),
    };
  });
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Konnte ${path} nicht laden`);
  return response.json();
}

function waitForFirebase() {
  if (window.CharacterDB) return Promise.resolve();
  return new Promise((resolve) => window.addEventListener("character-db-ready", resolve, { once: true }));
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
