var currentEntry = null;
var currentPage = 0;
var _inlineModuleEdit = null;
var _characters = window._characters || [];
var _charTabMap = window._charTabMap || {};
var _charSubtabMap = window._charSubtabMap || {};
var _hiddenBuiltinCharacterIds = window._hiddenBuiltinCharacterIds || new Set();

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getValidSections() {
  return [];
}

function getRenderableEntry(entry) {
  return entry;
}

function isInlineEditingEntry() {
  return false;
}

function getPages(entry) {
  return Array.isArray(entry?.pages) ? entry.pages : [];
}

function getModuleCastIdsFromSource(source) {
  const ids = [];
  const add = (value) => {
    const safe = String(value || "").trim();
    if (safe && !ids.includes(safe)) ids.push(safe);
  };

  if (Array.isArray(source?.sessionCast)) source.sessionCast.forEach(add);
  if (Array.isArray(source?.cast)) source.cast.forEach(add);
  if (Array.isArray(source?.characters)) source.characters.forEach(add);
  if (Array.isArray(source?.sessionCastDetails)) {
    source.sessionCastDetails.forEach((item) => add(item?.id || item?.characterId || item?.name));
  }
  return ids;
}

function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  if (typeof deactivateDialog === "function") deactivateDialog("modal-overlay");
  else overlay?.classList.remove("active");
  document.body.style.overflow = "";
  if (typeof syncSessionFocusShell === "function") syncSessionFocusShell(false);
  if (typeof stopCommentLiveUpdates === "function") stopCommentLiveUpdates();
  currentEntry = null;
  currentPage = 0;
}

function flipPage(direction) {
  if (!currentEntry) return;
  const pages = getPages(currentEntry);
  const next = currentPage + Number(direction || 0);
  if (next < 0 || next >= pages.length) return;
  currentPage = next;
  renderPage(currentPage, direction);
}

function jumpToPage(targetPage) {
  if (!currentEntry) return;
  const pages = getPages(currentEntry);
  const next = Math.max(0, Math.min(pages.length - 1, Number(targetPage) || 0));
  if (next === currentPage) return;
  const direction = next > currentPage ? 1 : -1;
  currentPage = next;
  renderPage(currentPage, direction);
}

function renderPage(pageIndex, direction) {
  if (!currentEntry || typeof buildSessionPage !== "function") return;
  const entry = getRenderableEntry(currentEntry);
  const pages = getPages(entry);
  const page = pages[pageIndex] || pages[0];
  const body = document.getElementById("modal-body");
  if (!body || !page) return;

  applyOrteSessionModalTheme(entry);
  const html = buildSessionPage(page, entry, pageIndex, pages.length);
  body.innerHTML = `<div class="flip-scene"><div class="flip-page">${html}</div></div>`;

  if (typeof applyCommentReaderSettings === "function") applyCommentReaderSettings();
  if (typeof initResizer === "function") initResizer();
  if (typeof resetScroll === "function") resetScroll();

  const thread = typeof getCommentThreadForPage === "function"
    ? getCommentThreadForPage(page, entry, pageIndex)
    : null;
  if (thread?.threadId) {
    if (typeof requestCommentAutoScroll === "function" && Number(direction) === 0) {
      requestCommentAutoScroll(thread.threadId);
    }
    if (typeof loadCommentsIntoPage === "function") loadCommentsIntoPage(thread.threadId);
  } else if (typeof stopCommentLiveUpdates === "function") {
    stopCommentLiveUpdates();
  }
}

function applyOrteSessionModalTheme(entry) {
  const card = document.querySelector("#modal-overlay .modal-card");
  if (!card) return;
  const width = clampOrteModuleSize(entry?.moduleWidth, 100);
  const height = clampOrteModuleSize(entry?.moduleHeight, 100);
  card.style.setProperty("--module-width", `${width}vw`);
  card.style.setProperty("--module-height", `${height}vh`);
  card.dataset.entryTheme = "archive";
}

function clampOrteModuleSize(value, fallback) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : fallback;
  return Math.max(60, Math.min(100, Math.round(safe)));
}

