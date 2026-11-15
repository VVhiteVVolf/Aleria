import { HOF_MAP_ID, HOF_MAP_FOLDER, HOF_MAPPED_POIS } from '../../../shared/tirfelyn-hof/hof-pois.mjs';
import { hofResidentsAt } from '../../../shared/tirfelyn-hof/hof-household.mjs';
import { stateHash } from '../../tools/generated-map-output.mjs';
import { hofMapMarker, HOF_MARKER_DEFINITIONS } from './hof-markers.mjs';
import { buildHofPeopleLayer } from './hof-people.mjs';

export const HOF_MAP_IMAGE = `${HOF_MAP_FOLDER}/Kartenbilder/Tirfelyn - Hof.png`;
export const HOF_MAP_LINK = `/Karten/karte.html?map=${HOF_MAP_ID}`;

export function hofMapRegistryEntry() {
  return { id: HOF_MAP_ID, title: 'Tirfelyn-Hof', status: 'active', type: 'local',
    hierarchy: [
      { level: 'kingdom', slug: 'cenyr', title: 'Cenyr' },
      { level: 'county', slug: 'celtigerns-wacht', title: 'Celtigerns Wacht' },
      { level: 'barony', slug: 'llamrais-ankunft', title: 'Llamreis Ankunft' },
      { level: 'region', slug: 'gwynthor-bannkreis', title: 'Gwynthors Bannkreis' },
      { level: 'local', slug: 'tirfelyn-hof', title: 'Tirfelyn-Hof' }
    ], folder: HOF_MAP_FOLDER, config: `${HOF_MAP_FOLDER}/template.config.js`,
    images: { normal: HOF_MAP_IMAGE, pins: HOF_MAP_IMAGE },
    dataPath: `${HOF_MAP_FOLDER}/data.json`, link: `karte.html?map=${HOF_MAP_ID}`, rulingHouse: 'Familie Tirfelyn' };
}

export function hofMapConfig() {
  const levels = [2048, 4096].map(width => ({ width, src: `${HOF_MAP_FOLDER}/Kartenbilder/display/tirfelyn-${width}-q90.jpg` }));
  const raster = { source: HOF_MAP_IMAGE, width: 4096, height: 4096, levels };
  return { mapId: HOF_MAP_ID, title: 'Tirfelyn-Hof', documentTitle: 'Tirfelyn-Hof – Aleria',
    categoryBarMode: 'used',
    images: { normal: HOF_MAP_IMAGE, pins: HOF_MAP_IMAGE }, layerNames: { normal: 'Normal', pins: 'Markierungen' },
    markerPresentation: 'symbols', rasterImages: { normal: raster, pins: raster }, peopleLayer: buildHofPeopleLayer(), storage: { dataPath: `${HOF_MAP_FOLDER}/data.json` } };
}

export function buildHofMap() {
  const cats = [{ id: 'hof-wohnhaus', label: 'Wohnhäuser', color: '#886b45' }, { id: 'hof-arbeit', label: 'Arbeitsstätten', color: '#8c532f' },
    { id: 'hof-land', label: 'Felder und Weiden', color: '#53734c' }, { id: 'hof-vorrat', label: 'Vorräte und Wasser', color: '#496e7c' }];
  const pins = HOF_MAPPED_POIS.map(poi => {
    const people = hofResidentsAt(poi);
    const marker = hofMapMarker(poi);
    const cat = poi.residenceId ? 'hof-wohnhaus' : /acker|getreide|weide|garten|gehege/.test(poi.key) ? 'hof-land'
      : /lager|speicher|schuppen|brunnen/.test(poi.key) && poi.key !== 'holzfaellerlager' ? 'hof-vorrat' : 'hof-arbeit';
    return { id: `tirfelyn-${poi.key}`, title: poi.title, x: poi.position[0], y: poi.position[1], cat, kind: 'place',
      pinMarker: marker?.url || '', pinMarkerScale: 0.75,
      img: poi.image, imgLink: '', crest: '', crestLink: '', banner: '', bannerLink: '',
      region: 'Tirfelyn-Hof · Bannkreis Gwynthor', house: 'Familie Tirfelyn', faction: '',
      table: [{ k: poi.residenceId ? 'Bewohner' : 'Zuständig', v: people.map(person => person.name).join(', ') || 'Familie Tirfelyn' },
        { k: 'Nutzung', v: poi.residenceId ? 'Wohnhaus' : poi.text.split('. ')[0].replace(/\.$/, '') }],
      text: `${poi.text}\n\n[URL=/AleriaAlmanach/AleriaAlmanach.html?entry=tirfelyn-hof&thread=${encodeURIComponent(`tirfelyn-hof::session:tirfelyn-hof-poi-${poi.key}`)}]Interaktive Szene im Almanach öffnen[/URL]`, secret: false };
  });
  const state = { pins, cats, dotSize: 22, lblSize: 13, showMarkers: true, showPinLabels: false,
    markerPresentation: 'symbols', pinVisibilityVersion: 1, regionTitle: 'Tirfelyn-Hof', regionIcon: '',
    mapImages: { normal: HOF_MAP_IMAGE, pins: HOF_MAP_IMAGE }, layerNames: { normal: 'Normal', pins: 'Markierungen' },
    extraLayers: [], dominions: [], dm: { sessions: [], notes: '', groupStatus: {} },
    markerCatalog: HOF_MARKER_DEFINITIONS.map(({ id, url, name, group }) => ({ id, url, name, group })) };
  return { schemaVersion: 1, dataPath: `${HOF_MAP_FOLDER}/data.json`, revision: 0, updatedAt: '2026-11-15T20:00:00Z',
    generatedStateHash: stateHash(state), state };
}
