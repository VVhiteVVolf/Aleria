(function () {
  "use strict";

  const root = document.querySelector("[data-orte-root]");
  const data = window.ORT_DATA || {};
  const placeholderImage = "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png";

  if (!root) return;

  renderPage();
  wireEvents();
  updateActiveTab();

  function renderPage() {
    const sections = Array.isArray(data.sections) ? data.sections : [];
    const firstSection = sections[0];
    const remainingSections = sections.slice(1);
    root.innerHTML = `
      <main class="place-document">
        <table class="place-frame">
          <thead>
            <tr>
              <th colspan="2" class="place-title-cell">
                <p class="place-title">${escapeHtml(data.name || "Neue Großstadt")}</p>
                <div class="place-title-image">
                  ${renderImage(data.images?.crest, "Wappen oder Banner", "place-crest")}
                </div>
                <p class="place-title-quote">"${escapeHtml(data.quote?.text || "....")}"</p>
                <p class="place-title-source">- ${escapeHtml(data.quote?.source || "??")}</p>
              </th>
            </tr>
            <tr>
              <td colspan="2" class="place-tabs-cell">
                <nav class="place-tabs" aria-label="Ortsbereiche" data-role="section-tabs">
                  ${sections.map(renderTab).join("")}
                </nav>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="place-main-cell">
                ${firstSection ? renderSection(firstSection, 0) : ""}
              </td>
              <td class="place-side-cell place-map-cell">
                <div class="place-map-box">
                  ${renderImage(data.images?.map, "Karte", "place-map")}
                </div>
              </td>
            </tr>
            <tr>
              <td class="place-main-cell" rowspan="2">
                ${remainingSections.map((section, index) => renderSection(section, index + 1)).join("")}
              </td>
              <td class="place-side-cell">
                ${renderInfobox()}
              </td>
            </tr>
            <tr>
              <td class="place-side-cell">
                ${renderNoticeBoard()}
              </td>
            </tr>
          </tbody>
        </table>
      </main>

      <button type="button" class="place-back-top" data-action="back-top" aria-label="Zum Seitenanfang">↑</button>
    `;
  }

  function renderHierarchy(items) {
    const parts = Array.isArray(items) ? items : [];
    return parts.map((item) => `
      <span>
        <strong>${escapeHtml(item.type || item.typ || "Ebene")}</strong>
        ${escapeHtml(item.name || "-")}
      </span>
    `).join("");
  }

  function renderTab(section) {
    return `
      <a href="#${escapeAttr(section.id)}" data-action="section-tab" data-target="${escapeAttr(section.id)}">
        ${escapeHtml(section.shortTitle || section.title)}
      </a>
    `;
  }

  function renderInfobox() {
    const groups = Array.isArray(data.infobox) ? data.infobox : [];
    return `
      <section class="place-infobox">
        <header>
          ${renderImage(data.images?.crest, "Wappen oder Banner", "place-crest")}
          <h2>${escapeHtml(data.name || "Name der Region")}</h2>
        </header>
        ${renderImage(data.images?.map, "Karte", "place-map")}
        ${groups.map(renderFactGroup).join("")}
      </section>
    `;
  }

  function renderFactGroup(group) {
    const rows = Array.isArray(group.rows) ? group.rows : [];
    return `
      <section class="place-fact-group">
        <h3>${escapeHtml(group.title || "Daten")}</h3>
        <table>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <th>${escapeHtml(row[0] || "-")}</th>
                <td>${escapeHtml(row[1] || "-")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </section>
    `;
  }

  function renderNoticeBoard() {
    const board = data.noticeBoard || {};
    return `
      <section class="place-card place-notice-board">
        <h2>${escapeHtml(board.title || "Anzeigetafeln")}</h2>
        ${renderImage(board.image, "Anzeigetafel", "place-notice-image")}
        ${board.href ? `<a class="place-link-button" href="${escapeAttr(board.href)}">${escapeHtml(board.label || "Zur Anzeigetafel")}</a>` : ""}
      </section>
    `;
  }

  function renderSection(section, index) {
    return `
      <section class="place-section" id="${escapeAttr(section.id)}" data-section-id="${escapeAttr(section.id)}">
        <header class="place-section-head">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <h2>${escapeHtml(section.title)}</h2>
        </header>
        ${renderText(section.text)}
        ${renderSubsections(section.subsections)}
        ${renderDetails(section.details)}
        ${renderLinkGroups(section.linkGroups)}
        ${renderCardGrid(section.cards)}
        ${renderPeopleGroups(section.peopleGroups)}
        ${renderList(section.list)}
      </section>
    `;
  }

  function renderSubsections(subsections) {
    if (!Array.isArray(subsections) || !subsections.length) return "";
    return subsections.map((subsection) => `
      <section class="place-subsection">
        <h3>${escapeHtml(subsection.title)}</h3>
        ${renderText(subsection.text)}
        ${renderDetails(subsection.details)}
        ${renderLinkGroups(subsection.linkGroups)}
        ${renderCardGrid(subsection.cards)}
      </section>
    `).join("");
  }

  function renderDetails(details) {
    if (!Array.isArray(details) || !details.length) return "";
    return details.map((detail) => `
      <details class="place-detail">
        <summary>${escapeHtml(detail.title || "Notiz")}</summary>
        <div>
          ${renderText(detail.text)}
        </div>
      </details>
    `).join("");
  }

  function renderLinkGroups(groups) {
    if (!Array.isArray(groups) || !groups.length) return "";
    return groups.map((group) => `
      <section class="place-link-group">
        <h3>${escapeHtml(group.title || "Gruppe")}</h3>
        <div class="place-symbol-grid">
          ${(group.items || []).map(renderSymbolItem).join("")}
        </div>
      </section>
    `).join("");
  }

  function renderSymbolItem(item) {
    const body = `
      ${renderImage(item.image, item.name || "Symbol", "place-symbol")}
      <strong>${escapeHtml(item.name || "Name")}</strong>
      <span>${escapeHtml(item.note || item.type || "")}</span>
    `;
    if (item.href) {
      return `<a class="place-symbol-card" href="${escapeAttr(item.href)}">${body}</a>`;
    }
    return `<article class="place-symbol-card">${body}</article>`;
  }

  function renderCardGrid(cards) {
    if (!Array.isArray(cards) || !cards.length) return "";
    return `
      <div class="place-card-grid">
        ${cards.map((card) => `
          <article class="place-card">
            ${renderImage(card.image, card.title || "Bild", "place-card-image")}
            <h3>${escapeHtml(card.title || "Titel")}</h3>
            ${renderText(card.text)}
          </article>
        `).join("")}
      </div>
    `;
  }

  function renderPeopleGroups(groups) {
    if (!Array.isArray(groups) || !groups.length) return "";
    return groups.map((group) => `
      <section class="place-people-group">
        <h3>${escapeHtml(group.title || "Personen")}</h3>
        ${(group.items || []).map(renderPerson).join("")}
      </section>
    `).join("");
  }

  function renderPerson(person) {
    return `
      <article class="place-person">
        <div class="place-person-side">
          <p>${escapeHtml(person.role || "Rolle")}</p>
          ${renderImage(person.image, person.name || "Person", "place-person-image")}
          <strong>${escapeHtml(person.name || "Name")}</strong>
        </div>
        <div class="place-person-body">
          ${renderText(person.text || "......")}
        </div>
      </article>
    `;
  }

  function renderList(list) {
    if (!Array.isArray(list) || !list.length) return "";
    return `
      <ul class="place-list">
        ${list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    `;
  }

  function renderText(value) {
    if (!value) return "";
    const paragraphs = Array.isArray(value) ? value : [value];
    return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
  }

  function renderImage(image, fallbackAlt, className) {
    const source = typeof image === "string" ? { src: image } : image || {};
    const src = source.src || placeholderImage;
    const alt = source.alt || fallbackAlt || "";
    return `<img class="${escapeAttr(className)}" src="${escapeAttr(src)}" alt="${escapeAttr(alt)}">`;
  }

  function wireEvents() {
    root.addEventListener("click", (event) => {
      const actionTarget = event.target.closest("[data-action]");
      if (!actionTarget) return;

      if (actionTarget.dataset.action === "section-tab") {
        event.preventDefault();
        scrollToSection(actionTarget.dataset.target);
      }

      if (actionTarget.dataset.action === "back-top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    window.addEventListener("scroll", throttle(updateActiveTab, 120), { passive: true });
  }

  function scrollToSection(id) {
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    target.scrollIntoView({ block: "start", behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  }

  function updateActiveTab() {
    const sections = Array.from(root.querySelectorAll("[data-section-id]"));
    const tabs = Array.from(root.querySelectorAll("[data-action='section-tab']"));
    const backTop = root.querySelector("[data-action='back-top']");
    const current = sections
      .filter((section) => section.getBoundingClientRect().top < 180)
      .at(-1) || sections[0];

    tabs.forEach((tab) => {
      tab.classList.toggle("is-active", current && tab.dataset.target === current.id);
    });

    if (backTop) {
      backTop.classList.toggle("is-visible", window.scrollY > 500);
    }
  }

  function throttle(fn, delay) {
    let timer = 0;
    return () => {
      if (timer) return;
      timer = window.setTimeout(() => {
        timer = 0;
        fn();
      }, delay);
    };
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
