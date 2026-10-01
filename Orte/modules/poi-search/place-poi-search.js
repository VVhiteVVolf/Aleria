(function () {
  "use strict";

  const searchableFields = ["name", "type", "region", "affiliation", "danger", "distance", "description", "searchText"];

  function normalize(value) {
    return String(value || "").toLocaleLowerCase("de").normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss");
  }

  function create({ label = "Orte & Kartenpins", placeholder = "Name, Typ oder Zugehörigkeit suchen …", emptyText = "Keine öffentlichen Einträge vorhanden.", openLabel = "Auf der Karte öffnen", onSelect } = {}) {
    const root = element("section", "place-poi-search");
    root.setAttribute("role", "search");
    root.setAttribute("aria-label", label);
    const toolbar = element("div", "place-poi-search__toolbar");
    const inputLabel = element("label", "place-poi-search__field");
    const labelText = element("span", "place-poi-search__label", label);
    const input = element("input", "place-poi-search__input");
    input.type = "search";
    input.placeholder = placeholder;
    input.autocomplete = "off";
    const toggle = element("button", "place-poi-search__toggle");
    toggle.type = "button";
    toggle.dataset.action = "toggle-results";
    const panel = element("div", "place-poi-search__panel");
    panel.id = `place-poi-results-${crypto.randomUUID()}`;
    panel.hidden = true;
    toggle.setAttribute("aria-controls", panel.id);
    toggle.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", panel.id);
    const status = element("div", "place-poi-search__status");
    status.setAttribute("role", "status");
    const list = element("ul", "place-poi-search__list");
    list.setAttribute("aria-label", label);
    inputLabel.append(labelText, input);
    toolbar.append(inputLabel, toggle);
    panel.append(status, list);
    root.append(toolbar, panel);

    let entries = [];
    let previousItems = "";
    let renderedQuery = null;

    function updateToggle() {
      toggle.textContent = `${panel.hidden ? "Einträge" : "Schließen"} (${entries.length}) ${panel.hidden ? "▾" : "▴"}`;
      toggle.setAttribute("aria-expanded", String(!panel.hidden));
    }

    function setOpen(open) {
      panel.hidden = !open;
      updateToggle();
      if (open) renderResults();
    }

    function renderResults() {
      const query = normalize(input.value).trim();
      if (query === renderedQuery) return;
      const terms = query.split(/\s+/).filter(Boolean);
      const matches = entries.filter(entry => terms.every(term => entry.search.includes(term)));
      const expanded = new Set(Array.from(list.querySelectorAll("details[open]"), detail => detail.dataset.entryKey));
      const fragment = document.createDocumentFragment();
      matches.forEach(entry => fragment.append(createEntry(entry, expanded.has(entry.key), openLabel, Boolean(onSelect))));
      list.replaceChildren(fragment);
      status.textContent = entries.length === 0 ? emptyText
        : matches.length === 0 ? "Keine passenden Einträge gefunden."
          : `${matches.length} ${matches.length === 1 ? "Eintrag" : "Einträge"}${terms.length ? ` von ${entries.length}` : ""}`;
      panel.scrollTop = 0;
      renderedQuery = query;
    }

    input.addEventListener("input", () => setOpen(true));
    input.addEventListener("click", () => setOpen(true));
    root.addEventListener("click", event => {
      const action = event.target.closest("[data-action]");
      if (!action || !root.contains(action)) return;
      if (action.dataset.action === "toggle-results") setOpen(panel.hidden);
      if (action.dataset.action === "open-entry") {
        const entry = entries.find(item => item.key === action.dataset.entryKey);
        if (entry) onSelect?.(entry.poi);
      }
    });
    root.addEventListener("keydown", event => {
      if (event.key === "Escape" && !panel.hidden) {
        event.preventDefault();
        setOpen(false);
        input.focus();
      } else if (event.target === input && (event.key === "ArrowDown" || event.key === "Enter")) {
        event.preventDefault();
        setOpen(true);
        if (event.key === "ArrowDown") list.querySelector("summary")?.focus();
      }
    });

    function setItems(pois) {
      const items = Array.isArray(pois) ? pois.filter(poi => poi && !poi.secret) : [];
      const serialized = JSON.stringify(items);
      if (serialized === previousItems) return;
      previousItems = serialized;
      entries = items.map((poi, index) => ({
        poi,
        key: `${poi.id || "poi"}-${index}`,
        search: normalize(searchableFields.map(field => poi[field]).join(" ")),
      }));
      renderedQuery = null;
      updateToggle();
      if (!panel.hidden) renderResults();
    }

    setItems([]);
    return Object.freeze({ element: root, setItems });
  }

  function createEntry({ poi, key }, open, openLabel, canSelect) {
    const item = element("li", "place-poi-search__item");
    const details = element("details", "place-poi-search__entry");
    details.dataset.entryKey = key;
    details.open = open;
    const summary = element("summary", "place-poi-search__summary");
    if (poi.icon) {
      const icon = element("img", "place-poi-search__icon");
      icon.src = String(poi.icon);
      icon.alt = "";
      icon.loading = "lazy";
      summary.append(icon);
    }
    const heading = element("span", "place-poi-search__heading");
    heading.append(element("strong", "place-poi-search__name", poi.name || "Ohne Titel"));
    const meta = [poi.type, poi.region || poi.affiliation].filter(Boolean).join(" · ");
    if (meta) heading.append(element("span", "place-poi-search__meta", meta));
    summary.append(heading);
    const body = element("div", "place-poi-search__body");
    const facts = element("dl", "place-poi-search__facts");
    [["Gefahrenstufe", poi.danger], ["Entfernung", poi.distance]].forEach(([label, value]) => {
      if (value) facts.append(element("dt", "", label), element("dd", "", value));
    });
    if (facts.childElementCount) body.append(facts);
    if (poi.description) body.append(element("p", "place-poi-search__description", poi.description));
    if (poi.href) {
      const link = element("a", "place-poi-search__link", "Eintrag öffnen");
      link.href = String(poi.href);
      body.append(link);
    }
    if (canSelect && poi.id) {
      const button = element("button", "place-poi-search__open", openLabel);
      button.type = "button";
      button.dataset.action = "open-entry";
      button.dataset.entryKey = key;
      body.append(button);
    }
    if (!body.childElementCount) body.append(element("p", "place-poi-search__description", "Keine weiteren Angaben vorhanden."));
    details.append(summary, body);
    item.append(details);
    return item;
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  }

  window.AleriaPlacePoiSearch = Object.freeze({ create });
})();
