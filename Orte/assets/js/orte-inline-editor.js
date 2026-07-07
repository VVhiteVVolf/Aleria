(function () {
  "use strict";

  const root = document.querySelector("[data-orte-static-template]");
  if (!root) return;

  const pageId = getPageId();
  const CONTENT_SCHEMA_VERSION = 2;
  const PORTRAIT_PLACEHOLDER_SRC = "https://i.imgur.com/Bpo3Pzn.png";
  const TABLE_EDITOR_VERSION = "table-editor-20260706b";
  const inlineEditorScript = document.currentScript;
  const inlineStorageConfig = getInlineStorageConfig();
  const storageNamespace = inlineStorageConfig.namespace;
  const storageKey = getInlineContentStorageKey(storageNamespace, CONTENT_SCHEMA_VERSION);
  const legacyStorageKeys = getLegacyInlineContentStorageKeys();
  const statusPositionKey = `aleria:${storageNamespace}:inline-status-position:${pageId}`;
  const resetMarkerKey = `aleria:${storageNamespace}:inline-reset:${pageId}`;
  const state = { texts: {}, images: {}, ratings: {}, tables: {}, hiddenSections: {}, meta: normalizeDocumentMeta(window.ORT_DATA?.meta || {}) };
  const textItems = [];
  const imageItems = [];
  const ratingItems = [];
  const tableItems = [];
  const sectionItems = [];
  const templateImageFallbacks = new Map();
  const expandedTableControlKeys = new Set();
  const history = {
    undo: [],
    redo: [],
    lastSignature: "",
    applying: false,
    maxEntries: 60
  };

  let editMode = false;
  let saveTimer = 0;
  let dirty = false;
  let activeImageKey = "";
  let activeEditable = null;
  let savedSelection = null;
  let pendingLocalPayload = null;
  let pendingRemotePayload = null;
  let statusPanelOpen = false;
  let statusSuppressClick = false;
  let statusDrag = null;
  let rowControlPositionTimer = 0;
  let tableEditor = null;
  const inlineActions = new Set([
    "toggle-orte-inline-edit",
    "toggle-orte-final-status",
    "save-orte-inline-edit",
    "hard-reset-orte-template",
    "toggle-orte-status-panel",
    "use-orte-local-version",
    "use-orte-online-version",
    "use-orte-latest-version",
    "export-orte-inline-data",
    "trigger-orte-inline-import",
    "undo-orte-inline-change",
    "redo-orte-inline-change",
    "close-orte-image-panel",
    "clear-orte-image",
    "add-orte-table-row",
    "add-orte-table-heading-row",
    "insert-orte-table-heading-row-after",
    "insert-orte-table-primary-heading-row-after",
    "insert-orte-table-secondary-heading-row-after",
    "pick-orte-table-heading-color",
    "set-orte-portrait-column-count",
    "insert-orte-table-empty-row-after",
    "insert-orte-table-portrait-row-after",
    "insert-orte-table-row-before",
    "insert-orte-table-row-after",
    "move-orte-table-row-up",
    "move-orte-table-row-down",
    "toggle-orte-table-row-controls",
    "insert-orte-table-block-after",
    "remove-orte-table-block",
    "remove-orte-table-row",
    "format-orte-text",
    "clear-orte-text-format",
    "show-all-orte-sections",
    "apply-orte-tooltip"
  ]);
  const ignoredSurfaceSelector = [
    "#modal-overlay",
    "#comment-form-overlay",
    "#showcase-form-overlay",
    "#attachment-form-overlay",
    "#showcase-profile-overlay",
    "#edit-comment-overlay",
    "#delete-confirm-overlay",
    ".orte-scene-host",
    ".place-template-toc",
    ".orte-inline-toolbar",
    ".orte-inline-status-widget",
    ".orte-inline-image-panel",
    ".orte-inline-image-overlay",
    ".orte-table-add-control",
    ".orte-table-row-controls",
    ".table-editor-toolbar",
    ".orte-section-controls",
    ".kingdom-county-card-view"
  ].join(", ");

  loadTableEditorAssets().finally(init);

  function init() {
    const localPayload = loadLocal();
    prepareTables();
    captureTemplateImageFallbacks();
    if (isCompatiblePayload(localPayload)) applyTablePayload(localPayload?.tables);
    rebuildTargets();
    if (isCompatiblePayload(localPayload)) applyPayload(localPayload, { skipTables: true });
    renderToolbar();
    renderStatusWidget();
    resetHistoryToCurrent();
    wireEvents();
    connectRemote();
    mountTableEditor();
  }

  function loadTableEditorAssets() {
    injectTableEditorStyles();
    if (window.AleriaTableEditor) return Promise.resolve();
    return new Promise((resolve) => {
      const existing = document.querySelector("script[data-aleria-table-editor]");
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => resolve(), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = resolveTableEditorAsset("table-editor.js");
      script.defer = true;
      script.dataset.aleriaTableEditor = TABLE_EDITOR_VERSION;
      script.onload = () => resolve();
      script.onerror = () => {
        console.warn("Aleria Tabelleneditor konnte nicht geladen werden.");
        resolve();
      };
      document.head.append(script);
    });
  }

  function injectTableEditorStyles() {
    if (document.querySelector("link[data-aleria-table-editor-style]")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = resolveTableEditorAsset("table-editor.css");
    link.dataset.aleriaTableEditorStyle = TABLE_EDITOR_VERSION;
    document.head.append(link);
  }

  function resolveTableEditorAsset(fileName) {
    const base = inlineEditorScript?.src || new URL("Orte/assets/js/orte-inline-editor.js", document.baseURI).toString();
    return new URL(`../../../AleriaAlmanach/modules/table-editor/${fileName}?v=${TABLE_EDITOR_VERSION}`, base).toString();
  }

  function mountTableEditor() {
    if (tableEditor || !window.AleriaTableEditor?.mount) return;
    tableEditor = window.AleriaTableEditor.mount({
      root,
      getEditMode: () => editMode,
      isIgnoredSurface: isInsideIgnoredSurface,
      onCellInput: ({ table }) => {
        updateTableState(table);
        markDirty();
      },
      onTableChanged: ({ table }) => {
        updateTableState(table);
        rebuildTargets();
        markDirty();
      }
    });
    tableEditor.setEditMode(editMode);
  }

  function renderToolbar() {
    const toolbar = document.createElement("div");
    toolbar.className = "orte-inline-toolbar";
    toolbar.innerHTML = `
      <strong>Direktbearbeitung</strong>
      <span class="orte-inline-status-text" data-orte-inline-status>bereit</span>
      <span class="orte-inline-document-state" data-orte-document-status>Entwurf</span>
      <button type="button" data-action="toggle-orte-inline-edit">Bearbeiten</button>
      <button type="button" data-action="toggle-orte-final-status" data-orte-final-action>Finalisieren</button>
      <button type="button" data-action="save-orte-inline-edit" data-orte-inline-edit-only>Speichern</button>
      <button type="button" data-action="undo-orte-inline-change" data-orte-history-action="undo" data-orte-inline-edit-only title="Änderung zurück">Zurück</button>
      <button type="button" data-action="redo-orte-inline-change" data-orte-history-action="redo" data-orte-inline-edit-only title="Änderung vor">Vor</button>
      <button type="button" data-action="export-orte-inline-data" data-orte-inline-edit-only>Export</button>
      <button type="button" data-action="trigger-orte-inline-import" data-orte-inline-edit-only>Import</button>
      <button type="button" data-action="hard-reset-orte-template" data-orte-inline-edit-only>Hard Reset</button>
      <input type="file" accept="application/json,.json" data-orte-import-file hidden>
      <details class="orte-section-controls" data-orte-inline-edit-only>
        <summary>Abschnitte</summary>
        <div class="orte-section-controls-list" data-orte-section-list></div>
        <button type="button" data-action="show-all-orte-sections">Alle anzeigen</button>
      </details>
      <span class="orte-inline-format-tools" data-orte-inline-edit-only>
        <button type="button" data-action="format-orte-text" data-command="bold" title="Fett"><b>F</b></button>
        <button type="button" data-action="format-orte-text" data-command="italic" title="Kursiv"><i>K</i></button>
        <button type="button" data-action="format-orte-text" data-command="underline" title="Unterstrichen"><u>U</u></button>
        <button type="button" data-action="format-orte-text" data-command="strikeThrough" title="Durchgestrichen"><s>S</s></button>
        <button type="button" data-action="format-orte-text" data-command="insertUnorderedList" title="Aufzählung">• Liste</button>
        <button type="button" data-action="format-orte-text" data-command="insertOrderedList" title="Nummerierte Liste">1. Liste</button>
        <button type="button" data-action="format-orte-text" data-command="justifyLeft" title="Linksbündig">Links</button>
        <button type="button" data-action="format-orte-text" data-command="justifyCenter" title="Zentriert">Mitte</button>
        <button type="button" data-action="format-orte-text" data-command="justifyRight" title="Rechtsbündig">Rechts</button>
        <button type="button" data-action="clear-orte-text-format" title="Formatierung entfernen">Format löschen</button>
        <label class="orte-inline-color-tool" title="Textfarbe">
          <span>Farbe</span>
          <input type="color" data-orte-format-color value="#3b220c">
        </label>
        <label class="orte-inline-color-tool" title="Hintergrundfarbe">
          <span>Hintergrund</span>
          <input type="color" data-orte-format-background value="#fff2c8">
        </label>
        <label class="orte-inline-tooltip-tool" title="Tooltip für markierten Text">
          <span>Tooltip</span>
          <input type="text" data-orte-format-tooltip placeholder="Hinweistext">
          <button type="button" data-action="apply-orte-tooltip">Setzen</button>
        </label>
      </span>
    `;
    document.body.prepend(toolbar);
    renderSectionControls();
    updateDocumentStatusControls();
    updateHistoryButtons();
  }

  function renderStatusWidget() {
    const existing = document.querySelector("[data-orte-status-widget]");
    if (existing) existing.remove();

    const widget = document.createElement("div");
    widget.className = "orte-inline-status-widget";
    widget.dataset.orteStatusWidget = "";
    widget.dataset.state = "idle";
    widget.innerHTML = `
      <button type="button" class="orte-inline-status-dot" data-action="toggle-orte-status-panel" aria-expanded="false" title="Direktbearbeitung Status"></button>
      <section class="orte-inline-status-panel" data-orte-status-panel hidden>
        <div class="orte-inline-status-panel-head">
          <strong>Direktbearbeitung</strong>
          <span data-orte-inline-status-panel-state>bereit</span>
        </div>
        <p data-orte-status-message>bereit</p>
        <div class="orte-inline-version-choice" data-orte-version-choice hidden>
          <p>Lokale und Online-Version unterscheiden sich.</p>
          <div class="orte-inline-version-actions">
            <button type="button" data-action="use-orte-latest-version">Neueste wählen</button>
            <button type="button" data-action="use-orte-online-version">Online laden</button>
            <button type="button" data-action="use-orte-local-version">Lokal behalten</button>
          </div>
        </div>
      </section>
    `;
    document.body.append(widget);
    applyStatusWidgetPosition(widget);
    wireStatusDrag(widget);
  }

  function wireEvents() {
    document.addEventListener("click", (event) => {
      const summaryText = event.target.closest("summary [data-orte-inline-text]");
      if (!editMode || !summaryText || !root.contains(summaryText)) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);

    document.addEventListener("click", (event) => {
      const actionTarget = event.target.closest("[data-action]");
      if (actionTarget && inlineActions.has(actionTarget.dataset.action)) {
        handleAction(event, actionTarget);
      }

      const imageSlot = event.target.closest("[data-orte-image-key]");
      if (!imageSlot || !editMode || !root.contains(imageSlot) || isInsideIgnoredSurface(imageSlot)) return;
      event.preventDefault();
      openImagePanel(imageSlot.dataset.orteImageKey);
    });

    document.addEventListener("input", (event) => {
      const colorInput = event.target.closest("[data-orte-format-color]");
      if (colorInput && editMode) {
        applyTextCommand("foreColor", colorInput.value);
        return;
      }

      const backgroundInput = event.target.closest("[data-orte-format-background]");
      if (backgroundInput && editMode) {
        applyTextCommand("hiliteColor", backgroundInput.value);
        return;
      }

      const editable = event.target.closest("[data-orte-inline-text]");
      if (editable && editMode) {
        sanitizeEditableNode(editable);
        persistEditable(editable);
        markDirty();
        return;
      }

      const imageInput = event.target.closest("[data-orte-inline-image-field]");
      if (imageInput) {
        updateImageField(imageInput);
        return;
      }

      const ratingInput = event.target.closest("[data-orte-rating-field]");
      if (ratingInput) updateRatingField(ratingInput);

      const headingColorInput = event.target.closest("[data-orte-table-heading-color]");
      if (headingColorInput) updateTableHeadingColor(headingColorInput, headingColorInput.value);
    });

    document.addEventListener("change", (event) => {
      const importInput = event.target.closest("[data-orte-import-file]");
      if (importInput) {
        importInlineData(importInput.files?.[0]);
        importInput.value = "";
        return;
      }

      const sectionInput = event.target.closest("[data-orte-section-toggle]");
      if (sectionInput && editMode) {
        setSectionHidden(sectionInput.dataset.orteSectionToggle, !sectionInput.checked);
      }
    });

    document.addEventListener("keydown", (event) => {
      const summaryText = event.target.closest("summary [data-orte-inline-text]");
      if (editMode && summaryText && root.contains(summaryText) && event.key === "Enter") {
        event.preventDefault();
        summaryText.blur();
        persistEditable(summaryText);
        markDirty();
        return;
      }

      const editable = event.target.closest("[data-orte-inline-text]");
      if (editMode && editable && root.contains(editable) && event.key === "Enter") {
        event.preventDefault();
        document.execCommand("insertLineBreak");
        sanitizeEditableNode(editable);
        persistEditable(editable);
        markDirty();
        return;
      }

      if (event.key === "Escape") closeImagePanel();
    });

    document.addEventListener("paste", (event) => {
      const editable = event.target.closest("[data-orte-inline-text]");
      if (!editMode || !editable || !root.contains(editable)) return;

      event.preventDefault();
      const html = event.clipboardData?.getData("text/html") || "";
      const text = event.clipboardData?.getData("text/plain") || "";
      document.execCommand("insertHTML", false, sanitizePastedHtml(html || escapePlainTextForPaste(text)));
      sanitizeEditableNode(editable);
      persistEditable(editable);
      markDirty();
    });

    document.addEventListener("error", (event) => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement)) return;
      const slot = image.closest("[data-orte-image-key]");
      if (!slot) return;
      slot.classList.add("has-image-load-error");
      slot.dataset.orteImageLoadState = "error";
    }, true);

    document.addEventListener("load", (event) => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement)) return;
      const slot = image.closest("[data-orte-image-key]");
      if (!slot) return;
      slot.classList.remove("has-image-load-error");
      delete slot.dataset.orteImageLoadState;
    }, true);

    document.addEventListener("selectionchange", () => {
      if (!editMode) return;
      rememberSelection();
    });

    window.addEventListener("resize", scheduleTableRowControlReposition, { passive: true });
  }

  function handleAction(event, target) {
    const action = target.dataset.action;
    if (action === "toggle-orte-inline-edit") {
      setEditMode(!editMode);
      event.preventDefault();
      return;
    }

    if (action === "toggle-orte-final-status") {
      toggleFinalStatus();
      event.preventDefault();
      return;
    }

    if (action === "save-orte-inline-edit") {
      saveNow();
      event.preventDefault();
      return;
    }

    if (action === "export-orte-inline-data") {
      exportInlineData();
      event.preventDefault();
      return;
    }

    if (action === "trigger-orte-inline-import") {
      document.querySelector("[data-orte-import-file]")?.click();
      event.preventDefault();
      return;
    }

    if (action === "undo-orte-inline-change") {
      undoInlineChange();
      event.preventDefault();
      return;
    }

    if (action === "redo-orte-inline-change") {
      redoInlineChange();
      event.preventDefault();
      return;
    }

    if (action === "hard-reset-orte-template") {
      hardResetInlineDocument();
      event.preventDefault();
      return;
    }

    if (action === "toggle-orte-status-panel") {
      if (!statusSuppressClick) setStatusPanelOpen(!statusPanelOpen);
      event.preventDefault();
      return;
    }

    if (action === "use-orte-local-version") {
      useLocalVersion();
      event.preventDefault();
      return;
    }

    if (action === "use-orte-online-version") {
      useOnlineVersion();
      event.preventDefault();
      return;
    }

    if (action === "use-orte-latest-version") {
      useLatestVersion();
      event.preventDefault();
      return;
    }

    if (action === "close-orte-image-panel") {
      closeImagePanel();
      event.preventDefault();
      return;
    }

    if (action === "clear-orte-image") {
      clearActiveImage();
      event.preventDefault();
      return;
    }

    if (action === "add-orte-table-row") {
      addTableRow(target);
      event.preventDefault();
      return;
    }

    if (action === "add-orte-table-heading-row") {
      addTableHeadingRow(target);
      event.preventDefault();
      return;
    }

    if (action === "insert-orte-table-heading-row-after") {
      insertTableHeadingRowNear(target, "after", getRequestedHeadingLevel(target));
      event.preventDefault();
      return;
    }

    if (action === "insert-orte-table-primary-heading-row-after" || action === "insert-orte-table-secondary-heading-row-after") {
      insertTableHeadingRowNear(target, "after", action === "insert-orte-table-secondary-heading-row-after" ? "secondary" : "primary");
      event.preventDefault();
      return;
    }

    if (action === "pick-orte-table-heading-color") {
      pickTableHeadingColor(target);
      event.preventDefault();
      return;
    }

    if (action === "set-orte-portrait-column-count") {
      setPortraitColumnCount(target);
      event.preventDefault();
      return;
    }

    if (action === "toggle-orte-table-row-controls") {
      toggleTableRowControls(target);
      event.preventDefault();
      return;
    }

    if (action === "insert-orte-table-empty-row-after") {
      insertTableEmptyRowNear(target, "after");
      event.preventDefault();
      return;
    }

    if (action === "insert-orte-table-portrait-row-after") {
      insertPortraitRowNear(target, "after");
      event.preventDefault();
      return;
    }

    if (action === "insert-orte-table-row-before" || action === "insert-orte-table-row-after") {
      insertTableRowNear(target, action === "insert-orte-table-row-before" ? "before" : "after");
      event.preventDefault();
      return;
    }

    if (action === "move-orte-table-row-up" || action === "move-orte-table-row-down") {
      moveTableRowNear(target, action === "move-orte-table-row-up" ? "up" : "down");
      event.preventDefault();
      return;
    }

    if (action === "insert-orte-table-block-after") {
      insertTableBlockNear(target, "after");
      event.preventDefault();
      return;
    }

    if (action === "remove-orte-table-block") {
      removeTableBlockNear(target);
      event.preventDefault();
      return;
    }

    if (action === "remove-orte-table-row") {
      removeTableRowNear(target);
      event.preventDefault();
      return;
    }

    if (action === "format-orte-text") {
      applyTextCommand(target.dataset.command);
      event.preventDefault();
      return;
    }

    if (action === "clear-orte-text-format") {
      clearTextFormat();
      event.preventDefault();
      return;
    }

    if (action === "show-all-orte-sections") {
      showAllSections();
      event.preventDefault();
      return;
    }

    if (action === "apply-orte-tooltip") {
      const input = document.querySelector("[data-orte-format-tooltip]");
      applyTooltip(input?.value || "");
      if (input) input.value = "";
      event.preventDefault();
    }
  }

  function setEditMode(enabled) {
    if (enabled && state.meta.locked) {
      const confirmed = window.confirm(
        "Dieser Ort ist als final gesperrt.\n\nZum Nachbearbeiten wird der Ort wieder in den Status \"In Bearbeitung\" gesetzt. Fortfahren?"
      );
      if (!confirmed) return;
      setDocumentLocked(false);
      dirty = true;
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(saveNow, 300);
    }

    editMode = enabled;
    document.body.classList.toggle("orte-inline-editing", editMode);
    document.querySelector("[data-action='toggle-orte-inline-edit']").textContent = editMode ? "Ansicht" : "Bearbeiten";
    if (!editMode) {
      activeEditable = null;
      savedSelection = null;
    }

    textItems.forEach((item) => {
      item.node.contentEditable = String(editMode);
      item.node.spellcheck = true;
    });

    renderImageSlots();
    renderRatings();
    renderTableControls();
    updateDocumentStatusControls();
    updateHistoryButtons();
    tableEditor?.setEditMode(editMode);
    if (!editMode) closeImagePanel();
  }

  function rebuildTargets() {
    removeInlineEditorControls();
    textItems.length = 0;
    imageItems.length = 0;
    ratingItems.length = 0;
    tableItems.length = 0;
    sectionItems.length = 0;
    root.querySelectorAll("[data-orte-inline-text]").forEach((node) => {
      node.removeAttribute("data-orte-inline-text");
      node.removeAttribute("contenteditable");
    });

    prepareTables();
    normalizePortraitLayoutTables();
    ensureAristocracyBaroneGroup();
    normalizeRawImages();
    collectImageItems();
    collectRatingItems();
    collectTextItems();
    collectTableItems();
    collectSectionItems();
    renderImageSlots();
    renderRatings();
    renderTableControls();
    applySectionVisibility();
    renderSectionControls();
    tableEditor?.refresh();

    if (editMode) {
      textItems.forEach((item) => {
        item.node.contentEditable = "true";
        item.node.spellcheck = true;
      });
    }
  }

  function collectTextItems() {
    let textIndex = 0;
    let tableTextIndex = 0;
    const activeTextIds = new Set();
    getEditableCandidates().forEach((candidate) => {
      const table = candidate.closest("[data-orte-table-id]");
      const node = table ? normalizeTableEditableCandidate(candidate) : candidate;
      if (!node) return;
      const id = table
        ? `table-text-${String(tableTextIndex++).padStart(4, "0")}`
        : `text-${String(textIndex++).padStart(4, "0")}`;
      node.dataset.orteInlineText = id;
      if (!table) {
        activeTextIds.add(id);
        if (state.texts[id] === undefined) state.texts[id] = node.innerHTML;
      }
      textItems.push({ id, node, inTable: !!table });
    });
    Object.keys(state.texts).forEach((id) => {
      if (!activeTextIds.has(id)) delete state.texts[id];
    });
  }

  function collectImageItems() {
    root.querySelectorAll("[data-orte-image-key]").forEach((node) => {
      const key = node.dataset.orteImageKey;
      if (!key) return;
      const label = node.dataset.orteImageLabel || key;
      node.classList.toggle("is-compact-image", !!node.closest(".wappen"));
      node.classList.toggle("is-portrait-image", !!node.closest(".portrait-cell"));
      const existingImage = node.querySelector("img");
      const existingLink = existingImage?.closest("a");
      const existingSrc = existingImage && !isPlaceholderImage(existingImage)
        ? existingImage.getAttribute("src") || ""
        : "";
      const initialImage = {
        src: existingSrc,
        href: existingLink?.getAttribute("href") || "",
        alt: existingImage?.getAttribute("alt") || label,
        width: node.dataset.orteImageWidth || "",
        maxHeight: node.dataset.orteImageMaxHeight || "",
        format: node.dataset.orteImageFormat || "",
        fit: node.dataset.orteImageFit || ""
      };
      state.images[key] = mergeInitialImageState(resolveTemplateImageFallback(key, initialImage, label), state.images[key], label);
      imageItems.push({ key, label, node });
    });
  }

  function collectRatingItems() {
    let index = 0;
    const usedKeys = new Set();
    const activeKeys = new Set();
    const makeKey = () => {
      let key = `rating-${String(index).padStart(4, "0")}`;
      while (usedKeys.has(key)) {
        index += 1;
        key = `rating-${String(index).padStart(4, "0")}`;
      }
      index += 1;
      usedKeys.add(key);
      activeKeys.add(key);
      return key;
    };

    root.querySelectorAll("table.pt-s-0040 tr").forEach((row) => {
      const cells = Array.from(row.cells || []);
      if (cells.length < 8) return;
      if (!cells[0]?.querySelector("[data-orte-image-key]")) return;

      [4, 5, 6].forEach((cellIndex) => {
        const cell = cells[cellIndex];
        if (!cell) return;
        const existingKey = String(cell.dataset.orteRatingKey || "").trim();
        const key = existingKey && !usedKeys.has(existingKey)
          ? existingKey
          : makeKey();
        usedKeys.add(key);
        activeKeys.add(key);
        cell.dataset.orteRatingKey = key;
        cell.dataset.orteRatingKind = cellIndex === 5 ? "ruf" : "stern";
        if (state.ratings[key] === undefined) state.ratings[key] = inferRatingValue(cell);
        ratingItems.push({ key, node: cell, kind: cell.dataset.orteRatingKind });
      });
    });

    Object.keys(state.ratings).forEach((key) => {
      if (!activeKeys.has(key)) delete state.ratings[key];
    });
  }

  function collectTableItems() {
    getEditableTables().forEach((table) => {
      const id = table.dataset.orteTableId;
      if (!id) return;
      state.tables[id] = state.tables[id] || getTableHtml(table);
      tableItems.push({ id, table });
    });
  }

  function collectSectionItems() {
    const sectionHeadingSelector = ".grossstadt-template-frame h2, .kingdom-section-heading";
    const headings = Array.from(root.querySelectorAll(sectionHeadingSelector));
    const activeIds = new Set();
    headings.forEach((heading, index) => {
      const row = heading.closest("tr");
      const id = heading.id || `abschnitt-${String(index).padStart(2, "0")}`;
      if (!row || activeIds.has(id)) return;

      const rows = [];
      let currentRow = row;
      while (currentRow) {
        if (currentRow !== row && currentRow.querySelector(sectionHeadingSelector)) break;
        rows.push(currentRow);
        currentRow = currentRow.nextElementSibling;
      }

      activeIds.add(id);
      sectionItems.push({
        id,
        title: normalizeWhitespace(heading.textContent) || id,
        heading,
        rows
      });
    });

    Object.keys(state.hiddenSections).forEach((id) => {
      if (!activeIds.has(id)) delete state.hiddenSections[id];
    });
  }

  function getEditableCandidates() {
    const explicitEditableSelector = "[data-orte-explicit-inline], [data-orte-portrait-field]";
    return Array.from(root.querySelectorAll(`${explicitEditableSelector}, h2, h3, details > summary > span, p, td, th, li`))
      .filter((node) => !isInsideIgnoredSurface(node))
      .filter((node) => !node.closest("[data-orte-image-key], [data-orte-rating-key]"))
      .filter((node) => !node.closest(".orte-cell-editable"))
      .filter((node) => !node.matches(".place-spacer"))
      .filter((node) => !node.matches(".orte-portrait-layout-spacer"))
      .filter((node) => node.matches(explicitEditableSelector) || !node.querySelector(explicitEditableSelector))
      .filter((node) => !node.querySelector("table, h2, h3, summary, p, td, th, li, [data-orte-image-key], [data-orte-rating-key]"))
      .filter((node) => normalizeWhitespace(node.textContent));
  }

  function normalizeTableEditableCandidate(node) {
    if (!isTableCellElement(node)) return node;
    if (node.querySelector(".orte-table-row-controls")) return null;
    return ensureCellEditableWrapper(node);
  }

  function isTableCellElement(node) {
    return node?.matches?.("td, th");
  }

  function ensureCellEditableWrapper(cell) {
    const existing = Array.from(cell.children || []).find((child) => (
      child.classList?.contains("orte-cell-editable")
    ));
    if (existing) return existing;

    const wrapper = document.createElement("span");
    wrapper.className = "orte-cell-editable";
    while (cell.firstChild) wrapper.appendChild(cell.firstChild);
    cell.appendChild(wrapper);
    return wrapper;
  }

  function unwrapElement(node) {
    const parent = node?.parentNode;
    if (!parent) return;
    while (node.firstChild) parent.insertBefore(node.firstChild, node);
    node.remove();
  }

  function getEditableTables() {
    return Array.from(root.querySelectorAll("table"))
      .filter((table) => !table.querySelector("table"))
      .filter((table) => table.tBodies.length && table.tBodies[0].rows.length > 1)
      .filter((table) => !isInsideIgnoredSurface(table));
  }

  function prepareTables() {
    getEditableTables().forEach((table, index) => {
      table.dataset.orteTableId = table.dataset.orteTableId || `table-${String(index).padStart(4, "0")}`;
    });
  }

  function ensureAristocracyBaroneGroup() {
    root.querySelectorAll("table.pt-s-0040").forEach((table) => {
      const tableText = normalizeWhitespace(table.textContent);
      if (!tableText.includes("Grafenhaus") || !containsRitterfuersten(tableText) || tableText.includes("Barone")) return;

      const ritterHeader = Array.from(table.rows || []).find((row) => {
        const text = normalizeWhitespace(row.textContent);
        return containsRitterfuersten(text) && row.querySelector("th, .rang-kopf");
      });
      if (!ritterHeader) return;

      ritterHeader.before(...createBaroneRows());
      updateTableState(table);
    });
  }

  function containsRitterfuersten(text) {
    return String(text || "").includes("Ritterfürsten") || String(text || "").includes("RitterfÃ¼rsten");
  }

  function createBaroneRows() {
    const template = document.createElement("tbody");
    template.innerHTML = `
      <tr>
        <th class="rang-kopf pt-s-0063" colspan="9" scope="colgroup"><b>Barone</b></th>
      </tr>
      <tr>
        <td class="wappen pt-s-0050" colspan="9">&nbsp;</td>
      </tr>
      <tr>
        <td class="wappen pt-s-0050"><b class="pt-s-0017"><img alt="https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png" class="transparent pt-s-0052" src="https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png"></b></td>
        <td class="pt-s-0053"><b class="pt-s-0017">....</b></td>
        <td class="pt-s-0054"><b>Barone</b></td>
        <td class="pt-s-0055"><b class="pt-s-0017">&#9001;???&#9002;</b></td>
        <td class="pt-s-0056"><b><span class="pt-s-0057">&#9733;&#9733;&#9733;&#9734;&#9734;</span></b></td>
        <td class="pt-s-0058"><b><span class="pt-s-0059">&#10020;&#10020;&#10020;&#10023;&#10023;</span></b></td>
        <td class="pt-s-0056"><b><span class="pt-s-0060">&#9733;&#9733;&#9733;&#9734;&#9734;</span></b></td>
        <td class="pt-s-0061" colspan="2"><b class="pt-s-0017">&#9001;???&#9002;</b></td>
      </tr>
      <tr>
        <td class="wappen pt-s-0062" colspan="9"><p>&nbsp;</p></td>
      </tr>
    `;
    return Array.from(template.rows);
  }

  function normalizeRawImages() {
    const usedKeys = new Set([
      ...Object.keys(state.images),
      ...Array.from(root.querySelectorAll("[data-orte-image-key]")).map((node) => node.dataset.orteImageKey)
    ].filter(Boolean));
    const makeKey = (prefix) => {
      let index = 0;
      let key = `${prefix}-${String(index).padStart(4, "0")}`;
      while (usedKeys.has(key)) {
        index += 1;
        key = `${prefix}-${String(index).padStart(4, "0")}`;
      }
      usedKeys.add(key);
      return key;
    };

    root.querySelectorAll(".orte-image-slot:not([data-orte-image-key])").forEach((slot) => {
      const label = slot.dataset.orteImageLabel || getImageSlotContextLabel(slot);
      const key = makeKey(getImageKeyPrefix(slot));
      slot.dataset.orteImageKey = key;
      slot.dataset.orteImageLabel = label;
      slot.setAttribute("aria-label", slot.dataset.orteImageLabel);
    });

    root.querySelectorAll("img").forEach((image) => {
      if (image.closest("[data-orte-image-key]") || isInsideIgnoredSurface(image)) return;

      const label = getImageSlotLabel(image);
      const key = image.dataset.orteInlineImageKey || makeKey(getImageKeyPrefix(image));
      const slot = document.createElement("span");
      const source = image.getAttribute("src") || "";
      slot.className = source && !isPlaceholderImage(image) ? "orte-image-slot has-image" : "orte-image-slot";
      slot.dataset.orteImageKey = key;
      slot.dataset.orteImageLabel = label;
      slot.setAttribute("aria-label", label);
      image.dataset.orteInlineImageKey = key;
      image.replaceWith(slot);
      slot.appendChild(image);
      if (!source || isPlaceholderImage(image)) {
        state.images[key] = normalizeImageState({ src: "", alt: label }, label);
      }
    });
  }

  function captureTemplateImageFallbacks() {
    templateImageFallbacks.clear();
    const virtualSlotKeys = new WeakMap();

    const usedKeys = new Set([
      ...Object.keys(state.images),
      ...Array.from(root.querySelectorAll("[data-orte-image-key]")).map((node) => node.dataset.orteImageKey)
    ].filter(Boolean));
    const makeKey = (prefix) => {
      let index = 0;
      let key = `${prefix}-${String(index).padStart(4, "0")}`;
      while (usedKeys.has(key)) {
        index += 1;
        key = `${prefix}-${String(index).padStart(4, "0")}`;
      }
      usedKeys.add(key);
      return key;
    };

    root.querySelectorAll(".orte-image-slot:not([data-orte-image-key])").forEach((slot) => {
      virtualSlotKeys.set(slot, makeKey(getImageKeyPrefix(slot)));
    });

    root.querySelectorAll("img").forEach((image) => {
      if (isInsideIgnoredSurface(image)) return;

      const keyedSlot = image.closest("[data-orte-image-key]");
      const unkeyedSlot = image.closest(".orte-image-slot:not([data-orte-image-key])");
      const key = keyedSlot?.dataset?.orteImageKey
        || (unkeyedSlot ? virtualSlotKeys.get(unkeyedSlot) : "")
        || image.dataset.orteInlineImageKey
        || makeKey(getImageKeyPrefix(image));
      if (!key) return;

      const source = image.getAttribute("src") || "";
      if (!source || isPlaceholderImage(image)) return;

      const link = image.closest("a[href]");
      const label = keyedSlot?.dataset?.orteImageLabel
        || unkeyedSlot?.dataset?.orteImageLabel
        || getImageSlotLabel(image);
      templateImageFallbacks.set(key, normalizeImageState({
        src: source,
        href: link?.getAttribute("href") || "",
        alt: image.getAttribute("alt") || label,
        width: keyedSlot?.dataset?.orteImageWidth || unkeyedSlot?.dataset?.orteImageWidth || "",
        maxHeight: keyedSlot?.dataset?.orteImageMaxHeight || unkeyedSlot?.dataset?.orteImageMaxHeight || "",
        format: keyedSlot?.dataset?.orteImageFormat || unkeyedSlot?.dataset?.orteImageFormat || "",
        fit: keyedSlot?.dataset?.orteImageFit || unkeyedSlot?.dataset?.orteImageFit || ""
      }, label));
    });
  }

  function resolveTemplateImageFallback(key, initialImage, label) {
    const initial = normalizeImageState(initialImage, label);
    if (initial.src) return initial;

    const fallback = templateImageFallbacks.get(key);
    if (!fallback?.src) return initial;

    return normalizeImageState({
      ...initial,
      src: fallback.src,
      href: initial.href || fallback.href,
      alt: initial.alt && initial.alt !== label ? initial.alt : fallback.alt
    }, label);
  }

  function renderImageSlots() {
    imageItems.forEach((item) => renderImageSlot(item.key));
  }

  function renderImageSlot(key) {
    const item = imageItems.find((entry) => entry.key === key);
    if (!item) return;

    const image = normalizeImageState(state.images[key] || {}, item.label);
    state.images[key] = image;
    const alt = image.alt || item.label;
    const usesPortraitPlaceholder = !image.src && shouldRenderPortraitPlaceholder(item, image);
    item.node.classList.toggle("has-image", !!image.src);
    item.node.classList.toggle("has-portrait-placeholder", usesPortraitPlaceholder);
    item.node.dataset.orteImageFormat = image.format;
    item.node.dataset.orteImageFit = image.fit;
    item.node.dataset.orteImageWidth = String(image.width);
    item.node.dataset.orteImageMaxHeight = String(image.maxHeight);
    item.node.style.setProperty("--orte-image-width", `${image.width}%`);
    item.node.style.setProperty("--orte-image-max-height", `${image.maxHeight}px`);

    const editHint = editMode ? `<span class="orte-inline-image-hint">Bild bearbeiten</span>` : "";
    if (!image.src) {
      if (usesPortraitPlaceholder) {
        item.node.innerHTML = `<img class="orte-image-placeholder-media" src="${PORTRAIT_PLACEHOLDER_SRC}" alt="${escapeAttr(item.label || "Portrait Platzhalter")}" loading="lazy" decoding="async">${editHint}`;
        return;
      }
      item.node.innerHTML = `<span class="orte-image-placeholder" role="img" aria-label="${escapeAttr(item.label)}">${escapeHtml(getPlaceholderText(item))}</span>${editHint}`;
      return;
    }

    const imageHtml = `<img src="${escapeAttr(image.src)}" alt="${escapeAttr(alt)}" loading="lazy" decoding="async">`;
    item.node.innerHTML = image.href
      ? `<a href="${escapeAttr(image.href)}" target="_blank" rel="noopener">${imageHtml}</a>${editHint}`
      : `${imageHtml}${editHint}`;
  }

  function renderRatings() {
    ratingItems.forEach((item) => {
      const value = clampRating(state.ratings[item.key]);
      item.node.dataset.orteRatingValue = String(value);
      item.node.classList.add("orte-rating-cell");
      if (!editMode) {
        item.node.innerHTML = `<b><span class="orte-rating-display">${formatRating(value, item.kind)}</span></b>`;
        return;
      }

      item.node.innerHTML = `
        <label class="orte-rating-control">
          <input type="range" min="1" max="5" step="1" value="${value}" data-orte-rating-field="${escapeAttr(item.key)}">
          <span>${value}/5</span>
        </label>
      `;
    });
  }

  function renderTableControls() {
    removeInlineEditorControls();
    const activeControlKeys = new Set();
    tableItems.forEach((item) => {
      const control = document.createElement("div");
      control.className = "orte-table-add-control";
      control.innerHTML = `
        <button type="button" data-action="add-orte-table-row" data-orte-table-target="${escapeAttr(item.id)}">+ Zeile</button>
        <button type="button" data-action="add-orte-table-heading-row" data-orte-table-target="${escapeAttr(item.id)}">+ Überschrift</button>
      `;
      insertTableAddHeadingControls(control, item.id);
      item.table.insertAdjacentElement("afterend", control);
      renderRowControls(item.table, item.id, activeControlKeys);
    });
    Array.from(expandedTableControlKeys).forEach((key) => {
      if (!activeControlKeys.has(key)) expandedTableControlKeys.delete(key);
    });
  }

  function refreshTableControls() {
    if (!editMode) return;
    renderTableControls();
  }

  function renderPortraitLayoutControls(table, tableId, rowIndex) {
    const allowedCounts = getPortraitLayoutCounts(table);
    if (!allowedCounts.length) return "";

    const row = getTableRowByIndex(table, rowIndex);
    const persistedCount = Number(row?.dataset?.ortePortraitCount);
    const currentCount = allowedCounts.includes(persistedCount) ? persistedCount : getPortraitLayoutCells(row).length;
    return `
      <span class="orte-table-layout-control" aria-label="Portrait-Spalten">
        ${allowedCounts.map((count) => `
          <button type="button" data-action="set-orte-portrait-column-count" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${escapeAttr(rowIndex)}" data-orte-portrait-count="${count}" aria-pressed="${count === currentCount ? "true" : "false"}">${count}</button>
        `).join("")}
      </span>
    `;
  }

  function insertPortraitRowControl(controls, table, tableId, rowIndex) {
    if (!controls || !table?.dataset?.ortePortraitLayout) return;

    const existingPortraitButton = Array.from(controls.querySelectorAll('button[data-action="insert-orte-table-row-after"]'))
      .find((button) => /portrait/i.test(button.textContent + " " + button.title));
    if (existingPortraitButton) {
      existingPortraitButton.dataset.action = "insert-orte-table-portrait-row-after";
      existingPortraitButton.textContent = "+ Portraitreihe";
      existingPortraitButton.title = "Portraitreihe danach einfuegen";
      return;
    }

    if (controls.querySelector('[data-action="insert-orte-table-portrait-row-after"]')) return;

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = "insert-orte-table-portrait-row-after";
    button.dataset.orteTableTarget = tableId;
    button.dataset.orteTableRowIndex = String(rowIndex);
    button.title = "Portraitreihe danach einfuegen";
    button.textContent = "+ Portraitreihe";

    const removeButton = controls.querySelector('[data-action="remove-orte-table-row"], [data-action="remove-orte-table-block"]');
    if (removeButton) removeButton.before(button);
    else controls.append(button);
  }

  function insertPersonalityEmptyRowControl(controls, isPersonalityTable, tableId, rowIndex) {
    if (!controls || !isPersonalityTable) return;
    if (controls.querySelector('[data-action="insert-orte-table-empty-row-after"]')) return;

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = "insert-orte-table-empty-row-after";
    button.dataset.orteTableTarget = tableId;
    button.dataset.orteTableRowIndex = String(rowIndex);
    button.title = "Leerzeile danach einfuegen";
    button.textContent = "+ Leerzeile";

    const removeButton = controls.querySelector('[data-action="remove-orte-table-row"]');
    if (removeButton) removeButton.before(button);
    else controls.append(button);
  }

  function renderTableHeadingInsertControls(tableId, rowIndex) {
    return `
      <button type="button" data-action="insert-orte-table-primary-heading-row-after" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${escapeAttr(rowIndex)}" title="Prim&auml;re &Uuml;berschriftszeile danach einf&uuml;gen">+ &Uuml;berschrift 1</button>
      <button type="button" data-action="insert-orte-table-secondary-heading-row-after" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${escapeAttr(rowIndex)}" title="Sekund&auml;re &Uuml;berschriftszeile danach einf&uuml;gen">+ &Uuml;berschrift 2</button>
    `;
  }

  function getRequestedHeadingLevel(button) {
    return button?.dataset?.orteHeadingLevel === "secondary" ? "secondary" : "primary";
  }

  function insertRowHeadingControls(controls, tableId, rowIndex, controlKey, expanded = false) {
    if (!controls) return;
    controls.querySelectorAll('[data-action="insert-orte-table-heading-row-after"]').forEach((button) => button.remove());
    controls.querySelectorAll('[data-action="move-orte-table-row-up"], [data-action="move-orte-table-row-down"], [data-action="toggle-orte-table-row-controls"]').forEach((button) => button.remove());
    controls.dataset.orteTableControlKey = controlKey || "";
    controls.classList.toggle("is-expanded", !!expanded);

    controls.insertAdjacentHTML("afterbegin", `
      <button type="button" class="orte-table-row-toggle" data-action="toggle-orte-table-row-controls" aria-expanded="${expanded ? "true" : "false"}" title="Zeilenwerkzeuge anzeigen">[...]</button>
    `);

    const headingTemplate = document.createElement("template");
    headingTemplate.innerHTML = renderTableHeadingInsertControls(tableId, rowIndex).trim();
    const headingButtons = Array.from(headingTemplate.content.childNodes);
    const moveTemplate = document.createElement("template");
    moveTemplate.innerHTML = `
      <button type="button" data-action="move-orte-table-row-up" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${escapeAttr(rowIndex)}" title="Zeile nach oben verschieben">&uarr;</button>
      <button type="button" data-action="move-orte-table-row-down" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${escapeAttr(rowIndex)}" title="Zeile nach unten verschieben">&darr;</button>
    `.trim();
    const moveButtons = Array.from(moveTemplate.content.childNodes);
    const removeButton = controls.querySelector('[data-action="remove-orte-table-row"], [data-action="remove-orte-table-block"]');

    if (removeButton) removeButton.before(...moveButtons, ...headingButtons);
    else controls.append(...moveButtons, ...headingButtons);
  }

  function insertTableAddHeadingControls(control, tableId) {
    if (!control) return;
    control.querySelectorAll('[data-action="add-orte-table-heading-row"]').forEach((button) => button.remove());
    control.insertAdjacentHTML("beforeend", `
      <button type="button" data-action="add-orte-table-heading-row" data-orte-heading-level="primary" data-orte-table-target="${escapeAttr(tableId)}">+ &Uuml;berschrift 1</button>
      <button type="button" data-action="add-orte-table-heading-row" data-orte-heading-level="secondary" data-orte-table-target="${escapeAttr(tableId)}">+ &Uuml;berschrift 2</button>
    `);
  }

  function openImagePanel(key) {
    const item = imageItems.find((entry) => entry.key === key);
    if (!item) return;

    closeImagePanel();
    activeImageKey = key;

    const image = state.images[key] || {};
    const overlay = document.createElement("div");
    overlay.className = "orte-inline-image-overlay";
    overlay.dataset.orteImagePanel = key;
    overlay.innerHTML = `
      <div class="orte-inline-image-panel" role="dialog" aria-modal="true" aria-label="${escapeAttr(item.label)} bearbeiten">
        <div class="orte-inline-image-panel-head">
          <strong>${escapeHtml(item.label)}</strong>
          <button type="button" data-action="close-orte-image-panel" aria-label="Schließen">x</button>
        </div>
        <label>
          <span>Bild-URL</span>
          <input type="url" data-orte-inline-image-field="src" value="${escapeAttr(image.src || "")}" placeholder="https://...">
        </label>
        <label>
          <span>Link</span>
          <input type="text" data-orte-inline-image-field="href" value="${escapeAttr(image.href || "")}" placeholder="Optionaler Link beim Klick">
        </label>
        <label>
          <span>Alt-Text</span>
          <input type="text" data-orte-inline-image-field="alt" value="${escapeAttr(image.alt || item.label)}">
        </label>
        <div class="orte-inline-image-grid">
          <label>
            <span>Breite</span>
            <input type="range" min="20" max="100" step="5" data-orte-inline-image-field="width" value="${escapeAttr(image.width || 100)}">
          </label>
          <label>
            <span>Höhe</span>
            <input type="range" min="80" max="720" step="20" data-orte-inline-image-field="maxHeight" value="${escapeAttr(image.maxHeight || 260)}">
          </label>
        </div>
        <div class="orte-inline-image-grid">
          <label>
            <span>Format</span>
            <select data-orte-inline-image-field="format">
              ${renderOption("auto", "Automatisch", image.format)}
              ${renderOption("square", "Quadrat", image.format)}
              ${renderOption("portrait", "Hochformat", image.format)}
              ${renderOption("landscape", "Querformat", image.format)}
              ${renderOption("banner", "Banner", image.format)}
            </select>
          </label>
          <label>
            <span>Einpassung</span>
            <select data-orte-inline-image-field="fit">
              ${renderOption("contain", "Einpassen", image.fit)}
              ${renderOption("cover", "Füllen", image.fit)}
            </select>
          </label>
        </div>
        <button type="button" data-action="clear-orte-image">Bild leeren</button>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector("[data-orte-inline-image-field]")?.focus();
  }

  function closeImagePanel() {
    document.querySelectorAll("[data-orte-image-panel]").forEach((panel) => panel.remove());
    activeImageKey = "";
  }

  function updateImageField(input) {
    if (!activeImageKey) return;
    const field = input.dataset.orteInlineImageField;
    const nextImage = {
      ...(state.images[activeImageKey] || {}),
      [field]: input.value
    };
    if (field === "src") {
      nextImage.clearedAtClient = String(input.value || "").trim() ? 0 : Date.now();
    }
    state.images[activeImageKey] = {
      ...nextImage
    };
    const item = imageItems.find((entry) => entry.key === activeImageKey);
    state.images[activeImageKey] = normalizeImageState(state.images[activeImageKey], item?.label || "");
    renderImageSlot(activeImageKey);
    updateOwningTable(item?.node);
    markDirty();
  }

  function updateRatingField(input) {
    const key = input.dataset.orteRatingField;
    state.ratings[key] = clampRating(input.value);
    renderRatings();
    updateOwningTable(input);
    markDirty();
  }

  function clearActiveImage() {
    if (!activeImageKey) return;
    const item = imageItems.find((entry) => entry.key === activeImageKey);
    state.images[activeImageKey] = normalizeImageState({
      src: "",
      href: "",
      alt: item?.label || "",
      clearedAtClient: Date.now()
    }, item?.label || "");
    renderImageSlot(activeImageKey);
    closeImagePanel();
    updateOwningTable(item?.node);
    markDirty();
  }

  function addTableRow(button) {
    const table = root.querySelector(`[data-orte-table-id="${cssEscape(button.dataset.orteTableTarget)}"]`);
    if (!table) return;

    if (table.classList.contains("pt-s-0067")) {
      addPersonalityRows(table);
    } else {
      addGenericTableRow(table);
    }

    updateTableState(table);
    rebuildTargets();
    markDirty();
  }

  function addTableHeadingRow(button) {
    const table = root.querySelector(`[data-orte-table-id="${cssEscape(button.dataset.orteTableTarget)}"]`);
    if (!table) return;
    const headingLevel = getRequestedHeadingLevel(button);

    if (table.classList.contains("pt-s-0067")) {
      const dividerRows = Array.from(table.tBodies[0]?.rows || []).filter(isPersonalityDividerRow);
      const referenceRow = dividerRows[dividerRows.length - 1] || table.tBodies[0]?.rows?.[table.tBodies[0].rows.length - 1];
      if (referenceRow) addPersonalityDividerRow(referenceRow, "after", headingLevel);
    } else {
      addGenericHeadingRow(table, null, "after", headingLevel);
    }

    updateTableState(table);
    rebuildTargets();
    markDirty();
  }

  function insertTableRowNear(button, position) {
    const table = root.querySelector(`[data-orte-table-id="${cssEscape(button.dataset.orteTableTarget)}"]`);
    if (!table) return;

    const row = getTableRowByIndex(table, button.dataset.orteTableRowIndex);
    if (!row) return;

    if (table.classList.contains("pt-s-0067")) {
      if (isPersonalityDividerRow(row)) {
        addPersonalityDividerRow(row, position);
      } else {
        addPersonalityRows(table, row, position);
      }
    } else {
      addGenericTableRow(table, row, position);
    }

    updateTableState(table);
    rebuildTargets();
    markDirty();
  }

  function insertTableHeadingRowNear(button, position, headingLevel = "primary") {
    const table = root.querySelector(`[data-orte-table-id="${cssEscape(button.dataset.orteTableTarget)}"]`);
    if (!table) return;

    const row = getTableRowByIndex(table, button.dataset.orteTableRowIndex);
    if (!row) return;

    if (table.classList.contains("pt-s-0067")) {
      insertPersonalityDividerNear(table, row, position, headingLevel);
    } else {
      addGenericHeadingRow(table, row, position, headingLevel);
    }

    updateTableState(table);
    rebuildTargets();
    markDirty();
  }

  function insertTableEmptyRowNear(button, position) {
    const table = root.querySelector(`[data-orte-table-id="${cssEscape(button.dataset.orteTableTarget)}"]`);
    if (!table) return;

    const row = getTableRowByIndex(table, button.dataset.orteTableRowIndex);
    if (!row) return;

    if (table.dataset.ortePortraitLayout) {
      addPortraitGapRow(table, row, position);
    } else {
      addGenericEmptyRow(table, row, position);
    }

    updateTableState(table);
    rebuildTargets();
    markDirty();
  }

  function insertPortraitRowNear(button, position = "after") {
    const table = root.querySelector(`[data-orte-table-id="${cssEscape(button.dataset.orteTableTarget)}"]`);
    if (!table?.dataset?.ortePortraitLayout) return;

    const row = getTableRowByIndex(table, button.dataset.orteTableRowIndex);
    if (!row) return;

    const source = isPortraitLayoutRow(row, table) ? row : getNearestPortraitLayoutRow(table, row);
    const allowedCounts = getPortraitLayoutCounts(table);
    const fallbackCount = allowedCounts.includes(1) ? 1 : allowedCounts[0] || 1;
    const count = source
      ? getPortraitLayoutRowCount(source, table)
      : fallbackCount;
    const portraitRow = source ? source.cloneNode(true) : createPortraitLayoutRow(table, count);
    resetClonedFragment(portraitRow);

    const rowsToInsert = [portraitRow];
    if (table.classList.contains("haeuser-court-table") && source && isCourtNameRow(source.nextElementSibling)) {
      const nameRow = source.nextElementSibling.cloneNode(true);
      resetClonedFragment(nameRow);
      rowsToInsert.push(nameRow);
    }

    const insertTarget = position === "after" && table.classList.contains("haeuser-court-table") && isCourtNameRow(row.nextElementSibling)
      ? row.nextElementSibling
      : row;
    insertTarget.insertAdjacentElement(position === "before" ? "beforebegin" : "afterend", rowsToInsert[0]);
    rowsToInsert.slice(1).forEach((extraRow) => rowsToInsert[0].after(extraRow));
    applyPortraitColumnCount(table, portraitRow, count, { persistChoice: true });
    syncCourtNameRowToPortraitCount(table, portraitRow, count);

    updateTableState(table);
    rebuildTargets();
    markDirty();
  }

  function removeTableRowNear(button) {
    const table = root.querySelector(`[data-orte-table-id="${cssEscape(button.dataset.orteTableTarget)}"]`);
    if (!table) return;

    const row = getTableRowByIndex(table, button.dataset.orteTableRowIndex);
    if (!row) return;

    if (table.classList.contains("pt-s-0067")) {
      if (isPersonalityDividerRow(row)) {
        removePersonalityDividerRow(table, row);
      } else {
        removePersonalityRows(table, row);
      }
    } else if (isPortraitLayoutRow(row, table)) {
      removePortraitLayoutRow(table, row);
    } else if (isPortraitGapRow(row, table)) {
      row.remove();
    } else if (isGenericHeadingRow(row, table)) {
      removeGenericHeadingRow(table, row);
    } else {
      removeGenericTableRow(table, row);
    }

    updateTableState(table);
    rebuildTargets();
    markDirty();
  }

  function setPortraitColumnCount(button) {
    const table = root.querySelector(`[data-orte-table-id="${cssEscape(button.dataset.orteTableTarget)}"]`);
    if (!table) return;

    const allowedCounts = getPortraitLayoutCounts(table);
    const count = Number(button.dataset.ortePortraitCount);
    if (!allowedCounts.includes(count)) return;

    const row = getTableRowByIndex(table, button.dataset.orteTableRowIndex);
    if (!row || !isPortraitLayoutRow(row, table)) return;
    if (!applyPortraitColumnCount(table, row, count, { persistChoice: true })) return;
    syncCourtNameRowToPortraitCount(table, row, count);

    updateTableState(table);
    rebuildTargets();
    markDirty();
  }

  function normalizePortraitLayoutTables() {
    root.querySelectorAll("[data-orte-portrait-layout]").forEach((table) => {
      const allowedCounts = getPortraitLayoutCounts(table);
      if (!allowedCounts.length) return;

      const titleCell = getPortraitLayoutTitleCell(table);
      const legacyCount = Number(titleCell?.dataset?.ortePortraitCount || table.dataset.ortePortraitCount);
      const hasLegacyCount = allowedCounts.includes(legacyCount);
      ensurePortraitRowKeys(table);
      getPortraitLayoutRows(table).forEach((row, rowIndex) => {
        const persistedCount = Number(row.dataset.ortePortraitCount);
        const hasPersistedCount = allowedCounts.includes(persistedCount);
        const targetCount = hasPersistedCount ? persistedCount : hasLegacyCount && rowIndex === 0 ? legacyCount : allowedCounts.at(-1);
        if (applyPortraitColumnCount(table, row, targetCount, { persistChoice: hasPersistedCount || hasLegacyCount && rowIndex === 0 })) {
          syncCourtNameRowToPortraitCount(table, row, targetCount);
        }
      });
      Array.from(table.tBodies[0]?.rows || [])
        .filter((row) => isPortraitGapRow(row, table))
        .forEach((row) => {
          if (row.cells?.length === 1) row.cells[0].colSpan = getPortraitLayoutColumnCount(table);
        });
      if (titleCell) delete titleCell.dataset.ortePortraitCount;
      delete table.dataset.ortePortraitCount;
      updateTableState(table);
    });
  }

  function applyPortraitColumnCount(table, row, count, options = {}) {
    if (!row) return false;
    ensurePortraitRowKeys(table);

    const columnCount = getPortraitLayoutColumnCount(table);
    row.querySelectorAll("[data-orte-portrait-spacer]").forEach((cell) => cell.remove());

    let cells = getPortraitLayoutCells(row);
    while (cells.length > count) {
      const cell = cells.pop();
      cell.remove();
    }

    while (cells.length < count) {
      const source = cells[cells.length - 1] || createPortraitLayoutCell(table);
      const clone = source.cloneNode(true);
      resetClonedTableBlockRow(clone);
      row.append(clone);
      cells = getPortraitLayoutCells(row);
    }

    cells = getPortraitLayoutCells(row);
    cells.forEach((cell, index) => normalizePortraitLayoutCell(cell, index, row));
    distributePortraitCells(row, cells, getPortraitLayoutPositions(count, columnCount, table), columnCount);

    const titleCell = getPortraitLayoutTitleCell(table);
    if (titleCell) titleCell.colSpan = columnCount;

    if (options.persistChoice) row.dataset.ortePortraitCount = String(count);
    else delete row.dataset.ortePortraitCount;
    return true;
  }

  function getPortraitLayoutColumnCount(table) {
    const counts = getPortraitLayoutCounts(table);
    return counts.length ? Math.max(1, counts[counts.length - 1]) : 1;
  }

  function getPortraitLayoutPositions(count, columnCount, table = null) {
    const columns = Math.max(1, Number(columnCount) || 1);
    const amount = Math.max(0, Math.min(columns, Number(count) || 0));
    if (table?.dataset?.ortePortraitFill === "left") {
      return Array.from({ length: amount }, (_, index) => index);
    }
    if (columns === 7) {
      const fixedPositions = {
        0: [],
        1: [3],
        2: [1, 5],
        3: [0, 3, 6],
        4: [0, 2, 4, 6],
        5: [0, 1, 3, 5, 6],
        6: [0, 1, 2, 4, 5, 6],
        7: [0, 1, 2, 3, 4, 5, 6],
      };
      return fixedPositions[amount] || fixedPositions[7];
    }
    if (amount === 0) return [];
    if (amount === 1) return [Math.floor(columns / 2)];
    if (amount === 2) return [0, columns - 1];
    if (amount >= columns) return Array.from({ length: columns }, (_, index) => index);

    const used = new Set();
    return Array.from({ length: amount }, (_, index) => {
      let position = Math.round(index * (columns - 1) / (amount - 1));
      while (used.has(position) && position < columns - 1) position += 1;
      while (used.has(position) && position > 0) position -= 1;
      used.add(position);
      return position;
    }).sort((a, b) => a - b);
  }

  function distributePortraitCells(row, cells, positions, columnCount) {
    const byPosition = new Map(positions.map((position, index) => [position, cells[index]]));
    row.replaceChildren(...Array.from({ length: columnCount }, (_, index) => (
      byPosition.get(index) || createPortraitSpacerCell()
    )));
  }

  function createPortraitSpacerCell() {
    const cell = document.createElement("td");
    cell.className = "orte-portrait-layout-spacer gruppen-portrait-spacer";
    cell.dataset.ortePortraitSpacer = "true";
    cell.innerHTML = "&nbsp;";
    return cell;
  }

  function addPortraitGapRow(table, referenceRow, position = "after") {
    const row = document.createElement("tr");
    row.dataset.ortePortraitGapRow = "true";
    const cell = document.createElement("td");
    cell.className = "orte-portrait-gap-cell gruppen-portrait-gap-cell";
    cell.colSpan = getPortraitLayoutColumnCount(table);
    cell.innerHTML = "&nbsp;";
    row.append(cell);
    referenceRow.insertAdjacentElement(position === "before" ? "beforebegin" : "afterend", row);
  }

  function addGenericEmptyRow(table, referenceRow, position = "after") {
    const row = document.createElement("tr");
    row.dataset.orteGeneratedEmptyRow = "true";
    const cell = document.createElement("td");
    cell.className = getGenericEmptyCellClass(table);
    cell.colSpan = getTableColumnCount(table) || 1;
    cell.innerHTML = "&nbsp;";
    row.append(cell);
    referenceRow.insertAdjacentElement(position === "before" ? "beforebegin" : "afterend", row);
  }

  function getGenericEmptyCellClass(table) {
    if (table.closest(".haeuser-template-frame")) return "haeuser-table-empty-row";
    if (table.closest(".gruppen-template-frame")) return "gruppen-table-empty-row";
    return "orte-table-empty-row";
  }

  function getPortraitLayoutCounts(table) {
    return String(table?.dataset?.ortePortraitLayout || "")
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value, index, values) => Number.isInteger(value) && value >= 0 && values.indexOf(value) === index)
      .sort((a, b) => a - b);
  }

  function getPortraitLayoutRows(table) {
    return Array.from(table?.tBodies?.[0]?.rows || [])
      .filter((row) => isPortraitLayoutRow(row, table));
  }

  function getNearestPortraitLayoutRow(table, referenceRow) {
    const rows = Array.from(table?.tBodies?.[0]?.rows || []);
    const startIndex = rows.indexOf(referenceRow);
    if (startIndex < 0) return getPortraitLayoutRows(table)[0] || null;

    for (let distance = 1; distance < rows.length; distance += 1) {
      const next = rows[startIndex + distance];
      if (isPortraitLayoutRow(next, table)) return next;
      const previous = rows[startIndex - distance];
      if (isPortraitLayoutRow(previous, table)) return previous;
    }
    return null;
  }

  function getPortraitLayoutRowCount(row, table) {
    const allowedCounts = getPortraitLayoutCounts(table);
    const persistedCount = Number(row?.dataset?.ortePortraitCount);
    if (allowedCounts.includes(persistedCount)) return persistedCount;
    const cellCount = getPortraitLayoutCells(row).length;
    return allowedCounts.includes(cellCount) ? cellCount : allowedCounts.at(-1) || Math.max(1, cellCount);
  }

  function getPortraitLayoutCompanionRows(table, row) {
    if (!table?.classList?.contains("haeuser-court-table")) return [row];
    const nameRow = row?.nextElementSibling;
    return isCourtNameRow(nameRow) ? [row, nameRow] : [row];
  }

  function createPortraitLayoutRow(table, count) {
    const row = document.createElement("tr");
    row.dataset.ortePortraitCount = String(count);
    const amount = Math.max(1, Number(count) || 1);
    for (let index = 0; index < amount; index += 1) {
      row.append(createPortraitLayoutCell(table));
    }
    return row;
  }

  function getPortraitLayoutCells(row) {
    const isMarkedCourtPortraitRow = !!row?.closest?.(".haeuser-court-table")
      && (!!row?.dataset?.ortePortraitCount || !!row?.dataset?.ortePortraitRowKey);
    return Array.from(row?.cells || []).filter((cell) => (
      cell.classList.contains("portrait-cell") || cell.classList.contains("gruppen-leader-card")
      || isMarkedCourtPortraitRow && cell.classList.contains("haeuser-court-portrait") && cell.dataset.ortePortraitSpacer !== "true"
    ));
  }

  function isPortraitLayoutRow(row, table) {
    if (!table?.dataset?.ortePortraitLayout) return false;
    if (getPortraitLayoutCells(row).length > 0) return true;
    const persistedCount = Number(row?.dataset?.ortePortraitCount);
    return getPortraitLayoutCounts(table).includes(persistedCount);
  }

  function isPortraitGapRow(row, table) {
    if (!table?.dataset?.ortePortraitLayout) return false;
    if (row?.dataset?.ortePortraitGapRow === "true") return true;
    const cells = Array.from(row?.cells || []);
    if (cells.length !== 1) return false;
    const cell = cells[0];
    if (cell.tagName === "TH") return false;
    if (row.querySelector("[data-orte-image-key], [data-orte-rating-key], img")) return false;
    if (Number(cell.colSpan || 1) < getPortraitLayoutColumnCount(table)) return false;
    return !normalizeWhitespace(cell.textContent);
  }

  function ensurePortraitRowKeys(table) {
    const usedKeys = new Set();
    getPortraitLayoutRows(table).forEach((row, index) => {
      let key = normalizePortraitRowKey(row.dataset.ortePortraitRowKey);
      if (!key || usedKeys.has(key)) {
        key = index === 0 && !usedKeys.has("main") ? "main" : createPortraitRowKey(usedKeys);
      }
      row.dataset.ortePortraitRowKey = key;
      usedKeys.add(key);
    });
  }

  function createPortraitRowKey(usedKeys) {
    for (let index = 1; index < 1000; index += 1) {
      const key = `row-${String(index).padStart(4, "0")}`;
      if (!usedKeys.has(key)) return key;
    }
    return `row-${Date.now()}`;
  }

  function normalizePortraitRowKey(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function getPortraitLayoutTitleCell(table) {
    return Array.from(table?.tBodies?.[0]?.rows || [])
      .map((row) => row.cells?.length === 1 ? row.cells[0] : null)
      .find((cell) => (
        cell?.classList?.contains("gruppen-table-title")
        || cell?.classList?.contains("gruppen-section-row")
        || cell?.classList?.contains("haeuser-court-title")
        || cell?.classList?.contains("haeuser-genealogy-title")
        || cell?.classList?.contains("haeuser-table-primary-heading")
      )) || null;
  }

  function getContiguousTableBlockRows(table, referenceRow) {
    if (!table || !referenceRow?.dataset?.orteTableBlock) return [];

    const rows = Array.from(table.tBodies[0]?.rows || []);
    const startIndex = rows.indexOf(referenceRow);
    if (startIndex < 0) return [];

    const blockId = referenceRow.dataset.orteTableBlock;
    let firstIndex = startIndex;
    let lastIndex = startIndex;

    while (firstIndex > 0 && rows[firstIndex - 1]?.dataset?.orteTableBlock === blockId) {
      firstIndex -= 1;
    }
    while (lastIndex < rows.length - 1 && rows[lastIndex + 1]?.dataset?.orteTableBlock === blockId) {
      lastIndex += 1;
    }

    return rows.slice(firstIndex, lastIndex + 1);
  }

  function isTableBlockStart(row, table) {
    if (!row?.dataset?.orteTableBlock || !table?.tBodies?.[0]) return false;
    const blockRows = getContiguousTableBlockRows(table, row);
    return blockRows[0] === row;
  }

  function getTableBlockStartRows(table) {
    return Array.from(table?.tBodies?.[0]?.rows || [])
      .filter((row) => isTableBlockStart(row, table));
  }

  function getTableBlockType(row) {
    return row?.dataset?.orteTableBlockType || row?.dataset?.orteTableBlock || "";
  }

  function resetTableBlockKeys(rows) {
    const oldToNew = new Map();
    rows.forEach((row) => {
      const oldKey = row.dataset.orteTableBlock;
      if (!oldKey) return;
      if (!oldToNew.has(oldKey)) {
        const blockType = row.dataset.orteTableBlockType || oldKey.replace(/-\d+$/, "");
        oldToNew.set(oldKey, `${blockType}-${Date.now().toString(36)}-${oldToNew.size + 1}`);
      }
      row.dataset.orteTableBlock = oldToNew.get(oldKey);
    });
  }

  function resetClonedTableBlockRow(row) {
    row.querySelectorAll(".orte-table-row-controls").forEach((node) => node.remove());
    row.querySelectorAll(".orte-cell-editable").forEach(unwrapElement);
    row.removeAttribute("data-orte-table-control-key");
    row.querySelectorAll("[contenteditable], [data-orte-inline-text]").forEach((node) => {
      node.removeAttribute("contenteditable");
      node.removeAttribute("data-orte-inline-text");
    });
    row.querySelectorAll("[data-orte-image-key]").forEach((node) => {
      node.removeAttribute("data-orte-image-key");
      node.removeAttribute("data-orte-image-label");
      node.innerHTML = "";
    });
    row.querySelectorAll("[data-orte-rating-key], [data-orte-rating-kind]").forEach((node) => {
      node.removeAttribute("data-orte-rating-key");
      node.removeAttribute("data-orte-rating-kind");
      node.textContent = "...";
    });
    row.querySelectorAll("img").forEach((image) => {
      image.removeAttribute("data-orte-inline-image-key");
      image.setAttribute("src", "");
      image.setAttribute("alt", "Bildplatzhalter");
    });
  }

  function createPortraitLayoutCell(table = null) {
    if (table?.classList?.contains("haeuser-court-table")) {
      const cell = document.createElement("td");
      cell.className = "portrait-cell haeuser-court-portrait";
      cell.innerHTML = `<span class="orte-image-slot haeuser-court-portrait-slot" data-orte-image-format="portrait" data-orte-image-max-height="210"></span>`;
      return cell;
    }

    const cell = document.createElement("td");
    cell.className = "portrait-cell gruppen-leader-card";
    cell.innerHTML = `
      <b data-orte-portrait-field="title">Rolle</b>
      <span class="orte-image-slot gruppen-portrait-slot" data-orte-image-format="portrait" data-orte-image-max-height="360"></span>
      <b data-orte-portrait-field="name">Name / Titel</b>
      <p data-orte-portrait-field="description">Rolle, Rechte, Pflichten und politisches Gewicht.</p>
    `;
    return cell;
  }

  function normalizePortraitLayoutCell(cell, index, row) {
    const table = row?.closest?.("[data-orte-table-id]");
    const isHouseLayout = !!row?.closest?.(".haeuser-genealogy-table");
    const isCourtLayout = !!table?.classList?.contains("haeuser-court-table");
    const rowKey = normalizePortraitRowKey(row?.dataset?.ortePortraitRowKey) || "main";
    const labels = isCourtLayout ? getCourtPortraitLabels(rowKey) : [
      "Führung",
      "Stellvertretung",
      "Rat / Amt",
      "Einsatzleitung",
      "Verwaltung / Chronik"
    ];
    const descriptions = [
      "Rolle, Rechte, Pflichten und politisches Gewicht.",
      "Vertretung, operative Leitung und Aufgabenbereich.",
      "Verwaltung, Ausbildung, Versorgung oder Geheimauftrag.",
      "Feldbefehle, Einsätze, Wachen oder reisende Gruppen.",
      "Archive, Finanzen, Verträge, Versorgung oder Überlieferung."
    ];
    const label = labels[index] || `Position ${index + 1}`;
    const key = isCourtLayout
      ? `hof-${rowKey}-portrait-${String(index + 1).padStart(4, "0")}`
      : rowKey === "main"
      ? `fuehrung-portrait-${String(index + 1).padStart(4, "0")}`
      : `fuehrung-portrait-${rowKey}-${String(index + 1).padStart(2, "0")}`;

    cell.colSpan = 1;
    cell.classList.add("portrait-cell");
    if (isCourtLayout) {
      cell.classList.remove("gruppen-leader-card", "haeuser-genealogy-card");
      cell.classList.add("haeuser-court-portrait");
    } else {
      cell.classList.add("gruppen-leader-card");
    }
    if (isHouseLayout) cell.classList.add("haeuser-genealogy-card");

    let imageSlot = cell.querySelector(".orte-image-slot");
    if (!imageSlot) {
      imageSlot = document.createElement("span");
      imageSlot.className = isCourtLayout ? "orte-image-slot haeuser-court-portrait-slot" : "orte-image-slot gruppen-portrait-slot";
      cell.querySelector("b")?.insertAdjacentElement("afterend", imageSlot);
      if (!imageSlot.parentElement) cell.prepend(imageSlot);
    }

    if (isCourtLayout) imageSlot.classList.add("haeuser-court-portrait-slot");
    else imageSlot.classList.add("gruppen-portrait-slot");
    if (isHouseLayout) imageSlot.classList.add("haeuser-genealogy-portrait-slot");
    imageSlot.dataset.orteImageKey = key;
    imageSlot.dataset.orteImageLabel = `Portrait ${label}`;
    imageSlot.dataset.orteImageFormat = "portrait";
    imageSlot.dataset.orteImageMaxHeight = isCourtLayout ? "210" : "360";
    if (isHouseLayout) imageSlot.dataset.orteImageMaxHeight = "220";
    imageSlot.setAttribute("aria-label", `Portrait ${label}`);

    const bolds = Array.from(cell.querySelectorAll("b"));
    if (bolds[0] && isResetPortraitText(bolds[0].textContent)) bolds[0].textContent = label;
    if (bolds[1] && isResetPortraitText(bolds[1].textContent)) bolds[1].textContent = "Name / Titel";
    if (bolds[0]) bolds[0].dataset.ortePortraitField = "title";
    if (bolds[1]) bolds[1].dataset.ortePortraitField = "name";

    const paragraph = cell.querySelector("p");
    if (paragraph && isResetPortraitText(paragraph.textContent)) {
      paragraph.textContent = descriptions[index] || descriptions[0];
    }
    if (paragraph) paragraph.dataset.ortePortraitField = "description";
  }

  function getCourtPortraitLabels(rowKey) {
    if (rowKey === "oberhaupt") {
      return [
        "Oberhaupt",
        "Stellvertretung",
        "Hausrat",
        "Waffenfuehrung",
        "Position 5",
        "Position 6",
        "Position 7"
      ];
    }
    if (rowKey === "erbfolge") {
      return [
        "Erbfolge 1",
        "Erbfolge 2",
        "Erbfolge 3",
        "Erbfolge 4",
        "Erbfolge 5",
        "Erbfolge 6",
        "Erbfolge 7"
      ];
    }
    return [
      "Position 1",
      "Position 2",
      "Position 3",
      "Position 4",
      "Position 5",
      "Position 6",
      "Position 7"
    ];
  }

  function syncCourtNameRowToPortraitCount(table, portraitRow, count) {
    if (!table?.classList?.contains("haeuser-court-table")) return;

    const nameRow = portraitRow?.nextElementSibling;
    if (!isCourtNameRow(nameRow)) return;

    const columnCount = getPortraitLayoutColumnCount(table);
    while (nameRow.cells.length < columnCount) {
      nameRow.append(createCourtNameCell());
    }
    while (nameRow.cells.length > columnCount) {
      nameRow.deleteCell(nameRow.cells.length - 1);
    }

    const rowKey = normalizePortraitRowKey(portraitRow?.dataset?.ortePortraitRowKey);
    Array.from(nameRow.cells || []).forEach((cell, index) => {
      cell.colSpan = 1;
      cell.classList.add("haeuser-court-name");
      if (index >= count) {
        cell.innerHTML = "&nbsp;";
        return;
      }
      if (!normalizeWhitespace(cell.textContent)) {
        cell.innerHTML = getDefaultCourtNameHtml(rowKey);
      }
    });
  }

  function isCourtNameRow(row) {
    const cells = Array.from(row?.cells || []);
    return cells.length > 0 && cells.every((cell) => cell.classList.contains("haeuser-court-name"));
  }

  function createCourtNameCell() {
    const cell = document.createElement("td");
    cell.className = "haeuser-court-name";
    cell.innerHTML = "&nbsp;";
    return cell;
  }

  function getDefaultCourtNameHtml(rowKey) {
    return rowKey === "oberhaupt" ? "<b>&dagger; ??? &dagger;</b><br><b>(???? - ????)</b>" : "<b>??</b>";
  }

  function isResetPortraitText(text) {
    const value = normalizeWhitespace(text);
    return !value || value === "...." || value === "Rolle" || value === "Name" || value === "Name / Titel";
  }

  function addGenericHeadingRow(table, referenceRow = null, position = "after", headingLevel = "primary") {
    const tbody = table.tBodies[0];
    if (!tbody) return;

    const row = document.createElement("tr");
    row.dataset.orteGeneratedHeadingRow = "true";
    row.dataset.orteHeadingLevel = headingLevel === "secondary" ? "secondary" : "primary";
    const cell = document.createElement("td");
    cell.colSpan = getTableColumnCount(table) || 1;
    cell.className = getGenericHeadingCellClass(table, row.dataset.orteHeadingLevel);
    cell.innerHTML = "<b>Neue Überschrift</b>";
    applyHeadingColorToCell(cell, getDefaultHeadingColor(table, row.dataset.orteHeadingLevel));
    cell.innerHTML = row.dataset.orteHeadingLevel === "secondary" ? "<b>Neue Unterueberschrift</b>" : "<b>Neue Ueberschrift</b>";
    row.append(cell);

    const target = referenceRow || Array.from(tbody.rows).at(-1);
    if (target) {
      target.insertAdjacentElement(position === "before" ? "beforebegin" : "afterend", row);
    } else {
      tbody.append(row);
    }
  }

  function addGenericTableRow(table, referenceRow = null, position = "after") {
    const tbody = table.tBodies[0];
    const candidate = getCloneSourceRow(table, referenceRow, position)
      || Array.from(tbody.rows).reverse().find((row) => isCloneableDataRow(row, table));
    if (!candidate) return;

    const clone = candidate.cloneNode(true);
    resetClonedFragment(clone);
    const target = referenceRow || candidate;
    target.insertAdjacentElement(position === "before" ? "beforebegin" : "afterend", clone);
  }

  function addPersonalityRows(table, referenceRow = null, position = "after") {
    const tbody = table.tBodies[0];
    const groups = getPersonalityGroups(table);
    const group = getPersonalityGroupForRow(table, referenceRow) || groups[groups.length - 1];
    if (!group?.length) return;

    const clones = group.map((row) => {
      const clone = row.cloneNode(true);
      resetClonedFragment(clone);
      return clone;
    });
    if (position === "before") {
      group[0].before(...clones);
    } else {
      group[group.length - 1].after(...clones);
    }
  }

  function addPersonalityDividerRow(referenceRow, position = "after", headingLevel = "primary") {
    if (!isPersonalityDividerRow(referenceRow)) return;
    const clone = referenceRow.cloneNode(true);
    resetPersonalityDividerRow(clone, headingLevel);
    referenceRow.insertAdjacentElement(position === "before" ? "beforebegin" : "afterend", clone);
  }

  function insertPersonalityDividerNear(table, row, position = "after", headingLevel = "primary") {
    const source = isPersonalityDividerRow(row)
      ? row
      : Array.from(table?.tBodies?.[0]?.rows || []).find(isPersonalityDividerRow);
    if (!source || !row) return;

    const group = getPersonalityGroupForRow(table, row);
    const target = group?.length
      ? (position === "before" ? group[0] : group[group.length - 1])
      : row;
    if (!target) return;

    const clone = source.cloneNode(true);
    resetPersonalityDividerRow(clone, headingLevel);
    target.insertAdjacentElement(position === "before" ? "beforebegin" : "afterend", clone);
  }

  function insertTableBlockNear(button, position = "after") {
    const table = root.querySelector(`[data-orte-table-id="${cssEscape(button.dataset.orteTableTarget)}"]`);
    if (!table) return;

    const row = getTableRowByIndex(table, button.dataset.orteTableRowIndex);
    const blockRows = getContiguousTableBlockRows(table, row);
    if (!blockRows.length) return;

    const clones = blockRows.map((blockRow) => {
      const clone = blockRow.cloneNode(true);
      resetClonedFragment(clone);
      return clone;
    });
    resetTableBlockKeys(clones);

    if (position === "before") {
      blockRows[0].before(...clones);
    } else {
      blockRows[blockRows.length - 1].after(...clones);
    }
    updateTableState(table);
    refreshTableControls();
  }

  function moveTableRowNear(button, direction) {
    const table = root.querySelector(`[data-orte-table-id="${cssEscape(button.dataset.orteTableTarget)}"]`);
    if (!table) return;

    const row = getTableRowByIndex(table, button.dataset.orteTableRowIndex);
    if (!row) return;

    const movingRows = getMovableTableRows(table, row);
    if (!movingRows.length) return;

    const adjacentRows = getAdjacentMovableTableRows(table, movingRows, direction);
    if (!adjacentRows.length) return;

    const movingParent = movingRows[0].parentElement;
    if (!movingParent || adjacentRows.some((adjacentRow) => adjacentRow.parentElement !== movingParent)) return;

    if (direction === "up") adjacentRows[0].before(...movingRows);
    else adjacentRows[adjacentRows.length - 1].after(...movingRows);

    updateTableState(table);
    rebuildTargets();
    markDirty();
  }

  function getMovableTableRows(table, row) {
    if (table.classList.contains("pt-s-0067")) {
      const group = getPersonalityGroupForRow(table, row);
      if (group?.length) return group;
      return [row];
    }
    if (isPortraitLayoutRow(row, table)) return getPortraitLayoutCompanionRows(table, row);
    if (row?.dataset?.orteTableBlock) return getContiguousTableBlockRows(table, row);
    return [row];
  }

  function getAdjacentMovableTableRows(table, movingRows, direction) {
    const first = movingRows[0];
    const last = movingRows[movingRows.length - 1];
    let adjacentRow = direction === "up" ? first.previousElementSibling : last.nextElementSibling;
    const bridgeRows = [];

    while (adjacentRow && isSkippableMoveSpacer(table, adjacentRow)) {
      bridgeRows.push(adjacentRow);
      adjacentRow = direction === "up" ? adjacentRow.previousElementSibling : adjacentRow.nextElementSibling;
    }

    if (!adjacentRow) return direction === "up" ? bridgeRows.reverse() : bridgeRows;

    const adjacentRows = getMovableTableRows(table, adjacentRow);
    const movableAdjacentRows = adjacentRows.length ? adjacentRows : [adjacentRow];
    return direction === "up"
      ? [...movableAdjacentRows, ...bridgeRows.reverse()]
      : [...bridgeRows, ...movableAdjacentRows];
  }

  function isSkippableMoveSpacer(table, row) {
    if (!row) return false;
    if (table?.classList?.contains("pt-s-0067")) return isPersonalitySpacerRow(row);
    if (table?.dataset?.ortePortraitLayout && isPortraitGapRow(row, table)) return true;
    return isGenericEmptySpacerRow(row, table);
  }

  function isGenericEmptySpacerRow(row, table) {
    const cells = Array.from(row?.cells || []);
    if (cells.length !== 1) return false;
    const cell = cells[0];
    if (cell.tagName === "TH") return false;
    if (row.querySelector("[data-orte-image-key], [data-orte-rating-key], img")) return false;
    if (Number(cell.colSpan || 1) < (getTableColumnCount(table) || 1)) return false;
    return !normalizeWhitespace(cell.textContent);
  }

  function toggleTableRowControls(button) {
    const controls = button.closest(".orte-table-row-controls");
    if (!controls) return;
    const controlKey = controls.dataset.orteTableControlKey || "";
    const expanded = !controls.classList.contains("is-expanded");
    controls.classList.toggle("is-expanded", expanded);
    button.setAttribute("aria-expanded", String(expanded));
    if (controlKey) {
      if (expanded) expandedTableControlKeys.add(controlKey);
      else expandedTableControlKeys.delete(controlKey);
    }
  }

  function removeTableBlockNear(button) {
    const table = root.querySelector(`[data-orte-table-id="${cssEscape(button.dataset.orteTableTarget)}"]`);
    if (!table) return;

    const row = getTableRowByIndex(table, button.dataset.orteTableRowIndex);
    const blockRows = getContiguousTableBlockRows(table, row);
    if (!blockRows.length) return;

    const blockType = getTableBlockType(row);
    const blockCount = getTableBlockStartRows(table)
      .filter((candidate) => getTableBlockType(candidate) === blockType)
      .length;
    if (blockCount <= 1) return;

    blockRows.forEach((blockRow) => blockRow.remove());
    updateTableState(table);
    refreshTableControls();
  }

  function removeGenericTableRow(table, row) {
    const cloneableRows = Array.from(table.tBodies[0]?.rows || []).filter((candidate) => isCloneableDataRow(candidate, table));
    if (cloneableRows.length <= 1 || !isCloneableDataRow(row, table)) return;
    row.remove();
  }

  function removeGenericHeadingRow(table, row) {
    const headingRows = Array.from(table.tBodies[0]?.rows || []).filter((candidate) => isGenericHeadingRow(candidate, table));
    if (headingRows.length <= 1 && row.dataset.orteGeneratedHeadingRow !== "true") return;
    row.remove();
  }

  function removePersonalityRows(table, row) {
    const groups = getPersonalityGroups(table);
    const group = getPersonalityGroupForRow(table, row);
    if (groups.length <= 1 || !group?.length) return;
    group.forEach((groupRow) => groupRow.remove());
  }

  function removePersonalityDividerRow(table, row) {
    const dividerRows = Array.from(table.tBodies[0]?.rows || []).filter(isPersonalityDividerRow);
    if (dividerRows.length <= 1 || !isPersonalityDividerRow(row)) return;
    row.remove();
  }

  function removePortraitLayoutRow(table, row) {
    const portraitRows = getPortraitLayoutRows(table);
    if (portraitRows.length <= 1 || !isPortraitLayoutRow(row, table)) return;
    getPortraitLayoutCompanionRows(table, row).reverse().forEach((item) => item.remove());
  }

  function renderRowControls(table, tableId, activeControlKeys = null) {
    const rows = Array.from(table.tBodies[0]?.rows || []);
    rows.forEach((row, index) => {
      const isPortraitRow = isPortraitLayoutRow(row, table);
      const isPortraitGap = isPortraitGapRow(row, table);
      const isTableBlock = isTableBlockStart(row, table);
      const canControl = table.classList.contains("pt-s-0067")
        ? isPersonalityGroupStart(row) || isPersonalityDividerRow(row)
        : isTableBlock || isPortraitRow || isPortraitGap || isCloneableDataRow(row, table) || isGenericHeadingRow(row, table);
      if (!canControl) return;

      const cell = row.cells?.[0];
      if (!cell) return;
      cell.classList.add("orte-table-control-cell");
      const controls = document.createElement("span");
      const controlKey = getTableControlKey(tableId, row);
      activeControlKeys?.add(controlKey);
      const isExpanded = expandedTableControlKeys.has(controlKey);
      const isPersonalityTable = table.classList.contains("pt-s-0067");
      const isDividerRow = isPersonalityDividerRow(row);
      const isHeadingRow = !isPersonalityTable && isGenericHeadingRow(row, table);
      controls.className = [
        "orte-table-row-controls",
        isPersonalityTable ? "is-personality-row-control" : "",
        isTableBlock ? "is-table-block-row-control" : "",
        isPortraitRow ? "is-portrait-layout-row-control" : "",
        isPortraitGap ? "is-portrait-gap-row-control" : "",
        isDividerRow || isHeadingRow || isPortraitGap || isTableBlock ? "is-divider-row-control" : ""
      ].filter(Boolean).join(" ");
      controls.innerHTML = isPersonalityTable
        ? `
          <button type="button" data-action="insert-orte-table-row-after" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="${isDividerRow ? "Zwischenzeile danach einfügen" : "Person danach einfügen"}">${isDividerRow ? "+ Zwischenzeile" : "+ Person"}</button>
          <button type="button" data-action="remove-orte-table-row" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="${isDividerRow ? "Zwischenzeile entfernen" : "Person entfernen"}">-</button>
        `
        : isTableBlock
          ? `
            <button type="button" data-action="insert-orte-table-block-after" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Komplette Sektion danach einfÃ¼gen">+ Sektion</button>
            <button type="button" data-action="insert-orte-table-heading-row-after" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Ãœberschrift danach einfÃ¼gen">+ Ãœberschrift</button>
            <button type="button" data-action="remove-orte-table-block" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Komplette Sektion entfernen">- Sektion</button>
          `
        : isHeadingRow
          ? `
            <button type="button" data-action="insert-orte-table-heading-row-after" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Überschrift danach einfügen">+ Überschrift</button>
            <label class="orte-table-heading-color-tool" title="Überschriftsfarbe">
              <input type="color" value="${escapeAttr(getHeadingColorValue(row, table))}" data-orte-table-heading-color data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}">
            </label>
            <button type="button" data-action="pick-orte-table-heading-color" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Farbe mit Pipette aufnehmen">Pipette</button>
            <button type="button" data-action="remove-orte-table-row" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Überschrift entfernen">-</button>
          `
        : isPortraitRow
          ? `
            <button type="button" data-action="insert-orte-table-row-before" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Portraitzeile davor einfügen">+ davor</button>
            <button type="button" data-action="insert-orte-table-row-after" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Portraitzeile danach einfügen">+ danach</button>
            <button type="button" data-action="insert-orte-table-empty-row-after" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Leerzeile danach einfügen">+ Leerzeile</button>
            ${renderPortraitLayoutControls(table, tableId, index)}
            <button type="button" data-action="remove-orte-table-row" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Portraitzeile entfernen">-</button>
          `
        : isPortraitGap
          ? `
            <button type="button" data-action="insert-orte-table-row-after" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Portraitzeile danach einfügen">+ Portrait</button>
            <button type="button" data-action="insert-orte-table-empty-row-after" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Weitere Leerzeile danach einfügen">+ Leerzeile</button>
            <button type="button" data-action="remove-orte-table-row" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Leerzeile entfernen">-</button>
          `
        : `
          <button type="button" data-action="insert-orte-table-row-before" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Zeile davor einfügen">+</button>
          <button type="button" data-action="insert-orte-table-row-after" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Zeile danach einfügen">+</button>
          <button type="button" data-action="insert-orte-table-heading-row-after" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Überschrift danach einfügen">H</button>
          <button type="button" data-action="remove-orte-table-row" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Zeile entfernen">-</button>
        `;
      insertPersonalityEmptyRowControl(controls, isPersonalityTable, tableId, index);
      insertPortraitRowControl(controls, table, tableId, index);
      insertRowHeadingControls(controls, tableId, index, controlKey, isExpanded);
      cell.prepend(controls);
      placeTableRowControlsOutsideFrame(controls, cell, table);
    });
  }

  function placeTableRowControlsOutsideFrame(controls, cell, table) {
    const frame = getTableControlFrame(table);
    if (!frame || !controls || !cell) return;

    const frameRect = frame.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    if (!Number.isFinite(frameRect.left) || !Number.isFinite(cellRect.left)) return;

    controls.classList.add("is-frame-external-control");
    controls.style.setProperty("--orte-row-control-frame-offset-x", `${frameRect.left - cellRect.left}px`);
  }

  function getTableControlFrame(table) {
    return table?.closest?.(".haeuser-template-frame, .gruppen-template-frame, .grossstadt-template-frame, .kingdom-frame") || null;
  }

  function scheduleTableRowControlReposition() {
    if (!editMode) return;
    window.clearTimeout(rowControlPositionTimer);
    rowControlPositionTimer = window.setTimeout(repositionTableRowControls, 120);
  }

  function repositionTableRowControls() {
    document.querySelectorAll(".orte-table-row-controls.is-frame-external-control").forEach((controls) => {
      const cell = controls.closest("td, th");
      const table = cell?.closest?.("[data-orte-table-id]");
      if (cell && table) placeTableRowControlsOutsideFrame(controls, cell, table);
    });
  }

  function getTableControlKey(tableId, row) {
    return `${tableId}:${ensureTableRowControlKey(row)}`;
  }

  function ensureTableRowControlKey(row) {
    if (!row) return "missing";
    const normalized = normalizePortraitRowKey(row.dataset.orteTableControlKey);
    if (normalized) {
      row.dataset.orteTableControlKey = normalized;
      return normalized;
    }

    const key = `control-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    row.dataset.orteTableControlKey = key;
    return key;
  }

  function getTableRowByIndex(table, index) {
    const rows = Array.from(table.tBodies[0]?.rows || []);
    const number = Number(index);
    return Number.isInteger(number) ? rows[number] || null : null;
  }

  function isPersonalityGroupStart(row) {
    return !!row?.querySelector?.(".pt-s-0077");
  }

  function isPersonalityDividerRow(row) {
    const cells = Array.from(row?.cells || []);
    if (cells.length !== 1) return false;
    const cell = cells[0];
    if (cell.tagName === "TH") return false;
    if (Number(cell.colSpan || 1) < 4) return false;
    if (row.querySelector("[data-orte-image-key], img, .pt-s-0077")) return false;
    if (cell.matches(".pt-s-0069, .pt-s-0073, .pt-s-0081, .pt-s-0082, .pt-s-0083")) return false;
    return !!normalizeWhitespace(cell.textContent);
  }

  function isGenericHeadingRow(row, table) {
    const cells = Array.from(row?.cells || []);
    if (cells.length !== 1) return false;
    const cell = cells[0];
    if (cell.tagName === "TH") return false;
    if (row.querySelector("[data-orte-image-key], [data-orte-rating-key], img")) return false;
    const tableWidth = getTableColumnCount(table) || 1;
    if (Number(cell.colSpan || 1) < tableWidth) return false;
    return row.dataset.orteGeneratedHeadingRow === "true"
      || cell.classList.contains("gruppen-section-row")
      || cell.classList.contains("haeuser-table-primary-heading")
      || cell.classList.contains("haeuser-table-secondary-heading")
      || cell.classList.contains("haeuser-genealogy-heading")
      || cell.classList.contains("sub-header")
      || (!!table?.closest?.(".kingdom-frame") && !!normalizeWhitespace(cell.textContent));
  }

  function getGenericHeadingCellClass(table, headingLevel = "primary") {
    if (table.closest(".haeuser-template-frame")) {
      return headingLevel === "secondary" ? "haeuser-table-secondary-heading" : "haeuser-table-primary-heading";
    }
    if (table.closest(".gruppen-template-frame")) return headingLevel === "secondary" ? "sub-header" : "gruppen-section-row";
    if (table.closest(".kingdom-frame")) return "kingdom-section-row";
    return "sub-header";
  }

  function getDefaultHeadingColor(table, headingLevel = "primary") {
    if (table.closest(".haeuser-template-frame")) return headingLevel === "secondary" ? "#b98f42" : "#7f5a24";
    return table.closest(".gruppen-template-frame") ? "#755420" : "#755420";
  }

  function getHeadingColorValue(row, table) {
    const cell = row?.cells?.[0];
    return normalizeHexColor(cell?.dataset?.orteHeadingColor)
      || normalizeCssColor(cell?.style?.backgroundColor)
      || getDefaultHeadingColor(table, row?.dataset?.orteHeadingLevel);
  }

  function updateTableHeadingColor(input, color) {
    const table = root.querySelector(`[data-orte-table-id="${cssEscape(input.dataset.orteTableTarget)}"]`);
    if (!table) return;

    const row = getTableRowByIndex(table, input.dataset.orteTableRowIndex);
    const cell = row?.cells?.[0];
    if (!cell || !isGenericHeadingRow(row, table)) return;

    applyHeadingColorToCell(cell, color);
    updateTableState(table);
    markDirty();
  }

  async function pickTableHeadingColor(button) {
    const table = root.querySelector(`[data-orte-table-id="${cssEscape(button.dataset.orteTableTarget)}"]`);
    if (!table) return;

    const row = getTableRowByIndex(table, button.dataset.orteTableRowIndex);
    if (!row || !isGenericHeadingRow(row, table)) return;

    const input = row.querySelector("[data-orte-table-heading-color]");
    let color = "";

    if (window.EyeDropper) {
      try {
        const result = await new window.EyeDropper().open();
        color = result?.sRGBHex || "";
      } catch (error) {
        return;
      }
    } else {
      input?.click();
      return;
    }

    if (!normalizeHexColor(color)) return;
    if (input) input.value = color;
    updateTableHeadingColor(button, color);
  }

  function applyHeadingColorToCell(cell, color) {
    const normalized = normalizeHexColor(color) || "#755420";
    cell.dataset.orteHeadingColor = normalized;
    cell.style.background = normalized;
    cell.style.color = getReadableTextColor(normalized);
  }

  function getReadableTextColor(hex) {
    const normalized = normalizeHexColor(hex);
    if (!normalized) return "#fff2cf";
    const red = parseInt(normalized.slice(1, 3), 16) / 255;
    const green = parseInt(normalized.slice(3, 5), 16) / 255;
    const blue = parseInt(normalized.slice(5, 7), 16) / 255;
    const luminance = 0.2126 * linearizeColor(red) + 0.7152 * linearizeColor(green) + 0.0722 * linearizeColor(blue);
    return luminance > 0.46 ? "#25190d" : "#fff2cf";
  }

  function linearizeColor(value) {
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }

  function normalizeHexColor(color) {
    const value = String(color || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(value)) return value.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(value)) {
      return `#${value.slice(1).split("").map((char) => `${char}${char}`).join("")}`.toLowerCase();
    }
    return "";
  }

  function normalizeCssColor(color) {
    const value = String(color || "").trim();
    const hex = normalizeHexColor(value);
    if (hex) return hex;

    const match = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!match) return "";
    return `#${[match[1], match[2], match[3]].map((part) => {
      const number = Math.max(0, Math.min(255, Number(part) || 0));
      return number.toString(16).padStart(2, "0");
    }).join("")}`;
  }

  function getPersonalityGroups(table) {
    const rows = Array.from(table.tBodies[0]?.rows || []);
    return rows
      .map((row, index) => isPersonalityGroupStart(row) ? getPersonalityGroupRows(rows, index) : null)
      .filter((group) => group?.length);
  }

  function getPersonalityGroupForRow(table, row) {
    if (!row) return null;
    return getPersonalityGroups(table).find((group) => group.includes(row)) || null;
  }

  function getPersonalityGroupRows(rows, startIndex) {
    const group = rows.slice(startIndex, startIndex + 3);
    if (group.length < 3) return [];
    const spacer = rows[startIndex + 3];
    if (isPersonalitySpacerRow(spacer)) group.push(spacer);
    return group;
  }

  function isPersonalitySpacerRow(row) {
    const cells = Array.from(row?.cells || []);
    if (cells.length !== 1) return false;
    const cell = cells[0];
    if (cell.tagName === "TH") return false;
    if (Number(cell.colSpan || 1) < 4) return false;
    if (row.querySelector("[data-orte-image-key], img, .pt-s-0077")) return false;
    return !normalizeWhitespace(cell.textContent);
  }

  function isCloneableDataRow(row, table) {
    const cells = Array.from(row.cells || []);
    if (cells.length <= 1) return false;
    if (row.querySelector("th")) return false;
    if (cells.some((cell) => Number(cell.rowSpan || 1) > 1)) return false;
    if (table?.classList?.contains("pt-s-0040") && !cells[0]?.querySelector("[data-orte-image-key]")) return false;
    const tableWidth = getTableColumnCount(table) || cells.length;
    const columnSpanTotal = cells.reduce((sum, cell) => sum + Number(cell.colSpan || 1), 0);
    if (cells.length === 1 && columnSpanTotal >= tableWidth) return false;
    return columnSpanTotal <= tableWidth;
  }

  function getTableColumnCount(table) {
    return Math.max(0, ...Array.from(table?.rows || []).map((row) => (
      Array.from(row.cells || []).reduce((sum, cell) => sum + Number(cell.colSpan || 1), 0)
    )));
  }

  function getCloneSourceRow(table, referenceRow, position) {
    if (!referenceRow) return null;
    if (isCloneableDataRow(referenceRow, table)) return referenceRow;

    const rows = Array.from(table.tBodies[0]?.rows || []);
    const startIndex = rows.indexOf(referenceRow);
    if (startIndex < 0) return null;

    const step = position === "before" ? -1 : 1;
    for (let index = startIndex + step; index >= 0 && index < rows.length; index += step) {
      if (isCloneableDataRow(rows[index], table)) return rows[index];
    }
    return null;
  }

  function removeInlineEditorControls() {
    document.querySelectorAll(".orte-table-add-control, .orte-table-row-controls").forEach((control) => control.remove());
  }

  function resetClonedFragment(fragment) {
    fragment.querySelectorAll(".orte-table-row-controls").forEach((node) => node.remove());
    fragment.querySelectorAll(".orte-cell-editable").forEach(unwrapElement);
    if (fragment instanceof Element) fragment.removeAttribute("data-orte-table-control-key");
    fragment.querySelectorAll("[data-orte-table-control-key]").forEach((node) => node.removeAttribute("data-orte-table-control-key"));
    fragment.querySelectorAll("[contenteditable], [data-orte-inline-text]").forEach((node) => {
      node.removeAttribute("contenteditable");
      node.removeAttribute("data-orte-inline-text");
    });
    fragment.querySelectorAll("[data-orte-image-key]").forEach((node) => {
      node.removeAttribute("data-orte-image-key");
      node.removeAttribute("data-orte-image-label");
      node.innerHTML = "";
    });
    fragment.querySelectorAll("[data-orte-rating-key], [data-orte-rating-kind]").forEach((node) => {
      node.removeAttribute("data-orte-rating-key");
      node.removeAttribute("data-orte-rating-kind");
      node.textContent = "...";
    });
    fragment.querySelectorAll("img").forEach((image) => {
      image.removeAttribute("data-orte-inline-image-key");
      image.setAttribute("src", "");
      image.setAttribute("alt", "Bildplatzhalter");
    });
    getTextLeaves(fragment).forEach((node) => {
      if (node.closest("[data-orte-image-key], [data-orte-rating-key]")) return;
      if (normalizeWhitespace(node.textContent)) node.textContent = getResetText(node);
    });
  }

  function getTextLeaves(fragment) {
    return Array.from(fragment.querySelectorAll("p, td, th, span, b, strong, i, li"))
      .filter((node) => !node.querySelector("p, td, th, span, b, strong, i, li, [data-orte-image-key], [data-orte-rating-key]"));
  }

  function getResetText(node) {
    const cell = node.closest("td, th");
    if (cell?.classList.contains("pt-s-0076")) return "Rolle";
    if (cell?.classList.contains("pt-s-0080")) return "Name";
    return "....";
  }

  function resetPersonalityDividerRow(row, headingLevel = "primary") {
    row.querySelectorAll(".orte-table-row-controls").forEach((node) => node.remove());
    row.querySelectorAll("[contenteditable], [data-orte-inline-text]").forEach((node) => {
      node.removeAttribute("contenteditable");
      node.removeAttribute("data-orte-inline-text");
    });

    const cell = row.cells?.[0];
    row.dataset.orteHeadingLevel = headingLevel === "secondary" ? "secondary" : "primary";
    const label = cell?.querySelector("b, strong") || cell;
    if (label) label.textContent = row.dataset.orteHeadingLevel === "secondary" ? "Neue Unterueberschrift" : "Neue Ueberschrift";
  }

  function applyPayload(payload, options = {}) {
    if (!payload) return;
    if (!isCompatiblePayload(payload)) {
      setStatus("alte Inline-Daten ignoriert");
      return;
    }

    state.meta = normalizeDocumentMeta(payload.meta);
    state.hiddenSections = normalizeHiddenSections(payload.hiddenSections);

    if (!options.skipTables && payload.tables) {
      applyTablePayload(payload.tables);
      rebuildTargets();
    }

    Object.entries(payload.texts || {}).forEach(([id, html]) => {
      const item = textItems.find((entry) => entry.id === id);
      if (!item || item.inTable) return;
      state.texts[id] = sanitizePastedHtml(html || "");
      item.node.innerHTML = state.texts[id];
      sanitizeEditableNode(item.node);
    });

    Object.entries(payload.images || {}).forEach(([key, image]) => {
      const item = imageItems.find((entry) => entry.key === key);
      state.images[key] = mergeIncomingImageState(state.images[key], image, item?.label || key);
    });

    Object.entries(payload.ratings || {}).forEach(([key, value]) => {
      state.ratings[key] = clampRating(value);
    });

    renderImageSlots();
    renderRatings();
    applySectionVisibility();
    renderSectionControls();
    updateDocumentStatusControls();
  }

  function applyTablePayload(tables) {
    if (!tables || typeof tables !== "object") return;
    Object.entries(tables).forEach(([id, html]) => {
      const table = root.querySelector(`[data-orte-table-id="${cssEscape(id)}"]`);
      if (table?.tBodies[0]) {
        table.tBodies[0].innerHTML = String(html || "");
        sanitizeLoadedTable(table);
      }
    });
  }

  function updateOwningTable(node) {
    const table = node?.closest?.("[data-orte-table-id]");
    if (table) updateTableState(table);
  }

  function persistEditable(editable) {
    if (!editable?.dataset?.orteInlineText) return;
    sanitizeEditableNode(editable);
    if (editable.closest("[data-orte-table-id]")) {
      updateOwningTable(editable);
      return;
    }
    state.texts[editable.dataset.orteInlineText] = editable.innerHTML;
  }

  function updateTableState(table) {
    const id = table?.dataset?.orteTableId;
    if (!id) return;
    state.tables[id] = getTableHtml(table);
  }

  function sanitizeEditableNode(editable, options = {}) {
    if (!editable) return;
    if (!options.allowDetached && !root.contains(editable)) return;

    editable.querySelectorAll([
      "script",
      "style",
      "link",
      "meta",
      "iframe",
      "form",
      "input",
      "button",
      "textarea",
      "select",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "td",
      "th",
      "details",
      "summary",
      "section",
      "article",
      "main",
      "header",
      "footer",
      "aside",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hr"
    ].join(",")).forEach((node) => {
      node.replaceWith(document.createTextNode(normalizeWhitespace(node.textContent)));
    });

    editable.querySelectorAll("div, p").forEach((block) => {
      const fragment = document.createDocumentFragment();
      while (block.firstChild) fragment.appendChild(block.firstChild);
      fragment.appendChild(document.createElement("br"));
      block.replaceWith(fragment);
    });
  }

  function sanitizePastedHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = String(html || "");
    const container = document.createElement("span");
    container.append(template.content.cloneNode(true));
    sanitizeEditableNode(container, { allowDetached: true });
    return container.innerHTML;
  }

  function escapePlainTextForPaste(text) {
    return escapeHtml(String(text || ""))
      .replace(/\t/g, " ")
      .replace(/\r\n?/g, "\n")
      .replace(/\n/g, "<br>");
  }

  function sanitizeLoadedTable(table) {
    table.querySelectorAll(".orte-table-row-controls, .orte-table-add-control, .table-editor-toolbar").forEach((node) => node.remove());
    table.querySelectorAll(".table-editor-active-cell, .table-editor-active-table").forEach((node) => {
      node.classList.remove("table-editor-active-cell", "table-editor-active-table");
    });
    table.querySelectorAll("[data-table-editor-cell]").forEach((node) => {
      node.removeAttribute("data-table-editor-cell");
    });
    table.querySelectorAll(".orte-cell-editable").forEach(unwrapElement);
    table.querySelectorAll("td, th").forEach((cell) => sanitizeEditableNode(cell));
  }

  function getTableHtml(table) {
    const tbody = table.tBodies[0];
    if (!tbody) return "";
    const clone = tbody.cloneNode(true);
    clone.querySelectorAll("[contenteditable], [data-orte-inline-text]").forEach((node) => {
      node.removeAttribute("contenteditable");
      node.removeAttribute("data-orte-inline-text");
    });
    clone.querySelectorAll(".orte-cell-editable").forEach(unwrapElement);
    clone.querySelectorAll(".orte-inline-image-panel, .orte-table-add-control, .orte-table-row-controls, .orte-inline-image-hint, .orte-image-placeholder-media, .table-editor-toolbar").forEach((node) => node.remove());
    clone.querySelectorAll(".table-editor-active-cell, .table-editor-active-table").forEach((node) => {
      node.classList.remove("table-editor-active-cell", "table-editor-active-table");
    });
    clone.querySelectorAll("[data-table-editor-cell]").forEach((node) => {
      node.removeAttribute("data-table-editor-cell");
    });
    clone.querySelectorAll("[data-orte-rating-key]").forEach((node) => {
      const key = node.dataset.orteRatingKey;
      const kind = node.dataset.orteRatingKind || "stern";
      const value = clampRating(state.ratings[key] || node.dataset.orteRatingValue);
      node.dataset.orteRatingValue = String(value);
      node.innerHTML = `<b><span class="orte-rating-display">${formatRating(value, kind)}</span></b>`;
    });
    return clone.innerHTML;
  }

  function resetHistoryToCurrent() {
    const payload = clonePayload();
    history.undo = [payload];
    history.redo = [];
    history.lastSignature = payloadSignature(payload);
    updateHistoryButtons();
  }

  function captureHistorySnapshot() {
    if (history.applying) return;
    const payload = clonePayload();
    const signature = payloadSignature(payload);
    if (signature === history.lastSignature) {
      updateHistoryButtons();
      return;
    }

    history.undo.push(payload);
    if (history.undo.length > history.maxEntries) history.undo.shift();
    history.redo = [];
    history.lastSignature = signature;
    updateHistoryButtons();
  }

  function undoInlineChange() {
    if (history.undo.length <= 1) return;
    const current = history.undo.pop();
    history.redo.push(current);
    applyHistoryPayload(history.undo[history.undo.length - 1], "Änderung zurück");
  }

  function redoInlineChange() {
    if (!history.redo.length) return;
    const next = history.redo.pop();
    history.undo.push(next);
    if (history.undo.length > history.maxEntries) history.undo.shift();
    applyHistoryPayload(next, "Änderung vor");
  }

  function applyHistoryPayload(payload, statusText) {
    if (!isCompatiblePayload(payload)) return;
    history.applying = true;
    closeImagePanel();
    applyPayload(payload);
    saveLocal(payload);
    dirty = true;
    history.lastSignature = payloadSignature(payload);
    history.applying = false;
    updateHistoryButtons();
    setStatus(statusText, "warning");
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveNow, 800);
  }

  function updateHistoryButtons() {
    const undoButton = document.querySelector("[data-orte-history-action='undo']");
    const redoButton = document.querySelector("[data-orte-history-action='redo']");
    if (undoButton) undoButton.disabled = history.undo.length <= 1;
    if (redoButton) redoButton.disabled = history.redo.length <= 0;
  }

  function markDirty() {
    dirty = true;
    captureHistorySnapshot();
    setStatus("ungespeichert");
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveNow, 800);
  }

  async function saveNow() {
    const payload = clonePayload();
    saveLocal(payload);
    setStatus("lokal gespeichert");

    const store = await waitForInlineStore(900);
    if (!store?.save) return;

    try {
      await store.save(pageId, payload);
      clearInlineResetPending();
      dirty = false;
      setStatus("online gespeichert");
    } catch (error) {
      setStatus("lokal gespeichert, online fehlgeschlagen");
    }
  }

  function exportInlineData() {
    const payload = clonePayload();
    const exportPayload = {
      type: "aleria-orte-inline-export",
      schemaVersion: 1,
      pageId,
      title: window.AleriaOrteScenes?.ortName || window.ORTE_CONFIG?.registryEntry?.name || document.title || pageId,
      exportedAt: new Date().toISOString(),
      data: payload
    };
    const filename = `aleria-ort-${slugifyFilePart(pageId)}-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJsonFile(exportPayload, filename);
    setStatus("Export erstellt", "ok");
  }

  async function importInlineData(file) {
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      const payload = extractImportedPayload(parsed);
      if (!payload) {
        setStatus("Import ungueltig", "error");
        window.alert("Diese Datei ist kein gueltiger Orte-Direktbearbeitungs-Export.");
        return;
      }

      const confirmed = window.confirm(
        `Daten aus "${file.name}" importieren?\n\nDie aktuelle Direktbearbeitung dieser Seite wird dadurch ersetzt.`
      );
      if (!confirmed) return;

      applyPayload(payload);
      saveLocal(payload);
      resetHistoryToCurrent();
      dirty = true;
      await saveNow();
      setStatus("Import abgeschlossen", "ok");
    } catch (error) {
      setStatus("Import fehlgeschlagen", "error");
      window.alert("Die Importdatei konnte nicht gelesen werden.");
    }
  }

  function extractImportedPayload(parsed) {
    const source = parsed && typeof parsed === "object" && parsed.type === "aleria-orte-inline-export"
      ? parsed.data
      : parsed?.data && isCompatiblePayload(parsed.data)
        ? parsed.data
        : parsed;
    if (!isCompatiblePayload(source)) return null;
    return normalizeInlinePayload(source);
  }

  async function hardResetInlineDocument() {
    const password = window.prompt("Hard Reset ist geschützt. Passwort eingeben:");
    if (password !== "2603") {
      setStatus("Reset abgebrochen", "warning");
      return;
    }

    const documentLabel = window.GRUPPEN_CONFIG ? "Gruppen-Vorlage" : "Orte-Vorlage";
    const confirmed = window.confirm(
      `Hard Reset für diese ${documentLabel}?\n\nGelöscht werden nur Daten für "${pageId}": Direktbearbeitung, lokale Szenenliste und Szenendokumente. Almanach-Kommentare und AleriaAlmanach-Daten bleiben unangetastet.`
    );
    if (!confirmed) return;

    closeImagePanel();
    setStatus("Reset läuft");
    markInlineResetPending();
    removeLocalTemplateKeys();

    const resetResults = await Promise.allSettled([
      resetRemoteInlineContent(),
      resetRemoteScenes()
    ]);
    const failed = resetResults.some((result) => result.status === "rejected");

    setStatus(failed ? "Reset lokal abgeschlossen, online prüfen" : "Reset abgeschlossen", failed ? "warning" : "ok");
    window.setTimeout(() => window.location.reload(), 250);
  }

  async function resetRemoteInlineContent() {
    const inlineStore = await waitForInlineStore(2500);
    if (!inlineStore) return;

    try {
      if (inlineStore.reset) {
        await inlineStore.reset(pageId);
        clearInlineResetPending();
        return;
      }
    } catch (error) {
      if (!inlineStore.save) throw error;
    }

    if (inlineStore.save) {
      await inlineStore.save(pageId, createResetPayload());
      clearInlineResetPending();
    }
  }

  async function resetRemoteScenes() {
    if (window.AleriaOrteSceneRuntime?.hardReset) {
      await window.AleriaOrteSceneRuntime.hardReset();
    }
  }

  function createResetPayload() {
    return {
      contentSchemaVersion: CONTENT_SCHEMA_VERSION,
      savedAtClient: Date.now(),
      resetAtClient: Date.now(),
      meta: normalizeDocumentMeta({}),
      texts: {},
      tables: {},
      ratings: {},
      images: {},
      hiddenSections: {}
    };
  }

  function markInlineResetPending() {
    try {
      window.localStorage.setItem(resetMarkerKey, JSON.stringify({
        pageId,
        resetAtClient: Date.now()
      }));
    } catch (error) {
      return;
    }
  }

  function clearInlineResetPending() {
    try {
      window.localStorage.removeItem(resetMarkerKey);
    } catch (error) {
      return;
    }
  }

  function hasInlineResetPending() {
    try {
      return !!window.localStorage.getItem(resetMarkerKey);
    } catch (error) {
      return false;
    }
  }

  async function hardResetTemplate() {
    const password = window.prompt("Hard Reset ist geschuetzt. Passwort eingeben:");
    if (password !== "2603") {
      setStatus("Reset abgebrochen", "warning");
      return;
    }

    const confirmed = window.confirm(
      `Hard Reset für diese Orte-Vorlage?\n\nGelöscht werden nur Orte-Daten für "${pageId}": Direktbearbeitung, lokale Szenenliste und Orte-Szenendokumente. Almanach-Kommentare und AleriaAlmanach-Daten bleiben unangetastet.`
    );
    if (!confirmed) return;

    closeImagePanel();
    setStatus("Reset läuft");

    try {
      removeLocalTemplateKeys();
      const inlineStore = await waitForInlineStore(900);
      if (inlineStore?.reset) await inlineStore.reset(pageId);
      if (window.AleriaOrteSceneRuntime?.hardReset) {
        await window.AleriaOrteSceneRuntime.hardReset();
      }
      setStatus("reset abgeschlossen");
      window.setTimeout(() => window.location.reload(), 250);
    } catch (error) {
      setStatus("reset teilweise fehlgeschlagen");
    }
  }

  function removeLocalTemplateKeys() {
    const prefixes = getLocalTemplateKeyPrefixes();
    try {
      Object.keys(window.localStorage)
        .filter((key) => prefixes.some((prefix) => key === prefix || key.startsWith(prefix)))
        .forEach((key) => window.localStorage.removeItem(key));
    } catch (error) {
      return;
    }
  }

  async function connectRemote() {
    const store = await waitForInlineStore();
    if (!store?.subscribe) return;

    store.subscribe(pageId, (payload) => {
      if (!payload) {
        clearInlineResetPending();
        return;
      }
      if (!isCompatiblePayload(payload)) {
        setStatus("alte Online-Daten ignoriert");
        return;
      }
      if (hasInlineResetPending() && !payload.resetAtClient) {
        setStatus("Reset lokal aktiv, alter Online-Stand ignoriert", "warning");
        return;
      }
      if (payload.resetAtClient) clearInlineResetPending();

      if (dirty) {
        pendingLocalPayload = clonePayload();
        pendingRemotePayload = payload;
        setStatus("Online-Version wartet", "warning");
        updateVersionChoice();
        return;
      }

      const currentPayload = clonePayload();
      if (payloadSignature(payload) === payloadSignature(currentPayload)) {
        saveLocal(payload);
        resetHistoryToCurrent();
        pendingLocalPayload = null;
        pendingRemotePayload = null;
        setStatus("online synchronisiert", "ok");
        updateVersionChoice();
        return;
      }

      const localPayload = loadLocal();
      if (isCompatiblePayload(localPayload) && payloadSignature(localPayload) !== payloadSignature(payload)) {
        if (isPayloadLocked(payload)) {
          applyPayload(payload);
          saveLocal(payload);
          resetHistoryToCurrent();
          pendingLocalPayload = null;
          pendingRemotePayload = null;
          dirty = false;
          setStatus("finaler Online-Stand geladen", "ok");
          updateVersionChoice();
          return;
        }

        pendingLocalPayload = localPayload;
        pendingRemotePayload = payload;
        setStatus("Version wählen", "warning");
        setStatusPanelOpen(true);
        updateVersionChoice();
        return;
      }

      applyPayload(payload);
      saveLocal(payload);
      resetHistoryToCurrent();
      setStatus("online geladen", "ok");
    }, () => {
      setStatus("online nicht erreichbar", "error");
    });
  }

  function waitForInlineStore(timeout = 5000) {
    if (window.OrteInlineFirebase) return Promise.resolve(window.OrteInlineFirebase);
    return new Promise((resolve) => {
      let finished = false;
      const finish = (store) => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        window.removeEventListener("orte-inline-firebase-ready", onReady);
        resolve(store || null);
      };
      const onReady = () => finish(window.OrteInlineFirebase);
      const timer = window.setTimeout(() => finish(null), timeout);
      window.addEventListener("orte-inline-firebase-ready", onReady, { once: true });
      if (window.OrteInlineFirebase) finish(window.OrteInlineFirebase);
    });
  }

  function saveLocal(payload) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(payload));
      legacyStorageKeys.forEach((key) => window.localStorage.removeItem(key));
    } catch (error) {
      return;
    }
  }

  function loadLocal() {
    try {
      const primary = window.localStorage.getItem(storageKey);
      if (primary) return JSON.parse(primary);
      for (const key of legacyStorageKeys) {
        const legacy = window.localStorage.getItem(key);
        if (legacy) return JSON.parse(legacy);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  function clonePayload() {
    tableItems.forEach((item) => updateTableState(item.table));
    return {
      contentSchemaVersion: CONTENT_SCHEMA_VERSION,
      savedAtClient: Date.now(),
      meta: normalizeDocumentMeta(state.meta),
      texts: { ...state.texts },
      tables: { ...state.tables },
      ratings: { ...state.ratings },
      images: Object.fromEntries(Object.entries(state.images).map(([key, image]) => [key, normalizeImageState(image, key)])),
      hiddenSections: normalizeHiddenSections(state.hiddenSections)
    };
  }

  function toggleFinalStatus() {
    if (state.meta.locked) {
      const confirmed = window.confirm(
        "Finale Sperre aufheben?\n\nDanach kann dieser Ort wieder bearbeitet und gespeichert werden."
      );
      if (!confirmed) return;
      setDocumentLocked(false);
      setEditMode(true);
      markDirty();
      return;
    }

    const confirmed = window.confirm(
      "Diesen Ort als final markieren?\n\nDer aktuelle Stand wird gespeichert und künftig nicht mehr durch lokale Entwürfe ersetzt. Nachbearbeitung ist nur nach bewusster Entsperrung möglich."
    );
    if (!confirmed) return;
    setDocumentLocked(true);
    setEditMode(false);
    dirty = true;
    saveNow();
  }

  function setDocumentLocked(locked) {
    const now = Date.now();
    state.meta = {
      ...normalizeDocumentMeta(state.meta),
      status: locked ? "final" : "draft",
      locked: !!locked,
      lockedAtClient: locked ? now : 0,
      unlockedAtClient: locked ? Number(state.meta.unlockedAtClient) || 0 : now
    };
    updateDocumentStatusControls();
  }

  function updateDocumentStatusControls() {
    const status = document.querySelector("[data-orte-document-status]");
    const action = document.querySelector("[data-orte-final-action]");
    const editButton = document.querySelector("[data-action='toggle-orte-inline-edit']");
    const locked = !!state.meta.locked;

    document.body.classList.toggle("orte-document-locked", locked);
    if (status) {
      status.textContent = locked ? "Final gesperrt" : "In Bearbeitung";
      status.dataset.state = locked ? "locked" : "draft";
    }
    if (action) {
      action.textContent = locked ? "Nachbearbeiten" : "Finalisieren";
      action.title = locked
        ? "Finale Sperre bewusst aufheben"
        : "Aktuellen Stand final speichern und sperren";
    }
    if (editButton && !editMode) {
      editButton.textContent = locked ? "Nachbearbeiten" : "Bearbeiten";
    }
  }

  function applyTextCommand(command, value = null) {
    if (!editMode || !command) return;
    const editable = restoreSelection();
    if (!editable) return;
    if (command === "foreColor" || command === "hiliteColor" || command === "backColor") {
      document.execCommand("styleWithCSS", false, true);
    }
    const commandName = command === "hiliteColor" && !document.queryCommandSupported?.("hiliteColor")
      ? "backColor"
      : command;
    document.execCommand(commandName, false, value);
    persistEditable(editable);
    rememberSelection();
    markDirty();
  }

  function clearTextFormat() {
    if (!editMode) return;
    const editable = restoreSelection();
    if (!editable) return;
    document.execCommand("removeFormat", false, null);
    persistEditable(editable);
    rememberSelection();
    markDirty();
  }

  function setSectionHidden(sectionId, hidden) {
    if (!sectionId) return;
    if (hidden) {
      state.hiddenSections[sectionId] = true;
    } else {
      delete state.hiddenSections[sectionId];
    }
    applySectionVisibility();
    renderSectionControls();
    markDirty();
  }

  function showAllSections() {
    state.hiddenSections = {};
    applySectionVisibility();
    renderSectionControls();
    markDirty();
  }

  function applySectionVisibility() {
    sectionItems.forEach((section) => {
      const hidden = !!state.hiddenSections[section.id];
      section.rows.forEach((row) => {
        row.classList.toggle("orte-section-hidden", hidden);
        row.hidden = hidden;
      });
      const tocItem = document.querySelector(`[data-toc-link="${cssEscape(section.id)}"]`)?.closest("li");
      if (tocItem) tocItem.hidden = hidden;
    });
  }

  function renderSectionControls() {
    const list = document.querySelector("[data-orte-section-list]");
    if (!list) return;
    if (!sectionItems.length) {
      list.innerHTML = `<p>Keine Abschnitte gefunden.</p>`;
      return;
    }

    list.innerHTML = sectionItems.map((section) => `
      <label class="orte-section-toggle">
        <input type="checkbox" data-orte-section-toggle="${escapeAttr(section.id)}"${state.hiddenSections[section.id] ? "" : " checked"}>
        <span>${escapeHtml(section.title)}</span>
      </label>
    `).join("");
  }

  function applyTooltip(text) {
    if (!editMode || !normalizeWhitespace(text)) return;
    const editable = restoreSelection();
    const selection = window.getSelection();
    if (!editable || !selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      const tooltipNode = getClosestElement(range.startContainer)?.closest(".orte-inline-tooltip");
      if (tooltipNode && editable.contains(tooltipNode)) {
        tooltipNode.setAttribute("title", text);
        tooltipNode.dataset.tooltip = text;
        persistEditable(editable);
        markDirty();
      }
      return;
    }

    const wrapper = document.createElement("span");
    wrapper.className = "orte-inline-tooltip";
    wrapper.dataset.tooltip = text;
    wrapper.setAttribute("title", text);
    wrapper.appendChild(range.extractContents());
    range.insertNode(wrapper);
    selection.removeAllRanges();
    const nextRange = document.createRange();
    nextRange.selectNodeContents(wrapper);
    selection.addRange(nextRange);
    persistEditable(editable);
    rememberSelection();
    markDirty();
  }

  function rememberSelection() {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    const node = selection.anchorNode;
    const editable = getClosestElement(node)?.closest("[data-orte-inline-text]");
    if (!editable || !root.contains(editable)) return;
    activeEditable = editable;
    savedSelection = selection.getRangeAt(0).cloneRange();
  }

  function restoreSelection() {
    if (!activeEditable || !savedSelection || !root.contains(activeEditable)) return null;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedSelection);
    activeEditable.focus();
    return activeEditable;
  }

  function getClosestElement(node) {
    if (!node) return null;
    return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  }

  function isInsideIgnoredSurface(node) {
    return !!getClosestElement(node)?.closest(ignoredSurfaceSelector);
  }

  function normalizeImageState(image, label) {
    const source = image && typeof image === "object" ? image : {};
    const src = normalizePlaceholderSrc(source.src);
    return {
      src,
      href: String(source.href || ""),
      alt: String(source.alt || label || ""),
      width: clampNumber(source.width, 20, 100, 100),
      maxHeight: clampNumber(source.maxHeight, 80, 720, 260),
      format: ["auto", "square", "portrait", "landscape", "banner"].includes(source.format) ? source.format : "auto",
      fit: ["contain", "cover"].includes(source.fit) ? source.fit : "contain",
      clearedAtClient: Number(source.clearedAtClient) || 0
    };
  }

  function mergeInitialImageState(initialImage, currentImage, label) {
    const initial = normalizeImageState(initialImage, label);
    if (!currentImage || typeof currentImage !== "object") return initial;

    const current = normalizeImageState(currentImage, label);
    const currentSrc = normalizePlaceholderSrc(currentImage.src);
    const currentIsLegacyEmpty = !currentSrc && !Number(currentImage.clearedAtClient);

    if (initial.src && currentIsLegacyEmpty) {
      return normalizeImageState({
        ...current,
        src: initial.src,
        href: current.href || initial.href,
        alt: current.alt && current.alt !== label ? current.alt : initial.alt
      }, label);
    }

    return current;
  }

  function mergeIncomingImageState(currentImage, incomingImage, label) {
    const current = normalizeImageState(currentImage, label);
    const incoming = normalizeImageState(incomingImage, label);
    const source = incomingImage && typeof incomingImage === "object" ? incomingImage : {};
    const incomingSrc = normalizePlaceholderSrc(source.src);
    const incomingIsLegacyEmpty = !incomingSrc && !Number(source.clearedAtClient);

    if (current.src && incomingIsLegacyEmpty) {
      return normalizeImageState({ ...incoming, ...current }, label);
    }

    if (current.src && !incomingSrc && String(source.href || "").trim()) {
      return normalizeImageState({
        ...incoming,
        src: current.src,
        href: incoming.href || current.href,
        alt: incoming.alt && incoming.alt !== label ? incoming.alt : current.alt
      }, label);
    }

    return incoming;
  }

  function normalizeInlinePayload(payload) {
    const source = payload && typeof payload === "object" ? payload : {};
    return {
      contentSchemaVersion: Number(source.contentSchemaVersion) || 0,
      savedAtClient: Number(source.savedAtClient || source.updatedAtClient) || 0,
      resetAtClient: Number(source.resetAtClient) || 0,
      meta: normalizeDocumentMeta(source.meta),
      texts: normalizeTextRecord(source.texts),
      tables: normalizeTextRecord(source.tables),
      ratings: normalizeRatingRecord(source.ratings),
      images: Object.fromEntries(Object.entries(source.images && typeof source.images === "object" ? source.images : {})
        .map(([key, image]) => [String(key), normalizeImageState(image, String(key))])),
      hiddenSections: normalizeHiddenSections(source.hiddenSections)
    };
  }

  function getInlineStorageConfig() {
    const config = window.AleriaOrteScenes?.localStorage || {};
    const namespace = normalizeStorageToken(config.namespace || "orte", "orte");
    const legacyNamespaces = Array.isArray(config.legacyNamespaces)
      ? config.legacyNamespaces.map((item) => normalizeStorageToken(item, "")).filter(Boolean)
      : [];
    const commentsScope = normalizeStorageToken(config.commentsScope || namespace, namespace);
    return {
      namespace,
      legacyNamespaces: Array.from(new Set(legacyNamespaces.filter((item) => item !== namespace))),
      commentsScope
    };
  }

  function getInlineContentStorageKey(namespace, schemaVersion) {
    return `aleria:${namespace}:inline-content:v${schemaVersion}:${pageId}`;
  }

  function getLegacyInlineContentStorageKeys() {
    return inlineStorageConfig.legacyNamespaces.flatMap((namespace) => [
      getInlineContentStorageKey(namespace, 1),
      getInlineContentStorageKey(namespace, CONTENT_SCHEMA_VERSION)
    ]);
  }

  function getLocalTemplateKeyPrefixes() {
    const namespaces = Array.from(new Set([storageNamespace, ...inlineStorageConfig.legacyNamespaces]));
    return namespaces.flatMap((namespace) => {
      const commentsScope = namespace === storageNamespace ? inlineStorageConfig.commentsScope : "orte";
      return [
        `aleria:${namespace}:inline-content:v1:${pageId}`,
        `aleria:${namespace}:inline-content:v${CONTENT_SCHEMA_VERSION}:${pageId}`,
        `aleria:${namespace}:inline-reset:${pageId}`,
        `aleria:${namespace}:inline-status-position:${pageId}`,
        `aleria:${namespace}:scene-index:${pageId}`,
        `aleria:${namespace}:scene-index-meta:${pageId}`,
        `aleria:${namespace}:session-module:${pageId}:`,
        `aleria:${namespace}:session-module-meta:${pageId}:`,
        `aleria:${namespace}:comments:${commentsScope}:${pageId}:`
      ];
    });
  }

  function normalizeStorageToken(value, fallback) {
    const normalized = String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return normalized || fallback;
  }

  function normalizeTextRecord(record) {
    return Object.fromEntries(Object.entries(record && typeof record === "object" ? record : {})
      .map(([key, value]) => [String(key), String(value ?? "")]));
  }

  function normalizeRatingRecord(record) {
    return Object.fromEntries(Object.entries(record && typeof record === "object" ? record : {})
      .map(([key, value]) => [String(key), clampRating(value)]));
  }

  function normalizeHiddenSections(record) {
    return Object.fromEntries(Object.entries(record && typeof record === "object" ? record : {})
      .filter(([, value]) => !!value)
      .map(([key]) => [String(key), true]));
  }

  function normalizeDocumentMeta(meta) {
    const source = meta && typeof meta === "object" ? meta : {};
    const status = source.locked || source.status === "final" || source.status === "locked"
      ? "final"
      : "draft";
    return {
      status,
      locked: status === "final",
      lockedAtClient: status === "final" ? Number(source.lockedAtClient) || 0 : 0,
      unlockedAtClient: Number(source.unlockedAtClient) || 0
    };
  }

  function isPayloadLocked(payload) {
    return !!normalizeDocumentMeta(payload?.meta).locked;
  }

  function isCompatiblePayload(payload) {
    return !!payload && Number(payload.contentSchemaVersion) === CONTENT_SCHEMA_VERSION;
  }

  function payloadSignature(payload) {
    const source = payload && typeof payload === "object" ? payload : {};
    return JSON.stringify({
      contentSchemaVersion: Number(source.contentSchemaVersion) || 0,
      meta: normalizeDocumentMeta(source.meta),
      texts: source.texts || {},
      tables: source.tables || {},
      ratings: source.ratings || {},
      images: source.images || {},
      hiddenSections: normalizeHiddenSections(source.hiddenSections)
    });
  }

  function useOnlineVersion() {
    if (!isCompatiblePayload(pendingRemotePayload)) return;
    applyPayload(pendingRemotePayload);
    saveLocal(pendingRemotePayload);
    resetHistoryToCurrent();
    dirty = false;
    pendingLocalPayload = null;
    pendingRemotePayload = null;
    updateVersionChoice();
    setStatus("Online-Version geladen", "ok");
  }

  function useLocalVersion() {
    if (!isCompatiblePayload(pendingLocalPayload)) return;
    applyPayload(pendingLocalPayload);
    saveLocal(pendingLocalPayload);
    resetHistoryToCurrent();
    pendingRemotePayload = null;
    pendingLocalPayload = null;
    dirty = true;
    updateVersionChoice();
    setStatus("lokale Version behalten", "warning");
    saveNow();
  }

  function useLatestVersion() {
    if (!isCompatiblePayload(pendingLocalPayload) && !isCompatiblePayload(pendingRemotePayload)) return;
    const localTime = getPayloadTime(pendingLocalPayload);
    const remoteTime = getPayloadTime(pendingRemotePayload);
    if (remoteTime >= localTime) {
      useOnlineVersion();
      return;
    }
    useLocalVersion();
  }

  function getPayloadTime(payload) {
    const number = Number(payload?.savedAtClient || payload?.updatedAtClient);
    return Number.isFinite(number) ? number : 0;
  }

  function getImageSlotLabel(image) {
    if (image.closest(".portrait-cell")) return "Portrait";
    if (image.closest(".wappen")) return "Wappen/Symbol";
    const alt = image.getAttribute("alt") || "";
    return isPlaceholderSrc(alt) ? "Bildplatzhalter" : alt || "Bildplatzhalter";
  }

  function getImageSlotContextLabel(node) {
    if (node.closest(".portrait-cell")) return "Portrait";
    if (node.closest(".wappen")) return "Wappen/Symbol";
    return "Bildplatzhalter";
  }

  function getImageKeyPrefix(node) {
    if (node.closest(".portrait-cell")) return "portrait";
    if (node.closest(".wappen")) return "symbol";
    return "bild";
  }

  function getPlaceholderText(item) {
    if (item.node.closest(".portrait-cell")) return "Portrait";
    if (item.node.closest(".wappen")) return "+";
    return String(item.label || "Bild")
      .replace(/\.(png|jpe?g|webp|gif|svg)$/i, "")
      .replace(/[_-]+/g, " ")
      .trim() || "Bild";
  }

  function shouldRenderPortraitPlaceholder(item, image) {
    return image?.format === "portrait"
      || item?.node?.dataset?.orteImageFormat === "portrait"
      || item?.node?.classList?.contains("is-portrait-image")
      || !!item?.node?.closest(".portrait-cell");
  }

  function isPlaceholderImage(image) {
    if (!image) return false;
    const src = image.getAttribute("src") || "";
    return image.classList.contains("transparent")
      || image.classList.contains("pt-s-0052")
      || image.classList.contains("pt-s-0079")
      || isPlaceholderSrc(src);
  }

  function normalizePlaceholderSrc(src) {
    const value = String(src || "");
    return isPlaceholderSrc(value) ? "" : value;
  }

  function isPlaceholderSrc(src) {
    const value = String(src || "").toLowerCase();
    if (!value) return false;
    return value.includes("tumblr_otwjgn7mfu1wwqdobo1_1280")
      || value.includes("66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10")
      || value.includes("i.imgur.com/bpo3pzn.png")
      || value.endsWith("/w5rerk3.png");
  }

  function renderOption(value, label, current) {
    const selected = value === current ? " selected" : "";
    return `<option value="${escapeAttr(value)}"${selected}>${escapeHtml(label)}</option>`;
  }

  function inferRatingValue(cell) {
    const value = Number(cell.dataset.orteRatingValue);
    if (Number.isFinite(value)) return clampRating(value);

    const text = normalizeWhitespace(cell.textContent);
    const filled = (text.match(/[★✤*]/g) || []).length;
    return clampRating(filled || 3);
  }

  function formatRating(value, kind) {
    const filled = kind === "ruf" ? "\u2724" : "\u2605";
    const empty = kind === "ruf" ? "\u2727" : "\u2606";
    return `${filled.repeat(value)}${empty.repeat(5 - value)}`;
  }

  function clampRating(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 3;
    return Math.max(1, Math.min(5, Math.round(number)));
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(min, Math.min(max, Math.round(number)));
  }

  function getPageId() {
    return String(window.AleriaOrteScenes?.ortId || window.ORTE_CONFIG?.docId || "grossstadt-vorlage");
  }

  function setStatus(message, explicitState = "") {
    const status = document.querySelector("[data-orte-inline-status]");
    if (status) status.textContent = message;
    const widget = document.querySelector("[data-orte-status-widget]");
    const panelState = document.querySelector("[data-orte-inline-status-panel-state]");
    const panelMessage = document.querySelector("[data-orte-status-message]");
    const stateName = explicitState || inferStatusState(message);
    if (widget) widget.dataset.state = stateName;
    if (panelState) panelState.textContent = stateName === "ok" ? "synchronisiert" : stateName === "error" ? "Fehler" : stateName === "warning" ? "Hinweis" : "bereit";
    if (panelMessage) panelMessage.textContent = message;
  }

  function inferStatusState(message) {
    const value = String(message || "").toLowerCase();
    if (value.includes("fehl") || value.includes("nicht erreichbar") || value.includes("ignoriert")) return "error";
    if (value.includes("ungespeichert") || value.includes("reset") || value.includes("wählen") || value.includes("wartet")) return "warning";
    if (value.includes("gespeichert") || value.includes("geladen") || value.includes("synchronisiert")) return "ok";
    return "idle";
  }

  function setStatusPanelOpen(open) {
    statusPanelOpen = !!open;
    const panel = document.querySelector("[data-orte-status-panel]");
    const button = document.querySelector("[data-action='toggle-orte-status-panel']");
    if (panel) panel.hidden = !statusPanelOpen;
    if (button) button.setAttribute("aria-expanded", String(statusPanelOpen));
  }

  function updateVersionChoice() {
    const choice = document.querySelector("[data-orte-version-choice]");
    if (!choice) return;
    choice.hidden = !(isCompatiblePayload(pendingLocalPayload) && isCompatiblePayload(pendingRemotePayload));
  }

  function wireStatusDrag(widget) {
    const handle = widget.querySelector("[data-action='toggle-orte-status-panel']");
    if (!handle) return;
    handle.addEventListener("pointerdown", (event) => {
      statusDrag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        left: widget.offsetLeft,
        top: widget.offsetTop,
        moved: false
      };
      handle.setPointerCapture(event.pointerId);
    });

    handle.addEventListener("pointermove", (event) => {
      if (!statusDrag || statusDrag.pointerId !== event.pointerId) return;
      const dx = event.clientX - statusDrag.startX;
      const dy = event.clientY - statusDrag.startY;
      if (Math.abs(dx) + Math.abs(dy) < 6 && !statusDrag.moved) return;
      statusDrag.moved = true;
      placeStatusWidget(widget, statusDrag.left + dx, statusDrag.top + dy);
    });

    handle.addEventListener("pointerup", (event) => {
      if (!statusDrag || statusDrag.pointerId !== event.pointerId) return;
      if (statusDrag.moved) {
        saveStatusWidgetPosition(widget);
        statusSuppressClick = true;
        window.setTimeout(() => {
          statusSuppressClick = false;
        }, 0);
      }
      statusDrag = null;
    });
  }

  function applyStatusWidgetPosition(widget) {
    try {
      const saved = JSON.parse(window.localStorage.getItem(statusPositionKey) || "null");
      if (!saved || typeof saved !== "object") return;
      placeStatusWidget(widget, Number(saved.left), Number(saved.top));
    } catch (error) {
      return;
    }
  }

  function saveStatusWidgetPosition(widget) {
    try {
      window.localStorage.setItem(statusPositionKey, JSON.stringify({
        left: widget.offsetLeft,
        top: widget.offsetTop
      }));
    } catch (error) {
      return;
    }
  }

  function placeStatusWidget(widget, left, top) {
    const safeLeft = clampNumber(left, 4, Math.max(4, window.innerWidth - widget.offsetWidth - 4), 14);
    const safeTop = clampNumber(top, 4, Math.max(4, window.innerHeight - widget.offsetHeight - 4), window.innerHeight - 48);
    widget.style.left = `${safeLeft}px`;
    widget.style.top = `${safeTop}px`;
    widget.style.right = "auto";
    widget.style.bottom = "auto";
  }

  function normalizeWhitespace(value) {
    return String(value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  }

  function cssEscape(value) {
    if (window.CSS?.escape) return window.CSS.escape(String(value || ""));
    return String(value || "").replace(/["\\]/g, "\\$&");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll("`", "&#096;");
  }

  function slugifyFilePart(value) {
    return String(value || "ort")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "ort";
  }

  function downloadJsonFile(payload, filename) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
})();
