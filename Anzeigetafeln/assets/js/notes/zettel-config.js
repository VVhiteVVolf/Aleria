(function(){
  window.ZETTEL_TYPES = [
    {
      id:'quest', icon:'⚔', color:'#765125', label:'Quest / Auftrag',
      desc:'Botengänge, Jagdaufträge und Abenteuer',
      fields:['bild','text','portrait','verfasser'],
      table:[{k:'Auftraggeber',v:''},{k:'Belohnung',v:''},{k:'Frist',v:''},{k:'Zielort',v:''},{k:'Schwierigkeit',v:''}]
    },
    {
      id:'steckbrief', icon:'⚔', color:'#843d35', label:'Steckbrief',
      desc:'Gesuchte Personen und ausgesetzte Kopfgelder',
      fields:['skizze','text','daten'],
      table:[{k:'Alias',v:''},{k:'Kopfgeld',v:''},{k:'Vergehen',v:''},{k:'Zuletzt gesehen',v:''},{k:'Merkmale',v:''},{k:'Ausgestellt von',v:''}]
    },
    {
      id:'zeitung', icon:'❦', color:'#464037', label:'Zeitungsartikel',
      desc:'Stadtboten, Pamphlete und Neuigkeiten',
      fields:['bild','artikel'],
      table:[{k:'Herausgeber',v:''},{k:'Datum',v:''},{k:'Ausgabe Nr.',v:''}]
    },
    {
      id:'vermisst', icon:'♙', color:'#5c647e', label:'Vermisst',
      desc:'Verschwundene Personen und vermisste Tiere',
      fields:['portrait','text'],
      table:[{k:'Name',v:''},{k:'Beschreibung',v:''},{k:'Zuletzt gesehen',v:''},{k:'Belohnung',v:''},{k:'Kontakt',v:''}]
    },
    {
      id:'ankuendigung', icon:'✧', color:'#426454', label:'Ankündigung',
      desc:'Märkte, Turniere und öffentliche Feste',
      fields:['bild','text'],
      table:[{k:'Veranstaltung',v:''},{k:'Datum',v:''},{k:'Ort',v:''},{k:'Veranstalter',v:''}]
    },
    {
      id:'notiz', icon:'❧', color:'#587366', label:'Mitteilung / Notiz',
      desc:'Kleine Botschaften, Gerüchte und Nachbarschaft',
      fields:['text'],
      table:[{k:'Kategorie',v:''},{k:'Quelle',v:''},{k:'Datum',v:''}]
    },
    {
      id:'handel', icon:'⚖', color:'#927047', label:'Handel / Angebot',
      desc:'Waren, Gesuche und Dienstleistungen', fields:['bild','text'],
      table:[{k:'Angebot',v:''},{k:'Preis',v:''},{k:'Ort',v:''},{k:'Kontakt',v:''}]
    },
    {
      id:'erlass', icon:'⚜', color:'#7c4340', label:'Amtlicher Erlass',
      desc:'Verordnungen, Warnungen und Bekanntmachungen', fields:['bild','text'],
      table:[{k:'Ausgestellt von',v:''},{k:'Gültig ab',v:''},{k:'Geltungsbereich',v:''}]
    },
    {
      id:'einladung', icon:'✧', color:'#786483', label:'Einladung',
      desc:'Feierlichkeiten, Zusammenkünfte und Feste', fields:['bild','text'],
      table:[{k:'Anlass',v:''},{k:'Wann',v:''},{k:'Wo',v:''},{k:'Gastgeber',v:''},{k:'Rückmeldung',v:''}]
    },
    {
      id:'warnung', icon:'☠', color:'#833a2c', label:'Gefahrenwarnung',
      desc:'Ungeheuer, gesperrte Wege und drohendes Unheil', fields:['bild','text'],
      table:[{k:'Gefahr',v:''},{k:'Gebiet',v:''},{k:'Gesichtet am',v:''},{k:'Verhaltensregel',v:''},{k:'Meldestelle',v:''}]
    },
    {
      id:'reise', icon:'✥', color:'#476063', label:'Reise & Geleit',
      desc:'Karawanen, Weggefährten und bewaffnetes Geleit', fields:['bild','text'],
      table:[{k:'Aufbruch',v:''},{k:'Ziel',v:''},{k:'Abreise',v:''},{k:'Treffpunkt',v:''},{k:'Gesucht',v:''},{k:'Entlohnung',v:''},{k:'Kontakt',v:''}]
    },
    {
      id:'gilde', icon:'⚒', color:'#705336', label:'Gildenaufruf',
      desc:'Lehrlinge, freie Stellen und neue Mitglieder', fields:['bild','text'],
      table:[{k:'Gilde',v:''},{k:'Gesucht',v:''},{k:'Voraussetzungen',v:''},{k:'Geboten wird',v:''},{k:'Meldestelle',v:''},{k:'Frist',v:''}]
    },
    {
      id:'fund', icon:'🗝︎', color:'#68613c', label:'Fundanzeige',
      desc:'Verlorene Kleinode und wiedergefundene Schätze', fields:['bild','text'],
      table:[{k:'Fundstück',v:''},{k:'Fundort',v:''},{k:'Gefunden am',v:''},{k:'Abzuholen bei',v:''},{k:'Eigentumsnachweis',v:''}]
    }
  ].map(type => ({
    ...type,
    iconImage: `assets/images/notice-types/${type.id}-v1.webp`,
  }));

  window.ZETTEL_COLOR = {
    quest:'#f8efd2',
    steckbrief:'#f8efd2',
    zeitung:'#f8efd2',
    vermisst:'#f8efd2',
    ankuendigung:'#f8efd2',
    notiz:'#f8efd2',
  };

  window.ZETTEL_BORDER = {
    quest:'#d0bb7a',
    steckbrief:'#d0bb7a',
    zeitung:'#d0bb7a',
    vermisst:'#d0bb7a',
    ankuendigung:'#d0bb7a',
    notiz:'#d0bb7a',
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
        <button type="button" class="tpl-card tpl-card--${type.id}" id="ztplc-${type.id}" data-action="select-zettel-type" data-zettel-type="${type.id}" aria-pressed="false" style="--template-ink:${type.color}">
          <span class="tpl-artwork has-image" aria-hidden="true"><span class="tpl-icon-fallback">${type.icon}</span><img src="${type.iconImage}" width="384" height="384" alt="" decoding="async" draggable="false" data-image-fallback="notice-media"></span>
          <span class="tpl-label">${type.label}</span>
          <span class="tpl-desc">${type.desc}</span>
        </button>`).join('');
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
        emblem: '',
        siegel: '',
        unterschrift: '',
        media: {},
        sideWidth: typeId === 'zeitung' ? 220 : 160,
        imageFit: 'cover',
        imagePosition: 'center',
        table: type ? type.table.map(row => ({...row})) : [],
        artikel: [{titel:'Artikel 1', text:''}],
        personen: typeId === 'steckbrief' ? [{portrait:'', title:'', untertitel:'', text:'', imageFit:'cover', imagePosition:'center', table:type.table.map(row => ({...row}))}] : [],
        comments: [],
        secret: false,
      };
    },
  };
})();
