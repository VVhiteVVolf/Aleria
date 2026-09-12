import { REGISTER_CATEGORIES, REGISTER_SECTIONS, categoryLabel, canManageCharacter } from './item-register-model.js';
import { formatCopper, formatPrice, moneyTotal } from './item-register-money.js';
import { resalePrice } from './item-register-trade.js';

export const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export function safeImage(value) {
  const source = String(value || '').trim();
  return /^(?:https?:\/\/|\.?\.?\/|data:image\/(?:png|jpeg|webp|gif);base64,)/i.test(source) ? source : '';
}
const attr = escape;
const amountLabel = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;
const categoryIcon = id => `./public/assets/item-register/categories/${id === 'ruestungen' ? 'ruestungen-v3' : id}.png`;
export function itemImage(item, large = false) {
  const image = safeImage(item.image);
  return `<span class="ir-image${large ? ' ir-image-large' : ''}">${image ? `<img src="${attr(image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : `<span aria-hidden="true">${escape(REGISTER_CATEGORIES.find(category => category.id === item.category)?.icon || '◈')}</span>`}</span>`;
}
const button = (action, text, data = '', primary = false) => `<button type="button" data-ir-action="${action}" ${data} class="${primary ? 'ir-primary' : ''}">${text}</button>`;

export function shell() {
  return `<div class="ir-shell">
    <header class="ir-header"><img src="./public/assets/dashboard/compass.svg" alt="" class="ir-mark"><div><p class="ir-kicker">Das Güterregister</p><h1 id="ir-title">Items und Güter</h1><p>Vorlagen, Sortimente und persönlicher Besitz an einem Ort.</p></div>
      <div class="ir-header-actions"><span data-ir-role="sync" role="status"></span>${button('export', 'Exportieren')}${button('import', 'Importieren')}${button('new-offer', '+ Angebot')}${button('close', '×', 'aria-label="Register schließen"')}</div></header>
    <div class="ir-layout"><aside class="ir-navigation" aria-label="Registerbereiche" data-ir-role="navigation"></aside>
      <main class="ir-main"><div class="ir-toolbar"><label class="ir-search"><span class="ir-sr-only">Güter suchen</span><input data-ir-field="search" type="search" placeholder="Nach Namen, Art oder Beschreibung suchen …"></label><label class="ir-sort">Sortierung<select data-ir-field="sort"><option value="name">Name A–Z</option><option value="price">Preis aufsteigend</option></select></label></div>
      <div data-ir-role="notice" role="status" class="ir-notice" hidden></div><div data-ir-role="results"></div></main>
      <aside data-ir-role="detail" class="ir-detail" aria-label="Güterdetails" hidden></aside></div>
    <input type="file" accept="application/json,.json" data-ir-role="import" hidden>
  </div>`;
}

export function navigation(snapshot, state) {
  return `<div class="ir-nav-intro"><p class="ir-kicker">Register entdecken</p><p>Vom Standard bis zum Einzelstück.</p></div>` + REGISTER_SECTIONS.map((section, index) => {
    const count = snapshot.items.filter(item => item.section === section.id && !item.archived).length;
    return `<section class="ir-nav-section"><button type="button" data-ir-action="section" data-id="${section.id}" class="ir-nav-section-button ${state.section === section.id ? 'is-active' : ''}" aria-pressed="${state.section === section.id}"><span class="ir-nav-number">0${index + 1}</span><span>${section.label}<small>${section.id === 'owned' ? amountLabel(count, 'Besitztum', 'Besitztümer') : amountLabel(count, 'Eintrag', 'Einträge')}</small></span></button>
      ${state.section === section.id && section.id === 'standard' ? `<div class="ir-categories">${REGISTER_CATEGORIES.map(category => `<button type="button" data-ir-action="category" data-id="${category.id}" class="${state.category === category.id ? 'is-active' : ''}" aria-pressed="${state.category === category.id}"><span>${category.label}</span><small>${snapshot.standards.filter(item => item.category === category.id).length}</small></button>`).join('')}</div>` : ''}</section>`;
  }).join('') + `<div class="ir-nav-note">Standardgüter bleiben der Maßstab. Varianten und persönlicher Besitz haben eigene Einträge.</div>`;
}

