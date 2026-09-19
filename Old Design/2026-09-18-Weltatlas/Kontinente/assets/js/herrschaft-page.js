(async function () {
  "use strict";

  const page = document.querySelector("[data-herrschaft-page]");
  if (!page) return;
  const directoryUrl = new URL('../../modules/territory-directory/settlement-directory.mjs?v=panels-20260911a', document.currentScript.src);
  const { renderSettlementDomain } = await import(directoryUrl);
  const { renderCouncilGroups } = await import(new URL('council-directory.mjs?v=panels-20260911a', directoryUrl));

  renderPageModules();
  window.addEventListener("aleria:kontinente:data-ready", renderPageModules);

  function renderPageModules() {
    const view = window.KONTINENTE_DATA?.view;
    if (!view) return;

    renderDataDrivenShell(page, view);
    renderInfoboxHouses(
      page.querySelector("[data-herrschaft-infobox-houses]"),
      view.familySections,
      view.familyTreePage
    );
    renderPersonGroups(page.querySelector("[data-herrschaft-council]"), view.councilGroups, view.familyTreePage);
    renderPersonGroups(page.querySelector("[data-herrschaft-vassals]"), view.vassalGroups, view.familyTreePage);
    renderAdministration(
      page.querySelector("[data-herrschaft-administration]"),
      view.administration,
      window.KONTINENTE_DATA?.meta?.id || view.article?.id || "unbekannte-herrschaft"
    );
    renderGeography(page.querySelector("[data-herrschaft-geography]"), view.geography);
    // Notify the shared table adapter after an asynchronously loaded shell exists.
    window.dispatchEvent(new CustomEvent("aleria:kontinente:content-ready"));
  }

  function renderDataDrivenShell(root, view) {
    const article = view.article;
    if (!root.matches("[data-herrschaft-shell]") || !article) return;
    if (root.dataset.herrschaftShellId === article.id) return;

    const frame = createElement("table", "kingdom-frame");
    frame.setAttribute("border", "0");
    frame.setAttribute("cellspacing", "5");

    const caption = createElement("caption", "kingdom-title", article.title || "Herrschaft");
    const body = document.createElement("tbody");
    body.append(
      renderArticleHeader(article),
      renderArticleIntroduction(article),
      renderArticleBody(article)
    );
    frame.append(caption, body);
    root.replaceChildren(frame);
    root.dataset.herrschaftShellId = article.id;
    document.title = article.browserTitle || `${article.title || "Herrschaft"} - Aleria`;
  }

  function renderArticleHeader(article) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;

    const breadcrumbs = createElement("nav", "herrschaft-breadcrumbs");
    breadcrumbs.setAttribute("aria-label", "Brotkrumen-Navigation");
    const parentLink = createElement("a", "", article.parentLabel || "Celtigerns Wacht");
    parentLink.href = article.parentHref || "../Grafschaft%20Celtigerns%20Wacht.html";
    breadcrumbs.append(
      parentLink,
      createElement("span", "", "›"),
      createElement("span", "", article.shortTitle || article.title || "Herrschaft")
    );

    const crestStage = createElement("div", "kingdom-crest-stage herrschaft-crest-stage");
    const crest = createImage(article.crestSrc, article.crestAlt || `Banner ${article.title || "der Herrschaft"}`);
    crest.className = "kingdom-main-crest";
    crest.loading = "eager";
    crestStage.append(crest);

    const kicker = createElement("p", "herrschaft-kicker", article.kicker || "");
    cell.append(breadcrumbs, crestStage, kicker);
    row.append(cell);
    return row;
  }

  function renderArticleIntroduction(article) {
    const row = document.createElement("tr");
    row.className = "herrschaft-intro-row";

    const content = document.createElement("td");
    content.className = "kingdom-content-column";
    content.colSpan = 3;
    content.append(
      renderTableOfContents(),
      renderCopySection("uebersicht", "1.) Übersicht", article.copy?.overview),
      renderCopySection("geschichte", "2.) Geschichte", article.copy?.history)
    );

    const sidebar = document.createElement("td");
    sidebar.className = "kingdom-sidebar-column";
    sidebar.colSpan = 2;
    sidebar.append(renderInfobox(article));
    row.append(content, sidebar);
    return row;
  }

  function renderArticleBody(article) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;

    cell.append(renderCopySection("kultur", "3.) Kultur", article.copy?.culture));

    const politics = createElement("section", "");
    politics.setAttribute("aria-labelledby", "politik");
    politics.append(
      renderSectionHeading("politik", "4.) Politik"),
      createModuleRoot("herrschaft-person-root", "data-herrschaft-council", "Der Rat des Ritterfürsten wird geladen."),
      createElement("h3", "herrschaft-subheading", "Vasallen und Amtsträger"),
      createModuleRoot("herrschaft-person-root", "data-herrschaft-vassals", "Die Vasallenübersicht wird geladen.")
    );
    cell.append(politics);

    const administration = createElement("section", "herrschaft-copy");
    administration.setAttribute("aria-labelledby", "verwaltung");
    administration.append(
      renderSectionHeading("verwaltung", "5.) Verwaltung"),
      createElement("h3", "herrschaft-subheading", "5.a) Verwaltungsstruktur"),
      createModuleRoot("herrschaft-administration-grid", "data-herrschaft-administration", "Die Verwaltungsbereiche werden geladen."),
      createElement("h3", "herrschaft-subheading", "5.b) Wirtschaft")
    );
    appendParagraphs(administration, article.copy?.economy);
    administration.append(createElement("h3", "herrschaft-subheading", "5.c) Verteidigung"));
    appendParagraphs(administration, article.copy?.defense);
    cell.append(administration);

    const families = createElement("section", "");
    families.setAttribute("aria-labelledby", "familien");
    families.append(renderSectionHeading("familien", "6.) Familien"));
    const familyTable = createElement("table", "kingdom-county-family-table");
    familyTable.setAttribute("aria-label", `Familien ${article.title || "der Herrschaft"}`);
    const familyBody = document.createElement("tbody");
    const familyRow = document.createElement("tr");
    const familyCell = createElement("td");
    familyCell.colSpan = 5;
    familyRow.append(familyCell);
    familyBody.append(familyRow);
    familyTable.append(familyBody);
    families.append(familyTable);
    if (article.familyNote) families.append(createElement("p", "herrschaft-source-note", article.familyNote));
    cell.append(families);

    const geography = renderCopySection("geographie", "7.) Geographie", article.copy?.geography);
    geography.append(createModuleRoot("kingdom-county-card-view", "data-herrschaft-geography", "Die Ortsübersicht wird geladen."));
    cell.append(geography);
    cell.append(renderCopySection("flora-fauna", "8.) Flora & Fauna", article.copy?.flora, "..."));
    cell.append(renderCopySection("trivia", "9.) Trivia", article.copy?.trivia, "..."));

    row.append(cell);
    return row;
  }

  function renderTableOfContents() {
    const table = createElement("table", "kingdom-toc");
    table.setAttribute("border", "2");
    table.setAttribute("cellspacing", "5");
    const body = document.createElement("tbody");
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.append(createElement("p", "kingdom-toc-title", "Inhalt"));
    const list = document.createElement("ol");
    [
      ["uebersicht", "Übersicht"], ["geschichte", "Geschichte"], ["kultur", "Kultur"],
      ["politik", "Politik"], ["verwaltung", "Verwaltung"], ["familien", "Familien"],
      ["geographie", "Geographie"], ["flora-fauna", "Flora & Fauna"], ["trivia", "Trivia"],
    ].forEach(([id, label]) => {
      const item = document.createElement("li");
      const link = createElement("a", "", label);
      link.href = `#${id}`;
      item.append(link);
      list.append(item);
    });
    cell.append(list);
    row.append(cell);
    body.append(row);
    table.append(body);
    return table;
  }

  function renderInfobox(article) {
    const table = createElement("table", "kingdom-infobox");
    table.setAttribute("border", "1");
    table.setAttribute("cellspacing", "1");
    const body = document.createElement("tbody");
    body.append(renderInfoboxHeading(article.shortTitle || article.title || "Herrschaft", "kingdom-infobox-title"));

    if (article.map?.imageSrc) {
      const row = document.createElement("tr");
      const cell = createElement("td", "kingdom-infobox-map");
      cell.colSpan = 2;
      const image = createImage(article.map.imageSrc, article.map.imageAlt || "Karte der Herrschaft");
      if (article.map.href) {
        const link = document.createElement("a");
        link.href = article.map.href;
        link.append(image);
        cell.append(link);
      } else {
        cell.append(image);
      }
      row.append(cell);
      body.append(row);
    }

    (article.infobox || []).forEach((group) => {
      body.append(renderInfoboxHeading(group.title || "Allgemein", "kingdom-infobox-section"));
      (group.rows || []).forEach((entry) => {
        const row = document.createElement("tr");
        const label = createElement("td", "kingdom-infobox-label", entry.label || "");
        const value = createElement("td", "kingdom-infobox-value");
        const bold = document.createElement("b");
        bold.textContent = label.textContent;
        label.replaceChildren(bold);
        if (entry.href) {
          const link = createElement("a", "", entry.value || "...");
          link.href = entry.href;
          value.append(link);
        } else {
          value.textContent = entry.value || "...";
        }
        row.append(label, value);
        body.append(row);
      });
    });
    table.append(body);
    return table;
  }

  function renderInfoboxHeading(text, className) {
    const row = document.createElement("tr");
    const cell = createElement("td", className, text);
    cell.colSpan = 2;
    const bold = document.createElement("b");
    bold.textContent = cell.textContent;
    cell.replaceChildren(bold);
    row.append(cell);
    return row;
  }

  function renderInfoboxHouses(root, sections, familyTreePage) {
    if (!root || !Array.isArray(sections)) return;
    const fragment = document.createDocumentFragment();

    sections.forEach((section) => {
      const houses = Array.isArray(section?.cards) ? section.cards : [];
      if (!houses.length) return;

      const group = createElement("span", "herrschaft-infobox-house-group");
      group.append(createElement("strong", "herrschaft-infobox-house-title", section.title || "Häuser"));

      const list = createElement("span", "herrschaft-infobox-house-list");
      houses.forEach((house, index) => {
        if (index) list.append(document.createTextNode(", "));
        const name = createElement("span", "", house.name || "...");
        if (house.href) {
          const link = document.createElement("a");
          link.href = house.href;
          link.append(name);
          list.append(link);
        } else {
          list.append(wrapFamilyLink(name, house.id, familyTreePage));
        }
      });
      group.append(list);
      fragment.append(group);
    });

    if (fragment.childNodes.length) root.replaceChildren(fragment);
  }

  function renderCopySection(id, title, paragraphs, emptyText = "") {
    const section = createElement("section", "herrschaft-copy");
    section.setAttribute("aria-labelledby", id);
    section.append(renderSectionHeading(id, title));
    appendParagraphs(section, paragraphs, emptyText);
    return section;
  }

  function renderSectionHeading(id, text) {
    const heading = createElement("h2", "kingdom-section-heading", text);
    heading.id = id;
    return heading;
  }

  function appendParagraphs(root, paragraphs, emptyText = "") {
    if (Array.isArray(paragraphs) && paragraphs.length) {
      paragraphs.forEach((paragraph) => root.append(createElement("p", "", paragraph)));
      return;
    }
    if (emptyText) root.append(createElement("p", "herrschaft-empty-copy", emptyText));
  }

  function createModuleRoot(className, attribute, loadingText) {
    const root = createElement("div", className);
    root.setAttribute(attribute, "");
    root.append(createElement("p", "herrschaft-empty-copy", loadingText));
    return root;
  }

  function renderPersonGroups(root, groups, familyTreePage) {
    if (!root || !Array.isArray(groups)) return;
    const normalized = groups.map(group => ({
      ...group,
      members: (group.members || []).map(person => ({
        ...person,
        image: person.imageSrc ? createImage(person.imageSrc, person.imageAlt) : null,
        href: person.familyId && familyTreePage
          ? `${familyTreePage}?family=${encodeURIComponent(person.familyId)}&mode=view`
          : '',
      })),
    }));
    root.replaceChildren(renderCouncilGroups(normalized));
  }

  function renderAdministration(root, entries, scopeId) {
    if (!root || !Array.isArray(entries)) return;
    root.setAttribute('role', 'group');
    root.setAttribute('aria-label', 'Verwaltungsbereiche');
    root.dataset.administrationScope = scopeId;
    const fragment = document.createDocumentFragment();
    const administrationKeys = {
      "Militär": "militaer",
      "Klerus": "klerus",
      "Gerichtsbarkeit": "gerichtsbarkeit",
      "Finanzen": "finanzen",
      "Spionage": "spionage",
      "Diplomatie": "diplomatie",
      "Magie": "magie",
      "Unterhaltung": "unterhaltung",
    };

    entries.forEach((entry) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "herrschaft-administration-card";
      card.dataset.administrationKey = entry.key || administrationKeys[entry.name] || "";
      card.dataset.administrationScope = scopeId;
      card.dataset.action = "open-administration";
      card.setAttribute("aria-haspopup", "dialog");
      const area = window.ALERIA_ADMINISTRATION_CONTENT?.areas.find(area => area.id === card.dataset.administrationKey);
      const imageSrc = area?.imageSrc || entry.imageSrc;
      if (imageSrc) card.append(createImage(imageSrc, ''));

      const name = document.createElement("strong");
      name.textContent = entry.name || "Verwaltungsbereich";
      card.append(name);

      const hint = document.createElement("span");
      hint.textContent = "Struktur ansehen";
      card.append(hint);
      fragment.append(card);
    });

    root.replaceChildren(fragment);
    document.dispatchEvent(new CustomEvent("aleria:administration-rendered"));
  }

  function renderGeography(root, geography) {
    if (!root || !geography?.domain) return;
    const fragment = document.createDocumentFragment();

    if (geography.map?.imageSrc) fragment.append(renderMapPanel(geography.map));
    fragment.append(renderDomain(geography.domain));
    root.replaceChildren(fragment);
  }

  function renderMapPanel(map) {
    const panel = document.createElement("section");
    panel.className = "kingdom-county-map-panel";

    const heading = document.createElement("h3");
    heading.textContent = map.title || "Karte der Herrschaft";
    panel.append(heading);

    const image = createImage(map.imageSrc, map.imageAlt || heading.textContent);
    if (map.href) {
      const link = document.createElement("a");
      link.href = map.href;
      link.append(image);
      panel.append(link);
    } else {
      panel.append(image);
    }

    return panel;
  }

  function renderDomain(domain) {
    return renderSettlementDomain({
      title: domain.title,
      href: domain.href || '',
      crest: domain.crestSrc ? createImage(domain.crestSrc, domain.crestAlt || 'Banner der Herrschaft') : null,
      center: domain.center,
      centerHref: getPlaceHref(domain.center),
      places: (domain.sections || []).flatMap((section) => [
        { kind: 'separator', title: section.title || 'Orte' },
        ...(section.places || []).map((place) => ({
          ...place,
          image: place.iconSrc ? createImage(place.iconSrc, place.iconAlt || `${place.type || 'Ort'}: ${place.name || ''}`) : null,
        })),
      ]),
    });
  }

  function getPlaceHref(name) {
    return window.ALERIA_CELTIGERNS_PLACES?.hrefFor(name) || "";
  }

  function wrapFamilyLink(content, familyId, familyTreePage) {
    if (!familyId || !familyTreePage) return content;
    const link = document.createElement("a");
    link.className = "herrschaft-family-link";
    link.href = `${familyTreePage}?family=${encodeURIComponent(familyId)}&mode=view`;
    link.append(content);
    return link;
  }

  function createElement(tagName, className = "", text = "") {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function createImage(src, alt) {
    const image = document.createElement("img");
    image.src = src;
    image.alt = alt || "";
    image.loading = "lazy";
    image.decoding = "async";
    return image;
  }


})();
