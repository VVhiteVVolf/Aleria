// Authored neutral baselines for later unique items. A cultural silhouette never
// grants a personal technique, bonus attack, armor penetration or free control.
const ART_ROOT = '/AleriaAlmanach/public/assets/weapon-standards';
const groups = Object.freeze({
  common: 'Weitere Waffenstandards', curved: 'Gebogene Klingen und Wurfwaffen', eastern: 'Fernöstlich geprägte Waffenformen'
});

function standard(id, name, weaponType, weaponProfileId, damageFormula, damageType, price, weight, description, options = {}) {
  const properties = [options.twoHanded ? 'Zweihändig' : options.versatile ? 'Vielseitig' : 'Einhändig',
    options.finesse ? 'Finesse' : '', options.light ? 'Leicht' : '', options.thrown ? 'Wurfwaffe' : '',
    options.ammunition ? 'Munition' : '', options.reload ? 'Nachladen' : ''].filter(Boolean).join(' · ');
  const range = options.range || 'Nahkampf · 1,5 m';
  const combatDefinition = {
    kind: 'weapon', weaponType, weaponProfileId, training: options.simple ? 'simple' : 'martial',
    damageFormula, versatileDamageFormula: options.versatile || '', damageType,
    attackAttribute: options.finesse || options.ammunition || options.thrownOnly ? 'dexterity' : 'strength',
    attackBonus: 0, damageBonus: 0, range, properties, activationType: 'action',
    costs: [{ resourceId: 'action', name: 'Aktion', amount: 1, scope: 'comment' }],
    triggerRules: [], effects: [], requirements: options.requirements || '',
    ...(options.ammunition ? { ammunition: { required: true, amountPerUse: 1, reloadAfter: options.reload ? 1 : 0 } } : {}),
    notes: [description, 'Neutraler, nichtmagischer Waffenstandard. Besondere Manöver werden gesondert erlernt; keine automatischen Zusatzangriffe oder Kontrollwirkungen.'].join(' ')
  };
  return { id, name, category: 'Waffen', type: options.type || name, rarity: 'Gewoehnlich', weight,
    enchantment: 'Keine', mana: '-', material: options.material || 'Stahl, Holz, Leder',
    price: { min: price, max: price, unit: 'K' }, image: `${ART_ROOT}/${id}.png`,
    tags: [groups[options.group || 'common'], properties, `${damageFormula.replace(/d/g, 'W')} ${damageType}`],
    desc: description, combatDefinition };
}

