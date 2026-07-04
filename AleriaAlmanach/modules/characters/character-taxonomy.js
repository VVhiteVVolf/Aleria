function splitCharacterTaxonomyPath(value) {
  return String(value || '')
    .split('>')
    .map(part => part.trim())
    .filter(Boolean);
}

function getCharacterStatusValue(value) {
  const normalized = normalizeSearchText(value || '');
  if (normalized === 'aktiv' || normalized === 'active') return 'active';
  if (normalized === 'inaktiv' || normalized === 'inactive') return 'inactive';
  if (normalized === 'tot' || normalized === 'dead' || normalized === 'verstorben') return 'dead';
  if (normalized === 'verschollen' || normalized === 'missing') return 'missing';
  if (normalized === 'unklar' || normalized === 'unknown') return 'unknown';
  return '';
}

function getCharacterStatusLabel(value) {
  const status = getCharacterStatusValue(value);
  if (status === 'active') return 'Aktiv';
  if (status === 'inactive') return 'Inaktiv';
  if (status === 'dead') return 'Tot';
  if (status === 'missing') return 'Verschollen';
  if (status === 'unknown') return 'Unklar';
  return '';
}

function getCharacterRelevanceValue(value) {
  const normalized = normalizeSearchText(value || '');
  if (normalized === 'nebenfigur' || normalized === 'minor') return 'minor';
  if (normalized === 'tragend' || normalized === 'supporting') return 'supporting';
  if (normalized === 'wichtig' || normalized === 'important') return 'important';
  if (normalized === 'plot' || normalized === 'plotknoten' || normalized === 'plot-knoten') return 'plot';
  return '';
}

function getCharacterRelevanceLabel(value) {
  const relevance = getCharacterRelevanceValue(value);
  if (relevance === 'minor') return 'Nebenfigur';
  if (relevance === 'supporting') return 'Tragend';
  if (relevance === 'important') return 'Wichtig';
  if (relevance === 'plot') return 'Plot-Knoten';
  return '';
}

function buildCharacterGroupTaxonomyTree() {
  const root = [];
  const rootByLabel = new Map();

  const getOrCreateChild = (children, byLabel, label) => {
    const key = normalizeSearchText(label);
    let node = byLabel.get(key);
    if (!node) {
      node = { label, children: [], childrenByLabel: new Map(), count: 0, tab: '', subtabs: [] };
      byLabel.set(key, node);
      children.push(node);
    }
    return node;
  };

  (_charTabs || []).forEach(tab => {
    if (!tab || tab === 'Alle' || tab === CHARACTER_ARCHIVE_TAB) return;
    const parts = splitCharacterTaxonomyPath(tab);
    const labels = parts.length ? parts : [tab];
    const count = (_charTabMap[tab] || []).filter(id => {
      const char = getCharacterById(id);
      return char && (_showArchivedCharacters || !char.archived);
    }).length;
    let children = root;
    let byLabel = rootByLabel;
    let current = null;
    labels.forEach(label => {
      current = getOrCreateChild(children, byLabel, label);
      current.count += count;
      children = current.children;
      byLabel = current.childrenByLabel;
    });
    if (current) {
      current.tab = tab;
      current.subtabs = getCharacterSubtabs(tab).filter(subtab => subtab && subtab !== 'Alle');
    }
  });

  return root;
}

function decorateCharacterTaxonomyDropTarget(element, tab, subtab = '') {
  if (!element || !tab || tab === 'Alle' || tab === CHARACTER_ARCHIVE_TAB) return;
  element.addEventListener('dragover', event => {
    event.preventDefault();
    element.classList.add('drag-over');
  });
  element.addEventListener('dragleave', () => element.classList.remove('drag-over'));
  element.addEventListener('drop', event => {
    event.preventDefault();
    element.classList.remove('drag-over');
    if (!_dragCharId) return;
    if (subtab) assignCharToSubtab(_dragCharId, tab, subtab);
    else assignCharToTab(_dragCharId, tab);
  });
}

