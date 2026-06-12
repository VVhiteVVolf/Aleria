(function () {
  "use strict";

  const baseData = clone(window.STECKBRIEF_DATA || {});
  let data = clone(baseData);
  const root = document.querySelector("[data-steckbrief-root]");
  if (!data || !root) return;

  const fallback = "-";
  const storageKey = `steckbrief:${data.meta?.id || "vorlage"}`;
  let editMode = false;
  let saveTimer = 0;
  let remoteReady = false;
  let activeEditable = null;
  let activeCompanionPath = "";
  let companionEditMode = false;
  let activeGroupingPath = "";
  let groupingEditMode = false;
  let feedbackTimer = 0;
  let audioContext = null;
  let dirty = false;
  let saving = false;
  let saveQueued = false;
  let closeAfterSave = false;
  let editorTab = "identity";
  let splitterDrag = null;
  const editorLayoutKey = "steckbrief:editor-width";
  const groupingPlaceholderImage = "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png";

  init();

  function init() {
    const local = loadLocal();
    if (local) {
      migrateLegacyPortrait(local, data);
      data = mergeData(data, local);
    }
    ensureGroupingSection();
    ensureGallery();
    renderShell();
    restoreEditorLayout();
    renderAll();
    wireEditorEvents();
    waitForFirebase();
  }

  function renderShell() {
    const bar = document.createElement("div");
    bar.className = "editor-bar";
    bar.innerHTML = `
      <div>
        <strong>Steckbrief-Editor</strong>
        <span id="save-state">bereit</span>
        <span class="editor-feedback" aria-hidden="true"></span>
      </div>
      <div class="editor-actions">
        <button type="button" data-format="bold" data-editor-only><b>F</b></button>
        <button type="button" data-format="italic" data-editor-only><i>K</i></button>
        <button type="button" data-format="underline" data-editor-only><u>U</u></button>
        <button type="button" id="edit-toggle">Bearbeiten</button>
        <button type="button" id="save-now" data-editor-only>Speichern</button>
        <button type="button" id="export-json" data-editor-only>Export JSON</button>
        <button type="button" id="export-data-js" data-editor-only>Export Data JS</button>
        <button type="button" id="import-json-trigger" data-editor-only>Import JSON</button>
        <button type="button" id="reset-local" data-editor-only>Notfallkopie verwerfen</button>
        <button type="button" id="add-gallery-image" data-editor-only>Galeriebild</button>
      </div>
      <input type="file" id="import-json-file" accept="application/json,.json" hidden>
    `;
    document.body.prepend(bar);

    const dock = document.createElement("aside");
    dock.className = "steckbrief-editor-dock";
    dock.setAttribute("aria-label", "Steckbrief-Bearbeitung");
    document.body.insertBefore(dock, root);

    const splitter = document.createElement("button");
    splitter.type = "button";
    splitter.className = "steckbrief-editor-splitter";
    splitter.dataset.editorSplitter = "";
    splitter.setAttribute("aria-label", "Breite zwischen Bearbeitung und Livevorschau anpassen");
    splitter.setAttribute("aria-orientation", "vertical");
    splitter.setAttribute("aria-valuemin", "420");
    splitter.setAttribute("aria-valuemax", "1200");
    splitter.setAttribute("aria-valuenow", "720");
    document.body.insertBefore(splitter, root);
  }

  function renderAll() {
    document.title = data.meta?.titel || data.name?.vollstaendig || "Steckbrief";
    root.classList.toggle("is-editing", editMode);
    document.body.classList.toggle("is-editor-open", editMode);
    bindText(root, data);
    bindImages(root, data);
    renderHierarchy();
    renderFacts();
    renderNavigation();
    renderSections();
    renderGallery();
    refreshImageFieldStatuses(root);
    syncColumnHeight();
    if (!document.activeElement?.closest(".steckbrief-editor-dock")) renderEditorDock();
  }

  function renderEditorDock() {
    const dock = document.querySelector(".steckbrief-editor-dock");
    if (!dock) return;
    const oldTab = dock.dataset.editorTab;
    const oldScrollTop = oldTab === editorTab ? dock.querySelector(".sed-body")?.scrollTop || 0 : 0;
    dock.innerHTML = `
      <header class="sed-head">
        <div>
          <strong>Steckbrief bearbeiten</strong>
          <span>${escapeHtml(data.name?.vollstaendig || data.meta?.id || "Unbenannter Steckbrief")}</span>
        </div>
      </header>
      <nav class="sed-tabs" aria-label="Bearbeitungsbereiche">
        ${renderEditorTabButton("identity", "Identitaet")}
        ${renderEditorTabButton("images", "Bilder")}
        ${renderEditorTabButton("facts", "Fakten")}
        ${renderEditorTabButton("sections", "Sektionen")}
        ${renderEditorTabButton("inventory", "Inventar")}
        ${renderEditorTabButton("groupings", "Gruppierungen")}
        ${renderEditorTabButton("relations", "Beziehungen")}
        ${renderEditorTabButton("gallery", "Galerie")}
      </nav>
      <div class="sed-body">
        ${renderEditorTab()}
      </div>
    `;
    dock.dataset.editorTab = editorTab;
    dock.querySelector(".sed-body")?.scrollTo(0, oldScrollTop);
    refreshImageFieldStatuses(dock);
  }

  function renderEditorTabButton(id, label) {
    return `<button type="button" class="${editorTab === id ? "is-active" : ""}" data-steck-editor-tab="${escapeAttr(id)}">${escapeHtml(label)}</button>`;
  }

  function renderEditorTab() {
    if (editorTab === "images") return renderImagesEditor();
    if (editorTab === "facts") return renderFactsEditor();
    if (editorTab === "sections") return renderSectionsEditor();
    if (editorTab === "inventory") return renderInventoryEditor();
    if (editorTab === "groupings") return renderGroupingsEditor();
    if (editorTab === "relations") return renderRelationsEditor();
    if (editorTab === "gallery") return renderGalleryEditor();
    return renderIdentityEditor();
  }

  function renderIdentityEditor() {
    return `
      <section class="sed-section">
        <h2>Identitaet</h2>
        <div class="sed-grid two">
          ${renderEditorInput("Vorname", "name.vorname")}
          ${renderEditorInput("Nachname", "name.nachname")}
          ${renderEditorInput("Vollstaendiger Name", "name.vollstaendig", "wide")}
          ${renderEditorInput("Titel / Rang", "name.titel")}
          ${renderEditorInput("Rufname", "name.rufname")}
          ${renderEditorInput("Alias", "name.alias")}
        </div>
      </section>
      <section class="sed-section">
        <h2>Meta</h2>
        <div class="sed-grid two">
          ${renderEditorInput("Browser-Titel", "meta.titel", "wide")}
          ${renderEditorInput("Kategorie", "meta.kategorie")}
          ${renderEditorInput("Status", "meta.status")}
        </div>
      </section>
      <section class="sed-section">
        <h2>Zitat und Einfuehrung</h2>
        ${renderEditorTextarea("Zitat", "zitat.text", 3)}
        ${renderEditorInput("Zitatgeber", "zitat.urheber")}
        ${renderEditorTextarea("Einfuehrung", "einfuehrung", 5)}
      </section>
      <section class="sed-section">
        <div class="sed-section-title">
          <h2>Hierarchie</h2>
          <button type="button" data-editor-add="hierarchy-row">+ Ebene</button>
        </div>
        <div class="sed-list">
          ${(data.hierarchie || []).map((item, index) => `
            <article class="sed-row-card">
              <div class="sed-row-tools">
                <span>${index + 1}</span>
                <button type="button" data-editor-move="hierarchie" data-editor-index="${index}" data-editor-dir="-1">Hoch</button>
                <button type="button" data-editor-move="hierarchie" data-editor-index="${index}" data-editor-dir="1">Runter</button>
                <button type="button" data-editor-remove="hierarchie" data-editor-index="${index}">Entfernen</button>
              </div>
              <div class="sed-grid three">
                ${renderEditorInput("Typ", `hierarchie.${index}.typ`)}
                ${renderEditorInput("Name", `hierarchie.${index}.name`)}
                ${renderEditorInput("Slug", `hierarchie.${index}.slug`)}
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderImagesEditor() {
    return `
      <section class="sed-section">
        <h2>Portrait</h2>
        ${renderImageEditor("portrait")}
      </section>
      <section class="sed-section">
        <h2>Wappen</h2>
        ${renderImageEditor("wappen")}
      </section>
      <section class="sed-section">
        <p class="sed-note">Weitere Bilder in Sektionen, Beziehungen und Galerie bleiben im ersten Schritt ueber die bestehenden Bildfelder in der Vorschau bearbeitbar.</p>
      </section>
    `;
  }

  function renderImageEditor(path) {
    const image = readPath(data, path) || {};
    return `
      ${renderImageUrlControl("Bild-URL", `${path}.src`, image.src || "", "sed-image-url")}
      <div class="sed-grid two">
        ${renderEditorInput("Alt-Text", `${path}.alt`)}
        ${renderEditorRange("Skalierung", `${path}.scale`, 0.5, 2, 0.05)}
        ${renderEditorSelect("Format", `${path}.format`, [
          ["square", "Quadrat 1:1"],
          ["portrait", "Portrait 3:4"],
          ["tall", "Hoch 2:3"],
          ["wide", "Breit 4:3"],
          ["banner", "Banner 16:9"],
          ["original", "Original"]
        ])}
        ${renderEditorSelect("Fuellung", `${path}.fit`, [
          ["cover", "Zuschneiden"],
          ["contain", "Einpassen"]
        ])}
      </div>
    `;
  }

  function renderFactsEditor() {
    const groups = Array.isArray(data.fakten) ? data.fakten : [];
    return `
      <section class="sed-section">
        <div class="sed-section-title">
          <h2>Fakten</h2>
          <button type="button" data-editor-add="fact-group">+ Gruppe</button>
        </div>
        <div class="sed-list">
          ${groups.map((group, gi) => `
            <article class="sed-row-card">
              <div class="sed-row-tools">
                <span>Gruppe ${gi + 1}</span>
                <button type="button" data-editor-move="fakten" data-editor-index="${gi}" data-editor-dir="-1">Hoch</button>
                <button type="button" data-editor-move="fakten" data-editor-index="${gi}" data-editor-dir="1">Runter</button>
                <button type="button" data-editor-remove="fakten" data-editor-index="${gi}">Entfernen</button>
              </div>
              ${renderEditorInput("Gruppentitel", `fakten.${gi}.titel`)}
              <div class="sed-mini-list">
                ${(group.eintraege || []).map((row, ri) => `
                  <div class="sed-fact-row">
                    ${renderEditorInput("Feld", `fakten.${gi}.eintraege.${ri}.0`)}
                    ${renderEditorInput("Wert", `fakten.${gi}.eintraege.${ri}.1`)}
                    <button type="button" data-editor-remove-row="fakten.${gi}.eintraege" data-editor-index="${ri}">-</button>
                  </div>
                `).join("")}
              </div>
              <button type="button" class="sed-add-line" data-editor-add-row="fakten.${gi}.eintraege">+ Zeile</button>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderSectionsEditor() {
    const sections = Array.isArray(data.sektionen) ? data.sektionen : [];
    return `
      <section class="sed-section">
        <div class="sed-section-title">
          <h2>Sektionen</h2>
          <button type="button" data-editor-add="section">+ Sektion</button>
        </div>
        <div class="sed-list">
          ${sections.map((section, index) => `
            <article class="sed-row-card">
              <div class="sed-row-tools">
                <span>${index + 1}</span>
                <button type="button" data-editor-move="sektionen" data-editor-index="${index}" data-editor-dir="-1">Hoch</button>
                <button type="button" data-editor-move="sektionen" data-editor-index="${index}" data-editor-dir="1">Runter</button>
                <button type="button" data-editor-remove="sektionen" data-editor-index="${index}">Entfernen</button>
              </div>
              <div class="sed-grid two">
                ${renderEditorInput("Titel", `sektionen.${index}.titel`)}
                ${renderEditorInput("ID", `sektionen.${index}.id`)}
              </div>
              ${renderEditorTextarea("Text", `sektionen.${index}.text`, 5)}
              <details class="sed-details">
                <summary>Hinweis</summary>
                <p>Untergruppen, Inventar, Beziehungen und Spezialbilder bleiben in dieser ersten Stufe im bestehenden Direkteditor der Vorschau bearbeitbar.</p>
              </details>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderInventoryEditor() {
    const target = ensureInventoryEditorTarget();
    const inventory = target.inventory;
    const basePath = target.path;
    const categories = Array.isArray(inventory.kategorien) ? inventory.kategorien : [];
    return `
      <section class="sed-section">
        <div class="sed-section-title">
          <h2>Inventar</h2>
          <button type="button" data-editor-add-inventory-category="${escapeAttr(basePath)}">+ Kategorie</button>
        </div>
        ${renderEditorInput("Inventar-Titel", `${basePath}.titel`)}
        <div class="sed-list">
          ${categories.map((category, ci) => renderInventoryCategoryEditor(category, `${basePath}.kategorien.${ci}`, ci)).join("")}
        </div>
        ${renderPurseEditor(inventory.geldboerse, `${basePath}.geldboerse`)}
      </section>
    `;
  }

  function renderInventoryCategoryEditor(category, path, index) {
    const items = Array.isArray(category.eintraege) ? category.eintraege : [];
    const companionCategory = /reittier|begleiter|gefährte|gefaehrte/i.test(category.titel || "");
    return `
      <article class="sed-row-card sed-inventory-category">
        <div class="sed-row-tools">
          <span>Kategorie ${index + 1}</span>
          <button type="button" data-editor-move="${escapeAttr(parentPath(path))}" data-editor-index="${index}" data-editor-dir="-1">Hoch</button>
          <button type="button" data-editor-move="${escapeAttr(parentPath(path))}" data-editor-index="${index}" data-editor-dir="1">Runter</button>
          <button type="button" data-editor-remove="${escapeAttr(parentPath(path))}" data-editor-index="${index}">Entfernen</button>
        </div>
        ${renderEditorInput("Kategorie", `${path}.titel`)}
        <div class="sed-mini-list">
          ${items.map((item, ii) => renderInventoryItemEditor(item, `${path}.eintraege.${ii}`, ii, companionCategory)).join("")}
        </div>
        <button type="button" class="sed-add-line" data-editor-add-inventory-item="${escapeAttr(path)}">+ Item</button>
      </article>
    `;
  }

  function renderInventoryItemEditor(item, path, index, companionCategory) {
    const hasProfile = Boolean(item.profil || companionCategory);
    if (hasProfile) ensureCompanionProfile(item);
    return `
      <article class="sed-row-card sed-inventory-item">
        <div class="sed-row-tools">
          <span>Item ${index + 1}</span>
          <button type="button" data-editor-move="${escapeAttr(parentPath(path))}" data-editor-index="${index}" data-editor-dir="-1">Hoch</button>
          <button type="button" data-editor-move="${escapeAttr(parentPath(path))}" data-editor-index="${index}" data-editor-dir="1">Runter</button>
          <button type="button" data-editor-remove="${escapeAttr(parentPath(path))}" data-editor-index="${index}">Entfernen</button>
        </div>
        <div class="sed-grid two">
          ${renderEditorInput("Name", `${path}.name`)}
          ${renderEditorRange("Icon-Skalierung", `${path}.iconScale`, 0.5, 2, 0.05)}
          ${renderEditorInput("Icon-URL", `${path}.icon`, "wide")}
        </div>
        ${renderEditorTextarea("Beschreibung", `${path}.beschreibung`, 3)}
        ${renderInventoryStatsEditor(item, path)}
        ${hasProfile ? renderCompanionProfileEditor(item, path) : `<button type="button" class="sed-add-line" data-editor-enable-companion="${escapeAttr(path)}">+ Gefaehrtenprofil</button>`}
      </article>
    `;
  }

  function renderInventoryStatsEditor(item, path) {
    if (item.werte === null) return "";
    if (!item.werte) item.werte = { staerke: 0, geschick: 0, magie: 0 };
    return `
      <div class="sed-grid three sed-stat-grid">
        ${renderEditorNumber("Staerke", `${path}.werte.staerke`, -10, 10, 1)}
        ${renderEditorNumber("Geschick", `${path}.werte.geschick`, -10, 10, 1)}
        ${renderEditorNumber("Magie", `${path}.werte.magie`, -10, 10, 1)}
      </div>
    `;
  }

  function renderCompanionProfileEditor(item, path) {
    const profile = ensureCompanionProfile(item);
    return `
      <details class="sed-details sed-companion-editor" open>
        <summary>Gefaehrtenprofil</summary>
        <div class="sed-grid two">
          ${renderEditorInput("Profilname", `${path}.profil.name`)}
          ${renderEditorInput("Art", `${path}.profil.art`)}
          ${renderEditorInput("Bild-URL", `${path}.profil.bild`, "wide")}
          ${renderEditorRange("Bildskalierung", `${path}.profil.bildScale`, 0.5, 2, 0.05)}
          ${renderEditorSelect("Bildformat", `${path}.profil.bildFormat`, [
            ["square", "Quadrat 1:1"],
            ["portrait", "Portrait 3:4"],
            ["tall", "Hoch 2:3"],
            ["wide", "Breit 4:3"],
            ["banner", "Banner 16:9"],
            ["original", "Original"]
          ])}
          ${renderEditorSelect("Fuellung", `${path}.profil.bildFit`, [
            ["cover", "Zuschneiden"],
            ["contain", "Einpassen"]
          ])}
        </div>
        ${renderEditorTextarea("Kurztext", `${path}.profil.kurztext`, 3)}
        ${renderEditorTextarea("Beschreibung", `${path}.profil.beschreibung`, 4)}
        <div class="sed-mini-list">
          ${(profile.info || []).map((row, ri) => `
            <div class="sed-fact-row">
              ${renderEditorInput("Feld", `${path}.profil.info.${ri}.0`)}
              ${renderEditorInput("Wert", `${path}.profil.info.${ri}.1`)}
              <button type="button" data-editor-remove-row="${path}.profil.info" data-editor-index="${ri}">-</button>
            </div>
          `).join("")}
        </div>
        <button type="button" class="sed-add-line" data-editor-add-companion-info-row="${escapeAttr(path)}">+ Infozeile</button>
        <div class="sed-grid two sed-companion-attributes">
          ${(profile.attribute || []).map((row, ai) => `
            ${renderEditorNumber(row[0] || `Wert ${ai + 1}`, `${path}.profil.attribute.${ai}.1`, 0, 10, 1)}
          `).join("")}
        </div>
      </details>
    `;
  }

  function renderPurseEditor(purse, path) {
    if (!purse) return "";
    const currencies = Array.isArray(purse.waehrungen) ? purse.waehrungen : [];
    return `
      <section class="sed-section sed-purse-editor">
        <div class="sed-section-title">
          <h2>Geldboerse</h2>
          <button type="button" data-editor-add-currency="${escapeAttr(path)}">+ Waehrung</button>
        </div>
        ${renderEditorInput("Beutelbild", `${path}.bild`)}
        <div class="sed-list">
          ${currencies.map((coin, index) => `
            <article class="sed-row-card">
              <div class="sed-row-tools">
                <span>Waehrung ${index + 1}</span>
                <button type="button" data-editor-remove="${escapeAttr(`${path}.waehrungen`)}" data-editor-index="${index}">Entfernen</button>
              </div>
              <div class="sed-grid three">
                ${renderEditorInput("Name", `${path}.waehrungen.${index}.name`)}
                ${renderEditorInput("Anzahl", `${path}.waehrungen.${index}.anzahl`)}
                ${renderEditorInput("Icon", `${path}.waehrungen.${index}.icon`)}
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderGroupingsEditor() {
    const { grouping, path } = ensureGroupingEditorTarget();
    const entries = normalizeGroupingEntries(grouping, path);
    return `
      <section class="sed-section">
        <div class="sed-section-title">
          <h2>Gruppierungen</h2>
        </div>
        <div class="sed-grid">
          ${renderEditorInput("Tabellentitel", `${path}.titel`)}
        </div>
        <div class="sed-list">
          ${entries.map((entry, index) => {
            ensureGroupingProfile(entry);
            return `
              <article class="sed-row-card sed-grouping-row">
                <div class="sed-row-tools">
                  <span>Gruppierung ${index + 1}</span>
                </div>
                <div class="sed-grid two">
                  ${renderEditorInput("Name", `${path}.eintraege.${index}.name`)}
                  ${renderEditorInput("Typ", `${path}.eintraege.${index}.typ`)}
                  ${renderEditorInput("Bild-URL", `${path}.eintraege.${index}.bild`, "wide")}
                  ${renderEditorRange("Bildskalierung", `${path}.eintraege.${index}.bildScale`, 0.5, 2, 0.05)}
                  ${renderEditorSelect("Bildformat", `${path}.eintraege.${index}.bildFormat`, [
                    ["portrait", "Portrait 3:4"],
                    ["tall", "Hoch 2:3"],
                    ["square", "Quadrat 1:1"],
                    ["wide", "Breit 4:3"],
                    ["banner", "Banner 16:9"],
                    ["original", "Original"]
                  ])}
                  ${renderEditorSelect("Fuellung", `${path}.eintraege.${index}.bildFit`, [
                    ["contain", "Einpassen"],
                    ["cover", "Zuschneiden"]
                  ])}
                </div>
                ${renderEditorTextarea("Kurztext", `${path}.eintraege.${index}.text`, 3)}
                <details class="sed-details">
                  <summary>Profilfelder</summary>
                  <div class="sed-grid two">
                  ${renderEditorInput("Profilname", `${path}.eintraege.${index}.profil.name`)}
                  ${renderEditorInput("Kategorie", `${path}.eintraege.${index}.profil.art`)}
                  ${renderEditorInput("Sitz / Ort", `${path}.eintraege.${index}.profil.sitz`)}
                  ${renderEditorInput("Anfuehrer", `${path}.eintraege.${index}.profil.anfuehrer`)}
                  ${renderEditorInput("Link zur Gruppenseite", `${path}.eintraege.${index}.profil.link`, "wide")}
                </div>
                ${renderEditorTextarea("Profilbeschreibung", `${path}.eintraege.${index}.profil.beschreibung`, 4)}
              </details>
              </article>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function renderRelationsEditor() {
    const groups = collectRelationEditorGroups();
    return `
      <section class="sed-section">
        <div class="sed-section-title">
          <h2>Beziehungen</h2>
          <button type="button" data-editor-add="relation-group">+ Gruppe</button>
        </div>
        ${groups.length ? `<div class="sed-list">
          ${groups.map(({ section, group, sectionIndex, groupIndex, path }) => `
            <article class="sed-row-card">
              <div class="sed-row-tools">
                <span>${escapeHtml(section.titel || `Sektion ${sectionIndex + 1}`)}</span>
                <button type="button" data-editor-remove-relation-group="${escapeAttr(path)}">Gruppe entfernen</button>
              </div>
              <div class="sed-grid two">
                ${renderEditorInput("Gruppentitel", `${path}.titel`)}
                ${renderEditorInput("Slots", `${path}.slots`)}
              </div>
              <div class="sed-mini-list">
                ${normalizeRelationEntries(group, path).map((relation, ri) => `
                  <article class="sed-relation-row">
                    <div class="sed-row-tools">
                      <span>Beziehung ${ri + 1}</span>
                      <button type="button" data-editor-remove-row="${path}.eintraege" data-editor-index="${ri}">Entfernen</button>
                    </div>
                    <div class="sed-grid two">
                      ${renderEditorInput("Name", `${path}.eintraege.${ri}.name`)}
                      ${renderEditorInput("Art", `${path}.eintraege.${ri}.art`)}
                      ${renderEditorInput("Bild-URL", `${path}.eintraege.${ri}.bild`, "wide")}
                      ${renderEditorRange("Bildskalierung", `${path}.eintraege.${ri}.bildScale`, 0.5, 2, 0.05)}
                    </div>
                    ${renderEditorTextarea("Beschreibung", `${path}.eintraege.${ri}.text`, 3)}
                  </article>
                `).join("")}
              </div>
              <button type="button" class="sed-add-line" data-editor-add-relation="${escapeAttr(path)}">+ Beziehung</button>
            </article>
          `).join("")}
        </div>` : `<p class="sed-note">Noch keine Beziehungssektion vorhanden. Mit "+ Gruppe" wird eine Beziehungsgruppe in der Sektion "Beziehungen" angelegt.</p>`}
      </section>
    `;
  }

  function renderGalleryEditor() {
    if (!Array.isArray(data.galerie)) data.galerie = [];
    return `
      <section class="sed-section">
        <div class="sed-section-title">
          <h2>Galerie</h2>
          <button type="button" data-editor-add="gallery-image">+ Bild</button>
        </div>
        <div class="sed-list">
          ${data.galerie.map((image, index) => `
            <article class="sed-row-card sed-gallery-row">
              <div class="sed-row-tools">
                <span>Bild ${index + 1}</span>
                <button type="button" data-editor-move="galerie" data-editor-index="${index}" data-editor-dir="-1">Hoch</button>
                <button type="button" data-editor-move="galerie" data-editor-index="${index}" data-editor-dir="1">Runter</button>
                <button type="button" data-editor-remove="galerie" data-editor-index="${index}">Entfernen</button>
              </div>
              ${renderImageUrlControl("Bild-URL", `galerie.${index}.src`, image.src || "", "sed-image-url")}
              <div class="sed-grid two">
                ${renderEditorInput("Alt-Text", `galerie.${index}.alt`)}
                ${renderEditorRange("Skalierung", `galerie.${index}.scale`, 0.5, 2, 0.05)}
              </div>
              ${renderEditorTextarea("Bildbeschreibung", `galerie.${index}.caption`, 3)}
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderEditorInput(label, path, className = "") {
    const value = readPath(data, path);
    return `
      <label class="sed-field ${escapeAttr(className)}">
        <span>${escapeHtml(label)}</span>
        <input value="${escapeAttr(value ?? "")}" data-input="${escapeAttr(path)}">
      </label>
    `;
  }

  function renderEditorTextarea(label, path, rows = 4) {
    const value = readPath(data, path);
    return `
      <label class="sed-field wide">
        <span>${escapeHtml(label)}</span>
        <textarea rows="${rows}" data-input="${escapeAttr(path)}">${escapeHtml(value ?? "")}</textarea>
      </label>
    `;
  }

  function renderEditorRange(label, path, min, max, step) {
    const value = readPath(data, path);
    return `
      <label class="sed-field">
        <span>${escapeHtml(label)}</span>
        <input type="range" min="${min}" max="${max}" step="${step}" value="${escapeAttr(value ?? 1)}" data-input="${escapeAttr(path)}">
      </label>
    `;
  }

  function renderEditorNumber(label, path, min = 0, max = 10, step = 1) {
    const value = readPath(data, path);
    return `
      <label class="sed-field">
        <span>${escapeHtml(label)}</span>
        <input type="number" min="${min}" max="${max}" step="${step}" value="${escapeAttr(value ?? 0)}" data-input="${escapeAttr(path)}">
      </label>
    `;
  }

  function renderEditorSelect(label, path, options) {
    return `
      <label class="sed-field">
        <span>${escapeHtml(label)}</span>
        <select data-input="${escapeAttr(path)}">
          ${renderSelectOptions(options, readPath(data, path))}
        </select>
      </label>
    `;
  }

  function bindText(scope, source) {
    scope.querySelectorAll("[data-bind]").forEach((node) => {
      const path = node.dataset.bind;
      const value = readPath(source, path);
      node.textContent = normalize(value);
      node.classList.toggle("is-empty", !hasValue(value));
      makeEditable(node, path, "text");
    });
  }

  function bindImages(scope, source) {
    scope.querySelectorAll("[data-bind-image]").forEach((img) => {
      const path = img.dataset.bindImage;
      const image = readPath(source, path) || {};
      img.src = image.src || "";
      img.alt = image.alt || data.name?.vollstaendig || "Charakterbild";
      img.style.objectPosition = image.position || "center";
      img.style.transform = `scale(${Number(image.scale || 1) || 1})`;
      img.style.objectFit = image.fit || (path === "wappen" ? "contain" : "cover");
      img.parentElement?.style.setProperty("--image-ratio", imageRatioValue(image.format || (path === "portrait" ? "portrait" : "square")));
      img.hidden = !image.src;
      renderBoundImageControls(img, path, image);
    });
  }

  function renderBoundImageControls(img, path, image) {
    const old = img.parentElement?.querySelector(`.bound-image-controls[data-for="${cssEscape(path)}"]`);
    if (old) old.remove();
    const controls = document.createElement("div");
    controls.className = "edit-controls compact bound-image-controls";
    controls.dataset.for = path;
    controls.innerHTML = `
      ${renderImageUrlControl("Bildlink", `${path}.src`, image.src || "")}
      <label>Alt-Text <input value="${escapeAttr(image.alt || "")}" data-input="${escapeAttr(`${path}.alt`)}"></label>
      <label>Skalierung <input type="range" min="0.5" max="2" step="0.05" value="${escapeAttr(image.scale || 1)}" data-input="${escapeAttr(`${path}.scale`)}"></label>
      <label>Format
        <select data-input="${escapeAttr(`${path}.format`)}">
          ${renderImageFormatOptions(image.format || (path === "portrait" ? "portrait" : "square"))}
        </select>
      </label>
      <label>Füllung
        <select data-input="${escapeAttr(`${path}.fit`)}">
          ${renderSelectOptions([["cover", "Zuschneiden"], ["contain", "Einpassen"]], image.fit || (path === "wappen" ? "contain" : "cover"))}
        </select>
      </label>
    `;
    img.insertAdjacentElement("afterend", controls);
  }

  function renderHierarchy() {
    const target = root.querySelector('[data-render="hierarchie"]');
    if (!target) return;
    const items = Array.isArray(data.hierarchie) ? data.hierarchie : [];
    target.innerHTML = items.map((item, index) => `
      <span class="crumb">
        <span class="crumb-type" ${editableAttr(`hierarchie.${index}.typ`)}> ${escapeHtml(item.typ || "Ebene")}</span>
        <span ${editableAttr(`hierarchie.${index}.name`)}>${escapeHtml(item.name || fallback)}</span>
      </span>
    `).join("");
  }

  function renderFacts() {
    const target = root.querySelector('[data-render="fakten"]');
    if (!target) return;
    const groups = Array.isArray(data.fakten) ? data.fakten : [];
    target.innerHTML = groups.map((group, gi) => `
      <article class="fact-card">
        <h2 ${editableAttr(`fakten.${gi}.titel`)}>${escapeHtml(group.titel || "Informationen")}</h2>
        <table class="fact-table"><tbody>
          ${(group.eintraege || []).map(([label, value], ri) => `
            <tr>
              <th scope="row" ${editableAttr(`fakten.${gi}.eintraege.${ri}.0`)}>${escapeHtml(label)}</th>
              <td class="${hasValue(value) ? "" : "is-empty"}" ${editableAttr(`fakten.${gi}.eintraege.${ri}.1`)}>${escapeHtml(normalize(value))}</td>
            </tr>
          `).join("")}
        </tbody></table>
      </article>
    `).join("");
  }

  function renderNavigation() {
    const target = root.querySelector('[data-render="navigation"]');
    if (!target) return;
    const sections = Array.isArray(data.sektionen) ? data.sektionen : [];
    target.innerHTML = `
      <p class="toc-title">Inhalt</p>
      ${sections.map((section, index) => `<a href="#${escapeAttr(section.id || `sektion-${index + 1}`)}">${index + 1}. ${escapeHtml(section.titel || "Abschnitt")}</a>`).join("")}
    `;
  }

  function renderSections() {
    const target = root.querySelector('[data-render="sektionen"]');
    const fullTarget = root.querySelector('[data-render="vollbreite-sektionen"]');
    const sections = Array.isArray(data.sektionen) ? data.sektionen : [];
    if (target) target.innerHTML = sections.slice(0, 2).map((section, index) => renderSection(section, index)).join("");
    if (fullTarget) fullTarget.innerHTML = sections.slice(2).map((section, offset) => renderSection(section, offset + 2)).join("");
  }

  function renderSection(section, index) {
    const id = section.id || `sektion-${index + 1}`;
    return `
      <section class="content-section" id="${escapeAttr(id)}">
        <h2><span>${index + 1}. </span><span ${editableAttr(`sektionen.${index}.titel`)}>${escapeHtml(section.titel || "Abschnitt")}</span></h2>
        <div class="${section.scrollHoehe ? "scroll-box" : ""}" ${section.scrollHoehe ? `style="--scroll-height:${Number(section.scrollHoehe)}px"` : ""}>
          ${renderTextBlock(section.text, `sektionen.${index}.text`)}
          ${renderList(section.liste, `sektionen.${index}.liste`)}
          ${renderGroups(section.gruppen, `sektionen.${index}.gruppen`)}
          ${renderImage(section.bild, `sektionen.${index}.bild`)}
          ${renderInventory(section.inventar, `sektionen.${index}.inventar`)}
          ${renderGroupings(section.gruppierungen, `sektionen.${index}.gruppierungen`)}
          ${renderRelationGroups(section.beziehungsgruppen, `sektionen.${index}.beziehungsgruppen`)}
        </div>
      </section>
    `;
  }

  function renderGroups(groups, basePath) {
    if (!Array.isArray(groups)) return "";
    return groups.map((group, index) => `
      <section class="subsection">
        <h3 ${editableAttr(`${basePath}.${index}.titel`)}>${escapeHtml(group.titel || "Unterpunkt")}</h3>
        ${renderTextBlock(group.text, `${basePath}.${index}.text`)}
        ${renderList(group.liste, `${basePath}.${index}.liste`)}
        ${renderQuotes(group.zitate, `${basePath}.${index}.zitate`)}
      </section>
    `).join("");
  }

  function renderTextBlock(value, basePath) {
    if (!hasTextBlock(value)) return "";
    return `<div class="rich-text" ${editableAttr(basePath, "rich")}>${formatRichValue(value)}</div>`;
  }

  function renderList(value, basePath) {
    if (!Array.isArray(value) || value.length === 0) return "";
    return `
      <ul class="plain-list editable-list" data-list="${escapeAttr(basePath)}">
        ${value.map((item, index) => `
          <li>
            <span ${editableAttr(`${basePath}.${index}`, "rich")}>${formatRichValue(item)}</span>
            <button type="button" class="list-remove" data-remove-list="${escapeAttr(basePath)}" data-remove-index="${index}">-</button>
          </li>
        `).join("")}
      </ul>
      <button type="button" class="list-add" data-add-list="${escapeAttr(basePath)}">+ Eintrag</button>
    `;
  }

  function renderQuotes(quotes, basePath) {
    if (!Array.isArray(quotes) || quotes.length === 0) return "";
    return quotes.map((quote, index) => `
      <blockquote class="section-quote">
        <p ${editableAttr(`${basePath}.${index}.text`, "rich")}>${formatRichValue(quote.text || fallback)}</p>
        <cite ${editableAttr(`${basePath}.${index}.urheber`)}>${escapeHtml(quote.urheber || "")}</cite>
      </blockquote>
    `).join("");
  }

  function renderImage(image, basePath) {
    if (!image) return "";
    return `
      <details class="image-disclosure">
        <summary>Bild ansehen</summary>
        <figure class="image-frame">
          ${renderImageControls(basePath, image)}
          ${image.src ? `<img src="${escapeAttr(image.src)}" alt="${escapeAttr(image.alt || "")}" style="${imageStyle(image)}">` : `<div class="image-placeholder">Bildlink eintragen</div>`}
          <figcaption ${editableAttr(`${basePath}.caption`, "rich")}>${formatRichValue(image.caption || "")}</figcaption>
          <figcaption ${editableAttr(`${basePath}.credit`, "rich")}>${formatRichValue(image.credit || "")}</figcaption>
        </figure>
      </details>
    `;
  }

  function renderImageControls(basePath, image) {
    return `
      <div class="edit-controls">
        ${renderImageUrlControl("Bildlink", `${basePath}.src`, image.src || "")}
        <label>Alt-Text <input value="${escapeAttr(image.alt || "")}" data-input="${escapeAttr(`${basePath}.alt`)}"></label>
        <label>Skalierung <input type="range" min="0.5" max="2" step="0.05" value="${escapeAttr(image.scale || 1)}" data-input="${escapeAttr(`${basePath}.scale`)}"></label>
      </div>
    `;
  }

  function renderImageUrlControl(label, path, value, className = "") {
    return `
      <label class="${escapeAttr(className)} image-url-control">
        <span>${escapeHtml(label)}</span>
        <span class="image-url-row">
          <input value="${escapeAttr(value || "")}" data-input="${escapeAttr(path)}" data-image-url>
          <button type="button" class="image-clear" data-clear-image="${escapeAttr(path)}" title="Bildlink leeren" aria-label="Bildlink leeren">x</button>
        </span>
        <span class="image-url-preview" data-image-preview></span>
        <span class="image-url-status" data-image-status>leer</span>
      </label>
    `;
  }

  function renderInventory(inventory, basePath) {
    if (!inventory) return "";
    const table = `
      <div class="inventory-table">
        <div class="inventory-title" ${editableAttr(`${basePath}.titel`)}>${escapeHtml(inventory.titel || "Inventar")}</div>
        ${(inventory.kategorien || []).map((cat, index) => renderInventoryCategory(cat, `${basePath}.kategorien.${index}`)).join("")}
        ${renderPurse(inventory.geldboerse, `${basePath}.geldboerse`)}
      </div>
    `;
    return `<details class="inventory-disclosure" open><summary>Aufklappen - Einklappen</summary>${table}</details>`;
  }

  function renderInventoryCategory(category, basePath) {
    const companionCategory = /reittier|begleiter|gefährte|gefaehrte/i.test(category.titel || "");
    return `
      <section class="inventory-category">
        <h3 ${editableAttr(`${basePath}.titel`)}>${escapeHtml(category.titel || "Kategorie")}</h3>
        ${(category.eintraege || []).map((item, index) => renderInventoryItem(item, `${basePath}.eintraege.${index}`, companionCategory)).join("")}
        <button type="button" class="slot-add" data-add-inventory="${escapeAttr(`${basePath}.eintraege`)}">+ Itemslot</button>
      </section>
    `;
  }

  function renderInventoryItem(item, basePath, companionCategory = false) {
    const hasProfile = Boolean(item.profil || companionCategory);
    if (hasProfile) ensureCompanionProfile(item);
    return `
      <article class="inventory-item">
        <div class="inventory-item-head">
          <strong ${editableAttr(`${basePath}.name`)}>${escapeHtml(item.name || "Gegenstand")}</strong>
          ${item.icon ? `<img src="${escapeAttr(item.icon)}" alt="" style="${imageStyle({ scale: item.iconScale || 1 })}">` : ""}
          <div class="edit-controls compact">
            ${renderImageUrlControl("Bild", `${basePath}.icon`, item.icon || "")}
            <label>Skalierung <input type="range" min="0.5" max="2" step="0.05" value="${escapeAttr(item.iconScale || 1)}" data-input="${escapeAttr(`${basePath}.iconScale`)}"></label>
          </div>
          ${renderStats(item.werte, `${basePath}.werte`)}
          ${hasProfile ? `<button type="button" class="companion-open" data-open-companion="${escapeAttr(basePath)}">Profil öffnen</button>` : ""}
        </div>
        <div class="inventory-desc"><div ${editableAttr(`${basePath}.beschreibung`, "rich")}>${formatRichValue(item.beschreibung || fallback)}</div></div>
      </article>
    `;
  }

  function renderCompanionModal(basePath) {
    const item = readPath(data, basePath);
    if (!item) return;
    const profile = ensureCompanionProfile(item);
    let modal = document.querySelector(".companion-veil");
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "companion-veil";
      document.body.appendChild(modal);
    }
    modal.classList.toggle("is-editing", companionEditMode);
    modal.innerHTML = `
      <div class="companion-modal" role="dialog" aria-modal="true" aria-label="Gefährtenprofil">
        <header class="companion-modal-bar">
          <div>
            <span class="companion-kicker">Gefährtenprofil</span>
            <h2 ${companionEditableAttr(`${basePath}.profil.name`)}>${escapeHtml(profile.name || item.name || "Gefährte")}</h2>
          </div>
          <div class="companion-actions">
            <button type="button" data-companion-toggle>${companionEditMode ? "Ansicht" : "Bearbeiten"}</button>
            <button type="button" data-companion-save>Speichern</button>
            <button type="button" data-companion-close>Schließen</button>
          </div>
        </header>
        <div class="companion-profile-grid">
          <figure class="companion-portrait">
            <div class="companion-image-box" style="--image-ratio:${imageRatioValue(profile.bildFormat || "square")};--companion-fit:${profile.bildFit || "contain"}">
              ${profile.bild ? `<img src="${escapeAttr(profile.bild)}" alt="${escapeAttr(profile.name || "Gefährte")}" style="${imageStyle({ scale: profile.bildScale || 1 })}">` : `<div class="image-placeholder">Bildlink eintragen</div>`}
            </div>
            <div class="edit-controls compact">
              ${renderImageUrlControl("Bildlink", `${basePath}.profil.bild`, profile.bild || "")}
              <label>Skalierung <input type="range" min="0.5" max="2" step="0.05" value="${escapeAttr(profile.bildScale || 1)}" data-input="${escapeAttr(`${basePath}.profil.bildScale`)}"></label>
              <label>Format
                <select data-input="${escapeAttr(`${basePath}.profil.bildFormat`)}">
                  ${renderImageFormatOptions(profile.bildFormat || "square")}
                </select>
              </label>
              <label>FÃ¼llung
                <select data-input="${escapeAttr(`${basePath}.profil.bildFit`)}">
                  ${renderSelectOptions([["cover", "Zuschneiden"], ["contain", "Einpassen"]], profile.bildFit || "contain")}
                </select>
              </label>
            </div>
            <figcaption ${companionEditableAttr(`${basePath}.profil.kurztext`, "rich")}>${formatRichValue(profile.kurztext || "Kurze Beschreibung.")}</figcaption>
          </figure>
          <section class="companion-main-card">
            <div class="companion-type" ${companionEditableAttr(`${basePath}.profil.art`)}>${escapeHtml(profile.art || "Tier / Begleiter")}</div>
            ${renderCompanionInfo(profile.info, `${basePath}.profil.info`)}
            <div class="companion-description" ${companionEditableAttr(`${basePath}.profil.beschreibung`, "rich")}>${formatRichValue(profile.beschreibung || "Beschreibung.")}</div>
          </section>
          <section class="companion-stats-card">
            <h3>Attribute</h3>
            ${renderCompanionRadar(profile.attribute, `${basePath}.profil.attribute`)}
          </section>
        </div>
      </div>
    `;
    refreshImageFieldStatuses(modal);
  }

  function renderGroupingModal(basePath) {
    const entry = readPath(data, basePath);
    if (!entry) return;
    const profile = ensureGroupingProfile(entry);
    const profileImage = profile.bild || entry.bild || groupingPlaceholderImage;
    const profileLink = normalizeLink(profile.link || entry.link || "");
    const profileImageMarkup = `<img src="${escapeAttr(profileImage)}" alt="${escapeAttr(profile.name || entry.name || "Gruppierung")}" style="${imageStyle({ scale: profile.bildScale || entry.bildScale || 1 })}">`;
    let modal = document.querySelector(".grouping-veil");
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "grouping-veil";
      document.body.appendChild(modal);
    }
    modal.classList.toggle("is-editing", groupingEditMode);
    modal.innerHTML = `
      <div class="grouping-modal" role="dialog" aria-modal="true" aria-label="Gruppierungsprofil">
        <header class="companion-modal-bar">
          <div>
            <span class="companion-kicker">Gruppierungsprofil</span>
            <h2 ${groupingEditableAttr(`${basePath}.profil.name`)}>${escapeHtml(profile.name || entry.name || "Gruppierung")}</h2>
          </div>
          <div class="companion-actions">
            <button type="button" data-grouping-toggle>${groupingEditMode ? "Ansicht" : "Bearbeiten"}</button>
            <button type="button" data-grouping-save>Speichern</button>
            <button type="button" data-grouping-close>Schliessen</button>
          </div>
        </header>
        <div class="grouping-profile-grid">
          <figure class="companion-portrait">
            <div class="companion-image-box" style="--image-ratio:${imageRatioValue(profile.bildFormat || "portrait")};--companion-fit:${profile.bildFit || "contain"}">
              ${profileLink && !groupingEditMode ? `<a class="grouping-profile-link" href="${escapeAttr(profileLink)}" target="_blank" rel="noopener noreferrer">${profileImageMarkup}</a>` : profileImageMarkup}
            </div>
            <div class="edit-controls compact">
              ${renderImageUrlControl("Bildlink", `${basePath}.profil.bild`, profileImage)}
              <label>Link zur Gruppenseite <input value="${escapeAttr(profile.link || entry.link || "")}" data-input="${escapeAttr(`${basePath}.profil.link`)}" placeholder="/gruppen/... oder https://..."></label>
              <label>Skalierung <input type="range" min="0.5" max="2" step="0.05" value="${escapeAttr(profile.bildScale || entry.bildScale || 1)}" data-input="${escapeAttr(`${basePath}.profil.bildScale`)}"></label>
              <label>Format
                <select data-input="${escapeAttr(`${basePath}.profil.bildFormat`)}">
                  ${renderImageFormatOptions(profile.bildFormat || "portrait")}
                </select>
              </label>
              <label>Fuellung
                <select data-input="${escapeAttr(`${basePath}.profil.bildFit`)}">
                  ${renderSelectOptions([["cover", "Zuschneiden"], ["contain", "Einpassen"]], profile.bildFit || "contain")}
                </select>
              </label>
            </div>
            <figcaption ${groupingEditableAttr(`${basePath}.profil.kurztext`, "rich")}>${formatRichValue(profile.kurztext || "Kurze Beschreibung der Gruppierung.")}</figcaption>
          </figure>
          <section class="companion-main-card">
            <div class="companion-type" ${groupingEditableAttr(`${basePath}.profil.art`)}>${escapeHtml(profile.art || entry.typ || "Gruppe / Gilde / Orden")}</div>
            ${renderGroupingInfo(profile.info, `${basePath}.profil.info`)}
            <div class="companion-description" ${groupingEditableAttr(`${basePath}.profil.beschreibung`, "rich")}>${formatRichValue(profile.beschreibung || "Beschreibung, Ziele, Struktur und Bedeutung der Gruppierung.")}</div>
          </section>
          <section class="companion-stats-card">
            <h3>Organisationswerte</h3>
            ${renderGroupingAttributes(profile.attribute, `${basePath}.profil.attribute`)}
          </section>
        </div>
      </div>
    `;
    refreshImageFieldStatuses(modal);
  }

  function renderGroupingInfo(info, basePath) {
    const rows = Array.isArray(info) ? info : [];
    return `
      <table class="companion-info-table"><tbody>
        ${rows.map(([label, value], index) => `
          <tr>
            <th ${groupingEditableAttr(`${basePath}.${index}.0`)}>${escapeHtml(label || "Feld")}</th>
            <td ${groupingEditableAttr(`${basePath}.${index}.1`)}>${escapeHtml(normalize(value))}</td>
          </tr>
        `).join("")}
      </tbody></table>
    `;
  }

  function renderGroupingAttributes(attributes, basePath) {
    const rows = normalizeGroupingAttributes(attributes);
    return `
      <div class="companion-bars">
        ${rows.map(([label, value], index) => `
          <label class="companion-attribute">
            <span>${escapeHtml(label)}</span>
            <input type="range" min="0" max="10" step="1" value="${escapeAttr(value)}" data-input="${escapeAttr(`${basePath}.${index}.1`)}" ${groupingEditMode ? "" : "disabled"}>
            <b>${escapeHtml(value)}</b>
          </label>
        `).join("")}
      </div>
    `;
  }

  function renderCompanionInfo(info, basePath) {
    const rows = Array.isArray(info) ? info : [];
    return `
      <table class="companion-info-table"><tbody>
        ${rows.map(([label, value], index) => `
          <tr>
            <th ${companionEditableAttr(`${basePath}.${index}.0`)}>${escapeHtml(label || "Feld")}</th>
            <td ${companionEditableAttr(`${basePath}.${index}.1`)}>${escapeHtml(normalize(value))}</td>
          </tr>
        `).join("")}
      </tbody></table>
      <button type="button" class="companion-row-add" data-add-companion-info="${escapeAttr(basePath)}">+ Infozeile</button>
    `;
  }

  function renderCompanionRadar(attributes, basePath) {
    const rows = normalizeCompanionAttributes(attributes);
    const max = 10;
    const points = rows.map(([, value], index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / rows.length;
      const radius = 78 * Math.max(0, Math.min(max, Number(value) || 0)) / max;
      return [100 + Math.cos(angle) * radius, 100 + Math.sin(angle) * radius];
    });
    const axes = rows.map(([label], index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / rows.length;
      const x = 100 + Math.cos(angle) * 86;
      const y = 100 + Math.sin(angle) * 86;
      const lx = 100 + Math.cos(angle) * 102;
      const ly = 100 + Math.sin(angle) * 102;
      return `<line x1="100" y1="100" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"></line><text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}">${escapeHtml(label)}</text>`;
    }).join("");
    const rings = [0.25, 0.5, 0.75, 1].map((factor) => {
      const ring = rows.map(([,], index) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / rows.length;
        return `${(100 + Math.cos(angle) * 78 * factor).toFixed(1)},${(100 + Math.sin(angle) * 78 * factor).toFixed(1)}`;
      }).join(" ");
      return `<polygon points="${ring}"></polygon>`;
    }).join("");
    return `
      <div class="companion-radar-wrap">
        <svg class="companion-radar" viewBox="-14 -12 228 224" aria-hidden="true">
          <g class="radar-rings">${rings}</g>
          <g class="radar-axes">${axes}</g>
          <polygon class="radar-shape" points="${points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}"></polygon>
          ${points.map(([x, y]) => `<circle class="radar-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3"></circle>`).join("")}
        </svg>
      </div>
      <div class="companion-bars">
        ${rows.map(([label, value], index) => `
          <label class="companion-attribute">
            <span ${companionEditableAttr(`${basePath}.${index}.0`)}>${escapeHtml(label)}</span>
            <input type="range" min="0" max="10" step="1" value="${escapeAttr(value)}" data-input="${escapeAttr(`${basePath}.${index}.1`)}" ${companionEditMode ? "" : "disabled"}>
            <b ${companionEditableAttr(`${basePath}.${index}.1`, "number")}>${escapeHtml(value)}</b>
          </label>
        `).join("")}
      </div>
    `;
  }

  function renderStats(stats, basePath) {
    if (!stats) return "";
    const icons = data.icons || {};
    return `
      <div class="stat-line">
        ${renderStat(stats.staerke, icons.staerke, "Stärke", `${basePath}.staerke`)}
        <span>|</span>
        ${renderStat(stats.geschick, icons.geschick, "Geschick", `${basePath}.geschick`)}
        <span>|</span>
        ${renderStat(stats.magie, icons.magie, "Magie", `${basePath}.magie`)}
      </div>
    `;
  }

  function renderStat(value, icon, label, path) {
    return `<span class="stat"><span ${editableAttr(path, "number")}>${escapeHtml(value ?? 0)}</span>${icon ? `<img src="${escapeAttr(icon)}" alt="${escapeAttr(label)}">` : escapeHtml(label)}</span>`;
  }

  function renderPurse(purse, basePath) {
    if (!purse) return "";
    return `
      <section class="purse">
        <h3>Geldbörse <span>- Übersicht deiner Währung</span></h3>
        <div class="purse-layout">
          <div class="purse-bag">
            ${purse.bild ? `<img src="${escapeAttr(purse.bild)}" alt="Münzbeutel">` : ""}
            <div class="edit-controls compact">${renderImageUrlControl("Bild", `${basePath}.bild`, purse.bild || "")}</div>
          </div>
          <div class="coins">
            ${(purse.waehrungen || []).map((coin, index) => `
              <div class="coin-card">
                <strong ${editableAttr(`${basePath}.waehrungen.${index}.name`)}>${escapeHtml(coin.name || "Währung")}</strong>
                ${coin.icon ? `<img src="${escapeAttr(coin.icon)}" alt="">` : ""}
                ${renderImageUrlControl("Icon", `${basePath}.waehrungen.${index}.icon`, coin.icon || "", "coin-url")}
                <div class="coin-count">x <span ${editableAttr(`${basePath}.waehrungen.${index}.anzahl`)}>${escapeHtml(coin.anzahl ?? "??")}</span></div>
              </div>
            `).join("")}
          </div>
        </div>
      </section>
    `;
  }

  function renderGroupings(grouping, basePath) {
    if (!grouping) return "";
    const entries = normalizeGroupingEntries(grouping, basePath);
    return `
      <div class="grouping-table">
        <div class="grouping-table-title" ${editableAttr(`${basePath}.titel`)}>${escapeHtml(grouping.titel || "Gruppierungen")}</div>
        <div class="grouping-grid">
          ${entries.map((entry, index) => renderGroupingSlot(entry, `${basePath}.eintraege.${index}`, index)).join("")}
        </div>
      </div>
    `;
  }

  function normalizeGroupingEntries(grouping, basePath) {
    if (!Array.isArray(grouping.eintraege)) setPath(data, `${basePath}.eintraege`, []);
    const entries = readPath(data, `${basePath}.eintraege`);
    const target = Math.max(Number(grouping.slots) || 5, entries.length);
    while (entries.length < target) entries.push(createGroupingDraft(entries.length + 1));
    entries.forEach(ensureGroupingProfile);
    return entries;
  }

  function renderGroupingSlot(entry, basePath, index) {
    ensureGroupingProfile(entry);
    const image = entry.bild || entry.profil?.bild || groupingPlaceholderImage;
    const imageFormat = entry.bildFormat || entry.profil?.bildFormat || "portrait";
    const imageFit = entry.bildFit || entry.profil?.bildFit || "contain";
    return `
      <article class="grouping-slot" style="--grouping-image-ratio:${imageRatioValue(imageFormat)};--grouping-image-fit:${escapeAttr(imageFit)}">
        <button type="button" class="grouping-image" data-open-grouping="${escapeAttr(basePath)}" aria-label="Gruppierungsprofil öffnen">
          <img src="${escapeAttr(image)}" alt="${escapeAttr(entry.name || `Gruppierung ${index + 1}`)}" style="${imageStyle({ scale: entry.bildScale || entry.profil?.bildScale || 1 })}">
        </button>
        <div class="grouping-copy">
          <strong ${editableAttr(`${basePath}.name`)}>${escapeHtml(entry.name || `Gruppierung ${index + 1}`)}</strong>
          <span ${editableAttr(`${basePath}.typ`)}>${escapeHtml(entry.typ || "Gruppe / Orden / Gilde")}</span>
          <p ${editableAttr(`${basePath}.text`, "rich")}>${formatRichValue(entry.text || "Kurzbeschreibung ...")}</p>
        </div>
      </article>
    `;
  }

  function renderRelationGroups(groups, basePath) {
    if (!Array.isArray(groups) || groups.length === 0) return "";
    return groups.map((group, index) => `
      <details class="relation-disclosure">
        <summary ${editableAttr(`${basePath}.${index}.titel`)}>${escapeHtml(group.titel || "Beziehungen")}</summary>
        ${renderRelationTable(group, `${basePath}.${index}`)}
      </details>
    `).join("");
  }

  function renderRelationTable(group, basePath) {
    const entries = normalizeRelationEntries(group, basePath);
    return `
      <div class="relation-table">
        <div class="relation-table-title">Titel - (z. B. Liebesbeziehungen / Familie / Freunde)</div>
        <div class="relation-table-head"><span>Name & Beziehung</span><span>Beschreibung</span></div>
        ${entries.map((relation, index) => renderRelationSlot(relation, `${basePath}.eintraege.${index}`)).join("")}
        <button type="button" class="slot-add relation-slot-add" data-add-relation="${escapeAttr(basePath)}">+ Beziehungsslot</button>
      </div>
    `;
  }

  function normalizeRelationEntries(group, basePath) {
    if (!Array.isArray(group.eintraege)) setPath(data, `${basePath}.eintraege`, []);
    const entries = readPath(data, `${basePath}.eintraege`);
    const target = Math.max(Number(group.slots) || 0, entries.length);
    while (entries.length < target) {
      entries.push({ name: "Name", art: "Beziehung zur Person", bild: data.portrait?.src, bildScale: 1, text: "Beschreibung ..." });
    }
    return entries;
  }

  function renderRelationSlot(relation, basePath) {
    return `
      <article class="relation-slot">
        <div class="relation-person">
          <strong ${editableAttr(`${basePath}.art`)}>${escapeHtml(relation.art || "Beziehung zur Person")}</strong>
          ${relation.bild ? `<img src="${escapeAttr(relation.bild)}" alt="${escapeAttr(relation.name || "Name")}" style="${imageStyle({ scale: relation.bildScale || 1 })}">` : ""}
          <div class="edit-controls compact">
            <label>Bild <input value="${escapeAttr(relation.bild || "")}" data-input="${escapeAttr(`${basePath}.bild`)}"></label>
            <label>Skalierung <input type="range" min="0.5" max="2" step="0.05" value="${escapeAttr(relation.bildScale || 1)}" data-input="${escapeAttr(`${basePath}.bildScale`)}"></label>
          </div>
          <b ${editableAttr(`${basePath}.name`)}>${escapeHtml(relation.name || "Name")}</b>
        </div>
        <div class="relation-description"><div ${editableAttr(`${basePath}.text`, "rich")}>${formatRichValue(relation.text || "Beschreibung ...")}</div></div>
      </article>
    `;
  }

  function renderGallery() {
    let target = root.querySelector(".gallery-section");
    if (!target) {
      target = document.createElement("section");
      target.className = "content-section gallery-section";
      root.appendChild(target);
    }
    target.innerHTML = `
      <h2>Galerie</h2>
      <div class="gallery-grid">
        ${(data.galerie || []).map((img, index) => `
          <figure class="gallery-item">
            ${img.src ? `<button type="button" class="gallery-open" data-gallery-open="${index}" aria-label="Galeriebild öffnen"><img src="${escapeAttr(img.src)}" alt="${escapeAttr(img.alt || "")}" style="${imageStyle(img)}"></button>` : `<div class="image-placeholder">Bildlink eintragen</div>`}
            <div class="edit-controls">
              ${renderImageUrlControl("Bildlink", `galerie.${index}.src`, img.src || "")}
              <label>Alt-Text <input value="${escapeAttr(img.alt || "")}" data-input="galerie.${index}.alt"></label>
              <label>Skalierung <input type="range" min="0.5" max="2" step="0.05" value="${escapeAttr(img.scale || 1)}" data-input="galerie.${index}.scale"></label>
            </div>
            <figcaption ${editableAttr(`galerie.${index}.caption`, "rich")}>${formatRichValue(img.caption || "Bildbeschreibung")}</figcaption>
          </figure>
        `).join("")}
      </div>
    `;
  }

  function wireEditorEvents() {
    document.addEventListener("click", (event) => {
      const format = event.target.closest("[data-format]")?.dataset.format;
      if (format) {
        event.preventDefault();
        applyInlineFormat(format);
      }
      if (event.target.id === "edit-toggle") {
        editMode = !editMode;
        syncEditorToggle();
        signalEditFeedback(event.target, editMode ? "mode-on" : "mode-off");
        renderAll();
      }
      const nextEditorTab = event.target.closest("[data-steck-editor-tab]")?.dataset.steckEditorTab;
      if (nextEditorTab) {
        editorTab = nextEditorTab;
        renderEditorDock();
      }
      const editorAdd = event.target.closest("[data-editor-add]")?.dataset.editorAdd;
      if (editorAdd) {
        applyEditorAdd(editorAdd);
      }
      const editorAddRelation = event.target.closest("[data-editor-add-relation]")?.dataset.editorAddRelation;
      if (editorAddRelation) {
        applyEditorAddRelation(editorAddRelation);
      }
      const editorAddGrouping = event.target.closest("[data-editor-add-grouping]")?.dataset.editorAddGrouping;
      if (editorAddGrouping) {
        applyEditorAddGrouping(editorAddGrouping);
      }
      const editorAddInventoryCategory = event.target.closest("[data-editor-add-inventory-category]")?.dataset.editorAddInventoryCategory;
      if (editorAddInventoryCategory) {
        applyEditorAddInventoryCategory(editorAddInventoryCategory);
      }
      const editorAddInventoryItem = event.target.closest("[data-editor-add-inventory-item]")?.dataset.editorAddInventoryItem;
      if (editorAddInventoryItem) {
        applyEditorAddInventoryItem(editorAddInventoryItem);
      }
      const editorEnableCompanion = event.target.closest("[data-editor-enable-companion]")?.dataset.editorEnableCompanion;
      if (editorEnableCompanion) {
        applyEditorEnableCompanion(editorEnableCompanion);
      }
      const editorAddCompanionInfoRow = event.target.closest("[data-editor-add-companion-info-row]")?.dataset.editorAddCompanionInfoRow;
      if (editorAddCompanionInfoRow) {
        applyEditorAddCompanionInfoRow(editorAddCompanionInfoRow);
      }
      const editorAddCurrency = event.target.closest("[data-editor-add-currency]")?.dataset.editorAddCurrency;
      if (editorAddCurrency) {
        applyEditorAddCurrency(editorAddCurrency);
      }
      const editorAddRow = event.target.closest("[data-editor-add-row]")?.dataset.editorAddRow;
      if (editorAddRow) {
        applyEditorAddRow(editorAddRow);
      }
      const editorRemove = event.target.closest("[data-editor-remove]");
      if (editorRemove) {
        applyEditorRemove(editorRemove.dataset.editorRemove, Number(editorRemove.dataset.editorIndex));
      }
      const editorRemoveRow = event.target.closest("[data-editor-remove-row]");
      if (editorRemoveRow) {
        applyEditorRemove(editorRemoveRow.dataset.editorRemoveRow, Number(editorRemoveRow.dataset.editorIndex));
      }
      const editorMove = event.target.closest("[data-editor-move]");
      if (editorMove) {
        applyEditorMove(editorMove.dataset.editorMove, Number(editorMove.dataset.editorIndex), Number(editorMove.dataset.editorDir));
      }
      const editorRemoveRelationGroup = event.target.closest("[data-editor-remove-relation-group]")?.dataset.editorRemoveRelationGroup;
      if (editorRemoveRelationGroup) {
        applyEditorRemoveRelationGroup(editorRemoveRelationGroup);
      }
      if (event.target.id === "save-now") saveNow(true);
      if (event.target.id === "export-json") exportJson();
      if (event.target.id === "export-data-js") exportDataJs();
      if (event.target.id === "import-json-trigger") document.getElementById("import-json-file")?.click();
      if (event.target.id === "reset-local") resetLocalChanges();
      const clearImage = event.target.closest("[data-clear-image]")?.dataset.clearImage;
      if (clearImage) {
        setPath(data, clearImage, "");
        saveSoon();
        renderAllPreserveScroll();
      }
      if (event.target.id === "add-gallery-image") {
        data.galerie.push({ src: "", scale: 1, caption: "Bildbeschreibung" });
        saveSoon();
        renderAll();
      }
      const galleryIndex = event.target.closest("[data-gallery-open]")?.dataset.galleryOpen;
      if (galleryIndex !== undefined) {
        openGalleryModal(Number(galleryIndex));
      }
      if (event.target.dataset.galleryClose !== undefined || event.target.classList.contains("gallery-veil")) {
        document.querySelector(".gallery-veil")?.remove();
      }
      const companionPath = event.target.closest("[data-open-companion]")?.dataset.openCompanion;
      if (companionPath) {
        activeCompanionPath = companionPath;
        companionEditMode = false;
        renderCompanionModal(companionPath);
      }
      const groupingPath = event.target.closest("[data-open-grouping]")?.dataset.openGrouping;
      if (groupingPath) {
        activeGroupingPath = groupingPath;
        groupingEditMode = false;
        renderGroupingModal(groupingPath);
      }
      if (event.target.dataset.companionClose !== undefined || event.target.classList.contains("companion-veil")) {
        document.querySelector(".companion-veil")?.remove();
        activeCompanionPath = "";
        companionEditMode = false;
      }
      if (event.target.dataset.groupingClose !== undefined || event.target.classList.contains("grouping-veil")) {
        document.querySelector(".grouping-veil")?.remove();
        activeGroupingPath = "";
        groupingEditMode = false;
      }
      if (event.target.dataset.companionToggle !== undefined && activeCompanionPath) {
        companionEditMode = !companionEditMode;
        renderCompanionModal(activeCompanionPath);
      }
      if (event.target.dataset.groupingToggle !== undefined && activeGroupingPath) {
        groupingEditMode = !groupingEditMode;
        renderGroupingModal(activeGroupingPath);
      }
      if (event.target.dataset.companionSave !== undefined) saveNow(true);
      if (event.target.dataset.groupingSave !== undefined) saveNow(true);
      const addCompanionInfo = event.target.dataset.addCompanionInfo;
      if (addCompanionInfo) {
        const list = readPath(data, addCompanionInfo);
        if (Array.isArray(list)) list.push(["Feld", "-"]);
        saveSoon();
        if (activeCompanionPath) renderCompanionModal(activeCompanionPath);
      }
      const addList = event.target.dataset.addList;
      if (addList) {
        const list = readPath(data, addList);
        if (Array.isArray(list)) list.push("...");
        saveSoon();
        renderAll();
      }
      const removeList = event.target.dataset.removeList;
      if (removeList) {
        const list = readPath(data, removeList);
        const index = Number(event.target.dataset.removeIndex);
        if (Array.isArray(list) && list.length > 1) list.splice(index, 1);
        saveSoon();
        renderAll();
      }
      const addInventory = event.target.dataset.addInventory;
      if (addInventory) {
        const list = readPath(data, addInventory);
        if (Array.isArray(list)) {
          const categoryPath = addInventory.replace(/\.eintraege$/, "");
          const categoryTitle = readPath(data, `${categoryPath}.titel`) || "";
          const nextItem = {
            name: "Neuer Gegenstand",
            icon: "",
            iconScale: 1,
            beschreibung: "Beschreibung.",
            werte: { staerke: 0, geschick: 0, magie: 0 }
          };
          if (/reittier|begleiter|gefährte|gefaehrte/i.test(categoryTitle)) {
            nextItem.name = "Neuer Gefährte";
            nextItem.werte = null;
            ensureCompanionProfile(nextItem);
          }
          list.push(nextItem);
        }
        saveSoon();
        renderAll();
      }
      const addRelation = event.target.dataset.addRelation;
      if (addRelation) {
        const list = readPath(data, `${addRelation}.eintraege`);
        if (Array.isArray(list)) {
          list.push({ name: "Name", art: "Beziehung zur Person", bild: data.portrait?.src, bildScale: 1, text: "Beschreibung ..." });
          const slots = readPath(data, `${addRelation}.slots`) || 0;
          setPath(data, `${addRelation}.slots`, Math.max(slots, list.length));
        }
        saveSoon();
        renderAll();
      }
    });

    document.addEventListener("pointerdown", (event) => {
      const splitter = event.target.closest("[data-editor-splitter]");
      if (!splitter || !editMode) return;
      event.preventDefault();
      splitterDrag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startWidth: getEditorWidth()
      };
      splitter.setPointerCapture?.(event.pointerId);
      document.body.classList.add("is-resizing-editor");
    });

    document.addEventListener("pointermove", (event) => {
      if (!splitterDrag || event.pointerId !== splitterDrag.pointerId) return;
      const nextWidth = splitterDrag.startWidth + event.clientX - splitterDrag.startX;
      setEditorWidth(nextWidth);
    });

    document.addEventListener("pointerup", (event) => {
      if (!splitterDrag || event.pointerId !== splitterDrag.pointerId) return;
      splitterDrag = null;
      document.body.classList.remove("is-resizing-editor");
      persistEditorLayout();
    });

    document.addEventListener("keydown", (event) => {
      const splitter = event.target.closest("[data-editor-splitter]");
      if (!splitter || !editMode) return;
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "Home") setEditorWidth(420);
      else if (event.key === "End") setEditorWidth(window.innerWidth - 420);
      else setEditorWidth(getEditorWidth() + (event.key === "ArrowRight" ? 24 : -24));
      persistEditorLayout();
    });

    document.addEventListener("input", (event) => {
      const target = event.target;
      if (target.dataset.edit) {
        activeEditable = target;
        const raw = target.dataset.type === "rich" ? target.innerHTML : target.textContent;
        setPath(data, target.dataset.edit, castValue(raw, target.dataset.type));
        signalEditFeedback(target);
        saveSoon();
      }
      if (target.dataset.input) {
        setPath(data, target.dataset.input, castInputValue(target));
        signalEditFeedback(target);
        if (target.dataset.imageUrl !== undefined) updateImageFieldStatus(target);
        saveSoon();
        if (target.closest(".steckbrief-editor-dock")) renderPreviewFromDockInput(target);
        if (target.type === "range") {
          applyLiveRangeUpdate(target);
          if (target.closest(".companion-modal") && activeCompanionPath) renderCompanionModal(activeCompanionPath);
          if (target.closest(".grouping-modal") && activeGroupingPath) renderGroupingModal(activeGroupingPath);
        }
        if (target.tagName === "SELECT") renderAllPreserveScroll();
      }
    });

    document.addEventListener("change", (event) => {
      const target = event.target;
      if (!target.dataset.input) return;
      setPath(data, target.dataset.input, castInputValue(target));
      if (target.dataset.imageUrl !== undefined) updateImageFieldStatus(target);
      saveSoon();
      if (target.closest(".steckbrief-editor-dock")) {
        renderAllPreserveScroll();
        renderEditorDock();
        return;
      }
      if (target.closest(".companion-modal") && activeCompanionPath) renderCompanionModal(activeCompanionPath);
      else if (target.closest(".grouping-modal") && activeGroupingPath) renderGroupingModal(activeGroupingPath);
      else renderAllPreserveScroll();
    });

    document.addEventListener("focusin", (event) => {
      if (event.target.dataset.edit) activeEditable = event.target;
    });

    document.addEventListener("blur", (event) => {
      if (event.target.dataset.edit) renderAllPreserveScroll();
    }, true);

    document.getElementById("import-json-file")?.addEventListener("change", importJsonFile);
    window.addEventListener("resize", () => {
      setEditorWidth(getEditorWidth());
      syncColumnHeight();
    });
    window.addEventListener("beforeunload", warnBeforeUnload);
  }

  function warnBeforeUnload(event) {
    if (!dirty && !saving && !saveQueued) return;
    event.preventDefault();
    event.returnValue = "";
  }

  function applyEditorAdd(kind) {
    if (kind === "hierarchy-row") {
      if (!Array.isArray(data.hierarchie)) data.hierarchie = [];
      data.hierarchie.push({ typ: "Ebene", name: "Neuer Ort", slug: makeFileSlug("neuer-ort") });
    }
    if (kind === "fact-group") {
      if (!Array.isArray(data.fakten)) data.fakten = [];
      data.fakten.push({ titel: "Neue Faktengruppe", eintraege: [["Feld", "-"]] });
    }
    if (kind === "section") {
      if (!Array.isArray(data.sektionen)) data.sektionen = [];
      const next = data.sektionen.length + 1;
      data.sektionen.push({ id: `sektion-${next}`, titel: "Neue Sektion", text: "Text ..." });
    }
    if (kind === "relation-group") {
      const section = ensureRelationsSection();
      if (!Array.isArray(section.beziehungsgruppen)) section.beziehungsgruppen = [];
      section.beziehungsgruppen.push({ titel: "Neue Beziehungsgruppe", slots: 1, eintraege: [createRelationDraft()] });
    }
    if (kind === "gallery-image") {
      if (!Array.isArray(data.galerie)) data.galerie = [];
      data.galerie.push({ src: "", alt: "", scale: 1, caption: "Bildbeschreibung" });
    }
    saveSoon();
    renderAllPreserveScroll();
    renderEditorDock();
  }

  function applyEditorAddRelation(path) {
    const group = readPath(data, path);
    if (!group) return;
    if (!Array.isArray(group.eintraege)) group.eintraege = [];
    group.eintraege.push(createRelationDraft());
    group.slots = Math.max(Number(group.slots) || 0, group.eintraege.length);
    saveSoon();
    renderAllPreserveScroll();
    renderEditorDock();
  }

  function applyEditorAddGrouping(path) {
    const grouping = readPath(data, path);
    if (!grouping) return;
    if (!Array.isArray(grouping.eintraege)) grouping.eintraege = [];
    grouping.eintraege.push(createGroupingDraft(grouping.eintraege.length + 1));
    grouping.slots = Math.max(Number(grouping.slots) || 5, grouping.eintraege.length);
    saveSoon();
    renderAllPreserveScroll();
    renderEditorDock();
  }

  function applyEditorAddInventoryCategory(path) {
    const inventory = readPath(data, path);
    if (!inventory) return;
    if (!Array.isArray(inventory.kategorien)) inventory.kategorien = [];
    inventory.kategorien.push(createInventoryCategoryDraft());
    saveSoon();
    renderAllPreserveScroll();
    renderEditorDock();
  }

  function applyEditorAddInventoryItem(path) {
    const category = readPath(data, path);
    if (!category) return;
    if (!Array.isArray(category.eintraege)) category.eintraege = [];
    const companionCategory = /reittier|begleiter|gefährte|gefaehrte/i.test(category.titel || "");
    const item = createInventoryItemDraft(companionCategory);
    category.eintraege.push(item);
    saveSoon();
    renderAllPreserveScroll();
    renderEditorDock();
  }

  function applyEditorEnableCompanion(path) {
    const item = readPath(data, path);
    if (!item) return;
    item.werte = null;
    ensureCompanionProfile(item);
    saveSoon();
    renderAllPreserveScroll();
    renderEditorDock();
  }

  function applyEditorAddCompanionInfoRow(path) {
    const item = readPath(data, path);
    if (!item) return;
    const profile = ensureCompanionProfile(item);
    if (!Array.isArray(profile.info)) profile.info = [];
    profile.info.push(["Feld", "-"]);
    saveSoon();
    renderAllPreserveScroll();
    renderEditorDock();
  }

  function applyEditorAddCurrency(path) {
    const purse = readPath(data, path);
    if (!purse) return;
    if (!Array.isArray(purse.waehrungen)) purse.waehrungen = [];
    purse.waehrungen.push({ name: "Neue Waehrung", icon: "", anzahl: "0" });
    saveSoon();
    renderAllPreserveScroll();
    renderEditorDock();
  }

  function applyEditorAddRow(path) {
    const list = readPath(data, path);
    if (!Array.isArray(list)) return;
    list.push(["Feld", "-"]);
    saveSoon();
    renderAllPreserveScroll();
    renderEditorDock();
  }

  function applyEditorRemove(path, index) {
    const list = readPath(data, path);
    if (!Array.isArray(list) || !Number.isInteger(index)) return;
    if (list.length <= 1 && (path === "fakten" || path === "sektionen")) return;
    list.splice(index, 1);
    saveSoon();
    renderAllPreserveScroll();
    renderEditorDock();
  }

  function applyEditorMove(path, index, direction) {
    const list = readPath(data, path);
    if (!Array.isArray(list) || !Number.isInteger(index) || !direction) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(nextIndex, 0, item);
    saveSoon();
    renderAllPreserveScroll();
    renderEditorDock();
  }

  function applyEditorRemoveRelationGroup(path) {
    const parts = String(path || "").split(".");
    const groupIndex = Number(parts.pop());
    const groupsPath = parts.join(".");
    const groups = readPath(data, groupsPath);
    if (!Array.isArray(groups) || !Number.isInteger(groupIndex)) return;
    groups.splice(groupIndex, 1);
    saveSoon();
    renderAllPreserveScroll();
    renderEditorDock();
  }

  function renderPreviewFromDockInput(input) {
    const preview = root;
    const scrollTop = preview.scrollTop;
    renderAll();
    preview.scrollTop = scrollTop;
    if (input.dataset.imageUrl !== undefined) refreshImageFieldStatuses(document.querySelector(".steckbrief-editor-dock") || document);
  }

  function collectRelationEditorGroups() {
    const sections = Array.isArray(data.sektionen) ? data.sektionen : [];
    const groups = [];
    sections.forEach((section, sectionIndex) => {
      if (!Array.isArray(section.beziehungsgruppen)) return;
      section.beziehungsgruppen.forEach((group, groupIndex) => {
        groups.push({
          section,
          group,
          sectionIndex,
          groupIndex,
          path: `sektionen.${sectionIndex}.beziehungsgruppen.${groupIndex}`
        });
      });
    });
    return groups;
  }

  function ensureGroupingEditorTarget() {
    const section = ensureGroupingSection();
    const sectionIndex = data.sektionen.indexOf(section);
    return {
      section,
      grouping: section.gruppierungen,
      path: `sektionen.${sectionIndex}.gruppierungen`
    };
  }

  function ensureInventoryEditorTarget() {
    if (!Array.isArray(data.sektionen)) data.sektionen = [];
    let section = data.sektionen.find((item) => item.inventar);
    if (!section) {
      section = {
        id: "inventar",
        titel: "Inventar",
        inventar: {
          titel: "Inventar",
          kategorien: [createInventoryCategoryDraft()],
          geldboerse: { bild: "", waehrungen: [] }
        }
      };
      data.sektionen.push(section);
    }
    if (!section.inventar.kategorien) section.inventar.kategorien = [];
    if (!section.inventar.geldboerse) section.inventar.geldboerse = { bild: "", waehrungen: [] };
    return {
      section,
      inventory: section.inventar,
      path: `sektionen.${data.sektionen.indexOf(section)}.inventar`
    };
  }

  function createInventoryCategoryDraft() {
    return {
      titel: "Neue Kategorie",
      eintraege: [createInventoryItemDraft(false)]
    };
  }

  function createInventoryItemDraft(isCompanion = false) {
    const item = {
      name: isCompanion ? "Neuer Gefaehrte" : "Neuer Gegenstand",
      icon: "",
      iconScale: 1,
      beschreibung: "Beschreibung.",
      werte: isCompanion ? null : { staerke: 0, geschick: 0, magie: 0 }
    };
    if (isCompanion) ensureCompanionProfile(item);
    return item;
  }

  function parentPath(path) {
    return String(path || "").split(".").slice(0, -1).join(".");
  }

  function ensureRelationsSection() {
    if (!Array.isArray(data.sektionen)) data.sektionen = [];
    let section = data.sektionen.find((item) => Array.isArray(item.beziehungsgruppen));
    if (!section) {
      section = { id: "beziehungen", titel: "Beziehungen", beziehungsgruppen: [] };
      data.sektionen.push(section);
    }
    return section;
  }

  function createRelationDraft() {
    return {
      name: "Name",
      art: "Beziehung zur Person",
      bild: data.portrait?.src || "",
      bildScale: 1,
      text: "Beschreibung ..."
    };
  }

  function syncColumnHeight() {
    const sidebar = root.querySelector(".profile-sidebar");
    const main = root.querySelector(".profile-main");
    const lastSection = root.querySelector(".section-stack .content-section:last-child");
    if (!sidebar || !main || !lastSection) return;

    if (window.innerWidth <= 900) {
      lastSection.style.minHeight = "";
      return;
    }

    lastSection.style.minHeight = "";
    requestAnimationFrame(() => {
      const sidebarBottom = sidebar.getBoundingClientRect().bottom;
      const sectionTop = lastSection.getBoundingClientRect().top;
      const needed = Math.max(lastSection.offsetHeight, Math.ceil(sidebarBottom - sectionTop));
      lastSection.style.minHeight = `${needed}px`;
    });
  }

  function openGalleryModal(index) {
    const img = data.galerie?.[index];
    if (!img?.src) return;
    let modal = document.querySelector(".gallery-veil");
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "gallery-veil";
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <figure class="gallery-modal" role="dialog" aria-modal="true" aria-label="Galeriebild">
        <button type="button" class="gallery-close" data-gallery-close>Schließen</button>
        <img src="${escapeAttr(img.src)}" alt="${escapeAttr(img.alt || img.caption || "Galeriebild")}">
        ${img.caption ? `<figcaption>${formatRichValue(img.caption)}</figcaption>` : ""}
      </figure>
    `;
  }

  function refreshImageFieldStatuses(scope = document) {
    scope.querySelectorAll("[data-image-url]").forEach((input) => updateImageFieldStatus(input, true));
  }

  function updateImageFieldStatus(input, quiet = false) {
    const control = input.closest(".image-url-control");
    const status = control?.querySelector("[data-image-status]");
    const preview = control?.querySelector("[data-image-preview]");
    if (!status) return;
    const url = String(input.value || "").trim();
    if (preview) preview.innerHTML = "";
    if (!url) {
      status.textContent = "leer";
      status.dataset.state = "empty";
      return;
    }
    if (!isLikelyImageUrl(url)) {
      status.textContent = "prüfen";
      status.dataset.state = "warning";
      return;
    }
    status.textContent = "lädt...";
    status.dataset.state = "loading";
    const probe = new Image();
    probe.onload = () => {
      if (input.value.trim() !== url) return;
      if (preview) {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "";
        preview.replaceChildren(img);
      }
      status.textContent = `${probe.naturalWidth}×${probe.naturalHeight}`;
      status.dataset.state = "ok";
    };
    probe.onerror = () => {
      if (input.value.trim() !== url) return;
      status.textContent = "Bild lädt nicht";
      status.dataset.state = "error";
      if (!quiet) setSaveState("Bildlink prüfen");
    };
    probe.src = url;
  }

  function isLikelyImageUrl(url) {
    if (/^https?:\/\/.+/i.test(url)) return true;
    if (/^data:image\//i.test(url)) return true;
    if (/^\.{0,2}\//.test(url)) return true;
    return /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(url);
  }

  function normalizeLink(value) {
    const link = String(value || "").trim();
    if (!link) return "";
    if (/^(https?:\/\/|\/|\.{1,2}\/|#)/i.test(link)) return link;
    return `https://${link}`;
  }

  function renderAllPreserveScroll() {
    const x = window.scrollX;
    const y = window.scrollY;
    const previewScrollTop = root?.scrollTop || 0;
    renderAll();
    requestAnimationFrame(() => {
      window.scrollTo(x, y);
      if (root) root.scrollTop = previewScrollTop;
    });
  }

  function restoreEditorLayout() {
    const stored = Number(localStorage.getItem(editorLayoutKey));
    if (Number.isFinite(stored) && stored > 0) setEditorWidth(stored);
    else setEditorWidth(getEditorWidth());
  }

  function persistEditorLayout() {
    localStorage.setItem(editorLayoutKey, String(getEditorWidth()));
  }

  function getEditorWidth() {
    const configured = getComputedStyle(document.body).getPropertyValue("--steck-editor-width").trim();
    const parsed = Number.parseFloat(configured);
    if (Number.isFinite(parsed)) return parsed;
    return Math.min(760, Math.max(480, window.innerWidth * 0.48));
  }

  function setEditorWidth(width) {
    const max = Math.max(420, window.innerWidth - 420);
    const next = Math.round(Math.min(max, Math.max(420, Number(width) || 720)));
    document.body.style.setProperty("--steck-editor-width", `${next}px`);
    document.querySelector("[data-editor-splitter]")?.setAttribute("aria-valuenow", String(next));
  }

  function editableAttr(path, type = "text") {
    return `contenteditable="${editMode}" data-edit="${escapeAttr(path)}" data-type="${escapeAttr(type)}" spellcheck="true"`;
  }

  function companionEditableAttr(path, type = "text") {
    return `contenteditable="${companionEditMode}" data-edit="${escapeAttr(path)}" data-type="${escapeAttr(type)}" spellcheck="true"`;
  }

  function groupingEditableAttr(path, type = "text") {
    return `contenteditable="${groupingEditMode}" data-edit="${escapeAttr(path)}" data-type="${escapeAttr(type)}" spellcheck="true"`;
  }

  function makeEditable(node, path, type) {
    node.contentEditable = String(editMode);
    node.dataset.edit = path;
    node.dataset.type = type;
    node.spellcheck = true;
  }

  function imageStyle(image) {
    const scale = Number(image.scale || 1);
    const fit = image.fit ? `object-fit:${escapeAttr(image.fit)};` : "";
    return `transform:scale(${scale});transform-origin:center;${fit}`;
  }

  function imageRatioValue(format) {
    const ratios = {
      square: "1 / 1",
      portrait: "3 / 4",
      tall: "2 / 3",
      wide: "4 / 3",
      banner: "16 / 9",
      original: "auto"
    };
    return ratios[format] || ratios.square;
  }

  function renderImageFormatOptions(selected) {
    return renderSelectOptions([
      ["square", "Quadrat 1:1"],
      ["portrait", "Portrait 3:4"],
      ["tall", "Hoch 2:3"],
      ["wide", "Breit 4:3"],
      ["banner", "Banner 16:9"],
      ["original", "Original"]
    ], selected);
  }

  function renderSelectOptions(options, selected) {
    return options.map(([value, label]) => `<option value="${escapeAttr(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
  }

  function applyLiveRangeUpdate(input) {
    if (!/(\.|^)(scale|bildScale|iconScale)$/i.test(input.dataset.input || "")) return;
    const scale = Number(input.value || 1) || 1;
    const scope = input.closest("figure, .hero-wappen, .portrait-panel, .inventory-item-head, .relation-person, .gallery-item, .purse-bag");
    const img = scope?.querySelector("img");
    if (img) img.style.transform = `scale(${scale})`;
  }

  function applyInlineFormat(format) {
    const active = activeEditable || document.activeElement;
    if (!active?.dataset?.edit) return;
    active.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    const tag = format === "bold" ? "strong" : format === "italic" ? "em" : "u";
    const range = selection.getRangeAt(0);
    const wrapper = document.createElement(tag);
    try {
      wrapper.appendChild(range.extractContents());
      range.insertNode(wrapper);
      selection.removeAllRanges();
      const nextRange = document.createRange();
      nextRange.selectNodeContents(wrapper);
      selection.addRange(nextRange);
    } catch {
      return;
    }

    const raw = active.dataset.type === "rich" ? active.innerHTML : active.textContent;
    setPath(data, active.dataset.edit, castValue(raw, active.dataset.type));
    signalEditFeedback(active, "format");
    saveSoon();
  }

  function hasTextBlock(value) {
    if (Array.isArray(value)) return value.some(hasValue);
    return hasValue(value);
  }

  function formatRichValue(value) {
    if (Array.isArray(value)) return value.map((entry) => formatRichValue(entry)).join("<br>");
    const text = String(value ?? "");
    if (/<\/?[a-z][\s\S]*>/i.test(text)) return sanitizeRich(text);
    return escapeHtml(text);
  }

  function sanitizeRich(html) {
    const template = document.createElement("template");
    template.innerHTML = String(html || "");
    template.content.querySelectorAll("*").forEach((node) => {
      const allowed = ["B", "STRONG", "I", "EM", "U", "BR", "DIV", "P", "SPAN"];
      if (!allowed.includes(node.tagName)) {
        node.replaceWith(document.createTextNode(node.textContent || ""));
        return;
      }
      [...node.attributes].forEach((attr) => node.removeAttribute(attr.name));
    });
    return template.innerHTML;
  }

  function ensureGroupingSection() {
    if (!Array.isArray(data.sektionen)) data.sektionen = [];
    let section = data.sektionen.find((item) => item.id === "gruppierungen" || item.gruppierungen);
    if (!section) {
      section = {
        id: "gruppierungen",
        titel: "Gruppierungen",
        gruppierungen: createGroupingTable()
      };
      const relationsIndex = data.sektionen.findIndex((item) => item.id === "beziehungen" || item.beziehungsgruppen);
      const triviaIndex = data.sektionen.findIndex((item) => item.id === "trivia");
      const insertIndex = relationsIndex >= 0 ? relationsIndex : triviaIndex >= 0 ? triviaIndex + 1 : data.sektionen.length;
      data.sektionen.splice(insertIndex, 0, section);
    }
    if (!section.gruppierungen) section.gruppierungen = createGroupingTable();
    normalizeGroupingEntries(section.gruppierungen, `sektionen.${data.sektionen.indexOf(section)}.gruppierungen`);
    return section;
  }

  function createGroupingTable() {
    return {
      titel: "Gruppierungen",
      slots: 5,
      eintraege: Array.from({ length: 5 }, (_, index) => createGroupingDraft(index + 1))
    };
  }

  function createGroupingDraft(index = 1) {
    return {
      name: `Gruppierung ${index}`,
      typ: "Gilde / Orden / Trupp",
      bild: groupingPlaceholderImage,
      bildScale: 1,
      bildFormat: "portrait",
      bildFit: "contain",
      text: "Kurzbeschreibung ...",
      profil: {
        name: `Gruppierung ${index}`,
        art: "Gilde / Orden / Trupp",
        bild: groupingPlaceholderImage,
        link: "",
        bildScale: 1,
        bildFormat: "portrait",
        bildFit: "contain",
        kurztext: "Kurze Beschreibung der Gruppierung.",
        beschreibung: "Ausfuehrliche Beschreibung: Ziele, Aufbau, Stellung zur Figur, Einfluss und Geschichte.",
        sitz: "-",
        anfuehrer: "-",
        info: [
          ["Name", `Gruppierung ${index}`],
          ["Typ", "Gilde / Orden / Trupp"],
          ["Sitz", "-"],
          ["Anfuehrer", "-"],
          ["Mitglieder", "-"],
          ["Beziehung", "-"]
        ],
        attribute: normalizeGroupingAttributes()
      }
    };
  }

  function ensureGroupingProfile(entry) {
    if (!entry.profil) entry.profil = {};
    entry.bildFormat ||= entry.profil.bildFormat || "portrait";
    entry.bildFit ||= entry.profil.bildFit || "contain";
    entry.profil.name ||= entry.name || "Gruppierung";
    entry.profil.art ||= entry.typ || "Gilde / Orden / Trupp";
    entry.profil.bild ||= entry.bild || groupingPlaceholderImage;
    entry.profil.link ||= entry.link || "";
    entry.profil.bildScale ||= entry.bildScale || 1;
    entry.profil.bildFormat ||= entry.bildFormat || "portrait";
    entry.profil.bildFit ||= entry.bildFit || "contain";
    entry.profil.kurztext ||= entry.text || "Kurze Beschreibung der Gruppierung.";
    entry.profil.beschreibung ||= "Ausfuehrliche Beschreibung: Ziele, Aufbau, Stellung zur Figur, Einfluss und Geschichte.";
    entry.profil.sitz ||= "-";
    entry.profil.anfuehrer ||= "-";
    if (!Array.isArray(entry.profil.info)) {
      entry.profil.info = [
        ["Name", entry.profil.name],
        ["Typ", entry.profil.art],
        ["Sitz", entry.profil.sitz],
        ["Anfuehrer", entry.profil.anfuehrer],
        ["Mitglieder", "-"],
        ["Beziehung", "-"]
      ];
    }
    entry.profil.attribute = normalizeGroupingAttributes(entry.profil.attribute);
    return entry.profil;
  }

  function normalizeGroupingAttributes(attributes) {
    const defaults = [
      ["Einfluss", 5],
      ["Ressourcen", 5],
      ["Struktur", 5],
      ["Geheimhaltung", 5],
      ["Konfliktkraft", 5],
      ["Loyalitaet", 5]
    ];
    if (!Array.isArray(attributes) || attributes.length < 3) return defaults;
    return attributes.map((entry, index) => {
      const label = Array.isArray(entry) ? entry[0] : defaults[index]?.[0] || "Wert";
      const value = Array.isArray(entry) ? entry[1] : 5;
      return [label || defaults[index]?.[0] || "Wert", Math.max(0, Math.min(10, Number(value) || 0))];
    });
  }

  function ensureGallery() {
    if (!Array.isArray(data.galerie)) {
      data.galerie = [
        { src: data.portrait?.src || "", scale: 1, caption: "Galeriebild" }
      ];
    }
  }

  function migrateLegacyPortrait(local, base) {
    if (local.wappen || !local.portrait?.src || !base?.portrait?.src) return;
    if (local.portrait.src === base.portrait.src) return;
    local.wappen = {
      src: local.portrait.src,
      alt: local.portrait.alt || "Wappen",
      scale: local.portrait.scale || 1
    };
    delete local.portrait;
  }

  function exportJson() {
    flushPendingSave();
    const payload = {
      format: "aleria-steckbrief",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: clone(data)
    };
    downloadText(`${makeFileSlug(data.name?.vollstaendig || data.meta?.id || "steckbrief")}.json`, JSON.stringify(payload, null, 2), "application/json");
    setSaveState("JSON exportiert");
    signalEditFeedback(document.getElementById("export-json"), "format");
  }

  function exportDataJs() {
    flushPendingSave();
    const js = `window.STECKBRIEF_DATA = ${JSON.stringify(data, null, 2)};\n`;
    downloadText(`${makeFileSlug(data.name?.vollstaendig || data.meta?.id || "steckbrief")}.data.js`, js, "text/javascript");
    setSaveState("Data JS exportiert");
    signalEditFeedback(document.getElementById("export-data-js"), "format");
  }

  function importJsonFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    flushPendingSave();
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ""));
        const imported = normalizeImportedPayload(parsed);
        if (!confirm(buildImportPreview(imported))) {
          setSaveState("Import abgebrochen");
          return;
        }
        exportBackup("backup-vor-import");
        data = mergeData(baseData, imported);
        ensureGroupingSection();
        ensureGallery();
        document.querySelector(".companion-veil")?.remove();
        document.querySelector(".grouping-veil")?.remove();
        activeCompanionPath = "";
        companionEditMode = false;
        activeGroupingPath = "";
        groupingEditMode = false;
        dirty = true;
        saveNow();
        renderAll();
        setSaveState("JSON importiert");
        signalEditFeedback(document.getElementById("import-json-trigger"), "format");
      } catch (error) {
        console.error(error);
        setSaveState("Import fehlgeschlagen");
        alert(`Die JSON-Datei konnte nicht als Steckbrief importiert werden.\n\n${error.message || "Unbekannter Fehler"}`);
      }
    };
    reader.onerror = () => {
      setSaveState("Import fehlgeschlagen");
      alert("Die JSON-Datei konnte nicht gelesen werden.");
    };
    reader.readAsText(file, "utf-8");
  }

  function normalizeImportedPayload(payload) {
    const imported = payload?.format === "aleria-steckbrief" ? payload.data : payload;
    if (!imported || typeof imported !== "object" || Array.isArray(imported)) {
      throw new Error("Ungueltiges Steckbrief-JSON");
    }
    if (!imported.meta && !imported.name && !imported.sektionen && !imported.fakten) {
      throw new Error("JSON enthaelt keine Steckbriefdaten");
    }
    const normalized = clone(imported);
    validateImportedData(normalized);
    return normalized;
  }

  function validateImportedData(imported) {
    if (imported.meta && typeof imported.meta !== "object") throw new Error("meta muss ein Objekt sein");
    if (imported.name && typeof imported.name !== "object") throw new Error("name muss ein Objekt sein");
    if (imported.fakten && !Array.isArray(imported.fakten)) throw new Error("fakten muss eine Liste sein");
    if (imported.sektionen && !Array.isArray(imported.sektionen)) throw new Error("sektionen muss eine Liste sein");
    if (imported.hierarchie && !Array.isArray(imported.hierarchie)) throw new Error("hierarchie muss eine Liste sein");
    if (imported.galerie && !Array.isArray(imported.galerie)) throw new Error("galerie muss eine Liste sein");
  }

  function buildImportPreview(imported) {
    const currentName = data.name?.vollstaendig || data.meta?.id || "aktueller Steckbrief";
    const importName = imported.name?.vollstaendig || [imported.name?.vorname, imported.name?.nachname].filter(Boolean).join(" ") || imported.meta?.id || "unbekannt";
    const importId = imported.meta?.id || "-";
    const currentId = data.meta?.id || "-";
    const sections = Array.isArray(imported.sektionen) ? imported.sektionen.length : "aus Vorlage";
    const facts = Array.isArray(imported.fakten) ? imported.fakten.length : "aus Vorlage";
    const origin = findFactValue(imported, "Herkunft") || "-";
    const family = findFactValue(imported, "Familie") || "-";
    const idWarning = importId !== "-" && currentId !== "-" && importId !== currentId
      ? "\n\nAchtung: Die Import-ID unterscheidet sich vom aktuellen Steckbrief."
      : "";

    return [
      "Diese JSON-Datei wird importiert:",
      "",
      `Import: ${importName}`,
      `Import-ID: ${importId}`,
      `Aktuell: ${currentName}`,
      `Aktuelle ID: ${currentId}`,
      `Herkunft: ${origin}`,
      `Familie: ${family}`,
      `Sektionen: ${sections}`,
      `Faktengruppen: ${facts}`,
      "",
      "Vor dem Überschreiben wird automatisch ein Backup als JSON heruntergeladen.",
      "Import wirklich fortsetzen?",
      idWarning
    ].join("\n");
  }

  function findFactValue(source, label) {
    const groups = Array.isArray(source.fakten) ? source.fakten : [];
    for (const group of groups) {
      const rows = Array.isArray(group.eintraege) ? group.eintraege : [];
      const row = rows.find((entry) => Array.isArray(entry) && entry[0] === label);
      if (row) return row[1];
    }
    return "";
  }

  function ensureCompanionProfile(item) {
    if (!item.profil) item.profil = {};
    const profile = item.profil;
    if (!profile.name) profile.name = item.name || "Gefährte";
    if (!profile.art) profile.art = "Tier / Begleiter";
    if (!profile.bild) profile.bild = item.icon || data.portrait?.src || "";
    if (!profile.bildScale) profile.bildScale = 1;
    if (!profile.bildFormat) profile.bildFormat = "square";
    if (!profile.bildFit) profile.bildFit = "contain";
    if (!profile.kurztext) profile.kurztext = "Kurze Beschreibung des Gefährten.";
    if (!profile.beschreibung) profile.beschreibung = "Ausführliche Beschreibung, Wesen, Bindung zur Figur, Eigenheiten, Ausbildung und Geschichte.";
    if (!Array.isArray(profile.info)) {
      profile.info = [
        ["Name", profile.name],
        ["Art", profile.art],
        ["Rasse", "-"],
        ["Alter", "-"],
        ["Besitzer", "-"],
        ["Rolle", "-"]
      ];
    }
    profile.attribute = normalizeCompanionAttributes(profile.attribute);
    return profile;
  }

  function normalizeCompanionAttributes(attributes) {
    const defaults = [
      ["Schnelligkeit", 5],
      ["Ausdauer", 5],
      ["Stärke", 5],
      ["Agilität", 5],
      ["Sozialverhalten", 5],
      ["Robustheit", 5]
    ];
    if (!Array.isArray(attributes) || attributes.length < 3) return defaults;
    return attributes.map((entry, index) => {
      const label = Array.isArray(entry) ? entry[0] : defaults[index]?.[0] || "Attribut";
      const value = Array.isArray(entry) ? entry[1] : 5;
      return [label || defaults[index]?.[0] || "Attribut", Math.max(0, Math.min(10, Number(value) || 0))];
    });
  }

  function saveSoon() {
    dirty = true;
    setSaveState("ungespeichert");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 700);
  }

  async function saveNow(closeEditor = false) {
    if (closeEditor) closeAfterSave = true;
    if (saving) {
      saveQueued = true;
      return;
    }
    saving = true;
    saveQueued = false;
    setEditorBusy(true);
    setSaveState("speichere...");
    saveLocal();
    let finalState = "Notfallkopie lokal gespeichert";
    if (window.SteckbriefFirebase) {
      try {
        await window.SteckbriefFirebase.save(data);
        remoteReady = true;
        dirty = false;
        finalState = "global gespeichert";
      } catch (error) {
        console.error(error);
        finalState = "Notfallkopie lokal gespeichert, globaler Speicher Fehler";
      } finally {
        finishSave(finalState);
      }
      return;
    }
    dirty = false;
    finishSave(finalState);
  }

  function finishSave(finalState) {
    saving = false;
    setEditorBusy(false);
    if (saveQueued || dirty) {
      saveQueued = false;
      saveSoon();
      return;
    }
    setSaveState(finalState);
    if (closeAfterSave) {
      closeAfterSave = false;
      closeEditorAfterSave();
    }
  }

  function saveLocal() {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  function resetLocalChanges() {
    if (!loadLocal()) {
      setSaveState("keine lokalen Änderungen");
      return;
    }
    if (!confirm("Lokale Notfallkopie fuer diesen Steckbrief wirklich verwerfen? Vorher wird automatisch ein Backup als JSON heruntergeladen.")) return;
    flushPendingSave();
    exportBackup("backup-vor-reset");
    localStorage.removeItem(storageKey);
    data = clone(baseData);
    ensureGroupingSection();
    ensureGallery();
    dirty = false;
    document.querySelector(".companion-veil")?.remove();
    document.querySelector(".grouping-veil")?.remove();
    activeCompanionPath = "";
    companionEditMode = false;
    activeGroupingPath = "";
    groupingEditMode = false;
    renderAll();
    setSaveState("lokale Änderungen zurückgesetzt");
    signalEditFeedback(document.getElementById("reset-local"), "mode-off");
  }

  function loadLocal() {
    try {
      const local = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!local) return null;
      if ((local.meta?.editorVersion || 0) < (data.meta?.editorVersion || 0)) return null;
      return local;
    } catch {
      return null;
    }
  }

  function waitForFirebase() {
    const hydrate = async () => {
      if (!window.SteckbriefFirebase || remoteReady) return;
      try {
        const remote = await window.SteckbriefFirebase.load();
        if (remote) {
          data = mergeData(data, remote);
          ensureGroupingSection();
          ensureGallery();
          renderAll();
          setSaveState("global geladen");
        }
        remoteReady = true;
      } catch (error) {
        console.error(error);
        setSaveState("bereit, globaler Speicher nicht geladen");
      }
    };
    window.addEventListener("steckbrief-firebase-ready", hydrate, { once: true });
    hydrate();
  }

  function setSaveState(text) {
    const node = document.getElementById("save-state");
    if (node) {
      node.textContent = text;
      node.dataset.state = stateKey(text);
    }
  }

  function setEditorBusy(isBusy) {
    const saveButton = document.getElementById("save-now");
    if (saveButton) saveButton.disabled = isBusy;
    document.body.classList.toggle("is-saving", isBusy);
  }

  function closeEditorAfterSave() {
    editMode = false;
    companionEditMode = false;
    syncEditorToggle();
    renderAll();
    if (activeCompanionPath) renderCompanionModal(activeCompanionPath);
  }

  function syncEditorToggle() {
    const toggle = document.getElementById("edit-toggle");
    if (toggle) toggle.textContent = editMode ? "Ansicht" : "Bearbeiten";
    document.body.classList.toggle("is-editor-open", editMode);
  }

  function flushPendingSave() {
    if (!saveTimer) return;
    clearTimeout(saveTimer);
    saveTimer = 0;
    saveLocal();
  }

  function exportBackup(reason) {
    const payload = {
      format: "aleria-steckbrief",
      version: 1,
      exportedAt: new Date().toISOString(),
      reason,
      data: clone(data)
    };
    downloadText(`${makeFileSlug(data.name?.vollstaendig || data.meta?.id || "steckbrief")}-${reason}.json`, JSON.stringify(payload, null, 2), "application/json");
  }

  function downloadText(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function signalEditFeedback(target, variant = "edit") {
    const now = Date.now();
    if (now - feedbackTimer < 90) return;
    feedbackTimer = now;
    pulseEditorBar(variant);
    burstEditSparkles(target, variant);
    playEditSound(variant);
  }

  function pulseEditorBar(variant) {
    const marker = document.querySelector(".editor-feedback");
    if (!marker) return;
    marker.dataset.variant = variant;
    marker.classList.remove("is-active");
    void marker.offsetWidth;
    marker.classList.add("is-active");
  }

  function burstEditSparkles(target, variant) {
    if (!target?.getBoundingClientRect) return;
    const rect = target.getBoundingClientRect();
    const originX = Math.min(window.innerWidth - 18, Math.max(18, rect.left + rect.width * 0.72));
    const originY = Math.min(window.innerHeight - 18, Math.max(18, rect.top + rect.height * 0.38));
    const count = variant === "format" ? 7 : 5;

    for (let index = 0; index < count; index += 1) {
      const spark = document.createElement("span");
      const angle = (-80 + index * (160 / Math.max(1, count - 1))) * Math.PI / 180;
      const distance = 18 + Math.random() * 18;
      spark.className = "edit-spark";
      spark.style.left = `${originX}px`;
      spark.style.top = `${originY}px`;
      spark.style.setProperty("--spark-x", `${Math.cos(angle) * distance}px`);
      spark.style.setProperty("--spark-y", `${Math.sin(angle) * distance - 8}px`);
      spark.style.setProperty("--spark-delay", `${index * 18}ms`);
      document.body.appendChild(spark);
      window.setTimeout(() => spark.remove(), 620);
    }
  }

  function playEditSound(variant) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContext) audioContext = new AudioCtx();
      if (audioContext.state === "suspended") audioContext.resume();

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const now = audioContext.currentTime;
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(variant === "mode-on" ? 740 : 520, now);
      oscillator.frequency.exponentialRampToValueAtTime(variant === "mode-off" ? 260 : 880, now + 0.055);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.035, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.075);
    } catch {
      // Feedback is optional; editing must never depend on audio support.
    }
  }

  function stateKey(text) {
    const value = String(text || "").toLowerCase();
    if (value.includes("fehler") || value.includes("fehlgeschlagen")) return "error";
    if (value.includes("speichere")) return "saving";
    if (value.includes("ungespeichert")) return "dirty";
    if (value.includes("gespeichert") || value.includes("exportiert") || value.includes("importiert")) return "saved";
    return "ready";
  }

  function readPath(source, path) {
    return String(path || "").split(".").reduce((current, key) => current == null ? undefined : current[key], source);
  }

  function setPath(source, path, value) {
    const keys = String(path).split(".");
    let current = source;
    keys.slice(0, -1).forEach((key, index) => {
      if (current[key] == null) current[key] = /^\d+$/.test(keys[index + 1]) ? [] : {};
      current = current[key];
    });
    current[keys[keys.length - 1]] = value;
  }

  function castValue(value, type) {
    if (type === "number") return Number(value) || 0;
    if (type === "rich") return sanitizeRich(value);
    return String(value).trim();
  }

  function castInputValue(input) {
    const path = input.dataset.input || "";
    const numeric = input.type === "range" || input.type === "number" || /(\.|^)(slots|scale|bildScale|iconScale|editorVersion)$/i.test(path);
    return castValue(input.value, numeric ? "number" : "text");
  }

  function hasValue(value) {
    return value !== undefined && value !== null && String(value).trim() !== "" && String(value).trim() !== fallback;
  }

  function normalize(value) {
    return hasValue(value) ? String(value) : fallback;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function mergeData(base, override) {
    return { ...base, ...override };
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

  function cssEscape(value) {
    return String(value).replaceAll('"', '\\"');
  }

  function makeFileSlug(value) {
    return String(value || "steckbrief")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "steckbrief";
  }
})();
