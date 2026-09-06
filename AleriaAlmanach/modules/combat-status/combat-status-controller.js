import { COMBAT_STATUS_PRESETS, STATUS_MODIFIERS, STATUS_ROLL_MODES } from './combat-status-catalog.js?v=20260906-effect-rolls-v1';
import { STATUS_DURATIONS, createManualCombatCondition } from './combat-status-model.js?v=20260906-effect-rolls-v1';
import { getActiveCombatEncounter } from '../combat/combat-encounter-model.js?v=20260906-effect-rolls-v1';
import { escapeCombatMarkup as e, renderCombatCondition as renderMiniProfileCondition } from './combat-status-view.js?v=20260906-effect-rolls-v1';

let dialog = null;
let draft = null;
const comments = threadId => globalThis.getCachedCommentsForThread?.(threadId) || [];

export async function commitSceneCombatStatus(context, change) {
  const backend = await globalThis.getCommentBackend?.({ timeoutMs: 1200 });
  if (!backend?.changeCombatStatus) throw new Error('Zustandsänderungen benötigen eine Online-Verbindung mit dem aktuellen Kampfserver.');
  const result = await backend.changeCombatStatus({ entryId: context.threadId, actorId: context.actorId,
    recordId: context.characterId, kind: context.kind, expectedLastCommentId: context.expectedLastCommentId, ...change });
  if (result.profileUpdates?.length) document.dispatchEvent(new CustomEvent('aleria:combat-profile-committed', { detail: { updates: result.profileUpdates } }));
  await globalThis.loadCommentsIntoPage?.(context.threadId, true, { page: 'last' });
  return result;
}

function formMarkup() {
  return `<label>Vorlage<select name="presetId"><option value="">Eigener Zustand</option>${COMBAT_STATUS_PRESETS.map(item => `<option value="${item.id}">${e(item.name)}</option>`).join('')}</select></label>
    <div data-status-preview></div><div class="combat-status-fields"><label>Name<input name="name" required maxlength="160" placeholder="Zum Beispiel: Ermutigt"></label>
    <label>Art<select name="kind"><option value="condition">Zustand</option><option value="buff">Buff</option><option value="debuff">Debuff</option></select></label>
    <label>Dauer<select name="durationKind">${STATUS_DURATIONS.map(([key, label]) => `<option value="${key}">${e(label)}</option>`).join('')}</select></label>
    <label data-status-amount>Anzahl<input type="number" name="durationAmount" min="1" max="999" value="1" required></label></div>
    <label>Quelle<input name="source" maxlength="160" placeholder="Zauber, Gegenstand oder Situation"></label>
    <label>Wirkung / Hinweise<textarea name="description" rows="3" maxlength="1600"></textarea></label>
    <fieldset class="combat-status-roll-modes"><legend>Vorteil & Nachteil</legend><div class="combat-status-fields">${STATUS_ROLL_MODES.map(([key, label]) => `<label>${e(label)}<select name="${key}"><option value="normal">Keine Änderung</option><option value="advantage">Vorteil</option><option value="disadvantage">Nachteil</option></select></label>`).join('')}</div><p>Gilt automatisch, solange dieser Effekt aktiv ist. Vorteil und Nachteil heben sich gegenseitig auf.</p></fieldset>
    <details class="combat-status-modifiers"><summary>Boni & Mali automatisch einrechnen</summary><p>Nur eingetragene Zahlen werden automatisch verrechnet. Weitere Wirkungen wie Folgeschaden, Bewegung oder Handlungssperren werden als Hinweis verfolgt.</p><div class="combat-status-fields">${STATUS_MODIFIERS.map(([key, label]) => `<label>${e(label)}<input type="number" name="modifier-${key}" min="-30" max="30" value="0"></label>`).join('')}</div></details>`;
}

function ensureDialog() {
  if (dialog) return;
  dialog = document.createElement('dialog');
  dialog.className = 'combat-status-dialog';
  dialog.setAttribute('aria-labelledby', 'combat-status-title');
  document.body.append(dialog);
  dialog.addEventListener('close', () => { draft?.trigger?.focus?.(); draft = null; });
  dialog.addEventListener('cancel', event => { if (draft?.submitting) event.preventDefault(); });
  dialog.addEventListener('click', event => {
    if (event.target.closest('[data-status-close]') && !draft?.submitting) dialog.close();
    if (event.target.closest('[data-status-refresh]') && draft && !draft.submitting) void refreshDraft();
  });
  dialog.addEventListener('change', event => {
    const form = dialog.querySelector('form');
    if (event.target.name === 'presetId') {
      const preset = COMBAT_STATUS_PRESETS.find(item => item.id === event.target.value);
      if (preset) {
        form.elements.name.value = preset.name; form.elements.kind.value = preset.kind;
        form.elements.description.value = preset.description;
      }
      for (const [key] of STATUS_ROLL_MODES) form.elements[key].value = preset?.mechanics?.[key] || 'normal';
      dialog.querySelector('[data-status-preview]').innerHTML = preset
        ? `<ul class="comment-combat-conditions">${renderMiniProfileCondition({ ...preset, presetId: preset.id })}</ul>` : '';
    }
    if (event.target.name === 'durationKind') {
      const counted = ['actor-comments', 'scene-comments'].includes(event.target.value);
      dialog.querySelector('[data-status-amount]').hidden = !counted;
      form.elements.durationAmount.disabled = !counted;
    }
  });
  dialog.addEventListener('submit', event => { event.preventDefault(); void submit(); });
}

