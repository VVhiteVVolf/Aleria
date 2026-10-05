import { GROUP_ASSIGNMENTS, GROUP_MEMBER_STATUSES, GROUP_ICON_LABELS, normalizeGroupLandingState, updateGroupMember } from './group-landing-model.js';
import { bookGroupTreasury } from './group-landing-treasury.js';
import { parsePrice } from '../item-register/item-register-money.js';
import { groupNameKey } from './group-landing-roster.js';
import { html, groupPortrait } from './group-landing-markup.js';
import { field, select, iconField, mountGroupIconFields } from './group-landing-fields.js';
import { inventoryEditorBody, collectInventoryEdit, mountInventoryChooser } from './group-landing-inventory-editor.js';
const archiveOptions = characters => [['', 'Ohne Verknüpfung'], ...characters.map(character => [character.id, `${character.name}${character.title ? ' · ' + character.title : ''}`])];
const titles = { select: 'Mitglieder aus der Hierarchie auswählen', member: 'Mitglied anpassen', guest: 'Gast aus dem Charakterarchiv', settings: 'Gruppe & Darstellung bearbeiten', map: 'Aktuelle Karte auswählen', scene: 'Interaktive Sitzungen verknüpfen', treasury: 'Gruppenkasse', inventory: 'Güter aus dem Handelsregister', 'inventory-item': 'Gruppenbestand bearbeiten', 'save-preset': 'Zusammenstellung merken' };
const value = (form, name) => String(new FormData(form).get(name) || '').trim();

function selectionForm(members) {
  return `<p class="group-dialog-help">Namen, Rollen und Porträts stammen direkt aus der Hierarchie. Wähle „Dabei“ für die aktuelle Gruppe; zurückgebliebene Mitglieder bleiben in der Hierarchie.</p>${field('Name, Rolle oder Hierarchiezweig suchen', 'search')}
    <div class="group-selection-tools"><span data-group-selection-count role="status"></span><button type="button" data-group-selection="active">Gefilterte hinzufügen</button><button type="button" data-group-selection="reserve">Gefilterte zurücklassen</button></div>
    <div class="group-selection-list">${members.map(member => `<div class="group-selection-row" data-group-search-row data-search-text="${html(`${member.name} ${member.role} ${member.treeLabel}`.toLocaleLowerCase('de-DE'))}">
      ${groupPortrait(member.portrait, member.name)}<div><strong>${html(member.name)}</strong><small>${html(member.role)} · ${html(member.treeLabel)}</small></div>
      ${select(`Aufenthalt von ${member.name}`, `assignment:${member.id}`, Object.entries(GROUP_ASSIGNMENTS), member.assignment)}</div>`).join('') || '<p class="group-empty">In der Hierarchie sind noch keine Personen namentlich besetzt. Trage sie zuerst auf der Hierarchieseite ein.</p>'}</div>`;
}

function sceneForm(group, scenes) {
  const options = [['', 'Keine aktive Sitzung'], ...scenes.map(scene => [scene.threadId, `${scene.entryTitle} · ${scene.title} · ${scene.dayLabel}`])];
  if (group.threadId && !scenes.some(scene => scene.threadId === group.threadId)) options.push([group.threadId, 'Bisherige Sitzung (derzeit nicht verfügbar)']);
  return `<p class="group-dialog-help">Die aktive Sitzung liefert Szenenzeit und Kampfzustände. Die zeitliche Einordnung weiterer Sitzungen folgt dem Aleria-Kalender; ein früheres Datum beendet keine Szene automatisch.</p>
    ${field('Sitzungen suchen', 'search')}${select('Aktive Sitzung', 'threadId', options, group.threadId)}
    <fieldset class="group-scene-selection"><legend>Weitere Sitzungen dieser Gruppe</legend>${scenes.map(scene => `<label data-group-search-row data-search-text="${html(`${scene.entryTitle} ${scene.title}`.toLocaleLowerCase('de-DE'))}"><input type="checkbox" name="sceneThreads" value="${html(scene.threadId)}"${group.sceneThreads.includes(scene.threadId) ? ' checked' : ''}><span>${html(scene.entryTitle)} · ${html(scene.title)}<small>${html(scene.dayLabel)} · ${html(scene.dateLabel)} · ${html(scene.status === 'ended' ? 'Beendet' : scene.status === 'paused' ? 'Pausiert' : 'Offen')}</small></span></label>`).join('') || '<p>Noch keine interaktiven Szenen vorhanden.</p>'}</fieldset>`;
}

