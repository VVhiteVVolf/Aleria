(function () {
  "use strict";

  const page = document.querySelector("[data-orte-static-template]");
  if (!page) return;

  initHeadingAnchors();
  initTextSpacing();
  initTemplateToc();
  initBackTopButton();
  initPlaceDataBinding();

  function initPlaceDataBinding() {
    document.addEventListener("aleria:orte:data-ready", (event) => {
      applyPlaceData(event.detail?.data || window.ORT_DATA);
    });

    if (window.ORT_DATA) {
      applyPlaceData(window.ORT_DATA);
    }
  }

  function applyPlaceData(data) {
    if (!data?.name) return;

    const catalogEntry = window.ALERIA_CELTIGERNS_PLACES?.find(data.meta?.id || data.name);
    const parentage = data.parentage || {};
    const placeType = data.meta?.type || catalogEntry?.placeType || "Ort";
    const parentName = parentage.domain
      || parentage.region
      || parentage.lordship
      || parentage.barony
      || "Celtigerns Wacht";

    page.dataset.orteName = data.name;
    page.dataset.orteType = placeType;

    const primaryTitle = page.querySelector(".grossstadt-template-frame .pt-s-0004");
    if (primaryTitle) primaryTitle.textContent = data.name;

    const infoboxTitle = page.querySelector(".pt-s-0024 .pt-s-0025 b");
    if (infoboxTitle) infoboxTitle.textContent = parentName;

    setStructureValues({
      land: parentage.kingdom || "Cenyr",
      provinz: parentage.county || "Celtigerns Wacht",
      region: parentName,
      name: data.name,
      "vorherrschender adel": parentage.liege || "...",
      region2: placeType,
      herrschaft: parentage.lordship || parentage.domain || parentage.barony || "...",
      lehnsherr: parentage.liege || "...",
    });

    renderContextNavigation(data, catalogEntry);
  }

  function setStructureValues(values) {
    const table = page.querySelector(".pt-s-0024");
    if (!table) return;

    let regionIndex = 0;
    Array.from(table.rows).forEach((row) => {
      if (row.cells.length < 2) return;
      const label = normalizeLabel(row.cells[0].textContent);
      if (!label) return;

      let key = label;
      if (label === "region") {
        regionIndex += 1;
        key = regionIndex > 1 ? "region2" : "region";
      }

      const value = values[key];
      if (!value) return;
      row.cells[1].textContent = value;
    });
  }

  function renderContextNavigation(data, catalogEntry) {
    const documentContainer = page.querySelector(".place-document");
    if (!documentContainer) return;

    const navigation = data.navigation || {};
    const parentHref = navigation.parentHref || catalogEntry?.parentHref || "";
    const parentLabel = navigation.parentLabel || catalogEntry?.domain?.name || "Celtigerns Wacht";
    let nav = documentContainer.querySelector(".place-context-nav");

    if (!nav) {
      nav = document.createElement("nav");
      nav.className = "place-context-nav";
      nav.setAttribute("aria-label", "Brotkrumen-Navigation");
      documentContainer.prepend(nav);
    }

    nav.replaceChildren();
    if (parentHref) {
      const parentLink = document.createElement("a");
      parentLink.href = parentHref;
      parentLink.textContent = parentLabel;
      nav.append(parentLink);
    } else {
      nav.append(document.createTextNode(parentLabel));
    }

    const separator = document.createElement("span");
    separator.setAttribute("aria-hidden", "true");
    separator.textContent = "›";
    const current = document.createElement("span");
    current.setAttribute("aria-current", "page");
    current.textContent = data.name;
    nav.append(separator, current);
  }

  function normalizeLabel(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function initHeadingAnchors() {
    const usedIds = new Set();

    page.querySelectorAll("h2").forEach((heading) => {
      if (!heading.id) {
        heading.id = uniqueId(slugify(heading.textContent), usedIds);
      } else {
        usedIds.add(heading.id);
      }
    });
  }

  function initBackTopButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "place-back-top";
    button.setAttribute("aria-label", "Zum Seitenanfang");
    button.textContent = "↑";
    document.body.appendChild(button);

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const toggleButton = () => {
      button.classList.toggle("is-visible", window.scrollY > 500);
    };

    window.addEventListener("scroll", toggleButton, { passive: true });
    toggleButton();
  }

  function initTextSpacing() {
    page.querySelectorAll("p").forEach((paragraph) => {
      const text = paragraph.textContent.replace(/\u00a0/g, "").trim();
      const hasMedia = paragraph.querySelector("img, table, iframe, video, audio, .orte-image-slot, [data-orte-image-key]");
      if (!text && !hasMedia) {
        paragraph.classList.add("place-spacer");
      }
    });
  }

  function initTemplateToc() {
    const documentContainer = page.querySelector(".place-document");
    const headings = Array.from(page.querySelectorAll(".grossstadt-template-frame h2"));
    if (!documentContainer || !headings.length || page.querySelector(".place-template-toc")) return;

    const nav = document.createElement("nav");
    nav.className = "place-template-toc is-collapsed";
    nav.setAttribute("aria-label", "Inhaltsangabe");
    nav.id = "place-template-toc";
    nav.innerHTML = `
      <h2>Inhalt</h2>
      <ol>
        ${headings.map((heading) => `
          <li><a href="#${escapeAttr(heading.id)}" data-toc-link="${escapeAttr(heading.id)}">${escapeHtml(heading.textContent.trim())}</a></li>
        `).join("")}
      </ol>
    `;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "place-template-toc-toggle";
    toggle.setAttribute("aria-controls", "place-template-toc");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Inhalt";

    document.body.appendChild(toggle);
    document.body.appendChild(nav);

    toggle.addEventListener("click", () => {
      const collapsed = nav.classList.toggle("is-collapsed");
      toggle.setAttribute("aria-expanded", String(!collapsed));
    });

    nav.addEventListener("click", (event) => {
      const link = event.target.closest("[data-toc-link]");
      if (!link) return;
      const target = document.getElementById(link.dataset.tocLink);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ block: "start", behavior: "smooth" });
      history.replaceState(null, "", `#${target.id}`);
      nav.classList.add("is-collapsed");
      toggle.setAttribute("aria-expanded", "false");
    });

    const updateActiveLink = throttle(() => {
      const current = headings.filter((heading) => heading.getBoundingClientRect().top < 140).at(-1) || headings[0];
      nav.querySelectorAll("[data-toc-link]").forEach((link) => {
        link.classList.toggle("is-active", current && link.dataset.tocLink === current.id);
      });
    }, 120);

    window.addEventListener("scroll", updateActiveLink, { passive: true });
    updateActiveLink();
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
