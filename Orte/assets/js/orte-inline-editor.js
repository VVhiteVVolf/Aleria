(function () {
  "use strict";

  const root = document.querySelector("[data-orte-static-template]");
  if (!root) return;

  const pageId = getPageId();
  const storageKey = `aleria:orte:inline-content:${pageId}`;
  const state = { texts: {}, images: {}, ratings: {}, tables: {} };
  const textItems = [];
  const imageItems = [];
  const ratingItems = [];
  const tableItems = [];

  let editMode = false;
  let saveTimer = 0;
  let dirty = false;
  let activeImageKey = "";
  let activeEditable = null;
  let savedSelection = null;

  init();

  function init() {
    const localPayload = loadLocal();
    prepareTables();
    applyTablePayload(localPayload?.tables);
    rebuildTargets();
    applyPayload(localPayload, { skipTables: true });
    renderToolbar();
    wireEvents();
    connectRemote();
  }

  function renderToolbar() {
    const toolbar = document.createElement("div");
    toolbar.className = "orte-inline-toolbar";
    toolbar.innerHTML = `
      <strong>Direktbearbeitung</strong>
      <span data-orte-inline-status>bereit</span>
      <button type="button" data-action="toggle-orte-inline-edit">Bearbeiten</button>
      <button type="button" data-action="save-orte-inline-edit" data-orte-inline-edit-only>Speichern</button>
      <span class="orte-inline-format-tools" data-orte-inline-edit-only>
        <button type="button" data-action="format-orte-text" data-command="bold" title="Fett"><b>F</b></button>
        <button type="button" data-action="format-orte-text" data-command="italic" title="Kursiv"><i>K</i></button>
        <button type="button" data-action="format-orte-text" data-command="underline" title="Unterstrichen"><u>U</u></button>
        <label class="orte-inline-color-tool" title="Textfarbe">
          <span>Farbe</span>
          <input type="color" data-orte-format-color value="#3b220c">
        </label>
        <label class="orte-inline-tooltip-tool" title="Tooltip fuer markierten Text">
          <span>Tooltip</span>
          <input type="text" data-orte-format-tooltip placeholder="Hinweistext">
          <button type="button" data-action="apply-orte-tooltip">Setzen</button>
        </label>
      </span>
    `;
    document.body.prepend(toolbar);
  }

  function wireEvents() {
    document.addEventListener("click", (event) => {
      const actionTarget = event.target.closest("[data-action]");
      if (actionTarget) handleAction(event, actionTarget);

      const imageSlot = event.target.closest("[data-orte-image-key]");
      if (!imageSlot || !editMode) return;
      event.preventDefault();
      openImagePanel(imageSlot.dataset.orteImageKey);
    });

    document.addEventListener("input", (event) => {
      const colorInput = event.target.closest("[data-orte-format-color]");
      if (colorInput && editMode) {
        applyTextCommand("foreColor", colorInput.value);
        return;
      }

      const editable = event.target.closest("[data-orte-inline-text]");
      if (editable && editMode) {
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

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeImagePanel();
    });

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

    if (action === "format-orte-text") {
      applyTextCommand(target.dataset.command);
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
    if (!editMode) closeImagePanel();
  }

  function rebuildTargets() {
    textItems.length = 0;
    imageItems.length = 0;
    ratingItems.length = 0;
    tableItems.length = 0;
    root.querySelectorAll("[data-orte-inline-text]").forEach((node) => {
      node.removeAttribute("data-orte-inline-text");
      node.removeAttribute("contenteditable");
    });

    prepareTables();
    normalizeRawImages();
    collectTextItems();
    collectImageItems();
    collectRatingItems();
    collectTableItems();
    renderImageSlots();
    renderRatings();
    renderTableControls();

    if (editMode) {
      textItems.forEach((item) => {
        item.node.contentEditable = "true";
        item.node.spellcheck = true;
      });
    }
  }

  function collectTextItems() {
    let index = 0;
    getEditableCandidates().forEach((node) => {
      const id = `text-${String(index).padStart(4, "0")}`;
      index += 1;
      node.dataset.orteInlineText = id;
      if (state.texts[id] === undefined) state.texts[id] = node.innerHTML;
      textItems.push({ id, node });
    });
  }

  function collectImageItems() {
    root.querySelectorAll("[data-orte-image-key]").forEach((node) => {
      const key = node.dataset.orteImageKey;
      if (!key) return;
      const label = node.dataset.orteImageLabel || key;
      const existingImage = node.querySelector("img");
      const existingLink = existingImage?.closest("a");
      const initialImage = {
        src: existingImage?.getAttribute("src") || "",
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
    root.querySelectorAll("table.pt-s-0040 tr").forEach((row) => {
      const cells = Array.from(row.cells || []);
      if (cells.length < 8) return;
      if (!cells[0]?.querySelector("[data-orte-image-key]")) return;

      [4, 5, 6].forEach((cellIndex) => {
        const cell = cells[cellIndex];
        if (!cell) return;
        const key = cell.dataset.orteRatingKey || `rating-${String(index).padStart(4, "0")}`;
        index += 1;
        cell.dataset.orteRatingKey = key;
        cell.dataset.orteRatingKind = cellIndex === 5 ? "ruf" : "stern";
        if (state.ratings[key] === undefined) state.ratings[key] = inferRatingValue(cell);
        ratingItems.push({ key, node: cell, kind: cell.dataset.orteRatingKind });
      });
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

  function getEditableCandidates() {
    return Array.from(root.querySelectorAll("h2, h3, summary, p, td, th, li"))
      .filter((node) => !node.closest(".orte-scene-host, .orte-session-modal, .place-template-toc, .orte-inline-toolbar, .orte-inline-image-panel, .orte-table-add-control"))
      .filter((node) => !node.closest("[data-orte-image-key], [data-orte-rating-key]"))
      .filter((node) => !node.matches(".place-spacer"))
      .filter((node) => !node.querySelector("table, h2, h3, summary, p, td, th, li, [data-orte-image-key], [data-orte-rating-key]"))
      .filter((node) => normalizeWhitespace(node.textContent));
  }

  function getEditableTables() {
    return Array.from(root.querySelectorAll("table"))
      .filter((table) => !table.querySelector("table"))
      .filter((table) => table.tBodies.length && table.tBodies[0].rows.length > 1)
      .filter((table) => !table.closest(".orte-scene-host, .orte-session-modal"));
  }

  function prepareTables() {
    getEditableTables().forEach((table, index) => {
      table.dataset.orteTableId = table.dataset.orteTableId || `table-${String(index).padStart(4, "0")}`;
    });
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
      const key = makeKey("auto-slot");
      slot.dataset.orteImageKey = key;
      slot.dataset.orteImageLabel = slot.dataset.orteImageLabel || "Bildplatzhalter";
      slot.setAttribute("aria-label", slot.dataset.orteImageLabel);
    });

    root.querySelectorAll("img").forEach((image) => {
      if (image.closest("[data-orte-image-key], .orte-scene-host, .orte-session-modal, .orte-inline-toolbar, .orte-inline-image-panel")) return;

      const key = image.dataset.orteInlineImageKey || makeKey("auto-img");
      const label = image.getAttribute("alt") || "Bildplatzhalter";
      const slot = document.createElement("span");
      slot.className = "orte-image-slot has-image";
      slot.dataset.orteImageKey = key;
      slot.dataset.orteImageLabel = label;
      slot.setAttribute("aria-label", label);
      image.dataset.orteInlineImageKey = key;
      image.replaceWith(slot);
      slot.appendChild(image);
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
      item.node.innerHTML = `<span class="orte-image-placeholder" role="img" aria-label="${escapeAttr(item.label)}">Bildplatzhalter</span>${editHint}`;
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
    document.querySelectorAll(".orte-table-add-control").forEach((control) => control.remove());
    tableItems.forEach((item) => {
      const control = document.createElement("div");
      control.className = "orte-table-add-control";
      control.innerHTML = `<button type="button" data-action="add-orte-table-row" data-orte-table-target="${escapeAttr(item.id)}">+ Zeile</button>`;
      item.table.insertAdjacentElement("afterend", control);
    });
  }

  function openImagePanel(key) {
    const item = imageItems.find((entry) => entry.key === key);
    if (!item) return;

    activeImageKey = key;
    closeImagePanel();

    const image = state.images[key] || {};
    const panel = document.createElement("div");
    panel.className = "orte-inline-image-panel";
    panel.dataset.orteImagePanel = key;
    panel.innerHTML = `
      <div class="orte-inline-image-panel-head">
        <strong>${escapeHtml(item.label)}</strong>
        <button type="button" data-action="close-orte-image-panel" aria-label="Schliessen">x</button>
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
          <span>Hoehe</span>
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
            ${renderOption("cover", "Fuellen", image.fit)}
          </select>
        </label>
      </div>
      <button type="button" data-action="clear-orte-image">Bild leeren</button>
    `;
    item.node.insertAdjacentElement("afterend", panel);
  }

  function closeImagePanel() {
    document.querySelectorAll("[data-orte-image-panel]").forEach((panel) => panel.remove());
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
    updateOwningTable(input);
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

  function addGenericTableRow(table) {
    const tbody = table.tBodies[0];
    const candidate = Array.from(tbody.rows).reverse().find((row) => isCloneableDataRow(row, table));
    if (!candidate) return;

    const clone = candidate.cloneNode(true);
    resetClonedFragment(clone);
    candidate.insertAdjacentElement("afterend", clone);
  }

  function addPersonalityRows(table) {
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    const startIndex = rows.map((row, index) => row.querySelector(".pt-s-0077") ? index : -1)
      .filter((index) => index >= 0)
      .pop();
    if (startIndex === undefined) return;

    const group = rows.slice(startIndex, Math.min(startIndex + 4, rows.length));
    const clones = group.map((row) => {
      const clone = row.cloneNode(true);
      resetClonedFragment(clone);
      return clone;
    });
    group[group.length - 1].after(...clones);
  }

  function isCloneableDataRow(row, table) {
    const cells = Array.from(row.cells || []);
    if (cells.length <= 1) return false;
    if (row.querySelector("th")) return false;
    const tableWidth = table.rows[0]?.cells?.length || cells.length;
    return !cells.some((cell) => Number(cell.colSpan || 1) >= tableWidth && cells.length === 1);
  }

  function resetClonedFragment(fragment) {
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

  function applyPayload(payload, options = {}) {
    if (!payload) return;

    if (!options.skipTables && payload.tables) {
      applyTablePayload(payload.tables);
      rebuildTargets();
    }

    Object.entries(payload.texts || {}).forEach(([id, html]) => {
      state.texts[id] = String(html || "");
      const item = textItems.find((entry) => entry.id === id);
      if (item) item.node.innerHTML = state.texts[id];
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
    state.texts[editable.dataset.orteInlineText] = editable.innerHTML;
    updateOwningTable(editable);
  }

  function updateTableState(table) {
    const id = table?.dataset?.orteTableId;
    if (!id) return;
    state.tables[id] = getTableHtml(table);
  }

  function getTableHtml(table) {
    const tbody = table.tBodies[0];
    if (!tbody) return "";
    const clone = tbody.cloneNode(true);
    clone.querySelectorAll("[contenteditable]").forEach((node) => node.removeAttribute("contenteditable"));
    clone.querySelectorAll(".orte-inline-image-panel, .orte-table-add-control, .orte-inline-image-hint").forEach((node) => node.remove());
    clone.querySelectorAll("[data-orte-rating-key]").forEach((node) => {
      const key = node.dataset.orteRatingKey;
      const kind = node.dataset.orteRatingKind || "stern";
      const value = clampRating(state.ratings[key] || node.dataset.orteRatingValue);
      node.dataset.orteRatingValue = String(value);
      node.innerHTML = `<b><span class="orte-rating-display">${formatRating(value, kind)}</span></b>`;
    });
    return clone.innerHTML;
  }

  function markDirty() {
    dirty = true;
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

  async function connectRemote() {
    const store = await waitForInlineStore();
    if (!store?.subscribe) return;

    store.subscribe(pageId, (payload) => {
      if (!payload || dirty) return;
      applyPayload(payload);
      saveLocal(payload);
      setStatus("online geladen");
    }, () => {
      setStatus("online nicht erreichbar");
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
      texts: { ...state.texts },
      tables: { ...state.tables },
      ratings: { ...state.ratings },
      images: Object.fromEntries(Object.entries(state.images).map(([key, image]) => [key, normalizeImageState(image, key)]))
    };
  }

  function applyTextCommand(command, value = null) {
    if (!editMode || !command) return;
    const editable = restoreSelection();
    if (!editable) return;
    document.execCommand(command, false, value);
    persistEditable(editable);
    rememberSelection();
    markDirty();
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

  function normalizeImageState(image, label) {
    const source = image && typeof image === "object" ? image : {};
    return {
      src: String(source.src || ""),
      href: String(source.href || ""),
      alt: String(source.alt || label || ""),
      width: clampNumber(source.width, 20, 100, 100),
      maxHeight: clampNumber(source.maxHeight, 80, 720, 260),
      format: ["auto", "square", "portrait", "landscape", "banner"].includes(source.format) ? source.format : "auto",
      fit: ["contain", "cover"].includes(source.fit) ? source.fit : "contain"
    };
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

  function setStatus(message) {
    const status = document.querySelector("[data-orte-inline-status]");
    if (status) status.textContent = message;
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
})();
