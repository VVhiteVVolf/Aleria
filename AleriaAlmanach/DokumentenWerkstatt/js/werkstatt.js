const STORAGE_KEY = "aleria-document-workshop-draft-v1";
const AUTO_SAVE_KEY = "aleria-document-workshop-autosave-v1";
const DEFAULT_TEXT = "<p>Setze hier den Inhalt des Schriftstücks ein. Du kannst Text direkt fett, kursiv, unterstrichen, zentriert oder als Liste formatieren.</p><p>Dieses Dokument kann später als HTML exportiert und im Almanach unter <em>Dokumente & Aufzeichnungen</em> verlinkt werden.</p>";
const state = {
  template: "letter",
  currentPage: 0,
  turnDirection: "",
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

const PRESETS = {
  archiveLetter: {
    template: "letter",
    title: "Archivbrief",
    subtitle: "Aus den Aufzeichnungen des Almanachs",
    author: "Archivariat von Aleria",
    font: "'EB Garamond'",
    fontSize: 18,
    background: "parchment",
    border: "double",
    width: 820,
    height: 780
  },
  mageNote: {
    template: "letter",
    title: "Arkaner Vermerk",
    subtitle: "Randnotiz aus einem versiegelten Konvolut",
    author: "Unbekannter Magus",
    font: "'Macondo'",
    fontSize: 19,
    background: "fibers",
    border: "ornate",
    width: 780,
    height: 760
  },
  tavernNotice: {
    template: "wanted",
    title: "Aushang",
    subtitle: "Anschlag am schwarzen Brett",
    author: "",
    font: "'Special Elite'",
    fontSize: 19,
    background: "aged",
    border: "heavy",
    imagePosition: "center",
    imageSize: 360,
    imageFrame: "heavy",
    width: 700,
    height: 820
  },
  cultFragment: {
    template: "note",
    title: "Zerrissenes Fragment",
    subtitle: "",
    author: "",
    font: "'Creepster'",
    fontSize: 22,
    background: "dark",
    border: "none",
    width: 640,
    height: 460
  },
  nobleDecree: {
    template: "letter",
    title: "Adelsdekret",
    subtitle: "Im Namen des Hauses",
    author: "Kanzlei des Hofes",
    font: "'Cinzel'",
    fontSize: 17,
    background: "plain",
    border: "ornate",
    width: 860,
    height: 900
  },
  fieldBook: {
    template: "book",
    title: "Forschungsbuch",
    subtitle: "Feldaufzeichnungen und Beobachtungen",
    author: "Chronist des Almanachs",
    font: "'Eagle Lake'",
    fontSize: 17,
    background: "fibers",
    border: "thin",
    width: 1120,
    height: 780
  },
  wantedPoster: {
    template: "wanted",
    title: "Steckbrief",
    subtitle: "Gesucht im Namen der Obrigkeit",
    author: "Stadtwache",
    font: "'Pirata One'",
    fontSize: 21,
    background: "aged",
    border: "heavy",
    imagePosition: "center",
    imageSize: 360,
    imageFrame: "heavy",
    width: 680,
    height: 900
  }
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function sanitizeContent(html) {
  const template = document.createElement("template");
  template.innerHTML = String(html || "");
  const allowedTags = new Set(["P", "BR", "B", "STRONG", "I", "EM", "U", "UL", "OL", "LI", "A", "DIV", "SPAN", "H2", "H3", "BLOCKQUOTE", "HR"]);
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    if (!allowedTags.has(node.tagName)) {
      node.replaceWith(...Array.from(node.childNodes));
      return;
    }
    Array.from(node.attributes).forEach(attr => {
      const name = attr.name.toLowerCase();
      if (node.tagName === "A" && ["href", "target", "rel"].includes(name)) return;
      if (name === "style" && /text-align\s*:\s*(left|right|center|justify)/i.test(attr.value)) return;
      node.removeAttribute(attr.name);
    });
    if (node.tagName === "A") {
      const href = node.getAttribute("href") || "";
      if (!/^(https?:\/\/|\.{0,2}\/|#)/i.test(href)) node.removeAttribute("href");
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
  return template.innerHTML;
}

function slugify(value) {
  return String(value || "dokument")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "dokument";
}

function clampNumber(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function normalizeImgurUrl(url) {
  try {
    const parsed = new URL(url.startsWith("//") ? `https:${url}` : url);
    const host = parsed.hostname.toLowerCase();
    if (!host.endsWith("imgur.com")) return url;
    const parts = parsed.pathname.split("/").filter(Boolean);
    const last = parts.at(-1) || "";
    if (!last) return url;
    if (/\.(apng|avif|gif|jpe?g|png|webp)$/i.test(last)) {
      return `https://i.imgur.com/${last}`;
    }
    if (/^[a-z0-9]+$/i.test(last)) {
      return `https://i.imgur.com/${last}.jpg`;
    }
    return url;
  } catch {
    return url;
  }
}

function safeImageUrl(value) {
  const url = String(value || "").trim();
  if (!/^(https?:)?\/\/[^\s"'<>]+$/i.test(url)) return "";
  return normalizeImgurUrl(url);
}

function stripHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = sanitizeContent(html);
  return (template.content.textContent || "").replace(/\s+/g, " ").trim();
}

function cssUrl(value) {
  const url = safeImageUrl(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return url ? `url("${url}")` : "";
}

function getDocumentBackground(meta) {
  const custom = cssUrl(meta.texture);
  if (meta.background === "custom" && custom) {
    return `linear-gradient(180deg, rgba(255,248,230,0.30), rgba(216,188,130,0.18)), ${custom}`;
  }
  const backgrounds = {
    parchment: "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.26), transparent 20%), radial-gradient(circle at 90% 65%, rgba(139,105,20,0.10), transparent 24%), linear-gradient(180deg, #f3e4bd, #dfc996)",
    aged: "radial-gradient(circle at 14% 22%, rgba(102,58,18,0.18), transparent 9%), radial-gradient(circle at 82% 18%, rgba(95,67,24,0.14), transparent 12%), radial-gradient(circle at 70% 78%, rgba(118,73,22,0.16), transparent 14%), linear-gradient(180deg, #ead5a6, #cfad69)",
    fibers: "repeating-linear-gradient(95deg, rgba(92,62,21,0.06) 0 1px, transparent 1px 7px), repeating-linear-gradient(3deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 9px), linear-gradient(180deg, #efe0bd, #d9bf86)",
    plain: "linear-gradient(180deg, #f8efd4, #ead9ac)",
    dark: "radial-gradient(circle at 22% 24%, rgba(255,239,185,0.12), transparent 20%), linear-gradient(180deg, #8a6a36, #5c411d)"
  };
  return backgrounds[meta.background] || backgrounds.parchment;
}

function getDocumentBorder(meta) {
  const borders = {
    none: "0 solid transparent",
    thin: "1px solid rgba(139,105,20,0.65)",
    double: "4px double rgba(95,67,11,0.86)",
    heavy: "4px solid #2c1a08",
    ornate: "8px ridge rgba(139,105,20,0.82)"
  };
  return borders[meta.border] || borders.thin;
}

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

function applyPreviewVariables(meta) {
  document.documentElement.style.setProperty("--preview-font", meta.font);
  document.documentElement.style.setProperty("--preview-size", `${meta.fontSize}px`);
  document.documentElement.style.setProperty("--doc-width", `${meta.width}px`);
  document.documentElement.style.setProperty("--doc-height", `${meta.height}px`);
  document.documentElement.style.setProperty("--doc-image-size", `${meta.imageSize}px`);
  document.documentElement.style.setProperty("--document-background", getDocumentBackground(meta));
  document.documentElement.style.setProperty("--document-background-size", meta.background === "custom" ? "cover" : "auto");
  document.documentElement.style.setProperty("--document-border", getDocumentBorder(meta));
  document.documentElement.style.setProperty("--document-frame-shadow", meta.border === "ornate" ? "inset 0 0 0 2px rgba(255,248,230,0.32)" : "none");
}

function buildShellStyle(meta) {
  return [
    `--preview-font:${meta.font}`,
    `--preview-size:${meta.fontSize}px`,
    `--doc-width:${meta.width}px`,
    `--doc-height:${meta.height}px`,
    `--doc-image-size:${meta.imageSize}px`,
    `--document-background:${getDocumentBackground(meta)}`,
    `--document-background-size:${meta.background === "custom" ? "cover" : "auto"}`,
    `--document-border:${getDocumentBorder(meta)}`,
    `--document-frame-shadow:${meta.border === "ornate" ? "inset 0 0 0 2px rgba(255,248,230,0.32)" : "none"}`
  ].join(";");
}

function getMeta() {
  return {
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
    fontSize: clampNumber($("doc-font-size").value, 18, 14, 30),
    background: $("doc-background").value || "parchment",
    border: $("doc-border").value || "thin",
    texture: safeImageUrl($("doc-texture").value),
    width: clampNumber($("doc-width").value, 820, 520, 1200),
    height: clampNumber($("doc-height").value, 780, 360, 1200),
    pages: state.pages.map(sanitizeContent),
    currentPage: state.currentPage
  };
}

function setMeta(data) {
  const template = ["letter", "book", "note", "wanted"].includes(data.template) ? data.template : "letter";
  const media = normalizeMediaFromData(data);
  $("doc-template").value = template;
  $("doc-preset").value = data.preset || "";
  if (!$("doc-preset").value) $("doc-preset").value = "";
  $("doc-slug").value = data.slug || "";
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
      setStatus("Automatisch gesichert.");
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
    preset: key,
    pages: preset.template === "book" && state.pages.length < 4
      ? bookPages
      : state.pages
  };
  state.currentPage = 0;
  setMeta(meta);
  setStatus(`Preset geladen: ${$("doc-preset").selectedOptions[0].textContent}`);
}

function setPreviewZoom(delta) {
  state.previewZoomMode = "manual";
  state.previewZoom = clampNumber(state.previewZoom + delta, 1, 0.45, 1.6);
  document.documentElement.style.setProperty("--preview-zoom", state.previewZoom.toFixed(2));
}

function updateTemplateControls() {
  const template = $("doc-template").value;
  const visibleByTemplate = {
    letter: new Set(["template", "preset", "slug", "title", "subtitle", "author", "recipient", "date", "location", "image", "image-options", "media"]),
    book: new Set(["template", "preset", "slug", "title", "subtitle", "author", "date", "location", "media"]),
    note: new Set(["template", "preset", "slug", "title"]),
    wanted: new Set(["template", "preset", "slug", "title", "subtitle", "author", "date", "location", "image", "image-options", "media"])
  };
  const visible = visibleByTemplate[template] || visibleByTemplate.letter;
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
  const scroller = document.querySelector(".preview-scroll");
  const shell = document.querySelector("#preview .doc-shell");
  if (!scroller || !shell) {
    state.previewZoom = 1;
  } else {
    const available = Math.max(280, scroller.clientWidth - 24);
    const width = Math.max(1, shell.getBoundingClientRect().width / state.previewZoom);
    state.previewZoom = Math.min(1, Math.max(0.45, available / width));
  }
  document.documentElement.style.setProperty("--preview-zoom", state.previewZoom.toFixed(2));
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
  if (template === "book" && state.pages.length < 2) state.pages.push("<p>Fortsetzung der Buchseite.</p>");
  state.currentPage = Math.min(state.currentPage, state.pages.length - 1);
  loadCurrentPageIntoEditor();
  renderAll();
}

function addBookPage() {
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

function turnBookSpread(button, direction) {
  const root = button.closest(".book-document");
  const stage = root && root.querySelector(".book-stage");
  if (!stage) return;
  const current = Number(stage.dataset.spreadIndex) || 0;
  const total = Number(stage.dataset.spreadCount) || 1;
  const next = Math.max(0, Math.min(total - 1, current + direction));
  if (next === current) return;
  syncEditorToPage();
  state.turnDirection = direction > 0 ? "turn-next" : "turn-prev";
  state.currentPage = next * 2;
  loadCurrentPageIntoEditor();
  renderAll();
  setTimeout(() => {
    state.turnDirection = "";
    renderPreview();
  }, 560);
}

function renderBookPages() {
  const wrap = $("book-pages");
  wrap.classList.toggle("active", $("doc-template").value === "book");
  wrap.innerHTML = state.pages.map((_, index) =>
    `<button class="page-pill${index === state.currentPage ? " active" : ""}" type="button" onclick="switchBookPage(${index})">Seite ${index + 1}</button>`
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
        <button class="book-page-row-main" type="button" onclick="switchBookPage(${index})">
          <span class="book-page-row-title">Seite ${index + 1}</span>
          <span class="book-page-row-preview">${escapeHtml(preview)}</span>
        </button>
        <div class="book-page-actions">
          <button class="icon-btn" type="button" title="Nach oben" onclick="moveBookPage(${index}, -1)" ${index === 0 ? "disabled" : ""}>↑</button>
          <button class="icon-btn" type="button" title="Nach unten" onclick="moveBookPage(${index}, 1)" ${index === state.pages.length - 1 ? "disabled" : ""}>↓</button>
          <button class="icon-btn" type="button" title="Duplizieren" onclick="duplicateBookPage(${index})">⧉</button>
          <button class="icon-btn" type="button" title="Löschen" onclick="removeBookPage(${index})" ${state.pages.length <= 1 ? "disabled" : ""}>×</button>
        </div>
      </div>`;
  }).join("");
  manager.innerHTML = `
    <div class="book-manager-head">
      <div class="book-manager-title">Seitenverwaltung</div>
      <button class="btn" type="button" onclick="addBookPage()">+ Seite</button>
    </div>
    <div class="book-page-list">${rows}</div>`;
}

function renderPreview() {
  const meta = getMeta();
  applyPreviewVariables(meta);
  $("font-size-label").textContent = `${meta.fontSize}px`;
  $("width-label").textContent = `${meta.width}px`;
  $("height-label").textContent = `${meta.height}px`;
  $("image-size-label").textContent = `${meta.imageSize}px`;
  $("signature-size-label").textContent = `${meta.media.signature.size}px`;
  $("emblem-size-label").textContent = `${meta.media.emblem.size}px`;
  $("watermark-size-label").textContent = `${meta.media.watermark.size}px`;
  $("preview").className = `template-${meta.template}`;
  $("preview").innerHTML = buildDocumentHtml(meta, { standalone: false });
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
  return `<a class="almanach-document-link almanach-document-link--${escapeHtml(meta.template)}" href="${escapeHtml(meta.slug)}.html">${escapeHtml(meta.title)}</a>`;
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

function buildMetaLine(meta) {
  return [
    meta.location,
    meta.date,
    meta.author ? `Von ${meta.author}` : "",
    meta.recipient ? `An ${meta.recipient}` : ""
  ].filter(Boolean).map(item => `<span>${escapeHtml(item)}</span>`).join("");
}

function buildImageSlot(slot, label = "Bildplatz", extraClass = "") {
  const image = safeImageUrl(slot?.image);
  const position = ["left", "center", "right", "watermark"].includes(slot?.position) ? slot.position : "right";
  const frame = ["plain", "none", "heavy"].includes(slot?.frame) ? slot.frame : "plain";
  const size = clampNumber(slot?.size, 240, 80, 900);
  return `<div class="doc-image-slot ${extraClass} position-${position} frame-${frame}${image ? " filled" : " empty"}" style="--slot-image-size:${size}px">${image ? `<img src="${escapeHtml(image)}" alt="">` : `<span>${escapeHtml(label)}</span>`}</div>`;
}

function buildFilledImageSlot(slot, label, extraClass = "") {
  return safeImageUrl(slot?.image) ? buildImageSlot(slot, label, extraClass) : "";
}

function buildDocumentMedia(meta, keys = ["main", "signature", "emblem", "watermark"]) {
  const labels = {
    main: meta.template === "wanted" ? "Fahndungsbild" : "Hauptbild",
    signature: "Signatur",
    emblem: "Siegel / Emblem",
    watermark: "Wasserzeichen"
  };
  return keys.map(key => buildFilledImageSlot(meta.media?.[key], labels[key], `slot-${key}`)).join("");
}

function buildBookSpreads(meta, head) {
  const pageTotal = Math.max(1, meta.pages.length);
  const spreadCount = Math.max(1, Math.ceil(pageTotal / 2));
  const activeSpread = Math.max(0, Math.min(spreadCount - 1, Math.floor((meta.currentPage || 0) / 2)));
  const spreads = Array.from({ length: spreadCount }, (_, spreadIndex) => {
    const leftIndex = spreadIndex * 2;
    const rightIndex = leftIndex + 1;
    const left = meta.pages[leftIndex] || "";
    const right = meta.pages[rightIndex] || "";
    return `
        <div class="book-spread${spreadIndex === activeSpread ? " is-active" : ""}" data-spread-index="${spreadIndex}">
          <section class="book-page book-page-left">
            ${leftIndex === 0 ? head : ""}
            <div class="doc-content">${left}</div>
            <div class="book-page-number">${leftIndex + 1}</div>
          </section>
          <section class="book-page book-page-right">
            <div class="doc-content">${right}</div>
            ${right ? `<div class="book-page-number">${rightIndex + 1}</div>` : ""}
          </section>
        </div>`;
  }).join("");
  const firstVisible = activeSpread * 2 + 1;
  const lastVisible = Math.min(firstVisible + 1, pageTotal);
  return `
      <div class="document book-document">
        ${buildDocumentMedia(meta, ["watermark"])}
        <div class="book-stage ${state.turnDirection}" data-spread-index="${activeSpread}" data-spread-count="${spreadCount}" data-page-count="${pageTotal}">
          ${spreads}
        </div>
        <div class="book-controls">
          <button type="button" onclick="turnBookSpread(this, -1)" ${activeSpread === 0 ? "disabled" : ""} aria-label="Zurueck">&lsaquo;</button>
          <span class="book-counter">Seite ${firstVisible}${lastVisible !== firstVisible ? `-${lastVisible}` : ""} / ${pageTotal}</span>
          <button type="button" onclick="turnBookSpread(this, 1)" ${activeSpread >= spreadCount - 1 ? "disabled" : ""} aria-label="Weiter">&rsaquo;</button>
        </div>
      </div>`;
}

function buildDocumentBody(meta) {
  const metaLine = buildMetaLine(meta);
  const head = meta.template === "note" ? "" : `
    <div class="doc-meta">${metaLine}</div>
    ${meta.template === "wanted" ? `<div class="wanted-banner">Fahndung</div>` : ""}
    <h1 class="doc-title">${escapeHtml(meta.title)}</h1>
    ${meta.subtitle ? `<div class="doc-subtitle">${escapeHtml(meta.subtitle)}</div>` : ""}
    <div class="doc-divider"></div>`;
  if (meta.template === "book") {
    return buildBookSpreads(meta, head);
  }
  const topMedia = meta.template === "wanted" ? buildDocumentMedia(meta, ["main"]) : "";
  const bottomMedia = meta.template === "note" ? "" : meta.template === "wanted"
    ? buildDocumentMedia(meta, ["signature", "emblem", "watermark"])
    : buildDocumentMedia(meta);
  return `
    <div class="document">
      ${head}
      ${topMedia}
      <div class="doc-content">${meta.pages[meta.currentPage] || meta.pages[0] || ""}</div>
      ${meta.template !== "note" && meta.author ? `<div class="signature">${escapeHtml(meta.author)}</div>` : ""}
      ${bottomMedia}
    </div>`;
}

function collectWorkshopCss() {
  const fallbackLink = '<link rel="stylesheet" href="DokumentenWerkstatt/css/werkstatt.css">';
  if (window.WORKSHOP_EXPORT_CSS) {
    return `<style>${window.WORKSHOP_EXPORT_CSS}</style>`;
  }
  try {
    const chunks = [];
    Array.from(document.styleSheets).forEach(sheet => {
      const href = sheet.href || "";
      if (href && !href.includes("werkstatt.css")) return;
      try {
        chunks.push(Array.from(sheet.cssRules).map(rule => rule.cssText).join("\n"));
      } catch {
        // Cross-origin font stylesheets are intentionally skipped.
      }
    });
    const css = chunks.filter(Boolean).join("\n");
    return css ? `<style>${css}</style>` : fallbackLink;
  } catch {
    return fallbackLink;
  }
}

function buildDocumentHtml(meta, options = {}) {
  const body = `<div class="doc-shell" style="${escapeHtml(buildShellStyle(meta))}">${buildDocumentBody(meta)}</div>`;
  if (!options.standalone) return body;
  const workshopCss = collectWorkshopCss();
  const exportedBookScript = `<script>
function turnBookSpread(button, direction) {
  const root = button.closest(".book-document");
  const stage = root && root.querySelector(".book-stage");
  if (!stage) return;
  const current = Number(stage.dataset.spreadIndex) || 0;
  const total = Number(stage.dataset.spreadCount) || 1;
  const next = Math.max(0, Math.min(total - 1, current + direction));
  if (next === current) return;
  stage.classList.remove("turn-next", "turn-prev");
  stage.classList.add(direction > 0 ? "turn-next" : "turn-prev");
  stage.dataset.spreadIndex = String(next);
  stage.querySelectorAll(".book-spread").forEach((spread, index) => {
    spread.classList.toggle("is-active", index === next);
  });
  const counter = stage.parentElement.querySelector(".book-counter");
  const pageTotal = Number(stage.dataset.pageCount) || Math.max(1, Math.ceil(total * 2));
  const first = next * 2 + 1;
  const last = Math.min(first + 1, pageTotal);
  if (counter) counter.textContent = "Seite " + first + (last !== first ? "-" + last : "") + " / " + pageTotal;
  const buttons = stage.parentElement.querySelectorAll(".book-controls button");
  if (buttons[0]) buttons[0].disabled = next === 0;
  if (buttons[1]) buttons[1].disabled = next >= total - 1;
  setTimeout(() => stage.classList.remove("turn-next", "turn-prev"), 560);
}
<\/script>`;
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(meta.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Creepster&family=Eagle+Lake&family=EB+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Fredericka+the+Great&family=Homemade+Apple&family=IM+Fell+English+SC&family=Macondo&family=MedievalSharp&family=Pirata+One&family=Rock+Salt&family=Shadows+Into+Light&family=Special+Elite&family=Uncial+Antiqua&family=UnifrakturMaguntia&display=swap" rel="stylesheet">
${workshopCss}
<style>
body{min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:2rem;}
.topbar,.editor-pane{display:none!important}.workspace{display:block}.preview-pane{background:transparent;padding:0}
</style>
</head>
<body>
<main class="preview-pane"><div class="template-${meta.template}">${body}</div></main>
${exportedBookScript}
</body>
</html>`;
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

function exportHtml() {
  syncEditorToPage();
  const meta = getMeta();
  download(`${meta.slug}.html`, buildDocumentHtml(meta, { standalone: true }), "text/html;charset=utf-8");
  setStatus(`HTML exportiert. Link im Almanach: ${meta.slug}.html`);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getMeta()));
  setStatus("Entwurf lokal gespeichert.");
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
