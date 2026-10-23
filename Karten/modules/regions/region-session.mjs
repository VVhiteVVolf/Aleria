import { cloneRegion, nearestSegment, validateRegion } from './region-model.mjs';

export function createRegionSession(region, { isNew = false } = {}) {
  let draft = cloneRegion(region);
  const original = JSON.stringify(draft);
  const history = [];
  let drawing = isNew;
  let pathIndex = draft.paths.length - 1;
  let selected = null;
  let inserting = false;
  function remember() {
    history.push({ draft: cloneRegion(draft), drawing, pathIndex, selected });
    if (history.length > 50) history.shift();
  }
  return {
    draft: () => draft,
    isNew: () => isNew,
    dirty: () => isNew || original !== JSON.stringify(draft),
    drawing: () => drawing,
    selected: () => selected,
    inserting: () => inserting,
    patch(values) { Object.assign(draft, values); },
    add(point) { remember(); draft.paths[pathIndex].push(point); selected = [pathIndex, draft.paths[pathIndex].length - 1]; },
    select(path, index) { selected = [path, index]; },
    beginMove() { remember(); },
    move(point) { if (selected) draft.paths[selected[0]][selected[1]] = point; },
    remove() {
      if (!selected) return;
      const path = draft.paths[selected[0]];
      if (path.length <= (draft.kind === 'boundary' ? 2 : 3)) throw new Error('Die Grenze benötigt ihre verbleibenden Punkte.');
      remember(); path.splice(selected[1], 1); selected = null;
    },
    startInsertion() { inserting = true; },
    insert(point) {
      const nearest = nearestSegment(draft.paths, point, draft.kind !== 'boundary');
      if (!nearest) return;
      remember();
      draft.paths[nearest.pathIndex].splice(nearest.after + 1, 0, nearest.point);
      selected = [nearest.pathIndex, nearest.after + 1];
      inserting = false;
    },
    finish() { validateRegion({ ...draft, name: draft.name || 'Neue Region', parentId: '' }); drawing = false; inserting = false; },
    redraw() { remember(); draft.paths = [[]]; pathIndex = 0; selected = null; drawing = true; },
    addPart() { remember(); draft.paths.push([]); pathIndex = draft.paths.length - 1; selected = null; drawing = true; },
    undo() {
      const previous = history.pop();
      if (previous) { ({ draft, drawing, pathIndex, selected } = previous); inserting = false; }
    },
  };
}
