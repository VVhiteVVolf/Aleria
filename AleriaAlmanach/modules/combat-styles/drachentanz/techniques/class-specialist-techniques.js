import { DRACHENTANZ_FORM_IDS as F } from '../drachentanz-ids.js?v=20260909-dragon-parent-v2';
import { createDrachentanzTechnique, movementEffect, secondarySave, temporaryCondition } from './drachentanz-technique-factory.js?v=20260909-dragon-parent-v2';

function specialist(formId, classId, profiles, weaponTypes, spec) {
  return createDrachentanzTechnique({
    formId, allowedClassIds: [classId], classWeaponProfiles: { [classId]: profiles }, weaponTypes,
    slotBands: ['expert'], branchId: `${classId}-specialist`, ...spec
  });
}

const cover = (slug, name, armorClass) => temporaryCondition(slug, name,
  armorClass < 0 ? 'Die offensive Stellung öffnet die Deckung bis zum nächsten eigenen Beitrag.' : 'Der Stellungswechsel schützt bis zum nächsten eigenen Beitrag.',
  { armorClass }, { type: armorClass < 0 ? 'debuff' : 'buff', target: 'self', on: 'always' });
const sweep = spec => specialist(F.schweifender, 'uchelwyr', ['sword', 'spear', 'lance'], ['sword', 'spear'], spec);
const bear = spec => specialist(F.baerenklaue, 'arthwyr', ['greatsword', 'axe', 'battleaxe', 'club', 'mace'], ['sword', 'axe', 'mace'], spec);
const hunt = (profiles, weaponTypes, spec) => specialist(F.jagender, 'helwyr', profiles, weaponTypes, spec);

export const SCHWEIFENDER_FOOT_TECHNIQUES = Object.freeze([
  sweep({ slug: 'schweifender-flankenschnitt', name: 'Flankenschnitt', minimumLevel: 9, costs: ['action', 'bonus-action'],
    description: 'Der Uchelwyr schneidet seitlich in die Deckung und führt die Waffe im Vorübergehen weiter.',
    effect: 'Verursacht Technikschaden und erlaubt 3 Meter Eigenbewegung.', effects: [movementEffect('schweifender-flanke', 3)] }),
  sweep({ slug: 'schweifender-offene-sichel', name: 'Offene Sichel', minimumLevel: 11, costs: ['action', 'reaction'],
    description: 'Ein weiter Bogen zieht die Parade nach außen, bevor die Waffe auf der offenen Seite zurückkehrt.',
    effect: 'Verursacht Technikschaden und erhält +2 Angriff; bis zum nächsten eigenen Beitrag −1 Rüstungsklasse.', attackBonus: 2,
    effects: [cover('schweifender-sichel', 'Offene Sichel', -1)] }),
  sweep({ slug: 'schweifender-wechselnder-horizont', name: 'Wechselnder Horizont', minimumLevel: 13, costs: ['action', 'bonus-action', 'reaction'],
    description: 'Zwei gegenläufige Schritte tragen die offensive Waffenlinie von einer Flanke zur anderen.',
    effect: 'Verursacht Technikschaden, erlaubt 4 Meter Eigenbewegung und behandelt die Zielverteidigung als 1 Punkt niedriger.', targetDefenseModifier: -1,
    effects: [movementEffect('schweifender-horizont', 4)] }),
  sweep({ slug: 'schweifender-halber-ring', name: 'Halber Ring', minimumLevel: 15, costs: ['action', 'special-action'], maximumTargets: 2, target: 'Bis zu zwei Gegner in Waffenreichweite',
    description: 'Der Vorstoß hält zwei nahe Gegner in demselben weiten Waffenbogen.',
    effect: 'Trifft bis zu zwei gewählte Gegner mit je Technikschaden und erlaubt 3 Meter Eigenbewegung.', effects: [movementEffect('schweifender-ring', 3)] }),
  sweep({ slug: 'schweifender-durchgezogener-schweif', name: 'Durchgezogener Schweif', minimumLevel: 17, costs: ['action', 'reaction', 'special-action', 'aura-focus'],
    description: 'Die Aura hält den Angriff über einen langen, durchgezogenen Waffenweg scharf.',
    effect: 'Verursacht Technikschaden, erhält +2 Angriff und behandelt die Zielverteidigung als 1 Punkt niedriger.', attackBonus: 2, targetDefenseModifier: -1 }),
  sweep({ slug: 'schweifender-letzter-horizont', name: 'Letzter Horizont des schweifenden Drachen', minimumLevel: 20,
    costs: ['action', 'bonus-action', 'reaction', { resourceId: 'special-action', amount: 2 }, { resourceId: 'aura-focus', amount: 2 }],
    description: 'Der Meister trägt den Angriff ohne Stillstand um die letzte offene Flanke seines Gegenübers.',
    effect: 'Verursacht Technikschaden, erhält +3 Angriff, behandelt die Zielverteidigung als 2 Punkte niedriger und erlaubt 6 Meter Eigenbewegung.',
    attackBonus: 3, targetDefenseModifier: -2, effects: [movementEffect('schweifender-letzter', 6)] })
]);

