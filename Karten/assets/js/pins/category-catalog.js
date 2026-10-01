// Shared location taxonomy. Preserve saved map-specific IDs and edits when upgrading.
(function(root){
  const VERSION = 2;
  const BASE = '/Karten/assets/images/pin-placeholders/';
  const DEFINITIONS = [
    {"id":"mmflrbzxydg7","label":"Hauptstadt","color":"#ff0000","asset":"settlement-hauptstadt","addedIn":0,"aliases":[]},
    {"id":"mmflrqajby8b","label":"Bauernsiedlung","color":"#6060b0","asset":"settlement-bauernsiedlung","addedIn":0,"aliases":[]},
    {"id":"mmflry5furso","label":"Hafensiedlung","color":"#b03030","asset":"settlement-hafensiedlung","addedIn":0,"aliases":[]},
    {"id":"mmfls5afqqpr","label":"Burgsiedlung","color":"#9050b0","asset":"settlement-burgsiedlung","addedIn":0,"aliases":[]},
    {"id":"mmflsfqh3sft","label":"Handelssiedlung","color":"#3a8a3a","asset":"settlement-handelssiedlung","addedIn":0,"aliases":["Kaufmannssiedlung"]},
    {"id":"mmflsrndeiee","label":"Brückensiedlung","color":"#2a7aaa","asset":"settlement-brueckensiedlung","addedIn":0,"aliases":[]},
    {"id":"mmflt1x3v22o","label":"Bergbausiedlung","color":"#7a6040","asset":"settlement-bergbausiedlung","addedIn":0,"aliases":[]},
    {"id":"mmflt7uj831y","label":"Waldsiedlung","color":"#c07030","asset":"settlement-waldsiedlung","addedIn":0,"aliases":[]},
    {"id":"mmflteurd4n5","label":"Kirchensiedlung","color":"#508080","asset":"settlement-kirchensiedlung","addedIn":0,"aliases":[]},
    {"id":"mmfltia1m3s7","label":"Leuchtturmsiedlung","color":"#c49a20","asset":"settlement-leuchtturmsiedlung","addedIn":0,"aliases":[]},
    {"id":"mmfltullsctk","label":"Festungssiedlung","color":"#6060b0","asset":"settlement-festungssiedlung","addedIn":0,"aliases":["Befestigte Siedlung"]},
    {"id":"mmflvj37jbh2","label":"Taverne","color":"#b03030","asset":"settlement-taverne","addedIn":0,"aliases":["Gasthof","Ländlicher Gasthof","Herberge"]},
    {"id":"mmflvquv2rr3","label":"Siedlungsruine","color":"#9050b0","asset":"settlement-siedlungsruine","addedIn":0,"aliases":["Ruinierte Siedlung"]},
    {"id":"mmflw1z5ko6e","label":"Stadtruine","color":"#3a8a3a","asset":"settlement-stadtruine","addedIn":0,"aliases":[]},
    {"id":"mmflw73t2e8v","label":"Bardensiedlung","color":"#2a7aaa","asset":"settlement-bardensiedlung","addedIn":0,"aliases":[]},
    {"id":"mmflwdjfl6ah","label":"Stadt","color":"#7a6040","asset":"settlement-stadt","addedIn":0,"aliases":["Kleinstadt"]},
    {"id":"mmflwmdfcyua","label":"Turmruine","color":"#c07030","asset":"settlement-turmruine","addedIn":0,"aliases":["Ruinierter Turm"]},
    {"id":"mmflwxad8w1j","label":"Schiffswrack","color":"#508080","asset":"settlement-schiffswrack","addedIn":0,"aliases":[]},
    {"id":"mmflx4731uj6","label":"Turnierplatz","color":"#c49a20","asset":"settlement-turnierplatz","addedIn":0,"aliases":["Turnierfeld","Turnier"]},
    {"id":"mmflxnnhbh4g","label":"Besondere Orte","color":"#6060b0","asset":"settlement-besondere-orte","addedIn":0,"aliases":[]},
    {"id":"location-dorf","label":"Dorf","color":"#7a6040","asset":"template-siedlung","marker":"/Karten/assets/icons/welt/bardensiedlung.png","aliases":["Weiler"],"addedIn":1},
    {"id":"location-bauernhof","label":"Bauernhof","color":"#3a8a3a","asset":"location-bauernhof","marker":"/Karten/assets/icons/welt/bauernsiedlung.png","aliases":["Bauernhaus","Einfacher Hof"],"addedIn":1},
    {"id":"location-landgut","label":"Landgut","color":"#906438","asset":"location-landgut","marker":"/Karten/assets/icons/welt/landgut.png","aliases":[],"addedIn":1},
    {"id":"location-anwesen","label":"Anwesen","color":"#b08030","asset":"location-anwesen","marker":"/Karten/assets/icons/welt/anwesen.png","aliases":["Herrenhaus"],"addedIn":1},
    {"id":"location-rittergut","label":"Rittergut","color":"#508080","asset":"location-rittergut","marker":"/Karten/assets/icons/welt/kleine-burg.png","aliases":["Ritterliches Gut","Clan-Gut","Clan Gut"],"addedIn":1},
    {"id":"location-weingut","label":"Weingut","color":"#a45630","asset":"location-weingut","marker":"/Karten/assets/icons/welt/weingut.png","aliases":["Großes Weingut","Kleines Weingut"],"addedIn":1},
    {"id":"location-obstplantage","label":"Obstplantage","color":"#6060b0","asset":"location-obstplantage","marker":"/Karten/assets/icons/welt/obstplantage.png","aliases":[],"addedIn":1},
    {"id":"location-viehweide","label":"Viehweide","color":"#7a6040","asset":"location-viehweide","marker":"/Karten/assets/icons/welt/weide.png","aliases":["Weide"],"addedIn":1},
    {"id":"location-gestuet","label":"Gestüt","color":"#3a8a3a","asset":"location-gestuet","marker":"/Karten/assets/icons/welt/gest-t.png","aliases":["Pferdezucht","Rosszucht"],"addedIn":1},
    {"id":"location-muehle","label":"Mühle","color":"#906438","asset":"location-muehle","marker":"/Karten/assets/icons/welt/m-hle.png","aliases":[],"addedIn":1},
    {"id":"location-mine","label":"Mine","color":"#b08030","asset":"location-mine","marker":"/Karten/assets/icons/welt/einzelnemine.png","aliases":["Salzmine","Bergwerk","Grube"],"addedIn":1},
    {"id":"location-steinbruch","label":"Steinbruch","color":"#508080","asset":"location-steinbruch","marker":"/Karten/assets/icons/welt/steinbruch-1.png","aliases":[],"addedIn":1},
    {"id":"location-schmiede","label":"Schmiede","color":"#a45630","asset":"location-schmiede","marker":"/Karten/assets/icons/welt/schmiede.png","aliases":["Schmiedstätte"],"addedIn":1},
    {"id":"location-brauerei","label":"Brauerei","color":"#6060b0","asset":"location-brauerei","marker":"/Karten/assets/icons/welt/brauersiedlung.png","aliases":[],"addedIn":1},
    {"id":"location-fischerei","label":"Fischerei","color":"#7a6040","asset":"location-fischerei","marker":"/Karten/assets/icons/welt/fischerh-tte.png","aliases":["Fischer","Fischerhütte"],"addedIn":1},
    {"id":"location-holzfaellerlager","label":"Holzfällerlager","color":"#3a8a3a","asset":"location-holzfaellerlager","marker":"/Karten/assets/icons/welt/holzf-llerlager.png","aliases":[],"addedIn":1},
    {"id":"location-koehlerei","label":"Köhlerei","color":"#906438","asset":"location-koehlerei","marker":"/Karten/assets/icons/welt/k-hler3.png","aliases":["Köhler"],"addedIn":1},
    {"id":"location-imkerei","label":"Imkerei","color":"#b08030","asset":"location-imkerei","marker":"/Karten/assets/icons/welt/imkerhof.png","aliases":["Imker"],"addedIn":1},
    {"id":"location-handelskontor","label":"Handelskontor","color":"#508080","asset":"location-handelskontor","marker":"/Karten/assets/icons/welt/kontor.png","aliases":["Handelshof"],"addedIn":1},
    {"id":"location-markt","label":"Markt","color":"#a45630","asset":"template-handel","marker":"/Karten/assets/icons/welt/marktstand.png","aliases":["Marktplatz"],"addedIn":1},
    {"id":"location-gildenhaus","label":"Gildenhaus","color":"#6060b0","asset":"template-orden","marker":"/Karten/assets/icons/welt/gildenzentrale.png","aliases":["Gilde","Möwensang-Standort","Wolken der Dämmerung","Fianna Sitz"],"addedIn":1},
    {"id":"location-burg","label":"Burg","color":"#7a6040","asset":"location-burg","marker":"/Karten/assets/icons/welt/gro-e-burg.png","aliases":["Große Burg","Castell / Burg","Castell/ Burg","Castell/Burg","Windreiter Burg"],"addedIn":1},
    {"id":"location-turm","label":"Turm","color":"#3a8a3a","asset":"location-turm","marker":"/Karten/assets/icons/welt/turm.png","aliases":["Wachturm"],"addedIn":1},
    {"id":"location-leuchtturm","label":"Leuchtturm","color":"#906438","asset":"location-leuchtturm","marker":"/Karten/assets/icons/welt/leuchtturm.png","aliases":[],"addedIn":1},
    {"id":"location-aussenposten","label":"Außenposten","color":"#b08030","asset":"location-aussenposten","marker":"/Karten/assets/icons/welt/au-enposten.png","aliases":["Wachposten"],"addedIn":1},
    {"id":"location-grenzposten","label":"Grenzposten","color":"#508080","asset":"location-grenzposten","marker":"/Karten/assets/icons/welt/zoll-grenzposten.png","aliases":["Zollposten"],"addedIn":1},
    {"id":"location-heerlager","label":"Heerlager","color":"#a45630","asset":"location-heerlager","marker":"/Karten/assets/icons/welt/heereslager.png","aliases":["Heereslager"],"addedIn":1},
    {"id":"location-lagerplatz","label":"Lagerplatz","color":"#6060b0","asset":"location-lagerplatz","marker":"/Karten/assets/icons/welt/lager.png","aliases":["Lager"],"addedIn":1},
    {"id":"location-jaegerlager","label":"Jägerlager","color":"#7a6040","asset":"location-jaegerlager","marker":"/Karten/assets/icons/welt/j-gerlager.png","aliases":[],"addedIn":1},
    {"id":"location-jagdhaus","label":"Jagdhaus","color":"#3a8a3a","asset":"location-jagdhaus","marker":"/Karten/assets/icons/welt/j-gerhaus.png","aliases":[],"addedIn":1},
    {"id":"location-druidenhuette","label":"Druidenhütte","color":"#906438","asset":"location-druidenhuette","marker":"/Karten/assets/icons/welt/druidenh-tte.png","aliases":[],"addedIn":1},
    {"id":"location-hexenhuette","label":"Hexenhütte","color":"#b08030","asset":"location-hexenhuette","marker":"/Karten/assets/icons/welt/hexenhaus.png","aliases":[],"addedIn":1},
    {"id":"location-schrein","label":"Schrein","color":"#508080","asset":"location-schrein","marker":"/Karten/assets/icons/welt/wegschrein.png","aliases":["Wegschrein"],"addedIn":1},
    {"id":"location-heiligtum","label":"Heiligtum","color":"#a45630","asset":"template-institution","marker":"/Karten/assets/icons/welt/heiligtum.png","aliases":["Besonderes Heiligtum","Tempel","Kirche","Kloster"],"addedIn":1},
    {"id":"location-friedhof","label":"Friedhof","color":"#6060b0","asset":"location-friedhof","marker":"/Karten/assets/icons/welt/l-ndlicher-friedhof.png","aliases":[],"addedIn":1},
    {"id":"location-grabstaette","label":"Grabstätte","color":"#7a6040","asset":"location-grabstaette","marker":"/Karten/assets/icons/welt/grabmal.png","aliases":["Grabmal","Antikes Grab","Antike Grabstätte","Gruft"],"addedIn":1},
    {"id":"location-ruine","label":"Ruine","color":"#3a8a3a","asset":"template-ruine","marker":"/Karten/assets/icons/welt/ruine2.png","aliases":["Antike Ruine","Alte Ruine"],"addedIn":1},
    {"id":"location-ausgrabung","label":"Ausgrabung","color":"#906438","asset":"location-ausgrabung","marker":"/Karten/assets/icons/welt/ausgrabung.png","aliases":[],"addedIn":1},
    {"id":"location-hoehle","label":"Höhle","color":"#b08030","asset":"location-hoehle","marker":"/Karten/assets/icons/welt/h-hle.png","aliases":["Spalt"],"addedIn":1},
    {"id":"location-hain","label":"Hain","color":"#508080","asset":"template-natur","marker":"/Karten/assets/icons/welt/hain.png","aliases":["Druidenhain","Waldschrat Hain","Wald"],"addedIn":1},
    {"id":"location-ahnenbaum","label":"Ahnenbaum","color":"#a45630","asset":"location-ahnenbaum","marker":"/Karten/assets/icons/welt/ahnenbaum.png","aliases":[],"addedIn":1},
    {"id":"location-quelle","label":"Quelle","color":"#6060b0","asset":"location-quelle","marker":"/Karten/assets/icons/welt/quelle.png","aliases":[],"addedIn":1},
    {"id":"location-berggipfel","label":"Berggipfel","color":"#7a6040","asset":"location-berggipfel","marker":"/Karten/assets/icons/welt/gipfel.png","aliases":[],"addedIn":1},
    {"id":"location-monsterhort","label":"Monsterhort","color":"#3a8a3a","asset":"template-monsterhort","marker":"/Karten/assets/icons/welt/kreaturenhort.png","aliases":[],"addedIn":1},
    {"id":"location-banditenlager","label":"Banditenlager","color":"#906438","asset":"location-banditenlager","marker":"/Karten/assets/icons/welt/banditenlager.png","aliases":["Banditenversteck"],"addedIn":1},
    {"id":"location-hafen","label":"Hafen / Steg","color":"#b08030","asset":"location-hafen","marker":"/Karten/assets/icons/welt/gro-er-hafen.png","aliases":["Hafen","Steg"],"addedIn":1},
    {"id":"location-werft","label":"Werft","color":"#508080","asset":"location-werft","marker":"/Karten/assets/icons/welt/schiffswerft.png","aliases":[],"addedIn":1},
    {"id":"location-poststation","label":"Poststation","color":"#a45630","asset":"location-poststation","marker":"/Karten/assets/icons/welt/poststation.png","aliases":["Kutscher","Kutscherstation"],"addedIn":1},
    {"id":"location-schule","label":"Schule","color":"#6060b0","asset":"location-schule","marker":"/Karten/assets/icons/welt/l-ndliche-universit-t.png","aliases":[],"addedIn":1},
    {"id":"location-zirkus","label":"Zirkus","color":"#7a6040","asset":"location-zirkus","marker":"/Karten/assets/icons/welt/zirkus3.png","aliases":[],"addedIn":1},
    {"id":"location-wohnhaus","label":"Wohnhaus","color":"#906438","asset":"location-wohnhaus","marker":"/Karten/assets/icons/welt/b-uerliches-heim.png","aliases":["Heim","Ländliches Heim","Schäbige Hütte","Schäbiges Bauernhaus"],"addedIn":1},
    {"id":"location-brauersiedlung","label":"Brauersiedlung","color":"#7a6040","asset":"location-brauersiedlung","marker":"/Karten/assets/icons/welt/brauersiedlung.png","aliases":[],"addedIn":2},
    {"id":"location-klostersiedlung","label":"Klostersiedlung","color":"#3a8a3a","asset":"location-klostersiedlung","marker":"/Karten/assets/icons/welt/klostersiedlung.png","aliases":[],"addedIn":2},
    {"id":"location-rosszuchtsiedlung","label":"Rosszuchtsiedlung","color":"#508080","asset":"location-rosszuchtsiedlung","marker":"/Karten/assets/icons/welt/pferdezuchtsiedlung.png","aliases":["Rosszucht Siedlung","Pferdezuchtsiedlung"],"addedIn":2},
    {"id":"location-sumpfsiedlung","label":"Sumpfsiedlung","color":"#906438","asset":"location-sumpfsiedlung","marker":"/Karten/assets/icons/welt/sumpfsiedlung.png","aliases":[],"addedIn":2},
    {"id":"location-unterwasserstadt","label":"Unterwasserstadt","color":"#6060b0","asset":"location-unterwasserstadt","marker":"/Karten/assets/icons/welt/unterwasserstadt.png","aliases":["Unterwasser Stadt"],"addedIn":2},
    {"id":"location-festung","label":"Festung","color":"#b08030","asset":"location-festung","marker":"/Karten/assets/icons/welt/festung.png","aliases":["Dunkle Festung"],"addedIn":2},
    {"id":"location-magierturm","label":"Magierturm","color":"#7a6040","asset":"location-magierturm","marker":"/Karten/assets/icons/welt/magierturm.png","aliases":[],"addedIn":2},
    {"id":"location-diebesgilde","label":"Diebesgilde","color":"#3a8a3a","asset":"location-diebesgilde","marker":"/Karten/assets/icons/welt/diebesgilde.png","aliases":[],"addedIn":2},
    {"id":"location-piratenversteck","label":"Piratenversteck","color":"#508080","asset":"location-piratenversteck","marker":"/Karten/assets/icons/welt/piratenlager.png","aliases":[],"addedIn":2},
    {"id":"location-schmugglerversteck","label":"Schmugglerversteck","color":"#906438","asset":"location-schmugglerversteck","marker":"/Karten/assets/icons/welt/schmuggler3.png","aliases":["Schmuggel","Schmugglerlager"],"addedIn":2},
    {"id":"location-verwunschener-wald","label":"Verwunschener Wald","color":"#6060b0","asset":"location-verwunschener-wald","marker":"/Karten/assets/icons/welt/waldschrat.png","aliases":[],"addedIn":2},
    {"id":"location-wahrzeichen","label":"Wahrzeichen","color":"#b08030","asset":"location-wahrzeichen","marker":"/Karten/assets/icons/welt/wahrzeichen.png","aliases":[],"addedIn":2},
    {"id":"location-dimensionaler-riss","label":"Dimensionaler Riss","color":"#7a6040","asset":"location-dimensionaler-riss","marker":"/Karten/assets/icons/welt/dimensionaler-riss.png","aliases":[],"addedIn":2},
    {"id":"location-galgen","label":"Galgen","color":"#3a8a3a","asset":"location-galgen","marker":"/Karten/assets/icons/welt/exekutionsplatz.png","aliases":["Richtstätte","Exekutionsplatz"],"addedIn":2},
    {"id":"location-muenzpraegestaette","label":"Münzprägestätte","color":"#508080","asset":"location-muenzpraegestaette","marker":"/Karten/assets/icons/welt/m-nzpr-ger.png","aliases":["Münzpräger","Münzpräge"],"addedIn":2},
    {"id":"location-bogenschiessstand","label":"Bogenschießstand","color":"#906438","asset":"location-bogenschiessstand","marker":"/Karten/assets/icons/welt/schie-stand2.png","aliases":["Schießstand"],"addedIn":2},
    {"id":"location-ziegelei","label":"Ziegelei","color":"#6060b0","asset":"location-ziegelei","marker":"/Karten/assets/icons/welt/ziegelbrenner.png","aliases":["Ziegelbrenner"],"addedIn":2},
    {"id":"location-schiff","label":"Schiff","color":"#b08030","asset":"location-schiff","marker":"/Karten/assets/icons/orte/schiff-gut.png","aliases":[],"addedIn":2},
    {"id":"location-kreaturenlager","label":"Kreaturenlager","color":"#7a6040","asset":"location-kreaturenlager","marker":"/Karten/assets/icons/welt/goblinlager.png","aliases":["Hornlingslager","Goblinlager","Monsterlager"],"addedIn":2},
    {"id":"location-heisse-quellen","label":"Heiße Quellen","color":"#3a8a3a","asset":"location-heisse-quellen","marker":"/Karten/assets/icons/welt/hei-e-quellen.png","aliases":[],"addedIn":2},
    {"id":"location-brueckenruine","label":"Brückenruine","color":"#508080","asset":"location-brueckenruine","marker":"/Karten/assets/icons/welt/zerst-rte-br-cke.png","aliases":["Zerstörte Brücke"],"addedIn":2},
    {"id":"location-kirchenruine","label":"Kirchenruine","color":"#906438","asset":"location-kirchenruine","marker":"/Karten/assets/icons/welt/zerst-rte-kirche.png","aliases":["Zerstörte Kirche"],"addedIn":2},
    {"id":"location-hausruine","label":"Hausruine","color":"#6060b0","asset":"location-hausruine","marker":"/Karten/assets/icons/welt/zerst-rtes-heim.png","aliases":["Zerstörtes Haus"],"addedIn":2},
    {"id":"location-huegelgrab","label":"Hügelgrab","color":"#b08030","asset":"location-grabstaette","marker":"/Karten/assets/icons/welt/h-gelgrab.png","aliases":[],"addedIn":2},
    {"id":"location-plantage","label":"Plantage","color":"#7a6040","asset":"location-plantage","marker":"/Karten/assets/icons/welt/landgut.png","aliases":[],"addedIn":2},
    {"id":"location-kultstaette","label":"Kultstätte","color":"#3a8a3a","asset":"location-kultstaette","marker":"/Karten/assets/icons/welt/okkulter-schrein.png","aliases":["Okkulter Schrein","Infernaler Schrein"],"addedIn":2},
    {"id":"location-zelt","label":"Zelt","color":"#508080","asset":"location-lagerplatz","marker":"/Karten/assets/icons/welt/ritterlicheszelt.png","aliases":[],"addedIn":2},
    {"id":"location-faehrstelle","label":"Fährstelle","color":"#906438","asset":"location-faehrstelle","marker":"/Karten/assets/icons/orte/f-hre-steg.png","aliases":["Fähre","Steg – Fähre","Steg - Fähre"],"addedIn":2},
    {"id":"location-schlachtfeld","label":"Schlachtfeld","color":"#6060b0","asset":"location-schlachtfeld","aliases":[],"addedIn":2},
  ];
  DEFINITIONS.forEach(entry => { Object.freeze(entry.aliases); Object.freeze(entry); });
  Object.freeze(DEFINITIONS);

  function normalize(value){
    return String(value || '').trim().toLocaleLowerCase('de')
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss').replace(/[\s_–—-]+/g, ' ');
  }
  const byId = new Map(DEFINITIONS.map(entry => [entry.id, entry]));
  const byLabel = new Map();
  for(const entry of DEFINITIONS){
    for(const label of [entry.label, ...entry.aliases]) byLabel.set(normalize(label), entry);
  }
  function definition(category = {}){
    return byLabel.get(normalize(category.label)) || byId.get(category.id);
  }
  function category(entry){
    const result = {id:entry.id, label:entry.label, color:entry.color};
    if(entry.marker) result.marker = entry.marker;
    return result;
  }
  function defaults(){
    return DEFINITIONS.map(category);
  }
  // Versioned additions let users subsequently rename or remove categories.
  // No existing category, pin, ID, color or custom marker is overwritten.
  function upgrade(state = {}){
    const cats = Array.isArray(state.cats) ? state.cats.map(item => ({...item})) : defaults();
    const seen = new Set(cats.map(item => definition(item)?.id).filter(Boolean));
    const ids = new Set(cats.map(item => item.id));
    const version = Number(state.categoryCatalogVersion) || 0;
    for(const entry of DEFINITIONS){
      if(entry.addedIn > version && !seen.has(entry.id) && !ids.has(entry.id)){
        cats.push(category(entry));
        seen.add(entry.id);
        ids.add(entry.id);
      }
    }
    return {cats, categoryCatalogVersion:Math.max(version, VERSION)};
  }
  function placeholder(category){
    const entry = definition(category);
    return entry ? BASE + entry.asset + '.webp' : '';
  }
  root.KartoCategoryCatalog = Object.freeze({
    version:VERSION, definitions:DEFINITIONS, defaults, upgrade, definition, placeholder,
    sources:Object.freeze([...new Set(DEFINITIONS.map(entry => BASE + entry.asset + '.webp'))]),
  });
})(typeof window !== 'undefined' ? window : globalThis);

