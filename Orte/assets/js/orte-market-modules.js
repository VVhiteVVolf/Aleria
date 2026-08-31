(function () {
  "use strict";

  const MAX_SLOTS = 4;
  const STORE_SCHEMA_VERSION = 1;
  const MODULE_EXPORT_TYPE = "aleria-orte-market-module";
  const PACKAGE_EXPORT_TYPE = "aleria-orte-market-module-package";
  const DATA_WAIT_LIMIT = 80;
  const DATA_WAIT_DELAY = 50;

  const root = document.querySelector("[data-orte-static-template]");
  const host = document.querySelector("[data-orte-market-modules]");
  if (!root || !host) return;

  const pageId = getPageId();
  const storageKey = `aleria:orte:market-modules:v${STORE_SCHEMA_VERSION}:${pageId}`;
  const state = {
    modules: [],
    activeSlotId: "",
    saveTimer: 0,
    remoteUnsubscribe: null,
    remoteLoaded: false,
    persistenceMode: ""
  };

  const originalRenderPage = window.renderPage;
  const originalCloseModal = window.closeModal;
  const originalExportCurrentModule = window.exportCurrentModule;
  const originalOpenModuleEditorForCurrent = window.openModuleEditorForCurrent;

  installGlobalInlineBridge();
  installModalAdapters();
  installEditModeObserver();
  waitForData(0);
  document.addEventListener("click", handleClick);
  document.addEventListener("change", handleImportChange);

  function waitForData(attempt) {
    if (window.ORT_DATA || attempt >= DATA_WAIT_LIMIT) {
      init();
      return;
    }
    window.setTimeout(() => waitForData(attempt + 1), DATA_WAIT_DELAY);
  }

  function init() {
    state.modules = normalizeModules(loadLocalPayload()?.modules || window.ORT_DATA?.marketModules || []);
    renderSlots();
    connectRemote();
  }

  function installEditModeObserver() {
    let lastEditMode = isDirectEditMode();
    const observer = new MutationObserver(() => {
      const nextEditMode = isDirectEditMode();
      if (nextEditMode === lastEditMode) return;
      lastEditMode = nextEditMode;
      renderSlots();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }

  function isDirectEditMode() {
    return document.body.classList.contains("orte-inline-editing");
  }

  function isEditOnlyAction(action) {
    return [
      "create-goods",
      "create-trade",
      "edit",
      "remove",
      "export",
      "export-all",
      "trigger-import",
      "publish"
    ].includes(action);
  }

  function installModalAdapters() {
    window.renderPage = function renderPageAdapter(pageIndex, direction) {
      if (isMarketEditing()) {
        renderMarketEditorPage(pageIndex, direction);
        return;
      }
      if (window.currentEntry?.orteMarketModule) {
        renderMarketPreviewPage(pageIndex, direction);
        return;
      }
      if (typeof originalRenderPage === "function") originalRenderPage(pageIndex, direction);
    };

    window.closeModal = function closeModalAdapter(...args) {
      if (isMarketModalActive()) {
        clearMarketModalState();
      }
      if (typeof originalCloseModal === "function") return originalCloseModal.apply(this, args);
      document.getElementById("modal-overlay")?.classList.remove("active");
      document.body.style.overflow = "";
      return undefined;
    };

    window.exportCurrentModule = function exportCurrentModuleAdapter(...args) {
      if (isMarketEditing() || window.currentEntry?.orteMarketModule) {
        exportEntry(window.currentEntry || window._inlineModuleEdit?.draft);
        return;
      }
      if (typeof originalExportCurrentModule === "function") return originalExportCurrentModule.apply(this, args);
      return undefined;
    };

    window.openModuleEditorForCurrent = function openModuleEditorForCurrentAdapter(...args) {
      if (window.currentEntry?.orteMarketModule) {
        const slot = state.modules.find((item) => item.id === window.currentEntry.id);
        if (slot) openEditor(slot.id);
        return;
      }
      if (typeof originalOpenModuleEditorForCurrent === "function") return originalOpenModuleEditorForCurrent.apply(this, args);
      return undefined;
    };
  }

  function installGlobalInlineBridge() {
    window.getInlineDraftPage = function getInlineDraftPage(pageIndex = null) {
      const source = window._inlineEditorEventSource;
      const resolved = pageIndex == null && source
        ? window.getInlineEditorPageIndex(source)
        : (pageIndex == null ? window.currentPage : pageIndex);
      return window._inlineModuleEdit?.draft?.pages?.[resolved] || null;
    };

    window.getInlineEditorPageIndex = function getInlineEditorPageIndex(source) {
      const index = Number(source?.closest?.("[data-inline-page-index]")?.dataset.inlinePageIndex);
      return Number.isInteger(index) && index >= 0 ? index : window.currentPage || 0;
    };

    window.getInlineDraftPageForSource = function getInlineDraftPageForSource(source) {
      return window.getInlineDraftPage(window.getInlineEditorPageIndex(source));
    };

    window.scheduleInlineModuleLivePreviewRefresh = function scheduleInlineModuleLivePreviewRefresh() {
      if (!isMarketEditing()) return;
      window.clearTimeout(window.__orteMarketPreviewTimer);
      window.__orteMarketPreviewTimer = window.setTimeout(refreshMarketPreview, 0);
    };

    window.syncInlineEntryField = function syncInlineEntryField(input) {
      if (!isMarketEditing()) return;
      const field = input.dataset.entryField;
      if (!field) return;
      window._inlineModuleEdit.draft[field] = input.type === "checkbox" ? !!input.checked : String(input.value || "").trim();
    };

    window.rerenderAfterInlineMetaChange = function rerenderAfterInlineMetaChange(input) {
      window.syncInlineEntryField(input);
      window.renderPage(window.currentPage || 0, 0);
    };

    window.syncInlinePageField = function syncInlinePageField(input) {
      const page = window.getInlineDraftPageForSource(input);
      if (!page) return;
      const field = input.dataset.pageField;
      if (!field) return;
      page[field] = input.type === "checkbox" ? !!input.checked : String(input.value || "").trim();
    };

    window.rerenderAfterInlinePageChange = function rerenderAfterInlinePageChange(input) {
      window.syncInlinePageField(input);
      window.renderPage(window.currentPage || 0, 0);
    };

    window.syncInlineModuleSizeField = function syncInlineModuleSizeField(input) {
      if (!isMarketEditing()) return;
      const field = input.dataset.entryField;
      if (field !== "moduleWidth" && field !== "moduleHeight") return;
      const value = clampNumber(input.value, 60, 100, 100);
      window._inlineModuleEdit.draft[field] = value;
      input.value = value;
      const label = input.closest(".inline-edit-field")?.querySelector(".inline-size-value");
      if (label) label.textContent = `${value}%`;
    };

    window.buildInlineSectionPicker = function buildInlineSectionPicker() {
      return `<input type="hidden" data-inline-action="set-module-section" value="orte-angebot">`;
    };

    window.setInlineModuleSection = function setInlineModuleSection() {};

    window.buildInlineModuleSizeControls = function buildInlineModuleSizeControls(entry) {
      const width = clampNumber(entry.moduleWidth, 60, 100, 100);
      const height = clampNumber(entry.moduleHeight, 60, 100, 100);
      return `
        <div class="inline-edit-field">
          <span class="inline-edit-label">Breite <span class="inline-size-value">${width}%</span></span>
          <input class="inline-size-range" type="range" min="60" max="100" step="1" value="${width}" data-inline-action="sync-module-size-field" data-entry-field="moduleWidth">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Hoehe / Laenge <span class="inline-size-value">${height}%</span></span>
          <input class="inline-size-range" type="range" min="60" max="100" step="1" value="${height}" data-inline-action="sync-module-size-field" data-entry-field="moduleHeight">
        </div>`;
    };

    window.buildInlineTemplatePicker = function buildInlineTemplatePicker(currentType = "goods") {
      return `
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Vorlage</span>
          <select class="inline-edit-select" data-inline-action="apply-template">
            <option value="goods"${currentType === "goods" ? " selected" : ""}>Warenverzeichnis - Template</option>
            <option value="trade-catalog"${currentType === "trade-catalog" ? " selected" : ""}>Handelsgut & Tiere - Template</option>
          </select>
        </div>`;
    };

    window.applyInlineModuleTemplate = function applyInlineModuleTemplate(selectEl) {
      if (!isMarketEditing()) return;
      const nextType = selectEl?.value === "trade-catalog" ? "trade-catalog" : "goods";
      const current = window._inlineModuleEdit.draft;
      const replacement = createEntry(nextType, state.modules.length, current.id);
      replacement.title = current.title || replacement.title;
      replacement.subtitle = current.subtitle || replacement.subtitle;
      window._inlineModuleEdit.draft = replacement;
      window.currentEntry = replacement;
      window.currentPage = 0;
      window.renderPage(0, 0);
    };

    window.saveInlineModuleEdit = function saveInlineModuleEdit() {
      if (!isMarketEditing()) return;
      const draft = normalizeEntry(window._inlineModuleEdit.draft, state.modules.length);
      const index = state.modules.findIndex((item) => item.id === state.activeSlotId);
      if (index >= 0) state.modules[index] = draft;
      else state.modules.push(draft);
      persist();
      clearMarketModalState();
      window.closeModal();
      renderSlots();
    };

    window.cancelInlineModuleEdit = function cancelInlineModuleEdit() {
      if (!isMarketEditing()) return;
      clearMarketModalState();
      window.closeModal();
    };

    window.addInlinePage = function addInlinePage(type = "goods") {
      if (!isMarketEditing()) return;
      const pages = window._inlineModuleEdit.draft.pages || [];
      const nextIndex = (window.currentPage || 0) + 1;
      pages.splice(nextIndex, 0, createPage(type, nextIndex));
      window._inlineModuleEdit.draft.pages = pages;
      window.currentPage = nextIndex;
      window.renderPage(nextIndex, 0);
    };

    window.removeInlineCurrentPage = function removeInlineCurrentPage() {
      if (!isMarketEditing()) return;
      const pages = window._inlineModuleEdit.draft.pages || [];
      if (pages.length <= 1) return;
      pages.splice(window.currentPage || 0, 1);
      window.currentPage = Math.max(0, Math.min(window.currentPage || 0, pages.length - 1));
      window.renderPage(window.currentPage, 0);
    };

    window.moveInlineCurrentPage = function moveInlineCurrentPage(direction = 0) {
      if (!isMarketEditing()) return;
      const pages = window._inlineModuleEdit.draft.pages || [];
      const from = window.currentPage || 0;
      const to = from + Number(direction || 0);
      if (to < 0 || to >= pages.length) return;
      const [page] = pages.splice(from, 1);
      pages.splice(to, 0, page);
      window.currentPage = to;
      window.renderPage(to, 0);
    };

    window.buildInlineModulePreview = function buildInlineModulePreview(page, entry, pageIndex, total) {
      return buildMarketPage(page, entry, pageIndex, total);
    };
  }

  function handleClick(event) {
    const trigger = event.target?.closest?.("[data-orte-market-action]");
    if (!trigger) return;
    const action = trigger.dataset.orteMarketAction;
    const slotId = trigger.dataset.orteMarketSlot || trigger.closest("[data-orte-market-slot]")?.dataset.orteMarketSlot || "";

    if (isEditOnlyAction(action) && !isDirectEditMode()) {
      event.preventDefault();
      return;
    }

    if (action === "create-goods" || action === "create-trade") {
      event.preventDefault();
      const entry = createEntry(action === "create-trade" ? "trade-catalog" : "goods", state.modules.length);
      openNewEditor(entry).catch(reportEditorOpenError);
      return;
    }

    if (action === "open") {
      event.preventDefault();
      openPreview(slotId);
      return;
    }

    if (action === "edit") {
      event.preventDefault();
      openEditor(slotId).catch(reportEditorOpenError);
      return;
    }

    if (action === "remove") {
      event.preventDefault();
      removeSlot(slotId);
      return;
    }

    if (action === "export") {
      event.preventDefault();
      const entry = state.modules.find((item) => item.id === slotId);
      if (entry) exportEntry(entry);
      return;
    }

    if (action === "export-all") {
      event.preventDefault();
      exportPackage();
      return;
    }

    if (action === "trigger-import") {
      event.preventDefault();
      getImportInput(trigger.dataset.orteMarketImportSlot || "").click();
      return;
    }

    if (action === "publish") {
      event.preventDefault();
      publishMarket();
      return;
    }
  }

  function handleImportChange(event) {
    const input = event.target;
    if (!input?.matches?.("[data-orte-market-import]")) return;
    const file = input.files?.[0];
    const slotId = input.dataset.orteMarketImportSlot || "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importPayload(String(reader.result || ""), slotId);
      } catch (error) {
        alert(error.message || "Import fehlgeschlagen.");
      } finally {
        input.value = "";
      }
    };
    reader.onerror = () => {
      input.value = "";
      alert("Datei konnte nicht gelesen werden.");
    };
    reader.readAsText(file, "utf-8");
  }

  function renderSlots() {
    const directEditMode = isDirectEditMode();
    const slots = Array.from({ length: Math.max(MAX_SLOTS, state.modules.length) }, (_, index) => state.modules[index] || null);
    host.innerHTML = `
      <div class="orte-market-module-head${directEditMode ? " is-editing" : ""}">
        <div>
          <strong>Warenverzeichnis / Handelsgut / Tiere</strong>
          <span>${directEditMode
            ? "Bis zu vier Modulplaetze direkt unter Angebot & Leistungen. Jeder Platz ist separat bearbeitbar, exportierbar und importierbar."
            : "Verknuepfte Waren- und Handelsgutmodule dieses Ortes."}</span>
        </div>
        ${directEditMode ? `<div class="orte-market-module-actions">
          <button type="button" data-orte-market-action="create-goods">+ Warenverzeichnis</button>
          <button type="button" data-orte-market-action="create-trade">+ Handelsgut & Tiere</button>
          <button type="button" data-orte-market-action="export-all" ${state.modules.length ? "" : "disabled"}>Alle exportieren</button>
          <button type="button" data-orte-market-action="trigger-import">Importieren</button>
          <button type="button" data-orte-market-action="publish" data-orte-market-publish ${state.persistenceMode === "draft-publish" ? "" : "hidden"}>Online speichern</button>
        </div>` : ""}
      </div>
      <div class="orte-market-slot-grid">
        ${slots.map((entry, index) => entry ? renderFilledSlot(entry, index, directEditMode) : renderEmptySlot(index, directEditMode)).join("")}
      </div>
      ${directEditMode ? `<div class="orte-market-slot-status">${state.remoteLoaded ? "Online-Stand geladen." : "Lokaler Stand bereit."}</div>` : ""}`;
  }

  function renderFilledSlot(entry, index, directEditMode) {
    return `
      <article class="orte-market-slot-card" data-orte-market-slot="${escapeHtml(entry.id)}">
        <header class="orte-market-slot-top">
          <div>
            <strong>${escapeHtml(entry.title || `Modul ${index + 1}`)}</strong>
            <span>${escapeHtml(entry.subtitle || "")}</span>
          </div>
          <span class="orte-market-slot-type">${getEntryTypeLabel(entry)}</span>
        </header>
        <div class="orte-market-slot-body">
          <div class="orte-market-slot-preview">${buildSlotSummary(entry)}</div>
          <div class="orte-market-slot-actions">
            <button type="button" data-orte-market-action="open">Oeffnen</button>
            ${directEditMode ? `
            <button type="button" data-orte-market-action="edit">Bearbeiten</button>
            <button type="button" data-orte-market-action="export">Export</button>
            <button type="button" data-orte-market-action="trigger-import" data-orte-market-import-slot="${escapeHtml(entry.id)}">Import</button>
            <button type="button" data-orte-market-action="remove">Entfernen</button>` : ""}
          </div>
        </div>
      </article>`;
  }

  function renderEmptySlot(index, directEditMode) {
    return `
      <article class="orte-market-slot-card is-empty">
        <header class="orte-market-slot-top">
          <div>
            <strong>Platzhalter ${index + 1}</strong>
            <span>Noch kein Modul angelegt.</span>
          </div>
          <span class="orte-market-slot-type">Leer</span>
        </header>
        <div class="orte-market-slot-body">
          ${directEditMode ? `<div class="orte-market-slot-create">
            <button type="button" data-orte-market-action="create-goods">+ Warenverzeichnis</button>
            <button type="button" data-orte-market-action="create-trade">+ Handelsgut & Tiere</button>
            <button type="button" data-orte-market-action="trigger-import">Import</button>
          </div>` : `<div class="orte-market-slot-passive">Dieser Modulplatz ist noch nicht belegt.</div>`}
        </div>
      </article>`;
  }

  async function openPreview(slotId) {
    const entry = state.modules.find((item) => item.id === slotId);
    if (!entry) return;
    await ensureRuntime();
    window.currentEntry = { ...deepClone(entry), orteMarketModule: true };
    window.currentPage = 0;
    const overlay = document.getElementById("modal-overlay");
    overlay?.classList.add("orte-market-modal", "active");
    overlay?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.renderPage(0, 0);
  }

  async function openEditor(slotId) {
    const entry = state.modules.find((item) => item.id === slotId);
    if (!entry) return;
    openEditorEntry(entry, slotId);
  }

  async function openNewEditor(entry) {
    openEditorEntry(entry, "");
  }

  function reportEditorOpenError(error) {
    console.error("Orte-Warenmodul konnte nicht geoeffnet werden.", error);
    alert("Das Waren-/Handelsgutmodul konnte nicht geoeffnet werden. Details stehen in der Browser-Konsole.");
  }

  async function openEditorEntry(entry, existingSlotId) {
    await ensureRuntime();
    state.activeSlotId = existingSlotId || entry.id;
    window._inlineModuleEdit = {
      active: true,
      mode: "edit",
      sourceKind: "orte-market",
      entryId: entry.id,
      orteMarketSlot: true,
      draft: deepClone(entry)
    };
    window.currentEntry = window._inlineModuleEdit.draft;
    window.currentPage = 0;
    const overlay = document.getElementById("modal-overlay");
    overlay?.classList.add("orte-market-modal", "active");
    overlay?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.renderPage(0, 0);
  }

  function renderMarketEditorPage(pageIndex) {
    const entry = window._inlineModuleEdit?.draft;
    const pages = entry?.pages || [];
    const safePageIndex = Math.max(0, Math.min(Number(pageIndex) || 0, pages.length - 1));
    window.currentPage = safePageIndex;
    const page = pages[safePageIndex];
    const body = document.getElementById("modal-body");
    if (!body || !page) return;
    const type = getPageType(page);
    const editor = typeof buildInlineComplexEditor === "function"
      ? buildInlineComplexEditor(entry, page, type)
      : `<p>Editor konnte nicht geladen werden.</p>`;
    const preview = buildMarketPage(page, entry, safePageIndex, pages.length);
    body.innerHTML = `
      ${buildModalPageHeader(entry, safePageIndex, pages.length, true)}
      <div class="orte-market-editor">
        <section class="orte-market-editor-pane inline-module-edit-pane" data-inline-page-index="${safePageIndex}">
          ${editor}
        </section>
        <section class="orte-market-preview-stage inline-module-preview-stage">
          <div class="orte-market-preview-frame inline-module-preview-frame">${preview}</div>
        </section>
      </div>`;
    if (typeof hydrateModuleRichEditors === "function") hydrateModuleRichEditors(body);
  }

  function renderMarketPreviewPage(pageIndex) {
    const entry = window.currentEntry;
    const pages = entry?.pages || [];
    const safePageIndex = Math.max(0, Math.min(Number(pageIndex) || 0, pages.length - 1));
    window.currentPage = safePageIndex;
    const page = pages[safePageIndex];
    const body = document.getElementById("modal-body");
    if (!body || !page) return;
    body.innerHTML = `
      ${buildModalPageHeader(entry, safePageIndex, pages.length, false)}
      <div class="orte-market-preview-stage">
        <div class="orte-market-preview-frame">${buildMarketPage(page, entry, safePageIndex, pages.length)}</div>
      </div>`;
  }

  function buildModalPageHeader(entry, pageIndex, total, editing) {
    const tabs = (entry.pages || []).map((page, index) => `
      <button class="modal-page-tab${index === pageIndex ? " active" : ""}" type="button" data-modal-action="jump-page" data-page-index="${index}">
        ${escapeHtml(page.pageTitle || `${index + 1}`)}
      </button>`).join("");
    const directEditMode = isDirectEditMode();
    const editActions = editing ? `
      <select class="modal-page-tool modal-page-add-select" data-modal-action="add-inline-page" title="Seite hinzufuegen">
        <option value="">+ Seite</option>
        <option value="goods">Warenverzeichnis</option>
        <option value="trade-catalog">Handelsgut & Tiere</option>
      </select>
      <button class="modal-page-tool" type="button" data-modal-action="save-inline-edit">Speichern</button>
      <button class="modal-page-tool" type="button" data-modal-action="cancel-inline-edit">Abbrechen</button>
      <button class="modal-page-tool" type="button" data-modal-action="move-inline-page" data-direction="-1" ${pageIndex === 0 ? "disabled" : ""}>Nach links</button>
      <button class="modal-page-tool" type="button" data-modal-action="move-inline-page" data-direction="1" ${pageIndex === total - 1 ? "disabled" : ""}>Nach rechts</button>
      ${total > 1 ? `<button class="modal-page-tool" type="button" data-modal-action="remove-inline-page">Seite loeschen</button>` : ""}`
      : directEditMode ? `<button class="modal-page-tool" type="button" data-orte-market-action="edit" data-orte-market-slot="${escapeHtml(entry.id)}">Bearbeiten</button>` : "";
    const transferActions = editing || directEditMode ? `
            <button class="modal-page-tool" type="button" data-modal-action="export-current-module">Export</button>
            ${editActions}` : "";
    return `
      <div class="modal-page-header">
        <div class="modal-page-top">
          <div class="modal-page-summary">
            <span class="modal-page-title">${escapeHtml(entry.title || "")}</span>
            <span class="modal-page-subtitle">${escapeHtml(entry.subtitle || "")}</span>
          </div>
          <div class="modal-page-nav">
            <button class="modal-page-btn" type="button" data-modal-action="flip-page" data-direction="-1" ${pageIndex === 0 ? "disabled" : ""}>Zurueck</button>
            <span class="modal-page-indicator">Seite ${pageIndex + 1} von ${total}</span>
            <button class="modal-page-btn" type="button" data-modal-action="flip-page" data-direction="1" ${pageIndex === total - 1 ? "disabled" : ""}>Weiter</button>
          </div>
          ${transferActions ? `<div class="modal-page-actions">${transferActions}</div>` : ""}
        </div>
        ${total > 1 || editing ? `<div class="modal-page-tabs">${tabs}</div>` : ""}
      </div>`;
  }

  function refreshMarketPreview() {
    if (!isMarketEditing()) return;
    const frame = document.querySelector(".inline-module-preview-frame");
    const entry = window._inlineModuleEdit.draft;
    const page = entry.pages?.[window.currentPage || 0];
    if (!frame || !page) return;
    frame.innerHTML = buildMarketPage(page, entry, window.currentPage || 0, entry.pages.length);
  }

  function buildMarketPage(page, entry, pageIndex, total) {
    if (page?.tradeCatalogPage && typeof buildTradeCatalogPage === "function") {
      return buildTradeCatalogPage(page, entry, pageIndex, total);
    }
    if (page?.goodsTablePage && typeof buildGoodsTablePage === "function") {
      return buildGoodsTablePage(page, entry, pageIndex, total);
    }
    return `<section class="goods-page"><article class="goods-sheet"><p>Dieses Modul hat keinen gueltigen Waren- oder Handelsguttyp.</p></article></section>`;
  }

  function createEntry(type, index = 0, forcedId = "") {
    const safeType = type === "trade-catalog" ? "trade-catalog" : "goods";
    const label = safeType === "trade-catalog" ? "Handelsgut & Tiere" : "Warenverzeichnis";
    const id = forcedId || `${pageId}-${safeType}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    return normalizeEntry({
      id,
      title: label,
      subtitle: window.ORT_DATA?.name || window.ORTE_CONFIG?.registryEntry?.name || "Ort",
      category: "Angebot & Leistungen",
      type: label,
      stamp: "ORTE - ANGEBOT",
      moduleWidth: 100,
      moduleHeight: 100,
      pages: [createPage(safeType, index)]
    }, index);
  }

  function createPage(type, index = 0) {
    const safeType = type === "trade-catalog" ? "trade-catalog" : "goods";
    if (safeType === "trade-catalog") {
      return {
        pageTitle: `${index + 1}. Handelsgut & Tiere`,
        tradeCatalogPage: true,
        tradeCatalog: {
          title: "Handelsgut & Tiere",
          subtitle: "Auswahl besonderer Tiere und Waren",
          categories: [
            { id: "tiere", label: "Tiere" },
            { id: "waren", label: "Waren" },
            { id: "spezialwaren", label: "Spezialwaren" }
          ],
          items: []
        },
        stats: [],
        commentSequence: []
      };
    }
    return {
      pageTitle: `${index + 1}. Warenverzeichnis`,
      goodsTablePage: true,
      goodsTable: {
        title: "Warenverzeichnis",
        subtitle: "Waren, Dienste & Angebote",
        location: window.ORT_DATA?.name || "",
        categories: [
          { id: "waren", label: "Waren" },
          { id: "dienste", label: "Dienste" },
          { id: "sonstiges", label: "Sonstiges" }
        ],
        goods: []
      },
      stats: [],
      commentSequence: []
    };
  }

  function normalizeModules(items) {
    return (Array.isArray(items) ? items : [])
      .map((item, index) => normalizeEntry(item, index))
      .filter(Boolean);
  }

  function normalizeEntry(entry, index = 0) {
    const source = entry && typeof entry === "object" ? entry : {};
    const id = normalizeId(source.id || `market-module-${index + 1}`);
    const pages = Array.isArray(source.pages) && source.pages.length ? source.pages : [createPage("goods", index)];
    return {
      ...source,
      id,
      title: String(source.title || getEntryTypeLabel(source) || `Modul ${index + 1}`).trim(),
      subtitle: String(source.subtitle || window.ORT_DATA?.name || "").trim(),
      category: String(source.category || "Angebot & Leistungen").trim(),
      type: String(source.type || getEntryTypeLabel(source)).trim(),
      moduleWidth: clampNumber(source.moduleWidth, 60, 100, 100),
      moduleHeight: clampNumber(source.moduleHeight, 60, 100, 100),
      pages,
      orteMarketModule: true
    };
  }

  function getPageType(page) {
    if (page?.tradeCatalogPage) return "trade-catalog";
    return "goods";
  }

  function getEntryTypeLabel(entry) {
    const first = entry?.pages?.[0];
    return first?.tradeCatalogPage ? "Handelsgut" : "Waren";
  }

  function buildSlotSummary(entry) {
    const pages = entry.pages || [];
    const goodsPages = pages.filter((page) => page.goodsTablePage).length;
    const tradePages = pages.filter((page) => page.tradeCatalogPage).length;
    const details = [];
    if (goodsPages) details.push(`${goodsPages} Warenregister`);
    if (tradePages) details.push(`${tradePages} Handelsgut/Tier-Register`);
    return `<b>${escapeHtml(details.join(", ") || "Leeres Modul")}</b><br>${escapeHtml(pages[0]?.pageTitle || "Noch keine Seite")}`;
  }

  function removeSlot(slotId) {
    const entry = state.modules.find((item) => item.id === slotId);
    if (!entry) return;
    if (!confirm(`Modul "${entry.title}" entfernen?`)) return;
    state.modules = state.modules.filter((item) => item.id !== slotId);
    persist();
    renderSlots();
  }

  function importPayload(raw, targetSlotId = "") {
    const parsed = JSON.parse(raw || "{}");
    if (parsed.type === PACKAGE_EXPORT_TYPE) {
      const imported = normalizeModules(parsed.modules || []);
      if (!imported.length) throw new Error("Dieses Paket enthaelt keine Module.");
      state.modules = imported;
      persist();
      renderSlots();
      return;
    }
    const entry = normalizeEntry(parsed.type === MODULE_EXPORT_TYPE ? parsed.entry : parsed, state.modules.length);
    if (!entry.pages?.some((page) => page.goodsTablePage || page.tradeCatalogPage)) {
      throw new Error("Diese Datei ist kein Warenverzeichnis- oder Handelsgut-Modul.");
    }
    const index = state.modules.findIndex((item) => item.id === targetSlotId);
    if (index >= 0) state.modules[index] = { ...entry, id: targetSlotId };
    else state.modules.push(entry);
    persist();
    renderSlots();
  }

  function exportEntry(entry) {
    if (!entry) return;
    downloadJson({
      type: MODULE_EXPORT_TYPE,
      version: STORE_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      ortId: pageId,
      entry
    }, `${pageId}-${entry.id}.json`);
  }

  function exportPackage() {
    downloadJson({
      type: PACKAGE_EXPORT_TYPE,
      version: STORE_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      ortId: pageId,
      modules: state.modules
    }, `${pageId}-waren-handelsmodule.json`);
  }

  function downloadJson(payload, filename) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function getImportInput(slotId = "") {
    const id = slotId ? `orte-market-import-${slotId}` : "orte-market-import";
    let input = document.getElementById(id);
    if (input) return input;
    input = document.createElement("input");
    input.id = id;
    input.type = "file";
    input.accept = ".json,application/json";
    input.hidden = true;
    input.dataset.orteMarketImport = "true";
    input.dataset.orteMarketImportSlot = slotId;
    document.body.appendChild(input);
    return input;
  }

  function persist() {
    const payload = {
      schemaVersion: STORE_SCHEMA_VERSION,
      savedAtClient: Date.now(),
      modules: state.modules
    };
    localStorage.setItem(storageKey, JSON.stringify(payload));
    window.clearTimeout(state.saveTimer);
    state.saveTimer = window.setTimeout(async () => {
      if (window.OrteMarketFirebase?.save) {
        await window.OrteMarketFirebase.save(pageId, payload);
      }
    }, 350);
  }

  function loadLocalPayload() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "null");
    } catch {
      return null;
    }
  }

  async function connectRemote() {
    const store = await waitForMarketStore();
    if (!store?.subscribe) return;
    state.persistenceMode = store.persistenceMode || "";
    const publishButton = host.querySelector("[data-orte-market-publish]");
    if (publishButton) publishButton.hidden = store.persistenceMode !== "draft-publish";
    state.remoteUnsubscribe = store.subscribe(pageId, (payload) => {
      if (!payload?.modules) return;
      const localSavedAt = Number(loadLocalPayload()?.savedAtClient) || 0;
      const remoteSavedAt = Number(payload.savedAtClient) || 0;
      if (localSavedAt > remoteSavedAt) return;
      state.modules = normalizeModules(payload.modules);
      state.remoteLoaded = true;
      localStorage.setItem(storageKey, JSON.stringify(payload));
      renderSlots();
    });
  }

  async function publishMarket() {
    const store = await waitForMarketStore(900);
    if (!store?.publish) return;
    const status = host.querySelector(".orte-market-slot-status");
    if (status) status.textContent = "Marktmodule werden online gespeichert.";
    try {
      const payload = { schemaVersion: STORE_SCHEMA_VERSION, savedAtClient: Date.now(), modules: state.modules };
      const result = await store.publish(pageId, payload);
      if (status) status.textContent = `Marktmodule online gespeichert · Revision ${result.revision}.`;
    } catch (error) {
      if (status) status.textContent = error?.message || "Marktmodule konnten nicht online gespeichert werden.";
    }
  }

  function waitForMarketStore(timeout = 4500) {
    if (window.OrteMarketFirebase) return Promise.resolve(window.OrteMarketFirebase);
    return new Promise((resolve) => {
      const timer = window.setTimeout(() => resolve(window.OrteMarketFirebase || null), timeout);
      window.addEventListener("orte-market-firebase-ready", () => {
        window.clearTimeout(timer);
        resolve(window.OrteMarketFirebase || null);
      }, { once: true });
    });
  }

  async function ensureRuntime() {
    if (window.AleriaOrteSceneRuntime?.ensureRuntime) {
      await window.AleriaOrteSceneRuntime.ensureRuntime();
    }
    installMarketTransferPanel();
  }

  function installMarketTransferPanel() {
    window.buildInlineModuleTemplateTransferPanel = function buildInlineModuleTemplateTransferPanel(page, type = "goods") {
      const rows = [
        ["goods", "Warenregister"],
        ["trade-catalog", "Handelsgut-Register"]
      ].map(([kind, label]) => {
        const canExport = kind === "goods"
          ? !!(type === "goods" || page?.goodsTablePage || page?.goodsTable)
          : !!(type === "trade-catalog" || page?.tradeCatalogPage || page?.tradeCatalog);
        return `
          <div class="module-template-transfer-row">
            <div>
              <strong>${escapeHtml(label)}</strong>
              <span>Diese Registerseite exportieren oder hier importieren.</span>
            </div>
            <div class="module-template-transfer-actions">
              <button class="module-editor-mini-btn" type="button" data-inline-action="export-template-transfer" data-template-transfer-kind="${kind}"${canExport ? "" : " disabled"}>${escapeHtml(label)} exportieren</button>
              <button class="module-editor-mini-btn" type="button" data-inline-action="open-template-transfer-import" data-template-transfer-kind="${kind}">${escapeHtml(label)} importieren</button>
            </div>
          </div>`;
      }).join("");
      return `
        <section class="module-template-transfer-panel inline-template-transfer-panel" aria-label="Template-Transfer">
          <div class="inline-edit-kicker">Template-Transfer</div>
          <div class="module-editor-help">Import ersetzt nur diese Seite. Andere Seiten und der restliche Ort bleiben unveraendert.</div>
          <div class="module-template-transfer-list">${rows}</div>
          <div class="module-editor-help inline-template-transfer-status" aria-live="polite"></div>
        </section>`;
    };
  }

  function isMarketEditing() {
    return !!window._inlineModuleEdit?.orteMarketSlot;
  }

  function isMarketModalActive() {
    return isMarketEditing() || !!window.currentEntry?.orteMarketModule;
  }

  function clearMarketModalState() {
    if (window._inlineModuleEdit?.orteMarketSlot) window._inlineModuleEdit = null;
    if (window.currentEntry?.orteMarketModule) window.currentEntry = null;
    window.currentPage = 0;
    state.activeSlotId = "";
    document.getElementById("modal-overlay")?.classList.remove("orte-market-modal");
  }

  function getPageId() {
    return String(window.AleriaOrteScenes?.ortId || window.ORTE_CONFIG?.docId || root.dataset.orteId || "zunfts-vorlage")
      .trim()
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "zunfts-vorlage";
  }

  function normalizeId(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `market-${Date.now().toString(36)}`;
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(min, Math.min(max, Math.round(number)));
  }

  function deepClone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    if (typeof window.escapeHtml === "function") return window.escapeHtml(value);
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }
})();
