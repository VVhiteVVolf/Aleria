(function () {
  "use strict";

  const root = document.querySelector("[data-haeuser-root]");
  if (!root) return;

  const IMAGE_REFRESH_DELAYS = Object.freeze([0, 120, 350, 900, 1800, 3500]);
  let currentHouseData = null;
  let imageRefreshToken = 0;

  initStaticPage();
  window.addEventListener("aleria:haeuser:data-ready", (event) => {
    renderHouseData(event.detail?.data || null);
  });
  window.addEventListener("aleria-inline-images-rendered", () => {
    if (currentHouseData) renderImages(currentHouseData.images || {});
  });
  if (window.HAEUSER_DATA) {
    renderHouseData(window.HAEUSER_DATA);
  }

  function initStaticPage() {
    initHeadingAnchors();
    initBackTopButton();
  }

  function renderHouseData(data) {
    if (!data) return;

    currentHouseData = data;
    document.title = data.meta?.title || `${data.name || "Haus"} - Aleria`;
    setText("[data-haeuser-title]", data.name);
    setText("[data-haeuser-type]", data.classification?.houseType || data.meta?.type);

    renderProfile(data.profile || {});
    renderSections(data.sections || {});
    renderFigures(data.figures || null);
    renderImages(data.images || {});
    scheduleImageRefresh(data.images || {});
    renderContentTargets(data.contentTargets || {});
    renderFamilyTreeEmbed(data.familyTreeEmbed || null);
    renderTrivia(data.trivia || []);
  }

  function renderProfile(profile) {
    Object.entries(profile).forEach(([key, value]) => {
      setText(`[data-profile-field="${escapeSelector(key)}"]`, value);
    });
  }

  function renderSections(sections) {
    Object.entries(sections).forEach(([key, value]) => {
      setText(`[data-section="${escapeSelector(key)}"]`, value);
    });
  }

  function renderImages(images) {
    Object.entries(images).forEach(([key, image]) => {
      const slot = root.querySelector(`[data-orte-image-key="${escapeSelector(key)}"]`);
      if (!slot || !image?.src) return;

      slot.dataset.orteTemplateImageSrc = image.src;
      slot.dataset.orteTemplateImageHref = image.href || "";
      slot.dataset.orteTemplateImageAlt = image.alt || slot.dataset.orteImageLabel || key;
      slot.dataset.orteImageFit = image.fit || slot.dataset.orteImageFit || "contain";
      if (image.format) slot.dataset.orteImageFormat = image.format;
      if (image.width) slot.dataset.orteImageWidth = String(image.width);
      if (image.maxHeight) slot.dataset.orteImageMaxHeight = String(image.maxHeight);

      const existingImage = slot.querySelector("img");
      const hasPlaceholder = !!slot.querySelector(".orte-image-placeholder, .orte-image-placeholder-media");
      const hasLoadError = slot.classList.contains("has-image-load-error");
      const renderedSource = slot.dataset.orteRenderedImageSrc || existingImage?.getAttribute("src") || "";

      if (!existingImage || hasPlaceholder || hasLoadError || !renderedSource) {
        slot.classList.add("has-image");
        slot.classList.remove("has-portrait-placeholder", "has-image-load-error");
        slot.dataset.orteRenderedImageSrc = image.src;
        slot.dataset.orteRenderedImageHref = image.href || "";
        slot.dataset.orteRenderedImageAlt = image.alt || slot.dataset.orteImageLabel || key;
        slot.innerHTML = renderImageMarkup({
          src: image.src,
          href: image.href || "",
          alt: image.alt || slot.dataset.orteImageLabel || key,
        });
      }
    });
  }

  function scheduleImageRefresh(images) {
    if (!Object.keys(images).length) return;
    imageRefreshToken += 1;
    const token = imageRefreshToken;

    IMAGE_REFRESH_DELAYS.forEach((delay) => {
      window.setTimeout(() => {
        if (token !== imageRefreshToken || currentHouseData?.images !== images) return;
        renderImages(images);
      }, delay);
    });
  }

  function renderContentTargets(targets) {
    Object.entries(targets).forEach(([key, value]) => {
      setText(`[data-haeuser-content="${escapeSelector(key)}"]`, value);
    });
  }

  function renderFigures(figures) {
    const entries = Array.isArray(figures?.entries) ? figures.entries : [];
    const target = root.querySelector("[data-haeuser-figures-table-body]");
    if (!target || !entries.length) return;

    setText("[data-haeuser-figures-heading]", figures.heading || "12. Historische Figuren");

    const rows = [];
    let currentGroup = null;

    rows.push(`
      <tr><th class="haeuser-table-title" colspan="4" data-haeuser-figures-title>${escapeHtml(figures.tableTitle || "Historische Personen und Figuren des Hauses")}</th></tr>
      <tr><td class="haeuser-table-empty-row" colspan="4">&nbsp;</td></tr>
      <tr class="sub-header haeuser-history-header">
        <td class="haeuser-history-heading-name">Name &amp; Titel</td>
        <td class="haeuser-history-heading-desc" colspan="3">Beschreibung</td>
      </tr>
      <tr><td class="haeuser-table-empty-row" colspan="4">&nbsp;</td></tr>
    `);

    entries.forEach((entry, index) => {
      const group = entry.group || "Weitere Figuren";
      if (group !== currentGroup) {
        rows.push(`<tr><td class="haeuser-history-divider" colspan="4"><b>${escapeHtml(group)}</b></td></tr>`);
        rows.push('<tr><td class="haeuser-table-empty-row" colspan="4">&nbsp;</td></tr>');
        currentGroup = group;
      }

      const imageKey = entry.imageKey || `historische-figur-portrait-${String(index + 1).padStart(4, "0")}`;
      rows.push(`
        <tr>
          <td class="portrait-cell haeuser-history-role"><b data-orte-explicit-inline>${escapeHtml(entry.role || "Figur des Hauses")}</b></td>
          <td class="desc-cell pt-s-0077 haeuser-history-desc" colspan="3" rowspan="3" data-orte-explicit-inline>${escapeHtml(entry.description || "")}</td>
        </tr>
        <tr>
          <td class="portrait-cell haeuser-history-portrait">
            <span class="orte-image-slot haeuser-history-portrait-slot" data-orte-image-key="${escapeAttr(imageKey)}" data-orte-image-label="Portrait ${escapeAttr(entry.name || "historische Figur")}" data-orte-image-format="portrait" data-orte-image-max-height="260" aria-label="Portrait ${escapeAttr(entry.name || "historische Figur")}"></span>
          </td>
        </tr>
        <tr><td class="portrait-cell haeuser-history-name"><b data-orte-explicit-inline>${escapeHtml(entry.name || "Unbekannt")}</b></td></tr>
        <tr><td class="haeuser-table-empty-row" colspan="4">&nbsp;</td></tr>
      `);
    });

    target.innerHTML = rows.join("");
  }

  function renderFamilyTreeEmbed(embed) {
    const target = root.querySelector("[data-haeuser-family-tree-embed]");
    if (!target || !embed?.src) return;

    const title = embed.title || "Interaktiver Stammbaum";
    target.hidden = false;
    target.innerHTML = `
      <iframe
        class="haeuser-family-tree-frame"
        src="${escapeAttr(embed.src)}"
        title="${escapeAttr(title)}"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"></iframe>
      <p class="haeuser-family-tree-link">
        <a href="${escapeAttr(embed.src)}" target="_blank" rel="noopener">${escapeHtml(title)} öffnen</a>
      </p>
    `;
  }

  function renderTrivia(items) {
    const target = root.querySelector("[data-haeuser-trivia]");
    if (!target || !items.length) return;
    target.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  function initHeadingAnchors() {
    const usedIds = new Set();
    root.querySelectorAll("h2").forEach((heading) => {
      if (heading.id) {
        usedIds.add(heading.id);
        return;
      }

      heading.id = uniqueId(slugify(heading.textContent), usedIds);
    });
  }

  function initBackTopButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "haeuser-back-top";
    button.setAttribute("aria-label", "Zum Seitenanfang");
    button.dataset.action = "haeuser-back-top";
    button.textContent = "^";
    document.body.appendChild(button);

    document.addEventListener("click", (event) => {
      if (!event.target.closest('[data-action="haeuser-back-top"]')) return;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const toggleButton = () => {
      button.classList.toggle("is-visible", window.scrollY > 500);
    };

    window.addEventListener("scroll", toggleButton, { passive: true });
    toggleButton();
  }

  function setText(selector, value) {
    if (value == null) return;
    root.querySelectorAll(selector).forEach((target) => {
      target.textContent = String(value);
    });
  }

  function renderImageMarkup(image) {
    const imageHtml = `<img src="${escapeAttr(image.src)}" alt="${escapeAttr(image.alt)}" loading="eager" decoding="async" fetchpriority="high">`;
    return image.href
      ? `<a href="${escapeAttr(image.href)}" target="_blank" rel="noopener">${imageHtml}</a>`
      : imageHtml;
  }

  function uniqueId(base, usedIds) {
    const fallback = base || "abschnitt";
    let id = fallback;
    let index = 2;

    while (usedIds.has(id) || document.getElementById(id)) {
      id = `${fallback}-${index}`;
      index += 1;
    }

    usedIds.add(id);
    return id;
  }

  function slugify(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&[a-z0-9#]+;/gi, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function escapeSelector(value) {
    if (window.CSS?.escape) return CSS.escape(String(value));
    return String(value).replace(/"/g, '\\"');
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
