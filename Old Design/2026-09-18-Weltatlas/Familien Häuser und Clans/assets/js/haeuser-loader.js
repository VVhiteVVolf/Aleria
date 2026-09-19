(function () {
  "use strict";

  const registry = Array.isArray(window.HAEUSER_REGISTRY) ? window.HAEUSER_REGISTRY : [];
  const loaderScript = document.currentScript;
  let root = document.querySelector("[data-haeuser-root]");

  start();

  function start() {
    const requestedId = readRequestedId();
    const entry = findEntry(requestedId) || findDefaultEntry();

    if (!entry) {
      withRoot(() => renderMissingState(requestedId));
      return;
    }

    const docId = normalizeId(entry.docId || entry.id);
    window.HAEUSER_CONFIG = {
      ...(window.HAEUSER_CONFIG || {}),
      registryEntry: entry,
      docId,
      dataPath: entry.data || "",
    };

    document.title = `${entry.name || "Haus"} - Aleria`;
    withRoot(() => applyEntryShell(entry, docId));
    loadDataScript(entry);
  }

  function readRequestedId() {
    const params = new URLSearchParams(window.location.search);
    const fallbackId = getRoot()?.dataset.defaultId || "";
    return normalizeId(
      params.get("haus")
      || params.get("haeuser")
      || params.get("house")
      || params.get("familie")
      || params.get("clan")
      || params.get("id")
      || window.location.hash.slice(1)
      || fallbackId
    );
  }

  function findEntry(id) {
    if (!id) return null;
    return registry.find((entry) => {
      const aliases = [entry.id, entry.slug, ...(entry.aliases || [])].map(normalizeId);
      return aliases.includes(id);
    }) || null;
  }

  function findDefaultEntry() {
    return registry.find((entry) => entry.id === "haeuser-vorlage") || registry[0] || null;
  }

  function loadDataScript(entry) {
    if (!entry.data) {
      notifyDataReady(null);
      return;
    }

    const script = document.createElement("script");
    script.src = resolveFeaturePath(entry.data);
    script.defer = true;
    script.dataset.haeuserDataScript = entry.id || "";
    script.onload = () => notifyDataReady(window.HAEUSER_DATA || null);
    script.onerror = () => {
      console.warn(`Hausdaten konnten nicht geladen werden: ${entry.data}`);
      notifyDataReady(null);
    };
    document.head.appendChild(script);
  }

  function notifyDataReady(data) {
    window.dispatchEvent(new CustomEvent("aleria:haeuser:data-ready", {
      detail: {
        config: window.HAEUSER_CONFIG,
        data,
      },
    }));
  }

  function applyEntryShell(entry, docId) {
    const targetRoot = getRoot();
    if (!targetRoot) return;

    targetRoot.dataset.haeuserId = docId;
    targetRoot.dataset.haeuserName = entry.name || docId;
    targetRoot.dataset.haeuserType = entry.type || "";

    const title = targetRoot.querySelector("[data-haeuser-title]");
    if (title) title.textContent = entry.name || docId;
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
    if (!root) root = document.querySelector("[data-haeuser-root]");
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
      ? `Kein Haus mit der ID "${escapeHtml(requestedId)}" gefunden.`
      : "Keine Haus-ID angegeben.";
    targetRoot.innerHTML = `
      <main class="haeuser-error">
        <h1>Haus nicht gefunden</h1>
        <p>${message}</p>
        <section class="haeuser-error-card">
          <h2>Verfügbare Häuser</h2>
          ${registry.map(renderRegistryLink).join("") || "<p>Keine Häuser registriert.</p>"}
        </section>
      </main>
    `;
  }

  function renderRegistryLink(entry) {
    const hierarchy = (entry.hierarchy || []).map((item) => item.name).filter(Boolean).join(" / ");
    const page = entry.page || "haus.html";
    return `
      <article class="haeuser-registry-entry">
        <h3><a href="${escapeHtml(page)}?haus=${encodeURIComponent(entry.id)}">${escapeHtml(entry.name || entry.id)}</a></h3>
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