const common = [
  standard('degen', 'Degen', 'sword', 'rapier', '1d8', 'Stich', 650, 0.9,
    'Eine gerade, vergleichsweise kompakte Stoßklinge mit geschlossenem Handschutz. Der Degen ist die robuste Führungsvariante für enge Duelle; sein Korb gewährt keinen zusätzlichen Rüstungsbonus.', { finesse: true }),
  standard('rapier', 'Rapier', 'sword', 'rapier', '1d8', 'Stich', 850, 1.1,
    'Eine lange, schlanke Stichklinge mit ausgeprägtem Bügelgefäß. Das Rapier betont die präzise Spitze und weite Auslage. Es teilt die Fechtfamilie des Degens, bleibt als längere Bauform ein eigener Ausrüstungsmaßstab.', { finesse: true }),
  standard('saebel', 'Säbel', 'sword', 'sabre', '1d8', 'Hieb', 500, 1,
    'Eine einhändige, leicht gekrümmte Klinge mit einfachem Bügelgriff. Sie eignet sich für ziehende Hiebe und bleibt zu Fuß wie im Sattel dieselbe Waffe; Reitertechniken werden gesondert gelernt.'),
  standard('dolch', 'Dolch', 'dagger', 'dagger', '1d4', 'Stich', 80, 0.3,
    'Eine kurze, beidseitig geschliffene Stahlklinge für den unmittelbaren Nahkampf. Als Wurfwaffe verwendet sie ihre angegebene Reichweite; nach dem Wurf muss sie wieder geborgen werden.', { simple: true, finesse: true, light: true, thrown: true, range: 'Nahkampf · Wurf 6/18 m' }),
  standard('kurzschwert', 'Kurzschwert', 'sword', 'shortsword', '1d6', 'Stich', 250, 0.8,
    'Eine handliche gerade Klinge mit kurzer Parierstange. Das Kurzschwert lässt wenig Raum zwischen Hand und Ziel und dient als Maßstab für leichte Seitenklingen.', { finesse: true, light: true }),
  standard('parierdolch', 'Parierdolch', 'dagger', 'dagger', '1d4', 'Stich', 140, 0.4,
    'Ein kräftiger Dolch mit breiter Parierstange, der in der freien Hand geführt werden kann. Seine Form bereitet Pariermanöver vor; einen kostenlosen RK-Bonus oder Gegenangriff erhält er nicht.', { finesse: true, light: true }),
  standard('kampfklauen', 'Kampfklauen', 'dagger', 'dagger', '1d4', 'Hieb', 250, 0.5,
    'Ein einzelner Handschutz mit drei kurzen Stahlklauen. Dies ist eine angelegte Klingenwaffe und keine natürliche Körperwaffe. Ein Paar erfordert zwei Exemplare und die passende Zweiwaffenausbildung.', { finesse: true, light: true, material: 'Stahl, Leder' }),
  standard('handaxt', 'Handaxt', 'axe', 'axe', '1d6', 'Hieb', 160, 0.8,
    'Eine kurze, einhändige Axt mit schlichtem Stahlkopf. Sie dient als Seitenwaffe und kann mit der angegebenen Wurfreichweite eingesetzt werden; ein Wurf kehrt nicht automatisch in die Hand zurück.', { simple: true, light: true, thrown: true, range: 'Nahkampf · Wurf 6/18 m' }),
  standard('enteraxt', 'Enteraxt', 'axe', 'boarding-axe', '1d6', 'Hieb', 220, 1.1,
    'Eine kurze Axt mit gegenüberliegendem Haken oder Dorn für den engen Waffengang an Bord. Haken, Taue und Holz sind situative Einsatzmöglichkeiten, keine automatische Entwaffnung oder garantierte Zerstörung.', { light: true }),
  standard('einhand-kriegshammer', 'Einhand-Kriegshammer', 'mace', 'warhammer', '1d8', 'Wucht', 400, 1.4,
    'Ein kompakter Hammerkopf auf festem Holzschaft. Diese einhändig nutzbare Bauform unterscheidet sich vom bestehenden schweren Zweihand-Kriegshammer; mit beiden Händen steigt ihr Grundwürfel auf 1W10.', { versatile: '1d10' }),
  standard('rabenschnabel', 'Rabenschnabel', 'mace', 'raven-beak', '1d8', 'Stich', 450, 1.3,
    'Ein einhändiger Streithammer mit langem, schmalem Schnabel als bestimmender Schlagfläche. Der Stichschaden beschreibt die Waffe; Rüstungsschutz wird dadurch nicht pauschal ignoriert.'),
  standard('speer', 'Speer', 'spear', 'spear', '1d6', 'Stich', 100, 1.2,
    'Eine einfache Stahlspitze auf geradem Holzschaft. Einhändig verursacht sie 1W6, mit beiden Händen 1W8. Ein gezielter Wurf ist möglich, verbraucht aber dieselbe Handlung und benötigt eine tatsächlich vorhandene Waffe.', { simple: true, versatile: '1d8', thrown: true, range: 'Nahkampf · Wurf 6/18 m' }),
  standard('partisane', 'Partisane', 'polearm', 'partisan', '1d10', 'Stich', 550, 2.3,
    'Eine breite Speerklinge mit zwei seitlichen Flügeln auf langem Schaft. Die Partisane hält die Spitze in einer klaren Stoßlinie und wird mit beiden Händen geführt. Klassenboni entstehen nur durch die dafür vorgesehene Technik.', { twoHanded: true, range: 'Nahkampf · 3 m' }),
  standard('glefe', 'Glefe', 'polearm', 'glaive', '1d10', 'Hieb', 500, 2.4,
    'Eine lange einschneidige Klinge auf einem zweihändig geführten Schaft. Weite Hiebe bestimmen ihre Bauform; mehrere Ziele oder zusätzliche Treffer benötigen eine ausdrücklich passende Attacke.', { twoHanded: true, range: 'Nahkampf · 3 m' }),
  standard('harpunenspeer', 'Harpunenspeer', 'spear', 'harpoon', '1d6', 'Stich', 180, 1.5,
    'Ein kurzer Wurfspeer mit Widerhaken und Befestigungsöse. Heranziehen setzt eine gesicherte Leine und eine passende Technik oder gesonderte Probe voraus; der bloße Treffer zieht niemanden über Bord.', { thrown: true, range: 'Nahkampf · Wurf 6/18 m', material: 'Stahl, Holz' }),
  standard('kampfstab', 'Kampfstab', 'staff', 'staff', '1d6', 'Wucht', 30, 1.8,
    'Ein gerader, gut ausbalancierter Hartholzstab ohne magische Wirkung. Einhändig verwendet er 1W6, zweihändig 1W8. Ein Zauberstab benötigt für denselben Nahkampfeinsatz eine gesondert geeignete Bauform.', { simple: true, versatile: '1d8', material: 'Hartholz' }),
  standard('schwere-armbrust', 'Schwere Armbrust', 'crossbow', 'heavy-crossbow', '1d10', 'Stich', 800, 3.5,
    'Eine kräftige zweihändige Armbrust mit massivem Bogen und Spannhilfe. Sie verschießt einen Bolzen je Angriff; nach jedem Schuss muss sie nach den bestehenden Munitions- und Nachladeregeln wieder bereitgemacht werden.', { twoHanded: true, ammunition: true, reload: true, range: 'Fernkampf · 30/120 m' }),
  standard('handarmbrust', 'Handarmbrust', 'crossbow', 'hand-crossbow', '1d6', 'Stich', 650, 1,
    'Eine kleine Armbrust für einen einzelnen kurzen Bolzen. Sie wird einhändig abgeschossen; im kampfbereiten Standard bleibt die zweite Hand zum Nachladen frei und führt keinen aktiven Schild. Die Bauform gewährt keinen kostenlosen Zusatzschuss.', { light: true, ammunition: true, reload: true, range: 'Fernkampf · 9/36 m', requirements: 'Freie zweite Hand zum Nachladen; kein gleichzeitig aktiver Schild.' }),
  standard('peitsche', 'Peitsche', 'other', 'whip', '1d4', 'Hieb', 100, 0.6,
    'Ein langer, geflochtener Lederriemen an festem Griff. Der Grundangriff reicht bis 3 m. Fesseln, Entwaffnen und Festhalten sind keine automatische Folge ihres geringen Hiebschadens.', { finesse: true, range: 'Nahkampf · 3 m', material: 'Leder, Holz' }),
  standard('schleuder', 'Schleuder', 'other', 'sling', '1d4', 'Wucht', 20, 0.1,
    'Zwei Schnüre halten eine kleine Geschosstasche für einen geeigneten Stein oder eine Schleuderkugel. Jeder Angriff verbraucht ein tatsächlich verfügbares Geschoss; besonders schwere Geschosse erhöhen den Grundschaden nicht automatisch.', { simple: true, ammunition: true, range: 'Fernkampf · 9/36 m', material: 'Leder, Flachs' })
];