export const LAUERNDER_SWORD_TECHNIQUES = Object.freeze([
  specialist(F.lauernder, 'helwyr', ['sword'], ['sword'], { slug: 'lauernder-zweite-wehre', name: 'Zweite Wehre', minimumLevel: 9, costs: ['reaction'],
    description: 'Wenn die Distanz schwindet, fängt das bereits geführte Schwert den Nahkampfangriff mit einem kurzen Gegenhieb auf.',
    effect: 'Reaktionsangriff mit Technikschaden. Erfordert ein geführtes Schwert; die Technik wechselt die Waffe nicht automatisch.' }),
  specialist(F.lauernder, 'helwyr', ['sword'], ['sword'], { slug: 'lauernder-freie-sehnenlinie', name: 'Freie Sehnenlinie', minimumLevel: 15, costs: ['action', 'reaction'],
    description: 'Ein enger Schwertstoß und ein Rückschritt schaffen wieder Raum für den späteren Bogengebrauch.',
    effect: 'Verursacht Technikschaden, erlaubt 3 Meter Eigenbewegung und gewährt +1 Rüstungsklasse bis zum nächsten eigenen Beitrag.',
    effects: [movementEffect('lauernder-sehnenlinie', 3), cover('lauernder-sehnenlinie', 'Freie Sehnenlinie', 1)] })
]);

