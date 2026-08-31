(function () {
  "use strict";

  const registry = Array.isArray(window.GRUPPEN_REGISTRY) ? window.GRUPPEN_REGISTRY : [];
  const loaderScript = document.currentScript;
  let root = document.querySelector("[data-gruppen-root]");

  start();

  function start() {
    const requestedId = readRequestedId();
    const entry = findEntry(requestedId) || findDefaultEntry();

    if (!entry) {
      withRoot(() => renderMissingState(requestedId));
      return;
    }

    const docId = normalizeId(entry.docId || entry.id);
    window.GRUPPEN_CONFIG = {
      ...(window.GRUPPEN_CONFIG || {}),
      registryEntry: entry,
      docId,
      dataPath: entry.data || "",
    };

    document.title = `${entry.name || "Gruppe"} - Aleria`;
    withRoot(() => applyEntryShell(entry, docId));
    loadDataScript(entry);
  }

  function readRequestedId() {
    const params = new URLSearchParams(window.location.search);
    const fallbackId = getRoot()?.dataset.defaultId || "";
    return normalizeId(params.get("gruppe") || params.get("group") || params.get("id") || window.location.hash.slice(1) || fallbackId);
  }

  function findEntry(id) {
    if (!id) return null;
    return registry.find((entry) => {
      const aliases = [entry.id, entry.slug, ...(entry.aliases || [])].map(normalizeId);
      return aliases.includes(id);
    }) || null;
  }

  function findDefaultEntry() {
    return registry.find((entry) => entry.id === "gruppen-vorlage") || registry[0] || null;
  }

  function loadDataScript(entry) {
    if (!entry.data) {
      notifyDataReady(null);
      return;
    }

    const script = document.createElement("script");
    script.src = resolveFeaturePath(entry.data);
    script.defer = true;
    script.dataset.gruppenDataScript = entry.id || "";
    script.onload = () => notifyDataReady(window.GRUPPEN_DATA || null);
    script.onerror = () => {
      console.warn(`Gruppendaten konnten nicht geladen werden: ${entry.data}`);
      notifyDataReady(null);
    };
    document.head.appendChild(script);
  }

  function notifyDataReady(data) {
    window.dispatchEvent(new CustomEvent("aleria:gruppen:data-ready", {
      detail: {
        config: window.GRUPPEN_CONFIG,
        data,
      },
    }));
  }

  function applyEntryShell(entry, docId) {
    const targetRoot = getRoot();
    if (!targetRoot) return;

    targetRoot.dataset.gruppenId = docId;
    targetRoot.dataset.gruppenName = entry.name || docId;
    targetRoot.dataset.gruppenType = entry.type || "";

    const title = targetRoot.querySelector("[data-gruppen-title]");
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
    if (!root) root = document.querySelector("[data-gruppen-root]");
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
      ? `Keine Gruppe mit der ID "${escapeHtml(requestedId)}" gefunden.`
      : "Keine Gruppen-ID angegeben.";
    targetRoot.innerHTML = `
      <main class="gruppen-error">
        <h1>Gruppe nicht gefunden</h1>
        <p>${message}</p>
        <section class="gruppen-error-card">
          <h2>Verfuegbare Gruppen</h2>
          ${registry.map(renderRegistryLink).join("") || "<p>Keine Gruppen registriert.</p>"}
        </section>
      </main>
    `;
  }

  function renderRegistryLink(entry) {
    const hierarchy = (entry.hierarchy || []).map((item) => item.name).filter(Boolean).join(" / ");
    const page = entry.page || "gruppe.html";
    return `
      <article class="gruppen-registry-entry">
        <h3><a href="${escapeHtml(page)}?gruppe=${encodeURIComponent(entry.id)}">${escapeHtml(entry.name || entry.id)}</a></h3>
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
