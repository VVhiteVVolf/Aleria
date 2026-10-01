// Location-specific blank tables shared by placement, editing and offline imports.
(function(root){
  const catalog = root.KartoCategoryCatalog;
  const templates = root.KartoPinTemplateCatalog;
  // Related types share a field set; explicit, unrelated templates retain their fields.
  const groups = [
    ['Hauptstadt|Stadt|Dorf|Bauernsiedlung|Hafensiedlung|Burgsiedlung|Handelssiedlung|Brückensiedlung|Bergbausiedlung|Waldsiedlung|Kirchensiedlung|Leuchtturmsiedlung|Festungssiedlung|Bardensiedlung|Brauersiedlung|Klostersiedlung|Rosszuchtsiedlung|Sumpfsiedlung|Unterwasserstadt', 'siedlung'],
    ['Taverne', 'gastbetrieb'],
    ['Siedlungsruine|Stadtruine|Turmruine|Ruine|Brückenruine|Kirchenruine|Hausruine', 'ruine'],
    ['Schiffswrack', 'ruine', 'Schiffstyp|Herkunft|Ehemaliger Kapitän|Untergang|Lage / Tiefe|Zugänglichkeit|Ladung / Fundstücke'],
    ['Turnierplatz|Bogenschießstand', 'institution', 'Betreiber|Disziplinen|Anlagen|Teilnahme|Termine|Ausrüstung|Preise / Gebühren'],
    ['Besondere Orte|Wahrzeichen', 'natur', 'Bedeutung|Ursprung|Zugang|Umgebung|Besucher|Überlieferungen|Besondere Wirkungen'],
    ['Bauernhof|Landgut|Plantage|Obstplantage|Weingut', 'landwirtschaft', 'Besitzer|Bewirtschaftung|Anbau|Erzeugnisse|Fläche|Arbeitskräfte|Versorgung / Abnehmer'],
    ['Viehweide|Gestüt|Imkerei', 'landwirtschaft', 'Besitzer|Tierarten / Rassen|Tierbestand|Haltung / Zucht|Erzeugnisse|Arbeitskräfte|Versorgung / Abnehmer'],
    ['Anwesen|Wohnhaus', 'gebaeude', 'Besitzer|Bewohner|Nutzung|Gebäude / Räume|Nebengebäude|Versorgung|Zugang'],
    ['Rittergut|Burg|Turm|Außenposten|Heerlager|Festung', 'militaer'],
    ['Mühle', 'handwerk', 'Besitzer|Müller|Antrieb|Mahlgut|Leistung|Abgaben|Einzugsgebiet'],
    ['Mine', 'handwerk', 'Betreiber|Rohstoffe|Abbauweise|Tiefe / Stollen|Belegschaft|Fördermenge|Sicherung'],
    ['Steinbruch', 'handwerk', 'Betreiber|Gestein|Abbauweise|Werkzeuge|Belegschaft|Fördermenge|Transportwege'],
    ['Schmiede', 'handwerk', 'Besitzer|Schmied / Meister|Spezialisierung|Erzeugnisse|Dienstleistungen|Rohstoffe|Beschäftigte'],
    ['Brauerei', 'handwerk', 'Betreiber|Braumeister|Getränke|Zutaten|Produktion|Lagerung|Abnehmer'],
    ['Fischerei', 'handwerk', 'Betreiber|Fanggebiet|Fischarten|Boote / Gerät|Fangzeiten|Verarbeitung|Abnehmer'],
    ['Holzfällerlager', 'handwerk', 'Betreiber|Schlaggebiet|Holzarten|Belegschaft|Werkzeuge|Transport|Abnehmer'],
    ['Köhlerei', 'handwerk', 'Betreiber|Meiler|Holzversorgung|Brennverfahren|Produktion|Belegschaft|Abnehmer'],
    ['Handelskontor|Markt', 'handel'],
    ['Gildenhaus|Diebesgilde', 'orden'],
    ['Leuchtturm', 'gebaeude', 'Betreiber|Wärter|Feuer / Signal|Reichweite|Versorgung|Zugang|Schifffahrtswege'],
    ['Grenzposten', 'verwaltung', 'Zuständigkeit|Leitung|Grenze / Übergang|Besatzung|Kontrollen|Zölle / Abgaben|Durchlasszeiten'],
    ['Lagerplatz|Zelt|Jägerlager', 'natur', 'Nutzer|Kapazität|Unterkünfte|Wasser / Versorgung|Feuerstellen|Umgebung|Zugang'],
    ['Jagdhaus', 'gebaeude', 'Besitzer|Bewohner|Jagdrevier|Wildbestand|Ausrüstung|Versorgung|Zugang'],
    ['Druidenhütte|Hexenhütte|Magierturm', 'gebaeude', 'Bewohner|Zugehörigkeit|Schwerpunkt / Magie|Räume / Anlagen|Dienste|Schutz / Bann|Zugang'],
    ['Schrein|Heiligtum|Kultstätte', 'institution', 'Gottheit / Verehrung|Hüter|Gemeinschaft|Riten|Opfergaben|Reliquien|Zugang'],
    ['Friedhof', 'institution', 'Träger|Hüter|Bestattete|Bestattungsweise|Grabstätten|Rituale|Zugang'],
    ['Grabstätte|Hügelgrab', 'ruine', 'Bestattete|Erbauer / Kultur|Alter|Grabanlage|Zugang|Grabbeigaben|Schutz / Fallen'],
    ['Ausgrabung', 'ruine', 'Leitung|Erforschte Kultur|Alter|Grabungsgebiet|Funde|Fortschritt|Zugang'],
    ['Höhle', 'natur', 'Gestein|Eingänge|Ausdehnung / Tiefe|Gänge / Kammern|Bewohner|Wasser / Ressourcen|Zugang'],
    ['Hain|Verwunschener Wald', 'natur', 'Baumarten|Ausdehnung|Hüter / Bewohner|Pfade|Ressourcen|Magische Einflüsse|Überlieferungen'],
    ['Ahnenbaum', 'natur', 'Baumart|Alter|Verehrte Ahnen|Hüter|Rituale|Magische Einflüsse|Überlieferungen'],
    ['Quelle|Heiße Quellen', 'natur', 'Wasserart|Temperatur|Ergiebigkeit|Wasserqualität|Nutzung|Abfluss|Zugang'],
    ['Berggipfel', 'natur', 'Höhe|Gestein|Aufstiegswege|Wetter|Flora / Fauna|Aussicht|Ressourcen'],
    ['Monsterhort|Kreaturenlager', 'monsterhort'],
    ['Banditenlager|Piratenversteck|Schmugglerversteck', 'monsterhort', 'Gruppierung|Anführer|Anzahl|Aktivitäten|Revier / Routen|Vorräte / Beute|Bewachung'],
    ['Hafen / Steg|Fährstelle', 'handel', 'Betreiber|Gewässer|Verbindungen|Anlegestellen|Boote / Kapazität|Betriebszeiten|Gebühren'],
    ['Werft', 'handwerk', 'Betreiber|Schiffsbauer|Schiffstypen|Docks / Hellinge|Dienstleistungen|Rohstoffe|Beschäftigte'],
    ['Poststation', 'verwaltung', 'Leitung|Postrouten|Boten / Kutscher|Pferde / Fahrzeuge|Fahrzeiten|Dienstleistungen|Gebühren'],
    ['Schule', 'institution', 'Träger|Leitung|Lehrende|Fächer|Lernende|Aufnahme|Unterrichtszeiten'],
    ['Zirkus', 'institution', 'Leitung|Ensemble|Darbietungen|Tiere|Spielzeiten|Eintritt|Reiseroute'],
    ['Dimensionaler Riss', 'natur', 'Ursprung|Verbundene Ebene|Ausdehnung|Stabilität|Aktivität|Übergang|Bewachung / Bann'],
    ['Galgen', 'verwaltung', 'Zuständigkeit|Gerichtsbarkeit|Scharfrichter|Anlage|Nutzung|Bewachung|Überlieferungen'],
    ['Münzprägestätte', 'handwerk', 'Prägeherr|Münzmeister|Münzen / Nennwerte|Metalle|Prägeverfahren|Produktion|Bewachung'],
    ['Ziegelei', 'handwerk', 'Betreiber|Tonvorkommen|Brennöfen|Brennstoff|Erzeugnisse|Produktion|Abnehmer'],
    ['Schiff', 'gebaeude', 'Schiffstyp|Eigner|Kapitän|Besatzung|Heimathafen|Ladung|Route'],
    ['Schlachtfeld', 'natur', 'Schlacht / Ereignis|Zeitpunkt|Beteiligte|Ausgang|Gelände|Spuren / Funde|Gedenken'],
  ];
  const byCategory = new Map();
  for(const [labels, templateId, fields] of groups){
    const rows = fields ? ['Name','Typ',...fields.split('|'),'Zustand','Gefahren','Besonderheiten'].map(k => Object.freeze({k,v:''})) : templates.get(templateId).table;
    const preset = Object.freeze({templateId, table:Object.freeze(rows)});
    for(const label of labels.split('|')){
      const category = catalog.definition({label});
      if(!category || byCategory.has(category.id)) throw new Error(`Invalid location table category: ${label}`);
      byCategory.set(category.id, preset);
    }
  }
  function forCategory(category){ return byCategory.get(catalog.definition(category)?.id); }
  function createTable(templateId, category){
    const preset = forCategory(category);
    const id = templateId || preset?.templateId || 'siedlung';
    if(preset && (!templateId || id === 'siedlung' || id === preset.templateId)) return preset.table.map(row => ({...row}));
    return templates.createTable(id);
  }
  function isDefaultTable(pin, category){
    if(pin.templateId && !templates.get(pin.templateId)) return false;
    if(!pin.table?.length || pin.table.some(row => String(row.v || '').trim())) return false;
    const sameKeys = rows => rows.length === pin.table.length && rows.every((row,index) => row.k === pin.table[index].k);
    return sameKeys(createTable(pin.templateId,category)) || (templates.get(pin.templateId) && sameKeys(templates.get(pin.templateId).table));
  }
  root.KartoPinTablePresets = Object.freeze({forCategory, createTable, isDefaultTable});
})(typeof window !== 'undefined' ? window : globalThis);
