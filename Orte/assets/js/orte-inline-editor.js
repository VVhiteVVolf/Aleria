(function () {
  "use strict";

  const root = document.querySelector("[data-orte-static-template]");
  if (!root) return;

  const pageId = getPageId();
  const storageKey = `aleria:orte:inline-content:${pageId}`;
  const state = { texts: {}, images: {} };
  const textItems = [];
  const imageItems = [];

  let editMode = false;
  let saveTimer = 0;
  let dirty = false;
  let activeImageKey = "";

  init();

  function init() {
    collectTextItems();
    collectImageItems();
    applyPayload(loadLocal());
    renderImageSlots();
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
      const editable = event.target.closest("[data-orte-inline-text]");
      if (editable && editMode) {
        state.texts[editable.dataset.orteInlineText] = editable.innerHTML;
        markDirty();
        return;
      }

      const imageInput = event.target.closest("[data-orte-inline-image-field]");
      if (imageInput) {
        updateImageField(imageInput);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeImagePanel();
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
    }
  }

  function setEditMode(enabled) {
    editMode = enabled;
    document.body.classList.toggle("orte-inline-editing", editMode);
    document.querySelector("[data-action='toggle-orte-inline-edit']").textContent = editMode ? "Ansicht" : "Bearbeiten";

    textItems.forEach((item) => {
      item.node.contentEditable = String(editMode);
      item.node.spellcheck = true;
    });

    renderImageSlots();
    if (!editMode) closeImagePanel();
  }

  function collectTextItems() {
    let index = 0;
    getEditableCandidates().forEach((node) => {
      const id = `text-${String(index).padStart(4, "0")}`;
      index += 1;
      node.dataset.orteInlineText = id;
      state.texts[id] = node.innerHTML;
      textItems.push({ id, node });
    });
  }

  function collectImageItems() {
    root.querySelectorAll("[data-orte-image-key]").forEach((node) => {
      const key = node.dataset.orteImageKey;
      if (!key) return;
      const label = node.dataset.orteImageLabel || key;
      state.images[key] = { src: "", href: "", alt: label, ...(state.images[key] || {}) };
      imageItems.push({ key, label, node });
    });
  }

  function getEditableCandidates() {
    return Array.from(root.querySelectorAll("h2, h3, summary, p, td, th, span, b, strong, i, li"))
      .filter((node) => !node.closest(".orte-scene-host, .orte-session-modal, .place-template-toc, .orte-inline-toolbar, .orte-inline-image-panel"))
      .filter((node) => !node.closest("[data-orte-image-key]"))
      .filter((node) => !node.matches(".place-spacer"))
      .filter((node) => !node.querySelector("table, h2, h3, summary, p, td, th, span, b, strong, i, li, [data-orte-image-key]"))
      .filter((node) => normalizeWhitespace(node.textContent));
  }

  function renderImageSlots() {
    imageItems.forEach((item) => renderImageSlot(item.key));
  }

  function renderImageSlot(key) {
    const item = imageItems.find((entry) => entry.key === key);
    if (!item) return;

    const image = state.images[key] || {};
    const alt = image.alt || item.label;
    item.node.classList.toggle("has-image", !!image.src);

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
    renderImageSlot(activeImageKey);
    markDirty();
  }

  function clearActiveImage() {
    if (!activeImageKey) return;
    const item = imageItems.find((entry) => entry.key === activeImageKey);
    state.images[activeImageKey] = { src: "", href: "", alt: item?.label || "" };
    renderImageSlot(activeImageKey);
    closeImagePanel();
    markDirty();
  }

  function applyPayload(payload) {
    if (!payload) return;

    Object.entries(payload.texts || {}).forEach(([id, html]) => {
      state.texts[id] = String(html || "");
      const item = textItems.find((entry) => entry.id === id);
      if (item) item.node.innerHTML = state.texts[id];
    });

    Object.entries(payload.images || {}).forEach(([key, image]) => {
      state.images[key] = {
        ...(state.images[key] || {}),
        ...(image || {})
      };
    });
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
      renderImageSlots();
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
    return {
      texts: { ...state.texts },
      images: Object.fromEntries(Object.entries(state.images).map(([key, image]) => [key, { ...image }]))
    };
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
