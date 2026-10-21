import { NOTICE_COINS, legacyNoticeRewards, rewardsOf, rewardText, rewardFromItem } from './notice-rewards-model.mjs';

const rewardLabel = /^(belohnung|kopfgeld|entlohnung|preisgeld)$/i;
const rt = () => window.TafelRuntime;
const esc = value => rt().esc(value);
const noticeById = id => rt().state().zettel.find(notice => notice.id === id);
let catalogPromise;
let dialog;
let targetId = '';
let catalog = [];
let query = '';
let limit = 40;
let returnFocus;

function rowValue(notice) { return notice.table?.find(row => rewardLabel.test(row.k))?.v || ''; }
function editable(notice) { return Array.isArray(notice.rewards) ? notice.rewards : legacyNoticeRewards(rowValue(notice)); }
function coinMarkup(reward) {
  const coin = NOTICE_COINS.find(item => item.id === reward.currency);
  return `<span class="notice-money">${esc(Number(reward.amount).toLocaleString('de-DE', { maximumFractionDigits: 2 }))}<img src="${coin.icon}" width="24" height="24" alt="${coin.label}" title="${coin.label}"></span>`;
}

function render(notice, fallback = '') {
  const rewards = rewardsOf(notice, fallback);
  if (!rewards.length) return esc(fallback);
  if (rewards.length === 1 && rewards[0].kind === 'money') return coinMarkup(rewards[0]);
  const icons = rewards.slice(0, 4).map(reward => reward.kind === 'money'
    ? `<img src="${NOTICE_COINS.find(coin => coin.id === reward.currency).icon}" alt="">`
    : itemImage(reward, 'notice-reward-button-icon')).join('');
  return `<button class="notice-reward-button" type="button" data-action="notice-reward-open" data-notice-id="${esc(notice.id)}"><span class="notice-reward-button-icons" aria-hidden="true">${icons}</span> ${rewards.length === 1 ? esc(rewardText(rewards[0])) : `${rewards.length} Belohnungen`} <span aria-hidden="true">›</span></button>`;
}

function editor(notice) {
  const rewards = editable(notice);
  return `<details class="notice-reward-editor" open><summary>Geld, Gegenstände & Ehrungen als Belohnung</summary>
    <div class="notice-reward-editor-list">${rewards.map((reward, index) => `<div class="notice-reward-editor-row">
      ${reward.kind === 'money' ? `<label>Betrag<input class="e-inp" type="number" min="0" max="1000000000" step="0.01" value="${Number(reward.amount) || 0}" data-input-action="notice-reward-field" data-notice-id="${esc(notice.id)}" data-reward-index="${index}" data-field="amount"></label><label>Währung<select class="e-sel" data-input-action="notice-reward-field" data-notice-id="${esc(notice.id)}" data-reward-index="${index}" data-field="currency">${NOTICE_COINS.map(coin => `<option value="${coin.id}" ${reward.currency === coin.id ? 'selected' : ''}>${coin.label}</option>`).join('')}</select></label>` : reward.kind === 'honor' ? '' : `<span>${esc(reward.title || 'Gegenstand')}</span><label>Menge<input class="e-inp" type="number" min="1" max="9999" step="1" value="${Number(reward.quantity) || 1}" data-input-action="notice-reward-field" data-notice-id="${esc(notice.id)}" data-reward-index="${index}" data-field="quantity"></label>`}
      ${reward.kind === 'honor' ? `<label>Ehrung<input class="e-inp" type="text" maxlength="120" value="${esc(reward.title)}" data-input-action="notice-reward-field" data-notice-id="${esc(notice.id)}" data-reward-index="${index}" data-field="title"></label><label>Icon<input class="e-inp" type="text" value="${esc(reward.image || '')}" data-input-action="notice-reward-field" data-notice-id="${esc(notice.id)}" data-reward-index="${index}" data-field="image"></label>` : ''}
      <label>Zusatz / Bedingung<input class="e-inp" type="text" maxlength="300" value="${esc(reward.condition || '')}" data-input-action="notice-reward-field" data-notice-id="${esc(notice.id)}" data-reward-index="${index}" data-field="condition"></label><button type="button" class="s-btn s-cancel" data-action="notice-reward-remove" data-notice-id="${esc(notice.id)}" data-reward-index="${index}" aria-label="Belohnung entfernen">×</button></div>`).join('')}</div>
    <div class="notice-stack-controls"><button type="button" class="s-btn s-cancel" data-action="notice-reward-money" data-notice-id="${esc(notice.id)}">＋ Geld</button><button type="button" class="s-btn s-cancel" data-action="notice-reward-item" data-notice-id="${esc(notice.id)}">＋ Aus Güterregister</button><button type="button" class="s-btn s-cancel" data-action="notice-reward-honor" data-notice-id="${esc(notice.id)}">＋ Ehrung / Zusage</button></div>
    <p>Eine Geldbelohnung erscheint mit Münzicon. Gegenstände und mehrere Belohnungen öffnen eine eigene Übersicht.</p>
  </details>`;
}

