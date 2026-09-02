import {
  assertValidHousePlacement,
  createHousePlacementFromProfile,
  normalizeHousePlacement,
  REQUIRED_HOUSE_PLACEMENT_LEVELS
} from '../modules/family-registry/house-placement-policy.js';

const MINIMUM_LEVEL_COUNT = REQUIRED_HOUSE_PLACEMENT_LEVELS.length;

function levelLabel(index) {
  return REQUIRED_HOUSE_PLACEMENT_LEVELS[index]?.label || `Weitere Pfadstufe ${index + 1}`;
}

function renderLevel(index) {
  const removable = index >= MINIMUM_LEVEL_COUNT;
  const inputNumber = index + 1;
  return `
    <div class="house-placement-level" data-house-placement-level="${index}">
      <div class="house-placement-level__heading">
        <strong>Ebene ${inputNumber} · ${levelLabel(index)}</strong>
        ${removable ? '<button class="button button--quiet house-placement-level__remove" type="button" data-house-placement-remove>Ebene entfernen</button>' : ''}
      </div>
      <div class="house-placement-level__fields">
        <label class="field">Bezeichnung
          <input name="folderPathLevel${inputNumber}" maxlength="120" data-house-placement-path autocomplete="off">
        </label>
        <label class="field">Icon-URL oder lokaler Projektpfad
          <input name="folderIconLevel${inputNumber}" maxlength="1000" data-house-placement-icon placeholder="https://i.imgur.com/DATEI.png">
        </label>
        <label class="field house-placement-level__upload" data-cloud-asset-field>Icon lokal auswählen
          <input type="file" accept="image/png,image/jpeg,image/webp" data-family-asset-upload data-asset-kind="folder-icon-${index}" data-asset-target="folderIconLevel${inputNumber}">
          <span class="asset-upload-status" data-asset-upload-status>Quelldatei bis 8 MB · größere Bilder werden für den lokalen Entwurf automatisch optimiert</span>
        </label>
      </div>
    </div>
  `;
}

