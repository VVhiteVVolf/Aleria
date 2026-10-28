import { element, roleFor } from './administration-cards.mjs';
import { renderOfficeView } from './administration-office-view.mjs?v=20261028-office-body-v2';

// One local controller per owning feature; the same view also serves house courts.
export function createOfficeDialog({ owner, onNavigate } = {}) {
  const dialog = element('dialog', 'administration-office-dialog');
  const shell = element('div', 'administration-office-shell');
  const header = element('header', 'administration-office-header');
  const heading = element('h2');
  heading.id = owner ? 'administration-office-title' : 'house-court-office-title';
  dialog.setAttribute('aria-labelledby', heading.id);
  heading.tabIndex = -1;
  const close = element('button', 'administration-dialog-close', '×');
  close.type = 'button';
  close.setAttribute('aria-label', 'Amtsbeschreibung schließen');
  close.addEventListener('click', () => dialog.close());
  header.append(heading, close);
  const body = element('div', 'administration-office-body');
  shell.append(header, body); dialog.append(shell); document.body.append(dialog);
  let trigger;
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    if ((!owner || owner.open) && trigger?.isConnected) trigger.focus({ preventScroll: true });
  });
  const closeWithOwner = () => { if (dialog.open) dialog.close(); };
  owner?.addEventListener('close', closeWithOwner);
  return {
    open(data, button) {
      trigger = button;
      heading.textContent = data.role.title;
      dialog.dataset.tier = data.tier;
      const text = renderOfficeView(body, data, onNavigate ? areaId => { dialog.close(); onNavigate(areaId); } : null);
      if (!dialog.open) dialog.showModal();
      body.scrollTop = 0; text.scrollTop = 0;
      heading.focus({ preventScroll: true });
      if (button?.dataset.showCrew) text.querySelector('.administration-office-crew')?.scrollIntoView({ block: 'nearest' });
    },
    destroy() {
      owner?.removeEventListener('close', closeWithOwner);
      if (dialog.open) dialog.close();
      dialog.remove();
    },
  };
}

export async function mountOfficeDialog(owner) {
  const { administrationRoleBrief } = await import('./administration-role-briefs.mjs');
  const controller = createOfficeDialog({ owner, onNavigate: areaId => {
    owner.dispatchEvent(new CustomEvent('administration:navigate', { detail: { areaId } }));
  } });
  owner.addEventListener('click', event => {
    const target = event.target.closest('[data-action="open-administration-office"]');
    if (!target || !owner.contains(target)) return;
    const data = roleFor(target);
    if (!data) return;
    controller.open({ ...data, role: { ...data.role, ...administrationRoleBrief(data) } }, target);
  });
}
