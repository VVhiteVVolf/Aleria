let _characters  = [];
let _charactersLoaded = false;
let _charTabsLoaded = false;
const CHARACTER_ARCHIVE_TAB = 'Archiv';

let _charTabs = ['Alle'];
let _charTabMap = {};
let _charSubtabs = {};
let _charSubtabMap = {};
let _activeCharTab = 'Alle';
let _activeCharSubtab = 'Alle';
let _dragCharId = null;
let _showArchivedCharacters = false;
let _hiddenBuiltinCharacterIds = new Set();
let _charOrganizeMode = false;
let _collapsedCharGroups = new Set();

async function loadCharacters() {
  if (!_fbReady) await waitForFirebaseReady();
  if (!window._fb?.loadCharacters) {
    if (!_charactersLoaded) {
      _characters = [];
      _charactersLoaded = true;
      showAppStatus('Charakterdaten konnten nicht online geladen werden. Die Seite bleibt im lokalen Lesemodus nutzbar.', 'error');
    }
    renderCharSubtabs();
    renderCharGrid();
    renderCharPickerInForm();
    return;
  }

  if (!_charactersLoaded) {
    _characters = await window._fb.loadCharacters();
    _charactersLoaded = true;
  }

  if (!_charTabsLoaded) {
    const saved = window._fb?.loadCharTabs ? await window._fb.loadCharTabs() : null;
    if (saved && saved.tabs) {
      _charTabs = saved.tabs;
      _charTabMap = saved.map || {};
      _charSubtabs = saved.subtabs && typeof saved.subtabs === 'object' ? saved.subtabs : {};
      _charSubtabMap = saved.subtabMap && typeof saved.subtabMap === 'object' ? saved.subtabMap : {};
      _hiddenBuiltinCharacterIds = new Set(Array.isArray(saved.hiddenBuiltins) ? saved.hiddenBuiltins : []);
    } else {
      _charTabs = ['Alle'];
      _charTabMap = {};
      _charSubtabs = {};
      _charSubtabMap = {};
      _hiddenBuiltinCharacterIds = new Set();
    }
    _charTabsLoaded = true;
  }

  if (!_charTabs.includes('Alle')) _charTabs.unshift('Alle');
  _charTabs = _charTabs.filter(tab => tab !== CHARACTER_ARCHIVE_TAB);
  normalizeCharTabState();

  renderCharSubtabs();
  renderCharGrid();
  renderCharPickerInForm();
  refreshAllModuleCastPickers();
}

function saveCharTabs() {
  if (!window._fb?.saveCharTabs) {
    showAppStatus('Charakter-Reiter konnten nicht online gespeichert werden.', 'error');
    return Promise.resolve();
  }
  return window._fb.saveCharTabs({
    tabs: _charTabs.filter(tab => tab !== CHARACTER_ARCHIVE_TAB),
    map: _charTabMap,
    subtabs: _charSubtabs,
    subtabMap: _charSubtabMap,
    hiddenBuiltins: Array.from(_hiddenBuiltinCharacterIds)
  }).catch(error => {
    console.error('character tab save failed:', error);
    showAppStatus('Charakter-Reiter konnten nicht gespeichert werden.', 'error');
  });
}

function normalizeCharTabName(value) {
  return String(value || '').trim();
}

