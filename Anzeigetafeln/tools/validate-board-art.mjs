import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { compositionConfig } from '../assets/js/composition/board-composition-config.mjs';
import { normalizeLayout } from '../assets/js/composition/board-composition-model.mjs';

export function validateBoardArt(root, registry, reportError) {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/board-art-catalog.json'), 'utf8'));
  const ids = new Set();
  for (const asset of catalog.posters) {
    const file = path.resolve(root, asset.src);
    const relative = path.relative(path.dirname(root), file);
    const rect = asset.bounds;
    if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(file)) reportError(`Artwork source missing or outside project: ${asset.id}`);
    if (ids.has(asset.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(asset.id)) reportError(`Invalid or duplicate artwork id: ${asset.id}`);
    ids.add(asset.id);
    if (!rect || ![asset.width, asset.height, rect.w, rect.h, asset.aspect].every(value => Number.isFinite(value) && value > 0)
      || rect.x < 0 || rect.y < 0 || rect.x + rect.w > asset.width || rect.y + rect.h > asset.height
      || Math.abs(asset.aspect - rect.w / rect.h) > .00001) reportError(`Invalid artwork bounds: ${asset.id}`);
    if (asset.clipPolygon && (asset.clipPolygon.length < 3 || asset.clipPolygon.some(point => point.length !== 2
      || point.some(value => !Number.isFinite(value) || value < 0 || value > 100)))) reportError(`Invalid artwork clip polygon: ${asset.id}`);
  }
  for (const entry of registry.filter(item => item.status === 'active' && item.config)) {
    const context = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(root, entry.config), 'utf8'), context);
    const config = compositionConfig(context.window.TAFEL_CONFIG);
    if (!config.enabled) continue;
    if (!fs.existsSync(path.join(root, config.background))) reportError(`Empty board background missing: ${entry.id}`);
    if (!config.presetPath) continue;
    const preset = JSON.parse(fs.readFileSync(path.join(root, config.presetPath), 'utf8'));
    const layout = normalizeLayout(preset.layout, catalog.posters);
    if (!layout) { reportError(`Invalid poster preset: ${entry.id}`); continue; }
    for (const binding of preset.bindings || []) {
      const poster = layout.posters.find(item => item.id === binding.posterId);
      if (!poster || poster.noticeId !== binding.noticeId) reportError(`Invalid content binding: ${entry.id}/${binding.posterId}`);
    }
  }
}