function update(id, change, redraw = true) {
  const notice = noticeById(id);
  if (!notice || !rt().canEditZettel()) return;
  notice.rewards = structuredClone(editable(notice));
  change(notice.rewards);
  let row = notice.table.find(item => rewardLabel.test(item.k));
  if (!row && notice.rewards.length) { row = { k: 'Belohnung', v: '' }; notice.table.push(row); }
  if (row) row.v = notice.rewards.map(rewardText).join(' · ');
  if (redraw) window.TafelZettelEditor.render(notice);
  else {
    const tableInput = document.querySelector(`#sidebar [data-input-action="zettel-table-value"][data-row-index="${notice.table.indexOf(row)}"]`);
    if (tableInput) tableInput.value = row.v;
    rt().renderEditorPreview();
  }
  window.TafelState.save();
}

function field(element) {
  const { noticeId, rewardIndex, field } = element.dataset;
  if (!['amount', 'currency', 'quantity', 'condition', 'title', 'image'].includes(field)) return;
  const current = editable(noticeById(noticeId) || {})[Number(rewardIndex)];
  const next = ['condition', 'title', 'image'].includes(field) ? element.value.slice(0, field === 'title' ? 120 : field === 'image' ? 2000 : 300) : field === 'currency' ? element.value : field === 'quantity'
    ? Math.max(1, Math.min(9999, Math.trunc(Number(element.value) || 1))) : Math.max(0, Math.min(1e9, Number(element.value) || 0));
  // Inputs also emit change on blur. Repainting the preview a second time can
  // replace the button between pointerdown and click.
  if (!current || current[field] === next) return;
  update(noticeId, rewards => {
    const reward = rewards[Number(rewardIndex)];
    if (!reward) return;
    if (field === 'condition') reward.condition = next;
    if (['title', 'image'].includes(field) && reward.kind === 'honor') reward[field] = next;
    if (field === 'currency' && NOTICE_COINS.some(coin => coin.id === element.value)) reward.currency = element.value;
    if (field === 'amount' && reward.kind === 'money') reward.amount = Math.max(0, Math.min(1e9, Number(element.value) || 0));
    if (field === 'quantity' && reward.kind === 'item') reward.quantity = Math.max(1, Math.min(9999, Math.trunc(Number(element.value) || 1)));
  }, false);
}

function ensureDialog() {
  if (dialog) return;
  dialog = document.createElement('dialog');
  dialog.className = 'notice-reward-dialog';
  dialog.setAttribute('aria-labelledby', 'notice-reward-title');
  document.body.append(dialog);
  dialog.addEventListener('close', () => { targetId = ''; returnFocus?.isConnected && returnFocus.focus(); });
  dialog.addEventListener('click', event => {
    const action = event.target.closest('[data-reward-action]');
    if (!action) return;
    if (action.dataset.rewardAction === 'close') dialog.close();
    if (action.dataset.rewardAction === 'more') { limit += 40; renderPicker(); }
    if (action.dataset.rewardAction === 'choose') {
      const item = catalog.find(item => item.id === action.dataset.itemId);
      if (!item || document.getElementById('sidebar').dataset.editorId !== targetId) return;
      update(targetId, rewards => rewards.push(rewardFromItem(item)));
      dialog.close();
    }
  });
  dialog.addEventListener('input', event => {
    if (!event.target.matches('[data-reward-search]')) return;
    query = event.target.value;
    limit = 40;
    renderPicker();
  });
}

function shell(title, body) {
  return `<header><div><small>Am schwarzen Brett</small><h2 id="notice-reward-title">${title}</h2></div><button type="button" data-reward-action="close" aria-label="Belohnungen schließen">×</button></header>${body}`;
}

function show() {
  returnFocus = document.activeElement;
  if (!dialog.open) dialog.showModal();
}

