(function(){
  window.ZETTEL_TYPES = [
    {
      id:'quest', icon:'📜', color:'#1a1200', label:'Quest / Auftrag',
      desc:'Mission, Bounty, Auftrag…',
      fields:['bild','text','portrait','verfasser'],
      table:[{k:'Auftraggeber',v:''},{k:'Belohnung',v:''},{k:'Frist',v:''},{k:'Zielort',v:''},{k:'Schwierigkeit',v:''}]
    },
    {
      id:'steckbrief', icon:'🚨', color:'#c06060', label:'Steckbrief',
      desc:'Gesucht, Kopfgeld…',
      fields:['skizze','text','daten'],
      table:[{k:'Alias',v:''},{k:'Kopfgeld',v:''},{k:'Vergehen',v:''},{k:'Zuletzt gesehen',v:''},{k:'Merkmale',v:''},{k:'Ausgestellt von',v:''}]
    },
    {
      id:'zeitung', icon:'📰', color:'#8090b0', label:'Zeitungsartikel',
      desc:'Pamphlet, Artikel, Nachrichten…',
      fields:['bild','artikel'],
      table:[{k:'Herausgeber',v:''},{k:'Datum',v:''},{k:'Ausgabe Nr.',v:''}]
    },
    {
      id:'vermisst', icon:'❓', color:'#9060c8', label:'Vermisst',
      desc:'Person, Tier, Gegenstand…',
      fields:['portrait','text'],
      table:[{k:'Name',v:''},{k:'Beschreibung',v:''},{k:'Zuletzt gesehen',v:''},{k:'Belohnung',v:''},{k:'Kontakt',v:''}]
    },
    {
      id:'ankuendigung', icon:'📣', color:'#60a0c8', label:'Ankündigung',
      desc:'Fest, Markt, Turnier…',
      fields:['bild','text'],
      table:[{k:'Veranstaltung',v:''},{k:'Datum',v:''},{k:'Ort',v:''},{k:'Veranstalter',v:''}]
    },
    {
      id:'notiz', icon:'📝', color:'#60a060', label:'Freie Notiz',
      desc:'Gerücht, Info, Sonstiges…',
      fields:['text'],
      table:[{k:'Kategorie',v:''},{k:'Quelle',v:''},{k:'Datum',v:''}]
    }
  ];

  window.ZETTEL_COLOR = {
    quest:'#f5e9c8',
    steckbrief:'#f5e9c8',
    zeitung:'#f5e9c8',
    vermisst:'#f5e9c8',
    ankuendigung:'#f5e9c8',
    notiz:'#f5e9c8',
  };

  window.ZETTEL_BORDER = {
    quest:'#c8a84b',
    steckbrief:'#c8a84b',
    zeitung:'#c8a84b',
    vermisst:'#c8a84b',
    ankuendigung:'#c8a84b',
    notiz:'#c8a84b',
  };

  window.ZETTEL_SIZE = {
    quest:{w:260,h:160},
    steckbrief:{w:220,h:180},
    zeitung:{w:300,h:180},
    vermisst:{w:240,h:160},
    ankuendigung:{w:260,h:150},
    notiz:{w:220,h:130},
  };

  window.TafelZettelConfig = {
    typeById(id){
      return window.ZETTEL_TYPES.find(type => type.id === id);
    },
    renderTypeCards(esc){
      return window.ZETTEL_TYPES.map(type => `
        <div class="tpl-card" id="ztplc-${type.id}" data-action="select-zettel-type" data-zettel-type="${type.id}" style="border-color:${type.color || window.ZETTEL_BORDER[type.id] || '#c8a040'}55">
          <span class="tpl-icon">${type.icon}</span>
          <span class="tpl-label">${type.label}</span>
          <span class="tpl-desc">${type.desc}</span>
        </div>`).join('');
    },
    createDraft(typeId, position, uid){
      const type = this.typeById(typeId);
      return {
        id: uid(),
        typ: typeId,
        x: position.x,
        y: position.y,
        title: type ? type.label : 'Neuer Zettel',
        untertitel: '',
        text: '',
        bild: '',
        portrait: '',
        verfasser: '',
        verfasserName: '',
        table: type ? type.table.map(row => ({...row})) : [],
        artikel: [{titel:'Artikel 1', text:''}],
        personen: [{portrait:'', title:'', untertitel:'', text:'', table:[]}],
        secret: false,
      };
    },
  };
})();
