import { escapeHtml, slugify, clampNumber, safeImageUrl, normalizeDocument, documentLink } from './document-schema.js';
import { sanitizeContent, stripHtml } from './document-content.js';
import { PRESETS } from './document-presets.js';
import { buildDocumentHtml } from './document-renderer.js';
import { preparePaperAssets } from './paper/paper-generator.js';
import { installFontOptions, ensureDocumentFont } from './fonts/document-fonts.js';
import { createEnhancements } from './workshop-enhancements.js';
import { exportStandalone } from './export/document-export.js';
import { initLibrary } from './library/library-controller.js';
import { createWorkshopBookMount } from './book/workshop-book.js';

const STORAGE_KEY = "aleria-document-workshop-draft-v1";
const AUTO_SAVE_KEY = "aleria-document-workshop-autosave-v1";
const DEFAULT_TEXT = "<p>Setze hier den Inhalt des Schriftstücks ein. Du kannst Text direkt fett, kursiv, unterstrichen, zentriert oder als Liste formatieren.</p><p>Dieses Dokument kann später als HTML exportiert und im Almanach unter <em>Dokumente & Aufzeichnungen</em> verlinkt werden.</p>";
const state = {
  template: "letter",
  currentPage: 0,
  previewZoom: 1,
  previewZoomMode: "fit",
  autosaveTimer: null,
  hydrated: false,
  pages: [DEFAULT_TEXT],
};

const $ = id => document.getElementById(id);
const fields = [
  "doc-template", "doc-slug", "doc-title", "doc-subtitle", "doc-author",
  "doc-recipient", "doc-date", "doc-location", "doc-image",
  "doc-image-position", "doc-image-size", "doc-image-frame", "doc-font",
  "doc-font-size", "doc-background", "doc-border", "doc-texture",
  "doc-width", "doc-height", "doc-signature-image", "doc-signature-position",
  "doc-signature-size", "doc-signature-frame", "doc-emblem-image",
  "doc-emblem-position", "doc-emblem-size", "doc-emblem-frame",
  "doc-watermark-image", "doc-watermark-size"
];

const MEDIA_SLOTS = {
  main: {
    image: "doc-image",
    position: "doc-image-position",
    size: "doc-image-size",
    frame: "doc-image-frame",
    label: "Hauptbild",
    defaults: { position: "right", size: 240, frame: "plain" }
  },
  signature: {
    image: "doc-signature-image",
    position: "doc-signature-position",
    size: "doc-signature-size",
    frame: "doc-signature-frame",
    label: "Signatur",
    defaults: { position: "right", size: 180, frame: "none" }
  },
  emblem: {
    image: "doc-emblem-image",
    position: "doc-emblem-position",
    size: "doc-emblem-size",
    frame: "doc-emblem-frame",
    label: "Siegel / Emblem",
    defaults: { position: "right", size: 160, frame: "plain" }
  },
  watermark: {
    image: "doc-watermark-image",
    size: "doc-watermark-size",
    label: "Wasserzeichen",
    defaults: { position: "watermark", size: 420, frame: "none" }
  }
};

function getMediaSlot(key) {
  const config = MEDIA_SLOTS[key];
  if (!config) return null;
  return {
    image: safeImageUrl($(config.image).value),
    position: config.position ? ($(config.position).value || config.defaults.position) : config.defaults.position,
    size: clampNumber($(config.size).value, config.defaults.size, 80, 900),
    frame: config.frame ? ($(config.frame).value || config.defaults.frame) : config.defaults.frame
  };
}

function normalizeMediaFromData(data = {}) {
  return {
    main: {
      image: safeImageUrl(data.media?.main?.image || data.image || ""),
      position: data.media?.main?.position || data.imagePosition || "right",
      size: clampNumber(data.media?.main?.size ?? data.imageSize, 240, 80, 900),
      frame: data.media?.main?.frame || data.imageFrame || "plain"
    },
    signature: {
      image: safeImageUrl(data.media?.signature?.image || data.signatureImage || ""),
      position: data.media?.signature?.position || data.signaturePosition || "right",
      size: clampNumber(data.media?.signature?.size ?? data.signatureSize, 180, 80, 900),
      frame: data.media?.signature?.frame || data.signatureFrame || "none"
    },
    emblem: {
      image: safeImageUrl(data.media?.emblem?.image || data.emblemImage || ""),
      position: data.media?.emblem?.position || data.emblemPosition || "right",
      size: clampNumber(data.media?.emblem?.size ?? data.emblemSize, 160, 80, 900),
      frame: data.media?.emblem?.frame || data.emblemFrame || "plain"
    },
    watermark: {
      image: safeImageUrl(data.media?.watermark?.image || data.watermarkImage || ""),
      position: "watermark",
      size: clampNumber(data.media?.watermark?.size ?? data.watermarkSize, 420, 80, 900),
      frame: "none"
    }
  };
}