export const JAGENDER_TECHNIQUES = Object.freeze([
  hunt(['longbow'], ['bow'], { slug: 'jagender-langer-ansitz', name: 'Langer Ansitz', minimumLevel: 10, costs: ['action'], range: 'Fernkampf',
    description: 'Ein ruhiger Langbogenschuss nutzt den bereits vorbereiteten Schussweg.',
    effect: 'Technikschaden mit +1 Angriff. Der Schuss gewährt kein Verbergen oder Überraschen.', attackBonus: 1 }),
  hunt(['shortbow'], ['bow'], { slug: 'jagender-kurzer-revierwechsel', name: 'Kurzer Revierwechsel', minimumLevel: 12, costs: ['reaction', 'bonus-action'], range: 'Fernkampf',
    description: 'Der Kurzbogen antwortet während eines knappen Seitenwechsels.',
    effect: 'Reaktionsschuss mit Technikschaden und bis zu 2 m Eigenbewegung im verfügbaren Bewegungsbudget.', effects: [movementEffect('jagender-revier', 2)] }),
  hunt(['dagger', 'shortsword'], ['dagger', 'sword'], { slug: 'jagender-klingenversteck', name: 'Klingenversteck', minimumLevel: 14,
    costs: ['reaction'], noPrimaryDamage: true, target: 'Selbst', range: 'Selbst',
    description: 'Die kurze Klinge deckt die enge Körperlinie, während der Helwyr einen neuen Winkel sucht.',
    effect: 'Kein Angriff; +1 RK bis zum Ende des nächsten eigenen Beitrags. Keine automatische Heimlichkeit.', effects: [cover('jagender-versteck', 'Klingenversteck', 1)] }),
  hunt(['shortbow'], ['bow'], { slug: 'jagender-ruhiger-revierschuss', name: 'Ruhiger Revierschuss', minimumLevel: 16, costs: ['action', 'special-action'], range: 'Fernkampf',
    description: 'Der bewegliche Schütze hält einen Augenblick still und setzt einen einzelnen durchgezogenen Schuss.',
    effect: 'Verstärkter Technikschaden nach dem gemeinsamen Kostenbudget; keine kostenlose weitere Salve.' }),
  hunt(['longbow', 'shortbow'], ['bow'], { slug: 'jagender-hinterhaltsschuss', name: 'Hinterhaltsschuss', minimumLevel: 9, costs: ['action', 'reaction'], range: 'Fernkampf',
    description: 'Der Helwyr nutzt einen vorbereiteten schmalen Schusswinkel, statt die ganze Gestalt aus der Deckung zu nehmen.',
    effect: 'Verursacht Technikschaden. Nur gegen ein Ziel mit aktivem Zustand oder Merkmal „Überrascht“ erhält dieser Schuss +1 Angriff; sonst wird normal gewürfelt. Verbergen und das Überraschen des Ziels werden zuvor in der Szene ausgespielt und geprüft.',
    triggerRules: [{ id: 'jagender-vorbereiteter-hinterhalt', name: 'Vorbereiteter Hinterhalt', phase: 'pre-roll', activation: 'passive',
      recipient: 'actor', sourceRelation: 'self', actionScope: 'entry', actionKinds: ['technique'], frequency: 'always', condition: 'always',
      requiredTargetTags: ['überrascht'], effects: { attackModifier: 1 } }] }),
  hunt(['dagger', 'shortsword'], ['dagger', 'sword'], { slug: 'jagender-kurzer-fang', name: 'Kurzer Fang', minimumLevel: 9, costs: ['bonus-action'], range: 'Nahkampf',
    description: 'Eine kurze Klinge trifft eng am Körper aus einer kleinen, schwer gelesenen Bewegung.',
    effect: 'Verursacht Technikschaden und erlaubt 1 Meter Eigenbewegung.', effects: [movementEffect('jagender-fang', 1)] }),
  hunt(['longbow', 'shortbow', 'dagger', 'shortsword'], ['bow', 'dagger', 'sword'], { slug: 'jagender-gedeckter-wechsel', name: 'Gedeckter Wechsel', minimumLevel: 11, costs: ['bonus-action', 'reaction'], noPrimaryDamage: true, target: 'Selbst',
    description: 'Der Helwyr löst sich aus der offenen Linie und wechselt entlang bestehender Hindernisse die Stellung.',
    effect: 'Ohne Schadenswurf: 3 Meter Eigenbewegung und +2 Rüstungsklasse bis zum nächsten eigenen Beitrag. Verbergen bleibt eine eigene Probe.',
    effects: [{ ...movementEffect('jagender-wechsel', 3), on: 'always' }, cover('jagender-wechsel', 'Gedeckter Wechsel', 2)] }),
  hunt(['longbow', 'shortbow'], ['bow'], { slug: 'jagender-pfeil-aus-dem-saum', name: 'Pfeil aus dem Saum', minimumLevel: 13, costs: ['action', 'bonus-action', 'reaction'], range: 'Fernkampf',
    description: 'Ein kurzer Schuss verlässt den Rand der Deckung, bevor der Schütze den Winkel wieder wechselt.',
    effect: 'Verursacht Technikschaden, erhält +1 Angriff und erlaubt 3 Meter Eigenbewegung.', attackBonus: 1, effects: [movementEffect('jagender-saum', 3)] }),
  hunt(['dagger', 'shortsword'], ['dagger', 'sword'], { slug: 'jagender-griff-in-die-luecke', name: 'Griff in die Lücke', minimumLevel: 15, costs: ['action', 'reaction'], range: 'Nahkampf',
    description: 'Die kurze Klinge stört die Waffenhand und schafft die kleine Lücke zum Lösen aus dem Nahkampf.',
    effect: 'Verursacht Technikschaden; bei misslungenem Geschicklichkeitsrettungswurf erhält das Ziel −2 Angriff.',
    secondarySave: secondarySave('jagender-griff', 'Gestörte Waffenhand', 'Der kurze Klingentreffer zwingt zu einem unsicheren Griff.', { attack: -2 }, { attributeKey: 'dexterity', dcAttributeKey: 'dexterity' }) }),
  hunt(['longbow', 'shortbow'], ['bow'], { slug: 'jagender-letztes-rascheln', name: 'Letztes Rascheln', minimumLevel: 17, costs: ['action', 'reaction', 'special-action', 'aura-focus'], range: 'Fernkampf',
    description: 'Ein feiner Auraimpuls stabilisiert den Pfeil für einen einzigen präzisen Schuss aus ungünstigem Winkel.',
    effect: 'Verursacht Technikschaden, erhält +2 Angriff und ist bei natürlicher 19–20 kritisch.', attackBonus: 2, criticalThreshold: 19 }),
  hunt(['dagger', 'shortsword'], ['dagger', 'sword'], { slug: 'jagender-verstummende-spur', name: 'Verstummende Spur', minimumLevel: 18, costs: ['reaction', 'bonus-action', 'special-action'], range: 'Nahkampf',
    description: 'Ein kurzer Klingenkonter deckt den raschen Rückzug aus der unmittelbaren Verfolgungslinie.',
    effect: 'Reaktionsangriff mit Technikschaden, 5 Meter Eigenbewegung und +2 Rüstungsklasse bis zum nächsten eigenen Beitrag.',
    effects: [movementEffect('jagender-spur', 5), cover('jagender-spur', 'Verstummende Spur', 2)] }),
  hunt(['longbow', 'shortbow', 'dagger', 'shortsword'], ['bow', 'dagger', 'sword'], { slug: 'jagender-vollendete-jagd', name: 'Vollendete Jagd', minimumLevel: 20,
    costs: ['action', 'bonus-action', 'reaction', { resourceId: 'special-action', amount: 2 }, { resourceId: 'aura-focus', amount: 2 }],
    description: 'Der Meister löst die Jagd mit der gerade geführten Waffe in einem einzigen präzisen Abschluss auf.',
    effect: 'Verursacht Technikschaden, erhält +3 Angriff, behandelt die Zielverteidigung als 2 Punkte niedriger und erlaubt 4 Meter Eigenbewegung.',
    attackBonus: 3, targetDefenseModifier: -2, effects: [movementEffect('jagender-vollendet', 4)] })
]);

