(function () {
  const STORAGE_KEY = "aleria-bestiarium-data";
  const originalData = window.BESTIARIUM_DATA;
  const storedData = loadStoredData();
  const data = migrateData(storedData || structuredCloneSafe(originalData));

  const hero = document.querySelector("#hero");
  const overview = document.querySelector("#uebersicht");
  const footer = document.querySelector("#footer");
  const bestiary = document.querySelector("#bestiary");
  const filters = document.querySelector("#filters");
  const searchInput = document.querySelector("#search");
  const empty = document.querySelector("#empty");
  const toolbar = document.querySelector(".toolbar");

  let activeFilter = "all";
  let editMode = false;
  let editorTab = "seite";
  let selectedSectionId = data.sections[0]?.id || "";
  let selectedEntryIndex = "0";
  let selectedLinkGroup = "themes";
  let selectedLinkIndex = "0";

  function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function migrateData(value) {
    const fallback = structuredCloneSafe(originalData);
    value.site = value.site || fallback.site;
    value.site.overview = value.site.overview || fallback.site.overview;
    value.site.sidebarTitles = value.site.sidebarTitles || fallback.site.sidebarTitles;
    value.links = value.links || fallback.links;
    value.links.themes = value.links.themes || [];
    value.links.other = value.links.other || [];
    value.links.literature = value.links.literature || [];
    value.filters = value.filters || fallback.filters;
    value.sections = value.sections || fallback.sections;
    return value;
  }

  function loadStoredData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("Gespeicherte Bestiarium-Daten konnten nicht geladen werden.", error);
      return null;
    }
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (text !== undefined && text !== null) {
      element.textContent = text;
    }
    return element;
  }

  function normalize(value) {
    return String(value || "").toLocaleLowerCase("de-DE").trim();
  }

  function slugify(value) {
    const slug = normalize(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug || `reiter-${Date.now()}`;
  }

  function ensureUniqueId(baseId) {
    let id = baseId;
    let counter = 2;
    while (data.sections.some((section) => section.id === id)) {
      id = `${baseId}-${counter}`;
      counter += 1;
    }
    return id;
  }

  function getSelectedSection() {
    return data.sections.find((section) => section.id === selectedSectionId) || data.sections[0];
  }

  function getSelectedEntry() {
    return getSelectedSection()?.entries[Number(selectedEntryIndex)];
  }

  function getSelectedLinkList() {
    return data.links[selectedLinkGroup] || [];
  }

  function getSelectedLink() {
    return getSelectedLinkList()[Number(selectedLinkIndex)];
  }

  function renderAll() {
    applySiteAssets();
    renderOverview();
    renderFilters();
    renderBestiary();
    renderToc();
    renderSidebarTitles();
    renderLinks("#themeLinks", data.links.themes, "themes");
    renderLinks("#otherLinks", data.links.other, "other");
    renderLinks("#literatureLinks", data.links.literature, "literature");
    renderFooter();
    renderEditor();
    updateView();
  }

  function applySiteAssets() {
    document.title = data.site.title || "Das Große Bestiarium von Aleria";
    hero.setAttribute("aria-label", data.site.title || "Bestiarium");
    document.documentElement.style.setProperty("--hero-image", `url("${data.site.bannerImage}")`);
    document.documentElement.style.setProperty("--page-bg-image", `url("${data.site.backgroundImage}")`);
  }

  function renderOverview() {
    const head = createElement("div", "section-head");
    const headText = createElement("div");
    headText.append(createElement("h2", "", data.site.overview.title), createElement("p", "", data.site.overview.lead));
    head.append(headText, createElement("span", "count", data.site.overview.count));

    const body = createElement("p", "", data.site.overview.body);
    const quote = createElement("blockquote", "quote", data.site.overview.quote);

    overview.replaceChildren(head, body, quote);
    if (editMode) {
      overview.append(makeInlineTools([
        ["Übersicht bearbeiten", () => selectSiteEditor()]
      ], "overview-tools"));
    }
  }

  function renderFooter() {
    footer.textContent = data.site.footer || "";
    if (editMode) {
      const button = makeChip("Footer bearbeiten", selectSiteEditor);
      footer.append(" ", button);
    }
  }

  function renderSidebarTitles() {
    document.querySelector("#tocTitle").textContent = data.site.sidebarTitles.toc;
    document.querySelector("#themeLinksTitle").textContent = data.site.sidebarTitles.themes;
    document.querySelector("#otherLinksTitle").textContent = data.site.sidebarTitles.other;
    document.querySelector("#literatureLinksTitle").textContent = data.site.sidebarTitles.literature;
  }

  function renderFilters() {
    filters.replaceChildren(...data.filters.map((filter) => {
      const button = createElement("button", "filter", filter.label);
      button.type = "button";
      button.dataset.filter = filter.id;
      button.setAttribute("aria-pressed", String(filter.id === activeFilter));
      button.addEventListener("click", () => {
        activeFilter = filter.id;
        renderFilters();
        updateView();
      });
      return button;
    }));
  }

  function renderBestiary() {
    bestiary.className = "section-list";
    bestiary.replaceChildren(...data.sections.map(renderSection));
  }

  function renderEntry(entry, section, index) {
    const fragment = document.createDocumentFragment();

    if (entry.divider) {
      const divider = createElement("div", "divider");
      divider.dataset.divider = "true";
      divider.dataset.search = normalize(`${entry.title} ${entry.description}`);
      divider.append(createElement("h3", "", entry.title), createElement("p", "", entry.description));
      fragment.append(divider);
    } else {
      const wrapper = document.createElement(entry.href ? "a" : "article");
      wrapper.className = `entry${entry.placeholder ? " placeholder" : ""}`;
      wrapper.dataset.kind = section.kind;
      wrapper.dataset.search = normalize(`${entry.title} ${entry.description}`);

      if (entry.href) {
        wrapper.href = entry.href;
      }

      const media = createElement("span", "entry-media");
      const image = document.createElement("img");
      image.src = entry.image || placeholderImage();
      image.alt = entry.title || "Unbekannt";
      media.append(image);

      const body = createElement("span", "entry-body");
      body.append(
        createElement("span", "entry-title", entry.title || "Unbenannt"),
        createElement("span", "entry-description", entry.description || "")
      );

      const arrow = createElement("span", "entry-arrow", entry.href ? "›" : "");
      arrow.setAttribute("aria-hidden", "true");
      wrapper.append(media, body, arrow);
      fragment.append(wrapper);
    }

    if (editMode) {
      fragment.append(makeInlineTools([
        ["Bearbeiten", () => selectEntryEditor(section.id, index)],
        ["Duplizieren", () => duplicateEntry(section.id, index)],
        ["Löschen", () => deleteEntry(section.id, index)]
      ], "entry-tools"));
    }

    return fragment;
  }

  function renderSection(section) {
    const panel = createElement("section", "panel bestiary-section");
    panel.id = section.id;
    panel.dataset.section = section.kind;

    const head = createElement("div", "section-head");
    const headText = createElement("div");
    headText.append(createElement("h2", "", section.title), createElement("p", "", section.description));
    head.append(headText, createElement("span", "count", section.count));
    panel.append(head);

    if (editMode) {
      panel.append(makeInlineTools([
        ["Reiter bearbeiten", () => selectSectionEditor(section.id)],
        ["Eintrag hinzufügen", () => addEntry(section.id)],
        ["Trenner hinzufügen", () => addDivider(section.id)]
      ], "section-tools"));
    }

    const list = createElement("div", "entry-list");
    section.entries.forEach((entry, index) => list.append(renderEntry(entry, section, index)));
    panel.append(list);
    return panel;
  }

  function renderToc() {
    const tocLinks = [
      { label: "Übersicht", href: "#uebersicht" },
      ...data.sections.map((section) => ({ label: section.title, href: `#${section.id}` }))
    ];
    renderLinks("#toc", tocLinks);
  }

  function renderLinks(selector, links, group) {
    const list = document.querySelector(selector);
    list.replaceChildren(...links.map((link, index) => {
      const item = document.createElement("li");
      const anchor = createElement("a", "", link.label);
      anchor.href = link.href;
      item.append(anchor);
      if (editMode && group) {
        item.append(makeInlineTools([
          ["Bearbeiten", () => selectLinkEditor(group, index)],
          ["Löschen", () => deleteLink(group, index)]
        ], "link-tools"));
      }
      return item;
    }));
  }

  function renderEditor() {
    let editor = document.querySelector("#editor");
    if (!editor) {
      editor = createElement("section", "editor panel");
      editor.id = "editor";
      toolbar.insertAdjacentElement("afterend", editor);
    }

    const toggle = createElement("button", "editor-toggle", editMode ? "Bearbeitung schließen" : "Bearbeiten");
    toggle.type = "button";
    toggle.addEventListener("click", () => {
      editMode = !editMode;
      renderAll();
    });

    const actions = createElement("div", "editor-actions");
    actions.append(
      toggle,
      makeButton("Im Browser speichern", saveToBrowser),
      makeButton("Daten-Datei herunterladen", downloadDataFile),
      makeButton("Direkt als Datei speichern", saveDataFile),
      makeButton("Browser-Speicher zurücksetzen", resetBrowserStorage, "secondary")
    );

    if (!editMode) {
      editor.replaceChildren(actions);
      return;
    }

    const tabs = makeTabs();
    const content = createElement("div", "editor-content");
    if (editorTab === "seite") {
      content.append(renderSiteEditor());
    } else if (editorTab === "reiter") {
      content.append(renderSectionEditor());
    } else if (editorTab === "eintrag") {
      content.append(renderEntryEditor());
    } else {
      content.append(renderLinkEditor());
    }

    const hint = createElement("p", "editor-hint", "Direkt auf „Bearbeiten“ an einem Reiter, Eintrag oder Sidebar-Link klicken, um sofort das passende Formular zu öffnen. Dauerhaft wird über die Daten-Datei gespeichert.");
    editor.replaceChildren(actions, tabs, content, hint);
  }

  function makeTabs() {
    const tabs = createElement("div", "editor-tabs");
    [
      ["seite", "Seite"],
      ["reiter", "Reiter"],
      ["eintrag", "Einträge"],
      ["links", "Sidebar-Links"]
    ].forEach(([id, label]) => {
      const button = createElement("button", `editor-tab${editorTab === id ? " active" : ""}`, label);
      button.type = "button";
      button.addEventListener("click", () => {
        editorTab = id;
        renderEditor();
      });
      tabs.append(button);
    });
    return tabs;
  }

  function renderSiteEditor() {
    const form = createElement("div", "editor-grid");
    form.append(
      makeInput("Seitentitel", data.site.title, (value) => {
        data.site.title = value;
        renderAll();
      }),
      makeInput("Banner-URL", data.site.bannerImage, (value) => {
        data.site.bannerImage = value.trim();
        renderAll();
      }),
      makeInput("Hintergrund-URL", data.site.backgroundImage, (value) => {
        data.site.backgroundImage = value.trim();
        renderAll();
      }),
      makeInput("Footer", data.site.footer, (value) => {
        data.site.footer = value;
        renderAll();
      }),
      makeInput("Überschrift Übersicht", data.site.overview.title, (value) => {
        data.site.overview.title = value;
        renderAll();
      }),
      makeInput("Übersicht Label", data.site.overview.count, (value) => {
        data.site.overview.count = value;
        renderAll();
      }),
      makeInput("Übersicht Einleitung", data.site.overview.lead, (value) => {
        data.site.overview.lead = value;
        renderAll();
      }, true),
      makeInput("Übersicht Text", data.site.overview.body, (value) => {
        data.site.overview.body = value;
        renderAll();
      }, true),
      makeInput("Zitat", data.site.overview.quote, (value) => {
        data.site.overview.quote = value;
        renderAll();
      }, true),
      makeInput("Sidebar: Inhaltsangabe", data.site.sidebarTitles.toc, (value) => {
        data.site.sidebarTitles.toc = value;
        renderAll();
      }),
      makeInput("Sidebar: Themen", data.site.sidebarTitles.themes, (value) => {
        data.site.sidebarTitles.themes = value;
        renderAll();
      }),
      makeInput("Sidebar: Sonstige Themen", data.site.sidebarTitles.other, (value) => {
        data.site.sidebarTitles.other = value;
        renderAll();
      }),
      makeInput("Sidebar: Literatur", data.site.sidebarTitles.literature, (value) => {
        data.site.sidebarTitles.literature = value;
        renderAll();
      }, true)
    );
    return makeEditorBlock("Seite bearbeiten", form);
  }

  function renderSectionEditor() {
    const selectedSection = getSelectedSection();
    const sectionSelect = createElement("select", "");
    sectionSelect.append(...data.sections.map((section) => {
      const option = createElement("option", "", section.title);
      option.value = section.id;
      option.selected = section.id === selectedSection?.id;
      return option;
    }));
    sectionSelect.addEventListener("change", () => selectSectionEditor(sectionSelect.value));

    const form = createElement("div", "editor-grid");
    form.append(
      makeField("Reiter auswählen", sectionSelect),
      makeInput("Titel", selectedSection?.title, (value) => {
        selectedSection.title = value;
        syncFilter(selectedSection);
        renderAll();
      }),
      makeInput("Beschreibung", selectedSection?.description, (value) => {
        selectedSection.description = value;
        renderAll();
      }, true),
      makeInput("Zähler / Label", selectedSection?.count, (value) => {
        selectedSection.count = value;
        renderAll();
      }),
      makeInput("Interne ID", selectedSection?.id, (value) => {
        const oldId = selectedSection.id;
        selectedSection.id = ensureUniqueId(slugify(value));
        selectedSection.kind = selectedSection.id;
        data.filters.forEach((filter) => {
          if (filter.id === oldId) {
            filter.id = selectedSection.id;
          }
        });
        selectedSectionId = selectedSection.id;
        renderAll();
      })
    );

    const actions = createElement("div", "editor-actions");
    actions.append(
      makeButton("Reiter hinzufügen", addSection),
      makeButton("Reiter duplizieren", duplicateSection),
      makeButton("Reiter löschen", deleteSection, "danger")
    );
    return makeEditorBlock("Reiter bearbeiten", form, actions);
  }

  function renderEntryEditor() {
    const section = getSelectedSection();
    const entries = section?.entries || [];
    const selectedEntry = getSelectedEntry();

    const sectionSelect = createElement("select", "");
    sectionSelect.append(...data.sections.map((item) => {
      const option = createElement("option", "", item.title);
      option.value = item.id;
      option.selected = item.id === section?.id;
      return option;
    }));
    sectionSelect.addEventListener("change", () => {
      selectedSectionId = sectionSelect.value;
      selectedEntryIndex = "0";
      editorTab = "eintrag";
      renderAll();
    });

    const entrySelect = createElement("select", "");
    entrySelect.append(...entries.map((entry, index) => {
      const option = createElement("option", "", `${index + 1}. ${entry.divider ? "Trenner: " : ""}${entry.title || "Unbenannt"}`);
      option.value = String(index);
      option.selected = String(index) === String(selectedEntryIndex);
      return option;
    }));
    entrySelect.addEventListener("change", () => {
      selectedEntryIndex = entrySelect.value;
      renderEditor();
    });

    const form = createElement("div", "editor-grid");
    form.append(makeField("Reiter", sectionSelect), makeField("Eintrag auswählen", entrySelect));

    if (selectedEntry) {
      form.append(
        makeInput("Überschrift", selectedEntry.title, (value) => {
          selectedEntry.title = value;
          renderAll();
        }),
        makeInput("Beschreibung / Textfeld", selectedEntry.description, (value) => {
          selectedEntry.description = value;
          renderAll();
        }, true),
        makeInput("Verlinkung", selectedEntry.href || "", (value) => {
          selectedEntry.href = value.trim();
          renderAll();
        }),
        makeInput("Icon / Bild-URL", selectedEntry.image || "", (value) => {
          selectedEntry.image = value.trim();
          renderAll();
        }),
        makeCheckbox("Platzhalter", Boolean(selectedEntry.placeholder), (value) => {
          selectedEntry.placeholder = value;
          renderAll();
        }),
        makeCheckbox("Als Trenner anzeigen", Boolean(selectedEntry.divider), (value) => {
          selectedEntry.divider = value;
          renderAll();
        })
      );
    }

    const actions = createElement("div", "editor-actions");
    actions.append(
      makeButton("Eintrag hinzufügen", () => addEntry(section.id)),
      makeButton("Trenner hinzufügen", () => addDivider(section.id)),
      makeButton("Eintrag duplizieren", () => duplicateEntry(section.id, Number(selectedEntryIndex))),
      makeButton("Eintrag löschen", () => deleteEntry(section.id, Number(selectedEntryIndex)), "danger")
    );
    return makeEditorBlock("Einträge bearbeiten", form, actions);
  }

  function renderLinkEditor() {
    const groupSelect = createElement("select", "");
    [
      ["themes", "Infernale & Celestiale Themen"],
      ["other", "Sonstige Themen"],
      ["literature", "Literatur"]
    ].forEach(([value, label]) => {
      const option = createElement("option", "", label);
      option.value = value;
      option.selected = value === selectedLinkGroup;
      groupSelect.append(option);
    });
    groupSelect.addEventListener("change", () => {
      selectedLinkGroup = groupSelect.value;
      selectedLinkIndex = "0";
      renderEditor();
    });

    const links = getSelectedLinkList();
    const linkSelect = createElement("select", "");
    linkSelect.append(...links.map((link, index) => {
      const option = createElement("option", "", `${index + 1}. ${link.label}`);
      option.value = String(index);
      option.selected = String(index) === String(selectedLinkIndex);
      return option;
    }));
    linkSelect.addEventListener("change", () => {
      selectedLinkIndex = linkSelect.value;
      renderEditor();
    });

    const selectedLink = getSelectedLink();
    const form = createElement("div", "editor-grid");
    form.append(makeField("Link-Gruppe", groupSelect), makeField("Link auswählen", linkSelect));
    if (selectedLink) {
      form.append(
        makeInput("Link-Text", selectedLink.label, (value) => {
          selectedLink.label = value;
          renderAll();
        }),
        makeInput("URL", selectedLink.href, (value) => {
          selectedLink.href = value.trim() || "#";
          renderAll();
        })
      );
    }

    const actions = createElement("div", "editor-actions");
    actions.append(
      makeButton("Link hinzufügen", addLink),
      makeButton("Link duplizieren", duplicateLink),
      makeButton("Link löschen", () => deleteLink(selectedLinkGroup, Number(selectedLinkIndex)), "danger")
    );
    return makeEditorBlock("Sidebar-Links bearbeiten", form, actions);
  }

  function makeButton(label, handler, variant = "") {
    const button = createElement("button", `editor-button ${variant}`.trim(), label);
    button.type = "button";
    button.addEventListener("click", handler);
    return button;
  }

  function makeChip(label, handler) {
    const button = createElement("button", "edit-chip", label);
    button.type = "button";
    button.addEventListener("click", handler);
    return button;
  }

  function makeInlineTools(items, className) {
    const tools = createElement("div", className);
    items.forEach(([label, handler]) => tools.append(makeChip(label, handler)));
    return tools;
  }

  function makeEditorBlock(title, form, actions) {
    const block = createElement("div", "editor-block");
    block.append(createElement("h3", "", title), form);
    if (actions) {
      block.append(actions);
    }
    return block;
  }

  function makeField(label, control) {
    const field = createElement("label", "editor-field");
    field.append(createElement("span", "", label), control);
    return field;
  }

  function makeInput(label, value, onChange, multiline = false) {
    const control = document.createElement(multiline ? "textarea" : "input");
    control.value = value || "";
    control.addEventListener("change", () => onChange(control.value));
    return makeField(label, control);
  }

  function makeCheckbox(label, checked, onChange) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;
    input.addEventListener("change", () => onChange(input.checked));
    const field = createElement("label", "editor-field checkbox-field");
    field.append(input, createElement("span", "", label));
    return field;
  }

  function selectSiteEditor() {
    editorTab = "seite";
    editMode = true;
    renderAll();
    document.querySelector("#editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectSectionEditor(sectionId) {
    selectedSectionId = sectionId;
    editorTab = "reiter";
    editMode = true;
    renderAll();
    document.querySelector("#editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectEntryEditor(sectionId, index) {
    selectedSectionId = sectionId;
    selectedEntryIndex = String(index);
    editorTab = "eintrag";
    editMode = true;
    renderAll();
    document.querySelector("#editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectLinkEditor(group, index) {
    selectedLinkGroup = group;
    selectedLinkIndex = String(index);
    editorTab = "links";
    editMode = true;
    renderAll();
    document.querySelector("#editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function syncFilter(section) {
    const filter = data.filters.find((item) => item.id === section.kind);
    if (filter) {
      filter.label = section.title.replace(/\s+Wesen$/i, "");
    }
  }

  function addSection() {
    const title = "Neuer Reiter";
    const id = ensureUniqueId(slugify(title));
    data.sections.push({
      id,
      kind: id,
      title,
      count: "0 Einträge",
      description: "Beschreibung des neuen Reiters.",
      entries: []
    });
    data.filters.push({ id, label: title });
    selectedSectionId = id;
    selectedEntryIndex = "0";
    editorTab = "reiter";
    renderAll();
  }

  function duplicateSection() {
    const source = getSelectedSection();
    const copy = structuredCloneSafe(source);
    copy.id = ensureUniqueId(`${source.id}-kopie`);
    copy.kind = copy.id;
    copy.title = `${source.title} Kopie`;
    data.sections.push(copy);
    data.filters.push({ id: copy.kind, label: copy.title });
    selectedSectionId = copy.id;
    renderAll();
  }

  function deleteSection() {
    if (data.sections.length <= 1) {
      return;
    }
    const section = getSelectedSection();
    data.sections = data.sections.filter((item) => item.id !== section.id);
    data.filters = data.filters.filter((item) => item.id !== section.kind);
    selectedSectionId = data.sections[0].id;
    selectedEntryIndex = "0";
    activeFilter = activeFilter === section.kind ? "all" : activeFilter;
    renderAll();
  }

  function addEntry(sectionId = selectedSectionId) {
    const section = data.sections.find((item) => item.id === sectionId);
    section.entries.push({
      title: "Neuer Eintrag",
      description: "Beschreibung des Eintrags.",
      href: "",
      image: placeholderImage()
    });
    selectedSectionId = section.id;
    selectedEntryIndex = String(section.entries.length - 1);
    editorTab = "eintrag";
    renderAll();
  }

  function addDivider(sectionId = selectedSectionId) {
    const section = data.sections.find((item) => item.id === sectionId);
    section.entries.push({
      divider: true,
      title: "Neue Trennung",
      description: "Beschreibung der Untergruppe."
    });
    selectedSectionId = section.id;
    selectedEntryIndex = String(section.entries.length - 1);
    editorTab = "eintrag";
    renderAll();
  }

  function duplicateEntry(sectionId, index) {
    const section = data.sections.find((item) => item.id === sectionId);
    const copy = structuredCloneSafe(section.entries[index]);
    copy.title = `${copy.title || "Eintrag"} Kopie`;
    section.entries.splice(index + 1, 0, copy);
    selectedSectionId = sectionId;
    selectedEntryIndex = String(index + 1);
    editorTab = "eintrag";
    renderAll();
  }

  function deleteEntry(sectionId, index) {
    const section = data.sections.find((item) => item.id === sectionId);
    if (!section?.entries.length) {
      return;
    }
    section.entries.splice(index, 1);
    selectedSectionId = sectionId;
    selectedEntryIndex = String(Math.max(0, index - 1));
    renderAll();
  }

  function addLink() {
    const list = getSelectedLinkList();
    list.push({ label: "Neuer Link", href: "#" });
    selectedLinkIndex = String(list.length - 1);
    editorTab = "links";
    renderAll();
  }

  function duplicateLink() {
    const list = getSelectedLinkList();
    const link = getSelectedLink();
    if (!link) {
      return;
    }
    list.splice(Number(selectedLinkIndex) + 1, 0, { ...link, label: `${link.label} Kopie` });
    selectedLinkIndex = String(Number(selectedLinkIndex) + 1);
    renderAll();
  }

  function deleteLink(group, index) {
    const list = data.links[group] || [];
    if (!list.length) {
      return;
    }
    list.splice(index, 1);
    selectedLinkGroup = group;
    selectedLinkIndex = String(Math.max(0, index - 1));
    renderAll();
  }

  function placeholderImage() {
    return "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png";
  }

  function serializeData() {
    return `window.BESTIARIUM_DATA = ${JSON.stringify(data, null, 2)};\n`;
  }

  function saveToBrowser() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    showEditorMessage("Änderungen wurden im Browser gespeichert.");
  }

  function resetBrowserStorage() {
    localStorage.removeItem(STORAGE_KEY);
    showEditorMessage("Browser-Speicher wurde zurückgesetzt. Lade die Seite neu, um die Datei-Version zu sehen.");
  }

  function downloadDataFile() {
    const blob = new Blob([serializeData()], { type: "text/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "bestiarium-data.js";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function saveDataFile() {
    if (!window.showSaveFilePicker) {
      downloadDataFile();
      showEditorMessage("Direktes Speichern ist hier nicht verfügbar. Die Daten-Datei wurde stattdessen heruntergeladen.");
      return;
    }

    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: "bestiarium-data.js",
        types: [{ description: "JavaScript", accept: { "text/javascript": [".js"] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(serializeData());
      await writable.close();
      showEditorMessage("Daten-Datei wurde gespeichert.");
    } catch (error) {
      showEditorMessage("Speichern wurde abgebrochen oder vom Browser blockiert.");
    }
  }

  function showEditorMessage(message) {
    let status = document.querySelector("#editorStatus");
    if (!status) {
      status = createElement("p", "editor-status");
      status.id = "editorStatus";
      document.querySelector("#editor")?.append(status);
    }
    status.textContent = message;
  }

  function updateView() {
    const term = normalize(searchInput.value);
    let visibleEntries = 0;

    document.querySelectorAll(".entry").forEach((entry) => {
      const matchesFilter = activeFilter === "all" || entry.dataset.kind === activeFilter;
      const matchesSearch = !term || entry.dataset.search.includes(term);
      const visible = matchesFilter && matchesSearch;
      entry.hidden = !visible;
      const tools = entry.nextElementSibling?.classList.contains("entry-tools") ? entry.nextElementSibling : null;
      if (tools) {
        tools.hidden = !visible;
      }
      if (visible) {
        visibleEntries += 1;
      }
    });

    document.querySelectorAll(".bestiary-section").forEach((section) => {
      const hasVisibleEntry = Array.from(section.querySelectorAll(".entry")).some((entry) => !entry.hidden);
      section.hidden = !hasVisibleEntry && !editMode;
      section.querySelectorAll(".divider").forEach((divider) => {
        divider.hidden = !hasVisibleEntry;
      });
    });

    empty.style.display = visibleEntries ? "none" : "block";
  }

  renderAll();
  searchInput.addEventListener("input", updateView);
})();