function getMeta() {
  return normalizeDocument({
    ...enhancements.getMeta(),
    template: $("doc-template").value,
    slug: slugify($("doc-slug").value || $("doc-title").value),
    preset: $("doc-preset").value || "",
    title: $("doc-title").value.trim() || "Unbenanntes Dokument",
    subtitle: $("doc-subtitle").value.trim(),
    author: $("doc-author").value.trim(),
    recipient: $("doc-recipient").value.trim(),
    date: $("doc-date").value.trim(),
    location: $("doc-location").value.trim(),
    media: {
      main: getMediaSlot("main"),
      signature: getMediaSlot("signature"),
      emblem: getMediaSlot("emblem"),
      watermark: getMediaSlot("watermark")
    },
    image: safeImageUrl($("doc-image").value),
    imagePosition: $("doc-image-position").value || "right",
    imageSize: clampNumber($("doc-image-size").value, 240, 80, 520),
    imageFrame: $("doc-image-frame").value || "plain",
    font: $("doc-font").value || "'Eagle Lake'",
    fontSize: clampNumber($("doc-font-size").value, 20, 12, 48),
    background: $("doc-background").value || "parchment",
    border: $("doc-border").value || "thin",
    texture: safeImageUrl($("doc-texture").value),
    width: clampNumber($("doc-width").value, 820, 520, 1200),
    height: clampNumber($("doc-height").value, 1060, 360, 1800),
    pages: state.pages.map(sanitizeContent),
    currentPage: state.currentPage
  });
}

function setMeta(data) {
  const explicitSlug = data.slug;
  data = normalizeDocument(data);
  enhancements.setMeta(data);
  const template = ["letter", "book", "note", "wanted"].includes(data.template) ? data.template : "letter";
  const media = normalizeMediaFromData(data);
  $("doc-template").value = template;
  $("doc-preset").value = data.preset || "";
  if (!$("doc-preset").value) $("doc-preset").value = "";
  $("doc-slug").value = explicitSlug || "";
  $("doc-title").value = data.title || "Archivnotiz oder Dokument";
  $("doc-subtitle").value = data.subtitle || "";
  $("doc-author").value = data.author || "";
  $("doc-recipient").value = data.recipient || "";
  $("doc-date").value = data.date || "";
  $("doc-location").value = data.location || "";
  $("doc-image").value = media.main.image;
  $("doc-image-position").value = media.main.position;
  if (!$("doc-image-position").value) $("doc-image-position").value = "right";
  $("doc-image-size").value = media.main.size;
  $("doc-image-frame").value = media.main.frame;
  if (!$("doc-image-frame").value) $("doc-image-frame").value = "plain";
  $("doc-signature-image").value = media.signature.image;
  $("doc-signature-position").value = media.signature.position;
  $("doc-signature-size").value = media.signature.size;
  $("doc-signature-frame").value = media.signature.frame;
  $("doc-emblem-image").value = media.emblem.image;
  $("doc-emblem-position").value = media.emblem.position;
  $("doc-emblem-size").value = media.emblem.size;
  $("doc-emblem-frame").value = media.emblem.frame;
  $("doc-watermark-image").value = media.watermark.image;
  $("doc-watermark-size").value = media.watermark.size;
  $("doc-font").value = data.font || "'Eagle Lake'";
  if (!$("doc-font").value) $("doc-font").value = "'Eagle Lake'";
  $("doc-font-size").value = data.fontSize || 18;
  $("doc-background").value = data.background || "parchment";
  if (!$("doc-background").value) $("doc-background").value = "parchment";
  $("doc-border").value = data.border || "thin";
  if (!$("doc-border").value) $("doc-border").value = "thin";
  $("doc-texture").value = data.texture || "";
  $("doc-width").value = data.width || 820;
  $("doc-height").value = data.height || 780;
  state.template = $("doc-template").value;
  state.pages = Array.isArray(data.pages) && data.pages.length ? data.pages.map(sanitizeContent) : [DEFAULT_TEXT];
  state.currentPage = Math.max(0, Math.min(Number(data.currentPage) || 0, state.pages.length - 1));
  loadCurrentPageIntoEditor();
  renderAll();
}