function createCharacterTaxonomyGroupButton(node, depth) {
  const button = document.createElement('button');
  button.className = 'char-taxonomy-node-btn' + (node.tab === _activeCharTab ? ' active' : '');
  button.type = 'button';
  button.dataset.charTabAction = node.tab ? 'select' : 'noop';
  button.dataset.charTab = node.tab || '';
  button.style.setProperty('--char-taxonomy-depth', String(depth));

  const label = document.createElement('span');
  label.className = 'char-taxonomy-label';
  label.textContent = node.label;

  const count = document.createElement('span');
  count.className = 'char-taxonomy-count';
  count.textContent = String(node.count || 0);

  button.appendChild(label);
  button.appendChild(count);

  if (node.tab && _charOrganizeMode) {
    const rename = document.createElement('span');
    rename.className = 'char-subtab-action';
    rename.textContent = 'Bearbeiten';
    rename.title = 'Gruppe umbenennen';
    rename.dataset.charTabAction = 'rename';
    rename.dataset.charTab = node.tab;

    const del = document.createElement('span');
    del.className = 'char-subtab-del';
    del.textContent = 'Löschen';
    del.title = 'Gruppe löschen';
    del.dataset.charTabAction = 'delete';
    del.dataset.charTab = node.tab;

    button.appendChild(rename);
    button.appendChild(del);
  }
  if (node.tab) decorateCharacterTaxonomyDropTarget(button, node.tab);

  return button;
}

function appendCharacterTaxonomyNodes(parent, nodes, depth = 0) {
  nodes.forEach(node => {
    const row = document.createElement('div');
    row.className = 'char-taxonomy-node';
    row.appendChild(createCharacterTaxonomyGroupButton(node, depth));
    parent.appendChild(row);

    if (node.tab && node.subtabs.length) {
      const subtabList = document.createElement('div');
      subtabList.className = 'char-taxonomy-subtabs';
      subtabList.style.setProperty('--char-taxonomy-depth', String(depth + 1));
      node.subtabs.forEach(subtab => {
        const ids = ((_charSubtabMap[node.tab] || {})[subtab] || []);
        const count = ids.filter(id => {
          const char = getCharacterById(id);
          return char && (_showArchivedCharacters || !char.archived);
        }).length;
        const subtabButton = document.createElement('button');
        subtabButton.className = 'char-taxonomy-subtab-btn'
          + (node.tab === _activeCharTab && subtab === _activeCharSubtab ? ' active' : '');
        subtabButton.type = 'button';
        subtabButton.dataset.charTabAction = 'select-subtab';
        subtabButton.dataset.charTab = node.tab;
        subtabButton.dataset.charSubtab = subtab;
        subtabButton.innerHTML = `<span>${escapeHtml(subtab)}</span><span>${count}</span>`;
        decorateCharacterTaxonomyDropTarget(subtabButton, node.tab, subtab);
        subtabList.appendChild(subtabButton);
      });
      parent.appendChild(subtabList);
    }

    if (node.children.length) appendCharacterTaxonomyNodes(parent, node.children, depth + 1);
  });
}

function createCharacterTaxonomyNavigator() {
  const shell = document.createElement('div');
  shell.className = 'char-taxonomy-shell';

  const tools = document.createElement('div');
  tools.className = 'char-taxonomy-tools';
  tools.appendChild(createCharacterTabButton('Alle'));
  tools.appendChild(createCharacterArchiveTabButton());

  const addBtn = document.createElement('button');
  addBtn.className = 'char-subtab-add';
  addBtn.textContent = '+ Gruppe';
  addBtn.dataset.charTabAction = 'add';
  tools.appendChild(addBtn);
  shell.appendChild(tools);

  const tree = document.createElement('div');
  tree.className = 'char-taxonomy-tree';
  const nodes = buildCharacterGroupTaxonomyTree();
  if (nodes.length) {
    appendCharacterTaxonomyNodes(tree, nodes);
  } else {
    const empty = document.createElement('div');
    empty.className = 'char-taxonomy-empty';
    empty.textContent = 'Noch keine Gruppen angelegt.';
    tree.appendChild(empty);
  }
  shell.appendChild(tree);

  return shell;
}
