// Redaktionelle Hausquelle; Original und Quellenentscheidungen liegen im selben Ordner.
import { HOUSE_SELWYN_PORTRAITS } from '../../../../../../Stammbäume/assets/js/data/house-selwyn-portraits.js';
const card = ([id, name, role, detail = '', silhouette = 'male']) => ({ id, familyId: 'haus-selwyn', name, role, detail, silhouette, image: HOUSE_SELWYN_PORTRAITS[id] ? `../Stammbäume/${HOUSE_SELWYN_PORTRAITS[id]}` : '' });

export const HOUSE_CONTENT = {
  "id": "haus-selwyn",
  "name": "Haus Sélwyn O'Caer Ebirth",
  "type": "Ritterfürstenhaus",
  "page": "haus.html",
  "county": "Klaueninsel",
  "liege": "Haus Arth O'Talgarth",
  "territoryId": "herrschaft-silberklaue",
  "territoryName": "Silberklaue",
  "territoryHref": "../Kontinente/Estryll/Königreich Cenyr/Grafschaft Klaueninsel/Herrschaft Silberklaue/Herrschaft Silberklaue.html",
  "parentHouseId": "haus-arth",
  "extinct": false,
  "showMotto": false,
  "registerPage": true,
  "prepared": false,
  "contentVersion": "20261103-klaueninsel-v1",
  "biographySourceRevision": 3,
  "biographyPreviousDefaultFingerprints": [],
  "biographyIntroTitle": "Über das Haus",
  "biographyHistoryTitle": "Geschichte des Hauses",
  "biographySummary": {
    "overview": "Haus Sélwyn O’Caer Ebirth ist ein eigenständiges Ritterfürstenhaus der Silberklaue und unmittelbarer Vasall der Arth. Auf seiner kleinen Insel verbindet es reichen Bergbau mit Handel und einer großen Festung. Die Robbe im Wappen passt zum pragmatischen Selbstbild eines Hauses, das eher durch Verwaltung und wirtschaftlichen Einfluss als durch ständige Heldentaten hervortreten will.",
    "history": "Die Vorfahren wurden zunächst als nichtadelige Betreiber der reichen Inselminen und zum Schutz Ebirths eingesetzt. Treue Dienste führten später zur Erhebung in den Adel. Morgan und Cariad bilden die Gründerfamilie der bestehenden Akte. Das Haus ist kein Arth-Kadettenzweig; die spätere Einheirat Tegwen Arths gehört zu einer jüngeren Generation. Ein genaues Gründungsjahr ist nicht überliefert.",
    "character": "Pragmatismus, wirtschaftliche Weitsicht und Loyalität prägen das Haus. Langfristige Handelsbeziehungen und geordnete Verwaltung sollen seinen Wohlstand sichern. Dass andere Häuser die geringere Ausrichtung auf ritterlichen Ruhm belächeln, mindert den Nutzen seiner Güter und Verbindungen nicht. Ein verbindlicher eigener Leitspruch ist bislang nicht ausgearbeitet.",
    "customs": "Die jährliche Silberwoche erinnert an die erste große Silberader. Silberornamente schmücken die Insel, Händler kommen zum Austausch und zum Fest zusammen. Viele Angehörige richten ihre Ausbildung auf Handel, Bergbau und Verwaltung aus. Ein formaler Ritterschlag ersetzt deshalb in manchen Lebensläufen eine umfassende kriegerische Ausbildung.",
    "holdings": "Caer Ebirth gehört zu den bedeutenden Festungen der Inselgruppe. Edelmetalle, Erze und wertvolle Mineralien tragen den Reichtum der Herrschaft und werden auch ausgeführt. Die Mittel erlauben eine gut versorgte Bevölkerung sowie aufwendige Ausrüstung und Bauwerke. Die kleine Fläche der Insel begrenzt den wirtschaftlichen Einfluss des Hauses kaum.",
    "culture": "Die Sélwyn gehören zu den Cenyri und Inselcenyri sowie der Alerischen Kirche. Besondere Verehrung gilt dem Knecht; als besonders religiös wird die Familie nicht beschrieben. Gold, Grün, Silber und Schwarz sowie kostbare Metallverzierungen kennzeichnen ihre ritterliche Selbstdarstellung.",
    "relations": "Morgan führt das Haus seit 1720. Cledwyn ist erster, Evan zweiter Erbe. Arth bleibt der unmittelbare Lehnsherr. Viele weitere Beziehungen beruhen auf Handelsinteressen und begehrten Ressourcen. Die Hausüberlieferung nennt keine offene Fehde und behandelt Verbindungen zu Gilden als wirtschaftliche Grundlage seines Ansehens."
  },
  "placeholders": {
    "male": "../Stammbäume/assets/images/placeholders/male.png",
    "female": "../Stammbäume/assets/images/placeholders/female.png"
  },
  "allies": [],
  "hierarchy": [
    {
      "type": "Sammlung",
      "name": "Familien Häuser und Clans",
      "slug": "familien-hauser-und-clans"
    },
    {
      "type": "Königreich",
      "name": "Cenyr",
      "slug": "cenyr"
    },
    {
      "type": "Grafschaft",
      "name": "Klaueninsel",
      "slug": "klaueninsel"
    },
    {
      "type": "Herrschaft",
      "name": "Silberklaue",
      "slug": "silberklaue"
    },
    {
      "type": "Sitz",
      "name": "Caer Ebirth",
      "slug": "caer-ebirth"
    },
    {
      "type": "Haus",
      "name": "Haus Sélwyn O'Caer Ebirth",
      "slug": "haus-selwyn"
    }
  ],
  "profile": {
    "highestTitle": "Ritterfürst",
    "rank": "Ritterfürst",
    "houseType": "Ritterfürstenhaus",
    "motto": "",
    "quoteAuthor": "",
    "seat": "Caer Ebirth",
    "affiliation": "Silberklaue · Klaueninsel",
    "liege": "Haus Arth O'Talgarth",
    "troopStrength": "",
    "tiarna": "",
    "kerns": "",
    "fleet": "",
    "founding": "",
    "milestoneOne": "",
    "milestoneTwo": "",
    "patron": "",
    "knightingPatron": "",
    "people": "Cenyri, Inselcenyri",
    "wealth": "Hoch",
    "religion": "Alerische Kirche",
    "patronDeities": "Der Knecht",
    "origin": "Eigenständiges Bergbau- und Vasallenhaus der Arth",
    "cadetBranches": "",
    "allies": "",
    "enemies": ""
  },
  "omitMilitaryProfile": true,
  "sections": {
    "overview": [
      "Die Sélwyn sitzen in Caer Ebirth und führen die Ritterfürstenherrschaft Silberklaue unter den Arth. Ihre Insel ist klein, die Festung dagegen bedeutend. Bergbau, Handel und geordnete Verwaltung verschaffen dem Haus erheblichen Einfluss.",
      "Die Robbe ist das Wappentier des Geschlechts. Die Hausüberlieferung verbindet sie mit einer pragmatischen Selbstwahrnehmung: Auch ein weniger kriegerisches Haus kann sich durch Klugheit und Anpassungsfähigkeit behaupten."
    ],
    "history": [
      "Die Vorfahren der Sélwyn wurden von den Arth als nichtadelige Betreiber der reichen Minen und zum Schutz der Insel eingesetzt. Ihre treuen Dienste führten später zur Erhebung in den Adel. Der Schwerpunkt auf Bergbau und wirtschaftlichen Beziehungen blieb erhalten.",
      "Morgan und Cariad sind die Gründerfamilie der bestehenden Akte. Das Haus ist eigenständig; erst mehrere Generationen später heiratet Tegwen Arth in die Familie ein. Daraus entsteht kein früherer Kadettenursprung.",
      "Die jüngere Oberhauptfolge nennt Garselid, Berwyn und den gegenwärtigen Morgan. Ein genaues Gründungsjahr ist nicht sicher überliefert."
    ],
    "traditions": [
      "Die Silberwoche erinnert jährlich an die erste bedeutende Silberader. Die Insel wird mit Silberornamenten geschmückt, Händler kommen aus der Grafschaft zusammen, und Fest und Handel gehen ineinander über.",
      "Eine kaufmännische oder verwalterische Ausbildung gilt als geachteter Lebensweg. Manche Angehörige erhalten einen formalen Ritterschlag, ohne denselben Schwerpunkt auf kriegerische Ausbildung zu legen wie andere Adelshäuser."
    ],
    "knighthood": [
      "Die Sélwyn gehören zum cenyrischen Rittertum mit avallornischen Wurzeln, Salbung am Gewässer und den Eiden auf die Neun Göttlichen sowie die Dame der See. Persönliche Lebenswege können sich trotzdem stärker auf Handel und Verwaltung richten.",
      "Die wenigen besonders hervorgehobenen Hausritter zeigen Gold, Grün, Silber und Schwarz. Gute Schmiedearbeit, kostbare Metallverzierungen und mitunter Pelz bringen den Wohlstand des Hauses zum Ausdruck. Auch die weitere Ausrüstung der Hauskrieger wird als sorgfältig und hochwertig beschrieben."
    ],
    "holdings": [
      "Die reiche Inselwirtschaft fördert Edelmetalle, Erze und andere wertvolle Mineralien. Ein Teil wird an die Grafschaft geliefert, ein Teil ausgeführt. Diese Einkünfte tragen den Haushalt, die Bevölkerung und die große Festung Caer Ebirth.",
      "Die sichere Verwaltung der kleinen Insel und der Zugang zu guten Handwerkern stärken den Einfluss der Sélwyn. Ihre wirtschaftlichen Möglichkeiten stehen neben den geschuldeten Vasallenpflichten gegenüber Arth."
    ],
    "cultureReligion": "Die Sélwyn gehören zur Alerischen Kirche und verehren besonders den Knecht. Als ausgesprochen religiös wird das Haus nicht beschrieben. Cenyri- und Inselcenyri-Kultur verbinden sich hier mit einer starken Achtung für Handwerk, kaufmännisches Wissen und Verwaltung.",
    "conflictsAlliances": "Haus Arth ist der unmittelbare Lehnsherr. Andere Häuser mögen die geringe Neigung zu militärischem Ruhm belächeln, suchen jedoch wegen der Ressourcen und Handelskontakte häufig Verbindungen zu Sélwyn. Gilden und wirtschaftlich ausgerichtete Partner haben besondere Bedeutung. Eine offene Fehde wird nicht genannt.",
    "values": "Wirtschaftliche Weitsicht, Pragmatismus und Loyalität bilden die Leitgedanken. Wohlstand soll durch kluge Verwaltung und langfristige Beziehungen gesichert werden. Ein formaler Hausleitspruch ist bislang nicht überliefert.",
    "succession": "Cledwyn ist der erste Erbe, Evan der zweite. Morgan führt das Haus seit 1720.",
    "court": "Der Gründer Morgan und der gegenwärtige Morgan sind verschiedene Personen. Die Oberhauptfolge führt über Garselid und Berwyn. Zwanzig Hofämter sind bezeichnet, ihre Inhaber bleiben unbenannt.",
    "historicalFigures": "Morgan ist als Gründer des eigenständigen Hauses überliefert. Eine gesonderte ausgearbeitete historische Figurengalerie ist nicht vorhanden.",
    "familyTree": "Der bereits ausgearbeitete Stammbaum von Haus Sélwyn O'Caer Ebirth ist eingebettet. Das Hauswappen im Stammbaum öffnet die Hausbiografie."
  },
  "images": {
    "crest": "../Stammbäume/assets/images/houses/Klaueninsel/haus-selwyn.png",
    "scene": "Estryll/Cenyr/Klaueninsel/Silberklaue/Haus_Selwyn/assets/hausdarstellung-original.png",
    "sceneAlt": "Originale Sélwyn-Hausdarstellung mit grünem Wappenrock, Robbenmotiv und Robbe",
    "banner": "Estryll/Cenyr/Klaueninsel/Silberklaue/Haus_Selwyn/assets/herrschaftsbanner-original.png"
  },
  "illustrationCategory": "Hausdarstellung",
  "cadets": [],
  "figuresTitle": "Historische Persönlichkeiten des Hauses",
  "figures": [],
  "trivia": [
    "Die Silberwoche erinnert an die erste bedeutende Silberader.",
    "Die Robbe ist das Wappentier des Hauses."
  ],
  "currentHead": "Morgan Sélwyn",
  "firstHeir": "Cledwyn Sélwyn",
  founder: card(["morgan-founder-selwyn","Morgan Sélwyn","Stammvater und Gründer","Amtszeit nicht datiert"]),
  heads: [["morgan-founder-selwyn","Morgan Sélwyn","Ritterfürst","Amtszeit nicht datiert"],["garselid-selwyn","Garselid Sélwyn","Ritterfürst","Bis 1699"],["berwyn-selwyn","Berwyn Sélwyn","Ritterfürst","1699–1720"],["morgan-selwyn","Morgan Sélwyn","Ritterfürst","Seit 1720"]].map(card),
  heirs: [["cledwyn-selwyn","Cledwyn Sélwyn","Erster Erbe",""],["evan-selwyn","Evan Sélwyn","Zweiter Erbe",""]].map(card),
  offices: [["Vogt","male"],["Schatzmeister","female"],["Kommandant der Garde","male"],["Zeremonienmeister","female"],["Mundschenk","male"],["Waffenmeister","female"],["Stallmeister","male"],["Kerkermeister","female"],["Jagdmeister","male"],["Hafenmeister","female"],["Küchenmeister","male"],["Brotmeister","female"],["Handwerksmeister","male"],["Gartenmeister","female"],["Hofkaplan","male"],["Hofmeister","male"],["Hofdame","female"],["Archivar","male"],["Hoffalkner","female"],["Zwingermeister","male"]].map(([role, silhouette]) => ({ name: '', role, silhouette }))
};
