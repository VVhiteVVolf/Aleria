// Local presentation fallback for unnamed intermediate nodes. Persisted
// section icons and authoritative territory/house heraldry retain precedence.
const AleriaArchiveSectionIcons = (() => {
  const pin = name => `../IconOrdner/Welt Pins/${name}.png`;
  const byContext = [
    [/gestüt|pferdezucht/i, 'Gestüt'], [/hafen/i, 'Großer Hafen'],
    [/osttor|westtor|südtor|nordtor|stadttor|grenzposten/i, 'Zoll - Grenzposten'],
    [/markt|basar/i, 'Marktstand'], [/kloster/i, 'Klostersiedlung'],
    [/tempel|kathedrale|heiligtum|kirche/i, 'Heiligtum'],
    [/gasthof|herberge/i, 'Gasthof'], [/taverne|schenke|wirtshaus/i, 'Taverne'],
    [/mühle|hof\b|höfe|bauern|farm/i, 'Bauernsiedlung'],
    [/anwesen|landgut/i, 'Anwesen'], [/burg|castell|festung/i, 'Kleine Burg'],
    [/wald|hain|park/i, 'Hain'], [/ruine/i, 'Antike Ruine'],
    [/stadt|zentrum/i, 'Stadt'], [/dorf|siedlung/i, 'Bauernsiedlung']
  ];
  function source(node, tab = '') {
    const label = String(node?.label || '');
    if (typeof AleriaGwynthorGeography !== 'undefined') {
      const path = node?.path || [];
      const region = ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft'];
      if (path.length && path.slice(0, 3).every((part, index) => part === region[index])) {
        const known = AleriaGwynthorGeography.GWYNTHOR_AREA_ICONS[label];
        if (known) return sanitizeImageSrc(known);
      }
    }
    const explicit = sanitizeImageSrc(node?.section?.iconUrl || '');
    if (explicit) return explicit;
    const context = byContext.find(([pattern]) => pattern.test(label));
    if (context) return sanitizeImageSrc(pin(context[1]));
    if (/haus|familie|stammbaum|clan/i.test(label)) return '../IconOrdner/ReiterIcons/Charakterregister/genealogy-v1.webp';
    return getArchiveDashboardTabIcon(tab) || '../IconOrdner/ReiterIcons/Weltpfade/werke.png';
  }
  function entrySource(entry) {
    const known = typeof AleriaGwynthorGeography !== 'undefined' && AleriaGwynthorGeography.GWYNTHOR_AREA_ICONS[entry?.title];
    if (known) return sanitizeImageSrc(known);
    const context = byContext.find(([pattern]) => pattern.test(String(entry?.title || '')));
    return context ? sanitizeImageSrc(pin(context[1])) : getArchiveEntryPreviewImage(entry)
      || '../IconOrdner/ReiterIcons/Weltpfade/werke.png';
  }
  document.addEventListener('error', event => {
    const img = event.target;
    if (img?.tagName !== 'IMG' || !img.dataset.archiveIconFallback) return;
    const fallback = img.dataset.archiveIconFallback;
    delete img.dataset.archiveIconFallback;
    img.src = fallback;
  }, true);
  return Object.freeze({ source, entrySource });
})();
