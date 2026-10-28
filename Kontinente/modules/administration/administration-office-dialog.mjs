import { element, pin, portraitImage, roleFor } from './administration-cards.mjs';

export function mountOfficeDialog(owner) {
  const dialog = element('dialog', 'administration-office-dialog');
  dialog.setAttribute('aria-labelledby', 'administration-office-title');
  const shell = element('div', 'administration-office-shell');
  const header = element('header', 'administration-office-header');
  const heading = element('h2');
  heading.id = 'administration-office-title';
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
  dialog.addEventListener('close', () => { if (owner.open && trigger?.isConnected) trigger.focus({ preventScroll: true }); });
  owner.addEventListener('close', () => { if (dialog.open) dialog.close(); });
  owner.addEventListener('click', event => {
    const target = event.target.closest('[data-action="open-administration-office"]');
    if (!target || !owner.contains(target)) return;
    const data = roleFor(target);
    if (!data) return;
    trigger = target;
    const { role, group, area, tier } = data;
    heading.textContent = role.title;
    dialog.dataset.tier = tier;
    body.replaceChildren();
    const aside = element('aside', `administration-office-person is-${tier}`);
    const frame = element('div', 'administration-portrait-frame');
    frame.append(portraitImage(role.portrait, role.name));
    aside.append(frame, pin(area.id, tier), element('h3', '', role.name || 'Noch nicht benannt'));
    const predecessor = element('div', 'administration-predecessor');
    const previous = role.predecessor;
    predecessor.append(portraitImage(previous?.portrait, previous?.name));
    const previousLabel = element(previous?.href ? 'a' : 'span', '', previous?.name ? `Vorgänger · ${previous.name}` : 'Vorgänger');
    if (previous?.href) previousLabel.href = previous.href;
    predecessor.append(previousLabel); aside.append(predecessor);
    const text = element('div', 'administration-office-content');
    const facts = element('dl', 'administration-office-facts');
    [['Bereich', area.title], ['Ebene', group.title], ['Zuständig für', role.jurisdiction], ['Berichtet an', role.reportsTo]].forEach(([term, value]) => {
      if (!value) return;
      const pair = element('div'); pair.append(element('dt', '', term), element('dd', '', value)); facts.append(pair);
    });
    text.append(facts, element('h3', '', 'Aufgabe und Verantwortung'), element('p', '', role.description || `Dieses Amt gehört zur Gruppe ${group.title}. Die nähere Aufgabenbeschreibung ist noch offen.`));
    if (role.authority) text.append(element('h3', '', 'Vollmacht und Grenzen'), element('p', '', role.authority));
    if (role.crew) {
      const crew = element('section', 'administration-office-crew');
      crew.id = 'administration-office-crew';
      crew.append(element('h3', '', role.crew.label || 'Schiffsmannschaft'));
      const image = portraitImage(role.crew.image || '/Kontinente/modules/administration/assets/crew-flag-placeholder.svg');
      image.className = 'administration-office-flag';
      crew.append(image);
      if (role.crew.href) {
        const link = element('a', 'administration-module-link', 'Schiffsmannschaft im Almanach öffnen ↗');
        link.href = role.crew.href; crew.append(link);
      } else crew.append(element('p', '', 'Die eigene Schiffsmannschaft ist für diesen Posten vorgesehen. Flagge, Schiff und Besatzung sind noch nicht ausgearbeitet.'));
      text.append(crew);
    }
    if (role.connections?.length) {
      text.append(element('h3', '', 'Zusammenarbeit mit anderen Bereichen'));
      role.connections.forEach(connection => {
        const entry = element('div', 'administration-office-connection');
        const button = element('button', 'administration-crosslink', connection.label);
        button.type = 'button';
        button.addEventListener('click', () => {
          dialog.close();
          owner.dispatchEvent(new CustomEvent('administration:navigate', { detail: { areaId: connection.area } }));
        });
        entry.append(button, element('p', '', connection.description)); text.append(entry);
      });
    }
    if (role.links?.length) {
      const links = element('div', 'administration-office-links');
      role.links.forEach(item => {
        const link = element('a', 'administration-module-link', item.label);
        link.href = item.href; links.append(link);
      });
      text.append(links);
    }
    body.append(aside, text);
    dialog.showModal();
    body.scrollTop = 0;
    heading.focus({ preventScroll: true });
    if (target.dataset.showCrew) text.querySelector('.administration-office-crew')?.scrollIntoView({ block: 'nearest' });
  });
}
