export const HORSE_BREEDING_PAGE_ID = 'zuchtbuch';

export const HORSE_BREEDING_BREEDS = Object.freeze([
  { id: 'afol', rossmarktId: 'afol' },
  { id: 'aurelianer', rossmarktId: 'aurelianer' },
  { id: 'brycing', rossmarktId: 'brycing' },
  { id: 'ceffyl', rossmarktId: 'ceffyl' },
  { id: 'cheval', rossmarktId: 'cheval' },
  { id: 'crafan-pony', rossmarktId: 'crafan' },
  { id: 'cuanach', rossmarktId: 'cuanach' },
  { id: 'curragh', rossmarktId: 'curragh' },
  { id: 'cyning', rossmarktId: 'cyning' },
  { id: 'drake', rossmarktId: 'drake' },
  { id: 'equo', rossmarktId: 'equo' },
  { id: 'erlenglanz', rossmarktId: 'erlenglanz' },
  { id: 'goldmaehne', rossmarktId: 'goldmähne' },
  { id: 'herzogsschimmer', rossmarktId: 'herzogsschimmer' },
  { id: 'hest', rossmarktId: 'hest' },
  { id: 'hross', rossmarktId: 'hross' },
  { id: 'myrr-pony', rossmarktId: 'myrr' },
  { id: 'nebtu', rossmarktId: 'nebtu' },
  { id: 'rhyfel', rossmarktId: 'rhyfel' },
  { id: 'sale', rossmarktId: 'sale' },
  { id: 'sarkal', rossmarktId: 'sarkal' },
  { id: 'shahzad', rossmarktId: 'shahzad' },
  { id: 'skaer', rossmarktId: 'skaer' },
  { id: 'skelmir-pony', rossmarktId: 'skelmir' },
  { id: 'skuggr', rossmarktId: 'skuggr' },
  { id: 'tirashan', rossmarktId: 'tirashan' },
  { id: 'xanathos', rossmarktId: 'xanathos' }
]);

export const HORSE_BREEDING_LORE_CROSSINGS = Object.freeze([
  {
    mareId: 'cyning',
    sireId: 'drake',
    name: 'Brycing',
    source: 'Pferdedossier Brycing',
    note: 'Die gefestigte Hochzucht vereint die Kraft des Cyning mit der kampferprobten Eleganz des Drake.'
  },
  {
    mareId: 'curragh',
    sireId: 'hest',
    name: 'Tirashan',
    source: 'Pferdedossier Tirashan',
    note: 'Die gefestigte Linie verbindet die Waldgängigkeit des Curragh mit der Robustheit des Hest.'
  },
  {
    mareId: 'herzogsschimmer',
    sireId: 'ceffyl',
    name: 'Ritterschimmer',
    bestiaryId: 'ritterschimmer',
    source: 'Festgelegte Zucht · Benennung vom 12. Oktober 2026',
    note: 'Ritterschimmer ist die fest benannte Zucht aus Herzogsschimmer und Ceffyl. Sie verbindet das kräftige, repräsentative Schlachtross mit der eleganten, loyalen Ritterpferdelinie. Carreg, das Reitpferd von Sir Duncan Gafyr, gehört zu dieser Zucht.'
  },
  {
    mareId: 'ceffyl',
    sireId: 'equo',
    name: 'Eidwacht',
    bestiaryId: 'eidwacht',
    source: 'Benannte Zucht aus Ceffyl und Equo · Auftrag vom 13. Oktober 2026',
    note: 'Eidwacht verbindet die ritterliche Würde und enge Reiterbindung des Ceffyl mit der Disziplin, Formationsruhe und militärischen Zuverlässigkeit des Equo. Der Name spielt auf den ritterlichen Eid und die pflichtbewusste Wacht des Legionärpferdes an. Cador, Neithons junges, bereits erwachsenes Reitpferd, gehört zu dieser Zucht; Owain Draig schenkte es ihm zu seinem Ritterschlag.'
  },
  {
    mareId: 'rhyfel',
    sireId: 'ceffyl',
    name: 'Edel Rhyfel',
    bestiaryId: 'edel-rhyfel',
    source: 'Festgelegte Zucht · Benennung vom 13. Oktober 2026',
    note: 'Edel Rhyfel ist die fest benannte Zucht aus Rhyfel und Ceffyl. Sie verbindet den kräftigen, tragfähigen und wetterfesten Rhyfel-Körper mit der eleganteren Halslinie, dem feineren Haupt und der engen Reiterbindung des Ceffyl. Lot, Rhys Draigs Reitpferd, gehört zu dieser Zucht.'
  },
  {
    mareId: 'ceffyl',
    sireId: 'aurelianer',
    name: 'Sonnenläufer',
    bestiaryId: 'sonnenlaeufer',
    source: 'Die Anhörung · Gethins Bericht über Vivian; bestätigt am 13. Oktober 2026',
    note: 'Sonnenläufer bezeichnet die Zucht aus Ceffyl und Aurelianer. Sie verbindet die elegante, loyale Ritterpferdelinie des Ceffyl mit der goldenen Erscheinung und dem sensiblen Stolz des Aurelianers. Das beige Grundfell wird nach unten zunehmend golden und geht an den Beinen in sattes Gold über; auch die Hufe sind golden. Die dichte, voluminöse Mähne ist weiß und läuft in hellgoldene Spitzen aus. Gethin Draigs Stute Vivian, meist Vivi genannt, gehört zu dieser Zucht. In der Anhörung beschreibt er sie als außergewöhnlich gute Stute mit Diva-Allüren; ihr Name erinnert an eine heilige Meerjungfer der Dame des Sees.'
  }
]);

export const HORSE_BREEDING_CROSS_ENRICHMENTS = Object.freeze({
  'ceffyl|hest': {
    establishedBreed: 'Rhyfel',
    note: 'Aus dieser Verbindung ging später die gefestigte Rhyfel-Linie hervor.'
  }
});
