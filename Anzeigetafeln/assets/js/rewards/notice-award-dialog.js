import { connectItemDefinitionClient } from '../../../../AleriaAlmanach/modules/item-definitions/item-definition-client.js';
import { itemDefinitionStore } from '../../../../AleriaAlmanach/modules/item-definitions/item-definition-store.js';
import { rewardText } from './notice-rewards-model.mjs';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export async function openNoticeAwardDialog(notice, rewards) {
  await connectItemDefinitionClient();
  const access = await itemDefinitionStore.access();
  if (!['admin', 'moderator'].includes(access.role)) throw Error('Die Spielleitung bestätigt die Bedingungen und vergibt diese Belohnung.');
  const characters = await itemDefinitionStore.characters();
  const dialog = document.createElement('dialog'); dialog.className = 'notice-reward-dialog';
  dialog.innerHTML = `<form><header><h2>Belohnung einmalig vergeben</h2></header><p>${esc(notice.title)}</p><p>Mit der Vergabe bestätigst du als Spielleitung, dass die Bedingungen erfüllt sind. Der gesamte Betrag und alle Gegenstände gehen an die ausgewählte Figur; Ehrungen bleiben Zusagen.</p><label>Empfänger<select name="recordId" required>${characters.map(record => `<option value="${esc(record.id)}">${esc(record.name)}</option>`).join('')}</select></label><label>Szenen-Thread-ID für den Beleg (optional)<input name="entryId" maxlength="240"></label><p role="alert"></p><footer><button type="button" data-award-cancel>Abbrechen</button><button type="submit">Verbindlich vergeben</button></footer></form>`;
  document.body.appendChild(dialog);
  const summary = document.createElement('ul');
  for (const reward of rewards) { const line = document.createElement('li'); line.textContent = `${rewardText(reward)}${reward.condition ? ` · ${reward.condition}` : ''}`; summary.appendChild(line); }
  dialog.querySelector('form').insertBefore(summary, dialog.querySelector('label'));
  let busy = false, pending = null;
  dialog.querySelector('[data-award-cancel]').addEventListener('click', () => { if (!busy) dialog.close(); });
  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  dialog.addEventListener('close', () => dialog.remove());
  dialog.addEventListener('submit', async event => {
    event.preventDefault(); if (busy) return;
    const values = Object.fromEntries(new FormData(dialog.querySelector('form')));
    const key = JSON.stringify(values);
    if (pending?.key !== key) {
      const recipient = characters.find(record => record.id === values.recordId);
      pending = { key, request: { operationId: crypto.randomUUID(), sourceKey: `notice:${window.TAFEL_CONFIG?.boardId || location.pathname}:${notice.noticeGroupId || notice.stackId || notice.id}`,
        title: notice.title, rewards, recordId: recipient.id, expectedRevision: recipient.inventory?.revision || 0, entryId: values.entryId } };
    }
    busy = true; dialog.querySelector('[type="submit"]').disabled = true;
    try { const result = await itemDefinitionStore.award(pending.request); dialog.querySelector('[role="alert"]').textContent = result.message; dialog.querySelector('[type="submit"]').remove(); }
    catch (failure) { dialog.querySelector('[role="alert"]').textContent = failure.message; dialog.querySelector('[type="submit"]').disabled = false; }
    finally { busy = false; }
  });
  dialog.showModal();
}
