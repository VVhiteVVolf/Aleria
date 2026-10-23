import { residentsForPin, normalizePlace, householdSeatName } from './household-model.mjs';

// The pin editor owns its draft and commits via the callback. This field owns
// only its DOM; opening or cancelling the form never changes a map or register.
export async function mountHouseholdField({ container, pin, change }, { loadCatalog, map, dominions }) {
  if (!container || pin.kind === 'text') return;
  container.textContent = 'Familienregister wird geladen …';
  let index;
  try { index = await loadCatalog(); }
  catch (error) { if (container.isConnected) container.textContent = error.message; return; }
  if (!container.isConnected) return;
  container.replaceChildren();
  const heading = document.createElement('h4'); heading.textContent = 'Familien an diesem Ort';
  const help = document.createElement('p'); help.className = 'pin-editor-help';
  help.textContent = 'Hier nur Familien auswählen, die tatsächlich zu diesem Ort gehören. Die territoriale Herrschaft allein begründet keinen Wohnsitz.';
  const status = document.createElement('p'); status.className = 'household-editor-status'; status.setAttribute('role', 'status');
  const search = document.createElement('input'); search.type = 'search'; search.className = 'e-inp'; search.placeholder = 'Familie suchen …'; search.setAttribute('aria-label', 'Familien für diesen Ort suchen');
  const list = document.createElement('div'); list.className = 'household-editor-list'; list.setAttribute('role', 'group'); list.setAttribute('aria-label', 'Fest zugeordnete Familien');
  const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'pin-editor-media-button'; reset.textContent = 'Wieder aus vorhandenen Sitzen ableiten';
  const clear = document.createElement('button'); clear.type = 'button'; clear.className = 'pin-editor-media-button'; clear.textContent = 'Keine Familien zuordnen';
  let explicit = Array.isArray(pin.residentFamilyIds);
  const seatName = householdSeatName(pin, dominions);
  let selected = new Set(residentsForPin(pin, map, index, { seatName }).map(family => family.id));
  function render() {
    const query = normalizePlace(search.value);
    status.textContent = `${selected.size} Familien · ${explicit ? 'Feste Zuordnung zu diesem Marker' : 'Aus vorhandenen Sitzen und Zuordnungen abgeleitet'}`;
    list.replaceChildren();
    const families = [...index.families].sort((a, b) => Number(selected.has(b.id)) - Number(selected.has(a.id)) || a.name.localeCompare(b.name, 'de'));
    for (const family of families.filter(family => !query || normalizePlace(family.name).includes(query))) {
      const label = document.createElement('label');
      const input = document.createElement('input'); input.type = 'checkbox'; input.value = family.id; input.checked = selected.has(family.id);
      const name = document.createElement('span'); name.textContent = family.name;
      label.append(input, name); list.append(label);
    }
    if (!list.children.length) list.textContent = 'Keine Familie gefunden.';
  }
  search.addEventListener('input', render);
  list.addEventListener('change', event => {
    const input = event.target;
    if (!input.matches('input[type="checkbox"]')) return;
    if (input.checked) selected.add(input.value); else selected.delete(input.value);
    explicit = true; change([...selected]); render();
  });
  reset.addEventListener('click', () => { explicit = false; const { residentFamilyIds, ...automatic } = pin; selected = new Set(residentsForPin(automatic, map, index, { seatName }).map(family => family.id)); change(undefined); render(); });
  clear.addEventListener('click', () => { explicit = true; selected.clear(); change([]); render(); });
  const actions = document.createElement('div'); actions.className = 'pin-editor-media-actions'; actions.append(clear, reset);
  container.append(heading, help, status, search, list, actions); render();
}