function listCards(items, section, empty) {
  const lists = new Map();
  items.filter(item => !item.archived).forEach(item => {
    const list = lists.get(item.listId) || { id: item.listId, title: item.listName, count: 0 };
    list.count++; lists.set(list.id, list);
  });
  if (!lists.size) return `<div class="ir-empty-small">${empty}</div>`;
  return `<div class="ir-list-cards">${[...lists.values()].sort((a, b) => a.title.localeCompare(b.title, 'de')).map(list => `<button type="button" data-ir-action="list" data-section="${section}" data-id="${attr(list.id)}"><span class="ir-list-initial">${escape(list.title?.[0] || '◇')}</span><span><strong>${escape(list.title)}</strong><small>${section === 'owned' ? amountLabel(list.count, 'Besitztum', 'Besitztümer') : amountLabel(list.count, 'Angebot', 'Angebote')}</small></span><span aria-hidden="true">→</span></button>`).join('')}</div>`;
}

export function overview(snapshot, state, access) {
  const standard = `<section class="ir-overview-section"><div class="ir-section-heading"><div><p class="ir-kicker">01 / Der Maßstab</p><h2>Standardgüter</h2><p>Wähle eine Warengruppe. Diese Vorlagen bilden die unveränderliche Grundlage.</p></div><span class="ir-count">${snapshot.standards.length} Vorlagen</span></div>
    <div class="ir-category-grid">${REGISTER_CATEGORIES.map(category => `<button type="button" data-ir-action="category" data-id="${category.id}"><img class="ir-category-icon" src="${categoryIcon(category.id)}" alt="" loading="lazy" decoding="async" width="88" height="88"><strong>${category.label}</strong><span>${snapshot.standards.filter(item => item.category === category.id).length} Güter <b aria-hidden="true">↗</b></span></button>`).join('')}</div></section>`;
  const offers = `<section class="ir-overview-section"><div class="ir-section-heading"><div><p class="ir-kicker">02 / Händler und Handwerk</p><h2>Anbieter & Sortimente</h2><p>Eigene Warenlisten mit besonderen Ausführungen, Preisen und Beständen.</p></div>${access.canEditSharedContent ? button('new-offer', '+ Sortiment anlegen') : ''}</div>${listCards(snapshot.offers, 'offer', 'Noch kein Sortiment angelegt. Besondere Waren erscheinen hier getrennt von den Standardgütern.')}</section>`;
  const owned = `<details class="ir-overview-section ir-owned-lists" ${state.ownedExpanded ? 'open' : ''}><summary data-ir-action="toggle-owned"><span><span class="ir-kicker">03 / Persönliche Geschichten</span><span class="ir-owned-heading">Individuelle Listen</span><span class="ir-owned-description">Besitz, Ausrüstung und Begleiter der Figuren</span></span><span class="ir-count">${new Set(snapshot.owned.map(item => item.ownerCharacterId)).size} Figuren <b aria-hidden="true">⌄</b></span></summary><div class="ir-owned-content">${listCards(snapshot.owned, 'owned', 'Noch kein gespeicherter Besitz vorhanden. Gekaufte Gegenstände erscheinen direkt im Inventar der gewählten Figur.')}</div></details>`;
  return state.section === 'offer' ? offers : state.section === 'owned' ? owned : standard + offers + owned;
}

