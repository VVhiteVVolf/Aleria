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
  const BUILT_IN_PATHS = new Set([
    ...SOURCES,
    ...['default-hafensiedlung', 'default-siedlung', 'default-waldsiedlung']
      .map(name => BASE + name + '.webp'),
  ]);

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

  function isBuiltIn(source){
    try {
      return BUILT_IN_PATHS.has(new URL(source, 'https://karto.invalid/').pathname);
    } catch {
      return false;
    }
  }

  function resolve(pin = {}, category = {}){
    const explicitSource = String(pin.img || '').trim();
    const isPlaceholder = !explicitSource || isBuiltIn(explicitSource);
    return {
      src: isPlaceholder ? select(pin, category) : explicitSource,
      link: isPlaceholder ? '' : String(pin.imgLink || '').trim(),
      isPlaceholder,
    };
  }

  root.KartoPinPlaceholders = Object.freeze({
    sources: SOURCES,
    select,
    resolve,
  });
})(typeof window !== 'undefined' ? window : globalThis);
