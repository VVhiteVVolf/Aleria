(function () {
  "use strict";

  const registry = Array.isArray(window.ORTE_REGISTRY) ? window.ORTE_REGISTRY : [];
  const baseDataPath = "data/grossstadt-vorlage.data.js";
  const appPath = "assets/js/orte-grossstadt.js";
  const root = document.querySelector("[data-orte-root]");

  start();

  async function start() {
    if (!root) return;

    const requestedId = readRequestedId();
    const entry = findEntry(requestedId) || findDefaultEntry();

    if (!entry) {
      renderMissingState(requestedId);
      return;
    }

    try {
      window.ORTE_CONFIG = {
        ...(window.ORTE_CONFIG || {}),
        registryEntry: entry,
        docId: entry.docId || entry.id
      };

      await loadScript(baseDataPath);
      if (entry.data && entry.data !== baseDataPath) {
        await loadScript(entry.data);
      }
      document.title = `${entry.name || "Ort"} - Aleria`;
      await loadScript(appPath);
    } catch (error) {
      console.error("Ort konnte nicht geladen werden:", error);
      renderErrorState(entry, error);
    }
  }

  function readRequestedId() {
    const params = new URLSearchParams(window.location.search);
    const fallbackId = root?.dataset.defaultId || "";
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

  function loadScript(path) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = resolveOrtePath(path);
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Script konnte nicht geladen werden: ${path}`));
      document.head.appendChild(script);
    });
  }

  function resolveOrtePath(path) {
    if (/^(https?:)?\/\//i.test(path) || path.startsWith("/")) return path;
    return `/Orte/${path.replace(/^\.?\//, "")}`;
  }

  function renderMissingState(requestedId) {
    const message = requestedId
      ? `Kein Ort mit der ID "${escapeHtml(requestedId)}" gefunden.`
      : "Keine Orts-ID angegeben.";
    root.innerHTML = `
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
    root.innerHTML = `
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