const curved = [
  standard('khopesh', 'Khopesh', 'sword', 'sword', '1d8', 'Hieb', 600, 1.3,
    'Eine kurze, nach außen gebogene Sichelklinge mit geradem Griffansatz. Ihre schwere Schneide dient klaren Hieben. Die Hakenform erlaubt ohne erlernte Technik weder zusätzliche Kontrolle noch das automatische Umgehen einer Parade.', { group: 'curved' }),
  standard('shamshir', 'Shamshir', 'sword', 'sabre', '1d8', 'Hieb', 650, 0.9,
    'Eine schlanke, stark gekrümmte einhändige Säbelklinge mit schlichter Parierstange. Sie setzt auf ziehende Schnitte und ist ein eigener Formmaßstab innerhalb derselben Säbelfamilie.', { group: 'curved' }),
  standard('kukri', 'Kukri', 'dagger', 'dagger', '1d6', 'Hieb', 180, 0.7,
    'Ein kurzes, nach vorn gekrümmtes Klingenmesser mit breiter werdender Schneide. Sein Schwerpunkt unterstützt kräftige Schnitte; die kompakte Hiebklinge erhält keine zusätzliche Finesse- oder Wurfwirkung.', { group: 'curved', light: true }),
  standard('chakram', 'Chakram', 'other', 'throwing-disc', '1d6', 'Hieb', 200, 0.4,
    'Ein flacher Stahlring mit geschärfter Außenkante als eigenständige Wurfscheibe. Der Wurf verursacht 1W6 Hiebschaden. Rückkehr, Abpraller und mehrere Ziele sind keine Eigenschaften des einfachen Standards.', { group: 'curved', thrown: true, thrownOnly: true, range: 'Wurf 9/27 m', material: 'Stahl' })
];

