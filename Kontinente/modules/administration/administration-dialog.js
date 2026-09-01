(function () {
  "use strict";

  const content = window.ALERIA_ADMINISTRATION_CONTENT;
  if (!content?.areas?.length) return;

  const areaById = new Map(content.areas.map((area) => [area.id, area]));
  const areaByName = new Map(content.areas.map((area) => [normalize(area.name), area]));
  const sourceCache = new Map();
  let dialog;
  let dialogTitle;
  let dialogBody;
  let lastTrigger;
  let activeAreaId;

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLocaleLowerCase("de-DE")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function createDialog() {
    const element = document.createElement("dialog");
    element.className = "administration-dialog";
    element.setAttribute("aria-labelledby", "administration-dialog-title");
    element.innerHTML = `
      <div class="administration-dialog-shell">
        <header class="administration-dialog-header">
          <div>
            <span class="administration-dialog-kicker">Verwaltungsstruktur</span>
            <h2 id="administration-dialog-title"></h2>
          </div>
          <button class="administration-dialog-close" type="button" data-action="close-administration" aria-label="Fenster schließen">×</button>
        </header>
        <div class="administration-dialog-body" data-role="administration-dialog-body"></div>
      </div>`;
    document.body.append(element);
    dialogTitle = element.querySelector("#administration-dialog-title");
    dialogBody = element.querySelector('[data-role="administration-dialog-body"]');
    element.addEventListener("click", (event) => {
      if (event.target === element) closeDialog();
    });
    element.addEventListener("close", () => lastTrigger?.focus());
    return element;
  }

  function closeDialog() {
    if (dialog?.open) dialog.close();
  }

  async function openDialog(areaId, trigger) {
    const area = areaById.get(areaId);
    if (!area) return;
    if (trigger) lastTrigger = trigger;
    activeAreaId = area.id;
    dialogTitle.textContent = area.name;
    dialogBody.innerHTML = '<p class="administration-dialog-status">Inhalte werden geladen …</p>';
    if (!dialog.open) dialog.showModal();

    try {
      const rendered = await loadArea(area);
      rendered.append(createAreaNavigation(area));
      dialogBody.replaceChildren(rendered);
    } catch (error) {
      console.error("Verwaltungsbereich konnte nicht geladen werden.", error);
      dialogBody.innerHTML = '<p class="administration-dialog-status is-error">Die Inhalte konnten nicht geladen werden.</p>';
    }
  }

  async function loadArea(area) {
    if (!sourceCache.has(area.id)) {
      sourceCache.set(area.id, fetch(area.source).then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${area.source}`);
        return response.text();
      }));
    }
    return renderLegacyContent(await sourceCache.get(area.id));
  }

  function renderLegacyContent(source) {
    const parsed = new DOMParser().parseFromString(source, "text/html");
    const legacyRoot = parsed.querySelector(".user_css") || parsed.body;
    const outerTable = Array.from(legacyRoot.children).find((element) => element.tagName === "TABLE");
    const result = document.createDocumentFragment();

    if (!outerTable?.tBodies?.[0]) {
      const fallback = document.createElement("section");
      fallback.className = "administration-dialog-section";
      fallback.append(sanitize(legacyRoot.cloneNode(true)));
      result.append(fallback);
      return result;
    }

    const rows = Array.from(outerTable.tBodies[0].rows);
    const metadata = extractMetadata(rows[0]);
    if (metadata) result.append(metadata);

    rows.slice(1).forEach((row) => {
      Array.from(row.cells)
        .filter((cell) => cell.colSpan >= 3)
        .forEach((cell) => {
          const section = document.createElement("section");
          section.className = "administration-dialog-section";
          const clone = sanitize(cell.cloneNode(true));
          removeLegacyNavigation(clone);
          while (clone.firstChild) section.append(clone.firstChild);
          if (hasMeaningfulContent(section)) result.append(section);
        });
    });
    return result;
  }

  function removeLegacyNavigation(root) {
    root.querySelectorAll("table").forEach((table) => {
      const text = table.textContent.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
      if (text.includes("Verwaltungsapparat") && text.includes("Hauptseite")) {
        table.closest(".administration-dialog-table-scroll")?.remove();
        if (table.isConnected) table.remove();
      }
    });
  }

  function createAreaNavigation(area) {
    const currentIndex = content.areas.findIndex((entry) => entry.id === area.id);
    const previous = content.areas[(currentIndex - 1 + content.areas.length) % content.areas.length];
    const next = content.areas[(currentIndex + 1) % content.areas.length];
    const navigation = document.createElement("nav");
    navigation.className = "administration-dialog-navigation";
    navigation.setAttribute("aria-label", "Zwischen Verwaltungsbereichen wechseln");
    navigation.innerHTML = `
      <button type="button" data-action="navigate-administration" data-administration-key="${previous.id}" aria-label="Vorheriger Bereich: ${previous.name}">&lsaquo; Links</button>
      <span aria-hidden="true">|</span>
      <button type="button" data-action="navigate-administration" data-administration-key="${next.id}" aria-label="Nächster Bereich: ${next.name}">Rechts &rsaquo;</button>`;
    return navigation;
  }

  function extractMetadata(firstRow) {
    if (!firstRow) return null;
    const nestedTables = firstRow.querySelectorAll("table");
    const infoTable = nestedTables[nestedTables.length - 1];
    if (!infoTable) return null;
    const list = document.createElement("dl");
    list.className = "administration-dialog-facts";
    Array.from(infoTable.rows).slice(1).forEach((row) => {
      if (row.cells.length < 2) return;
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = row.cells[0].textContent.trim();
      description.textContent = row.cells[1].textContent.trim();
      if (term.textContent || description.textContent) list.append(term, description);
    });
    return list.children.length ? list : null;
  }

  function sanitize(root) {
    root.querySelectorAll("script, style, link, iframe, object, embed, form, input, button, textarea, select").forEach((node) => node.remove());
    root.querySelectorAll("*").forEach((element) => {
      const legacyStyle = element.getAttribute("style") || "";
      Array.from(element.attributes).forEach((attribute) => {
        if (!["href", "src", "alt", "colspan", "rowspan", "open"].includes(attribute.name)) {
          element.removeAttribute(attribute.name);
        }
      });
      if (element.tagName === "A") {
        const href = element.getAttribute("href") || "";
        if (/^javascript:/i.test(href)) element.removeAttribute("href");
        element.target = "_blank";
        element.rel = "noopener noreferrer";
      }
      if (element.tagName === "IMG") {
        const src = element.getAttribute("src") || "";
        if (!/^(https?:|\/)/i.test(src)) element.removeAttribute("src");
        element.className = getImageKind(legacyStyle);
        element.loading = "lazy";
        element.decoding = "async";
      }
      if (element.tagName === "DETAILS") element.className = "administration-dialog-details";
    });
    root.querySelectorAll("p").forEach((paragraph) => {
      if (!paragraph.textContent.replace(/\u00a0/g, "").trim() && !paragraph.querySelector("img")) paragraph.remove();
    });
    root.querySelectorAll("tr").forEach((row) => {
      if (!row.textContent.replace(/\u00a0/g, "").trim() && !row.querySelector("img")) row.remove();
    });
    root.querySelectorAll("p").forEach((paragraph) => {
      if (/^\s*[1-6]\)\s*\S/.test(paragraph.textContent)) paragraph.className = "administration-dialog-heading";
    });
    root.querySelectorAll("table").forEach(classifyTable);
    return root;
  }

  function getImageKind(style) {
    const width = Number(style.match(/width\s*:\s*(\d+)px/i)?.[1] || 0);
    const height = Number(style.match(/height\s*:\s*(\d+)px/i)?.[1] || 0);
    if (width && height && height / width >= 1.25) return "administration-dialog-portrait";
    if (width && height && width / height >= 1.45) return "administration-dialog-landscape";
    return "administration-dialog-emblem";
  }

  function classifyTable(table) {
    const hasPortraits = Boolean(table.querySelector(".administration-dialog-portrait"));
    const hasImages = Boolean(table.querySelector("img"));
    const headerColumns = table.querySelectorAll("thead th").length;
    table.className = "administration-dialog-table";
    if (headerColumns >= 3 && !hasImages) table.classList.add("is-office-table");
    else if (hasPortraits || (hasImages && table.rows.length >= 4)) {
      table.classList.add("is-hierarchy-table");
      classifyHierarchyRows(table);
    }
    else table.classList.add("is-compact-table");

    const scroller = document.createElement("div");
    scroller.className = "administration-dialog-table-scroll";
    table.before(scroller);
    scroller.append(table);
  }

  function classifyHierarchyRows(table) {
    const rows = Array.from(table.rows);
    rows.forEach((row, index) => {
      const portraits = row.querySelectorAll(".administration-dialog-portrait");
      if (!portraits.length) return;
      row.classList.add("is-portrait-row");
      if (row.cells.length !== 1 || row.cells[0].colSpan < 3) return;
      row.classList.add("is-primary-leader-row");
      rows[index - 1]?.classList.add("is-primary-leader-title-row");
      rows[index + 1]?.classList.add("is-primary-leader-name-row");
    });
  }

  function hasMeaningfulContent(element) {
    return Boolean(element.textContent.replace(/\u00a0/g, "").trim() || element.querySelector("img"));
  }

  function createAdministrationCard(area, imageSrc) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "administration-card";
    button.dataset.action = "open-administration";
    button.dataset.administrationKey = area.id;
    button.setAttribute("aria-haspopup", "dialog");
    if (imageSrc) {
      const image = document.createElement("img");
      image.src = imageSrc;
      image.alt = "";
      image.loading = "lazy";
      button.append(image);
    }
    const label = document.createElement("strong");
    label.textContent = area.name;
    button.append(label);
    const hint = document.createElement("span");
    hint.textContent = "Struktur ansehen";
    button.append(hint);
    return button;
  }

  function enhanceLegacyGrid(table) {
    if (!table || table.dataset.administrationEnhanced === "true") return;
    const images = Array.from(table.querySelectorAll("img")).map((image) => image.getAttribute("src") || "");
    const grid = document.createElement("div");
    grid.className = "administration-grid";
    content.areas.forEach((area, index) => grid.append(createAdministrationCard(area, images[index])));
    const wrapper = table.parentElement?.classList.contains("kingdom-table-scroll")
      ? table.parentElement
      : null;
    (wrapper || table).replaceWith(grid);
  }

  function enhanceRenderedCards() {
    document.querySelectorAll("[data-administration-key]").forEach((element) => {
      const area = areaById.get(element.dataset.administrationKey)
        || areaByName.get(normalize(element.textContent));
      if (!area) return;
      element.dataset.administrationKey = area.id;
      element.dataset.action = "open-administration";
      element.setAttribute("aria-haspopup", "dialog");
    });
  }

  function init() {
    dialog = createDialog();
    enhanceRenderedCards();
    document.addEventListener("aleria:administration-rendered", enhanceRenderedCards);
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest('[data-action="open-administration"]');
      if (trigger) openDialog(trigger.dataset.administrationKey, trigger);
      const navigation = event.target.closest('[data-action="navigate-administration"]');
      if (navigation && navigation.dataset.administrationKey !== activeAreaId) {
        openDialog(navigation.dataset.administrationKey);
      }
      if (event.target.closest('[data-action="close-administration"]')) closeDialog();
    });

    const hasRepositoryContent = Boolean(document.querySelector('script[src*="kontinente-content.js"]'));
    if (!hasRepositoryContent || document.querySelector("[data-repository-content='ready']")) {
      enhanceAdministrationGrids();
      return;
    }

    window.addEventListener("aleria:kontinente:content-ready", enhanceAdministrationGrids, { once: true });
    window.setTimeout(enhanceAdministrationGrids, 3000);
  }

  function enhanceAdministrationGrids() {
    document.querySelectorAll("[data-administration-grid]").forEach(enhanceLegacyGrid);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
