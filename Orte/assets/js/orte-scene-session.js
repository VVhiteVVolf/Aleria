(function () {
  "use strict";

  const hosts = Array.from(document.querySelectorAll("[data-orte-scene]"));
  if (!hosts.length) return;

  const config = window.AleriaOrteScenes || {};
  const states = new Map();
  let activeState = null;
  let characterLoadPromise = null;

  const modal = createModal();

  hosts.forEach((host) => {
    const sceneId = String(host.dataset.orteScene || "").trim();
    const module = loadModule(config.ortId, sceneId, normalizeModule(getConfiguredModule(sceneId), sceneId));
    const state = {
      host,
      sceneId,
      ortId: String(config.ortId || "ort-vorlage"),
      module,
      draft: cloneModule(module),
      comments: [],
      characters: [],
      composerOpen: false,
      editorOpen: false,
      status: ""
    };

    states.set(sceneId, state);
    renderPreview(state);
    connectSceneStore(state);
    connectComments(state);
    connectCharacters(state);
  });

  document.addEventListener("click", handleClick);
  document.addEventListener("change", handleChange);
  document.addEventListener("input", handleInput);
  document.addEventListener("submit", handleSubmit);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeState) closeModal();
  });

  function getConfiguredModule(sceneId) {
    return (config.modules && config.modules[sceneId])
      || (config.scenes && config.scenes[sceneId])
      || null;
  }

  function normalizeModule(source, sceneId) {
    const raw = source && typeof source === "object" ? source : {};
    const page = raw.page && typeof raw.page === "object" ? raw.page : {};
    const title = String(raw.title || sceneId || "Interaktive Szene");
    const threadId = String(raw.threadId || `orte:${config.ortId || "ort-vorlage"}:${sceneId || "szene"}`);

    return {
      id: String(raw.id || sceneId || "szene"),
      title,
      subtitle: String(raw.subtitle || "Interaktive Szene mit Kommentarfortsetzung"),
      stamp: String(raw.stamp || "SZENE"),
      image: String(raw.image || ""),
      imageWidth: Number.isFinite(Number(raw.imageWidth)) ? Number(raw.imageWidth) : 36,
      threadId,
      page: {
        pageTitle: String(page.pageTitle || "Interaktive Szene"),
        sessionPage: true,
        sessionIntro: String(page.sessionIntro || raw.sessionIntro || buildLegacySessionIntro(raw.blocks)),
        sessionHint: String(page.sessionHint || raw.sessionHint || "Fuehre diese Szene als Kommentar fort."),
        sessionEmptyTitle: String(page.sessionEmptyTitle || raw.sessionEmptyTitle || "Die Szene ist offen"),
        sessionEmptyText: String(page.sessionEmptyText || raw.sessionEmptyText || "Noch ist kein Beitrag eingetragen.")
      }
    };
  }

  function renderPreview(state) {
    state.host.innerHTML = `
      <article class="orte-session-preview">
        <div class="orte-session-preview-kicker">Interaktive Szene</div>
        <h3>${escapeHtml(state.module.title)}</h3>
        <p>${escapeHtml(state.module.subtitle)}</p>
        <div class="orte-session-preview-copy">${sanitizeLine(state.module.page.sessionIntro)}</div>
        <div class="orte-session-preview-actions">
          <button class="orte-session-button" type="button" data-action="open-orte-session" data-scene-id="${escapeAttr(state.sceneId)}">Modul oeffnen</button>
          <span>${escapeHtml(state.status)}</span>
        </div>
      </article>
    `;
  }

  function renderModal(state) {
    modal.innerHTML = `
      <div class="orte-session-backdrop" data-action="close-orte-session"></div>
      <section class="orte-session-dialog" role="dialog" aria-modal="true" aria-label="${escapeAttr(state.module.title)}">
        <header class="orte-session-modal-head">
          <div>
            <div class="orte-session-preview-kicker">Interaktive Szene</div>
            <h2>${escapeHtml(state.module.title)}</h2>
          </div>
          <div class="orte-session-head-actions">
            <button class="orte-session-button is-secondary" type="button" data-action="toggle-orte-session-editor">Bearbeiten</button>
            <button class="orte-session-icon-button" type="button" data-action="close-orte-session" aria-label="Schliessen">x</button>
          </div>
        </header>
        ${renderSessionPage(state)}
      </section>
    `;
    modal.hidden = false;
    document.body.classList.add("orte-session-open");
  }

  function renderSessionPage(state) {
    const module = state.module;
    const page = module.page;
    return `
      <div class="session-page">
        <aside class="session-art-col">
          ${module.image
            ? `<img src="${escapeAttr(module.image)}" alt="${escapeAttr(module.title)}" loading="eager" decoding="async">`
            : `<div class="orte-session-image-placeholder">Interaktive Szene</div>`}
          <div class="session-art-overlay"></div>
          <div class="session-art-stamp">${escapeHtml(module.stamp)}</div>
        </aside>
        <div class="session-content">
          <div class="session-stage-bar">
            <div class="session-stage-head">
              <div class="session-stage-heading">
                <div class="session-stage-kicker">Interaktive Szene</div>
                <div class="session-stage-title">${escapeHtml(page.pageTitle || module.title)}</div>
              </div>
            </div>
            <div class="session-stage-copy">${sanitizeLine(page.sessionIntro)}</div>
          </div>
          ${state.editorOpen ? renderModuleEditor(state) : ""}
          <div class="comments-scroll" data-role="orte-session-comments">
            ${renderComments(state)}
          </div>
          <div class="comments-form-bar">
            <button class="comments-add-btn" type="button" data-action="toggle-orte-session-composer" title="Kommentar hinterlassen" aria-label="Kommentar hinterlassen">+</button>
            <span class="comments-form-hint">${escapeHtml(page.sessionHint)}</span>
          </div>
          ${state.composerOpen ? renderComposer(state) : ""}
        </div>
      </div>
    `;
  }

  function renderComments(state) {
    if (!state.comments.length) {
      return `
        <div class="comment-empty">
          <strong>${escapeHtml(state.module.page.sessionEmptyTitle)}</strong>
          <span>${escapeHtml(state.module.page.sessionEmptyText)}</span>
        </div>
      `;
    }

    return state.comments.map(renderComment).join("");
  }

  function renderComment(comment) {
    const name = String(comment.charName || "Unbekannt");
    const title = String(comment.charTitle || "");
    const portrait = String(comment.portrait || "").trim();
    const kind = String(comment.commentKind || (comment.narrator ? "narrator" : "speech"));
    const meta = title ? `${name} - ${title}` : name;
    return `
      <article class="comment-card is-${escapeAttr(kind)}${portrait ? " has-portrait" : ""}">
        ${portrait ? `<img class="comment-avatar" src="${escapeAttr(portrait)}" alt="${escapeAttr(name)}" loading="lazy" decoding="async">` : ""}
        <div class="comment-card-body">
          <div class="comment-meta">${escapeHtml(meta)}</div>
          <div class="comment-text">${escapeHtml(comment.text || "")}</div>
        </div>
      </article>
    `;
  }

  function renderComposer(state) {
    return `
      <form class="orte-session-composer" data-action="submit-orte-session-comment">
        <div class="orte-session-character-picker">
          <select class="orte-session-input" name="characterId" data-action="select-orte-session-character" aria-label="Almanach-Charakter auswaehlen">
            <option value="">Freie Eingabe / Erzaehler</option>
            ${state.characters.map((character) => {
              const label = character.title ? `${character.name} - ${character.title}` : character.name;
              return `<option value="${escapeAttr(character.id)}">${escapeHtml(label)}</option>`;
            }).join("")}
          </select>
          <span>${state.characters.length ? `${state.characters.length} Almanach-Charaktere` : "Almanach-Charaktere werden geladen"}</span>
        </div>
        <div class="orte-session-form-grid">
          <input class="orte-session-input" name="charName" placeholder="Name">
          <input class="orte-session-input" name="charTitle" placeholder="Titel / Rolle">
          <input class="orte-session-input" name="portrait" placeholder="Portrait-URL">
          <select class="orte-session-input" name="commentKind" aria-label="Kommentarart">
            <option value="speech">Rede</option>
            <option value="action">Handlung</option>
            <option value="thought">Gedanke</option>
            <option value="narrator">Erzaehler</option>
          </select>
        </div>
        <textarea class="orte-session-textarea" name="text" required placeholder="Kommentar"></textarea>
        <div class="orte-session-form-actions">
          <input class="orte-session-input" name="deleteCode" placeholder="Loeschcode">
          <button class="orte-session-button" type="submit">Kommentieren</button>
        </div>
      </form>
    `;
  }

  function renderModuleEditor(state) {
    const module = state.draft;
    const page = module.page;
    return `
      <form class="orte-session-editor" data-action="save-orte-session-module">
        <div class="orte-session-editor-kicker">Modul-Editor</div>
        <div class="orte-session-form-grid">
          <label>Titel<input class="orte-session-input" name="title" value="${escapeAttr(module.title)}"></label>
          <label>Untertitel<input class="orte-session-input" name="subtitle" value="${escapeAttr(module.subtitle)}"></label>
          <label>Seitentitel<input class="orte-session-input" name="pageTitle" value="${escapeAttr(page.pageTitle)}"></label>
          <label>Stempel<input class="orte-session-input" name="stamp" value="${escapeAttr(module.stamp)}"></label>
          <label class="is-wide">Bild-URL<input class="orte-session-input" name="image" value="${escapeAttr(module.image)}"></label>
          <label>Hinweis<input class="orte-session-input" name="sessionHint" value="${escapeAttr(page.sessionHint)}"></label>
          <label>Leertitel<input class="orte-session-input" name="sessionEmptyTitle" value="${escapeAttr(page.sessionEmptyTitle)}"></label>
        </div>
        <label>Intro<textarea class="orte-session-textarea" name="sessionIntro">${escapeHtml(page.sessionIntro)}</textarea></label>
        <label>Leertext<textarea class="orte-session-textarea" name="sessionEmptyText">${escapeHtml(page.sessionEmptyText)}</textarea></label>
        <div class="orte-session-form-actions">
          <button class="orte-session-button" type="submit">Modul speichern</button>
          <button class="orte-session-button is-secondary" type="button" data-action="reset-orte-session-draft">Zuruecksetzen</button>
        </div>
      </form>
    `;
  }

  function handleClick(event) {
    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;
    const action = actionTarget.dataset.action;

    if (action === "open-orte-session") {
      const state = states.get(actionTarget.dataset.sceneId);
      if (!state) return;
      activeState = state;
      state.draft = cloneModule(state.module);
      renderModal(state);
      return;
    }

    if (action === "close-orte-session") {
      closeModal();
      return;
    }

    if (!activeState) return;

    if (action === "toggle-orte-session-composer") {
      activeState.composerOpen = !activeState.composerOpen;
      renderModal(activeState);
      return;
    }

    if (action === "toggle-orte-session-editor") {
      activeState.editorOpen = !activeState.editorOpen;
      activeState.draft = cloneModule(activeState.module);
      renderModal(activeState);
      return;
    }

    if (action === "reset-orte-session-draft") {
      activeState.draft = cloneModule(activeState.module);
      renderModal(activeState);
    }
  }

  function handleChange(event) {
    const select = event.target.closest("[data-action='select-orte-session-character']");
    if (select) applySelectedCharacter(select);
  }

  function handleInput(event) {
    if (!activeState) return;
    const field = event.target.closest(".orte-session-editor [name]");
    if (!field) return;
    updateDraftField(activeState, field.name, field.value);
  }

  async function handleSubmit(event) {
    const commentForm = event.target.closest("form[data-action='submit-orte-session-comment']");
    if (commentForm) {
      event.preventDefault();
      await submitComment(commentForm);
      return;
    }

    const editorForm = event.target.closest("form[data-action='save-orte-session-module']");
    if (editorForm) {
      event.preventDefault();
      await saveModuleDraft(editorForm);
    }
  }

  function closeModal() {
    modal.hidden = true;
    modal.innerHTML = "";
    document.body.classList.remove("orte-session-open");
    activeState = null;
  }

  async function submitComment(form) {
    if (!activeState) return;
    const formData = new FormData(form);
    const comment = {
      charName: String(formData.get("charName") || "").trim(),
      charTitle: String(formData.get("charTitle") || "").trim(),
      portrait: String(formData.get("portrait") || "").trim(),
      text: String(formData.get("text") || "").trim(),
      characterId: String(formData.get("characterId") || "").trim(),
      commentKind: String(formData.get("commentKind") || "speech"),
      orderKey: Date.now()
    };
    if (!comment.text) return;

    const deleteCode = String(formData.get("deleteCode") || "").trim();
    const fb = window._fb;

    if (fb && typeof fb.addComment === "function") {
      try {
        await fb.addComment(
          activeState.module.threadId,
          comment.charName,
          comment.charTitle,
          comment.portrait,
          comment.text,
          deleteCode,
          comment.commentKind === "narrator",
          {
            characterId: comment.characterId,
            commentKind: comment.commentKind,
            commentMode: comment.commentKind === "narrator" ? "narrator" : "character",
            orderKey: comment.orderKey,
            placeId: activeState.ortId,
            sceneId: activeState.sceneId
          }
        );
      } catch (error) {
        activeState.status = "Kommentar konnte online nicht gespeichert werden.";
        renderPreview(activeState);
      }
    } else {
      activeState.comments.push(comment);
      saveLocalComments(activeState.module.threadId, activeState.comments);
    }

    activeState.composerOpen = false;
    form.reset();
    renderModal(activeState);
  }

  async function saveModuleDraft(form) {
    if (!activeState) return;
    if (form) {
      Array.from(form.elements).forEach((field) => {
        if (field.name) updateDraftField(activeState, field.name, field.value);
      });
    }
    activeState.module = cloneModule(activeState.draft);
    saveModule(activeState.ortId, activeState.sceneId, activeState.module);
    const savedRemote = await saveRemoteModule(activeState);
    activeState.status = savedRemote ? "Online gespeichert." : "Lokal gespeichert.";
    activeState.editorOpen = false;
    renderPreview(activeState);
    renderModal(activeState);
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

  function updateDraftField(state, name, value) {
    const draft = state.draft;
    if (["title", "subtitle", "stamp", "image"].includes(name)) {
      draft[name] = String(value || "");
      return;
    }
    if (name === "pageTitle") draft.page.pageTitle = String(value || "");
    if (name === "sessionIntro") draft.page.sessionIntro = String(value || "");
    if (name === "sessionHint") draft.page.sessionHint = String(value || "");
    if (name === "sessionEmptyTitle") draft.page.sessionEmptyTitle = String(value || "");
    if (name === "sessionEmptyText") draft.page.sessionEmptyText = String(value || "");
  }

  async function connectSceneStore(state) {
    const store = await waitForSceneStore();
    if (!store || typeof store.subscribeScene !== "function") return;

    state.unsubscribeScene = store.subscribeScene(state.ortId, state.sceneId, (remoteModule) => {
      if (!remoteModule) return;
      state.module = normalizeModule(remoteModule, state.sceneId);
      state.draft = cloneModule(state.module);
      saveModule(state.ortId, state.sceneId, state.module);
      renderPreview(state);
      if (activeState === state) renderModal(state);
    }, () => {
      state.status = "Online-Szenenspeicher nicht erreichbar.";
      renderPreview(state);
    });
  }

  async function saveRemoteModule(state) {
    const store = await waitForSceneStore(1200);
    if (!store || typeof store.saveScene !== "function") return false;

    try {
      await store.saveScene(state.ortId, state.sceneId, state.module);
      return true;
    } catch (error) {
      return false;
    }
  }

  async function connectComments(state) {
    const fb = await waitForFirebase();
    if (fb && typeof fb.subscribeComments === "function") {
      state.unsubscribeComments = fb.subscribeComments(state.module.threadId, (comments) => {
        state.comments = Array.isArray(comments) ? comments : [];
        if (activeState === state) renderModal(state);
      }, () => {
        state.comments = loadLocalComments(state.module.threadId);
        if (activeState === state) renderModal(state);
      });
      return;
    }

    state.comments = loadLocalComments(state.module.threadId);
  }

  async function connectCharacters(state) {
    state.characters = await loadCharacters();
    if (activeState === state) renderModal(state);
  }

  async function loadCharacters() {
    if (characterLoadPromise) return characterLoadPromise;
    characterLoadPromise = (async () => {
      const fb = await waitForFirebase();
      if (!fb || typeof fb.loadCharacters !== "function") return [];

      try {
        return normalizeCharacters(await fb.loadCharacters());
      } catch (error) {
        return [];
      }
    })();
    return characterLoadPromise;
  }

  function applySelectedCharacter(select) {
    const form = select.closest("form");
    if (!form || !activeState) return;
    const selected = activeState.characters.find((character) => character.id === select.value);
    if (!selected) return;

    setFormValue(form, "charName", selected.name);
    setFormValue(form, "charTitle", selected.title);
    setFormValue(form, "portrait", selected.portrait);
  }

  function normalizeCharacters(characters) {
    const seen = new Set();
    return (Array.isArray(characters) ? characters : [])
      .map((character) => ({
        id: String(character.id || "").trim(),
        name: String(character.name || "").trim(),
        title: String(character.title || "").trim(),
        portrait: String(character.portrait || "").trim(),
        archived: !!character.archived
      }))
      .filter((character) => {
        const key = character.id || character.name;
        if (!key || !character.name || character.archived || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }));
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

  function createModal() {
    const existing = document.querySelector("[data-orte-session-modal]");
    if (existing) return existing;
    const element = document.createElement("div");
    element.className = "orte-session-modal";
    element.dataset.orteSessionModal = "";
    element.hidden = true;
    document.body.appendChild(element);
    return element;
  }

  function loadModule(ortId, sceneId, fallback) {
    const saved = readJson(getModuleStorageKey(ortId, sceneId));
    return normalizeModule(saved || fallback, sceneId);
  }

  function saveModule(ortId, sceneId, module) {
    writeJson(getModuleStorageKey(ortId, sceneId), module);
  }

  function loadLocalComments(threadId) {
    return readJson(getCommentStorageKey(threadId)) || [];
  }

  function saveLocalComments(threadId, comments) {
    writeJson(getCommentStorageKey(threadId), comments);
  }

  function getModuleStorageKey(ortId, sceneId) {
    return `aleria:orte:session-module:${ortId || "ort-vorlage"}:${sceneId || "szene"}`;
  }

  function getCommentStorageKey(threadId) {
    return `aleria:orte:comments:${threadId || "szene"}`;
  }

  function readJson(key) {
    try {
      return JSON.parse(window.localStorage.getItem(key) || "null");
    } catch (error) {
      return null;
    }
  }

  function writeJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      return;
    }
  }

  function cloneModule(module) {
    return normalizeModule(JSON.parse(JSON.stringify(module || {})), module?.id || "szene");
  }

  function setFormValue(form, name, value) {
    const field = form.elements.namedItem(name);
    if (field) field.value = value || "";
  }

  function sanitizeLine(value) {
    return escapeHtml(value).replace(/\n{2,}/g, "\n").replace(/\n/g, "<br>");
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