const eastern = [
  standard('katana', 'Katana', 'sword', 'sword', '1d8', 'Hieb', 1000, 1.3,
    'Eine leicht gekrümmte einschneidige Klinge mit langem Wickelgriff und rundem Handschutz. Sie nutzt einhändig 1W8, zweihändig 1W10 und erhält keine überlegenen Schnitt- oder Kritwerte allein durch ihre Form.', { group: 'eastern', versatile: '1d10' }),
  standard('wakizashi', 'Wakizashi', 'sword', 'shortsword', '1d6', 'Hieb', 500, 0.7,
    'Eine kurze, leicht gekrümmte Seitenklinge mit rundem Handschutz. Sie wird als eigene leichte Klinge geführt; das gemeinsame Tragen mit einer längeren Waffe ersetzt keine Zweiwaffenausbildung.', { group: 'eastern', finesse: true, light: true }),
  standard('tanto', 'Tantō', 'dagger', 'dagger', '1d4', 'Stich', 180, 0.3,
    'Ein kurzes gerades bis leicht gebogenes Klingenmesser mit schlichtem Wickelgriff. Die kompakte Stichwaffe folgt denselben niedrigen Grundwürfeln wie andere Dolche.', { group: 'eastern', finesse: true, light: true }),
  standard('nodachi', 'Nodachi', 'sword', 'greatsword', '1d12', 'Hieb', 1800, 2.5,
    'Eine sehr lange gekrümmte Zweihandklinge mit ausgedehntem Griff. Sie entspricht im Schadensmaßstab dem Großschwert und lässt keine Hand für einen Schild frei.', { group: 'eastern', twoHanded: true }),
  standard('naginata', 'Naginata', 'polearm', 'glaive', '1d10', 'Hieb', 650, 2.3,
    'Eine gebogene einschneidige Klinge auf langem Holzschaft. Ihre zweihändige Führung und ihr Hiebschaden folgen dem Glefenmaßstab; die kulturelle Bauform gewährt keine zusätzlichen Treffer.', { group: 'eastern', twoHanded: true, range: 'Nahkampf · 3 m' }),
  standard('jian', 'Jian', 'sword', 'sword', '1d8', 'Stich', 800, 0.9,
    'Eine gerade beidseitig geschliffene Schwertklinge mit kurzem Handschutz. Der Standard betont präzise Stiche und bewegliche einhändige Führung, ohne zusätzliche Angriffsboni zu vergeben.', { group: 'eastern', finesse: true }),
  standard('dao', 'Dao', 'sword', 'sabre', '1d8', 'Hieb', 550, 1.1,
    'Eine einschneidige, zum vorderen Klingenende breiter werdende Säbelklinge. Sie dient kräftigen einhändigen Hieben und bleibt innerhalb des gewöhnlichen Säbelbudgets.', { group: 'eastern' }),
  standard('yari', 'Yari', 'spear', 'spear', '1d8', 'Stich', 450, 2,
    'Eine schmale gerade Speerspitze auf einem festen langen Schaft. Die vielseitige Führung verwendet einhändig 1W8 oder zweihändig 1W10. Eine besonders lange Schaftvariante benötigt ein eigenes Waffenprofil.', { group: 'eastern', versatile: '1d10' }),
  standard('tonfa', 'Tonfa', 'mace', 'club', '1d6', 'Wucht', 100, 0.6,
    'Ein kurzer Hartholzstock mit seitlichem Griff. Er wird als einzelnes Schlagwerkzeug geführt; ein zweites Exemplar gewährt ohne passende Ausbildung weder eine freie Attacke noch einen Rüstungsbonus.', { group: 'eastern', simple: true, light: true, material: 'Hartholz' }),
  standard('nunchaku', 'Nunchaku', 'mace', 'flail', '1d6', 'Wucht', 180, 0.7,
    'Zwei kurze Hartholzstücke sind durch eine kurze Kette verbunden. Die leichte Kettenwaffe ist vom schweren Flegel zu unterscheiden. Sie entfernt keine fremde Waffe allein durch einen gelungenen Treffer.', { group: 'eastern', finesse: true, light: true, material: 'Hartholz, Eisen' }),
  standard('wurfstern', 'Wurfstern', 'dagger', 'dagger', '1d4', 'Stich', 25, 0.1,
    'Ein einzelner flacher Stahlstern mit mehreren kurzen Spitzen. Pro Angriff wird ein Exemplar geworfen; mehrere Spitzen bedeuten weder mehrere Treffer noch eine zusätzliche Bonusattacke.', { group: 'eastern', simple: true, thrown: true, thrownOnly: true, range: 'Wurf 6/18 m', material: 'Stahl' })
];

export const WEAPON_STANDARD_CATALOG = Object.freeze([...common, ...curved, ...eastern]);
export function getWeaponStandardMarketItems() { return structuredClone(WEAPON_STANDARD_CATALOG); }
export function getWeaponStandardImage(sourceId) {
  return WEAPON_STANDARD_CATALOG.find(entry => entry.id === sourceId)?.image || '';
}
