(function () {
  "use strict";

  const root = document.querySelector("[data-haeuser-root]");
  if (!root) return;

  initStaticPage();
  window.addEventListener("aleria:haeuser:data-ready", (event) => {
    renderHouseData(event.detail?.data || null);
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

    document.title = data.meta?.title || `${data.name || "Haus"} - Aleria`;
    setText("[data-haeuser-title]", data.name);
    setText("[data-haeuser-type]", data.classification?.houseType || data.meta?.type);

    renderProfile(data.profile || {});
    renderSections(data.sections || {});
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
})();