function normalizeCharTabState() {
  const validTabs = new Set(_charTabs.filter(tab => tab && tab !== CHARACTER_ARCHIVE_TAB));
  if (!validTabs.has('Alle')) {
    _charTabs.unshift('Alle');
    validTabs.add('Alle');
  }

  Object.keys(_charTabMap).forEach(tab => {
    if (!validTabs.has(tab) || tab === 'Alle') {
      delete _charTabMap[tab];
      return;
    }
    _charTabMap[tab] = Array.from(new Set(Array.isArray(_charTabMap[tab]) ? _charTabMap[tab].filter(Boolean) : []));
  });

  Object.keys(_charSubtabs).forEach(tab => {
    if (!validTabs.has(tab) || tab === 'Alle') {
      delete _charSubtabs[tab];
      delete _charSubtabMap[tab];
      return;
    }
    const seen = new Set();
    _charSubtabs[tab] = (Array.isArray(_charSubtabs[tab]) ? _charSubtabs[tab] : [])
      .map(normalizeCharTabName)
      .filter(name => name && name !== 'Alle' && !seen.has(name) && seen.add(name));
  });

  Object.keys(_charSubtabMap).forEach(tab => {
    if (!validTabs.has(tab) || tab === 'Alle') {
      delete _charSubtabMap[tab];
      return;
    }
    if (!_charSubtabMap[tab] || typeof _charSubtabMap[tab] !== 'object' || Array.isArray(_charSubtabMap[tab])) {
      _charSubtabMap[tab] = {};
    }
    const validSubtabs = new Set(getCharacterSubtabs(tab));
    Object.keys(_charSubtabMap[tab] || {}).forEach(subtab => {
      if (!validSubtabs.has(subtab)) {
        delete _charSubtabMap[tab][subtab];
        return;
      }
      _charSubtabMap[tab][subtab] = Array.from(new Set(Array.isArray(_charSubtabMap[tab][subtab]) ? _charSubtabMap[tab][subtab].filter(Boolean) : []));
      if (!_charTabMap[tab]) _charTabMap[tab] = [];
      _charSubtabMap[tab][subtab].forEach(id => {
        if (id && !_charTabMap[tab].includes(id)) _charTabMap[tab].push(id);
      });
    });
  });

  if (_activeCharTab !== CHARACTER_ARCHIVE_TAB && !_charTabs.includes(_activeCharTab)) _activeCharTab = 'Alle';
  if (_activeCharTab === CHARACTER_ARCHIVE_TAB || !getCharacterSubtabs(_activeCharTab).includes(_activeCharSubtab)) {
    _activeCharSubtab = 'Alle';
  }
}

function getCharacterSubtabs(tab) {
  if (!tab || tab === 'Alle' || tab === CHARACTER_ARCHIVE_TAB) return ['Alle'];
  return ['Alle', ...(_charSubtabs[tab] || [])];
}

function getCharacterAssignedSubtab(charId, tab = getCharacterAssignedTab(charId)) {
  const id = String(charId || '');
  if (!id || !tab || tab === 'Alle' || tab === CHARACTER_ARCHIVE_TAB) return '';
  const map = _charSubtabMap[tab] || {};
  return Object.keys(map).find(subtab => (map[subtab] || []).includes(id)) || '';
}

function removeCharacterFromSubtabs(charId, tab = '') {
  const id = String(charId || '');
  if (!id) return;
  const tabs = tab ? [tab] : Object.keys(_charSubtabMap);
  tabs.forEach(parent => {
    Object.keys(_charSubtabMap[parent] || {}).forEach(subtab => {
      _charSubtabMap[parent][subtab] = (_charSubtabMap[parent][subtab] || []).filter(item => item !== id);
    });
  });
}

function getCharacterAssignedTab(charId) {
  const id = String(charId || '');
  if (!id) return '';
  return _charTabs.find(tab => tab !== 'Alle' && (_charTabMap[tab] || []).includes(id)) || '';
}

function renameCharTab(tab) {
  if (tab === 'Alle') return;
  const next = prompt('Gruppenname:', tab)?.trim();
  if (!next || next === tab) return;
  if (_charTabs.includes(next)) {
    alert('Diese Gruppe existiert bereits.');
    return;
  }
  const index = _charTabs.indexOf(tab);
  if (index < 0) return;
  _charTabs[index] = next;
  _charTabMap[next] = _charTabMap[tab] || [];
  delete _charTabMap[tab];
  _charSubtabs[next] = _charSubtabs[tab] || [];
  _charSubtabMap[next] = _charSubtabMap[tab] || {};
  delete _charSubtabs[tab];
  delete _charSubtabMap[tab];
  if (_activeCharTab === tab) _activeCharTab = next;
  saveCharTabs();
  renderCharSubtabs();
  renderCharGrid();
}

function selectCharacterTab(tab) {
  if (!tab) return;
  if (tab !== CHARACTER_ARCHIVE_TAB && !_charTabs.includes(tab)) return;
  _activeCharTab = tab;
  _activeCharSubtab = 'Alle';
  renderCharSubtabs();
  renderCharGrid();
}

