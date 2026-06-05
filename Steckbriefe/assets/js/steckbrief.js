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
  let feedbackTimer = 0;
  let audioContext = null;
  let dirty = false;
  let saving = false;
  let saveQueued = false;
  let closeAfterSave = false;

  init();

  function init() {
    const local = loadLocal();
    if (local) {
      migrateLegacyPortrait(local, data);
      data = mergeData(data, local);
    }
    ensureGallery();
    renderShell();
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

  function renderRelationGroups(groups, basePath) {
    if (!Array.isArray(groups) || groups.length === 0) return "";
    return groups.map((group, index) => `
      <details class="relation-disclosure" ${index === 0 ? "open" : ""}>
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
      if (event.target.dataset.companionClose !== undefined || event.target.classList.contains("companion-veil")) {
        document.querySelector(".companion-veil")?.remove();
        activeCompanionPath = "";
        companionEditMode = false;
      }
      if (event.target.dataset.companionToggle !== undefined && activeCompanionPath) {
        companionEditMode = !companionEditMode;
        renderCompanionModal(activeCompanionPath);
      }
      if (event.target.dataset.companionSave !== undefined) saveNow(true);
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
        setPath(data, target.dataset.input, castValue(target.value, target.type === "range" ? "number" : "text"));
        signalEditFeedback(target);
        if (target.dataset.imageUrl !== undefined) updateImageFieldStatus(target);
        saveSoon();
        if (target.type === "range") {
          applyLiveRangeUpdate(target);
          if (target.closest(".companion-modal") && activeCompanionPath) renderCompanionModal(activeCompanionPath);
        }
        if (target.tagName === "SELECT") renderAllPreserveScroll();
      }
    });

    document.addEventListener("change", (event) => {
      const target = event.target;
      if (!target.dataset.input) return;
      setPath(data, target.dataset.input, castValue(target.value, target.type === "range" ? "number" : "text"));
      if (target.dataset.imageUrl !== undefined) updateImageFieldStatus(target);
      saveSoon();
      if (target.closest(".companion-modal") && activeCompanionPath) renderCompanionModal(activeCompanionPath);
      else renderAllPreserveScroll();
    });

    document.addEventListener("focusin", (event) => {
      if (event.target.dataset.edit) activeEditable = event.target;
    });

    document.addEventListener("blur", (event) => {
      if (event.target.dataset.edit) renderAllPreserveScroll();
    }, true);

    document.getElementById("import-json-file")?.addEventListener("change", importJsonFile);
    window.addEventListener("resize", syncColumnHeight);
    window.addEventListener("beforeunload", warnBeforeUnload);
  }

  function warnBeforeUnload(event) {
    if (!dirty && !saving && !saveQueued) return;
    event.preventDefault();
    event.returnValue = "";
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

  function renderAllPreserveScroll() {
    const x = window.scrollX;
    const y = window.scrollY;
    renderAll();
    requestAnimationFrame(() => window.scrollTo(x, y));
  }

  function editableAttr(path, type = "text") {
    return `contenteditable="${editMode}" data-edit="${escapeAttr(path)}" data-type="${escapeAttr(type)}" spellcheck="true"`;
  }

  function companionEditableAttr(path, type = "text") {
    return `contenteditable="${companionEditMode}" data-edit="${escapeAttr(path)}" data-type="${escapeAttr(type)}" spellcheck="true"`;
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
        ensureGallery();
        document.querySelector(".companion-veil")?.remove();
        activeCompanionPath = "";
        companionEditMode = false;
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
    ensureGallery();
    dirty = false;
    document.querySelector(".companion-veil")?.remove();
    activeCompanionPath = "";
    companionEditMode = false;
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