export function groupEditorBody(kind, context) {
  const { data, members, characters, scenes, memberId } = context;
  const group = data.group;
  const member = members.find(item => item.id === memberId);
  if (kind === 'select') return selectionForm(members);
  if (kind === 'scene') return sceneForm(group, scenes);
  if (kind === 'map') {
    const options = [['', 'Keine Karte ausgewählt'], ...(context.maps || []).map(map => [map.id, map.title])];
    if (data.mapKartenId && !options.some(([id]) => id === data.mapKartenId)) options.push([data.mapKartenId, 'Bisherige Karte (derzeit nicht verfügbar)']);
    return `<p class="group-dialog-help">Die Karte öffnet sich direkt in der Gruppenübersicht: zoomen, verschieben, Ebenen und Markierungen nutzen.</p><div class="group-form-grid">${field('Karte suchen', 'search')}${select('Karte aus dem Kartenregister', 'mapKartenId', options, data.mapKartenId)}${select('Darstellung', 'mapDisplay', [['embed', 'Interaktive Karte (Iframe)'], ['image', 'Vorschaubild']], data.mapDisplay)}${field('Überschrift', 'mapTitle', data.mapTitle)}${iconField('Vorschaubild / Fallback', 'mapImage', data.mapImage)}${field('Alternatives Klickziel', 'mapLink', data.mapLink)}${field('Buttontext', 'mapButtonLabel', data.mapButtonLabel)}</div>`;
  }
  if (kind === 'inventory' || kind === 'inventory-item') return inventoryEditorBody(kind, context);
  if (kind === 'settings') return `<fieldset class="group-form-section"><legend>Gruppe & aktuelle Lage</legend><div class="group-form-grid">${field('Titel', 'title', data.title)}${field('Untertitel', 'subtitle', data.subtitle)}${iconField('Wappen / Titelbild', 'bannerImage', data.bannerImage)}${field('Aktueller Ort', 'location', group.location)}${field('Gruppenstatus', 'status', group.status)}${field('Aktuelle Tätigkeit', 'activity', group.activity)}${field('Versorgung & Vorräte', 'supplies', group.supplies)}</div></fieldset>
    <fieldset class="group-form-section"><legend>Überschriften</legend><div class="group-form-grid">${[['memberTitle', 'Mannschaft'], ['questTitle', 'Aufgaben'], ['notesTitle', 'Journal'], ['eventsTitle', 'Ereignisse'], ['mapTitle', 'Karte'], ['infoTitle', 'Informationen']].map(([key, label]) => field(label, key, data[key])).join('')}</div></fieldset>
    <fieldset class="group-form-section"><legend>Icons der Bereiche & Lage</legend><div class="group-form-grid">${Object.entries(GROUP_ICON_LABELS).map(([key, label]) => iconField(label, `icon:${key}`, group.icons[key])).join('')}</div></fieldset>`;
  if (kind === 'member') {
    if (!member) throw new Error('Das Mitglied ist nicht mehr verfügbar.');
    return `<h4>${html(member.name)} · ${html(member.role)}</h4><div class="group-form-grid">${select('Aufenthalt', 'assignment', Object.entries(GROUP_ASSIGNMENTS), member.assignment)}${select('Zusätzlicher Gruppenstatus', 'status', Object.entries(GROUP_MEMBER_STATUSES), member.status)}${field('Charakterbogen suchen', 'search')}${select('Charakterbogen', 'characterId', archiveOptions(characters), member.characterId)}${iconField('Mitglieds-Icon', 'badgeIcon', member.badgeIcon)}${field('Notiz zum Mitglied', 'note', member.note)}${member.source === 'guest' ? field('Rolle', 'role', member.role) + field('Bleibt bis (Aleria-Datum / Ereignis)', 'until', member.until) : ''}</div>
      <p class="group-dialog-help">Kampfwerte und Zustände kommen aus dem Bogen und der aktiven Sitzung. „Bereit“ hebt Verletzungen oder Handlungsunfähigkeit dort nicht auf.</p>${member.source === 'guest' ? `<label class="group-checkbox"><input type="checkbox" name="temporary"${member.temporary ? ' checked' : ''}> Vorübergehendes Mitglied</label><label class="group-checkbox"><input type="checkbox" name="removeGuest"> Gast aus der Gruppe entfernen</label>` : ''}`;
  }
  if (kind === 'guest') return `<div class="group-form-grid">${field('Charakter suchen', 'search')}${select('Charakter aus dem Archiv', 'characterId', archiveOptions(characters))}${field('Rolle in dieser Gruppe', 'role', 'Gast')}${iconField('Gast-Icon', 'badgeIcon')}${field('Bleibt bis (Aleria-Datum / Ereignis)', 'until')}<label class="group-checkbox"><input type="checkbox" name="temporary" checked> Vorübergehendes Mitglied</label></div>`;
  if (kind === 'save-preset') return field('Name der Zusammenstellung', 'name', '', 'text');
  if (kind === 'treasury') return `<p class="group-dialog-help">${group.treasury.openingCopper == null ? 'Trage den gemeinsamen Anfangsbestand ein.' : 'Einnahmen und Ausgaben werden im Kassenbuch festgehalten.'}</p><div class="group-form-grid">
    ${group.treasury.openingCopper == null ? '' : select('Buchung', 'direction', [['income', 'Einnahme'], ['expense', 'Ausgabe']])}
    ${field('Betrag', 'amount', '', 'text')}${select('Währung', 'currency', [['GT', 'Goldtaler'], ['ST', 'Silbertaler'], ['KT', 'Kupfertaler'], ['Pf', 'Eisenpfennig']], 'KT')}
    ${group.treasury.openingCopper == null ? '' : field('Wofür?', 'label')}
    </div>${group.treasury.entries.length ? `<details><summary>Vollständiges Kassenbuch · ${group.treasury.entries.length}</summary><ul>${group.treasury.entries.map(entry => `<li>${html(entry.date)} · ${html(entry.label)} · ${entry.direction === 'expense' ? '−' : '+'}${entry.copper} KT</li>`).join('')}</ul></details>` : ''}`;
  throw new Error('Unbekannte Gruppenbearbeitung.');
}

