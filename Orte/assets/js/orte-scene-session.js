(function () {
  "use strict";

  const hosts = Array.from(document.querySelectorAll("[data-orte-scene]"));
  if (!hosts.length) return;

  const config = window.AleriaOrteScenes || {};
  const states = new WeakMap();
  let characterLoadPromise = null;

  hosts.forEach((host) => {
    const sceneId = String(host.dataset.orteScene || "").trim();
    const scene = normalizeScene(config.scenes && config.scenes[sceneId], sceneId);
    const state = {
      host,
      ortId: String(config.ortId || "ort-vorlage"),
      ortName: String(config.ortName || "Ort-Vorlage"),
      sceneId,
      scene,
      blocks: loadSceneBlocks(config.ortId, sceneId, scene.blocks),
      draftBlocks: [],
      comments: [],
      characters: [],
      editorOpen: false,
      status: ""
    };

    state.draftBlocks = cloneBlocks(state.blocks);
    states.set(host, state);
    renderScene(state);
    connectSceneStore(state);
    connectComments(state);
    connectCharacters(state);
  });

  document.addEventListener("click", handleSceneClick);
  document.addEventListener("input", handleSceneInput);
  document.addEventListener("change", handleSceneInput);
  document.addEventListener("submit", handleSceneSubmit);

  function normalizeScene(scene, sceneId) {
    const fallback = {
      id: sceneId,
      title: sceneId || "Szene",
      blocks: []
    };
    const source = scene && typeof scene === "object" ? scene : fallback;

    return {
      id: String(source.id || sceneId || "szene"),
      title: String(source.title || fallback.title),
      threadId: String(source.threadId || `orte:${config.ortId || "ort-vorlage"}:${sceneId || "szene"}`),
      blocks: normalizeBlocks(source.blocks)
    };
  }

  function normalizeBlocks(blocks) {
    return (Array.isArray(blocks) ? blocks : [])
      .map((block) => ({
        type: normalizeBlockType(block.type),
        speaker: String(block.speaker || ""),
        text: String(block.text || "")
      }))
      .filter((block) => block.type === "divider" || block.text || block.speaker);
  }

  function normalizeBlockType(type) {
    const value = String(type || "intro");
    return ["intro", "speech", "action", "thought", "divider"].includes(value) ? value : "intro";
  }

  function renderScene(state) {
    state.host.innerHTML = `
      <details class="orte-scene" open>
        <summary>${escapeHtml(state.scene.title)}</summary>
        <div class="orte-scene-shell">
          <div class="orte-scene-stage" data-role="scene-stage">
            ${renderBlocks(state.blocks)}
          </div>
          <div class="orte-scene-actions">
            <button class="orte-scene-button" type="button" data-action="toggle-scene-editor">Bearbeiten</button>
            <span class="orte-scene-status" data-role="scene-status">${escapeHtml(state.status)}</span>
          </div>
          ${renderEditor(state)}
          ${renderComments(state)}
        </div>
      </details>
    `;
  }

  function renderBlocks(blocks) {
    if (!blocks.length) {
      return `<p class="orte-scene-block is-intro">Noch keine Szenenbloecke angelegt.</p>`;
    }

    return blocks.map((block) => {
      if (block.type === "divider") return `<hr class="orte-scene-divider">`;
      const typeClass = `is-${escapeAttr(block.type)}`;
      const speaker = block.speaker
        ? `<span class="orte-scene-speaker">${escapeHtml(block.speaker)}:</span> `
        : "";
      return `<p class="orte-scene-block ${typeClass}">${speaker}${escapeHtml(block.text)}</p>`;
    }).join("");
  }

  function renderEditor(state) {
    const hiddenClass = state.editorOpen ? "" : " is-hidden";
    const rows = state.draftBlocks.map((block, index) => `
      <div class="orte-scene-editor-row" data-editor-row="${index}">
        <select class="orte-scene-select" data-field="type" aria-label="Blocktyp">
          ${renderTypeOption("intro", "Einleitung", block.type)}
          ${renderTypeOption("speech", "Dialog", block.type)}
          ${renderTypeOption("action", "Handlung", block.type)}
          ${renderTypeOption("thought", "Gedanke", block.type)}
          ${renderTypeOption("divider", "Trenner", block.type)}
        </select>
        <input class="orte-scene-input" data-field="speaker" value="${escapeAttr(block.speaker)}" placeholder="Name">
        <textarea class="orte-scene-textarea" data-field="text" placeholder="Text">${escapeHtml(block.text)}</textarea>
        <button class="orte-scene-button is-secondary" type="button" data-action="remove-scene-block" aria-label="Block entfernen">Entfernen</button>
      </div>
    `).join("");

    return `
      <section class="orte-scene-editor${hiddenClass}" data-role="scene-editor" aria-label="Szeneneditor">
        <h3>Szene bearbeiten</h3>
        <div class="orte-scene-editor-list" data-role="scene-editor-list">${rows}</div>
        <div class="orte-scene-editor-actions">
          <button class="orte-scene-button is-secondary" type="button" data-action="add-scene-block">Block hinzufuegen</button>
          <button class="orte-scene-button" type="button" data-action="save-scene-blocks">Szene speichern</button>
          <button class="orte-scene-button is-secondary" type="button" data-action="reset-scene-blocks">Vorlage wiederherstellen</button>
        </div>
      </section>
    `;
  }

  function renderTypeOption(value, label, current) {
    const selected = value === current ? " selected" : "";
    return `<option value="${escapeAttr(value)}"${selected}>${escapeHtml(label)}</option>`;
  }

  function renderComments(state) {
    const comments = state.comments.length
      ? state.comments.map(renderComment).join("")
      : `<p class="orte-scene-status">Noch keine Kommentare fuer diese Ortsszene.</p>`;

    return `
      <section class="orte-scene-comments" data-role="scene-comments" aria-label="Kommentare">
        <h3>Kommentare</h3>
        <form class="orte-scene-comment-form" data-action="add-scene-comment">
          ${renderCharacterSelect(state)}
          <div class="orte-scene-comment-grid">
            <input class="orte-scene-input" name="charName" placeholder="Name">
            <input class="orte-scene-input" name="charTitle" placeholder="Titel / Rolle">
            <input class="orte-scene-input" name="portrait" placeholder="Portrait-URL">
            <select class="orte-scene-select" name="commentKind" aria-label="Kommentarart">
              <option value="speech">Rede</option>
              <option value="action">Handlung</option>
              <option value="thought">Gedanke</option>
              <option value="narrator">Erzaehler</option>
            </select>
          </div>
          <textarea class="orte-scene-textarea" name="text" required placeholder="Kommentar"></textarea>
          <div class="orte-scene-comment-actions">
            <input class="orte-scene-input" name="deleteCode" placeholder="Loeschcode">
            <button class="orte-scene-button" type="submit">Kommentieren</button>
          </div>
        </form>
        <div class="orte-scene-comment-list" data-role="scene-comment-list">${comments}</div>
      </section>
    `;
  }

  function renderCharacterSelect(state) {
    const options = state.characters.map((character) => {
      const label = character.title
        ? `${character.name} - ${character.title}`
        : character.name;
      return `<option value="${escapeAttr(character.id)}">${escapeHtml(label)}</option>`;
    }).join("");

    const status = state.characters.length
      ? `${state.characters.length} Almanach-Charaktere verfuegbar`
      : "Almanach-Charaktere werden geladen oder sind nicht erreichbar.";

    return `
      <div class="orte-scene-character-picker">
        <select class="orte-scene-select" name="characterId" data-action="select-scene-character" aria-label="Almanach-Charakter auswaehlen">
          <option value="">Freie Eingabe / Erzaehler</option>
          ${options}
        </select>
        <span class="orte-scene-character-status">${escapeHtml(status)}</span>
      </div>
    `;
  }

  function renderComment(comment) {
    const name = String(comment.charName || comment.author || "Unbekannt");
    const title = String(comment.charTitle || "");
    const kind = String(comment.commentKind || "speech");
    const meta = title ? `${name} - ${title}` : name;
    const portrait = String(comment.portrait || "").trim();
    return `
      <article class="orte-scene-comment is-${escapeAttr(kind)}${portrait ? " has-portrait" : ""}">
        ${portrait ? `<img class="orte-scene-comment-portrait" src="${escapeAttr(portrait)}" alt="${escapeAttr(name)}" loading="lazy" decoding="async">` : ""}
        <div>
          <div class="orte-scene-comment-meta">${escapeHtml(meta)}</div>
          <p class="orte-scene-comment-text">${escapeHtml(comment.text || "")}</p>
        </div>
      </article>
    `;
  }

  async function handleSceneClick(event) {
    const button = event.target.closest("[data-action]");
    const host = event.target.closest("[data-orte-scene]");
    if (!button || !host) return;

    const state = states.get(host);
    if (!state) return;

    const action = button.dataset.action;
    if (action === "toggle-scene-editor") {
      state.editorOpen = !state.editorOpen;
      state.draftBlocks = cloneBlocks(state.blocks);
      renderScene(state);
    }

    if (action === "add-scene-block") {
      state.draftBlocks.push({ type: "speech", speaker: "", text: "" });
      renderScene(state);
    }

    if (action === "remove-scene-block") {
      const row = button.closest("[data-editor-row]");
      const index = Number(row && row.dataset.editorRow);
      if (Number.isInteger(index)) state.draftBlocks.splice(index, 1);
      renderScene(state);
    }

    if (action === "save-scene-blocks") {
      state.blocks = normalizeBlocks(state.draftBlocks);
      saveSceneBlocks(state.ortId, state.sceneId, state.blocks);
      const savedRemote = await saveRemoteScene(state);
      state.status = savedRemote
        ? "Online fuer diesen Ort gespeichert."
        : "Lokal fuer diesen Ort gespeichert.";
      renderScene(state);
    }

    if (action === "reset-scene-blocks") {
      clearSceneBlocks(state.ortId, state.sceneId);
      state.blocks = cloneBlocks(state.scene.blocks);
      state.draftBlocks = cloneBlocks(state.blocks);
      const savedRemote = await saveRemoteScene(state);
      state.status = savedRemote
        ? "Vorlage online wiederhergestellt."
        : "Vorlage lokal wiederhergestellt.";
      renderScene(state);
    }
  }

  function handleSceneInput(event) {
    const characterSelect = event.target.closest("[data-action='select-scene-character']");
    if (characterSelect) {
      applySelectedCharacter(characterSelect);
      return;
    }

    const field = event.target.closest("[data-field]");
    const host = event.target.closest("[data-orte-scene]");
    if (!field || !host) return;

    const state = states.get(host);
    const row = field.closest("[data-editor-row]");
    const index = Number(row && row.dataset.editorRow);
    if (!state || !Number.isInteger(index) || !state.draftBlocks[index]) return;

    const key = field.dataset.field;
    if (key === "type") state.draftBlocks[index].type = normalizeBlockType(field.value);
    if (key === "speaker") state.draftBlocks[index].speaker = field.value;
    if (key === "text") state.draftBlocks[index].text = field.value;
  }

  async function handleSceneSubmit(event) {
    const form = event.target.closest("form[data-action='add-scene-comment']");
    const host = event.target.closest("[data-orte-scene]");
    if (!form || !host) return;

    event.preventDefault();
    const state = states.get(host);
    if (!state) return;

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
          state.scene.threadId,
          comment.charName,
          comment.charTitle,
          comment.portrait,
          comment.text,
          deleteCode,
          comment.commentKind === "narrator",
          {
            commentKind: comment.commentKind,
            commentMode: comment.commentKind === "narrator" ? "narrator" : "character",
            characterId: comment.characterId,
            orderKey: comment.orderKey,
            placeId: state.ortId,
            sceneId: state.sceneId
          }
        );
      } catch (error) {
        state.status = "Kommentar konnte online nicht gespeichert werden.";
        renderScene(state);
        return;
      }
    } else {
      state.comments.push(comment);
      saveLocalComments(state.scene.threadId, state.comments);
      renderScene(state);
    }

    form.reset();
  }

  async function connectComments(state) {
    const fb = await waitForFirebase();
    if (fb && typeof fb.subscribeComments === "function") {
      state.unsubscribe = fb.subscribeComments(state.scene.threadId, (comments) => {
        state.comments = Array.isArray(comments) ? comments : [];
        renderScene(state);
      }, () => {
        state.comments = loadLocalComments(state.scene.threadId);
        renderScene(state);
      });
      return;
    }

    state.comments = loadLocalComments(state.scene.threadId);
    renderScene(state);
  }

  async function connectCharacters(state) {
    const characters = await loadCharacters();
    state.characters = characters;
    renderScene(state);
  }

  async function loadCharacters() {
    if (characterLoadPromise) return characterLoadPromise;

    characterLoadPromise = (async () => {
      const fb = await waitForFirebase();
      if (!fb || typeof fb.loadCharacters !== "function") return [];

      try {
        const characters = await fb.loadCharacters();
        return normalizeCharacters(characters);
      } catch (error) {
        return [];
      }
    })();

    return characterLoadPromise;
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

  function applySelectedCharacter(select) {
    const host = select.closest("[data-orte-scene]");
    const form = select.closest("form");
    const state = host ? states.get(host) : null;
    if (!state || !form) return;

    const selected = state.characters.find((character) => character.id === select.value);
    if (!selected) return;

    setFormValue(form, "charName", selected.name);
    setFormValue(form, "charTitle", selected.title);
    setFormValue(form, "portrait", selected.portrait);
  }

  function setFormValue(form, name, value) {
    const field = form.elements.namedItem(name);
    if (field) field.value = value || "";
  }

  async function connectSceneStore(state) {
    const store = await waitForSceneStore();
    if (!store || typeof store.subscribeScene !== "function") return;

    state.unsubscribeScene = store.subscribeScene(state.ortId, state.sceneId, (remoteScene) => {
      if (!remoteScene || !Array.isArray(remoteScene.blocks) || !remoteScene.blocks.length) return;
      state.blocks = normalizeBlocks(remoteScene.blocks);
      if (!state.editorOpen) state.draftBlocks = cloneBlocks(state.blocks);
      saveSceneBlocks(state.ortId, state.sceneId, state.blocks);
      renderScene(state);
    }, () => {
      state.status = "Online-Szenenspeicher nicht erreichbar.";
      renderScene(state);
    });
  }

  async function saveRemoteScene(state) {
    const store = await waitForSceneStore(1200);
    if (!store || typeof store.saveScene !== "function") return false;

    try {
      await store.saveScene(state.ortId, state.sceneId, {
        title: state.scene.title,
        threadId: state.scene.threadId,
        blocks: state.blocks
      });
      return true;
    } catch (error) {
      return false;
    }
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

  function loadSceneBlocks(ortId, sceneId, fallback) {
    const saved = readJson(getSceneStorageKey(ortId, sceneId));
    return normalizeBlocks(saved && saved.blocks ? saved.blocks : fallback);
  }

  function saveSceneBlocks(ortId, sceneId, blocks) {
    writeJson(getSceneStorageKey(ortId, sceneId), {
      schemaVersion: 1,
      updatedAt: Date.now(),
      blocks
    });
  }

  function clearSceneBlocks(ortId, sceneId) {
    try {
      window.localStorage.removeItem(getSceneStorageKey(ortId, sceneId));
    } catch (error) {
      return;
    }
  }

  function loadLocalComments(threadId) {
    return readJson(getCommentStorageKey(threadId)) || [];
  }

  function saveLocalComments(threadId, comments) {
    writeJson(getCommentStorageKey(threadId), comments);
  }

  function getSceneStorageKey(ortId, sceneId) {
    return `aleria:orte:scene:${ortId || "ort-vorlage"}:${sceneId || "szene"}`;
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

  function cloneBlocks(blocks) {
    return normalizeBlocks(blocks).map((block) => ({ ...block }));
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