async function chooseItem(id) {
  if (!rt().canEditZettel() || !noticeById(id)) return;
  ensureDialog();
  targetId = id;
  query = '';
  limit = 40;
  dialog.innerHTML = shell('Güterregister', '<p class="notice-reward-status">Güter werden geladen …</p>');
  show();
  try {
    catalogPromise ||= fetch('assets/data/notice-reward-catalog.json?v=20261020-notices-v2').then(response => {
      if (!response.ok) throw new Error('Register nicht erreichbar');
      return response.json();
    }).then(data => data.items).catch(error => { catalogPromise = null; throw error; });
    catalog = await catalogPromise;
    if (!dialog.open || targetId !== id) return;
    dialog.innerHTML = shell('Aus dem Güterregister wählen', '<label class="notice-reward-search">Gegenstand suchen<input type="search" data-reward-search placeholder="Name, Art oder Anbieter …"></label><div class="notice-reward-catalog" data-reward-results></div>');
    renderPicker();
    dialog.querySelector('input').focus();
  } catch {
    if (dialog.open && targetId === id) dialog.innerHTML = shell('Güterregister', '<p class="notice-reward-status">Das Register konnte nicht geladen werden. Bitte den Dialog schließen und erneut öffnen. Gespeicherte Belohnungen bleiben erhalten.</p>');
  }
}

function normalized(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('de').replace(/ß/g, 'ss'); }
function renderPicker() {
  const terms = normalized(query).split(/\s+/).filter(Boolean);
  const matches = catalog.filter(item => terms.every(term => normalized([item.title, item.type, item.source].join(' ')).includes(term)));
  dialog.querySelector('[data-reward-results]').innerHTML = `<p class="notice-reward-status">${matches.length} Einträge</p>${matches.slice(0, limit).map(item => `<button type="button" class="notice-reward-catalog-item" data-reward-action="choose" data-item-id="${esc(item.id)}">${itemImage(item, 'notice-reward-item-thumb')}<span><strong>${esc(item.title)}</strong><small>${esc(item.source)} · ${esc(item.type)}</small></span><span aria-hidden="true">＋</span></button>`).join('')}${matches.length > limit ? '<button type="button" class="notice-reward-more" data-reward-action="more">Weitere Güter anzeigen</button>' : ''}`;
}

function itemImage(item, className) {
  return window.TafelNoticeMediaModel.render({ portrait: item.image || '' }, 'portrait', { className, label: item.title || 'Gegenstand', symbol: '◇', fit: 'contain' });
}

function open(id) {
  const notice = noticeById(id);
  if (!notice || (notice.secret && !rt().isEditMode())) return;
  const rewards = rewardsOf(notice, rowValue(notice));
  if (!rewards.length) return;
  ensureDialog();
  dialog.innerHTML = shell('Ausgesetzte Belohnung', `<p class="notice-reward-status">${esc(notice.title)}</p><ul class="notice-reward-loot">${rewards.map(reward => `<li>${reward.kind === 'money' ? `${coinMarkup(reward)}${reward.condition ? `<p class="notice-reward-condition">${esc(reward.condition)}</p>` : ''}` : `${itemImage(reward, 'notice-reward-item-image')}<div><h3>${esc(rewardText(reward))}</h3>${reward.type ? `<small>${esc(reward.type)}</small>` : ''}${reward.description ? `<p>${esc(reward.description)}</p>` : ''}${reward.condition ? `<p class="notice-reward-condition">${esc(reward.condition)}</p>` : ''}${reward.details ? `<details><summary>Weitere Angaben</summary><p>${esc(reward.details)}</p></details>` : ''}</div>`}</li>`).join('')}</ul>`);
  show();
}

export function initializeNoticeRewards() {
  window.TafelNoticeRewards = Object.freeze({ render, editor, open, field, chooseItem,
    addMoney: id => update(id, rewards => rewards.push({ kind: 'money', currency: 'gold', amount: 1 })),
    addHonor: id => update(id, rewards => rewards.push({ kind: 'honor', id: `honor-${crypto.randomUUID()}`, title: 'Ehrung oder Zusage', image: '/IconOrdner/Fazit%20Icons/Ritter.png', condition: 'Verleihung durch die zuständige Stelle; keine automatische Übertragung.' })),
    remove: (id, index) => update(id, rewards => rewards.splice(index, 1)),
  });
}