function formatText(command, value = null) {
  $("doc-editor").focus();
  document.execCommand(command, false, value);
  syncEditorToPage();
}

function formatBlock(tag) {
  const safeTag = ["p", "h2", "h3", "blockquote"].includes(tag) ? tag : "p";
  $("doc-editor").focus();
  document.execCommand("formatBlock", false, safeTag);
  $("block-format").value = safeTag;
  syncEditorToPage();
}

function insertDivider() {
  $("doc-editor").focus();
  document.execCommand("insertHorizontalRule", false, null);
  syncEditorToPage();
}

function insertLink() {
  const url = prompt("Linkziel einfügen:");
  if (!url) return;
  formatText("createLink", url);
}

function clearFormatting() {
  formatText("removeFormat");
}

function scheduleAutoSave() {
  if (!state.hydrated) return;
  clearTimeout(state.autosaveTimer);
  state.autosaveTimer = setTimeout(() => {
    try {
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(getMeta()));
    } catch {
      setStatus("Autosave konnte nicht geschrieben werden.");
    }
  }, 900);
}

function switchEditorTab(tab) {
  document.querySelectorAll(".tab-btn").forEach(button => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });
  document.querySelectorAll(".editor-panel").forEach(panel => {
    panel.classList.toggle("active", panel.dataset.panel === tab);
  });
}

function getWorkshopActionTarget(event) {
  return event.target instanceof Element
    ? event.target.closest("[data-workshop-action]")
    : null;
}

function getWorkshopNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function handleWorkshopClick(event) {
  const control = getWorkshopActionTarget(event);
  if (!control || control.matches("input, select")) return;

  const action = control.dataset.workshopAction;
  let handled = true;

  switch (action) {
    case "new-document":
      newDocument();
      break;
    case "save-draft":
      saveDraft();
      break;
    case "load-draft":
      loadDraft();
      break;
    case "load-autosave":
      loadAutoSave();
      break;
    case "export-json":
      exportJson();
      break;
    case "export-html":
      exportHtml();
      break;
    case "switch-editor-tab":
      switchEditorTab(control.dataset.tab || "document");
      break;
    case "clear-media-slot":
      clearMediaSlot(control.dataset.slotKey);
      break;
    case "format-text":
      formatText(control.dataset.command);
      break;
    case "insert-divider":
      insertDivider();
      break;
    case "insert-link":
      insertLink();
      break;
    case "clear-formatting":
      clearFormatting();
      break;
    case "add-book-page":
      addBookPage();
      break;
    case "remove-book-page":
      removeBookPage(getWorkshopNumber(control.dataset.pageIndex, state.currentPage));
      break;
    case "switch-book-page":
      switchBookPage(getWorkshopNumber(control.dataset.pageIndex, state.currentPage));
      break;
    case "move-book-page":
      moveBookPage(
        getWorkshopNumber(control.dataset.pageIndex, state.currentPage),
        getWorkshopNumber(control.dataset.direction, 0)
      );
      break;
    case "duplicate-book-page":
      duplicateBookPage(getWorkshopNumber(control.dataset.pageIndex, state.currentPage));
      break;
    case "copy-snippet":
      copySnippet();
      break;
    case "set-preview-zoom":
      setPreviewZoom(getWorkshopNumber(control.dataset.delta, 0));
      break;
    case "reset-preview-zoom":
      resetPreviewZoom();
      break;
    default:
      handled = false;
      break;
  }

  if (handled) event.preventDefault();
}

function handleWorkshopChange(event) {
  const control = getWorkshopActionTarget(event);
  if (!control) return;

  switch (control.dataset.workshopAction) {
    case "import-json":
      importJson(control);
      break;
    case "set-template":
      setTemplate(control.value);
      break;
    case "format-block":
      formatBlock(control.value);
      break;
  }
}