async function refreshDraft() {
  const current = draft;
  const status = dialog.querySelector('[data-status-message]');
  try {
    await globalThis.loadCommentsIntoPage?.(current.threadId, true, { page: 'last' });
    if (draft !== current) return;
    current.expectedLastCommentId = comments(current.threadId).at(-1)?.id || '';
    status.textContent = 'Aktueller Szenenstand geladen. Prüfe deine Eingaben und speichere erneut.';
  } catch (error) { status.textContent = error.message || 'Aktualisierung fehlgeschlagen.'; }
}

async function submit() {
  if (!draft || draft.submitting) return;
  const current = draft;
  const status = dialog.querySelector('[data-status-message]');
  const form = dialog.querySelector('form');
  try {
    let condition = null;
    if (current.operation === 'add') {
      condition = Object.fromEntries(new FormData(form));
      condition.mechanics = Object.fromEntries(STATUS_MODIFIERS.map(([key]) => [key, form.elements[`modifier-${key}`].value]));
      for (const [key] of STATUS_ROLL_MODES) condition.mechanics[key] = form.elements[key].value;
      createManualCombatCondition(condition, { id: 'preview' });
    }
    if (current.operation === 'reset' && getActiveCombatEncounter(comments(current.threadId))) throw new Error('Inzwischen steht eine Kampfphase an. Zurücksetzen ist gesperrt.');
    current.submitting = true;
    form.querySelectorAll('button').forEach(button => { button.disabled = true; });
    status.textContent = 'Wird gespeichert …';
    await commitSceneCombatStatus(current, { operation: current.operation, condition, conditionId: current.conditionId || '' });
    current.submitting = false;
    dialog.close();
  } catch (error) {
    status.textContent = error.message || 'Die Änderung konnte nicht gespeichert werden.';
    dialog.querySelector('[data-status-refresh]').hidden = false;
  } finally {
    current.submitting = false;
    if (draft === current) form.querySelectorAll('button').forEach(button => { button.disabled = false; });
  }
}

export function openCombatStatusDialog(context, { operation = 'add', conditionId = '', trigger } = {}) {
  if (draft?.submitting || !context?.threadId) return;
  ensureDialog();
  const profile = globalThis.AleriaCombat?.getProfile?.(context.characterId, context);
  if (!profile) return;
  draft = { ...context, operation, conditionId, trigger, expectedLastCommentId: comments(context.threadId).at(-1)?.id || '',
    kind: profile.persistence?.kind === 'character' ? 'character' : 'creature', submitting: false };
  const selected = profile.temporaryConditions?.find(condition => condition.id === conditionId);
  const title = operation === 'add' ? 'Temporären Effekt vergeben' : operation === 'remove' ? 'Effekt entfernen' : 'Kampfwerte zurücksetzen';
  dialog.innerHTML = `<form><header><div><small>${e(profile.name)}</small><h3 id="combat-status-title">${title}</h3></div><button type="button" data-status-close aria-label="Schließen">×</button></header>
    ${operation === 'add' ? formMarkup() : operation === 'remove' ? `<ul class="comment-combat-conditions">${selected ? renderMiniProfileCondition(selected, { temporary: true }) : ''}</ul><p>Diesen temporären Effekt jetzt entfernen?</p>`
      : '<p>Lebenspunkte, Ressourcen und begrenzte Fähigkeiten auffüllen. Temporäre Lebenspunkte, Zustände, Konzentration und Kanalisierung entfernen.</p><p>Ausrüstung und dauerhafte Einträge im Charakterbogen bleiben erhalten. Der Reset wird im Szenenverlauf festgehalten.</p>'}
    <p data-status-message role="status" aria-live="polite"></p><footer><button type="button" data-status-refresh hidden>Stand aktualisieren</button><button type="button" data-status-close>Abbrechen</button><button type="submit">${operation === 'add' ? 'Effekt vergeben' : operation === 'remove' ? 'Entfernen' : 'Jetzt zurücksetzen'}</button></footer></form>`;
  dialog.showModal();
  (dialog.querySelector('[name="presetId"]') || dialog.querySelector('[data-status-close]')).focus();
}