export function results(snapshot, state, items) {
  const label = state.listId ? snapshot.items.find(item => item.listId === state.listId)?.listName : state.category ? categoryLabel(state.category) : REGISTER_SECTIONS.find(section => section.id === state.section)?.label;
  const visible = items.slice(0, state.limit);
  return `<div class="ir-results-heading"><div><p class="ir-kicker">${escape(REGISTER_SECTIONS.find(section => section.id === state.section)?.label)}</p><h2>${escape(label || 'Suchergebnisse')}</h2><p>${items.length} ${items.length === 1 ? 'Eintrag' : 'Einträge'}${state.search ? ` für „${escape(state.search)}“` : ''}</p></div>${button('reset', 'Zur Übersicht')}</div>
    ${state.section === 'owned' ? `<label class="ir-equipped-filter"><input type="checkbox" data-ir-field="equippedOnly" ${state.equippedOnly ? 'checked' : ''}> Nur angelegte Ausrüstung</label>` : ''}
    ${items.length ? `<div class="ir-table" role="table" aria-label="Güterliste"><div class="ir-table-head" role="row"><span role="columnheader">Gegenstand</span><span role="columnheader">Art / Sortiment</span><span role="columnheader">Preis / Wert</span><span role="columnheader">${state.section === 'owned' ? 'Besitz' : 'Bestand'}</span></div>
      ${visible.map(item => `<button type="button" role="row" class="ir-row ${state.selectedId === item.id ? 'is-selected' : ''}" data-ir-action="select" data-id="${attr(item.id)}" aria-label="${attr(item.title)}, Details öffnen" aria-pressed="${state.selectedId === item.id}"><span role="cell" class="ir-item-name">${itemImage(item)}<span><strong>${escape(item.title)}</strong><small>${escape(item.type || categoryLabel(item.category))}</small></span></span><span role="cell" class="ir-row-category">${escape(item.listName || categoryLabel(item.category))}</span><span role="cell" class="ir-row-price">${escape(formatPrice(item.priceRange))}</span><span role="cell" class="ir-row-stock">${item.section === 'owned' ? `${item.quantity} ×${item.equipped ? '<small>Angelegt</small>' : ''}` : item.section === 'standard' ? 'Vorlage' : item.stock == null ? 'Offen' : item.stock}</span></button>`).join('')}</div>` : `<div class="ir-empty"><h3>Keine passenden Güter</h3><p>Passe die Suche an oder öffne eine andere Warengruppe.</p>${button('reset', 'Auswahl zurücksetzen')}</div>`}
    ${items.length > visible.length ? `<div class="ir-more">${button('more', `Weitere Güter anzeigen (${items.length - visible.length})`)}</div>` : ''}`;
}