function handleWorkshopToolbarMouseDown(event) {
  if (!(event.target instanceof Element)) return;
  const toolbar = event.target.closest('[data-workshop-role="format-toolbar"]');
  if (!toolbar) return;
  if (event.target.closest("button")) event.preventDefault();
}

function initWorkshopEvents() {
  document.addEventListener("click", handleWorkshopClick);
  document.addEventListener("change", handleWorkshopChange);
  document.addEventListener("mousedown", handleWorkshopToolbarMouseDown);

  fields.forEach(id => {
    const el = $(id);
    if (!el) return;
    el.addEventListener("input", () => {
      renderPreview();
      scheduleAutoSave();
    });
    el.addEventListener("change", () => {
      renderPreview();
      scheduleAutoSave();
    });
  });

  $("doc-preset").addEventListener("change", event => applyPreset(event.target.value));
  $("doc-editor").addEventListener("input", syncEditorToPage);
}

function applyPreset(key) {
  if (!key || !PRESETS[key]) {
    renderPreview();
    return;
  }
  syncEditorToPage();
  const preset = PRESETS[key];
  const bookPages = [
    state.pages[0] || DEFAULT_TEXT,
    "<p>Weitere Aufzeichnungen.</p>",
    "<p>Skizzen, Randbemerkungen und Hinweise.</p>",
    "<p>Fortsetzung der Untersuchung.</p>"
  ];
  const meta = {
    ...getMeta(),
    ...preset,
    paperColor: preset.background === 'dark' ? 'ash' : preset.background === 'aged' ? 'honey' : 'ivory',
    paperAge: preset.background === 'aged' ? 75 : preset.background === 'plain' ? 0 : 25,
    paperEdge: preset.template === 'note' ? 'torn' : 'straight',
    ink: preset.background === 'dark' ? '#f3e7c9' : '#302315',
    preset: key,
    pages: preset.template === "book" && state.pages.length < 4
      ? bookPages
      : state.pages
  };
  meta.media.main = { ...meta.media.main, position: preset.imagePosition || meta.media.main.position, size: preset.imageSize || meta.media.main.size, frame: preset.imageFrame || meta.media.main.frame };
  state.currentPage = 0;
  setMeta(meta);
  setStatus(`Preset geladen: ${$("doc-preset").selectedOptions[0].textContent}`);
}

function setPreviewZoom(delta) {
  state.previewZoomMode = "manual";
  state.previewZoom = clampNumber(state.previewZoom + delta, 1, 0.45, 1.6);
  $("preview").style.setProperty("--preview-zoom", state.previewZoom.toFixed(2));
}

function updateTemplateControls() {
  const template = $("doc-template").value;
  const visibleByTemplate = {
    letter: new Set(["template", "preset", "slug", "title", "subtitle", "author", "recipient", "date", "location", "image", "image-options", "media"]),
    book: new Set(["template", "preset", "slug", "title", "subtitle", "author", "date", "location", "image", "image-options"]),
    note: new Set(["template", "preset", "slug", "title"]),
    wanted: new Set(["template", "preset", "slug", "title", "subtitle", "author", "date", "location", "image", "image-options", "media"])
  };
  const visible = visibleByTemplate[template] || visibleByTemplate.letter;
  document.querySelector('label[for="doc-image"]').textContent = template === 'wanted' ? 'Skizze oben rechts · optional' : template === 'book' ? 'Eigener Bucheinband · optional' : 'Bild / Signatur / Siegel';
  $('doc-image-position').closest('.field').hidden = template === 'wanted' || template === 'book';
  $('doc-image-frame').closest('.field').hidden = template === 'wanted' || template === 'book';
  const imageTarget = $('image-upload-target');
  imageTarget.options[0].textContent = template === 'book' ? 'Bucheinband' : template === 'wanted' ? 'Skizze oben rechts' : 'Hauptbild';
  [...imageTarget.options].forEach((option, index) => { option.disabled = template === 'book' && index > 0; });
  if (template === 'book') imageTarget.value = 'doc-image';
  document.querySelectorAll('.preview-zoom button').forEach(button => { button.disabled = template === 'book'; });
  document.querySelectorAll("[data-field-key]").forEach(field => {
    field.classList.toggle("hidden-control", !visible.has(field.dataset.fieldKey));
  });
  document.querySelectorAll("[data-media-slot]").forEach(slot => {
    const slotKey = slot.dataset.mediaSlot;
    const visibleSlot = template !== "book" || slotKey === "watermark";
    slot.classList.toggle("hidden-control", !visibleSlot);
  });
}

