(function () {
  "use strict";

  const registry = Array.isArray(window.KONTINENTE_REGISTRY) ? window.KONTINENTE_REGISTRY : [];
  const loaderScript = document.currentScript;
  let root = document.querySelector("[data-kontinent-root], [data-page-type='kingdom']");

  start();

  function start() {
    const requestedId = readRequestedId();
    const entry = findEntry(requestedId) || findDefaultEntry();

    if (!entry) {
      withRoot(() => renderMissingState(requestedId));
      return;
    }

    const docId = normalizeId(entry.docId || entry.id);
    window.KONTINENTE_CONFIG = {
      ...(window.KONTINENTE_CONFIG || {}),
      registryEntry: entry,
      docId,
      dataPath: entry.data || "",
    };
    window.ORTE_CONFIG = {
      ...(window.ORTE_CONFIG || {}),
      registryEntry: entry,
      docId,
      dataPath: entry.data || "",
    };
    window.AleriaOrteScenes = {
      schemaVersion: 2,
      ortId: docId,
      ortName: entry.name || docId,
      firebase: {
        collection: entry.sceneCollection || "kontinente_scenes",
      },
      inlineFirebase: {
        collection: entry.inlineCollection || "kontinente_inline_content",
        appName: "kontinente-inline-content",
        contentType: "kontinente-inline-content",
      },
      localStorage: {
        namespace: "kontinente",
        legacyNamespaces: ["orte"],
        commentsScope: "kontinente",
      },
      modules: entry.defaultScenes || {},
    };

    document.title = `${entry.name || "Kontinent"} - Aleria`;
    withRoot(() => applyEntryShell(entry, docId));
    loadDataScript(entry);
  }

  function readRequestedId() {
    const params = new URLSearchParams(window.location.search);
    const fallbackId = getRoot()?.dataset.defaultId || loaderScript?.dataset.defaultId || "";
    const explicitId = normalizeId(
      params.get("kontinent")
      || params.get("reich")
      || params.get("kingdom")
      || params.get("id")
    );
    if (explicitId) return explicitId;

    const hashId = normalizeId(window.location.hash.slice(1));
    if (findEntry(hashId)) return hashId;

    return normalizeId(fallbackId);
  }

  function findEntry(id) {
    if (!id) return null;
    return registry.find((entry) => {
      const aliases = [entry.id, entry.slug, ...(entry.aliases || [])].map(normalizeId);
      return aliases.includes(id);
    }) || null;
  }

  function findDefaultEntry() {
    return registry.find((entry) => entry.id === "koenigreich-vorlage") || registry[0] || null;
  }

  function loadDataScript(entry) {
    if (!entry.data) {
      notifyDataReady(null);
      return;
    }

    const script = document.createElement("script");
    script.src = resolveFeaturePath(entry.data);
    script.defer = true;
    script.dataset.kontinenteDataScript = entry.id || "";
    script.onload = () => notifyDataReady(window.KONTINENTE_DATA || null);
    script.onerror = () => {
      console.warn(`Kontinentdaten konnten nicht geladen werden: ${entry.data}`);
      notifyDataReady(null);
    };
    document.head.appendChild(script);
  }

  function notifyDataReady(data) {
    window.dispatchEvent(new CustomEvent("aleria:kontinente:data-ready", {
      detail: {
        config: window.KONTINENTE_CONFIG,
        data,
      },
    }));
  }

  function applyEntryShell(entry, docId) {
    const targetRoot = getRoot();
    if (!targetRoot) return;

    targetRoot.dataset.kontinentId = docId;
    targetRoot.dataset.kontinentName = entry.name || docId;
    targetRoot.dataset.kontinentType = entry.type || "";

    targetRoot.querySelectorAll("[data-kontinent-title]").forEach((title) => {
      title.textContent = entry.name || docId;
    });
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
    if (!root) root = document.querySelector("[data-kontinent-root], [data-page-type='kingdom']");
    return root;
  }

  function resolveFeaturePath(path) {
    if (/^(https?:)?\/\//i.test(path) || path.startsWith("/")) return path;
    const baseUrl = loaderScript?.src ? new URL("../../", loaderScript.src) : new URL("./", window.location.href);
    return new URL(path.replace(/^\.?\//, ""), baseUrl).toString();
  }

  function renderMissingState(requestedId) {
    const targetRoot = getRoot();
    if (!targetRoot) return;

    const message = requestedId
      ? `Kein Kontinent- oder Reichseintrag mit der ID "${escapeHtml(requestedId)}" gefunden.`
      : "Keine Kontinent-ID angegeben.";
    targetRoot.innerHTML = `
      <main class="kingdom-error">
        <h1>Eintrag nicht gefunden</h1>
        <p>${message}</p>
        <section class="kingdom-error-card">
          <h2>Verfügbare Einträge</h2>
          ${registry.map(renderRegistryLink).join("") || "<p>Keine Kontinente registriert.</p>"}
        </section>
      </main>
    `;
  }

  function renderRegistryLink(entry) {
    const hierarchy = (entry.hierarchy || []).map((item) => item.name).filter(Boolean).join(" / ");
    const page = entry.page || "_template/KoenigreichTemplate.html";
    const href = `${resolveFeaturePath(page)}?kontinent=${encodeURIComponent(entry.id)}`;
    return `
      <article class="kingdom-registry-entry">
        <h3><a href="${escapeHtml(href)}">${escapeHtml(entry.name || entry.id)}</a></h3>
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
      "'": "&#39;",
    }[char]));
  }
})();