function exportCurrentModule() {
  if (!currentEntry) return;
  const payload = {
    schema: "aleria-orte-session-entry-v1",
    exportedAt: new Date().toISOString(),
    entry: currentEntry
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${currentEntry.id || "orte-session"}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function openModuleEditorForCurrent() {
  if (window.AleriaOrteSceneRuntime?.openEditorForCurrent) {
    window.AleriaOrteSceneRuntime.openEditorForCurrent();
    return;
  }
  if (typeof showAppStatus === "function") showAppStatus("Der Orte-Szeneneditor ist noch nicht bereit.", "error");
}

(function () {
  "use strict";

  const hosts = Array.from(document.querySelectorAll("[data-orte-scene]"));
  const ALMANACH_BASE = "/AleriaAlmanach/";
  const config = window.AleriaOrteScenes || {};
  const states = new Map();
  const hostMap = new Map(hosts.map((host) => [String(host.dataset.orteScene || "").trim(), host]));
  const ortId = String(config.ortId || "ort-vorlage");
  const indexStorageKey = `aleria:orte:scene-index:${ortId}`;
  let sceneOrder = [];
  let sidebar = null;
  let sidebarOpen = false;
  let saveIndexTimer = 0;
  let runtimePromise = null;

  const stylePaths = [
    { href: "styles/modal.css?v=orte-almanach-session-v1" },
    { href: "styles/comments.css?v=orte-almanach-session-v1" },
    { href: "styles/comment-character-picker.css?v=orte-almanach-session-v1" },
    { href: "styles/module-editor.css?v=orte-almanach-editor-v1" },
    { href: "styles/module-page-boards.css?v=orte-almanach-editor-v1" },
    { href: "styles/session.css?v=orte-almanach-session-v1" },
    { href: "styles/speaker-profile.css?v=orte-almanach-session-v1" },
    { href: "styles/scene-blocks.css?v=orte-almanach-session-v1" },
    { href: "styles/session-mobile.css?v=orte-almanach-session-v1", media: "(max-width: 760px)" }
  ];

  const scriptPaths = [
    "modules/core/content-safety.js?v=orte-almanach-session-v1",
    "modules/core/app-core.js?v=orte-almanach-editor-v1",
    "modules/app/app-status.js?v=orte-almanach-session-v1",
    "modules/app/dialog-manager.js?v=orte-almanach-session-v1",
    "modules/sync/firebase-sync-status.js?v=orte-almanach-session-v1",
    "modules/session/session-focus.js?v=orte-almanach-session-v1",
    "modules/modal/modal-layout.js?v=orte-almanach-session-v1",
    "modules/comments/comments-render.js?v=orte-almanach-session-v1",
    "modules/comments/comments-showcase-render.js?v=orte-almanach-session-v1",
    "modules/comments/comments-attachment-render.js?v=orte-almanach-session-v1",
    "modules/comments/comments-routing.js?v=orte-almanach-session-v1",
    "modules/comments/comments-toolbar.js?v=orte-almanach-session-v1",
    "modules/rendering/module-renderer.js?v=orte-almanach-session-v1",
    "modules/comments/comments-page.js?v=orte-almanach-session-v1",
    "modules/comments/comments-backend.js?v=orte-almanach-session-v1",
    "modules/comments/comments-form-state.js?v=orte-almanach-session-v1",
    "modules/characters/character-data.js?v=orte-almanach-session-v1",
    "modules/characters/character-comment-picker.js?v=orte-almanach-session-v1",
    "modules/comments/comments-form.js?v=orte-almanach-session-v1",
    "modules/comments/comments-segment-base.js?v=orte-almanach-session-v1",
    "modules/comments/comments-segments.js?v=orte-almanach-session-v1",
    "modules/comments/comments-preview.js?v=orte-almanach-session-v1",
    "modules/comments/comments-richtext.js?v=orte-almanach-session-v1",
    "modules/comments/comments-draft.js?v=orte-almanach-session-v1",
    "modules/comments/comments-turn.js?v=orte-almanach-session-v1",
    "modules/comments/comments-pagination.js?v=orte-almanach-session-v1",
    "modules/comments/comments-thread.js?v=orte-almanach-session-v1",
    "modules/comments/comments-jump.js?v=orte-almanach-session-v1",
    "modules/comments/comments-submit.js?v=orte-almanach-session-v1",
    "modules/comments/comments-showcase.js?v=orte-almanach-session-v1",
    "modules/comments/comments-showcase-submit.js?v=orte-almanach-session-v1",
    "modules/comments/comments-showcase-edit-submit.js?v=orte-almanach-session-v1",
    "modules/comments/comments-showcase-profile.js?v=orte-almanach-session-v1",
    "modules/comments/comments-attachments.js?v=orte-almanach-session-v1",
    "modules/comments/comments-edit-state.js?v=orte-almanach-session-v1",
    "modules/comments/comments-edit-segments.js?v=orte-almanach-session-v1",
    "modules/comments/comments-edit-preview.js?v=orte-almanach-session-v1",
    "modules/comments/comments-edit.js?v=orte-almanach-session-v1",
    "modules/comments/comments-edit-character-picker.js?v=orte-almanach-session-v1",
    "modules/comments/comments-edit-submit.js?v=orte-almanach-session-v1",
    "modules/comments/comments-delete.js?v=orte-almanach-session-v1",
    "modules/comments/comments-markup.js?v=orte-almanach-session-v1",
    "modules/comments/comments-session-io.js?v=orte-almanach-session-v1",
    "modules/aleria-gpt/aleria-gpt-config.js?v=orte-almanach-session-v1",
    "modules/aleria-gpt/aleria-gpt-client.js?v=orte-almanach-session-v1",
    "modules/aleria-gpt/aleria-gpt-context-builder.js?v=orte-almanach-session-v1",
    "modules/aleria-gpt/aleria-gpt-retrieval.js?v=orte-almanach-session-v1",
    "modules/comments/comments-assistant.js?v=orte-almanach-session-v1",
    "modules/comments/comments-segment-events.js?v=orte-almanach-session-v1",
    "modules/comments/comments-input-events.js?v=orte-almanach-session-v1",
    "modules/comments/comments-action-events.js?v=orte-almanach-session-v1",
    "modules/comments/comments-reader-events.js?v=orte-almanach-session-v1",
    "modules/comments/comments-overlay-events.js?v=orte-almanach-session-v1",
    "modules/module-editor/module-editor-auth.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-preview.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-dnd.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-data.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-templates.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-workflow.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-cast-picker.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-simple-lines.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-scene-blocks.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-comment-blocks.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-page-cards.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-artifact.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-profiles.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-wanted.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-session.js?v=orte-almanach-session-v1",
    "modules/module-editor/module-editor-biography.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-bestiary.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-recipe.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-quest.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-tournament.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-caste.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-court.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-pages.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-controller.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-events.js?v=orte-almanach-editor-v1",
    "modules/modal/modal-events.js?v=orte-almanach-session-v1"
  ];

  init();

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) return;
    const action = trigger.dataset.action || "";
    if (!action.startsWith("orte-scene-") && action !== "open-orte-session") return;

    if (action === "open-orte-session") {
      event.preventDefault();
      const state = states.get(trigger.dataset.sceneId || "");
      if (state) openScene(state);
      return;
    }

    if (action === "orte-scene-toggle-sidebar") {
      event.preventDefault();
      setSidebarOpen(!sidebarOpen);
      return;
    }

    if (action === "orte-scene-add") {
      event.preventDefault();
      addScene();
      return;
    }

    if (action === "orte-scene-edit") {
      event.preventDefault();
      const state = states.get(trigger.dataset.sceneId || "");
      if (state) openSceneEditor(state);
      return;
    }

    if (action === "orte-scene-delete") {
      event.preventDefault();
      const state = states.get(trigger.dataset.sceneId || "");
      if (state) deleteScene(state);
      return;
    }

    if (action === "orte-scene-close-editor") {
      event.preventDefault();
      closeSceneEditor();
      return;
    }

    if (action === "orte-scene-save-editor") {
      event.preventDefault();
      saveSceneEditor(trigger.closest("[data-orte-scene-editor]"));
    }
  });

  window.AleriaOrteSceneRuntime = {
    openEditorForCurrent() {
      const sceneId = currentEntry?.orteSceneId || "";
      const state = states.get(sceneId);
      if (state) openSceneEditor(state);
    },
    async hardReset() {
      await hardResetScenes();
    }
  };
  window.AleriaOrteSceneEditor = {
    activeState: null,
    originalSaveModuleFromEditor: null,
    originalDeleteModuleFromEditor: null,
    originalCloseModuleEditor: null
  };

  function init() {
    ensureSidebar();
    const localOrder = loadSceneIndex();
    const configuredOrder = getConfiguredSceneIds();
    sceneOrder = localOrder.length ? localOrder : configuredOrder;
    sceneOrder.forEach((sceneId) => ensureState(sceneId));
    renderAll();
    connectSceneIndex();
  }

  function getConfiguredModule(sceneId) {
    return (config.modules && config.modules[sceneId])
      || (config.scenes && config.scenes[sceneId])
      || null;
  }

  function getConfiguredSceneIds() {
    const modules = config.modules && typeof config.modules === "object" ? Object.keys(config.modules) : [];
    const scenes = config.scenes && typeof config.scenes === "object" ? Object.keys(config.scenes) : [];
    return Array.from(new Set([...modules, ...scenes].map((id) => String(id || "").trim()).filter(Boolean)));
  }

  function normalizeModule(source, sceneId) {
    const raw = source && typeof source === "object" ? source : {};
    const page = raw.page && typeof raw.page === "object" ? raw.page : {};
    const title = String(raw.title || sceneId || "Interaktive Szene");
    const pageTitle = String(page.pageTitle || raw.pageTitle || title);

    return {
      id: String(raw.id || sceneId || "szene"),
      title,
      subtitle: String(raw.subtitle || "Interaktive Szene mit Kommentarfortsetzung"),
      stamp: String(raw.stamp || "SZENE"),
      image: String(raw.image || page.image || ""),
      imageWidth: Number.isFinite(Number(raw.imageWidth ?? page.imageWidth)) ? Number(raw.imageWidth ?? page.imageWidth) : 36,
      page: {
        pageTitle,
        image: String(page.image || raw.image || ""),
        imageWidth: Number.isFinite(Number(page.imageWidth ?? raw.imageWidth)) ? Number(page.imageWidth ?? raw.imageWidth) : 36,
        imageFit: normalizeImageFit(page.imageFit || raw.imageFit),
        imagePosition: normalizeImagePosition(page.imagePosition || raw.imagePosition),
        imageSquare: !!(page.imageSquare || raw.imageSquare),
        imageLandscape: !!(page.imageLandscape || raw.imageLandscape),
        imageSemiLandscape: !!(page.imageSemiLandscape || raw.imageSemiLandscape),
        imageTall: !!(page.imageTall || raw.imageTall),
        sessionIntro: String(page.sessionIntro || raw.sessionIntro || buildLegacySessionIntro(raw.blocks)),
        sessionHint: String(page.sessionHint || raw.sessionHint || "Fuehre diese Szene als Kommentar fort."),
        sessionEmptyTitle: String(page.sessionEmptyTitle || raw.sessionEmptyTitle || "Die Szene ist offen"),
        sessionEmptyText: String(page.sessionEmptyText || raw.sessionEmptyText || "Noch ist kein Beitrag eingetragen."),
        commentThreadKey: String(page.commentThreadKey || raw.commentThreadKey || sceneId || "szene")
      }
    };
  }

  function ensureState(sceneId, moduleSource = null) {
    const id = String(sceneId || "").trim();
    if (!id) return null;
    const existing = states.get(id);
    if (existing) {
      if (moduleSource) existing.module = normalizeModule(moduleSource, id);
      existing.host = hostMap.get(id) || existing.host || null;
      return existing;
    }

    const localModule = loadLocalModule(id);
    const state = {
      host: hostMap.get(id) || null,
      sceneId: id,
      ortId,
      module: normalizeModule(moduleSource || localModule || getConfiguredModule(id), id),
      status: ""
    };
    states.set(id, state);
    connectSceneStore(state);
    return state;
  }

  function renderAll() {
    sceneOrder.forEach((sceneId) => {
      const state = ensureState(sceneId);
      if (state) renderPreview(state);
    });
    renderSidebar();
  }

  function renderPreview(state) {
    if (!state.host) return;
    state.host.innerHTML = `
      <article class="orte-session-preview">
        <div class="orte-session-preview-kicker">Interaktive Szene</div>
        <h3>${escapeHtmlLocal(state.module.title)}</h3>
        <div class="orte-session-preview-actions">
          <button class="orte-session-button" type="button" data-action="open-orte-session" data-scene-id="${escapeAttrLocal(state.sceneId)}">Oeffnen</button>
          <span>${escapeHtmlLocal(state.status)}</span>
        </div>
      </article>
    `;
  }

  function ensureSidebar() {
    if (sidebar) return;
    sidebar = document.createElement("aside");
    sidebar.className = "orte-scene-sidebar";
    sidebar.dataset.open = "false";
    sidebar.innerHTML = `
      <button class="orte-scene-sidebar-toggle" type="button" data-action="orte-scene-toggle-sidebar">Szenen</button>
      <div class="orte-scene-sidebar-panel">
        <div class="orte-scene-sidebar-head">
          <strong>Ortsszenen</strong>
          <button type="button" data-action="orte-scene-add">+ Szene</button>
        </div>
        <div class="orte-scene-sidebar-list" data-orte-scene-list></div>
      </div>
    `;
    document.body.appendChild(sidebar);
  }

  function setSidebarOpen(open) {
    sidebarOpen = !!open;
    if (sidebar) sidebar.dataset.open = sidebarOpen ? "true" : "false";
  }

  function renderSidebar() {
    ensureSidebar();
    const list = sidebar.querySelector("[data-orte-scene-list]");
    if (!list) return;
    if (!sceneOrder.length) {
      list.innerHTML = `<div class="orte-scene-empty">Noch keine Ortsszene angelegt.</div>`;
      return;
    }

    list.innerHTML = sceneOrder.map((sceneId, index) => {
      const state = ensureState(sceneId);
      if (!state) return "";
      return `
        <article class="orte-scene-sidebar-card">
          <div>
            <span>${escapeHtmlLocal(state.module.stamp || `SZENE ${index + 1}`)}</span>
            <strong>${escapeHtmlLocal(state.module.title)}</strong>
          </div>
          <div class="orte-scene-sidebar-actions">
            <button type="button" data-action="open-orte-session" data-scene-id="${escapeAttrLocal(sceneId)}">Oeffnen</button>
            <button type="button" data-action="orte-scene-edit" data-scene-id="${escapeAttrLocal(sceneId)}">Bearbeiten</button>
            <button type="button" data-action="orte-scene-delete" data-scene-id="${escapeAttrLocal(sceneId)}">Loeschen</button>
          </div>
        </article>
      `;
    }).join("");
  }

  async function addScene() {
    const sceneId = createSceneId();
    const state = ensureState(sceneId, createDefaultModule(sceneId, sceneOrder.length + 1));
    sceneOrder.push(sceneId);
    setSidebarOpen(true);
    renderAll();
    persistSceneIndex();
    await saveScene(state);
    openSceneEditor(state);
  }

  function createSceneId() {
    let index = sceneOrder.length + 1;
    let sceneId = `szene-${index}`;
    while (states.has(sceneId) || sceneOrder.includes(sceneId)) {
      index += 1;
      sceneId = `szene-${index}`;
    }
    return sceneId;
  }

  function createDefaultModule(sceneId, index) {
    return {
      id: sceneId,
      title: `Szene ${index}`,
      subtitle: "Interaktive Ortsszene",
      stamp: "ORTSZENE",
      image: "",
      imageWidth: 36,
      threadId: `orte:${ortId}:${sceneId}`,
      page: {
        pageTitle: `${index} - Interaktive Szene`,
        sessionPage: true,
        sessionIntro: "Beschreibe Ort, Anlass und Stimmung. Der eigentliche Szenenverlauf entsteht spaeter ueber Kommentare.",
        sessionHint: "Fuehre diese Szene als Kommentar fort.",
        sessionEmptyTitle: "Die Szene ist offen",
        sessionEmptyText: "Noch ist kein Beitrag eingetragen.",
        commentThreadKey: sceneId
      }
    };
  }

  async function deleteScene(state) {
    const confirmed = window.confirm(`Szene "${state.module.title}" aus dieser Orte-Vorlage loeschen? Almanach-Kommentare werden nicht geloescht.`);
    if (!confirmed) return;
    sceneOrder = sceneOrder.filter((id) => id !== state.sceneId);
    if (state.unsubscribeScene) state.unsubscribeScene();
    states.delete(state.sceneId);
    removeLocalModule(state.sceneId);
    renderAll();
    persistSceneIndex();
    const store = await waitForSceneStore(900);
    if (store?.deleteScene) await store.deleteScene(ortId, state.sceneId);
  }

  async function openScene(state) {
    await ensureRuntime();
    await loadAlmanachCharacters();

    currentEntry = buildAlmanachEntry(state);
    currentPage = 0;
    renderPage(0, 0);
    document.body.style.overflow = "hidden";
    if (typeof activateDialog === "function") {
      activateDialog("modal-overlay", { initialFocus: ".modal-close" });
    } else {
      document.getElementById("modal-overlay")?.classList.add("active");
    }
    if (typeof refreshCurrentModuleCommenterHighlights === "function") {
      refreshCurrentModuleCommenterHighlights();
    }
  }

  function buildAlmanachEntry(state) {
    const module = state.module;
    const page = module.page;
    const entryId = `orte:${state.ortId}:${state.sceneId}`;
    return {
      id: entryId,
      orteSceneId: state.sceneId,
      title: module.title,
      subtitle: module.subtitle,
      type: "Interaktive Szene",
      category: "Orte",
      stamp: module.stamp,
      image: module.image || "",
      appendCommentsPage: false,
      multipage: true,
      moduleWidth: 100,
      moduleHeight: 100,
      pages: [{
        sessionPage: true,
        pageTitle: page.pageTitle,
        image: page.image || module.image || "",
        imageWidth: page.imageWidth || module.imageWidth,
        imageFit: page.imageFit,
        imagePosition: page.imagePosition,
        imageSquare: page.imageSquare,
        imageLandscape: page.imageLandscape,
        imageSemiLandscape: page.imageSemiLandscape,
        imageTall: page.imageTall,
        commentThreadKey: page.commentThreadKey || state.sceneId || "szene",
        sessionIntro: page.sessionIntro,
        sessionHint: page.sessionHint,
        sessionEmptyTitle: page.sessionEmptyTitle,
        sessionEmptyText: page.sessionEmptyText
      }]
    };
  }

  async function openSceneEditor(state) {
    await ensureRuntime();
    await loadAlmanachCharacters();
    ensureModuleEditorSessionDependencies();
    if (typeof openModuleEditor !== "function") {
      openFallbackSceneEditor(state);
      return;
    }

    window.AleriaOrteSceneEditor.activeState = state;
    const payload = buildModuleEditorPayloadFromScene(state);
    openModuleEditor(payload, {
      mode: "edit",
      sourceKind: "orte-scene",
      sourceEntryId: payload.entry.id,
      sectionSignature: "__new__"
    });
    decorateOrteModuleEditor(state);
  }

  function openFallbackSceneEditor(state) {
    closeSceneEditor();
    const module = state.module;
    const page = module.page || {};
    const overlay = document.createElement("div");
    overlay.className = "orte-scene-editor-overlay";
    overlay.dataset.orteSceneEditor = state.sceneId;
    overlay.innerHTML = `
      <div class="orte-scene-editor-dialog" role="dialog" aria-modal="true" aria-label="Ortsszene bearbeiten">
        <div class="orte-scene-editor-head">
          <div>
            <span>Ortsszene bearbeiten</span>
            <strong>${escapeHtmlLocal(module.title)}</strong>
          </div>
          <button type="button" data-action="orte-scene-close-editor" aria-label="Schließen">x</button>
        </div>
        <div class="orte-scene-editor-body">
          <div class="orte-scene-editor-grid">
            <label>Titel<input class="ose-title" type="text" value="${escapeAttrLocal(module.title)}"></label>
            <label>Registertitel<input class="ose-page-title" type="text" value="${escapeAttrLocal(page.pageTitle || module.title)}"></label>
            <label>Untertitel<input class="ose-subtitle" type="text" value="${escapeAttrLocal(module.subtitle)}"></label>
            <label>Stempel<input class="ose-stamp" type="text" value="${escapeAttrLocal(module.stamp)}"></label>
            <label class="wide">Bild-URL<input class="ose-image" type="url" value="${escapeAttrLocal(module.image)}" placeholder="https://..."></label>
            <label>Bildbreite %<input class="ose-image-width" type="range" min="20" max="55" step="1" value="${escapeAttrLocal(module.imageWidth)}"></label>
            <label>Kommentar-Schlüssel<input class="ose-thread" type="text" value="${escapeAttrLocal(page.commentThreadKey || state.sceneId)}"></label>
          </div>
          <div class="orte-scene-editor-session-fields">
            ${buildSessionEditorFields(page)}
          </div>
        </div>
        <div class="orte-scene-editor-footer">
          <button type="button" data-action="orte-scene-close-editor">Abbrechen</button>
          <button type="button" data-action="orte-scene-save-editor">Speichern</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector("input, textarea")?.focus();
  }

  function closeSceneEditor() {
    document.querySelectorAll("[data-orte-scene-editor]").forEach((node) => node.remove());
  }

  async function saveSceneEditor(editor) {
    if (!editor) return;
    const sceneId = editor.dataset.orteSceneEditor || "";
    const state = states.get(sceneId);
    if (!state) return;

    const card = editor;
    const page = {
      pageTitle: getValue(card, ".ose-page-title") || state.module.title,
      commentThreadKey: getValue(card, ".ose-thread") || sceneId,
      sessionPage: true
    };
    if (typeof collectSessionModuleEditorPage === "function") {
      collectSessionModuleEditorPage(card, page);
    } else {
      page.sessionIntro = getValue(card, ".me-page-session-intro");
      page.sessionHint = getValue(card, ".me-page-session-hint");
      page.sessionEmptyTitle = getValue(card, ".me-page-session-empty-title");
      page.sessionEmptyText = getValue(card, ".me-page-session-empty-text");
    }

    state.module = normalizeModule({
      id: sceneId,
      title: getValue(card, ".ose-title") || state.module.title,
      subtitle: getValue(card, ".ose-subtitle"),
      stamp: getValue(card, ".ose-stamp") || "ORTSZENE",
      image: getValue(card, ".ose-image"),
      imageWidth: getValue(card, ".ose-image-width"),
      threadId: `orte:${ortId}:${sceneId}`,
      page
    }, sceneId);

    saveLocalModule(state);
    renderPreview(state);
    renderSidebar();
    await saveScene(state);
    if (currentEntry?.orteSceneId === state.sceneId) {
      currentEntry = buildAlmanachEntry(state);
      renderPage(0, 0);
    }
    closeSceneEditor();
  }

  function buildModuleEditorPayloadFromScene(state) {
    const module = state.module;
    const page = module.page || {};
    const entryId = slugifyLocal(`${ortId}-${state.sceneId}`, "orte-szene");
    const editorPage = {
      schemaVersion: 1,
      sessionPage: true,
      pageTitle: page.pageTitle || module.title || "Interaktive Szene",
      image: page.image || module.image || "",
      imageWidth: page.imageWidth || module.imageWidth || 36,
      imageFit: page.imageFit || "cover",
      imagePosition: page.imagePosition || "top",
      commentThreadKey: page.commentThreadKey || state.sceneId,
      sessionIntro: page.sessionIntro || "",
      sessionHint: page.sessionHint || "Führe diese Szene als Kommentar fort.",
      sessionEmptyTitle: page.sessionEmptyTitle || "Die Szene ist offen",
      sessionEmptyText: page.sessionEmptyText || "Noch ist kein Beitrag eingetragen."
    };
    if (page.imageSquare) editorPage.imageSquare = true;
    if (page.imageLandscape) editorPage.imageLandscape = true;
    if (page.imageSemiLandscape) editorPage.imageSemiLandscape = true;
    if (page.imageTall) editorPage.imageTall = true;

    return {
      section: {
        key: "orte",
        tab: "Orte",
        desc: "Interaktive Szenen dieser Orte-Seite",
        path: ["Orte", config.ortName || ortId]
      },
      entry: {
        id: entryId,
        title: module.title || "Interaktive Szene",
        subtitle: module.subtitle || "Interaktive Szene mit Kommentarfortsetzung",
        type: "Interaktive Szene",
        category: `Orte · ${config.ortName || ortId}`,
        moduleWidth: 100,
        moduleHeight: 100,
        image: module.image || page.image || "",
        stamp: module.stamp || "ORTSZENE",
        icon: "✦",
        symbol: "",
        locked: false,
        multipage: true,
        appendCommentsPage: false,
        enablePageComments: false,
        sessionCast: Array.isArray(module.sessionCast) ? module.sessionCast : [],
        sessionCastDetails: Array.isArray(module.sessionCastDetails) ? module.sessionCastDetails : [],
        pages: [editorPage]
      }
    };
  }

  function applyModuleEditorPayloadToScene(state, payload) {
    const entry = payload?.entry || {};
    const page = Array.isArray(entry.pages) && entry.pages.length ? entry.pages[0] : {};
    state.module = normalizeModule({
      id: state.sceneId,
      title: entry.title || state.module.title,
      subtitle: entry.subtitle || "",
      stamp: entry.stamp || "ORTSZENE",
      image: entry.image || page.image || "",
      imageWidth: page.imageWidth || 36,
      sessionCast: Array.isArray(entry.sessionCast) ? entry.sessionCast : [],
      sessionCastDetails: Array.isArray(entry.sessionCastDetails) ? entry.sessionCastDetails : [],
      page: {
        ...page,
        pageTitle: page.pageTitle || entry.title || state.module.title,
        sessionPage: true,
        commentThreadKey: page.commentThreadKey || state.sceneId,
        sessionIntro: page.sessionIntro || "",
        sessionHint: page.sessionHint || "Führe diese Szene als Kommentar fort.",
        sessionEmptyTitle: page.sessionEmptyTitle || "Die Szene ist offen",
        sessionEmptyText: page.sessionEmptyText || "Noch ist kein Beitrag eingetragen."
      }
    }, state.sceneId);
  }

  async function saveSceneFromModuleEditor() {
    const state = window.AleriaOrteSceneEditor?.activeState;
    if (!state) return;
    try {
      const payload = collectModuleEditorPayload();
      applyModuleEditorPayloadToScene(state, payload);
      saveLocalModule(state);
      renderPreview(state);
      renderSidebar();
      await saveScene(state);
      if (currentEntry?.orteSceneId === state.sceneId) {
        currentEntry = buildAlmanachEntry(state);
        renderPage(0, 0);
      }
      if (typeof setModuleEditorStatus === "function") setModuleEditorStatus("Ortsszene gespeichert ✓");
      if (typeof setModuleEditorCleanBaseline === "function") setModuleEditorCleanBaseline();
    } catch (error) {
      if (typeof setModuleEditorStatus === "function") {
        setModuleEditorStatus(error.message || "Ortsszene konnte nicht gespeichert werden.", true);
      }
    }
  }

  async function deleteSceneFromModuleEditor() {
    const state = window.AleriaOrteSceneEditor?.activeState;
    if (!state) return;
    await deleteScene(state);
    window.AleriaOrteSceneEditor.activeState = null;
    if (typeof deactivateDialog === "function") deactivateDialog("module-editor-overlay");
    else document.getElementById("module-editor-overlay")?.classList.remove("active");
  }

  function decorateOrteModuleEditor(state) {
    const overlay = document.getElementById("module-editor-overlay");
    if (!overlay) return;
    overlay.classList.add("orte-module-editor-mode");
    overlay.dataset.orteSceneId = state.sceneId;
    const title = overlay.querySelector("#module-editor-title");
    if (title) title.textContent = "Ortsszene bearbeiten";
    const deleteButton = overlay.querySelector("#me-delete-btn");
    if (deleteButton) deleteButton.textContent = "Szene löschen";
    const template = overlay.querySelector("#me-template");
    if (template) template.value = "session";
  }

  function buildSessionEditorFields(page) {
    if (typeof buildSessionModuleEditorFields === "function") {
      return buildSessionModuleEditorFields({
        sessionPage: true,
        sessionIntro: page.sessionIntro || "",
        sessionHint: page.sessionHint || "",
        sessionEmptyTitle: page.sessionEmptyTitle || "",
        sessionEmptyText: page.sessionEmptyText || ""
      });
    }
    return `
      <div class="module-page-type-block visible" data-page-type="session">
        <div class="module-editor-grid single">
          <div class="module-editor-field"><label>Introtext</label><textarea class="me-page-session-intro">${escapeHtmlLocal(page.sessionIntro || "")}</textarea></div>
          <div class="module-editor-field"><label>Hinweis im Eingabebalken</label><input type="text" class="me-page-session-hint" value="${escapeAttrLocal(page.sessionHint || "")}"></div>
          <div class="module-editor-field"><label>Leertitel</label><input type="text" class="me-page-session-empty-title" value="${escapeAttrLocal(page.sessionEmptyTitle || "")}"></div>
          <div class="module-editor-field"><label>Leertext</label><textarea class="me-page-session-empty-text small">${escapeHtmlLocal(page.sessionEmptyText || "")}</textarea></div>
        </div>
      </div>`;
  }

  function ensureModuleEditorSessionDependencies() {
    if (typeof window.escapeHtml !== "function") window.escapeHtml = escapeHtmlLocal;
    if (typeof window.inferModulePageType !== "function") {
      window.inferModulePageType = (page) => page?.sessionPage ? "session" : "";
    }
    if (typeof window.buildTextFormatToolbar !== "function") {
      window.buildTextFormatToolbar = () => "";
    }
    if (typeof window.getTrimmedFormValue !== "function") {
      window.getTrimmedFormValue = (scope, selector) => String(scope.querySelector(selector)?.value || "").trim();
    }
    if (typeof window.getFormValue !== "function") {
      window.getFormValue = (scope, selector) => String(scope.querySelector(selector)?.value || "");
    }
    if (typeof window.hydrateModuleRichEditors !== "function") {
      window.hydrateModuleRichEditors = () => {};
    }
    if (typeof window.updateModuleStoreSizePanel !== "function") {
      window.updateModuleStoreSizePanel = () => {};
    }
    if (typeof window.refreshModuleCommentThreadIoOptions !== "function") {
      window.refreshModuleCommentThreadIoOptions = () => {};
    }
    if (typeof window.showFriendlyAppError !== "function") {
      window.showFriendlyAppError = (error, fallback) => {
        if (typeof showAppStatus === "function") showAppStatus(fallback || error?.message || "Aktion fehlgeschlagen.", "error");
      };
    }
  }

  async function saveScene(state) {
    saveLocalModule(state);
    const store = await waitForSceneStore(900);
    if (store?.saveScene) await store.saveScene(ortId, state.sceneId, state.module);
  }

  function persistSceneIndex() {
    saveLocalIndex();
    window.clearTimeout(saveIndexTimer);
    saveIndexTimer = window.setTimeout(async () => {
      const store = await waitForSceneStore(900);
      if (store?.saveSceneIndex) await store.saveSceneIndex(ortId, { order: sceneOrder });
    }, 250);
  }

  async function connectSceneIndex() {
    const store = await waitForSceneStore();
    if (!store?.subscribeSceneIndex) return;
    store.subscribeSceneIndex(ortId, (remoteIndex) => {
      if (!remoteIndex?.order) return;
      sceneOrder = remoteIndex.order;
      sceneOrder.forEach((sceneId) => ensureState(sceneId));
      saveLocalIndex();
      renderAll();
    });
  }

  function ensureRuntime() {
    if (runtimePromise) return runtimePromise;
    runtimePromise = (async () => {
      ensureAlmanachCssVariables();
      loadStyles();
      ensureModalShell();
      await ensureCommentOverlays();
      await ensureModuleEditorOverlay();
      await loadScripts();
      installOrteModuleEditorAdapter();
    })();
    return runtimePromise;
  }

  function installOrteModuleEditorAdapter() {
    ensureModuleEditorSessionDependencies();
    const editor = window.AleriaOrteSceneEditor;
    if (!editor) return;

    if (!editor.originalSaveModuleFromEditor && typeof saveModuleFromEditor === "function") {
      editor.originalSaveModuleFromEditor = saveModuleFromEditor;
      saveModuleFromEditor = async function (...args) {
        if (window.AleriaOrteSceneEditor?.activeState) {
          await saveSceneFromModuleEditor();
          return;
        }
        return editor.originalSaveModuleFromEditor.apply(this, args);
      };
    }

    if (!editor.originalDeleteModuleFromEditor && typeof deleteModuleFromEditor === "function") {
      editor.originalDeleteModuleFromEditor = deleteModuleFromEditor;
      deleteModuleFromEditor = async function (...args) {
        if (window.AleriaOrteSceneEditor?.activeState) {
          await deleteSceneFromModuleEditor();
          return;
        }
        return editor.originalDeleteModuleFromEditor.apply(this, args);
      };
    }

    if (!editor.originalCloseModuleEditor && typeof closeModuleEditor === "function") {
      editor.originalCloseModuleEditor = closeModuleEditor;
      closeModuleEditor = function (...args) {
        const result = editor.originalCloseModuleEditor.apply(this, args);
        const overlay = document.getElementById("module-editor-overlay");
        if (!overlay?.classList.contains("active")) {
          window.AleriaOrteSceneEditor.activeState = null;
          overlay?.classList.remove("orte-module-editor-mode");
          if (overlay) delete overlay.dataset.orteSceneId;
        }
        return result;
      };
    }
  }

  function ensureAlmanachCssVariables() {
    if (document.getElementById("orte-almanach-session-vars")) return;
    const style = document.createElement("style");
    style.id = "orte-almanach-session-vars";
    style.textContent = `
      :root {
        --parchment: #efe0c0;
        --parchment-dark: #e6d4a8;
        --parchment-deeper: #cdb880;
        --parchment-bg: #dfc9a0;
        --ink: #2c1a08;
        --ink-faded: #5c3d1a;
        --red-wax: #8a2020;
        --gold: #8b6914;
        --gold-light: #a8820e;
        --shadow: rgba(80,50,20,0.18);
        --text-main: #2c1a08;
        --text-muted: #6b4a22;
        --surface: #dfc9a0;
        --surface-raised: #e8d5b2;
        --theme-accent: #8b6914;
        --theme-accent-strong: #6f5210;
        --theme-accent-soft: rgba(139,105,20,0.12);
        --theme-paper-top: rgba(255,248,232,0.52);
        --theme-paper-bottom: rgba(223,201,160,0.72);
        --theme-shadow: rgba(80,50,20,0.14);
      }
    `;
    document.head.appendChild(style);
  }

  function loadStyles() {
    stylePaths.forEach((item) => {
      const href = ALMANACH_BASE + item.href;
      if (document.querySelector(`link[href="${href}"]`)) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      if (item.media) link.media = item.media;
      document.head.appendChild(link);
    });
  }

  function ensureModalShell() {
    if (!document.getElementById("app-status-toast")) {
      const toast = document.createElement("div");
      toast.id = "app-status-toast";
      toast.className = "app-status-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.setAttribute("aria-atomic", "true");
      toast.hidden = true;
      document.body.appendChild(toast);
    }

    if (!document.getElementById("firebase-sync-status")) {
      const sync = document.createElement("div");
      sync.id = "firebase-sync-status";
      sync.className = "firebase-sync-status";
      sync.dataset.state = "idle";
      sync.setAttribute("role", "status");
      sync.setAttribute("aria-live", "polite");
      sync.setAttribute("aria-atomic", "true");
      sync.innerHTML = '<span class="firebase-sync-dot" aria-hidden="true"></span><span class="firebase-sync-label">Speicherstatus: bereit</span>';
      document.body.appendChild(sync);
    }

    if (document.getElementById("modal-overlay")) return;
    const overlay = document.createElement("div");
    overlay.id = "modal-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("aria-label", "Almanach-Eintrag");
    overlay.tabIndex = -1;
    overlay.innerHTML = `
      <div class="modal-card">
        <span class="modal-deco tl">&#10087;</span>
        <span class="modal-deco br">&#10087;</span>
        <button class="modal-close" type="button" data-modal-action="close" aria-label="Eintrag schliessen">&#10005;</button>
        <div id="modal-body"></div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  async function ensureCommentOverlays() {
    const overlayIds = [
      "comment-form-overlay",
      "showcase-form-overlay",
      "attachment-form-overlay",
      "showcase-profile-overlay",
      "edit-comment-overlay",
      "delete-confirm-overlay"
    ];
    if (overlayIds.every((id) => document.getElementById(id))) return;

    const response = await fetch(ALMANACH_BASE + "AleriaAlmanach.html", { cache: "no-store" });
    if (!response.ok) throw new Error("Almanach-Overlays konnten nicht geladen werden.");
    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, "text/html");
    overlayIds.forEach((id) => {
      if (document.getElementById(id)) return;
      const node = parsed.getElementById(id);
      if (node) document.body.appendChild(document.importNode(node, true));
    });
  }

  async function ensureModuleEditorOverlay() {
    if (document.getElementById("module-editor-overlay")) return;
    const response = await fetch(ALMANACH_BASE + "AleriaAlmanach.html", { cache: "no-store" });
    if (!response.ok) throw new Error("Almanach-Moduleditor konnte nicht geladen werden.");
    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const node = parsed.getElementById("module-editor-overlay");
    if (node) document.body.appendChild(document.importNode(node, true));
  }

  async function loadScripts() {
    for (const path of scriptPaths) {
      await loadScript(ALMANACH_BASE + path);
    }
  }

  function loadScript(src) {
    const cleanSrc = src.split("?")[0];
    const existing = Array.from(document.scripts).find((script) => script.src && script.src.split("?")[0] === new URL(cleanSrc, window.location.href).href);
    if (existing?.dataset.loaded === "true") return Promise.resolve();
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
      });
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.defer = false;
      script.dataset.loaded = "pending";
      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        resolve();
      }, { once: true });
      script.addEventListener("error", () => reject(new Error(`Script konnte nicht geladen werden: ${src}`)), { once: true });
      document.head.appendChild(script);
    });
  }

  async function loadAlmanachCharacters() {
    const fb = await waitForFirebase();
    if (!fb?.loadCharacters) return;
    try {
      _characters = await fb.loadCharacters();
      window._characters = _characters;
      if (typeof renderCharPickerInForm === "function") renderCharPickerInForm();
    } catch (error) {
      if (typeof showAppStatus === "function") {
        showAppStatus("Almanach-Charaktere konnten nicht geladen werden.", "error");
      }
    }
  }

  async function connectSceneStore(state) {
    const store = await waitForSceneStore();
    if (!store?.subscribeScene) return;
    state.unsubscribeScene = store.subscribeScene(state.ortId, state.sceneId, (remoteModule) => {
      if (!remoteModule) return;
      state.module = normalizeModule(remoteModule, state.sceneId);
      state.status = "Online geladen.";
      saveLocalModule(state);
      renderPreview(state);
      renderSidebar();
    }, () => {
      state.status = "Online-Szenenspeicher nicht erreichbar.";
      renderPreview(state);
      renderSidebar();
    });
  }

  async function hardResetScenes() {
    const allKnownIds = Array.from(new Set([...sceneOrder, ...Array.from(states.keys()), "einleitung", "konflikte"]));
    allKnownIds.forEach(removeLocalModule);
    removeLocalIndex();
    sceneOrder = [];
    states.forEach((state) => {
      if (state.unsubscribeScene) state.unsubscribeScene();
    });
    states.clear();
    renderAll();

    const store = await waitForSceneStore(900);
    if (store?.deleteScene) {
      await Promise.allSettled(allKnownIds.map((sceneId) => store.deleteScene(ortId, sceneId)));
    }
    if (store?.deleteSceneIndex) await store.deleteSceneIndex(ortId);
  }

  function saveLocalIndex() {
    try {
      window.localStorage.setItem(indexStorageKey, JSON.stringify({ schemaVersion: 1, order: sceneOrder }));
    } catch (error) {
      return;
    }
  }

  function loadSceneIndex() {
    try {
      const payload = JSON.parse(window.localStorage.getItem(indexStorageKey) || "null");
      return Array.isArray(payload?.order) ? payload.order.map((id) => String(id || "").trim()).filter(Boolean) : [];
    } catch (error) {
      return [];
    }
  }

  function removeLocalIndex() {
    try {
      window.localStorage.removeItem(indexStorageKey);
    } catch (error) {
      return;
    }
  }

  function saveLocalModule(state) {
    try {
      window.localStorage.setItem(getLocalModuleKey(state.sceneId), JSON.stringify(state.module));
    } catch (error) {
      return;
    }
  }

  function loadLocalModule(sceneId) {
    try {
      return JSON.parse(window.localStorage.getItem(getLocalModuleKey(sceneId)) || "null");
    } catch (error) {
      return null;
    }
  }

  function removeLocalModule(sceneId) {
    try {
      window.localStorage.removeItem(getLocalModuleKey(sceneId));
      window.localStorage.removeItem(`aleria:orte:comments:orte:${ortId}:${sceneId}`);
    } catch (error) {
      return;
    }
  }

  function getLocalModuleKey(sceneId) {
    return `aleria:orte:session-module:${ortId}:${sceneId}`;
  }

  function getValue(scope, selector) {
    return String(scope.querySelector(selector)?.value || "").trim();
  }

  function normalizeImageFit(value) {
    const safe = String(value || "").trim();
    return ["cover", "contain"].includes(safe) ? safe : "";
  }

  function normalizeImagePosition(value) {
    const safe = String(value || "").trim();
    return ["top", "center", "bottom", "left", "right"].includes(safe) ? safe : "";
  }

  function slugifyLocal(value, fallback = "szene") {
    const normalized = String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return normalized || fallback;
  }

  function waitForFirebase() {
    if (window._fb) return Promise.resolve(window._fb);
    return new Promise((resolve) => {
      const started = Date.now();
      const timer = window.setInterval(() => {
        if (window._fb) {
          window.clearInterval(timer);
          resolve(window._fb);
          return;
        }
        if (Date.now() - started > 5000) {
          window.clearInterval(timer);
          resolve(null);
        }
      }, 120);
    });
  }

  function waitForSceneStore(timeout = 5000) {
    if (window.OrteSceneFirebase) return Promise.resolve(window.OrteSceneFirebase);
    return new Promise((resolve) => {
      let finished = false;
      const finish = (store) => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        window.removeEventListener("orte-scenes-firebase-ready", onReady);
        resolve(store || null);
      };
      const onReady = () => finish(window.OrteSceneFirebase);
      const timer = window.setTimeout(() => finish(null), timeout);
      window.addEventListener("orte-scenes-firebase-ready", onReady, { once: true });
      if (window.OrteSceneFirebase) finish(window.OrteSceneFirebase);
    });
  }

  function buildLegacySessionIntro(blocks) {
    if (!Array.isArray(blocks)) return "";
    return blocks
      .map((block) => {
        if (!block || typeof block !== "object") return "";
        const speaker = block.speaker || block.name;
        const text = String(block.text || "").trim();
        if (!text) return "";
        return speaker ? `${speaker}: ${text}` : text;
      })
      .filter(Boolean)
      .join("\n");
  }

  function escapeHtmlLocal(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttrLocal(value) {
    return escapeHtmlLocal(value).replaceAll("`", "&#096;");
  }
})();
