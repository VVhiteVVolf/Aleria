(function () {
  "use strict";

  const content = window.ALERIA_ADMINISTRATION_CONTENT;
  if (!content?.areas?.length) return;

  const areaById = new Map(content.areas.map((area) => [area.id, area]));
  const areaByName = new Map(content.areas.map((area) => [normalize(area.name), area]));
  const sourceCache = new Map();
  const rendererUrl = new URL('./administration-renderer.mjs?v=administration-dialog-20260911b', document.currentScript.src);
  let loadRevision = 0;
  let dialog;
  let dialogKicker;
  let dialogTitle;
  let dialogBody;
  let dialogIcon;
  let lastTrigger;
  let activeAreaId;
  let activeScopeId;

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
          <img class="administration-dialog-icon" alt="">
          <div>
            <span class="administration-dialog-kicker">Verwaltungsstruktur</span>
            <h2 id="administration-dialog-title" tabindex="-1"></h2>
          </div>
          <button class="administration-dialog-close" type="button" data-action="close-administration" aria-label="Fenster schließen">×</button>
        </header>
        <div class="administration-dialog-body" data-role="administration-dialog-body"></div>
      </div>`;
    document.body.append(element);
    dialogKicker = element.querySelector(".administration-dialog-kicker");
    dialogTitle = element.querySelector("#administration-dialog-title");
    dialogIcon = element.querySelector('.administration-dialog-icon');
    dialogBody = element.querySelector('[data-role="administration-dialog-body"]');
    element.addEventListener("click", (event) => {
      if (event.target === element) closeDialog();
    });
    element.addEventListener("close", () => {
      loadRevision += 1;
      lastTrigger?.focus();
    });
    return element;
  }

  function closeDialog() {
    if (dialog?.open) dialog.close();
  }

  async function openDialog(areaId, trigger, requestedScopeId) {
    const area = areaById.get(areaId);
    if (!area) return;
    if (trigger) lastTrigger = trigger;
    activeAreaId = area.id;
    activeScopeId = normalize(requestedScopeId || trigger?.dataset.administrationScope || currentScopeId());
    const revision = ++loadRevision;
    const scopeId = activeScopeId;
    dialogKicker.textContent = `${currentDomainName()} · Verwaltungsstruktur`;
    dialogTitle.textContent = area.name;
    dialogIcon.src = area.imageSrc;
    dialogBody.innerHTML = '<p class="administration-dialog-status">Inhalte werden geladen …</p>';
    dialogBody.setAttribute('aria-busy', 'true');
    dialogBody.scrollTop = 0;
    if (!dialog.open) dialog.showModal();

    try {
      const rendered = await loadArea(area, scopeId);
      if (revision !== loadRevision || !dialog.open) return;
      rendered.append(createAreaNavigation(area, scopeId));
      dialogBody.replaceChildren(rendered);
      dialogBody.removeAttribute('aria-busy');
      if (!trigger) dialogTitle.focus({ preventScroll: true });
    } catch (error) {
      if (revision !== loadRevision || !dialog.open) return;
      console.error("Verwaltungsbereich konnte nicht geladen werden.", error);
      dialogBody.innerHTML = '<p class="administration-dialog-status is-error">Die Inhalte konnten nicht geladen werden.</p>';
      dialogBody.removeAttribute('aria-busy');
    }
  }

  async function loadArea(area, scopeId) {
    const { renderLegacyContent, renderEmptyArea } = await import(rendererUrl.href);
    const source = content.sourceFor?.(scopeId, area.id) || "";
    if (!source) return renderEmptyArea();
    if (!sourceCache.has(source)) {
      const requestUrl = new URL(source, location.origin);
      requestUrl.searchParams.set('v', 'administration-dialog-20260911b');
      sourceCache.set(source, fetch(requestUrl).then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${source}`);
        return response.text();
      }).catch(error => {
        sourceCache.delete(source);
        throw error;
      }));
    }
    return renderLegacyContent(await sourceCache.get(source));
  }

  function createAreaNavigation(area, scopeId) {
    const currentIndex = content.areas.findIndex((entry) => entry.id === area.id);
    const previous = content.areas[(currentIndex - 1 + content.areas.length) % content.areas.length];
    const next = content.areas[(currentIndex + 1) % content.areas.length];
    const navigation = document.createElement("nav");
    navigation.className = "administration-dialog-navigation";
    navigation.setAttribute("aria-label", "Zwischen Verwaltungsbereichen wechseln");
    navigation.innerHTML = `
      <button type="button" data-action="navigate-administration" data-administration-key="${previous.id}" data-administration-scope="${scopeId}" aria-label="Vorheriger Bereich: ${previous.name}">&lsaquo; ${previous.name}</button>
      <button type="button" data-action="navigate-administration" data-administration-key="${next.id}" data-administration-scope="${scopeId}" aria-label="Nächster Bereich: ${next.name}">${next.name} &rsaquo;</button>`;
    return navigation;
  }

  function createAdministrationCard(area, imageSrc, scopeId) {
    imageSrc = area.imageSrc || imageSrc;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "administration-card";
    button.dataset.action = "open-administration";
    button.dataset.administrationKey = area.id;
    button.dataset.administrationScope = scopeId;
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
    grid.setAttribute('role', 'group');
    grid.setAttribute('aria-label', 'Verwaltungsbereiche');
    const scopeId = currentScopeId();
    grid.dataset.administrationScope = scopeId;
    content.areas.forEach((area, index) => grid.append(createAdministrationCard(area, images[index], scopeId)));
    const wrapper = table.parentElement?.classList.contains("kingdom-table-scroll")
      ? table.parentElement
      : null;
    (wrapper || table).replaceWith(grid);
  }

  function enhanceRenderedCards() {
    const scopeId = currentScopeId();
    document.querySelectorAll("[data-administration-key]").forEach((element) => {
      const area = areaById.get(element.dataset.administrationKey)
        || areaByName.get(normalize(element.textContent));
      if (!area) return;
      element.dataset.administrationKey = area.id;
      if (!element.dataset.administrationScope) element.dataset.administrationScope = scopeId;
      element.dataset.action = "open-administration";
      element.setAttribute("aria-haspopup", "dialog");
      if (area.imageSrc && element.matches('.administration-card, .herrschaft-administration-card')) {
        let image = element.querySelector('img');
        if (!image) {
          image = document.createElement('img');
          image.alt = '';
          image.loading = 'lazy';
          element.prepend(image);
        }
        if (image.getAttribute('src') !== area.imageSrc) image.src = area.imageSrc;
      }
    });
  }

  function currentScopeId() {
    return normalize(
      window.KONTINENTE_DATA?.meta?.id
      || window.KONTINENTE_CONFIG?.docId
      || document.querySelector("[data-kontinent-id]")?.dataset.kontinentId
      || "unbekannte-herrschaft",
    );
  }

  function currentDomainName() {
    return window.KONTINENTE_DATA?.name
      || window.KONTINENTE_CONFIG?.registryEntry?.name
      || "Herrschaft";
  }

  function init() {
    dialog = createDialog();
    enhanceRenderedCards();
    document.addEventListener("aleria:administration-rendered", enhanceRenderedCards);
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest('[data-action="open-administration"]');
      if (trigger) openDialog(trigger.dataset.administrationKey, trigger, trigger.dataset.administrationScope);
      const navigation = event.target.closest('[data-action="navigate-administration"]');
      if (navigation && navigation.dataset.administrationKey !== activeAreaId) {
        openDialog(navigation.dataset.administrationKey, null, navigation.dataset.administrationScope || activeScopeId);
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
