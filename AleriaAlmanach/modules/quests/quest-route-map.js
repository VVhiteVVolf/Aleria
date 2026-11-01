import { AUTHORED_QUEST_PREPARATIONS } from './quest-authored-dossiers.js';
import { questTravelGroup } from './quest-dossier-model.js';
// Explicit preview: no saveD, Firebase or publication. Existing groups/calibration survive.
export function mountPreparedQuestRoute(pathId) {
  const runtime = globalThis.KartoRuntime, mapId = globalThis.KARTO_CONFIG?.mapId;
  if (!runtime?.mapImageSize()?.width) return false;
  const preparation = Object.values(AUTHORED_QUEST_PREPARATIONS).find(row => row.dossier.route?.mapId === mapId && row.dossier.route.paths.some(path => path.id === pathId));
  if (!preparation) return false;
  const route = preparation.dossier.route, group = questTravelGroup(route, pathId), state = runtime.lsbState();
  if (state.groups.some(row => row.id === group.id)) return true;
  // A named planning group is independent of real party position and quest progress.
  runtime.previewTravelGroup(group, route.widthKm / route.width);
  runtime.setSelectedTravelGroup(group.id); runtime.ensureToolsSidebarOpen();
  globalThis.KartoLsbTools.updateCalibrationUi(); globalThis.KartoLsbGroups.renderGroups();
  runtime.drawTravelLayer(); runtime.updateTravelResult();
  runtime.toast('Vorbereitete Route · lokale Vorschau im Reisetool');
  return true;
}