function resetPreviewZoom() {
  state.previewZoomMode = "fit";
  if ($('doc-template').value === 'book') { state.previewZoom = 1; $('preview').style.setProperty('--preview-zoom', '1'); return; }
  const scroller = document.querySelector(".preview-scroll");
  const shell = document.querySelector("#preview .doc-shell");
  if (!scroller || !shell) {
    state.previewZoom = 1;
  } else {
    const available = Math.max(280, scroller.clientWidth - 24);
    const width = Math.max(1, shell.getBoundingClientRect().width / state.previewZoom);
    state.previewZoom = Math.min(1, Math.max(0.2, available / width));
  }
  $("preview").style.setProperty("--preview-zoom", state.previewZoom.toFixed(2));
}

function syncEditorToPage() {
  state.pages[state.currentPage] = sanitizeContent($("doc-editor").innerHTML);
  renderPreview();
  scheduleAutoSave();
}

function loadCurrentPageIntoEditor() {
  $("doc-editor").innerHTML = state.pages[state.currentPage] || "";
}

function setTemplate(template) {
  state.template = template;
  $("doc-template").value = template;
  if (template === 'note') $("doc-paper-edge").value = 'torn';
  if (template === "book" && state.pages.length < 2) state.pages.push("<p>Fortsetzung der Buchseite.</p>");
  state.currentPage = Math.min(state.currentPage, state.pages.length - 1);
  loadCurrentPageIntoEditor();
  renderAll();
  scheduleAutoSave();
}

function addBookPage() {
  if (state.pages.length >= 100) { setStatus('Ein Buch kann höchstens 100 Seiten enthalten.'); return; }
  syncEditorToPage();
  state.pages.splice(state.currentPage + 1, 0, "<p>Neue Buchseite.</p>");
  state.currentPage += 1;
  loadCurrentPageIntoEditor();
  renderAll();
  setStatus(`Seite ${state.currentPage + 1} angelegt.`);
}

function removeBookPage(index = state.currentPage) {
  if (state.pages.length <= 1) {
    setStatus("Die letzte Seite kann nicht gelöscht werden.");
    return;
  }
  const pageNumber = index + 1;
  if (!confirm(`Seite ${pageNumber} löschen?`)) return;
  const target = Math.max(0, Math.min(index, state.pages.length - 1));
  state.pages.splice(target, 1);
  state.currentPage = Math.max(0, Math.min(state.currentPage, state.pages.length - 1));
  loadCurrentPageIntoEditor();
  renderAll();
  setStatus(`Seite ${pageNumber} gelöscht.`);
}

function duplicateBookPage(index = state.currentPage) {
  if (state.pages.length >= 100) { setStatus('Ein Buch kann höchstens 100 Seiten enthalten.'); return; }
  syncEditorToPage();
  const source = Math.max(0, Math.min(index, state.pages.length - 1));
  state.pages.splice(source + 1, 0, state.pages[source] || "<p>Neue Buchseite.</p>");
  state.currentPage = source + 1;
  loadCurrentPageIntoEditor();
  renderAll();
  setStatus(`Seite ${source + 1} dupliziert.`);
}

function moveBookPage(index, direction) {
  syncEditorToPage();
  const from = Math.max(0, Math.min(index, state.pages.length - 1));
  const to = from + direction;
  if (to < 0 || to >= state.pages.length) return;
  const [page] = state.pages.splice(from, 1);
  state.pages.splice(to, 0, page);
  state.currentPage = to;
  loadCurrentPageIntoEditor();
  renderAll();
  setStatus(`Seite ${from + 1} verschoben.`);
}

function switchBookPage(index) {
  syncEditorToPage();
  state.currentPage = Math.max(0, Math.min(index, state.pages.length - 1));
  loadCurrentPageIntoEditor();
  renderAll();
}

function renderBookPages() {
  const wrap = $("book-pages");
  wrap.classList.toggle("active", $("doc-template").value === "book");
  wrap.innerHTML = state.pages.map((_, index) =>
    `<button class="page-pill${index === state.currentPage ? " active" : ""}" type="button" data-workshop-action="switch-book-page" data-page-index="${index}">Seite ${index + 1}</button>`
  ).join("");
  $("add-page-btn").style.display = $("doc-template").value === "book" ? "" : "none";
  $("remove-page-btn").style.display = $("doc-template").value === "book" ? "" : "none";
}

