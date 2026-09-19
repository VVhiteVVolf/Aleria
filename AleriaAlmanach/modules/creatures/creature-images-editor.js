import '../image-library/image-library-import.js?v=20260919-creature-pages-v1';
import { CREATURE_IMAGE_LIBRARY, getCreatureImageSet, updateCreatureImageSet } from './creature-images-model.js?v=20260919-creature-pages-v1';

const imports = globalThis.AleriaAvatarImport;

export function collectCreatureImages(root, creature) {
  const portrait = root.querySelector('[data-creature-media-field="portrait"]');
  if (!portrait) return;
  const set = getCreatureImageSet(creature);
  const emotes = [...root.querySelectorAll('[data-creature-avatar-index]')].map((row, index) => {
    const raw = row.querySelector('[data-creature-avatar-field="img"]').value.trim();
    return { ...set.emotes[index], img: imports.normalizeUrl(raw) || set.emotes[index]?.img || '', label: row.querySelector('[data-creature-avatar-field="label"]').value };
  });
  const raw = portrait.value.trim();
  updateCreatureImageSet(creature, { portrait: raw ? (imports.normalizeUrl(raw) || set.portrait) : null, emotes });
}

// Owns only transient media UI state. The creature draft and persistence stay with
// the sheet; late clipboard/album responses cannot enter another set or session.
export function createCreatureImagesEditor({ getRoot, getDraft, collect, render, onChange }) {
  let generation = 0;
  let importText = '';
  let status = '';
  let error = false;
  const field = name => getRoot()?.querySelector(`[data-creature-media-field="${name}"]`);
  const current = token => token === generation && Boolean(getDraft());

  function message(value, failed = false) {
    status = value;
    error = failed;
    const node = getRoot()?.querySelector('.creature-media-status');
    if (node) { node.textContent = status; node.dataset.tone = failed ? 'error' : ''; }
  }

  function changed() { render(); onChange(); }
  function reset() { generation += 1; importText = ''; status = ''; error = false; }

  async function importLinks(raw, forceAlbum = false) {
    const token = generation;
    const originalText = importText;
    const album = imports.findAlbumUrl(raw);
    let images;
    try {
      if (forceAlbum || album) {
        const tokens = String(raw).match(/https?:\/\/[^\s<>"']+/gi) || [];
        if (tokens.length > 1) throw new Error('Bitte jeweils ein Imgur-Album übernehmen; mehrere einzelne Bildlinks können gemeinsam eingefügt werden.');
        message('Imgur-Album wird gelesen …');
        images = await imports.requestImages(album || raw);
        if (!current(token)) return;
        raw = images.map(image => image.url).join('\n');
      }
      if (!current(token)) return;
      collect();
      const creature = getDraft();
      const set = getCreatureImageSet(creature);
      const existing = new Set(set.emotes.map(item => item.img));
      const result = imports.merge({ rawValue: raw, slots: set.emotes });
      if (!result.parsedCount) throw new Error('Keine gültigen Bildlinks gefunden. Bitte HTTP(S)-Bildlinks oder einen Imgur-Album-Link einfügen.');
      const emotes = result.slots.filter(Boolean);
      images?.forEach(image => {
        const slot = emotes.find(item => item.img === image.url);
        if (slot && image.label && !existing.has(image.url)) slot.label = image.label;
      });
      updateCreatureImageSet(creature, { emotes });
      if (importText === originalText) importText = '';
      status = `${result.addedCount} Avatare übernommen · ${result.duplicateCount} bereits vorhanden${result.skippedCapacityCount ? ` · ${result.skippedCapacityCount} ohne freien Platz` : ''}.`;
      error = false;
      render();
      if (result.addedCount) onChange();
    } catch (failure) { if (current(token)) message(failure.message, true); }
  }

  function setPortrait(raw) {
    const url = imports.normalizeUrl(raw);
    if (!url) { message('Bitte einen gültigen einzelnen Portrait-Bildlink einfügen.', true); return; }
    collect();
    updateCreatureImageSet(getDraft(), { portrait: url });
    changed();
  }

  async function paste(portrait = false) {
    const token = generation;
    try {
      const raw = await navigator.clipboard.readText();
      if (!current(token)) return;
      if (portrait) setPortrait(raw);
      else { importText = raw; if (field('import')) field('import').value = raw; await importLinks(raw); }
    } catch {
      if (!current(token)) return;
      message('Die Zwischenablage ist nicht zugänglich. Füge den Link mit Strg+V in das Eingabefeld ein.', true);
      field(portrait ? 'portrait' : 'import')?.focus();
    }
  }

  function editSet(action, trigger) {
    collect();
    const creature = getDraft();
    const set = getCreatureImageSet(creature);
    const name = CREATURE_IMAGE_LIBRARY.normalizeText(field(action === 'add-set' ? 'new-set-name' : 'set-name')?.value);
    if (action === 'select-set') {
      if (!creature.imageSets.some(item => item.id === trigger.dataset.setId)) return;
      reset(); creature.activeImageSetId = trigger.dataset.setId; changed(); return;
    }
    if (action === 'delete-set') {
      if (set.id === 'standard' || !globalThis.confirm(`Bilderset „${set.name}“ mit ${set.emotes.length} Avataren entfernen?`)) return;
      creature.imageSets = creature.imageSets.filter(item => item.id !== set.id);
      creature.activeImageSetId = 'standard'; reset(); changed(); return;
    }
    if (!name) { message('Bitte einen Namen für das Bilderset angeben.', true); return; }
    if (creature.imageSets.some(item => (action === 'add-set' || item.id !== set.id) && item.name.toLocaleLowerCase('de') === name.toLocaleLowerCase('de'))) {
      message('Ein Bilderset mit diesem Namen ist bereits vorhanden.', true); return;
    }
    if (action === 'add-set') {
      if (creature.imageSets.length >= CREATURE_IMAGE_LIBRARY.limit) return;
      const id = CREATURE_IMAGE_LIBRARY.createId(name, creature.imageSets.map(item => item.id));
      const now = new Date().toISOString();
      creature.imageSets.push({ id, name, portrait: null, emotes: [], createdAt: now, updatedAt: now });
      creature.activeImageSetId = id; reset();
    } else if (set.id !== 'standard') updateCreatureImageSet(creature, { name });
    changed();
  }

  function handleClick(event) {
    const trigger = event.target.closest('[data-creature-media-action]');
    if (!trigger || !getRoot()?.contains(trigger)) return;
    const action = trigger.dataset.creatureMediaAction;
    if (action.endsWith('-set')) editSet(action, trigger);
    else if (action === 'paste-links' || action === 'paste-portrait') void paste(action === 'paste-portrait');
    else if (action === 'import-links' || action === 'import-album') void importLinks(field('import')?.value || '', action === 'import-album');
    else if (action === 'remove-avatar') {
      collect();
      const creature = getDraft();
      const emotes = [...getCreatureImageSet(creature).emotes];
      emotes.splice(Number(trigger.dataset.index), 1);
      updateCreatureImageSet(creature, { emotes }); changed();
    }
  }

  function handleInput(event) {
    if (!getRoot()?.contains(event.target)) return;
    if (event.target === field('import')) importText = event.target.value;
    if (!event.target.matches('[data-creature-avatar-field], [data-creature-media-field="portrait"], [data-creature-field="portraitCaption"]')) return;
    const isImage = event.target.matches('[data-creature-avatar-field="img"], [data-creature-media-field="portrait"]');
    if (isImage && event.type !== 'change') return;
    const raw = event.target.value.trim();
    if (isImage && raw && !imports.normalizeUrl(raw)) {
      message('Ungültiger Bildlink. Der bisherige Link bleibt erhalten; bitte eine HTTP(S)-Bildadresse verwenden.', true);
      event.target.setAttribute('aria-invalid', 'true');
      return;
    }
    event.target.removeAttribute('aria-invalid');
    collect();
    if (isImage) {
      const frame = event.target.closest('[data-creature-avatar-index]')?.querySelector('.creature-avatar-preview')
        || getRoot().querySelector('.creature-image-portrait .creature-portrait-frame');
      if (frame && raw) {
        const image = document.createElement('img');
        image.src = imports.normalizeUrl(raw);
        image.alt = event.target.closest('[data-creature-avatar-index]')?.querySelector('[data-creature-avatar-field="label"]')?.value || getDraft().name;
        image.referrerPolicy = 'no-referrer';
        frame.replaceChildren(image);
      } else if (frame && !event.target.matches('[data-creature-avatar-field]')) frame.replaceChildren();
    }
    onChange();
  }

  function handleDrag(event) {
    const zone = event.target.closest('[data-creature-media-drop]');
    if (!zone || !getRoot()?.contains(zone)) return;
    if (event.type === 'dragleave' && zone.contains(event.relatedTarget)) return;
    event.preventDefault();
    zone.classList.toggle('is-dragging', event.type === 'dragover');
    if (event.type === 'drop') {
      const raw = imports.readDrop(event.dataTransfer);
      if (zone.dataset.creatureMediaDrop === 'portrait') setPortrait(raw.split(/\r?\n/)[0]);
      else void importLinks(raw);
    }
  }

  return { reset, handleClick, handleInput, handleDrag, viewState: () => ({ importText, status, error }) };
}
