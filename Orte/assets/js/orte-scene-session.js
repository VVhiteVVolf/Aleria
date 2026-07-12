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
  const storageNamespace = normalizeStorageToken(config.localStorage?.namespace || "orte", "orte");
  const commentsScope = normalizeStorageToken(config.localStorage?.commentsScope || storageNamespace, storageNamespace);
  const indexStorageKey = `aleria:${storageNamespace}:scene-index:${ortId}`;
  const indexMetaStorageKey = `aleria:${storageNamespace}:scene-index-meta:${ortId}`;
  let sceneOrder = [];
  let sidebar = null;
  let sidebarOpen = false;
  let saveIndexTimer = 0;
  let runtimePromise = null;
  let sceneIndexStatus = "";

  const stylePaths = [
    { href: "styles/modal.css?v=orte-almanach-session-v1" },
    { href: "styles/comments.css?v=orte-animal-font-v1" },
    { href: "styles/comment-bubbles.css?v=orte-infernal-font-v1" },
    { href: "styles/comment-character-picker.css?v=orte-almanach-session-v1" },
    { href: "styles/scene-time.css?v=orte-almanach-session-v1" },
    { href: "styles/scene-transition.css?v=orte-almanach-session-v1" },
    { href: "styles/scene-polls.css?v=orte-almanach-scene-polls-v1" },
    { href: "styles/module-editor.css?v=orte-almanach-editor-v1" },
    { href: "styles/comment-composer.css?v=orte-comment-composer-v1" },
    { href: "styles/module-page-boards.css?v=orte-almanach-editor-v1" },
    { href: "styles/module-page-artifact-recipe.css?v=orte-module-templates-v2" },
    { href: "styles/module-page-bestiary.css?v=orte-module-templates-v2" },
    { href: "styles/module-page-biography.css?v=orte-module-templates-v2" },
    { href: "styles/module-page-bounty.css?v=orte-bounty-dossier-v1" },
    { href: "styles/module-page-caste.css?v=orte-caste-dossier-v1" },
    { href: "styles/module-page-character-inventory.css?v=orte-module-templates-v2" },
    { href: "styles/module-page-court.css?v=orte-module-templates-v2" },
    { href: "styles/module-page-family.css?v=orte-module-templates-v2" },
    { href: "styles/module-page-goods.css?v=orte-almanach-market-v1" },
    { href: "styles/module-page-guest-register.css?v=orte-module-templates-v2" },
    { href: "styles/module-page-hierarchy.css?v=orte-module-templates-v2" },
    { href: "styles/module-page-house.css?v=orte-module-templates-v2" },
    { href: "styles/module-page-landing.css?v=orte-module-templates-v2" },
    { href: "styles/module-page-map-template.css?v=orte-module-templates-v2" },
    { href: "styles/module-page-profiles.css?v=orte-module-templates-v2" },
    { href: "styles/module-page-quest.css?v=orte-module-templates-v2" },
    { href: "styles/module-page-trade-catalog.css?v=orte-almanach-market-v1" },
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
    "modules/scene-time/scene-time-state.js?v=orte-almanach-session-v1",
    "modules/scene-time/scene-time-ui.js?v=orte-almanach-session-v1",
    "modules/scene-transition/scene-transition-state.js?v=orte-almanach-session-v1",
    "modules/scene-transition/scene-transition-ui.js?v=orte-almanach-session-v1",
    "modules/scene-polls/scene-polls-state.js?v=orte-almanach-scene-polls-v1",
    "modules/scene-polls/scene-polls-ui.js?v=orte-almanach-scene-polls-v1",
    "modules/comments/comments-spell-fonts.js?v=orte-infernal-font-v1",
    "modules/comments/comments-render.js?v=orte-animal-font-v1",
    "modules/comments/comments-showcase-render.js?v=orte-almanach-session-v1",
    "modules/comments/comments-attachment-render.js?v=orte-almanach-session-v1",
    "modules/comments/comments-routing.js?v=orte-almanach-session-v1",
    "modules/comments/comments-toolbar.js?v=orte-almanach-session-v1",
    "modules/rendering/module-renderer.js?v=orte-caste-dossier-v1",
    "modules/comments/comments-page.js?v=orte-almanach-session-v1",
    "modules/comments/comments-backend.js?v=orte-almanach-session-v1",
    "modules/comments/comments-form-state.js?v=orte-almanach-session-v1",
    "modules/characters/character-data.js?v=orte-almanach-session-v1",
    "modules/characters/character-profile.js?v=orte-almanach-session-v1",
    "modules/characters/character-comment-picker.js?v=orte-almanach-session-v1",
    "modules/comments/comments-form.js?v=orte-almanach-session-v1",
    "modules/comments/comments-segment-base.js?v=orte-comment-composer-v1",
    "modules/comments/comments-segments.js?v=orte-almanach-session-v1",
    "modules/comments/comments-preview.js?v=orte-almanach-session-v1",
    "modules/comments/comments-richtext.js?v=orte-almanach-session-v1",
    "modules/comments/comments-draft.js?v=orte-almanach-session-v1",
    "modules/comments/comments-turn.js?v=orte-almanach-session-v1",
    "modules/comments/comments-pagination.js?v=orte-almanach-session-v1",
    "modules/comments/comments-thread.js?v=orte-almanach-session-v1",
    "modules/scene-time/scene-time-events.js?v=orte-almanach-session-v1",
    "modules/scene-transition/scene-transition-events.js?v=orte-almanach-session-v1",
    "modules/scene-polls/scene-polls-events.js?v=orte-almanach-scene-polls-v1",
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
    "modules/item-database/item-db-normalizer.js?v=orte-module-templates-v2",
    "modules/item-database/item-db-extractors.js?v=orte-module-templates-v2",
    "modules/item-database/item-db-store.js?v=orte-module-templates-v2",
    "modules/item-database/item-db-ui.js?v=orte-module-templates-v2",
    "modules/item-database/item-db-picker.js?v=orte-module-templates-v2",
    "modules/caste/caste-editor-schema.js?v=orte-caste-dossier-v1",
    "modules/court/court-editor-schema.js?v=orte-module-templates-v2",
    "modules/module-editor/module-editor-bounty.js?v=orte-bounty-dossier-v1",
    "modules/module-editor/module-editor-map-template.js?v=orte-module-templates-v2",
    "modules/module-editor/module-editor-landing.js?v=orte-module-templates-v2",
    "modules/module-editor/module-editor-guest-register.js?v=orte-module-templates-v2",
    "modules/module-editor/module-editor-templates.js?v=orte-caste-dossier-v1",
    "module-richtext.js?v=orte-almanach-market-v1",
    "modules/module-editor/module-editor-goods.js?v=orte-almanach-market-v1",
    "modules/module-editor/module-editor-trade-catalog.js?v=orte-almanach-market-v1",
    "modules/module-editor/module-editor-template-transfer.js?v=orte-almanach-market-v1",
    "modules/module-editor/module-editor-workflow.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-drafts.js?v=orte-module-templates-v2",
    "modules/module-editor/module-editor-cast-picker.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-simple-lines.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-scene-blocks.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-comment-blocks.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-page-cards.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-artifact.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-card-layout.js?v=orte-module-templates-v2",
    "modules/module-editor/module-editor-profiles.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-wanted.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-character-inventory.js?v=orte-module-templates-v2",
    "modules/module-editor/module-editor-session.js?v=orte-almanach-session-v1",
    "modules/module-editor/module-editor-biography.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-icon-field.js?v=orte-module-templates-v2",
    "modules/module-editor/module-editor-row-schemas.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-row-schemas.js?v=orte-module-templates-v2",
    "modules/module-editor/module-editor-house.js?v=orte-module-templates-v2",
    "modules/module-editor/module-editor-guild.js?v=orte-module-templates-v2",
    "modules/module-editor/module-editor-bestiary.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-recipe.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-quest.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-tournament.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-caste.js?v=orte-caste-dossier-v1",
    "modules/module-editor/module-editor-court.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-hierarchy.js?v=orte-module-templates-v2",
    "modules/module-editor/module-editor-family.js?v=orte-module-templates-v2",
    "modules/module-editor/module-editor-pages.js?v=orte-almanach-editor-v1",
    "modules/module-editor/module-editor-controller.js?v=orte-almanach-editor-v1",
    "modules/backup/almanach-backup.js?v=orte-almanach-editor-v1",
    "module-import-export.js?v=orte-almanach-editor-v1",
    "modules/court/court-renderer.js?v=orte-module-templates-v2",
    "modules/bounty/bounty-renderer.js?v=orte-bounty-dossier-v1",
    "modules/goods/goods-renderer.js?v=orte-almanach-market-v1",
    "modules/trade-catalog/trade-catalog-renderer.js?v=orte-almanach-market-v1",
    "modules/map-template/map-template-renderer.js?v=orte-module-templates-v2",
    "modules/landing/landing-renderer.js?v=orte-module-templates-v2",
    "modules/character-inventory/character-inventory-renderer.js?v=orte-module-templates-v2",
    "modules/guest-register/guest-register-renderer.js?v=orte-module-templates-v2",
    "modules/hierarchy/hierarchy-renderer.js?v=orte-module-templates-v2",
    "modules/family/family-renderer.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-state.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-panels.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-card-layout.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-profiles.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-wanted.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-bounty.js?v=orte-bounty-dossier-v1",
    "modules/inline-editor/inline-module-editor.js?v=orte-almanach-market-v1",
    "modules/inline-editor/inline-editor-goods.js?v=orte-almanach-market-v1",
    "modules/inline-editor/inline-editor-trade-catalog.js?v=orte-almanach-market-v1",
    "modules/inline-editor/inline-editor-map-template.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-guest-register.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-tournament.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-artifact-recipe.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-caste.js?v=orte-caste-dossier-v1",
    "modules/inline-editor/inline-editor-court.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-hierarchy.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-family.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-biography.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-house.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-guild.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-bestiary.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-quest.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-tournament-league.js?v=orte-module-templates-v2",
    "modules/inline-editor/inline-editor-events.js?v=orte-almanach-market-v1",
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

    if (action === "orte-scene-editor-use-remote") {
      event.preventDefault();
      const state = window.AleriaOrteSceneEditor?.activeState;
      if (state) refreshOpenSceneEditorFromState(state, "Online-Stand übernommen.");
      return;
    }

    if (action === "orte-scene-editor-save-local") {
      event.preventDefault();
      const state = window.AleriaOrteSceneEditor?.activeState;
      if (state) saveLocalEditorConflictVersion(state);
      return;
    }

  });

  window.AleriaOrteSceneRuntime = {
    ensureRuntime() {
      return ensureRuntime();
    },
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
    const localIndexMeta = loadSceneIndexMeta();
    persistSceneIndex.lastLocalUpdatedAtClient = Number(localIndexMeta.localUpdatedAtClient) || 0;
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
    const title = String(raw.title || sceneId || "Interaktive Szene");
    const pageSources = Array.isArray(raw.pages) && raw.pages.length
      ? raw.pages
      : [raw.page && typeof raw.page === "object" ? raw.page : {}];
    const pages = pageSources.map((page, index) => normalizeScenePage(page, raw, sceneId, index, title));
    const firstPage = pages[0] || normalizeScenePage({}, raw, sceneId, 0, title);

    return {
      id: String(raw.id || sceneId || "szene"),
      title,
      subtitle: String(raw.subtitle || "Interaktive Szene mit Kommentarfortsetzung"),
      stamp: String(raw.stamp || "SZENE"),
      image: String(raw.image || firstPage.image || ""),
      imageWidth: Number.isFinite(Number(raw.imageWidth ?? firstPage.imageWidth)) ? Number(raw.imageWidth ?? firstPage.imageWidth) : 36,
      sessionCast: Array.isArray(raw.sessionCast) ? raw.sessionCast : [],
      sessionCastDetails: Array.isArray(raw.sessionCastDetails) ? raw.sessionCastDetails : [],
      page: firstPage,
      pages
    };
  }

  function normalizeScenePage(pageSource, rawSource, sceneId, index, moduleTitle) {
    const page = pageSource && typeof pageSource === "object" ? pageSource : {};
    const raw = rawSource && typeof rawSource === "object" ? rawSource : {};
    const isFirst = index === 0;
    const fallbackIntro = isFirst ? buildLegacySessionIntro(raw.blocks) : "";
    const imageWidthSource = page.imageWidth ?? raw.imageWidth;
    const imageWidth = Number.isFinite(Number(imageWidthSource)) ? Number(imageWidthSource) : 36;
    const pageTitleSource = page.pageTitle ?? (isFirst ? raw.pageTitle : "");
    const imageSource = page.image ?? (isFirst ? raw.image : "");
    const sessionHintSource = page.sessionHint ?? (isFirst ? raw.sessionHint : "");
    const sessionEmptyTitleSource = page.sessionEmptyTitle ?? (isFirst ? raw.sessionEmptyTitle : "");
    const sessionEmptyTextSource = page.sessionEmptyText ?? (isFirst ? raw.sessionEmptyText : "");

    return {
      ...page,
      schemaVersion: Number.isFinite(Number(page.schemaVersion)) ? Number(page.schemaVersion) : 1,
      sessionPage: true,
      pageTitle: String(pageTitleSource || moduleTitle || `Seite ${index + 1}`),
      image: String(imageSource || ""),
      imageWidth,
      imageFit: normalizeImageFit(page.imageFit || raw.imageFit),
      imagePosition: normalizeImagePosition(page.imagePosition || raw.imagePosition),
      imageSquare: !!(page.imageSquare || raw.imageSquare),
      imageLandscape: !!(page.imageLandscape || raw.imageLandscape),
      imageSemiLandscape: !!(page.imageSemiLandscape || raw.imageSemiLandscape),
      imageTall: !!(page.imageTall || raw.imageTall),
      sessionIntro: String(page.sessionIntro ?? (isFirst ? raw.sessionIntro : "") ?? fallbackIntro ?? ""),
      sessionHint: String(sessionHintSource || "Führe diese Szene als Kommentar fort."),
      sessionEmptyTitle: String(sessionEmptyTitleSource || "Die Szene ist offen"),
      sessionEmptyText: String(sessionEmptyTextSource || "Noch ist kein Beitrag eingetragen."),
      commentThreadKey: String(page.commentThreadKey || (isFirst ? raw.commentThreadKey : "") || (isFirst ? sceneId : `${sceneId}-seite-${index + 1}`))
    };
  }

  function getScenePages(module) {
    if (Array.isArray(module?.pages) && module.pages.length) return module.pages;
    if (module?.page) return [module.page];
    return [];
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
    const localModuleMeta = loadLocalModuleMeta(id);
    const state = {
      host: hostMap.get(id) || null,
      sceneId: id,
      ortId,
      module: normalizeModule(moduleSource || localModule || getConfiguredModule(id), id),
      localUpdatedAtClient: Number(localModuleMeta.localUpdatedAtClient) || 0,
      remoteUpdatedAtClient: Number(localModuleMeta.remoteUpdatedAtClient) || 0,
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
          <button class="orte-session-button" type="button" data-action="open-orte-session" data-scene-id="${escapeAttrLocal(state.sceneId)}">Öffnen</button>
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
    sidebar.setAttribute("aria-label", "Ortsszenen");
    sidebar.innerHTML = `
      <button class="orte-scene-sidebar-toggle" type="button" data-action="orte-scene-toggle-sidebar" aria-label="Ortsszenen öffnen">
        <span>Szenen</span>
      </button>
      <div class="orte-scene-sidebar-panel">
        <div class="orte-scene-sidebar-head">
          <div>
            <span>Interaktive Szenen</span>
            <strong>Ortsszenen</strong>
          </div>
          <div class="orte-scene-sidebar-head-actions">
            <span class="orte-scene-count" data-orte-scene-count>0</span>
            <button type="button" data-action="orte-scene-add">+ Szene</button>
          </div>
        </div>
        <div class="orte-scene-sidebar-list" data-orte-scene-list></div>
        <div class="orte-scene-sidebar-status" data-orte-scene-index-status hidden></div>
      </div>
    `;
    document.body.appendChild(sidebar);
  }

  function setSidebarOpen(open) {
    sidebarOpen = !!open;
    if (sidebar) {
      sidebar.dataset.open = sidebarOpen ? "true" : "false";
      sidebar.querySelector(".orte-scene-sidebar-toggle")?.setAttribute("aria-expanded", sidebarOpen ? "true" : "false");
    }
  }

  function renderSidebar() {
    ensureSidebar();
    const count = sidebar.querySelector("[data-orte-scene-count]");
    if (count) count.textContent = String(sceneOrder.length);
    const indexStatus = sidebar.querySelector("[data-orte-scene-index-status]");
    if (indexStatus) {
      indexStatus.textContent = sceneIndexStatus;
      indexStatus.hidden = !sceneIndexStatus;
    }
    const list = sidebar.querySelector("[data-orte-scene-list]");
    if (!list) return;
    if (!sceneOrder.length) {
      list.innerHTML = `<div class="orte-scene-empty">Noch keine Ortsszene angelegt.</div>`;
      return;
    }

    list.innerHTML = sceneOrder.map((sceneId, index) => {
      const state = ensureState(sceneId);
      if (!state) return "";
      const pageTitle = state.module.page?.pageTitle || state.module.title || `Szene ${index + 1}`;
      const isActive = currentEntry?.orteSceneId === sceneId;
      return `
        <article class="orte-scene-sidebar-card${isActive ? " active" : ""}">
          <div class="orte-scene-card-index">${index + 1}</div>
          <div class="orte-scene-card-main">
            <div class="orte-scene-card-kicker">${escapeHtmlLocal(state.module.stamp || `SZENE ${index + 1}`)}</div>
            <strong>${escapeHtmlLocal(state.module.title)}</strong>
            <span>${escapeHtmlLocal(pageTitle)}</span>
          </div>
          <div class="orte-scene-sidebar-actions">
            <button type="button" data-action="open-orte-session" data-scene-id="${escapeAttrLocal(sceneId)}">Öffnen</button>
            <button type="button" data-action="orte-scene-edit" data-scene-id="${escapeAttrLocal(sceneId)}">Bearbeiten</button>
            <button type="button" data-action="orte-scene-delete" data-scene-id="${escapeAttrLocal(sceneId)}">Löschen</button>
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
    const page = {
      pageTitle: `${index} - Interaktive Szene`,
      sessionPage: true,
      sessionIntro: "Beschreibe Ort, Anlass und Stimmung. Der eigentliche Szenenverlauf entsteht später über Kommentare.",
      sessionHint: "Führe diese Szene als Kommentar fort.",
      sessionEmptyTitle: "Die Szene ist offen",
      sessionEmptyText: "Noch ist kein Beitrag eingetragen.",
      commentThreadKey: sceneId
    };
    return {
      id: sceneId,
      title: `Szene ${index}`,
      subtitle: "Interaktive Ortsszene",
      stamp: "ORTSZENE",
      image: "",
      imageWidth: 36,
      threadId: `orte:${ortId}:${sceneId}`,
      page,
      pages: [page]
    };
  }

  async function deleteScene(state) {
    const confirmed = window.confirm(`Szene "${state.module.title}" aus dieser Orte-Vorlage löschen? Almanach-Kommentare werden nicht gelöscht.`);
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
    renderSidebar();
    renderPage(0, 0);
    document.body.style.overflow = "hidden";
    document.getElementById("modal-overlay")?.classList.add("orte-session-modal");
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
    const entryId = `orte:${state.ortId}:${state.sceneId}`;
    const pages = getScenePages(module).map((page, index) => ({
      ...page,
      sessionPage: true,
      pageTitle: page.pageTitle || module.title || `Seite ${index + 1}`,
      image: page.image || module.image || "",
      imageWidth: page.imageWidth || module.imageWidth,
      imageFit: page.imageFit,
      imagePosition: page.imagePosition,
      imageSquare: page.imageSquare,
      imageLandscape: page.imageLandscape,
      imageSemiLandscape: page.imageSemiLandscape,
      imageTall: page.imageTall,
      commentThreadKey: page.commentThreadKey || (index === 0 ? state.sceneId : `${state.sceneId}-seite-${index + 1}`),
      sessionIntro: page.sessionIntro,
      sessionHint: page.sessionHint,
      sessionEmptyTitle: page.sessionEmptyTitle,
      sessionEmptyText: page.sessionEmptyText
    }));
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
      pages
    };
  }

  async function openSceneEditor(state) {
    await ensureRuntime();
    await loadAlmanachCharacters();
    ensureModuleEditorSessionDependencies();
    if (typeof openModuleEditor !== "function") {
      const message = "Der Almanach-Szeneneditor konnte nicht geladen werden.";
      if (typeof showAppStatus === "function") showAppStatus(message, "error");
      else window.alert(message);
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

  function buildModuleEditorPayloadFromScene(state) {
    const module = state.module;
    const pages = getScenePages(module);
    const firstPage = pages[0] || module.page || {};
    const entryId = slugifyLocal(`${ortId}-${state.sceneId}`, "orte-szene");
    const editorPages = pages.map((page, index) => buildModuleEditorPageFromScene(page, module, state, index));

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
        image: module.image || firstPage.image || "",
        stamp: module.stamp || "ORTSZENE",
        icon: "✦",
        symbol: "",
        locked: false,
        multipage: true,
        appendCommentsPage: false,
        enablePageComments: false,
        sessionCast: Array.isArray(module.sessionCast) ? module.sessionCast : [],
        sessionCastDetails: Array.isArray(module.sessionCastDetails) ? module.sessionCastDetails : [],
        pages: editorPages.length ? editorPages : [buildModuleEditorPageFromScene(firstPage, module, state, 0)]
      }
    };
  }

  function buildModuleEditorPageFromScene(pageSource, module, state, index) {
    const page = pageSource && typeof pageSource === "object" ? pageSource : {};
    const editorPage = {
      ...page,
      schemaVersion: Number.isFinite(Number(page.schemaVersion)) ? Number(page.schemaVersion) : 1,
      sessionPage: true,
      pageTitle: page.pageTitle || module.title || `Seite ${index + 1}`,
      image: page.image || module.image || "",
      imageWidth: page.imageWidth || module.imageWidth || 36,
      imageFit: page.imageFit || "cover",
      imagePosition: page.imagePosition || "top",
      commentThreadKey: page.commentThreadKey || (index === 0 ? state.sceneId : `${state.sceneId}-seite-${index + 1}`),
      sessionIntro: page.sessionIntro || "",
      sessionHint: page.sessionHint || "Führe diese Szene als Kommentar fort.",
      sessionEmptyTitle: page.sessionEmptyTitle || "Die Szene ist offen",
      sessionEmptyText: page.sessionEmptyText || "Noch ist kein Beitrag eingetragen."
    };
    if (page.imageSquare) editorPage.imageSquare = true;
    if (page.imageLandscape) editorPage.imageLandscape = true;
    if (page.imageSemiLandscape) editorPage.imageSemiLandscape = true;
    if (page.imageTall) editorPage.imageTall = true;
    return editorPage;
  }

  function applyModuleEditorPayloadToScene(state, payload) {
    const entry = payload?.entry || {};
    const pages = Array.isArray(entry.pages) && entry.pages.length ? entry.pages : [{}];
    const firstPage = pages[0] || {};
    state.module = normalizeModule({
      id: state.sceneId,
      title: entry.title || state.module.title,
      subtitle: entry.subtitle || "",
      stamp: entry.stamp || "ORTSZENE",
      image: entry.image || firstPage.image || "",
      imageWidth: firstPage.imageWidth || 36,
      sessionCast: Array.isArray(entry.sessionCast) ? entry.sessionCast : [],
      sessionCastDetails: Array.isArray(entry.sessionCastDetails) ? entry.sessionCastDetails : [],
      page: normalizeScenePage(firstPage, entry, state.sceneId, 0, entry.title || state.module.title),
      pages: pages.map((page, index) => normalizeScenePage(page, entry, state.sceneId, index, entry.title || state.module.title))
    }, state.sceneId);
  }

  async function saveSceneFromModuleEditor() {
    const state = window.AleriaOrteSceneEditor?.activeState;
    if (!state) return;
    if (state.editorRemoteConflict && typeof hasUnsavedModuleEditorChanges === "function" && hasUnsavedModuleEditorChanges()) {
      if (typeof setModuleEditorStatus === "function") {
        setModuleEditorStatus("Online-Stand hat sich geändert. Wähle zuerst, welche Fassung behalten werden soll.", true);
      }
      renderEditorConflictPanel(state);
      return;
    }
    try {
      const payload = collectModuleEditorPayload();
      applyModuleEditorPayloadToScene(state, payload);
      state.editorRemoteConflict = false;
      saveLocalModule(state);
      renderPreview(state);
      renderSidebar();
      await saveScene(state);
      if (currentEntry?.orteSceneId === state.sceneId) {
        currentEntry = buildAlmanachEntry(state);
        renderPage(0, 0);
      }
      if (typeof setModuleEditorStatus === "function") setModuleEditorStatus("Ortsszene gespeichert ✓");
      const pendingCommentImport = typeof _moduleEditorPendingCommentImport !== "undefined"
        ? _moduleEditorPendingCommentImport
        : null;
      let importedCommentSummary = null;
      if (pendingCommentImport && typeof importModuleCommentsBundle === "function") {
        if (typeof setModuleEditorStatus === "function") setModuleEditorStatus("Ortsszene gespeichert. Kommentare werden importiert...");
        importedCommentSummary = await importModuleCommentsBundle(pendingCommentImport, buildAlmanachEntry(state).id);
        _moduleEditorPendingCommentImport = null;
      }
      if (importedCommentSummary && typeof setModuleEditorStatus === "function") {
        setModuleEditorStatus(`Ortsszene gespeichert ✓ Kommentare importiert: ${importedCommentSummary.commentCount} Kommentare, ${importedCommentSummary.turnCount} Redestab-Stände.`);
      }
      if (typeof setModuleEditorCleanBaseline === "function") setModuleEditorCleanBaseline();
      clearEditorConflictPanel();
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
    clearEditorConflictPanel();
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
    if (state.editorRemoteConflict) renderEditorConflictPanel(state);
    else clearEditorConflictPanel();
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
    if (typeof window.createInlinePageByType !== "function") {
      window.createInlinePageByType = (type = "standard", index = 0) => {
        if (typeof getModuleTemplateForPageType === "function") {
          const template = getModuleTemplateForPageType(type);
          if (typeof template?.createPage === "function") return template.createPage(index);
        }
        if (type === "session" && typeof createDefaultSceneSessionPage === "function") {
          return createDefaultSceneSessionPage(index);
        }
        if (typeof createDefaultModulePage === "function") return createDefaultModulePage(index);
        return {
          schemaVersion: 1,
          sessionPage: type === "session",
          pageTitle: `Seite ${index + 1}`,
          commentThreadKey: `seite-${index + 1}`
        };
      };
    }
    if (typeof window.cleanCustomSection !== "function") {
      window.cleanCustomSection = (section) => {
        const rawKey = String(section?.key || "").trim();
        const rawPath = Array.isArray(section?.path) ? section.path : [];
        const path = rawPath.map((part) => String(part || "").trim()).filter(Boolean);
        const key = path.length ? path[path.length - 1] : (rawKey || "Orte");
        const nodeId = String(section?.nodeId || "").trim();
        const next = {
          key,
          tab: String(section?.tab || "").trim() || key,
          desc: String(section?.desc || "").trim(),
          entries: []
        };
        if (path.length) next.path = path;
        if (nodeId) next.nodeId = nodeId;
        return next;
      };
    }
    if (typeof window.ensureModuleNodeForSection !== "function") {
      window.ensureModuleNodeForSection = (section) => {
        const path = Array.isArray(section?.path) && section.path.length
          ? section.path
          : [section?.tab || section?.key || "Orte"];
        return `orte-${path.map((part) => slugifyLocal(part, "abschnitt")).join("-")}`;
      };
    }
    if (typeof window.showFriendlyAppError !== "function") {
      window.showFriendlyAppError = (error, fallback) => {
        if (typeof showAppStatus === "function") showAppStatus(fallback || error?.message || "Aktion fehlgeschlagen.", "error");
      };
    }
  }

  async function saveScene(state) {
    const savedAtClient = Date.now();
    state.localUpdatedAtClient = savedAtClient;
    saveLocalModule(state);
    const store = await waitForSceneStore(900);
    if (store?.saveScene) await store.saveScene(ortId, state.sceneId, state.module);
  }

  function persistSceneIndex() {
    persistSceneIndex.lastLocalUpdatedAtClient = Date.now();
    sceneIndexStatus = "Szenenliste lokal geändert.";
    saveLocalIndex();
    saveSceneIndexMeta();
    window.clearTimeout(saveIndexTimer);
    saveIndexTimer = window.setTimeout(async () => {
      const store = await waitForSceneStore(900);
      if (store?.saveSceneIndex) {
        await store.saveSceneIndex(ortId, { order: sceneOrder });
        sceneIndexStatus = "Szenenliste online gespeichert.";
        renderSidebar();
      }
    }, 250);
  }

  async function connectSceneIndex() {
    const store = await waitForSceneStore();
    if (!store?.subscribeSceneIndex) return;
    store.subscribeSceneIndex(ortId, (remoteIndex) => {
      if (!remoteIndex?.order) return;
      const remoteUpdatedAtClient = Number(remoteIndex._remoteUpdatedAtClient) || 0;
      const localUpdatedAtClient = Number(persistSceneIndex.lastLocalUpdatedAtClient) || 0;
      if (shouldIgnoreRemoteSceneIndex(localUpdatedAtClient, remoteUpdatedAtClient)) {
        sceneIndexStatus = "Ältere Online-Szenenliste ignoriert.";
        renderSidebar();
        return;
      }
      sceneOrder = remoteIndex.order;
      persistSceneIndex.lastLocalUpdatedAtClient = 0;
      sceneIndexStatus = "Online-Szenenliste geladen.";
      sceneOrder.forEach((sceneId) => ensureState(sceneId));
      saveLocalIndex();
      saveSceneIndexMeta();
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
      const templateValidation = typeof validateModuleTemplateRegistry === "function"
        ? validateModuleTemplateRegistry()
        : { ok: false, errors: ["Template-Validierung wurde nicht geladen."] };
      if (!templateValidation.ok) {
        throw new Error(`Modultemplates sind unvollstaendig: ${templateValidation.errors.join(" ")}`);
      }
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

    if (!editor.originalHandleModuleImportFile && typeof handleModuleImportFile === "function") {
      editor.originalHandleModuleImportFile = handleModuleImportFile;
      handleModuleImportFile = function (input, ...args) {
        if (window.AleriaOrteSceneEditor?.activeState) {
          handleOrteSceneModuleImportFile(input);
          return;
        }
        return editor.originalHandleModuleImportFile.apply(this, [input, ...args]);
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

  function handleOrteSceneModuleImportFile(input) {
    const file = input?.files?.[0];
    if (!file) return;
    if (file.size > MODULE_JSON_MAX_CHARS) {
      setModuleEditorStatus(`Datei ist zu groß. Limit: ${Math.round(MODULE_JSON_MAX_CHARS / 1000)} KB.`, true);
      input.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = String(reader.result || "");
        validateModuleJsonSize(raw);
        const parsed = JSON.parse(raw);
        if (parsed?.type === "aleria-module-master-package" || parsed?.type === "aleria-almanach-backup") {
          throw new Error("Diese Datei ist ein Almanach-Gesamtpaket. Ortsszenen akzeptieren nur einzelne Module oder Modulpakete.");
        }
        const textarea = document.getElementById("me-json");
        if (textarea) textarea.value = raw;
        applyModuleJsonToEditor();
      } catch (error) {
        setModuleEditorStatus(error.message || "JSON konnte nicht geladen werden.", true);
      } finally {
        input.value = "";
      }
    };
    reader.onerror = () => {
      setModuleEditorStatus("Datei konnte nicht gelesen werden.", true);
      input.value = "";
    };
    reader.readAsText(file, "utf-8");
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
        <button class="modal-close" type="button" data-modal-action="close" aria-label="Eintrag schließen">&#10005;</button>
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
      const remoteUpdatedAtClient = Number(remoteModule._remoteUpdatedAtClient) || 0;
      if (shouldIgnoreRemoteScene(state, remoteUpdatedAtClient)) {
        state.status = "Älterer Online-Stand ignoriert.";
        renderPreview(state);
        renderSidebar();
        return;
      }
      state.module = normalizeModule(remoteModule, state.sceneId);
      state.localUpdatedAtClient = 0;
      state.remoteUpdatedAtClient = remoteUpdatedAtClient;
      state.status = "Online geladen.";
      saveLocalModule(state);
      handleActiveEditorRemoteUpdate(state);
      renderPreview(state);
      renderSidebar();
    }, () => {
      state.status = "Online-Szenenspeicher nicht erreichbar.";
      renderPreview(state);
      renderSidebar();
    });
  }

  function shouldIgnoreRemoteScene(state, remoteUpdatedAtClient) {
    const localUpdatedAtClient = Number(state.localUpdatedAtClient) || 0;
    if (!localUpdatedAtClient) return false;
    if (!remoteUpdatedAtClient) return true;
    return remoteUpdatedAtClient < localUpdatedAtClient;
  }

  function handleActiveEditorRemoteUpdate(state) {
    if (window.AleriaOrteSceneEditor?.activeState !== state) return;
    const overlay = document.getElementById("module-editor-overlay");
    if (!overlay?.classList.contains("active")) return;

    const editorHasChanges = typeof hasUnsavedModuleEditorChanges === "function" && hasUnsavedModuleEditorChanges();
    if (editorHasChanges) {
      state.editorRemoteConflict = true;
      if (typeof setModuleEditorStatus === "function") {
        setModuleEditorStatus("Online-Stand hat sich geändert. Deine offenen Änderungen wurden nicht überschrieben.", true);
      }
      renderEditorConflictPanel(state);
      return;
    }

    refreshOpenSceneEditorFromState(state);
  }

  function refreshOpenSceneEditorFromState(state, statusMessage = "Online-Stand im Editor aktualisiert.") {
    if (typeof populateModuleEditor !== "function") return;
    const payload = buildModuleEditorPayloadFromScene(state);
    populateModuleEditor(payload, {
      mode: "edit",
      sourceKind: "orte-scene",
      sourceEntryId: payload.entry.id,
      sectionSignature: "__new__"
    });
    window.AleriaOrteSceneEditor.activeState = state;
    state.editorRemoteConflict = false;
    decorateOrteModuleEditor(state);
    clearEditorConflictPanel();
    if (typeof setModuleEditorStatus === "function") {
      setModuleEditorStatus(statusMessage);
    }
  }

  async function saveLocalEditorConflictVersion(state) {
    state.editorRemoteConflict = false;
    clearEditorConflictPanel();
    await saveSceneFromModuleEditor();
  }

  function renderEditorConflictPanel(state) {
    const overlay = document.getElementById("module-editor-overlay");
    if (!overlay?.classList.contains("active")) return;

    let panel = overlay.querySelector("[data-orte-editor-conflict-panel]");
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "orte-editor-conflict-panel";
      panel.dataset.orteEditorConflictPanel = "";
      const status = overlay.querySelector("#me-status");
      const body = overlay.querySelector("#module-editor-body");
      if (status) status.insertAdjacentElement("afterend", panel);
      else if (body) body.prepend(panel);
      else overlay.append(panel);
    }

    panel.innerHTML = `
      <strong>Online-Stand geändert</strong>
      <p>Diese Ortsszene wurde in einem anderen Fenster aktualisiert. Deine offenen Änderungen wurden nicht überschrieben.</p>
      <div class="orte-editor-conflict-actions">
        <button type="button" data-action="orte-scene-editor-use-remote" data-scene-id="${escapeAttrLocal(state.sceneId)}">Online-Stand übernehmen</button>
        <button type="button" data-action="orte-scene-editor-save-local" data-scene-id="${escapeAttrLocal(state.sceneId)}">Lokale Fassung speichern</button>
      </div>
    `;
  }

  function clearEditorConflictPanel() {
    document.querySelector("[data-orte-editor-conflict-panel]")?.remove();
  }

  function shouldIgnoreRemoteSceneIndex(localUpdatedAtClient, remoteUpdatedAtClient) {
    const localUpdated = Number(localUpdatedAtClient) || 0;
    const remoteUpdated = Number(remoteUpdatedAtClient) || 0;
    if (!localUpdated) return false;
    if (!remoteUpdated) return true;
    return remoteUpdated < localUpdated;
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

  function saveSceneIndexMeta() {
    try {
      window.localStorage.setItem(indexMetaStorageKey, JSON.stringify({
        schemaVersion: 1,
        localUpdatedAtClient: Number(persistSceneIndex.lastLocalUpdatedAtClient) || 0
      }));
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

  function loadSceneIndexMeta() {
    try {
      const payload = JSON.parse(window.localStorage.getItem(indexMetaStorageKey) || "null");
      return payload && typeof payload === "object" ? payload : {};
    } catch (error) {
      return {};
    }
  }

  function removeLocalIndex() {
    try {
      window.localStorage.removeItem(indexStorageKey);
      window.localStorage.removeItem(indexMetaStorageKey);
    } catch (error) {
      return;
    }
  }

  function saveLocalModule(state) {
    try {
      window.localStorage.setItem(getLocalModuleKey(state.sceneId), JSON.stringify(state.module));
      saveLocalModuleMeta(state);
    } catch (error) {
      return;
    }
  }

  function saveLocalModuleMeta(state) {
    window.localStorage.setItem(getLocalModuleMetaKey(state.sceneId), JSON.stringify({
      schemaVersion: 1,
      localUpdatedAtClient: Number(state.localUpdatedAtClient) || 0,
      remoteUpdatedAtClient: Number(state.remoteUpdatedAtClient) || 0
    }));
  }

  function loadLocalModule(sceneId) {
    try {
      return JSON.parse(window.localStorage.getItem(getLocalModuleKey(sceneId)) || "null");
    } catch (error) {
      return null;
    }
  }

  function loadLocalModuleMeta(sceneId) {
    try {
      const payload = JSON.parse(window.localStorage.getItem(getLocalModuleMetaKey(sceneId)) || "null");
      return payload && typeof payload === "object" ? payload : {};
    } catch (error) {
      return {};
    }
  }

  function removeLocalModule(sceneId) {
    try {
      window.localStorage.removeItem(getLocalModuleKey(sceneId));
      window.localStorage.removeItem(getLocalModuleMetaKey(sceneId));
      window.localStorage.removeItem(`aleria:${storageNamespace}:comments:${commentsScope}:${ortId}:${sceneId}`);
    } catch (error) {
      return;
    }
  }

  function getLocalModuleKey(sceneId) {
    return `aleria:${storageNamespace}:session-module:${ortId}:${sceneId}`;
  }

  function getLocalModuleMetaKey(sceneId) {
    return `aleria:${storageNamespace}:session-module-meta:${ortId}:${sceneId}`;
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