export function collectGroupEdit(kind, form, context) {
  const { data, members, characters, memberId, scenes, makeId, dateLabel } = context;
  let group = normalizeGroupLandingState(data.group);
  const ids = members.filter(member => member.source === 'hierarchy').map(member => member.id);
  const fields = new FormData(form);
  if (kind === 'select') for (const member of members) group = updateGroupMember(group, member.id, { assignment: value(form, `assignment:${member.id}`) }, ids);
  if (kind === 'settings') {
    for (const key of ['location', 'status', 'activity', 'supplies']) group[key] = value(form, key);
    group.icons = Object.fromEntries(Object.keys(GROUP_ICON_LABELS).map(key => [key, value(form, `icon:${key}`)]));
    return { ...data, ...Object.fromEntries(['title', 'subtitle', 'bannerImage', 'memberTitle', 'questTitle', 'notesTitle', 'eventsTitle', 'mapTitle', 'infoTitle'].map(key => [key, value(form, key)])), group };
  }
  if (kind === 'map') {
    const mapKartenId = value(form, 'mapKartenId');
    if (mapKartenId && mapKartenId !== data.mapKartenId && !context.maps.some(map => map.id === mapKartenId)) throw new Error('Diese Karte ist nicht mehr im Kartenregister verfügbar.');
    return { ...data, ...Object.fromEntries(['mapTitle', 'mapImage', 'mapLink', 'mapButtonLabel', 'mapDisplay'].map(key => [key, value(form, key)])), mapKartenId, group };
  }
  if (kind === 'inventory' || kind === 'inventory-item') group.inventory = collectInventoryEdit(kind, form, context);
  if (kind === 'scene') {
    const threadId = value(form, 'threadId');
    if (threadId && threadId !== group.threadId && !scenes.some(scene => scene.threadId === threadId)) throw new Error('Die Sitzung ist nicht mehr verfügbar.');
    group.sceneThreads = [...new Set([...fields.getAll('sceneThreads'), threadId, group.threadId].filter(Boolean))];
    group.threadId = threadId;
  }
  if (kind === 'member' || kind === 'guest') {
    const characterId = value(form, 'characterId');
    if (characterId && members.some(member => member.id !== memberId && member.characterId === characterId)) throw new Error('Dieser Charakter ist bereits in der Gruppe. Passe sein vorhandenes Mitglied an.');
    if (characterId && !characters.some(character => character.id === characterId)) throw new Error('Der Charakter ist nicht mehr im Archiv verfügbar.');
    if (kind === 'guest') {
      const character = characters.find(item => item.id === characterId);
      if (!character) throw new Error('Bitte einen Charakter auswählen.');
      if (members.some(member => groupNameKey(member.name) === groupNameKey(character.name))) throw new Error('Diese Person steht bereits in der Hierarchie. Wähle sie unter „Zusammenstellen“ aus.');
      group.guests.push({ id: makeId('guest'), characterId, name: character.name, portrait: character.portrait || '', badgeIcon: value(form, 'badgeIcon'), assignment: 'active', status: 'auto', note: '', role: value(form, 'role') || 'Gast', until: value(form, 'until'), temporary: fields.has('temporary') });
    } else if (fields.has('removeGuest')) group.guests = group.guests.filter(guest => guest.id !== memberId);
    else {
      group = updateGroupMember(group, memberId, { assignment: value(form, 'assignment'), status: value(form, 'status'), characterId, linkMode: characterId ? 'manual' : 'none', note: value(form, 'note'), badgeIcon: value(form, 'badgeIcon') }, ids);
      group.guests = group.guests.map(guest => guest.id === memberId ? { ...guest, role: value(form, 'role') || 'Gast', until: value(form, 'until'), temporary: fields.has('temporary') } : guest);
    }
  }
  if (kind === 'save-preset') {
    const name = value(form, 'name');
    if (!name) throw new Error('Bitte einen Namen für die Zusammenstellung angeben.');
    group.presets.push({ id: makeId('preset'), name, memberIds: members.filter(member => member.assignment === 'active').map(member => member.id) });
  }
  if (kind === 'treasury') {
    if (group.treasury.openingCopper == null) {
      const price = parsePrice(value(form, 'amount'), value(form, 'currency'));
      if (!price || price.minCopper !== price.maxCopper) throw new Error('Bitte einen gültigen einzelnen Geldbetrag eingeben.');
      group.treasury.openingCopper = price.minCopper;
    } else group.treasury = bookGroupTreasury(group.treasury, { id: makeId('booking'), direction: value(form, 'direction'), amount: value(form, 'amount'), currency: value(form, 'currency'), label: value(form, 'label'), date: dateLabel });
  }
  return { ...data, group: normalizeGroupLandingState(group) };
}

