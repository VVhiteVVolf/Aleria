(function () {
  "use strict";

  const page = document.querySelector("[data-orte-static-template]");
  if (!page) return;

  document.addEventListener("aleria:orte:data-ready", (event) => {
    renderPlaceContent(event.detail?.data || window.ORT_DATA);
  });

  if (window.ORT_DATA) {
    renderPlaceContent(window.ORT_DATA);
  }

  function renderPlaceContent(data) {
    const sections = data?.sections || {};

    page.querySelectorAll("[data-orte-content]").forEach((container) => {
      renderSection(container, sections[container.dataset.orteContent]);
    });

    configurePersonalities(data?.features || {});
  }

  function renderSection(container, blocks) {
    if (!Array.isArray(blocks) || blocks.length === 0) return;

    const fragment = document.createDocumentFragment();
    blocks.forEach((block) => {
      const element = createBlock(block);
      if (element) fragment.append(element);
    });

    container.replaceChildren(fragment);
    container.classList.add("orte-place-prose");
  }

  function createBlock(block) {
    if (typeof block === "string") return createParagraph(block);
    if (!block || typeof block !== "object") return null;

    if (block.type === "subheading") {
      const heading = document.createElement("h3");
      heading.className = "orte-place-prose__subheading";
      heading.textContent = String(block.text || "");
      return heading;
    }

    if (block.type === "list" && Array.isArray(block.items)) {
      const list = document.createElement("ul");
      list.className = "orte-place-prose__list";
      block.items.forEach((item) => {
        const entry = document.createElement("li");
        entry.textContent = String(item || "");
        list.append(entry);
      });
      return list;
    }

    return createParagraph(block.text);
  }

  function createParagraph(text) {
    const paragraph = document.createElement("p");
    paragraph.textContent = String(text || "");
    return paragraph;
  }

  function configurePersonalities(features) {
    const headingRow = page.querySelector("[data-orte-personalities-heading]");
    const contentRow = page.querySelector("[data-orte-personalities-content]");
    if (!headingRow || !contentRow) return;

    let button = headingRow.querySelector('[data-action="toggle-place-personalities"]');
    const shouldCollapse = features.personalitiesCollapsed === true;

    if (!shouldCollapse) {
      contentRow.hidden = false;
      button?.remove();
      return;
    }

    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "orte-personalities-toggle";
      button.dataset.action = "toggle-place-personalities";
      headingRow.cells[0]?.append(button);

      button.addEventListener("click", () => {
        setPersonalitiesExpanded(button, contentRow, contentRow.hidden);
      });
    }

    setPersonalitiesExpanded(button, contentRow, false);
  }

  function setPersonalitiesExpanded(button, contentRow, expanded) {
    contentRow.hidden = !expanded;
    button.setAttribute("aria-expanded", String(expanded));
    button.textContent = expanded ? "Persönlichkeiten einklappen" : "Persönlichkeiten anzeigen";
  }
})();
