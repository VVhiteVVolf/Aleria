// Cultural class preview. Universal classes have their own authored pages.
// Level progression is planned in docs/CLASS_PROGRESSION_PLAN.md only.

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function renderClassSheet(entry) {
  const fragment = document.createDocumentFragment();
  const header = element('header', 'sheet-header');
  const image = element('img', 'sheet-icon');
  image.src = entry.icon;
  image.alt = '';
  const heading = element('div');
  const title = element('h2', '', entry.name);
  title.id = 'sheet-title';
  const description = element('p', 'sheet-description', entry.description);
  description.id = 'sheet-description';
  heading.append(element('p', 'eyebrow', entry.groupName), title, description);
  header.append(image, heading);
  fragment.append(header);

  const notice = element('div', 'sheet-notice');
  notice.append(element('span', 'status-badge', 'Klassenbogen in Vorbereitung'),
    element('p', '', 'Dieser Pfad erhält einen eigenen Klassenbogen für das Kampfsystem. Fähigkeiten, Ressourcen und Freischaltungen werden für Level 1 bis 20 ausgearbeitet.'));
  fragment.append(notice);

  return fragment;
}

export function createClassSheetView(dialog) {
  const content = dialog.querySelector('[data-role="sheet-content"]');
  let currentId = '';
  return {
    open(entry) {
      if (currentId !== entry.id || !dialog.open) {
        content.replaceChildren(renderClassSheet(entry));
        currentId = entry.id;
      }
      if (!dialog.open) dialog.showModal();
      dialog.scrollTop = 0;
    },
    close() {
      if (dialog.open) dialog.close();
    }
  };
}
