(function () {
  "use strict";

  const contentScript = document.currentScript;
  const root = document.querySelector("[data-kontinent-root]");
  const entry = window.KONTINENTE_CONFIG?.registryEntry;

  if (!root || !entry?.contentSource) return;

  loadRepositoryContent(entry.contentSource)
    .then((payload) => applyRepositoryContent(root, payload))
    .catch((error) => {
      console.warn(`Kontinentinhalt konnte nicht geladen werden: ${entry.contentSource}`, error);
    });

  async function loadRepositoryContent(path) {
    const response = await fetch(resolveContentPath(path), { credentials: "same-origin" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const source = await response.json();
    const payload = source?.data || source;
    if (!payload || payload.contentSchemaVersion !== 2) {
      throw new Error("Nicht unterstuetztes Inhaltsformat");
    }
    return payload;
  }

  function applyRepositoryContent(targetRoot, payload) {
    const contentTables = prepareContentTables(targetRoot);
    let appliedTables = 0;

    Object.entries(payload.tables || {}).forEach(([id, html]) => {
      const table = contentTables.get(id);
      if (!table?.tBodies?.[0]) return;
      table.tBodies[0].innerHTML = sanitizeRepositoryHtml(html);
      appliedTables += 1;
    });

    const textTargets = collectTextTargets(targetRoot);
    let appliedTexts = 0;
    Object.entries(payload.texts || {}).forEach(([id, html]) => {
      const target = textTargets.get(id);
      if (!target) return;
      target.innerHTML = sanitizeRepositoryHtml(html);
      appliedTexts += 1;
    });

    const appliedImages = applyRepositoryImages(targetRoot, payload.images || {});
    applyContentPolicy(targetRoot, entry.contentPolicy || {});

    targetRoot.dataset.repositoryContent = "ready";
    window.dispatchEvent(new CustomEvent("aleria:kontinente:content-ready", {
      detail: {
        id: entry.id,
        root: targetRoot,
        appliedTables,
        appliedTexts,
        appliedImages,
      },
    }));
  }

  function applyRepositoryImages(targetRoot, imageEntries) {
    const images = Array.from(targetRoot.querySelectorAll("img"))
      .filter((image) => !isGeneratedView(image));
    let appliedImages = 0;

    Object.entries(imageEntries).forEach(([id, config]) => {
      const match = /^bild-(\d+)$/.exec(id);
      if (!match || !config || typeof config !== "object") return;
      const image = images[Number(match[1])];
      if (!image) return;

      if (typeof config.src === "string" && config.src) image.setAttribute("src", config.src);
      if (typeof config.alt === "string") image.setAttribute("alt", config.alt);
      applyRepositoryImageLink(image, config.href);
      appliedImages += 1;
    });

    return appliedImages;
  }

  function applyRepositoryImageLink(image, href) {
    const currentLink = image.closest("a");
    const normalizedHref = typeof href === "string" ? href.trim() : "";

    if (!normalizedHref || /^javascript:/i.test(normalizedHref)) {
      if (currentLink) currentLink.replaceWith(...currentLink.childNodes);
      return;
    }

    if (currentLink) {
      currentLink.setAttribute("href", normalizedHref);
      currentLink.removeAttribute("target");
      currentLink.removeAttribute("rel");
      return;
    }

    const link = document.createElement("a");
    link.setAttribute("href", normalizedHref);
    image.replaceWith(link);
    link.append(image);
  }

  function prepareContentTables(targetRoot) {
    const tables = Array.from(targetRoot.querySelectorAll("table"))
      .filter((table) => !table.querySelector("table"))
      .filter((table) => table.tBodies.length && table.tBodies[0].rows.length > 1)
      .filter((table) => !isGeneratedView(table));

    return new Map(tables.map((table, index) => {
      const id = `table-${String(index).padStart(4, "0")}`;
      table.dataset.kontinenteContentTable = id;
      return [id, table];
    }));
  }

  function collectTextTargets(targetRoot) {
    const explicitSelector = "[data-orte-explicit-inline], [data-orte-portrait-field]";
    const candidates = Array.from(targetRoot.querySelectorAll(
      `${explicitSelector}, h2, h3, details > summary > span, p, td, th, li`
    ))
      .filter((node) => !isGeneratedView(node))
      .filter((node) => !node.closest("[data-kontinente-content-table]"))
      .filter((node) => !node.closest("[data-orte-image-key], [data-orte-rating-key]"))
      .filter((node) => !node.matches(".place-spacer, .orte-portrait-layout-spacer"))
      .filter((node) => node.matches(explicitSelector) || !node.querySelector(explicitSelector))
      .filter((node) => !node.querySelector(
        "table, h2, h3, summary, p, td, th, li, [data-orte-image-key], [data-orte-rating-key]"
      ))
      .filter((node) => normalizeWhitespace(node.textContent));

    return new Map(candidates.map((node, index) => [
      `text-${String(index).padStart(4, "0")}`,
      node,
    ]));
  }

  function isGeneratedView(node) {
    return !!node.closest(".kingdom-county-card-view, .kingdom-family-card-view");
  }

  function sanitizeRepositoryHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = String(html || "");
    template.content.querySelectorAll("script, style, link, meta, iframe, object, embed, form").forEach((node) => node.remove());
    template.content.querySelectorAll("*").forEach((node) => {
      Array.from(node.attributes).forEach((attribute) => {
        if (/^on/i.test(attribute.name)) node.removeAttribute(attribute.name);
      });
      ["href", "src"].forEach((attributeName) => {
        if (/^\s*javascript:/i.test(node.getAttribute(attributeName) || "")) {
          node.removeAttribute(attributeName);
        }
      });
      if (node.getAttribute("target") === "_blank") node.setAttribute("rel", "noopener noreferrer");
    });
    applyContentPolicy(template.content, entry.contentPolicy || {});
    return template.innerHTML;
  }

  function applyContentPolicy(content, policy) {
    const blockedHosts = Array.isArray(policy.blockedLinkHosts)
      ? policy.blockedLinkHosts.map(normalizeHost).filter(Boolean)
      : [];
    const linkReplacements = Object.entries(policy.linkReplacements || {})
      .map(([host, href]) => [normalizeHost(host), String(href || "")])
      .filter(([host, href]) => host && href);
    const assetReplacements = policy.assetReplacements || {};

    content.querySelectorAll("a[href]").forEach((anchor) => {
      const hostname = getHostname(anchor.getAttribute("href"));
      if (blockedHosts.some((host) => hostMatches(hostname, host))) {
        anchor.replaceWith(...anchor.childNodes);
        return;
      }

      const replacement = linkReplacements.find(([host]) => hostMatches(hostname, host));
      if (!replacement) return;
      anchor.setAttribute("href", replacement[1]);
      anchor.removeAttribute("target");
      anchor.removeAttribute("rel");
    });

    content.querySelectorAll("img[src]").forEach((image) => {
      const source = image.getAttribute("src") || "";
      const replacement = assetReplacements[source];
      if (replacement) image.setAttribute("src", replacement);
    });
  }

  function getHostname(href) {
    try {
      return new URL(href, window.location.href).hostname.toLowerCase();
    } catch {
      return "";
    }
  }

  function normalizeHost(value) {
    return String(value || "").trim().toLowerCase().replace(/^www\./, "");
  }

  function hostMatches(hostname, expectedHost) {
    const normalizedHostname = normalizeHost(hostname);
    return normalizedHostname === expectedHost || normalizedHostname.endsWith(`.${expectedHost}`);
  }

  function resolveContentPath(path) {
    if (/^(https?:)?\/\//i.test(path) || path.startsWith("/")) return path;
    const featureRoot = contentScript?.src
      ? new URL("../../", contentScript.src)
      : new URL("/Kontinente/", window.location.href);
    return new URL(path.replace(/^\.?\//, ""), featureRoot).toString();
  }

  function normalizeWhitespace(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }
})();