export const BAERENKLAUEN_TECHNIQUES = Object.freeze([
  bear({ slug: 'baerenklaue-kurze-tatze', name: 'Kurze Tatze', minimumLevel: 9, costs: ['bonus-action'],
    description: 'Ein kurzer Hieb nimmt die nächste offene Lücke im Gedränge.', effect: 'Leichter Ergänzungshieb mit Technikschaden.' }),
  bear({ slug: 'baerenklaue-enterwacht', name: 'Enterwacht', minimumLevel: 10, costs: ['reaction'], noPrimaryDamage: true, target: 'Selbst',
    description: 'Die schwere Waffe schützt die eigene Mitte im engen Nahkampf.',
    effect: 'Kein Angriff; +1 RK bis zum Ende des nächsten eigenen Beitrags.', effects: [cover('baerenklaue-enterwacht', 'Enterwacht', 1)] }),
  bear({ slug: 'baerenklaue-axt-im-gedraenge', name: 'Axt im Gedränge', minimumLevel: 12, costs: ['action', 'reaction'],
    classWeaponProfiles: { arthwyr: ['axe', 'battleaxe'] }, weaponTypes: ['axe'],
    description: 'Ein kurzer Axtbogen zieht an der starken Seite der gegnerischen Waffe vorbei.',
    effect: 'Technikschaden; die Zielverteidigung zählt für diesen Angriff 1 Punkt niedriger.', targetDefenseModifier: -1 }),
  bear({ slug: 'baerenklaue-kolben-am-griff', name: 'Kolben am Griff', minimumLevel: 14, costs: ['action', 'reaction'],
    classWeaponProfiles: { arthwyr: ['club', 'mace'] }, weaponTypes: ['mace'],
    description: 'Der Kolben trifft die führende Hand und erschwert den nächsten Hieb.',
    effect: 'Technikschaden; nach Treffer KRF-Rettung, bei Scheitern −1 Angriff bis zum Ende des nächsten eigenen Beitrags.',
    secondarySave: secondarySave('baerenklaue-kolben', 'Erschütterter Griff', '−1 Angriff bis zum Ende des nächsten eigenen Beitrags.', { attack: -1 }) }),
  bear({ slug: 'baerenklaue-breite-schwertlinie', name: 'Breite Schwertlinie', minimumLevel: 16, costs: ['action', 'special-action'],
    classWeaponProfiles: { arthwyr: ['greatsword'] }, weaponTypes: ['sword'],
    description: 'Das Großschwert nutzt eine freie Linie für einen einzigen schweren Hieb.',
    effect: 'Verstärkter Technikschaden nach dem gemeinsamen Kostenbudget; Zusatzwürfel vervielfachen keinen vollständigen Mehrwürfel-Waffenpool.' }),
  bear({ slug: 'baerenklaue-gedeckter-entertritt', name: 'Gedeckter Entertritt', minimumLevel: 17,
    costs: ['bonus-action', 'reaction'], noPrimaryDamage: true, target: 'Selbst',
    description: 'Der Arthwyr setzt die Füße neu und nimmt seine schwere Waffe in eine geschlossene Deckung.',
    effect: 'Kein Angriff. Bis zu 2 m Eigenbewegung im verfügbaren Bewegungsbudget. +2 RK bis zum Ende des nächsten eigenen Beitrags. Keine automatische Loslösung.',
    effects: [{ ...movementEffect('baerenklaue-entertritt', 2), on: 'always' }, cover('baerenklaue-entertritt', 'Gedeckter Entertritt', 2)] }),
  bear({ slug: 'baerenklaue-enterpranke', name: 'Enterpranke', minimumLevel: 9, costs: ['action', 'reaction'],
    description: 'Ein kurzer, schwerer Hieb beansprucht den engen Raum, wie er beim Übersteigen einer Reling entsteht.',
    effect: 'Verursacht Technikschaden; bei misslungenem Stärkerettungswurf erhält das Ziel −1 Rüstungsklasse.',
    secondarySave: secondarySave('baerenklaue-pranke', 'Aufgerissene Wehr', 'Der schwere Nahkampfhieb drängt die Deckung auseinander.', { armorClass: -1 }) }),
  bear({ slug: 'baerenklaue-fester-tatzenstand', name: 'Fester Tatzenstand', minimumLevel: 11, costs: ['reaction', 'bonus-action'],
    description: 'Der Arthwyr hält den tiefen Stand, bindet den gegnerischen Vorstoß und antwortet mit schwerer Waffe.',
    effect: 'Reaktionsangriff mit Technikschaden und +1 Rüstungsklasse bis zum nächsten eigenen Beitrag.', effects: [cover('baerenklaue-stand', 'Fester Tatzenstand', 1)] }),
  bear({ slug: 'baerenklaue-gebrochene-reling', name: 'Gebrochene Reling', minimumLevel: 13, costs: ['action', 'bonus-action', 'reaction'],
    description: 'Körperdruck und Waffenhieb treffen denselben schwachen Punkt der gegnerischen Haltung.',
    effect: 'Verursacht Technikschaden; bei misslungenem Stärkerettungswurf erhält das Ziel −2 Angriff.',
    secondarySave: secondarySave('baerenklaue-reling', 'Erschütterter Stand', 'Der gebündelte Druck erschüttert die Waffenführung.', { attack: -2 }) }),
  bear({ slug: 'baerenklaue-zwei-pranken', name: 'Zwei Pranken', minimumLevel: 15, costs: ['action', 'special-action'], maximumTargets: 2, target: 'Bis zu zwei Gegner in Waffenreichweite',
    description: 'Zwei schwere Waffenlinien räumen eine enge Front frei.', effect: 'Trifft bis zu zwei ausgewählte Gegner mit je Technikschaden.' }),
  bear({ slug: 'baerenklaue-griff-des-uralten', name: 'Griff des Uralten', minimumLevel: 18, costs: ['action', 'reaction', 'special-action', 'aura-focus'],
    description: 'Aura und Körpergewicht halten die Nahkampflinie, während ein schwerer Schlag die Wehr aufbricht.',
    effect: 'Verursacht Technikschaden, behandelt die Zielverteidigung als 2 Punkte niedriger und gewährt +1 Rüstungsklasse bis zum nächsten eigenen Beitrag.',
    targetDefenseModifier: -2, effects: [cover('baerenklaue-uralter', 'Griff des Uralten', 1)] }),
  bear({ slug: 'baerenklaue-urteil-der-baerenklaue', name: 'Urteil der Bärenklaue', minimumLevel: 20,
    costs: ['action', 'bonus-action', 'reaction', { resourceId: 'special-action', amount: 2 }, { resourceId: 'aura-focus', amount: 2 }],
    description: 'Der Meister fasst den engen Kampf in einen einzigen, aus dem ganzen Körper geführten Abschluss.',
    effect: 'Verursacht Technikschaden, erhält +2 Angriff und behandelt die Zielverteidigung als 2 Punkte niedriger; bei misslungenem Stärkerettungswurf erhält das Ziel −1 Angriff.',
    attackBonus: 2, targetDefenseModifier: -2,
    secondarySave: secondarySave('baerenklaue-urteil', 'Gebrochener Widerstand', 'Der Abschluss nimmt der nächsten Waffenführung die Sicherheit.', { attack: -1 }) })
]);
