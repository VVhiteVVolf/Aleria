// Redaktionelle Hausquelle; Original und Quellenentscheidungen liegen im selben Ordner.
import { HOUSE_UNIGOL_PORTRAITS } from '../../../../../../Stammbäume/assets/js/data/house-unigol-portraits.js';
const card = ([id, name, role, detail = '', silhouette = 'male']) => ({ id, familyId: 'haus-unigol', name, role, detail, silhouette, image: HOUSE_UNIGOL_PORTRAITS[id] ? `../Stammbäume/${HOUSE_UNIGOL_PORTRAITS[id]}` : '' });

export const HOUSE_CONTENT = {
  "id": "haus-unigol",
  "name": "Haus Unigol O'Caer Marwor",
  "type": "Ritterfürstenhaus",
  "page": "haus.html",
  "county": "Klaueninsel",
  "liege": "Haus Arth O'Talgarth",
  "territoryId": "herrschaft-frostklaue",
  "territoryName": "Frostklaue",
  "territoryHref": "../Kontinente/Estryll/Königreich Cenyr/Grafschaft Klaueninsel/Herrschaft Frostklaue/Herrschaft Frostklaue.html",
  "parentHouseId": "haus-arth",
  "extinct": false,
  "showMotto": true,
  "registerPage": true,
  "prepared": false,
  "contentVersion": "20261103-klaueninsel-v1",
  "biographySourceRevision": 5,
  "biographyPreviousDefaultFingerprints": [],
  "biographyIntroTitle": "Über das Haus",
  "biographyHistoryTitle": "Geschichte des Hauses",
  "biographySummary": {
    "overview": "Haus Unigol O’Caer Marwor ist ein Ritterfürstenhaus der Frostklaue und ein Kadettenzweig der Arth. Es steht unter Haus Arth O’Talgarth. Der verrottende Bär seines Wappens verweist auf eine düstere Gründungssage und den Anspruch, selbst dort auszuharren, wo andere längst aufgeben.",
    "history": "Die Legende erzählt von einem Arth-Krieger, der eine Insel gegen eine feindliche Flotte hielt, bis Verstärkung eintreffen konnte. Er soll weit über die Grenzen seiner Kräfte hinaus gekämpft und später noch als kaum mehr als Haut und Knochen fortgelebt haben. Chronisten zweifeln diese Erzählung als „Arth-Märchen“ an; andere vermuten eine schwere Erkrankung hinter dem entstellten Erscheinungsbild. Die bestehende Hausüberlieferung führt Trahaern Arth und Ceridwen Pawen als Gründerpaar. Trahaern ist als erster Ritterfürst von 1644 bis 1669 verzeichnet.",
    "character": "Tapferkeit, Hartnäckigkeit und familiäre Loyalität bilden den Kern des Selbstbildes. Der Leitspruch lautet „Unbeugsam im Leben, kämpfend auch im Tod“. Zweifel an der Gründungssage werden im Haus nur ungern gehört. Der untote Bär ist dabei ein heraldisches und erzählerisches Zeichen, kein Nachweis eines untoten Zustands seiner Angehörigen.",
    "customs": "Unigol-Ritter suchen Aufgaben, die als beinahe unlösbar gelten: gefährliche Bestien bezwingen, ein bedrängtes Dorf unterstützen oder auf Reisen einen besonderen Beweis ihrer Tapferkeit gewinnen. Öffentliche Achtung soll durch Taten erworben werden. Die Herausforderung selbst wird zum Prüfstein des eigenen Mutes.",
    "holdings": "Caer Marwor ist der Stammsitz der Frostklaue. Der Bergbau liefert vor allem Erze für Waffen und Rüstungen; Edelmetalle sind selten. Einkünfte aus Vieh, Nahrung und Abgaben ergänzen die Grundlage. Das Haus gilt als einigermaßen wohlhabend, bleibt aber hinter reicheren Nachbarn wie Sélwyn zurück.",
    "culture": "Die Unigol zählen zu den Cenyri und Inselcenyri und werden auch zu den „Bärenmännern“ gerechnet. Sie gehören der Alerischen Kirche an und verehren den Streiter in einer rauen, wenig förmlichen Weise. Pelz, Leder, Brigantinen und Bärenfelle prägen ihre überlieferte Ausrüstungstradition.",
    "relations": "Neidion führt das Haus seit 1721. Rhiwallon ist erster Erbe, Tawny die nächste Erbin. Gute Verbindungen werden zu Arth, Pawen, Crafanc und Eirth beschrieben. Ehen können auch zu wirtschaftlich stärkeren, aus Unigol-Sicht weniger kriegerischen Häusern wie Sélwyn führen. Eine offene Hausfehde ist nicht benannt."
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
      "name": "Frostklaue",
      "slug": "frostklaue"
    },
    {
      "type": "Sitz",
      "name": "Caer Marwor",
      "slug": "caer-marwor"
    },
    {
      "type": "Haus",
      "name": "Haus Unigol O'Caer Marwor",
      "slug": "haus-unigol"
    }
  ],
  "profile": {
    "highestTitle": "Ritterfürst",
    "rank": "Ritterfürst",
    "houseType": "Ritterfürstenhaus",
    "motto": "Unbeugsam im Leben, kämpfend auch im Tod.",
    "quoteAuthor": "",
    "seat": "Caer Marwor",
    "affiliation": "Frostklaue · Klaueninsel",
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
    "wealth": "Mittelmäßig",
    "religion": "Alerische Kirche",
    "patronDeities": "Der Streiter",
    "origin": "Kadettenhaus der Arth; Trahaern Arth und Ceridwen Pawen",
    "cadetBranches": "",
    "allies": "",
    "enemies": ""
  },
  "omitMilitaryProfile": true,
  "sections": {
    "overview": [
      "Die Unigol sind Ritterfürsten von Caer Marwor in der Frostklaue. Als Kadettenhaus der Arth verbinden sie ihren Anspruch auf Tapferkeit mit einer ungewöhnlich düsteren Gründungssage. Der verrottende Bär ihres Wappens steht für Ausdauer und einen Willen, der selbst vor dem Tod nicht weichen soll.",
      "Die Familie betrachtet die Sage als Antrieb zu eigenen Heldentaten. Chronisten nehmen sie weit zurückhaltender auf; die Spannung zwischen Stolz und Zweifel gehört zur überlieferten Darstellung des Hauses."
    ],
    "history": [
      "Der Sage nach beanspruchte ein Krieger der Arth eine Insel, als eine feindliche Flotte herannahte. Mit seinem Gefolge hielt er die Stellung, bis Hilfe aus Talgarth eintreffen konnte. Er soll selbst dann noch weitergekämpft haben, als nur Hautfetzen und Knochen von ihm übrig gewesen seien, und danach noch Jahre gelebt und Nachkommen gezeugt haben.",
      "Seine Hartnäckigkeit sei mit der Burg und der Insel belohnt worden. Historiker bezweifeln die Geschichte als eines der „Arth-Märchen“. Eine andere Deutung vermutet hinter dem entstellten Krieger einen schwer kranken Menschen. Keine dieser Ausdeutungen macht die Legende zu einem gesicherten übernatürlichen Ereignis.",
      "Die vorhandene Familienakte führt Trahaern Arth und Ceridwen Pawen als Gründerpaar. Trahaern ist als erster Ritterfürst von 1644 bis 1669 belegt. Seine überlieferte Zähigkeit und sein langes Weiterleben nach schweren Verwundungen erklären, weshalb spätere Chronisten ihn mit dem Helden der Sage verbinden."
    ],
    "traditions": [
      "Das Haus sucht Herausforderungen, die gewöhnlich einem Helden vorbehalten wären. Ritter nehmen sich der Probleme des Volkes an oder stellen sich Aufgaben, die andere für aussichtslos halten: einen Oger allein bezwingen oder auf einer Fahrt ein Seeungeheuer aufspüren.",
      "Ehre und Achtung sollen durch sichtbare Taten gewonnen werden. Eine Bestientrophäe kann als Beweis der Tapferkeit gelten. Gerade weil die eigene Gründungssage angezweifelt wird, empfinden die Unigol solche Prüfungen als Bestätigung ihres Hausideals."
    ],
    "knighthood": [
      "Das Haus gehört zum cenyrischen Rittertum avallornischer Herkunft. In seiner Ausrüstungstradition stehen warme und widerstandsfähige Materialien im Vordergrund: Pelz, Leder und Brigantinen werden mit Eisen und Stahl verbunden. Ein Bärenfell über Kopf und Schultern kann die Nähe zum Wappentier betonen.",
      "Die leichteren Hauskrieger verwenden ebenfalls robuste Leder-, Pelz- und Brigantinenausrüstung. Schwerter, Äxte, Bögen und Speere gehören zur beschriebenen Bewaffnung. Die Hausüberlieferung hebt ihre Zähigkeit und ihre Rolle beim Schutz der Insel hervor."
    ],
    "holdings": [
      "Der Stammsitz ist Caer Marwor. Die Unigol betreiben Bergbau und verarbeiten vor allem Erze für Waffen und Rüstungen. Da Edelmetalle selten sind, erreicht ihr Bergbau nicht den Reichtum der benachbarten Sélwyn.",
      "Vieh, Nahrung und Abgaben der Untertanen ergänzen die wirtschaftliche Grundlage. Die vorhandenen Einkünfte tragen Haus und Herrschaft, ohne die Unigol zu einem der reichsten Geschlechter der Inselgruppe zu machen."
    ],
    "cultureReligion": "Die Unigol gehören zur Alerischen Kirche und verehren besonders den Streiter. Ihre Auslegung gilt als rustikal; als besonders förmlich oder fromm werden sie nicht beschrieben. Die Cenyri und Inselcenyri des Hauses verbinden den Beinamen „Bärenmänner“ mit ihrem Wappentier und der rauen Lebensweise.",
    "conflictsAlliances": "Haus Arth ist der unmittelbare Lehnsherr. Als gute Verbindungen nennt die Überlieferung Arth, Pawen, Crafanc und Eirth. Bevorzugt werden Häuser, die nach Einschätzung der Unigol über vergleichbare Stärke verfügen. Auch Verbindungen zu Sélwyn sind belegt, obwohl das Haus wegen seiner wirtschaftlichen Orientierung bisweilen herablassend beurteilt wird. Eine offene Fehde wird nicht genannt.",
    "values": "Tapferkeit, Ausdauer und Loyalität stehen im Mittelpunkt. Das Haus will Respekt durch das Lösen scheinbar unmöglicher Aufgaben erwerben. Sein Leitspruch und der verrottende Bär verdichten den Anspruch, auch in aussichtsloser Lage nicht zu weichen.",
    "succession": "Rhiwallon ist der erste Erbe des Hauses, Tawny die nächste Erbin. Die bestehende Hausakte führt Neidion seit 1721 als Oberhaupt.",
    "court": "Die überlieferte Oberhauptfolge führt von Trahaern über Trachmyr, Tarawg und Tryffin zu Neidion. Zwanzig Hofämter sind bezeichnet, ihre Inhaber jedoch nicht namentlich ausgearbeitet.",
    "historicalFigures": "Trahaern Arth ist der überlieferte Stammvater und erste Ritterfürst. Seine Verbindung zur düsteren Gründungssage bleibt eine historische Deutung.",
    "familyTree": "Der bereits ausgearbeitete Stammbaum von Haus Unigol O'Caer Marwor ist eingebettet. Das Hauswappen im Stammbaum öffnet die Hausbiografie."
  },
  "images": {
    "crest": "../Stammbäume/assets/images/houses/Klaueninsel/haus-unigol.png",
    "scene": "Estryll/Cenyr/Klaueninsel/Frostklaue/Haus_Unigol/assets/hausdarstellung-original.png",
    "sceneAlt": "Originale Unigol-Hausdarstellung mit orangefarbenem Pelz, geschlossenem Helm und Schwert",
    "banner": "Estryll/Cenyr/Klaueninsel/Frostklaue/Haus_Unigol/assets/herrschaftsbanner-original.png"
  },
  "illustrationCategory": "Hausdarstellung",
  "cadets": [],
  "figuresTitle": "Historische Persönlichkeiten des Hauses",
  "figures": [],
  "trivia": [
    "Der verrottende Bär verweist auf die Gründungssage und das Ideal unbeugsamer Ausdauer."
  ],
  "currentHead": "Neidion Unigol",
  "firstHeir": "Rhiwallon Unigol",
  founder: card(["trahaern-arth","Trahaern Arth","Gründer und erster Ritterfürst","1644–1669"]),
  heads: [["trahaern-arth","Trahaern Arth","Ritterfürst","1644–1669"],["trachmyr-unigol","Trachmyr Unigol","Ritterfürst","1669–1684"],["tarawg-unigol","Tarawg Unigol","Ritterfürst","1684–1706"],["tryffin-unigol","Tryffin Unigol","Ritterfürst","1706–1720"],["neidion-unigol","Neidion Unigol","Ritterfürst","Seit 1721"]].map(card),
  heirs: [["rhiwallon-unigol","Rhiwallon Unigol","Erster Erbe",""],["tawny-unigol","Tawny Unigol","Nächste Erbin","","female"]].map(card),
  offices: [["Vogt","male"],["Schatzmeister","female"],["Kommandant der Garde","male"],["Zeremonienmeister","female"],["Mundschenk","male"],["Waffenmeister","male"],["Stallmeister","female"],["Kerkermeister","male"],["Jagdmeister","female"],["Hafenmeister","male"],["Küchenmeister","male"],["Brotmeister","female"],["Handwerksmeister","male"],["Gartenmeister","female"],["Hofkaplan","male"],["Hofmeister","male"],["Hofdame","female"],["Archivar","male"],["Hoffalkner","female"],["Zwingermeister","male"]].map(([role, silhouette]) => ({ name: '', role, silhouette }))
};