function renderBookManager() {
  const manager = $("book-manager");
  const isBook = $("doc-template").value === "book";
  manager.classList.toggle("active", isBook);
  if (!isBook) {
    manager.innerHTML = "";
    return;
  }
  const rows = state.pages.map((page, index) => {
    const preview = stripHtml(page).slice(0, 86) || "Leere Seite";
    return `
      <div class="book-page-row${index === state.currentPage ? " active" : ""}">
        <button class="book-page-row-main" type="button" data-workshop-action="switch-book-page" data-page-index="${index}">
          <span class="book-page-row-title">Seite ${index + 1}</span>
          <span class="book-page-row-preview">${escapeHtml(preview)}</span>
        </button>
        <div class="book-page-actions">
          <button class="icon-btn" type="button" title="Nach oben" data-workshop-action="move-book-page" data-page-index="${index}" data-direction="-1" ${index === 0 ? "disabled" : ""}>↑</button>
          <button class="icon-btn" type="button" title="Nach unten" data-workshop-action="move-book-page" data-page-index="${index}" data-direction="1" ${index === state.pages.length - 1 ? "disabled" : ""}>↓</button>
          <button class="icon-btn" type="button" title="Duplizieren" data-workshop-action="duplicate-book-page" data-page-index="${index}">⧉</button>
          <button class="icon-btn" type="button" title="Löschen" data-workshop-action="remove-book-page" data-page-index="${index}" ${state.pages.length <= 1 ? "disabled" : ""}>×</button>
        </div>
      </div>`;
  }).join("");
  manager.innerHTML = `
    <div class="book-manager-head">
      <div class="book-manager-title">Seitenverwaltung</div>
      <button class="btn" type="button" data-workshop-action="add-book-page">+ Seite</button>
    </div>
    <div class="book-page-list">${rows}</div>`;
}

function renderPreview() {
  const meta = getMeta();
  ensureDocumentFont(meta).catch(error => setStatus(error.message));
  enhancements.render(meta);
  $("font-size-label").textContent = `${meta.fontSize}px`;
  $("width-label").textContent = `${meta.width}px`;
  $("height-label").textContent = `${meta.height}px`;
  $("image-size-label").textContent = `${meta.imageSize}px`;
  $("signature-size-label").textContent = `${meta.media.signature.size}px`;
  $("emblem-size-label").textContent = `${meta.media.emblem.size}px`;
  $("watermark-size-label").textContent = `${meta.media.watermark.size}px`;
  $("preview").className = `template-${meta.template}`;
  $("preview").innerHTML = buildDocumentHtml(meta, { standalone: false });
  bookMount.update(meta).catch(error => setStatus(error.message));
  renderMediaPreviews(meta);
  renderSnippet(meta);
  if (state.previewZoomMode === "fit") requestAnimationFrame(resetPreviewZoom);
}

function renderMediaPreviews(meta = getMeta()) {
  Object.entries(MEDIA_SLOTS).forEach(([key, config]) => {
    const preview = document.querySelector(`[data-media-preview="${key}"]`);
    if (!preview) return;
    const slot = meta.media?.[key] || {};
    preview.innerHTML = slot.image
      ? `<img src="${escapeHtml(slot.image)}" alt="">`
      : `<span>Kein ${escapeHtml(config.label)}</span>`;
  });
}

function buildSnippet(meta = getMeta()) {
  return `<a class="almanach-document-link almanach-document-link--${escapeHtml(meta.template)}" href="${escapeHtml(documentLink(meta.slug))}">${escapeHtml(meta.title)}</a>`;
}

function renderSnippet(meta = getMeta()) {
  const output = $("snippet-output");
  if (!output) return;
  output.value = buildSnippet(meta);
}

async function copySnippet() {
  const snippet = buildSnippet(getMeta());
  $("snippet-output").value = snippet;
  try {
    await navigator.clipboard.writeText(snippet);
    setStatus("Snippet kopiert.");
  } catch {
    $("snippet-output").focus();
    $("snippet-output").select();
    setStatus("Snippet markiert.");
  }
}