function selectCharacterSubtab(subtab) {
  const next = getCharacterSubtabs(_activeCharTab).includes(subtab) ? subtab : 'Alle';
  _activeCharSubtab = next;
  renderCharSubtabs();
  renderCharGrid();
}

function deleteCharTab(tab) {
  if (!tab || tab === 'Alle') return;
  if (!confirm('Gruppe "' + tab + '" löschen? Charaktere bleiben erhalten.')) return;
  _charTabs = _charTabs.filter(item => item !== tab);
  delete _charTabMap[tab];
  delete _charSubtabs[tab];
  delete _charSubtabMap[tab];
  if (_activeCharTab === tab) _activeCharTab = 'Alle';
  _activeCharSubtab = 'Alle';
  saveCharTabs();
  renderCharSubtabs();
  renderCharGrid();
}

function createCharacterGroup() {
  const suggested = 'Gruppe ' + (_charTabs.length);
  const rawName = prompt('Name der neuen Gruppe:', suggested);
  if (rawName === null) return;
  const name = normalizeCharTabName(rawName) || suggested;
  if (_charTabs.includes(name)) {
    alert('Diese Gruppe existiert bereits.');
    return;
  }
  _charTabs.push(name);
  _charTabMap[name] = [];
  _charSubtabs[name] = [];
  _charSubtabMap[name] = {};
  _activeCharTab = name;
  _activeCharSubtab = 'Alle';
  normalizeCharTabState();
  saveCharTabs();
  renderCharSubtabs();
  renderCharGrid();
}

function createCharacterSubtab(parentTab = _activeCharTab) {
  if (!parentTab || parentTab === 'Alle' || parentTab === CHARACTER_ARCHIVE_TAB) return;
  const existing = getCharacterSubtabs(parentTab);
  const suggested = 'Untergruppe ' + existing.length;
  const rawName = prompt('Name der neuen Untergruppe:', suggested);
  if (rawName === null) return;
  const name = normalizeCharTabName(rawName) || suggested;
  if (existing.includes(name)) {
    alert('Diese Untergruppe existiert bereits.');
    return;
  }
  if (!_charSubtabs[parentTab]) _charSubtabs[parentTab] = [];
  if (!_charSubtabMap[parentTab]) _charSubtabMap[parentTab] = {};
  _charSubtabs[parentTab].push(name);
  _charSubtabMap[parentTab][name] = [];
  _activeCharSubtab = name;
  normalizeCharTabState();
  saveCharTabs();
  renderCharSubtabs();
  renderCharGrid();
}

function renameCharacterSubtab(parentTab, subtab) {
  if (!parentTab || !subtab || subtab === 'Alle') return;
  const next = normalizeCharTabName(prompt('Untergruppenname:', subtab));
  if (!next || next === subtab) return;
  if (getCharacterSubtabs(parentTab).includes(next)) {
    alert('Diese Untergruppe existiert bereits.');
    return;
  }
  const subtabs = _charSubtabs[parentTab] || [];
  const index = subtabs.indexOf(subtab);
  if (index < 0) return;
  subtabs[index] = next;
  if (!_charSubtabMap[parentTab]) _charSubtabMap[parentTab] = {};
  _charSubtabMap[parentTab][next] = _charSubtabMap[parentTab][subtab] || [];
  delete _charSubtabMap[parentTab][subtab];
  if (_activeCharSubtab === subtab) _activeCharSubtab = next;
  saveCharTabs();
  renderCharSubtabs();
  renderCharGrid();
}

function deleteCharacterSubtab(parentTab, subtab) {
  if (!parentTab || !subtab || subtab === 'Alle') return;
  if (!confirm('Untergruppe "' + subtab + '" löschen? Charaktere bleiben im Hauptreiter.')) return;
  _charSubtabs[parentTab] = (_charSubtabs[parentTab] || []).filter(item => item !== subtab);
  if (_charSubtabMap[parentTab]) delete _charSubtabMap[parentTab][subtab];
  if (_activeCharSubtab === subtab) _activeCharSubtab = 'Alle';
  saveCharTabs();
  renderCharSubtabs();
  renderCharGrid();
}