export function detail(item, snapshot, access) {
  if (!item) return '';
  const owner = snapshot.characters.find(character => character.id === item.ownerCharacterId);
  const canEdit = item.section === 'owned' ? canManageCharacter(owner, access) : access.canEditSharedContent;
  const owners = snapshot.owned.filter(owned => owned.templateId === (item.templateId || item.id));
  const source = snapshot.items.find(entry => entry.id === item.rawItem?.offerId) || snapshot.standards.find(entry => entry.id === item.templateId);
  const sale = item.section === 'owned' ? resalePrice(item.rawItem, source) : null;
  const combat = item.combatDefinition;
  const fact = (label, value) => `<div><dt>${label}</dt><dd>${escape(value || 'Nicht festgelegt')}</dd></div>`;
  return `<div class="ir-detail-top"><p class="ir-kicker">${escape(REGISTER_SECTIONS.find(section => section.id === item.section)?.label)}</p>${button('clear-selection', '×', 'aria-label="Details schließen"')}</div>
    ${itemImage(item, true)}<h2>${escape(item.title)}</h2><p class="ir-detail-type">${escape(item.type || categoryLabel(item.category))}</p>
    <div class="ir-detail-price"><span>${item.section === 'owned' ? 'Referenzwert' : 'Preisspanne'}</span><strong>${escape(formatPrice(item.priceRange))}</strong>${item.section === 'owned' && sale != null ? `<small>Verkauf: ${escape(formatCopper(sale))} je Stück</small>` : ''}</div>
    <dl class="ir-facts">${fact('Kategorie', categoryLabel(item.category))}${fact(item.section === 'owned' ? 'Besitzer' : 'Herkunft', item.ownerCharacterName || item.listName || 'Standardgüter')}${fact('Gewicht', item.hiddenMeta?.weight ? `${item.hiddenMeta.weight} kg` : '')}${fact('Zustand', item.section === 'owned' ? item.equipped ? 'Angelegt' : 'Im Besitz' : item.section === 'standard' ? 'Geschützte Vorlage' : item.legacy ? 'Bisheriger Eintrag' : 'Angebot')}</dl>
    ${['waffen', 'ruestungen'].includes(item.category) ? `<div class="ir-detail-block"><h3>Spielwerte</h3><p>${combat?.damageFormula ? `Schaden: <strong>${escape(combat.damageFormula)}</strong> ${escape(combat.damageType || '')}` : combat?.baseArmorClass != null ? `Rüstungsklasse: <strong>${combat.baseArmorClass}</strong>` : 'Spielwerte noch nicht hinterlegt.'}</p><small>${combat ? 'Wird mit der Ausrüstung im Charakterbogen verbunden.' : 'Die bisherigen Warenquellen enthalten hierfür keine verbindliche Kampfdefinition.'}</small></div>` : ''}
    <div class="ir-detail-block"><h3>Beschreibung</h3><p class="ir-prose">${escape([item.description, item.details].filter(Boolean).join('\n\n') || 'Noch keine Beschreibung vorhanden.')}</p></div>
    ${item.templateId && item.templateId !== item.id ? `<div class="ir-detail-block"><h3>Standardvorlage</h3>${button('reference', escape(snapshot.standards.find(template => template.id === item.templateId)?.title || item.templateName || 'Vorlage öffnen'), `data-id="${attr(item.templateId)}"`)}</div>` : ''}
    <div class="ir-detail-actions">${item.section === 'owned' ? `${canEdit ? button('customize', 'Besitz bearbeiten', '', true) + button('sell', 'Verkaufen', sale == null ? 'disabled title="Der Kaufpreis fehlt"' : '') : ''}${item.creatureId ? button('open-creature', 'Im Bestiarium öffnen') : canEdit && ['pferde', 'vieh'].includes(item.category) ? button('link-creature', 'Als Begleiter anlegen') : ''}${button('open-character', 'Charakterbogen öffnen')}` : `${button('buy', 'Für eine Figur kaufen', !item.priceRange || item.legacy ? 'disabled' : '', true)}${access.canEditSharedContent ? button('variant', 'Eigene Variante anlegen') : ''}${canEdit && item.section === 'offer' ? button('edit-offer', item.legacy ? 'Als Angebot übernehmen' : 'Angebot bearbeiten') : ''}`}</div>
    ${item.section !== 'owned' && owners.length ? `<div class="ir-detail-block"><h3>Im Besitz von</h3>${owners.map(owned => button('select', `${escape(owned.ownerCharacterName)} · ${escape(owned.title)}${owned.equipped ? ' · Angelegt' : ''}`, `data-id="${attr(owned.id)}"`)).join('')}</div>` : ''}`;
}

export const field = (name, label, value = '', attributes = '') => `<label class="ir-form-field">${label}<input name="${name}" value="${attr(value)}" ${attributes}></label>`;
export const textarea = (name, label, value = '') => `<label class="ir-form-field ir-full">${label}<textarea name="${name}" rows="4">${escape(value)}</textarea></label>`;
export const select = (name, label, options, value = '') => `<label class="ir-form-field">${label}<select name="${name}">${options.map(option => `<option value="${attr(option.id)}" ${option.id === value ? 'selected' : ''}>${escape(option.label)}</option>`).join('')}</select></label>`;
