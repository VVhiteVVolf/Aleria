(function(root){
  const BASE = '/Karten/assets/images/pin-placeholders/';
  const catalog = root.KartoCategoryCatalog;
  const locationProfiles = root.KartoPinTablePresets;
  const TEMPLATES = new Map([
    ['orden', 'template-orden'],
    ['institution', 'template-institution'],
    ['verwaltung', 'template-verwaltung'],
    ['militaer', 'template-militaer'],
    ['handwerk', 'template-handwerk'],
    ['gastbetrieb', 'template-gastbetrieb'],
    ['landwirtschaft', 'template-landwirtschaft'],
    ['handel', 'template-handel'],
    ['siedlung', 'template-siedlung'],
    ['gebaeude', 'template-gebaeude'],
    ['natur', 'template-natur'],
    ['ruine', 'template-ruine'],
    ['monsterhort', 'template-monsterhort'],
    ['dungeon', 'template-dungeon'],
  ].map(([id, asset]) => [id, BASE + asset + '.webp']));
  const SOURCES = Object.freeze([...new Set([...catalog.sources, ...TEMPLATES.values()])]);
  // Reviewed historical locality maps on the county map.
  const historicMaps = new Set([
    'https://i.imgur.com/BHcbTil.jpeg', // Garwfaen
    'https://i.imgur.com/NX1n1Qc.jpeg', // Llysbryn
    'https://i.imgur.com/PJHY9PF.jpeg', // Lysfaen
    'https://i.imgur.com/vnLHucL.jpeg', // Bronhir
    'https://i.imgur.com/EzUnvrZ.jpeg', // Morcarryn
    'https://i.imgur.com/XH61UuB.jpeg', // Traethfael
    'https://i.imgur.com/y2MWc8V.jpeg', // Morddyn
    'https://i.imgur.com/UWwNLMh.jpeg', // Glasdraeth
    'https://i.imgur.com/cFFoAQ6.jpeg', // Traethgorn
    'https://i.imgur.com/OU2BkMA.jpeg', // Castell Rhewglyn
    'https://i.imgur.com/GujbL7c.jpeg', // Mwyncarw
    'https://i.imgur.com/j6B2zlu.jpeg', // Carregmawr
    'https://i.imgur.com/iFGqMt2.jpeg', // Craithfael
    'https://i.imgur.com/0wFaFsV.jpeg', // Côr Mynyddfaen
    'https://i.imgur.com/Q5xhTMi.jpeg', // Craithglyn
    'https://i.imgur.com/TlxCXt4.jpeg', // Tŵr Brynmawr
    'https://i.imgur.com/KbKthPC.jpeg', // Mwyncreig
    'https://i.imgur.com/WrGY80x.png', // Insel Camruisge
    'https://i.imgur.com/ZfLqP5t.jpeg', // Tân Maelfa
  ]);
  const origin = root.location?.origin || 'https://karto.invalid';
  const rasterPath = source => {
    try {
      const url = new URL(String(source || ''), origin + '/Karten/');
      return url.origin === origin && /^\/Karten\/.+\/Kartenbilder\//.test(url.pathname) ? decodeURI(url.pathname) : '';
    } catch {
      return '';
    }
  };
  const maps = (root.KartoMapRegistry?.all?.() || []).filter(map => map.status === 'active');
  const mapPaths = new Set(maps.flatMap(map => Object.values(map.images || {})).map(rasterPath).filter(Boolean));
  const localMaps = maps.flatMap(map => rasterPath(map.images?.normal) ? [{
    id: map.id, name: map.title, url: new URL(map.images.normal, origin + '/Karten/').href.slice(origin.length),
    kind: 'map', group: 'Ortskarten', source: 'Kartenregister'
  }] : []);

  // The caller supplies the map's category, so selection has no state/DOM dependency.
  // A matching location refines its template (Mine + Handwerk -> mine artwork).
  // An unrelated explicit template still wins (Hauptstadt + Militär -> military).
  function select(pin = {}, category = {}){
    const template = TEMPLATES.get(pin.templateId);
    const matchesLocation = locationProfiles.forCategory(category)?.templateId === pin.templateId;
    if(template && pin.templateId !== 'siedlung' && !matchesLocation) return template;
    return catalog.placeholder(category)
      || template
      || TEMPLATES.get('siedlung');
  }

  function isMap(source){
    return historicMaps.has(source) || mapPaths.has(rasterPath(source));
  }

  function resolve(pin = {}, category = {}){
    const explicitSource = String(pin.img || '').trim();
    const isPlaceholder = !isMap(explicitSource);
    return {
      src: isPlaceholder ? select(pin, category) : explicitSource,
      link: isPlaceholder ? '' : String(pin.imgLink || '').trim(),
      isPlaceholder,
    };
  }

  root.KartoPinPlaceholders = Object.freeze({
    sources: SOURCES,
    localMaps: Object.freeze(localMaps),
    isMap,
    select,
    resolve,
  });
})(typeof window !== 'undefined' ? window : globalThis);
