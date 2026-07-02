(function () {
  "use strict";

  const root = document.querySelector("[data-gruppen-root]");
  if (!root) return;

  initStaticPage();
  window.addEventListener("aleria:gruppen:data-ready", (event) => {
    renderGroupData(event.detail?.data || null);
  });
  if (window.GRUPPEN_DATA) {
    renderGroupData(window.GRUPPEN_DATA);
  }

  function initStaticPage() {
    initHeadingAnchors();
    initBackTopButton();
  }

  function renderGroupData(data) {
    if (!data) return;

    document.title = data.meta?.title || `${data.name || "Gruppe"} - Aleria`;
    setText("[data-gruppen-title]", data.name);
    setText("[data-gruppen-canonical-path]", data.canonicalPath);
    setText("[data-gruppen-type]", data.classification?.groupType || data.meta?.type);

    renderBreadcrumbs(data.hierarchy || []);
    renderProfile(data.profile || {});
    renderSections(data.sections || {});
    renderHierarchyTable(data.hierarchyTable || []);
    renderLeadership(data.leadership || []);
    renderMembers(data.members || []);
    renderTrivia(data.trivia || []);
  }

  function renderBreadcrumbs(items) {
    const target = root.querySelector("[data-gruppen-breadcrumbs]");
    if (!target) return;

    target.innerHTML = "";
    items.forEach((item, index) => {
      const part = document.createElement("span");
      part.textContent = item.name || item.slug || "-";
      target.appendChild(part);

      if (index < items.length - 1) {
        const separator = document.createElement("span");
        separator.className = "gruppen-breadcrumb-separator";
        separator.textContent = ">";
        target.appendChild(separator);
      }
    });
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

  function renderHierarchyTable(rows) {
    const target = root.querySelector("[data-gruppen-hierarchy-rows]");
    if (!target) return;
    target.innerHTML = rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.level)}</td>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.role)}</td>
        <td>${escapeHtml(row.notes)}</td>
      </tr>
    `).join("");
  }

  function renderLeadership(rows) {
    const target = root.querySelector("[data-gruppen-leadership-rows]");
    if (!target) return;
    target.innerHTML = rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.office)}</td>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.rank)}</td>
        <td>${escapeHtml(row.responsibility)}</td>
      </tr>
    `).join("");
  }

  function renderMembers(rows) {
    const target = root.querySelector("[data-gruppen-member-rows]");
    if (!target) return;
    target.innerHTML = rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.role)}</td>
        <td>${escapeHtml(row.rank)}</td>
        <td>${escapeHtml(row.status)}</td>
        <td>${escapeHtml(row.note)}</td>
      </tr>
    `).join("");
  }

  function renderTrivia(items) {
    const target = root.querySelector("[data-gruppen-trivia]");
    if (!target) return;
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
    button.className = "gruppen-back-top";
    button.setAttribute("aria-label", "Zum Seitenanfang");
    button.dataset.action = "gruppen-back-top";
    button.textContent = "^";
    document.body.appendChild(button);

    document.addEventListener("click", (event) => {
      if (!event.target.closest('[data-action="gruppen-back-top"]')) return;
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
