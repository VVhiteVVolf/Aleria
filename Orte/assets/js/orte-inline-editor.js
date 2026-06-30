(function () {
  "use strict";

  const root = document.querySelector("[data-orte-static-template]");
  if (!root) return;

  const pageId = getPageId();
  const CONTENT_SCHEMA_VERSION = 2;
  const storageKey = `aleria:orte:inline-content:v${CONTENT_SCHEMA_VERSION}:${pageId}`;
  const statusPositionKey = `aleria:orte:inline-status-position:${pageId}`;
  const state = { texts: {}, images: {}, ratings: {}, tables: {}, hiddenSections: {} };
  const textItems = [];
  const imageItems = [];
  const ratingItems = [];
  const tableItems = [];
  const sectionItems = [];
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
  const inlineActions = new Set([
    "toggle-orte-inline-edit",
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
    "insert-orte-table-row-before",
    "insert-orte-table-row-after",
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
    ".orte-section-controls"
  ].join(", ");

  init();

  function init() {
    const localPayload = loadLocal();
    prepareTables();
    if (isCompatiblePayload(localPayload)) applyTablePayload(localPayload?.tables);
    rebuildTargets();
    if (isCompatiblePayload(localPayload)) applyPayload(localPayload, { skipTables: true });
    renderToolbar();
    renderStatusWidget();
    resetHistoryToCurrent();
    wireEvents();
    connectRemote();
  }

  function renderToolbar() {
    const toolbar = document.createElement("div");
    toolbar.className = "orte-inline-toolbar";
    toolbar.innerHTML = `
      <strong>Direktbearbeitung</strong>
      <span class="orte-inline-status-text" data-orte-inline-status>bereit</span>
      <button type="button" data-action="toggle-orte-inline-edit">Bearbeiten</button>
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
      document.execCommand("insertHTML", false, sanitizePastedHtml(html || escapeHtml(text).replace(/\n/g, "<br>")));
      sanitizeEditableNode(editable);
      persistEditable(editable);
      markDirty();
    });

    document.addEventListener("error", (event) => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement)) return;
      const slot = image.closest("[data-orte-image-key]");
      if (!slot) return;
      const key = slot.dataset.orteImageKey;
      if (!key) return;
      state.images[key] = normalizeImageState({ ...(state.images[key] || {}), src: "" }, slot.dataset.orteImageLabel || key);
      renderImageSlot(key);
      markDirty();
    }, true);

    document.addEventListener("selectionchange", () => {
      if (!editMode) return;
      rememberSelection();
    });
  }

  function handleAction(event, target) {
    const action = target.dataset.action;
    if (action === "toggle-orte-inline-edit") {
      setEditMode(!editMode);
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
      hardResetTemplate();
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

    if (action === "insert-orte-table-row-before" || action === "insert-orte-table-row-after") {
      insertTableRowNear(target, action === "insert-orte-table-row-before" ? "before" : "after");
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
    updateHistoryButtons();
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
    getEditableCandidates().forEach((node) => {
      const table = node.closest("[data-orte-table-id]");
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
      state.images[key] = normalizeImageState({ ...initialImage, ...(state.images[key] || {}) }, label);
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
    const headings = Array.from(root.querySelectorAll(".grossstadt-template-frame h2"));
    const activeIds = new Set();
    headings.forEach((heading, index) => {
      const row = heading.closest("tr");
      const id = heading.id || `abschnitt-${String(index).padStart(2, "0")}`;
      if (!row || activeIds.has(id)) return;

      const rows = [];
      let currentRow = row;
      while (currentRow) {
        if (currentRow !== row && currentRow.querySelector("h2")) break;
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
    return Array.from(root.querySelectorAll("h2, h3, details > summary > span, p, td, th, li"))
      .filter((node) => !isInsideIgnoredSurface(node))
      .filter((node) => !node.closest("[data-orte-image-key], [data-orte-rating-key]"))
      .filter((node) => !node.matches(".place-spacer"))
      .filter((node) => !node.querySelector("table, h2, h3, summary, p, td, th, li, [data-orte-image-key], [data-orte-rating-key]"))
      .filter((node) => normalizeWhitespace(node.textContent));
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
      slot.className = "orte-image-slot has-image";
      slot.dataset.orteImageKey = key;
      slot.dataset.orteImageLabel = label;
      slot.setAttribute("aria-label", label);
      image.dataset.orteInlineImageKey = key;
      image.replaceWith(slot);
      slot.appendChild(image);
      if (isPlaceholderImage(image)) {
        state.images[key] = normalizeImageState({ src: "", alt: label }, label);
      }
    });
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
    item.node.classList.toggle("has-image", !!image.src);
    item.node.dataset.orteImageFormat = image.format;
    item.node.dataset.orteImageFit = image.fit;
    item.node.dataset.orteImageWidth = String(image.width);
    item.node.dataset.orteImageMaxHeight = String(image.maxHeight);
    item.node.style.setProperty("--orte-image-width", `${image.width}%`);
    item.node.style.setProperty("--orte-image-max-height", `${image.maxHeight}px`);

    const editHint = editMode ? `<span class="orte-inline-image-hint">Bild bearbeiten</span>` : "";
    if (!image.src) {
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
    tableItems.forEach((item) => {
      const control = document.createElement("div");
      control.className = "orte-table-add-control";
      control.innerHTML = `<button type="button" data-action="add-orte-table-row" data-orte-table-target="${escapeAttr(item.id)}">+ Zeile</button>`;
      item.table.insertAdjacentElement("afterend", control);
      renderRowControls(item.table, item.id);
    });
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
    state.images[activeImageKey] = {
      ...(state.images[activeImageKey] || {}),
      [field]: input.value
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
    state.images[activeImageKey] = normalizeImageState({ src: "", href: "", alt: item?.label || "" }, item?.label || "");
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
    } else {
      removeGenericTableRow(table, row);
    }

    updateTableState(table);
    rebuildTargets();
    markDirty();
  }

  function addGenericTableRow(table, referenceRow = null, position = "after") {
    const tbody = table.tBodies[0];
    const candidate = getCloneSourceRow(table, referenceRow, position)
      || Array.from(tbody.rows).reverse().find((row) => isCloneableDataRow(row, table));
    if (!candidate) return;

    const clone = candidate.cloneNode(true);
    resetClonedFragment(clone);
    candidate.insertAdjacentElement(position === "before" ? "beforebegin" : "afterend", clone);
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

  function addPersonalityDividerRow(referenceRow, position = "after") {
    if (!isPersonalityDividerRow(referenceRow)) return;
    const clone = referenceRow.cloneNode(true);
    resetPersonalityDividerRow(clone);
    referenceRow.insertAdjacentElement(position === "before" ? "beforebegin" : "afterend", clone);
  }

  function removeGenericTableRow(table, row) {
    const cloneableRows = Array.from(table.tBodies[0]?.rows || []).filter((candidate) => isCloneableDataRow(candidate, table));
    if (cloneableRows.length <= 1 || !isCloneableDataRow(row, table)) return;
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

  function renderRowControls(table, tableId) {
    const rows = Array.from(table.tBodies[0]?.rows || []);
    rows.forEach((row, index) => {
      const canControl = table.classList.contains("pt-s-0067")
        ? isPersonalityGroupStart(row) || isPersonalityDividerRow(row)
        : isCloneableDataRow(row, table);
      if (!canControl) return;

      const cell = row.cells?.[0];
      if (!cell) return;
      cell.classList.add("orte-table-control-cell");
      const controls = document.createElement("span");
      const isPersonalityTable = table.classList.contains("pt-s-0067");
      const isDividerRow = isPersonalityDividerRow(row);
      controls.className = [
        "orte-table-row-controls",
        isPersonalityTable ? "is-personality-row-control" : "",
        isDividerRow ? "is-divider-row-control" : ""
      ].filter(Boolean).join(" ");
      controls.innerHTML = isPersonalityTable
        ? `
          <button type="button" data-action="insert-orte-table-row-after" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="${isDividerRow ? "Zwischenzeile danach einfügen" : "Person danach einfügen"}">${isDividerRow ? "+ Zwischenzeile" : "+ Person"}</button>
          <button type="button" data-action="remove-orte-table-row" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="${isDividerRow ? "Zwischenzeile entfernen" : "Person entfernen"}">-</button>
        `
        : `
          <button type="button" data-action="insert-orte-table-row-before" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Zeile davor einfügen">+</button>
          <button type="button" data-action="insert-orte-table-row-after" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Zeile danach einfügen">+</button>
          <button type="button" data-action="remove-orte-table-row" data-orte-table-target="${escapeAttr(tableId)}" data-orte-table-row-index="${index}" title="Zeile entfernen">-</button>
        `;
      cell.prepend(controls);
    });
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

  function resetPersonalityDividerRow(row) {
    row.querySelectorAll(".orte-table-row-controls").forEach((node) => node.remove());
    row.querySelectorAll("[contenteditable], [data-orte-inline-text]").forEach((node) => {
      node.removeAttribute("contenteditable");
      node.removeAttribute("data-orte-inline-text");
    });

    const cell = row.cells?.[0];
    const label = cell?.querySelector("b, strong") || cell;
    if (label) label.textContent = "Neue Zwischenzeile";
  }

  function applyPayload(payload, options = {}) {
    if (!payload) return;
    if (!isCompatiblePayload(payload)) {
      setStatus("alte Inline-Daten ignoriert");
      return;
    }

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
      state.images[key] = {
        ...(state.images[key] || {}),
        ...(image || {})
      };
      state.images[key] = normalizeImageState(state.images[key], item?.label || key);
    });

    Object.entries(payload.ratings || {}).forEach(([key, value]) => {
      state.ratings[key] = clampRating(value);
    });

    renderImageSlots();
    renderRatings();
    applySectionVisibility();
    renderSectionControls();
  }

  function applyTablePayload(tables) {
    if (!tables || typeof tables !== "object") return;
    Object.entries(tables).forEach(([id, html]) => {
      const table = root.querySelector(`[data-orte-table-id="${cssEscape(id)}"]`);
      if (table?.tBodies[0]) table.tBodies[0].innerHTML = String(html || "");
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

  function getTableHtml(table) {
    const tbody = table.tBodies[0];
    if (!tbody) return "";
    const clone = tbody.cloneNode(true);
    clone.querySelectorAll("[contenteditable], [data-orte-inline-text]").forEach((node) => {
      node.removeAttribute("contenteditable");
      node.removeAttribute("data-orte-inline-text");
    });
    clone.querySelectorAll(".orte-inline-image-panel, .orte-table-add-control, .orte-table-row-controls, .orte-inline-image-hint").forEach((node) => node.remove());
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
    const prefixes = [
      `aleria:orte:inline-content:v1:${pageId}`,
      `aleria:orte:inline-content:v2:${pageId}`,
      `aleria:orte:scene-index:${pageId}`,
      `aleria:orte:scene-index-meta:${pageId}`,
      `aleria:orte:session-module:${pageId}:`,
      `aleria:orte:session-module-meta:${pageId}:`,
      `aleria:orte:comments:orte:${pageId}:`
    ];
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
      if (!payload) return;
      if (!isCompatiblePayload(payload)) {
        setStatus("alte Online-Daten ignoriert");
        return;
      }

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
    } catch (error) {
      return;
    }
  }

  function loadLocal() {
    try {
      return JSON.parse(window.localStorage.getItem(storageKey) || "null");
    } catch (error) {
      return null;
    }
  }

  function clonePayload() {
    tableItems.forEach((item) => updateTableState(item.table));
    return {
      contentSchemaVersion: CONTENT_SCHEMA_VERSION,
      savedAtClient: Date.now(),
      texts: { ...state.texts },
      tables: { ...state.tables },
      ratings: { ...state.ratings },
      images: Object.fromEntries(Object.entries(state.images).map(([key, image]) => [key, normalizeImageState(image, key)])),
      hiddenSections: normalizeHiddenSections(state.hiddenSections)
    };
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
      fit: ["contain", "cover"].includes(source.fit) ? source.fit : "contain"
    };
  }

  function normalizeInlinePayload(payload) {
    const source = payload && typeof payload === "object" ? payload : {};
    return {
      contentSchemaVersion: Number(source.contentSchemaVersion) || 0,
      savedAtClient: Number(source.savedAtClient || source.updatedAtClient) || 0,
      texts: normalizeTextRecord(source.texts),
      tables: normalizeTextRecord(source.tables),
      ratings: normalizeRatingRecord(source.ratings),
      images: Object.fromEntries(Object.entries(source.images && typeof source.images === "object" ? source.images : {})
        .map(([key, image]) => [String(key), normalizeImageState(image, String(key))])),
      hiddenSections: normalizeHiddenSections(source.hiddenSections)
    };
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

  function isCompatiblePayload(payload) {
    return !!payload && Number(payload.contentSchemaVersion) === CONTENT_SCHEMA_VERSION;
  }

  function payloadSignature(payload) {
    const source = payload && typeof payload === "object" ? payload : {};
    return JSON.stringify({
      contentSchemaVersion: Number(source.contentSchemaVersion) || 0,
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
