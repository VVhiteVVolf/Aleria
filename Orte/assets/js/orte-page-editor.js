(function () {
  "use strict";

  const root = document.querySelector("[data-orte-static-template]");
  if (!root) return;

  const pageId = getPageId();
  const storageKey = `aleria:orte:page-editor:${pageId}`;
  const layoutKey = "aleria:orte:page-editor-width";
  const editorState = {
    texts: {},
    images: {}
  };
  const textItems = [];
  const imageItems = [];

  let editMode = false;
  let activeTab = "texts";
  let saveTimer = 0;
  let remoteReady = false;
  let splitterDrag = null;

  init();

  function init() {
    restoreEditorLayout();
    transformImagePlaceholders();
    collectEditableText();
    collectImageSlots();
    applySavedState(loadLocal());
    renderShell();
    renderDock();
    wireEvents();
    connectRemoteStore();
  }

  function renderShell() {
    const bar = document.createElement("div");
    bar.className = "orte-editor-bar";
    bar.innerHTML = `
      <div>
        <strong>Orte-Editor</strong>
        <span class="orte-editor-status" data-orte-editor-status>bereit</span>
      </div>
      <div class="orte-editor-actions">
        <button type="button" data-action="toggle-orte-page-editor">Bearbeiten</button>
        <button type="button" data-action="save-orte-page" data-orte-editor-only>Speichern</button>
        <button type="button" data-action="export-orte-page" data-orte-editor-only>Export JSON</button>
        <button type="button" data-action="reset-orte-page-local" data-orte-editor-only>Lokale Kopie verwerfen</button>
      </div>
    `;
    document.body.prepend(bar);

    const dock = document.createElement("aside");
    dock.className = "orte-editor-dock";
    dock.setAttribute("aria-label", "Orte-Bearbeitung");
    document.body.insertBefore(dock, root);

    const splitter = document.createElement("button");
    splitter.type = "button";
    splitter.className = "orte-editor-splitter";
    splitter.dataset.orteEditorSplitter = "";
    splitter.setAttribute("aria-label", "Breite zwischen Bearbeitung und Livevorschau anpassen");
    splitter.setAttribute("aria-orientation", "vertical");
    document.body.insertBefore(splitter, root);
  }

  function renderDock() {
    const dock = document.querySelector(".orte-editor-dock");
    if (!dock) return;
    const scrollTop = dock.querySelector(".orte-editor-body")?.scrollTop || 0;

    dock.innerHTML = `
      <header class="orte-editor-head">
        <strong>Grossstadt bearbeiten</strong>
        <span>${escapeHtml(pageId)} - Livevorschau rechts</span>
      </header>
      <nav class="orte-editor-tabs" aria-label="Bearbeitungsbereiche">
        ${renderTabButton("texts", "Texte")}
        ${renderTabButton("images", "Bilder")}
      </nav>
      <div class="orte-editor-body">
        ${activeTab === "images" ? renderImagesEditor() : renderTextsEditor()}
      </div>
    `;

    dock.querySelector(".orte-editor-body")?.scrollTo(0, scrollTop);
  }

  function renderTabButton(id, label) {
    return `<button type="button" class="${activeTab === id ? "is-active" : ""}" data-orte-editor-tab="${escapeAttr(id)}">${escapeHtml(label)}</button>`;
  }

  function renderTextsEditor() {
    if (!textItems.length) return `<p class="orte-editor-empty">Keine Textfelder gefunden.</p>`;

    const bySection = groupTextItems();
    return Array.from(bySection.entries()).map(([section, items]) => `
      <section class="orte-editor-section">
        <h2>${escapeHtml(section)}</h2>
        ${items.map((item) => `
          <label class="orte-editor-field">
            <span>${escapeHtml(item.label)}</span>
            <textarea class="orte-editor-textarea" data-orte-editor-text="${escapeAttr(item.id)}">${escapeHtml(item.node.textContent.trim())}</textarea>
          </label>
        `).join("")}
      </section>
    `).join("");
  }

  function renderImagesEditor() {
    if (!imageItems.length) return `<p class="orte-editor-empty">Keine Bildslots gefunden.</p>`;

    return imageItems.map((item) => {
      const image = editorState.images[item.key] || {};
      return `
        <section class="orte-editor-section">
          <h2>${escapeHtml(item.label)}</h2>
          <div class="orte-editor-image-preview" data-orte-image-preview="${escapeAttr(item.key)}">
            ${image.src ? `<img src="${escapeAttr(image.src)}" alt="${escapeAttr(image.alt || item.label)}" loading="lazy" decoding="async">` : "Bildplatzhalter"}
          </div>
          <label class="orte-editor-field">
            <span>Bild-URL</span>
            <input class="orte-editor-input" data-orte-editor-image="${escapeAttr(item.key)}" data-orte-image-field="src" value="${escapeAttr(image.src || "")}" placeholder="https://...">
          </label>
          <label class="orte-editor-field">
            <span>Alt-Text</span>
            <input class="orte-editor-input" data-orte-editor-image="${escapeAttr(item.key)}" data-orte-image-field="alt" value="${escapeAttr(image.alt || item.label)}">
          </label>
          <label class="orte-editor-field">
            <span>Link</span>
            <input class="orte-editor-input" data-orte-editor-image="${escapeAttr(item.key)}" data-orte-image-field="href" value="${escapeAttr(image.href || "")}" placeholder="Optionaler Link">
          </label>
        </section>
      `;
    }).join("");
  }

  function wireEvents() {
    document.addEventListener("click", (event) => {
      const actionTarget = event.target.closest("[data-action]");
      if (actionTarget) handleAction(event, actionTarget);

      const tab = event.target.closest("[data-orte-editor-tab]");
      if (tab) {
        activeTab = tab.dataset.orteEditorTab || "texts";
        renderDock();
      }
    });

    document.addEventListener("input", (event) => {
      const textInput = event.target.closest("[data-orte-editor-text]");
      if (textInput) {
        updateTextFromDock(textInput);
        return;
      }

      const imageInput = event.target.closest("[data-orte-editor-image]");
      if (imageInput) {
        updateImageFromDock(imageInput);
        return;
      }

      const editable = event.target.closest("[data-orte-edit-id]");
      if (editable && editMode) {
        editorState.texts[editable.dataset.orteEditId] = editable.innerHTML;
        scheduleSave();
      }
    });

    document.addEventListener("focusin", (event) => {
      const editable = event.target.closest("[data-orte-edit-id]");
      if (!editable) return;
      document.querySelectorAll(".orte-editable-active").forEach((node) => node.classList.remove("orte-editable-active"));
      editable.classList.add("orte-editable-active");
    });

    document.addEventListener("focusout", (event) => {
      const editable = event.target.closest("[data-orte-edit-id]");
      if (editable) editable.classList.remove("orte-editable-active");
    });

    document.addEventListener("pointerdown", (event) => {
      const splitter = event.target.closest("[data-orte-editor-splitter]");
      if (!splitter || !editMode) return;
      splitterDrag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startWidth: getEditorWidth()
      };
      splitter.setPointerCapture?.(event.pointerId);
      document.body.classList.add("orte-editor-resizing");
    });

    document.addEventListener("pointermove", (event) => {
      if (!splitterDrag || event.pointerId !== splitterDrag.pointerId) return;
      setEditorWidth(splitterDrag.startWidth + event.clientX - splitterDrag.startX);
    });

    document.addEventListener("pointerup", (event) => {
      if (!splitterDrag || event.pointerId !== splitterDrag.pointerId) return;
      splitterDrag = null;
      document.body.classList.remove("orte-editor-resizing");
      saveEditorLayout();
    });
  }

  function handleAction(event, target) {
    const action = target.dataset.action;
    if (action === "toggle-orte-page-editor") {
      editMode = !editMode;
      document.body.classList.toggle("orte-page-editor-open", editMode);
      root.querySelectorAll("[data-orte-edit-id]").forEach((node) => {
        node.contentEditable = String(editMode);
        node.spellcheck = true;
      });
      target.textContent = editMode ? "Ansicht" : "Bearbeiten";
      renderDock();
      event.preventDefault();
      return;
    }

    if (action === "save-orte-page") {
      saveNow();
      event.preventDefault();
      return;
    }

    if (action === "export-orte-page") {
      exportJson();
      event.preventDefault();
      return;
    }

    if (action === "reset-orte-page-local") {
      window.localStorage.removeItem(storageKey);
      setStatus("lokale Kopie verworfen");
      event.preventDefault();
    }
  }

  function updateTextFromDock(input) {
    const id = input.dataset.orteEditorText;
    const item = textItems.find((entry) => entry.id === id);
    if (!item) return;

    item.node.textContent = input.value;
    editorState.texts[id] = item.node.innerHTML;
    scheduleSave();
  }

  function updateImageFromDock(input) {
    const key = input.dataset.orteEditorImage;
    const field = input.dataset.orteImageField;
    if (!key || !field) return;

    editorState.images[key] = {
      ...(editorState.images[key] || {}),
      [field]: input.value
    };

    renderImageSlot(key);
    refreshImagePreview(key);
    scheduleSave();
  }

  function transformImagePlaceholders() {
    const candidates = Array.from(root.querySelectorAll("p, td, th, span, b, strong"))
      .filter((node) => !node.closest(".orte-scene-host"))
      .filter((node) => !node.querySelector("table, .orte-image-slot"))
      .map((node) => ({ node, text: normalizeWhitespace(node.textContent) }))
      .filter((item) => getImagePlaceholderLabel(item.text));

    candidates.sort((a, b) => getDepth(b.node) - getDepth(a.node));

    candidates.forEach(({ node, text }) => {
      if (!node.isConnected || node.querySelector(".orte-image-slot") || node.closest(".orte-image-slot")) return;
      const label = getImagePlaceholderLabel(text);
      if (!label) return;
      const key = uniqueImageKey(label);
      node.innerHTML = "";
      node.appendChild(createImageSlot(key, label));
    });
  }

  function createImageSlot(key, label) {
    const slot = document.createElement("span");
    slot.className = "orte-image-slot";
    slot.dataset.orteImageKey = key;
    slot.dataset.orteImageLabel = label;
    slot.setAttribute("aria-label", label);
    return slot;
  }

  function collectEditableText() {
    textItems.length = 0;
    let index = 0;

    getEditableCandidates().forEach((node) => {
      const text = normalizeWhitespace(node.textContent);
      if (!text) return;
      const id = `text-${String(index).padStart(4, "0")}`;
      index += 1;
      node.dataset.orteEditId = id;
      editorState.texts[id] = node.innerHTML;
      textItems.push({
        id,
        node,
        section: findSectionTitle(node),
        label: buildTextLabel(node, text, index)
      });
    });
  }

  function collectImageSlots() {
    imageItems.length = 0;
    root.querySelectorAll("[data-orte-image-key]").forEach((node) => {
      const key = node.dataset.orteImageKey;
      const label = node.dataset.orteImageLabel || key;
      editorState.images[key] = {
        src: "",
        alt: label,
        href: "",
        ...(editorState.images[key] || {})
      };
      imageItems.push({ key, label, node });
      renderImageSlot(key);
    });
  }

  function getEditableCandidates() {
    return Array.from(root.querySelectorAll("h2, h3, summary, p, td, th, span, b, strong, i, li"))
      .filter((node) => !node.closest(".orte-scene-host, .orte-session-modal, .place-template-toc, .orte-editor-dock"))
      .filter((node) => !node.closest(".orte-image-slot"))
      .filter((node) => !node.matches(".place-spacer"))
      .filter((node) => !node.querySelector("table, h2, h3, summary, p, td, th, span, b, strong, i, li, .orte-image-slot"))
      .filter((node) => normalizeWhitespace(node.textContent));
  }

  function renderImageSlot(key) {
    const item = imageItems.find((entry) => entry.key === key);
    if (!item) return;
    const image = editorState.images[key] || {};
    const safeAlt = image.alt || item.label;
    item.node.classList.toggle("has-image", !!image.src);

    if (image.src) {
      item.node.innerHTML = image.href
        ? `<a href="${escapeAttr(image.href)}" target="_blank" rel="noopener"><img src="${escapeAttr(image.src)}" alt="${escapeAttr(safeAlt)}" loading="lazy" decoding="async"></a>`
        : `<img src="${escapeAttr(image.src)}" alt="${escapeAttr(safeAlt)}" loading="lazy" decoding="async">`;
      return;
    }

    item.node.innerHTML = `<span class="orte-image-placeholder" role="img" aria-label="${escapeAttr(item.label)}">Bildplatzhalter</span>`;
  }

  function refreshImagePreview(key) {
    const preview = document.querySelector(`[data-orte-image-preview="${cssEscape(key)}"]`);
    if (!preview) return;
    const item = imageItems.find((entry) => entry.key === key);
    const image = editorState.images[key] || {};
    preview.innerHTML = image.src
      ? `<img src="${escapeAttr(image.src)}" alt="${escapeAttr(image.alt || item?.label || "")}" loading="lazy" decoding="async">`
      : "Bildplatzhalter";
  }

  function applySavedState(saved) {
    if (!saved) return;

    Object.entries(saved.texts || {}).forEach(([id, html]) => {
      editorState.texts[id] = String(html || "");
      const item = textItems.find((entry) => entry.id === id);
      if (item) item.node.innerHTML = editorState.texts[id];
    });

    Object.entries(saved.images || {}).forEach(([key, image]) => {
      editorState.images[key] = {
        ...(editorState.images[key] || {}),
        ...(image || {})
      };
      renderImageSlot(key);
    });
  }

  function groupTextItems() {
    const grouped = new Map();
    textItems.forEach((item) => {
      const section = item.section || "Allgemein";
      if (!grouped.has(section)) grouped.set(section, []);
      grouped.get(section).push(item);
    });
    return grouped;
  }

  function scheduleSave() {
    setStatus("ungespeichert");
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveNow, 700);
  }

  async function saveNow() {
    const payload = cloneState();
    saveLocal(payload);
    setStatus(remoteReady ? "speichere online..." : "lokal gespeichert");

    const store = await waitForPageStore(900);
    if (!store?.savePage) {
      setStatus("lokal gespeichert");
      return;
    }

    try {
      await store.savePage(pageId, payload);
      setStatus("online gespeichert");
    } catch (error) {
      setStatus("lokal gespeichert, online fehlgeschlagen");
    }
  }

  async function connectRemoteStore() {
    const store = await waitForPageStore();
    if (!store?.subscribePage) return;
    remoteReady = true;
    store.subscribePage(pageId, (payload) => {
      if (!payload) return;
      applySavedState(payload);
      saveLocal(payload);
      renderDock();
      setStatus("online geladen");
    }, () => {
      remoteReady = false;
      setStatus("online nicht erreichbar");
    });
  }

  function waitForPageStore(timeout = 5000) {
    if (window.OrtePageFirebase) return Promise.resolve(window.OrtePageFirebase);

    return new Promise((resolve) => {
      let finished = false;
      const finish = (store) => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        window.removeEventListener("orte-page-firebase-ready", onReady);
        resolve(store || null);
      };
      const onReady = () => finish(window.OrtePageFirebase);
      const timer = window.setTimeout(() => finish(null), timeout);
      window.addEventListener("orte-page-firebase-ready", onReady, { once: true });
      if (window.OrtePageFirebase) finish(window.OrtePageFirebase);
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

  function cloneState() {
    return {
      texts: { ...editorState.texts },
      images: Object.fromEntries(Object.entries(editorState.images).map(([key, image]) => [key, { ...image }]))
    };
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(cloneState(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${pageId}-seite.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function findSectionTitle(node) {
    const row = node.closest("tr");
    const heading = row?.querySelector("h2") || previousHeading(row || node);
    return normalizeWhitespace(heading?.textContent) || "Allgemein";
  }

  function previousHeading(node) {
    let current = node;
    while (current) {
      let sibling = current.previousElementSibling;
      while (sibling) {
        const found = sibling.querySelector?.("h2, h3") || (sibling.matches?.("h2, h3") ? sibling : null);
        if (found) return found;
        sibling = sibling.previousElementSibling;
      }
      current = current.parentElement;
    }
    return null;
  }

  function buildTextLabel(node, text, index) {
    const tag = node.tagName.toLowerCase();
    const preview = text.length > 46 ? `${text.slice(0, 46)}...` : text;
    return `${index}. ${tag} - ${preview}`;
  }

  function getImagePlaceholderLabel(text) {
    const match = String(text || "").match(/\[([^\]]+\.(?:png|jpg|jpeg|webp|gif))\](?:\s*\+\s*link[^\]]*)?/i);
    return match ? match[1].trim() : "";
  }

  function uniqueImageKey(label) {
    const base = slugify(label);
    let key = base;
    let index = 2;
    while (editorState.images[key] || imageItems.some((item) => item.key === key) || root.querySelector(`[data-orte-image-key="${cssEscape(key)}"]`)) {
      key = `${base}-${index}`;
      index += 1;
    }
    editorState.images[key] = { src: "", alt: label, href: "" };
    return key;
  }

  function getPageId() {
    return String(window.AleriaOrteScenes?.ortId || window.ORTE_CONFIG?.docId || "grossstadt-vorlage");
  }

  function restoreEditorLayout() {
    const width = Number(window.localStorage.getItem(layoutKey));
    if (Number.isFinite(width) && width > 0) setEditorWidth(width);
  }

  function saveEditorLayout() {
    window.localStorage.setItem(layoutKey, String(getEditorWidth()));
  }

  function getEditorWidth() {
    const configured = getComputedStyle(document.body).getPropertyValue("--orte-editor-width").trim();
    const parsed = Number.parseFloat(configured);
    return Number.isFinite(parsed) ? parsed : 680;
  }

  function setEditorWidth(width) {
    const max = Math.max(430, window.innerWidth - 360);
    const next = Math.max(390, Math.min(max, Math.round(width)));
    document.body.style.setProperty("--orte-editor-width", `${next}px`);
  }

  function setStatus(message) {
    const status = document.querySelector("[data-orte-editor-status]");
    if (status) status.textContent = message;
  }

  function normalizeWhitespace(value) {
    return String(value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  }

  function getDepth(node) {
    let depth = 0;
    let current = node;
    while (current?.parentElement) {
      depth += 1;
      current = current.parentElement;
    }
    return depth;
  }

  function slugify(value) {
    return String(value || "bild")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "bild";
  }

  function cssEscape(value) {
    if (window.CSS?.escape) return window.CSS.escape(value);
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
