(function () {
  "use strict";

  const registry = Array.isArray(window.STECKBRIEF_REGISTRY) ? window.STECKBRIEF_REGISTRY : [];
  const baseDataPath = "data/steckbrief-vorlage.data.js";
  const firebasePath = "assets/js/steckbrief-firebase.js";
  const appPath = "assets/js/steckbrief.js";

  start();

  async function start() {
    const root = document.querySelector("[data-steckbrief-root]");
    const requestedId = readRequestedId();
    const entry = findEntry(requestedId);

    if (!entry) {
      renderMissingState(root, requestedId);
      return;
    }

    try {
      window.STECKBRIEF_CONFIG = {
        ...(window.STECKBRIEF_CONFIG || {}),
        registryEntry: entry,
        docId: entry.docId || entry.id
      };
      await loadScript(baseDataPath);
      await loadScript(entry.data);
      document.title = `${entry.name || "Steckbrief"} - Aleria`;
      await loadScript(firebasePath, { type: "module" });
      await loadScript(appPath);
    } catch (error) {
      console.error("Steckbrief konnte nicht geladen werden:", error);
      renderErrorState(root, entry, error);
    }
  }

  function readRequestedId() {
    const params = new URLSearchParams(window.location.search);
    return normalizeId(params.get("id") || params.get("charakter") || window.location.hash.slice(1));
  }

  function findEntry(id) {
    if (!id) return null;
    return registry.find((entry) => {
      const aliases = [entry.id, entry.slug, ...(entry.aliases || [])].map(normalizeId);
      return aliases.includes(id);
    }) || null;
  }

  function loadScript(src, options = {}) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      if (options.type) script.type = options.type;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Script konnte nicht geladen werden: ${src}`));
      document.head.appendChild(script);
    });
  }

  function renderMissingState(root, requestedId) {
    if (!root) return;
    const intro = requestedId
      ? `Kein Steckbrief mit der ID "${escapeHtml(requestedId)}" gefunden.`
      : "Keine Steckbrief-ID angegeben.";
    root.innerHTML = `
      <main class="profile-main" style="max-width:980px;margin:4rem auto;">
        <section class="intro-panel">
          <div>
            <h1>Steckbrief nicht gefunden</h1>
            <p>${intro}</p>
          </div>
        </section>
        <section class="fact-card">
          <h2>Verfuegbare Steckbriefe</h2>
          <div class="fact-stack">
            ${registry.map(renderRegistryLink).join("")}
          </div>
        </section>
      </main>
    `;
  }

  function renderErrorState(root, entry, error) {
    if (!root) return;
    root.innerHTML = `
      <main class="profile-main" style="max-width:980px;margin:4rem auto;">
        <section class="intro-panel">
          <div>
            <h1>${escapeHtml(entry.name || "Steckbrief")}</h1>
            <p>Dieser Steckbrief ist registriert, aber die Daten konnten nicht geladen werden.</p>
          </div>
        </section>
        <section class="fact-card">
          <h2>Fehler</h2>
          <p>${escapeHtml(error.message || "Unbekannter Ladefehler")}</p>
        </section>
      </main>
    `;
  }

  function renderRegistryLink(entry) {
    const hierarchy = (entry.hierarchy || []).map((item) => item.name).filter(Boolean).join(" / ");
    const href = `steckbrief.html?id=${encodeURIComponent(entry.id)}`;
    return `
      <article class="fact-card">
        <h2><a href="${href}">${escapeHtml(entry.name || entry.id)}</a></h2>
        <table class="fact-table">
          <tbody>
            <tr><th>Pfad</th><td>${escapeHtml(hierarchy || "-")}</td></tr>
            <tr><th>ID</th><td><code>${escapeHtml(entry.id)}</code></td></tr>
          </tbody>
        </table>
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
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }
})();