function clearMediaSlot(key) {
  const config = MEDIA_SLOTS[key];
  if (!config) return;
  $(config.image).value = "";
  renderPreview();
  scheduleAutoSave();
  setStatus(`${config.label} entfernt.`);
}

function renderAll() {
  renderBookPages();
  renderBookManager();
  updateTemplateControls();
  renderPreview();
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportHtml() {
  syncEditorToPage();
  try { await exportStandalone(getMeta()); setStatus('HTML mit Pergament, eigener Schrift und Übersetzung exportiert.'); }
  catch (error) { setStatus(error.message); }
}

function exportJson() {
  syncEditorToPage();
  const meta = getMeta();
  download(`${meta.slug}.json`, JSON.stringify(meta, null, 2), "application/json;charset=utf-8");
  setStatus("JSON exportiert.");
}

function importJson(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      setMeta(JSON.parse(reader.result));
      setStatus("JSON importiert.");
    } catch (error) {
      setStatus("JSON konnte nicht gelesen werden.");
    } finally {
      input.value = "";
    }
  };
  reader.readAsText(file);
}

function saveDraft() {
  syncEditorToPage();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(getMeta())); setStatus('Entwurf lokal gespeichert.'); }
  catch { setStatus('Lokaler Speicher voll. Bitte JSON sichern oder die Sammlung verwenden.'); }
}

function loadDraft() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    setStatus("Kein lokaler Entwurf vorhanden.");
    return;
  }
  try {
    setMeta(JSON.parse(raw));
    setStatus("Entwurf geladen.");
  } catch {
    setStatus("Entwurf konnte nicht geladen werden.");
  }
}

function loadAutoSave() {
  const raw = localStorage.getItem(AUTO_SAVE_KEY);
  if (!raw) {
    setStatus("Kein Autosave vorhanden.");
    return;
  }
  try {
    setMeta(JSON.parse(raw));
    setStatus("Autosave geladen.");
  } catch {
    setStatus("Autosave konnte nicht geladen werden.");
  }
}

function newDocument() {
  if (!confirm("Neues Dokument beginnen? Ungespeicherte Änderungen gehen verloren.")) return;
  state.template = "letter";
  state.currentPage = 0;
  state.pages = [DEFAULT_TEXT];
  setMeta({
    template: "letter",
    title: "Archivnotiz oder Dokument",
    subtitle: "Aus den Aufzeichnungen des Almanachs",
    author: "Unbekannter Schreiber",
    imagePosition: "right",
    imageSize: 240,
    imageFrame: "plain",
    font: "'Eagle Lake'",
    fontSize: 18,
    background: "parchment",
    border: "thin",
    texture: "",
    width: 820,
    height: 780,
    pages: state.pages
  });
  setStatus("Neues Dokument angelegt.");
}

function setStatus(text) {
  $("status").textContent = text;
}

const bookMount = createWorkshopBookMount($('preview'));
const enhancements = createEnhancements(document.querySelector('.app'), {
  getMeta: () => { state.pages[state.currentPage] = sanitizeContent($("doc-editor").innerHTML); return getMeta(); },
  refresh: () => { renderPreview(); scheduleAutoSave(); }, setStatus
});
installFontOptions($("doc-font"));
try { await preparePaperAssets(); } catch { setStatus('Pergamentbilder nicht erreichbar; generiertes Papier wird verwendet.'); }
initWorkshopEvents();
setMeta({
  template: "letter",
  title: "Archivnotiz oder Dokument",
  subtitle: "Aus den Aufzeichnungen des Almanachs",
  author: "Unbekannter Schreiber",
  imagePosition: "right",
  imageSize: 240,
  imageFrame: "plain",
  font: "'Eagle Lake'",
  fontSize: 18,
  background: "parchment",
  border: "thin",
  texture: "",
  width: 820,
  height: 780,
  pages: state.pages
});
state.hydrated = true;
renderSnippet(getMeta());
initLibrary(document.querySelector('[data-panel="library"]'), {
  getDocument: () => { state.pages[state.currentPage] = sanitizeContent($("doc-editor").innerHTML); return getMeta(); },
  setDocument: data => { setMeta(data); scheduleAutoSave(); }, setStatus
}).catch(error => setStatus(error.message));
new ResizeObserver(() => { if (state.previewZoomMode === 'fit') resetPreviewZoom(); }).observe(document.querySelector('.preview-scroll'));
