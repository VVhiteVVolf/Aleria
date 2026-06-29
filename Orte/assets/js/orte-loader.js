(function () {
  "use strict";

  const registry = Array.isArray(window.ORTE_REGISTRY) ? window.ORTE_REGISTRY : [];
  let root = document.querySelector("[data-orte-static-template], [data-orte-root]");

  start();

  function start() {
    const requestedId = readRequestedId();
    const entry = findEntry(requestedId) || findDefaultEntry();

    if (!entry) {
      withRoot(() => renderMissingState(requestedId));
      return;
    }

    const docId = normalizeId(entry.docId || entry.id);
    window.ORTE_CONFIG = {
      ...(window.ORTE_CONFIG || {}),
      registryEntry: entry,
      docId,
      dataPath: entry.data || ""
    };
    window.AleriaOrteScenes = buildSceneConfig(entry, docId);
    document.title = `${entry.name || "Ort"} - Aleria`;
    withRoot(() => applyEntryShell(entry, docId));
    loadDataScript(entry);
  }

  function readRequestedId() {
    const params = new URLSearchParams(window.location.search);
    const fallbackId = getRoot()?.dataset.defaultId || "";
    return normalizeId(params.get("id") || params.get("ort") || window.location.hash.slice(1) || fallbackId);
  }

  function findEntry(id) {
    if (!id) return null;
    return registry.find((entry) => {
      const aliases = [entry.id, entry.slug, ...(entry.aliases || [])].map(normalizeId);
      return aliases.includes(id);
    }) || null;
  }

  function findDefaultEntry() {
    return registry.find((entry) => entry.id === "grossstadt-vorlage") || registry[0] || null;
  }

  function buildSceneConfig(entry, docId) {
    return {
      schemaVersion: 2,
      ortId: docId,
      ortName: entry.name || docId,
      firebase: {
        collection: entry.sceneCollection || "orte_scenes"
      },
      inlineFirebase: {
        collection: entry.inlineCollection || "orte_inline_content"
      },
      modules: entry.defaultScenes || {}
    };
  }

  function loadDataScript(entry) {
    if (!entry.data) return;
    const script = document.createElement("script");
    script.src = resolveOrtePath(entry.data);
    script.defer = true;
    script.dataset.orteDataScript = entry.id || "";
    script.onerror = () => {
      console.warn(`Ortsdaten konnten nicht geladen werden: ${entry.data}`);
    };
    document.head.appendChild(script);
  }

  function applyEntryShell(entry, docId) {
    const targetRoot = getRoot();
    if (!targetRoot) return;

    targetRoot.dataset.orteId = docId;
    targetRoot.dataset.orteName = entry.name || docId;
    targetRoot.dataset.orteType = entry.type || "";

    if (entry.status === "template") return;

    const primaryTitle = targetRoot.querySelector(".grossstadt-template-frame .pt-s-0004");
    if (primaryTitle) {
      primaryTitle.textContent = entry.name || docId;
    }
  }

  function withRoot(callback) {
    const targetRoot = getRoot();
    if (targetRoot) {
      callback(targetRoot);
      return;
    }

    document.addEventListener("DOMContentLoaded", () => {
      const readyRoot = getRoot();
      if (readyRoot) callback(readyRoot);
    }, { once: true });
  }

  function getRoot() {
    if (!root) {
      root = document.querySelector("[data-orte-static-template], [data-orte-root]");
    }
    return root;
  }

  function resolveOrtePath(path) {
    if (/^(https?:)?\/\//i.test(path) || path.startsWith("/")) return path;
    return `/Orte/${path.replace(/^\.?\//, "")}`;
  }

  function renderMissingState(requestedId) {
    const targetRoot = getRoot();
    if (!targetRoot) return;

    const message = requestedId
      ? `Kein Ort mit der ID "${escapeHtml(requestedId)}" gefunden.`
      : "Keine Orts-ID angegeben.";
    targetRoot.innerHTML = `
      <main class="place-error">
        <h1>Ort nicht gefunden</h1>
        <p>${message}</p>
        <section class="place-card">
          <h2>Verfügbare Orte</h2>
          ${registry.map(renderRegistryLink).join("") || "<p>Keine Orte registriert.</p>"}
        </section>
      </main>
    `;
  }

  function renderErrorState(entry, error) {
    const targetRoot = getRoot();
    if (!targetRoot) return;

    targetRoot.innerHTML = `
      <main class="place-error">
        <h1>${escapeHtml(entry.name || "Ort")}</h1>
        <p>Dieser Ort ist registriert, aber die Daten konnten nicht geladen werden.</p>
        <section class="place-card">
          <h2>Fehler</h2>
          <p>${escapeHtml(error.message || "Unbekannter Ladefehler")}</p>
        </section>
      </main>
    `;
  }

  function renderRegistryLink(entry) {
    const hierarchy = (entry.hierarchy || []).map((item) => item.name).filter(Boolean).join(" / ");
    return `
      <article class="place-registry-entry">
        <h3><a href="/Orte/grossstadt.html?id=${encodeURIComponent(entry.id)}">${escapeHtml(entry.name || entry.id)}</a></h3>
        <p>${escapeHtml(hierarchy || "-")}</p>
      </article>
    `;
  }

  function normalizeId(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }
})();