// Dialogs belong to their page mount, including focus and cleanup.
export function createGroupEditor({ onSave }) {
  let overlay = null, teardown = [];
  function close() {
    if (!overlay) return;
    teardown.forEach(stop => stop()); teardown = [];
    globalThis.deactivateDialog?.(overlay.id);
    overlay.remove(); overlay = null;
  }
  function open(kind, context) {
    close();
    overlay = document.createElement('div');
    overlay.id = 'group-landing-editor-overlay'; overlay.className = 'group-editor-overlay';
    overlay.setAttribute('aria-labelledby', 'group-editor-title');
    overlay.innerHTML = `<form class="group-editor-card"><header><h3 id="group-editor-title">${titles[kind]}</h3><button type="button" data-group-dialog-close aria-label="Schließen">×</button></header>
      <div class="group-editor-body">${groupEditorBody(kind, context)}</div><p class="group-editor-error" role="alert"></p>
      <footer><button type="button" data-group-dialog-close>Abbrechen</button><button type="submit" class="group-button-primary">Speichern</button></footer></form>`;
    document.body.append(overlay);
    function countSelection() {
      const count = overlay?.querySelector('[data-group-selection-count]');
      if (count) count.textContent = `${[...overlay.querySelectorAll('.group-selection-row select')].filter(input => input.value === 'active').length} aktuell dabei`;
    }
    overlay.addEventListener('click', event => {
      if (event.target === overlay || event.target.closest('[data-group-dialog-close]')) { close(); return; }
      const selection = event.target.closest('[data-group-selection]');
      if (selection) { overlay.querySelectorAll('.group-selection-row:not([hidden]) select').forEach(input => { input.value = selection.dataset.groupSelection; }); countSelection(); }
    });
    overlay.addEventListener('change', countSelection);
    overlay.addEventListener('keydown', event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } });
    overlay.addEventListener('input', event => {
      if (event.target.name !== 'search') return;
      const search = event.target.value.trim().toLocaleLowerCase('de-DE');
      overlay.querySelectorAll('[data-group-search-row]').forEach(row => { row.hidden = !row.dataset.searchText.includes(search); });
      overlay.querySelectorAll('select[name="characterId"] option, select[name="threadId"] option, select[name="mapKartenId"] option').forEach(option => { option.hidden = !!option.value && !option.selected && !option.textContent.toLocaleLowerCase('de-DE').includes(search); });
    });
    overlay.querySelector('form').addEventListener('submit', event => {
      event.preventDefault();
      try { const next = collectGroupEdit(kind, event.target, context); onSave(next); close(); }
      catch (error) { if (overlay) overlay.querySelector('[role="alert"]').textContent = error.message; }
    });
    teardown = [mountGroupIconFields(overlay), mountInventoryChooser(overlay)]; countSelection();
    if (globalThis.activateDialog) globalThis.activateDialog(overlay.id, { initialFocus: 'input, select' });
    else { overlay.classList.add('active'); overlay.querySelector('input, select')?.focus(); }
  }
  return { open, close };
}