function assignCharToSubtab(charId, parentTab, subtab) {
  const id = String(charId || '');
  if (!id || !parentTab || parentTab === 'Alle' || parentTab === CHARACTER_ARCHIVE_TAB) return;
  assignCharToTab(id, parentTab, { render: false, save: false });
  removeCharacterFromSubtabs(id, parentTab);
  if (subtab && subtab !== 'Alle') {
    if (!_charSubtabMap[parentTab]) _charSubtabMap[parentTab] = {};
    if (!_charSubtabMap[parentTab][subtab]) _charSubtabMap[parentTab][subtab] = [];
    if (!_charSubtabMap[parentTab][subtab].includes(id)) _charSubtabMap[parentTab][subtab].push(id);
  }
  saveCharTabs();
  renderCharSubtabs();
  renderCharGrid();
}

function createCharacterTabButton(tab) {
  const btn = document.createElement('button');
  btn.className = 'char-subtab-btn' + (tab === _activeCharTab ? ' active' : '');
  btn.type = 'button';
  btn.dataset.charTabAction = 'select';
  btn.dataset.charTab = tab;

  if (tab === 'Alle') {
    btn.innerHTML = '<span>Alle</span>';
    return btn;
  }

  const count = (_charTabMap[tab] || []).filter(id => {
    const char = getCharacterById(id);
    return char && (_showArchivedCharacters || !char.archived);
  }).length;
  const label = document.createElement('span');
  label.className = 'char-subtab-label';
  label.textContent = `${tab} (${count})`;

  const rename = document.createElement('span');
  rename.className = 'char-subtab-action';
  rename.textContent = 'Bearbeiten';
  rename.title = 'Gruppe umbenennen';
  rename.dataset.charTabAction = 'rename';
  rename.dataset.charTab = tab;

  const del = document.createElement('span');
  del.className = 'char-subtab-del';
  del.textContent = 'Löschen';
  del.title = 'Gruppe löschen';
  del.dataset.charTabAction = 'delete';
  del.dataset.charTab = tab;

  btn.appendChild(label);
  btn.appendChild(rename);
  btn.appendChild(del);
  btn.addEventListener('dragover', event => {
    event.preventDefault();
    btn.classList.add('drag-over');
  });
  btn.addEventListener('dragleave', () => btn.classList.remove('drag-over'));
  btn.addEventListener('drop', event => {
    event.preventDefault();
    btn.classList.remove('drag-over');
    if (_dragCharId) assignCharToTab(_dragCharId, tab);
  });
  return btn;
}

function createCharacterArchiveTabButton() {
  const archivedCount = getAllCharacterRecords().filter(char => char.archived).length;
  const btn = document.createElement('button');
  btn.className = 'char-subtab-btn' + (_activeCharTab === CHARACTER_ARCHIVE_TAB ? ' active' : '');
  btn.type = 'button';
  btn.innerHTML = `<span>${CHARACTER_ARCHIVE_TAB} (${archivedCount})</span>`;
  btn.disabled = archivedCount === 0;
  btn.dataset.charTabAction = 'select';
  btn.dataset.charTab = CHARACTER_ARCHIVE_TAB;
  return btn;
}