export function createHousePlacementFields(container, {
  rankSelect,
  onUpdate = () => {}
} = {}) {
  if (!container) throw new Error('Der Bereich für die Registereinsortierung fehlt.');
  let levelCount = MINIMUM_LEVEL_COUNT;

  container.innerHTML = `
    <div class="house-placement__header">
      <div>
        <p class="eyebrow">Systematische Registereinsortierung</p>
        <h4>Pfad vom Reich bis zur Ortschaft</h4>
        <p>Jede Ebene benötigt eine Bezeichnung und ein eigenes Icon. Die nächste Ebene wird erst danach freigeschaltet.</p>
      </div>
      <label class="checkbox-field house-placement__unclassified">
        <input type="checkbox" name="placementUnclassified" data-house-placement-unclassified>
        Nicht einsortiert speichern
      </label>
    </div>
    <div class="house-placement__levels" data-house-placement-levels></div>
    <button class="button button--quiet house-placement__add" type="button" data-house-placement-add>＋ Weitere Pfadstufe</button>
  `;

  const levelsElement = container.querySelector('[data-house-placement-levels]');
  const unclassifiedInput = container.querySelector('[data-house-placement-unclassified]');
  const addButton = container.querySelector('[data-house-placement-add]');

  function valuesFromRows() {
    const rows = [...container.querySelectorAll('[data-house-placement-level]')];
    return {
      folderPath: rows.map(row => row.querySelector('[data-house-placement-path]').value),
      folderIcons: rows.map(row => row.querySelector('[data-house-placement-icon]').value)
    };
  }

  function renderRows(values = {}) {
    const folderPath = Array.isArray(values.folderPath) ? values.folderPath : [];
    const folderIcons = Array.isArray(values.folderIcons) ? values.folderIcons : [];
    levelCount = Math.max(MINIMUM_LEVEL_COUNT, folderPath.length, folderIcons.length, levelCount);
    levelsElement.innerHTML = Array.from({ length: levelCount }, (unused, index) => renderLevel(index)).join('');
    [...levelsElement.querySelectorAll('[data-house-placement-level]')].forEach((row, index) => {
      row.querySelector('[data-house-placement-path]').value = folderPath[index] || '';
      row.querySelector('[data-house-placement-icon]').value = folderIcons[index] || '';
    });
  }

  function updateAvailability() {
    const rows = [...container.querySelectorAll('[data-house-placement-level]')];
    const unclassified = unclassifiedInput.checked;
    let previousComplete = true;
    rows.forEach((row, index) => {
      const pathInput = row.querySelector('[data-house-placement-path]');
      const iconInput = row.querySelector('[data-house-placement-icon]');
      const fileInput = row.querySelector('[data-family-asset-upload]');
      const unlocked = !unclassified && previousComplete;
      row.classList.toggle('is-disabled', !unlocked);
      pathInput.disabled = !unlocked;
      iconInput.disabled = !unlocked;
      fileInput.disabled = !unlocked;
      pathInput.required = unlocked;
      iconInput.required = unlocked;
      previousComplete = unlocked && Boolean(pathInput.value.trim() && iconInput.value.trim());
      if (index >= MINIMUM_LEVEL_COUNT) {
        row.querySelector('[data-house-placement-remove]').disabled = unclassified;
      }
    });
    addButton.disabled = unclassified || !previousComplete;
    container.classList.toggle('is-unclassified', unclassified);
    onUpdate(read({ validate: false }));
  }

  function setValue(value = {}) {
    const placement = normalizeHousePlacement(value);
    levelCount = Math.max(MINIMUM_LEVEL_COUNT, placement.folderPath.length, placement.folderIcons.length);
    renderRows(placement);
    unclassifiedInput.checked = placement.unclassified;
    updateAvailability();
  }

  function setFromProfile(profile = {}, options = {}) {
    setValue(createHousePlacementFromProfile(profile, options));
  }

  function read({ validate = true } = {}) {
    const rows = valuesFromRows();
    const value = {
      unclassified: unclassifiedInput.checked,
      rankId: rankSelect?.value || 'unknown',
      folderPath: rows.folderPath,
      folderIcons: rows.folderIcons
    };
    return validate ? assertValidHousePlacement(value) : normalizeHousePlacement(value);
  }

  function addLevel() {
    const values = valuesFromRows();
    levelCount += 1;
    renderRows(values);
    updateAvailability();
    const rows = [...container.querySelectorAll('[data-house-placement-level]')];
    rows.at(-1)?.querySelector('[data-house-placement-path]')?.focus();
  }

  function removeLevel(row) {
    const rows = [...container.querySelectorAll('[data-house-placement-level]')];
    const index = rows.indexOf(row);
    if (index < MINIMUM_LEVEL_COUNT) return;
    const values = valuesFromRows();
    values.folderPath.splice(index, 1);
    values.folderIcons.splice(index, 1);
    levelCount = Math.max(MINIMUM_LEVEL_COUNT, levelCount - 1);
    renderRows(values);
    updateAvailability();
  }

  function onInput(event) {
    if (!event.target.matches('[data-house-placement-path], [data-house-placement-icon]')) return;
    updateAvailability();
  }

  function onChange(event) {
    if (event.target !== unclassifiedInput) return;
    updateAvailability();
  }

  function onClick(event) {
    const add = event.target.closest('[data-house-placement-add]');
    if (add) {
      event.preventDefault();
      addLevel();
      return;
    }
    const remove = event.target.closest('[data-house-placement-remove]');
    if (!remove) return;
    event.preventDefault();
    removeLevel(remove.closest('[data-house-placement-level]'));
  }

  container.addEventListener('input', onInput);
  container.addEventListener('change', onChange);
  container.addEventListener('click', onClick);
  if (rankSelect) rankSelect.addEventListener('change', updateAvailability);
  renderRows();
  updateAvailability();

  return Object.freeze({
    read,
    setValue,
    setFromProfile,
    destroy() {
      container.removeEventListener('input', onInput);
      container.removeEventListener('change', onChange);
      container.removeEventListener('click', onClick);
      rankSelect?.removeEventListener('change', updateAvailability);
    }
  });
}
