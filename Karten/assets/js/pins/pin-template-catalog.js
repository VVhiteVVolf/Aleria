// Shared template definitions for the editor and reviewed map imports.
(function(root){
  const templates = [
    ...[
      ['orden', '⚜', 'Orden / Zunft / Gilde', 'Gemeinschaften und organisierte Berufsstände', ['Ausrichtung', 'Leitung', 'Zugehörigkeit', 'Mitglieder', 'Aufgaben', 'Aufnahmebedingungen']],
      ['institution', '🏛', 'Institution / Heiligtum', 'Kirche, Schule, Archiv und öffentliche Einrichtungen', ['Träger', 'Leitung', 'Zuständigkeit', 'Angebote', 'Zugang', 'Bekannte Angehörige']],
      ['verwaltung', '📜', 'Verwaltung / Amt', 'Rathaus, Verwaltung, Aushänge und Zoll', ['Zuständigkeit', 'Leitung', 'Übergeordnete Stelle', 'Ansprechpartner', 'Dienstzeiten', 'Gebühren / Abgaben']],
      ['militaer', '⚔', 'Militär / Wachposten', 'Garnisonen, Burgen und Wachen', ['Befehlshaber', 'Unterstellung', 'Besatzung', 'Aufgaben', 'Ausrüstung', 'Befestigung']],
      ['handwerk', '⚒', 'Handwerk / Werkstatt', 'Gemeinsame Vorlage für produzierende Gewerbe', ['Gewerbe', 'Besitzer', 'Meister / Leitung', 'Erzeugnisse', 'Dienstleistungen', 'Rohstoffe', 'Beschäftigte']],
      ['gastbetrieb', '🍺', 'Taverne / Gastbetrieb', 'Schenke, Taverne und Herberge', ['Betreiber', 'Speisen / Getränke', 'Unterkunft', 'Preislage', 'Öffnungszeiten', 'Stammgäste']],
      ['landwirtschaft', '🌾', 'Landwirtschaft / Zucht', 'Höfe, Plantagen und Tierhaltung', ['Besitzer', 'Bewirtschaftung', 'Anbau / Tierbestand', 'Erzeugnisse', 'Arbeitskräfte', 'Versorgung / Abnehmer', 'Bewachung']],
      ['handel', '⚖', 'Handel / Markt', 'Marktplatz, Laden und Handelsniederlassung', ['Betreiber', 'Waren / Angebot', 'Markt- / Öffnungszeiten', 'Lieferanten', 'Kundschaft', 'Gebühren / Abgaben']]
    ].map(([id, icon, label, desc, fields]) => ({
      id, icon, label, desc,
      table: ['Name', 'Typ', ...fields, 'Zustand', 'Gerüchte', 'Besonderheiten'].map(k => ({ k, v: '' }))
    })),
    {
      id:'siedlung', icon:'🏘', label:'Siedlung / Ort',
      desc:'Stadt, Dorf, Weiler…',
      table:[
        {k:'Name',v:''},{k:'Typ',v:''},{k:'Gewerbe',v:''},{k:'Regierungstyp',v:''},
        {k:'Führung',v:''},{k:'Lehensherr',v:''},{k:'Bevölkerung',v:''},
        {k:'Einwohnerzahl',v:''},{k:'Bekannte Familien',v:''},{k:'Gefahren',v:''},{k:'Ressourcen',v:''}
      ]
    },
    {
      id:'gebaeude', icon:'🏰', label:'Einzelnes Gebäude',
      desc:'Taverne, Turm, Tempel…',
      table:[
        {k:'Name',v:''},{k:'Typ',v:''},{k:'Gewerbe',v:''},{k:'Besitzer',v:''},
        {k:'Zustand',v:''},{k:'Bekannte Bewohner',v:''},{k:'Gerüchte',v:''},{k:'Besonderheiten',v:''}
      ]
    },
    {
      id:'natur', icon:'🌿', label:'Naturgebiet / POI',
      desc:'Wald, Berg, Höhle, Quelle…',
      table:[
        {k:'Name',v:''},{k:'Typ',v:''},{k:'Gefahren',v:''},{k:'Ressourcen',v:''},
        {k:'Bekannte Bewohner',v:''},{k:'Besonderheiten',v:''},{k:'Legenden',v:''}
      ]
    },
    {
      id:'ruine', icon:'🏚', label:'Ruine',
      desc:'Verfallene Burg, altes Heiligtum…',
      table:[
        {k:'Name',v:''},{k:'Ursprung',v:''},{k:'Zustand',v:''},{k:'Ursache des Verfalls',v:''},
        {k:'Aktuelle Bewohner',v:''},{k:'Gefahren',v:''},{k:'Schätze / Reliquien',v:''},{k:'Gerüchte',v:''}
      ]
    },
    {
      id:'monsterhort', icon:'🐉', label:'Monsterhort',
      desc:'Lager, Nest, Revier…',
      table:[
        {k:'Name',v:''},{k:'Kreatur(en)',v:''},{k:'Anzahl',v:''},{k:'Gefährlichkeit',v:''},
        {k:'Territorium',v:''},{k:'Beute / Schatz',v:''},{k:'Schwächen',v:''},{k:'Verbündete',v:''}
      ]
    },
    {
      id:'dungeon', icon:'⚔️', label:'Dungeon',
      desc:'Verlies, Katakomben, Labyrinth…',
      table:[
        {k:'Name',v:''},{k:'Typ',v:''},{k:'Ebenen',v:''},{k:'Hauptgegner',v:''},
        {k:'Ursprung',v:''},{k:'Bekannte Fallen',v:''},{k:'Schätze',v:''},{k:'Schwierigkeitsgrad',v:''},
        {k:'Fraktionen innen',v:''}
      ]
    }
  ];

  for(const template of templates){
    template.table.forEach(Object.freeze);
    Object.freeze(template.table);
    Object.freeze(template);
  }
  Object.freeze(templates);
  const byId = new Map(templates.map(template => [template.id, template]));
  function createTable(id){
    const template = byId.get(id);
    if(!template) throw new Error(`Unknown pin template: ${id}`);
    return template.table.map(row => ({...row}));
  }
  root.KartoPinTemplateCatalog = Object.freeze({templates, get:id => byId.get(id), createTable});
})(typeof window !== 'undefined' ? window : globalThis);