function renderCharacterSubtabRow(parent) {
  if (!parent || parent === 'Alle' || parent === CHARACTER_ARCHIVE_TAB) return null;
  const row = document.createElement('div');
  row.className = 'char-subtabs-child-row';
  row.setAttribute('aria-label', `Untergruppen für ${parent}`);

  getCharacterSubtabs(parent).forEach(subtab => {
    const btn = document.createElement('button');
    btn.className = 'char-subtab-btn char-subtab-child-btn' + (subtab === _activeCharSubtab ? ' active' : '');
    btn.type = 'button';
    btn.dataset.charTabAction = 'select-subtab';
    btn.dataset.charTab = parent;
    btn.dataset.charSubtab = subtab;

    const ids = subtab === 'Alle'
      ? (_charTabMap[parent] || [])
      : ((_charSubtabMap[parent] || {})[subtab] || []);
    const count = ids.filter(id => {
      const char = getCharacterById(id);
      return char && (_showArchivedCharacters || !char.archived);
    }).length;

    const label = document.createElement('span');
    label.className = 'char-subtab-label';
    label.textContent = `${subtab === 'Alle' ? 'Alle Untergruppen' : subtab} (${count})`;
    btn.appendChild(label);

    if (subtab !== 'Alle') {
      const rename = document.createElement('span');
      rename.className = 'char-subtab-action';
      rename.textContent = 'Bearbeiten';
      rename.title = 'Untergruppe umbenennen';
      rename.dataset.charTabAction = 'rename-subtab';
      rename.dataset.charTab = parent;
      rename.dataset.charSubtab = subtab;

      const del = document.createElement('span');
      del.className = 'char-subtab-del';
      del.textContent = 'Löschen';
      del.title = 'Untergruppe löschen';
      del.dataset.charTabAction = 'delete-subtab';
      del.dataset.charTab = parent;
      del.dataset.charSubtab = subtab;

      btn.appendChild(rename);
      btn.appendChild(del);
    }

    btn.addEventListener('dragover', event => {
      event.preventDefault();
      btn.classList.add('drag-over');
    });
    btn.addEventListener('dragleave', () => btn.classList.remove('drag-over'));
    btn.addEventListener('drop', event => {
      event.preventDefault();
      btn.classList.remove('drag-over');
      if (_dragCharId) assignCharToSubtab(_dragCharId, parent, subtab);
    });
    row.appendChild(btn);
  });

  const addBtn = document.createElement('button');
  addBtn.className = 'char-subtab-add char-subtab-child-add';
  addBtn.textContent = '+ Untergruppe';
  addBtn.dataset.charTabAction = 'add-subtab';
  addBtn.dataset.charTab = parent;
  row.appendChild(addBtn);
  return row;
}

function renderCharSubtabs() {
  normalizeCharTabState();
  const bar = document.getElementById('char-subtabs-bar');
  if (!bar) return;
  bar.innerHTML = '';

  _charTabs.forEach(tab => {
    bar.appendChild(createCharacterTabButton(tab));
  });

  bar.appendChild(createCharacterArchiveTabButton());

  const addBtn = document.createElement('button');
  addBtn.className = 'char-subtab-add';
  addBtn.textContent = '+ Gruppe';
  addBtn.dataset.charTabAction = 'add';
  bar.appendChild(addBtn);

  const childRow = renderCharacterSubtabRow(_activeCharTab);
  if (childRow) bar.appendChild(childRow);
}

function handleCharacterSubtabClick(event) {
  const trigger = event.target?.closest?.('[data-char-tab-action]');
  const bar = document.getElementById('char-subtabs-bar');
  if (!trigger || !bar || !bar.contains(trigger)) return;

  const action = trigger.dataset.charTabAction;
  const tab = trigger.dataset.charTab || '';
  const subtab = trigger.dataset.charSubtab || '';

  event.preventDefault();
  event.stopPropagation();

  if (action === 'select') {
    selectCharacterTab(tab);
    return;
  }
  if (action === 'select-subtab') {
    selectCharacterSubtab(subtab);
    return;
  }
  if (action === 'rename') {
    renameCharTab(tab);
    return;
  }
  if (action === 'rename-subtab') {
    renameCharacterSubtab(tab, subtab);
    return;
  }
  if (action === 'delete') {
    deleteCharTab(tab);
    return;
  }
  if (action === 'delete-subtab') {
    deleteCharacterSubtab(tab, subtab);
    return;
  }
  if (action === 'add') {
    createCharacterGroup();
    return;
  }
  if (action === 'add-subtab') {
    createCharacterSubtab(tab);
  }
}

document.addEventListener('click', handleCharacterSubtabClick);

function assignCharToTab(charId, tab, options = {}) {
  const shouldRender = options.render !== false;
  const shouldSave = options.save !== false;
  _charTabs.forEach(item => {
    if (item !== 'Alle' && _charTabMap[item]) {
      _charTabMap[item] = _charTabMap[item].filter(id => id !== charId);
    }
  });
  removeCharacterFromSubtabs(charId);

  if (tab === 'Alle' || !tab) {
    if (shouldSave) saveCharTabs();
    if (shouldRender) {
      renderCharSubtabs();
      renderCharGrid();
    }
    return;
  }

  if (!_charTabMap[tab]) _charTabMap[tab] = [];
  if (!_charTabMap[tab].includes(charId)) _charTabMap[tab].push(charId);
  if (shouldSave) saveCharTabs();
  if (shouldRender) {
    renderCharSubtabs();
    renderCharGrid();
  }
}
