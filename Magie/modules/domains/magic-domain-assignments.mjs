// Magical domains belong to this codex; deity names, groups and links belong to Religionen.
export const MAGIC_DOMAIN_ASSIGNMENTS = Object.freeze({
  ordan: { domain: 'Zeit', aspect: 'Vergangenheit, Gegenwart und Zukunft im Gefüge der göttlichen Ordnung.' },
  mariel: { domain: 'Barmherzigkeit', aspect: 'Liebe, Fürsorge und die heilende Zuwendung der Mutter.' },
  baldran: { domain: 'Ehrenvoller Krieg', aspect: 'Wehrhaftigkeit, Pflichterfüllung und die Treue des Streiters.' },
  maldras: { domain: 'Göttliches Urteil', aspect: 'Gerechtigkeit, Weihe und Gnade im Zeichen des Templers.' },
  sylvana: { domain: 'Lebendige Verbundenheit', aspect: 'Das Band zwischen Natur, Tieren und ihren Hütern.' },
  lyris: { domain: 'Inspiration', aspect: 'Musik, Kunst und Liebe als Ausdruck schöpferischer Empfindung.' },
  tharim: { domain: 'Fruchtbare Erde', aspect: 'Die Verbindung von Erde, redlicher Arbeit und dem Ertrag des Fleißes.' },
  orin: { domain: 'Arkane Wahrheit', aspect: 'Magie, Erkenntnis und die Bewahrung wahrhaftigen Wissens.' },
  kharon: { domain: 'Seelengeleit', aspect: 'Der Übergang zwischen Leben und Tod und die Ruhe der Seelen.' },
  nimue: { domain: 'Reinigendes Wasser', aspect: 'Wasser, Reinheit und die Güte der Dame des Sees.' },
  rhea: { domain: 'Beständiger Fels', aspect: 'Erde, Gestein und die unerschütterliche Kraft der Berge.' },
  zephyr: { domain: 'Freier Wind', aspect: 'Luft, Bewegung und der freie Ausdruck der eigenen Stimme.' },
  aelthar: { domain: 'Gewitter', aspect: 'Blitz und Donner im gemeinsamen Wirken der himmlischen Kräfte.' },
  thyrael: { domain: 'Erneuernde Flamme', aspect: 'Feuer, Leidenschaft und der Wandel durch Erneuerung.' },
  tethyra: { domain: 'Entdeckung', aspect: 'Aufbruch, Neugier und die Begegnung mit dem Unbekannten.' },
  jovena: { domain: 'Glück', aspect: 'Günstige Fügung, Fröhlichkeit und mitfühlende Zuversicht.' },
  auron: { domain: 'Schöpfendes Handwerk', aspect: 'Erfindung, Baukunst und die Verantwortung des Erbauers.' },
  selarion: { domain: 'Wettstreit', aspect: 'Bewährung, Herausforderung und der Auftrag der Herolde.' },
  orith: { domain: 'Mystik', aspect: 'Die verborgenen Zusammenhänge von Magie und Zauberei.' },
  dagon: { domain: 'Infernale Herrschaft', aspect: 'Dominanz und Auflehnung, getragen von Stolz und infernalem Feuer.' },
  lunara: { domain: 'Zwielicht', aspect: 'Magie und Schicksal im Schleier kosmischer Geheimnisse.' },
  grimnar: { domain: 'Entfesselter Zorn', aspect: 'Die Wildheit des Krieges und die zügellose Herrschaft des Stärkeren.' },
  bhaal: { domain: 'Blut und Seelen', aspect: 'Entweihung, Unterwerfung und die Bindung von Lebenskraft.' },
  zatrach: { domain: 'Wilde Jagd', aspect: 'Jagdtrieb, tierische Gestalt und die Bewährung in der Wildnis.' },
  sanguine: { domain: 'Ekstase', aspect: 'Verführung, Ausschweifung und das maßlose Verlangen nach Genuss.' },
  nyxara: { domain: 'Schatten', aspect: 'Nacht, verborgene Wege und die Geheimnisse der Dunkelheit.' },
  adar: { domain: 'Weltenbruch', aspect: 'Zweifel, Rebellion und die Rätsel des Großen Spalts.', note: 'Adar steht im infernalen Register, bleibt als kosmische Entität jedoch außerhalb einer eindeutigen Zuordnung.' },
  amon: { domain: 'Schicksalslenkung', aspect: 'Wissen, Sterne und Hoffnung im Geflecht verborgener Absichten.' },
  hela: { domain: 'Nekromantie', aspect: 'Tod, Zerfall und Leere an den Grenzen der Vergänglichkeit.' },
  thraal: { domain: 'Abgründige Tiefe', aspect: 'Das Grauen der Meere, der Ertrunkenen und verlorenen Seelen.' },
  nemsara: { domain: 'Vergeltung', aspect: 'Rache, Eifersucht und die Hinterlist eines nachtragenden Willens.' },
  'azrath-morvath': { domain: 'Zerrissener Geist', aspect: 'Die gegensätzlichen Extreme von ekstatischer Freude und tiefer Verzweiflung.' },
  migdal: { domain: 'Wunschbindung', aspect: 'Sehnsucht und Verlockung in Vereinbarungen mit einem verborgenen Preis.' },
  nergaloth: { domain: 'Pestilenz', aspect: 'Seuchen, Krankheit und die Ausbreitung von Verderbnis.' }
});

export const MAGIC_DOMAIN_CIRCLES = Object.freeze([
  { id: 'celestiale-domaenen', title: 'Celestiale Domänen', collectionId: 'goettlicher-kreis', groups: ['goettliche', 'souveraene', 'untergoetter'], symbol: '☼', useDeitySymbols: true },
  { id: 'infernale-domaenen', title: 'Infernale Domänen', collectionId: 'infernaler-kreis', groups: ['infernale', 'untergoetter'], symbol: '☾', useDeitySymbols: true }
]);
