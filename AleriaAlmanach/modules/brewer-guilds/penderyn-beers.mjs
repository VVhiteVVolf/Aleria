// User-confirmed supplement, 7 October 2026, from Zum Roten Drachen.
// The source table exchanged the two Penderyn descriptions; names, images and prices stay paired.
// Serving prices are current quotes, outside the earlier 22-drink price increase.
export const PENDERYN_BEERS = [
  {
    "id": "bier-goldschuppen",
    "name": "Goldschuppen Bier",
    "subtitle": "Helles Hausbier · Penderyn",
    "tags": [
      "Helles Malz",
      "Vanille",
      "Eiche"
    ],
    "occasions": [
      "Tavernenabend",
      "Alltagsbier"
    ],
    "servingCopper": 2,
    "imageFormat": "square",
    "sourceImage": "https://i.imgur.com/KAlHUHv.png",
    "paragraphs": [
      "Das Goldschuppen ist das standardisierte Helle der Penderyn-Destillerie, entstanden aus nüchterner Notwendigkeit und ehrgeizigem Stolz. Wer Whiskey brennt, kann nicht zulassen, dass allein die Teyrngarcher Brauerzunft den Biermarkt dominiert. Also brachte die Gilde ihr eigenes Helles hervor – nicht als Nebenspielerei, sondern als ernstzunehmende Antwort.",
      "Gebraut wird es mit hellem Gerstenmalz, sauber geführter Gärung und einer bewusst milden Hopfung. Der eigentliche Kniff liegt jedoch in der Reifung: Ein Teil des Suds ruht für kurze Zeit in ehemaligen Penderyn-Whiskeyfässern, bevor er mit dem frischen Bier verschnitten wird. Kein schwerer Fassgeschmack, kein aufdringliches Brennfeuer – nur ein Hauch von Eichenwärme und feiner Vanillenote, der dem Bier Tiefe verleiht, ohne es zu beschweren.",
      "Gedacht ist es als Alltagsbier mit Anspruch. Leicht genug für lange Abende, charakterstark genug, um neben großen Namen zu bestehen. In städtischen Gegenden längst ein Exportschlager – Tavernen in ganz Cenyr führen es mittlerweile selbstverständlich.",
      "Im Glas schimmert es wie eine einzelne, sonnenbeschienene Drachenschuppe – warm golden, klar, mit feinem, cremigem Schaum. Der erste Duft ist frisch: Getreide, ein Hauch Blütenhonig, darunter fast unmerklich die leise Spur von Eiche.",
      "Der erste Schluck ist weich. Kein Angriff, kein Aufplustern. Es legt sich an den Gaumen wie warmer Spätsommer. Leicht süßliches Malz, dann eine dezente, saubere Hopfenbittere, die nicht sticht, sondern trägt. Und dann – fast unbewusst – dieser feine Whiskey-Schatten: Vanille, ein Hauch Karamell, eine trockene Holznote im Nachklang.",
      "Es will dich nicht beeindrucken. Es will dich entspannen.\nEin Bier, das dich sitzen lässt, statt dich aufzurütteln.\nEin ruhiger Atemzug eines Drachen – nicht sein Feuer."
    ]
  },
  {
    "id": "bier-drachenblut",
    "name": "Drachenblut Bier",
    "subtitle": "Dunkles, fassgereiftes Hausbier · Penderyn",
    "tags": [
      "Röstmalz",
      "Toffee",
      "Whiskeyfass"
    ],
    "occasions": [
      "Ruhiger Abend",
      "Herzhafte Speisen"
    ],
    "servingCopper": 4,
    "imageFormat": "square",
    "sourceImage": "https://i.imgur.com/ZzzHkOC.png",
    "paragraphs": [
      "Das Drachenblut ist das zweite große Standbein der Penderyn-Gilde – dunkler, kräftiger und eigenwilliger als die Goldschuppe. Sein Name ist kein Marketingtrick: Im richtigen Licht schimmert es tiefrotbraun, fast wie geronnenes Blut im Glas. Gebraut wird es aus stärker geröstetem Malz, mit längerer Maischeführung und deutlich höherem Stammwürzegehalt.",
      "Anders als die Goldschuppe ruht das Drachenblut länger in ehemaligen Whiskeyfässern. Nicht nur ein Hauch, sondern eine spürbare Reifung. Die Eiche darf arbeiten, der Restalkohol darf Tiefe entwickeln, die Röstnoten dürfen sich mit Vanille, dunklem Holz und einem Anflug von Rauch verbinden. Es ist kein bloßes Dunkelbier – es ist ein Hybrid aus Brau- und Brennkunst. In vielen Städten ist es mindestens so gefragt wie das helle Pendant, mancherorts sogar begehrter.",
      "Gedacht ist es nicht für den schnellen Durst. Es ist ein Bier für Abende, an denen Gespräche langsamer werden und die Kerzen tiefer brennen.",
      "Im Krug wirkt es schwer. Tief. Fast lebendig. Der Schaum ist dicht, cremig, leicht karamellfarben. Schon im Duft liegt geröstetes Malz, dunkle Schokolade, ein Hauch von Kaffee – und darunter diese warme, würzige Eiche.",
      "Der erste Schluck ist vollmundig. Malzsüße trifft auf sanfte Bittere, dann entfaltet sich die Fassreife: Vanille, Toffee, ein warmer Whiskey-Schleier, der sich wie Glut im Rachen ausbreitet. Es brennt nicht – es wärmt.",
      "Langsam. Nachhaltig.",
      "Das Drachenblut ist kein Atemzug.\nEs ist die Glut im Inneren des Drachen.\nUnd wer es trinkt, spürt, wie es sich im Bauch niederlässt und dort bleibt."
    ]
  },
  {
    "id": "bier-brandhorn",
    "partner": true,
    "name": "Brandhorn Bier",
    "subtitle": "Rauch- und Wacholderbier · Gochwyr × Penderyn",
    "tags": [
      "Rauchmalz",
      "Wacholder",
      "Harzig"
    ],
    "occasions": [
      "Wirtshaus",
      "Lagerfeuer"
    ],
    "badge": "Kooperationsbier",
    "origin": "Gochwyr · Zum Roten Drachen · Llamreis Ankunft · Königreich Cenyr",
    "conditions": "Traditionsbier der Gochwyr vom „Zum Roten Drachen“, veredelt in Zusammenarbeit mit der Penderyn-Destillerie. Keine Fassreifung; die eigene Herkunft bleibt erhalten.",
    "servingCopper": 3,
    "imageFormat": "square",
    "sourceImage": "https://i.imgur.com/eNqvjhb.png",
    "paragraphs": [
      "Das Brandhorn ist das Traditionsbier der Gochwyr vom „Zum Roten Drachen“, entstanden aus der Zeit, als die Taverne noch unter dem Zeichen des brennenden Geißbocks stand. In Zusammenarbeit mit der Penderyn-Destillerie wurde das alte Rezept veredelt, nicht verdrängt. Es bleibt ein Wirtshausbier – kräftig, bodenständig, eigenwillig – doch mit sauberer Führung und kontrollierter Gärung nach Gildenstandard.",
      "Gebraut mit Rauchmalz und veredelt durch eine dezente Wacholdergabe, trägt es eine harzig-würzige Wildnote in sich, die bewusst an Lagerfeuer, feuchte Wälder und knisterndes Holz erinnert. Keine Fassreifung wie bei den Drachenbieren – das Brandhorn bleibt ungezähmt. Es soll nicht glänzen, sondern brennen.",
      "Schon beim ersten Zug steigt dir eine warme, rauchige Schwere in die Nase – wie ein Abend am Feuer, wenn der Rauch in Kleidung und Haar kriecht. Dann kommt das Malz: voll, rund, leicht süßlich. Und gleich darauf dieser Wacholder – trocken, harzig, fast waldig.",
      "Es schmeckt nach Erde, nach Holz, nach Horn und Fell. Nach einem Becher, der auf einem groben Tisch abgestellt wird, während draußen der Wind pfeift. Kein höfisches Bier. Kein Stadtgeflüster.",
      "Das Brandhorn ist kein Getränk – es ist ein Wald im Becher."
    ]
  }
];
