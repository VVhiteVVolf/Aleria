(function () {
  "use strict";

  const page = document.querySelector("[data-orte-static-template]");
  if (!page) return;

  initHeadingAnchors();
  initBackTopButton();

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
})();
