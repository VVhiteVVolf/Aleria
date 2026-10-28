(function () {
  "use strict";

  const content = window.ALERIA_ADMINISTRATION_CONTENT;
  if (!content?.areas?.length) return;

  const areaById = new Map(content.areas.map((area) => [area.id, area]));
  const areaByName = new Map(content.areas.map((area) => [normalize(area.name), area]));
  const sourceCache = new Map();
  const moduleRoot = new URL('./', document.currentScript.src);
  const rendererUrl = new URL('./administration-renderer.mjs?v=20261028', moduleRoot);
  const structuredUrl = new URL('./administration-structured.mjs?v=20261028', moduleRoot);
  let loadRevision = 0;
  let dialog;
  let dialogKicker;
  let dialogTitle;
  let dialogBody;
  let dialogIcon;
  let lastTrigger;
  let activeAreaId;
  let activeScopeId;
  let officeDialogReady;

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
          <button class="administration-dialog-maximize" type="button" data-action="maximize-administration" aria-label="Fenster maximieren" aria-pressed="false">⛶</button>
          <button class="administration-dialog-close" type="button" data-action="close-administration" aria-label="Fenster schließen">×</button>
        </header>
        <nav class="administration-area-tabs" aria-label="Verwaltungsbereich auswählen"></nav>
        <div class="administration-dialog-body" data-role="administration-dialog-body"></div>
      </div>`;
    document.body.append(element);
    dialogKicker = element.querySelector(".administration-dialog-kicker");
    dialogTitle = element.querySelector("#administration-dialog-title");
    dialogIcon = element.querySelector('.administration-dialog-icon');
    dialogBody = element.querySelector('[data-role="administration-dialog-body"]');
    content.areas.forEach(area => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.action = 'navigate-administration';
      button.dataset.administrationKey = area.id;
      button.textContent = area.name;
      element.querySelector('.administration-area-tabs').append(button);
    });
    element.addEventListener('administration:navigate', event => openDialog(event.detail.areaId, null, activeScopeId));
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
    dialog.querySelectorAll('.administration-area-tabs button').forEach(button => {
      const active = button.dataset.administrationKey === areaId;
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
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
    await officeDialogReady;
    const { renderStructuredAdministration } = await import(structuredUrl.href);
    const structured = await renderStructuredAdministration(scopeId, area.id);
    if (structured) return structured;
    const { renderLegacyContent, renderEmptyArea } = await import(rendererUrl.href);
    const source = content.sourceFor?.(scopeId, area.id) || "";
    if (!source) return renderEmptyArea();
    if (!sourceCache.has(source)) {
      const requestUrl = new URL(source, location.origin);
      requestUrl.searchParams.set('v', '20261028');
      sourceCache.set(source, fetch(requestUrl).then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${source}`);
        return response.text();
      }).catch(error => {
        sourceCache.delete(source);
        throw error;
      }));
    }
    return renderLegacyContent(await sourceCache.get(source), area);
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
    grid.dataset.kontinenteGeneratedView = "";
    grid.setAttribute('role', 'group');
    grid.setAttribute('aria-label', 'Verwaltungsbereiche');
    const scopeId = currentScopeId();
    grid.dataset.administrationScope = scopeId;
    content.areas.forEach((area, index) => grid.append(createAdministrationCard(area, images[index], scopeId)));
    const wrapper = table.parentElement?.classList.contains("kingdom-table-scroll")
      ? table.parentElement
      : null;
    // Inline exports address the original tables and images by their order.
    // Keep the source in place even when the loading fallback renders first.
    table.dataset.administrationEnhanced = "true";
    table.hidden = true;
    const source = wrapper || table;
    source.hidden = true;
    source.before(grid);
  }

  function enhanceRenderedCards() {
    const scopeId = currentScopeId();
    document.querySelectorAll(".administration-card[data-administration-key], .herrschaft-administration-card[data-administration-key]").forEach((element) => {
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
    officeDialogReady = import(new URL('./administration-office-dialog.mjs?v=20261028', moduleRoot).href)
      .then(({ mountOfficeDialog }) => mountOfficeDialog(dialog));
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
      const maximize = event.target.closest('[data-action="maximize-administration"]');
      if (maximize) {
        const maximized = dialog.classList.toggle('is-maximized');
        maximize.setAttribute('aria-pressed', String(maximized));
        maximize.setAttribute('aria-label', maximized ? 'Fenster verkleinern' : 'Fenster maximieren');
      }
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
