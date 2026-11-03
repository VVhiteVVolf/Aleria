import { createSirenentanzTechnique } from './sirenentanz-technique-factory.js';
import { SIRENENTANZ_FORM_IDS as F, DERWYN_FORM_IDS as D } from './sirenentanz-forms.js';

// Additional choices use the existing action/damage budget. Different weapon
// routes receive their own openings without granting another attack or item.
const lesson = (slug, name, level, weapon, cost, description, options = {}) => ({
  slug, name, level, weapon, cost, description,
  effect: [options.noDamage ? 'Kein Schaden.' : 'Ein einzelner Techniktreffer mit der tatsächlich geführten Waffe und den aufgeführten Kosten.',
    options.guard ? `+${options.guard} RK für einen eigenen Beitrag; gleichartige Deckung wird ersetzt.` : '',
    options.aim ? '+1 Angriff für einen eigenen Beitrag; Vorbereitungen werden nicht addiert.' : '',
    options.penalty ? 'KRF-Rettungswurf gegen den gemeinsamen Waffen-SG oder −1 Angriff für einen eigenen Beitrag; nicht additiv.' : ''].filter(Boolean).join(' '),
  ...options
});
const guard = { noDamage: true, guard: 1 };
const aim = { noDamage: true, aim: true };
const bind = { penalty: 1 };
const step = { position: true };

const basic = {
  morwyr: [
    lesson('sicherer-partisanenstoss', 'Sicherer Partisanenstoß', 1, 'polearm', 'strike', 'Die Spitze folgt dem festen Stand, ohne bereits Leine oder Axt zu benötigen.'),
    lesson('kurzer-enterhaken', 'Kurzer Enterhaken', 2, 'simpleAxe', 'light', 'Ein kurzer Axtkontakt prüft die Deckung, bevor sich der Morwyr festlegt.'),
    lesson('freier-harpunenwurf', 'Freier Harpunenwurf', 3, 'harpoon', 'strike', 'Ein gerader Wurf benötigt keine befestigte Zugleine und zieht den Gegner nicht heran.'),
    lesson('axt-vor-der-brust', 'Axt vor der Brust', 3, 'axe', 'guard', 'Der kurze Axtstiel schließt die eigene Flanke.', guard),
    lesson('plankenwinkel', 'Plankenwinkel', 4, 'polearm', 'flowing', 'Die Partisane deckt den eigenen Wechsel aus der gegnerischen Waffenlinie.', step),
    lesson('harpunenruhe', 'Harpunenruhe', 5, 'harpoon', 'preparation', 'Der Werfer sammelt den Blick auf eine einzige Wurflinie.', aim),
    lesson('rueckkehr-der-enteraxt', 'Rückkehr der Enteraxt', 7, 'axe', 'pressure', 'Der zurückgenommene Axtkopf bedrängt den fremden Waffengriff.', bind),
    lesson('stille-partisanenlinie', 'Stille Partisanenlinie', 8, 'polearm', 'preparation', 'Der Schaft bleibt vor dem Körper, während die Spitze die nächste Öffnung sucht.', { ...guard, aim: true })
  ],
  rhyfelwyr: [
    lesson('sicherer-schwerthieb', 'Sicherer Schwerthieb', 1, 'sword', 'strike', 'Der schwere Krieger führt auch seine Seitenklinge mit ruhigem, festem Griff.'),
    lesson('axt-der-kante', 'Axt der Kante', 2, 'heavyAxe', 'pressure', 'Die Axt drückt die gegnerische Waffenlinie seitwärts.', bind),
    lesson('hammerhut', 'Hammerhut', 3, 'hammer', 'guard', 'Der kurze Hammergriff hält die bedrohte Flanke geschlossen.', guard),
    lesson('stern-am-griff', 'Stern am Griff', 4, 'flail', 'strike', 'Der Waffenkopf bleibt auf einem kurzen, kontrollierten Bogen; Rüstung wird regulär gewertet.'),
    lesson('ruhender-kolben', 'Ruhender Kolben', 5, 'mace', 'preparation', 'Der Kolben wird ohne weiten Ausholweg zum nächsten Hieb ausgerichtet.', aim),
    lesson('schwert-am-fels', 'Schwert am Fels', 6, 'sword', 'pressure', 'Die Seitenklinge bindet die gegnerische Führung aus festem Stand.', bind),
    lesson('kehrender-hammer', 'Kehrender Hammer', 7, 'hammer', 'flowing', 'Der Hammer zieht den Körper in eine gedeckte seitliche Linie.', step),
    lesson('ruhe-des-sternbogens', 'Ruhe des Sternbogens', 8, 'flail', 'preparation', 'Der Flegel wird eingeholt und die geschlossene Rückführung bewusst vorbereitet.', { ...guard, aim: true })
  ],
  ceidwyn: [
    lesson('erster-sehnenzug', 'Erster Sehnenzug', 1, 'shortbow', 'strike', 'Der Schütze setzt einen vollständigen, kontrollierten Pfeil statt eines Störschusses.'),
    lesson('kurzer-saebelschnitt', 'Kurzer Säbelschnitt', 2, 'sabre', 'light', 'Der Säbel trifft auf knappem Weg aus der Deckung.'),
    lesson('gerade-zinke', 'Gerade Zinke', 2, 'trident', 'strike', 'Die mittlere Spitze folgt geradlinig dem Schaft.'),
    lesson('ruhiger-armbrustabzug', 'Ruhiger Armbrustabzug', 3, 'crossbow', 'preparation', 'Die geladene Armbrust wird ohne Schuss auf eine freie Linie gebracht.', aim),
    lesson('saebelhut-der-reling', 'Säbelhut der Reling', 4, 'sabre', 'guard', 'Der Säbel deckt den Zugang aus der engen Passage.', guard),
    lesson('schritt-hinter-die-zinken', 'Schritt hinter die Zinken', 5, 'trident', 'flowing', 'Die Spitzen halten den Gegner vor dem eigenen gedeckten Stellungswechsel.', step),
    lesson('sehnenwacht', 'Sehnenwacht', 7, 'shortbow', 'preparation', 'Der Bogen bleibt bereit, während der Schütze die nächste sichere Öffnung abwartet.', aim),
    lesson('saebel-gegen-den-schaft', 'Säbel gegen den Schaft', 8, 'sabre', 'pressure', 'Ein enger Schnitt nimmt dem Gegner den Rhythmus seiner Waffenführung.', bind)
  ],
  rhiddwyr: [
    lesson('erster-reisebolzen', 'Erster Reisebolzen', 1, 'crossbow', 'strike', 'Die Armbrust eröffnet den Kampf aus sicherem Stand; ein Pferd ist nicht erforderlich.'),
    lesson('abgesessene-glefe', 'Abgesessene Glefe', 2, 'riderPolearm', 'strike', 'Der Schaft wird zu Fuß geführt, ohne Anritt oder Rossangriff.'),
    lesson('hammer-des-reisenden', 'Hammer des Reisenden', 3, 'hammer', 'pressure', 'Der Hammer bedrängt die fremde Waffenführung auch ohne Sattel.', bind),
    lesson('wanderers-hut', 'Wanderers Hut', 4, 'rider', 'guard', 'Die Reiterwaffe deckt den Reisenden zu Fuß ebenso wie im Sattel.', guard),
    lesson('kurzer-reiteraxtbogen', 'Kurzer Reiteraxtbogen', 5, 'riderAxe', 'light', 'Ein verkürzter Axtschlag hält den unmittelbaren Abstand.'),
    lesson('sicherer-flegelgriff', 'Sicherer Flegelgriff', 6, 'flail', 'preparation', 'Der kontrolliert eingeholte Waffenkopf ruht vor der nächsten Schlaglinie.', aim),
    lesson('abgesessene-schaftwende', 'Abgesessene Schaftwende', 7, 'riderPolearm', 'flowing', 'Der Schaft deckt den eigenen Stellungswechsel zu Fuß.', step),
    lesson('ruhiger-sattelbolzen', 'Ruhiger Sattelbolzen', 8, 'crossbow', 'pressure', 'Aus einem stehenden, sicheren Sitz stört ein Bolzen die gegnerische Waffenhaltung.', { ...bind, mounted: true })
  ],
  milwr: [
    lesson('gerader-wachtspeer', 'Gerader Wachtspeer', 1, 'spear', 'strike', 'Ein einfacher Speerstoß hält die vordere Waffenlinie.'),
    lesson('kurze-wachtaxt', 'Kurze Wachtaxt', 2, 'simpleAxe', 'light', 'Ein kurzer Axtschlag prüft die Deckung am Rand der Wachlinie.'),
    lesson('ruhiger-wachtkolben', 'Ruhiger Wachtkolben', 3, 'mace', 'strike', 'Der Kolben wird mit kurzem, festem Griff geführt.'),
    lesson('geschlossene-wachtklinge', 'Geschlossene Wachtklinge', 4, 'sword', 'guard', 'Die Seitenklinge schließt die offene Flanke.', guard),
    lesson('wache-spitze', 'Wache Spitze', 5, 'spear', 'preparation', 'Der Milwr richtet den Speer auf die nächste freie Stoßlinie aus.', aim),
    lesson('axt-an-der-schwelle', 'Axt an der Schwelle', 6, 'simpleAxe', 'pressure', 'Der Axtkopf bedrängt die fremde Führung vor dem Zugang.', bind),
    lesson('kuestenspeer', 'Küstenspeer', 7, 'spear', 'pressure', 'Der gerade Stoß stört die gegnerische Waffenhaltung.', { ...bind, formId: F.militia }),
    lesson('wachtaxtwende', 'Wachtaxtwende', 9, 'simpleAxe', 'flowing', 'Der Axtschlag deckt einen eigenen Stellungswechsel.', { ...step, formId: F.militia }),
    lesson('kolben-der-kueste', 'Kolben der Küste', 11, 'mace', 'strike', 'Ein fester, kurzer Kolbenhieb bleibt innerhalb der gemeinsamen Wachausbildung.', { formId: F.militia }),
    lesson('klingenwacht-der-kueste', 'Klingenwacht der Küste', 13, 'sword', 'preparation', 'Die Klinge deckt den erfahrenen Milwr ohne sofortigen Gegenangriff.', { noDamage: true, guard: 2, formId: F.militia }),
    lesson('letzte-speerschwelle', 'Letzte Speerschwelle', 14, 'spear', 'specialStrike', 'Ein vorbereiteter Speerstoß nimmt die gegnerische Waffenführung aus dem Rhythmus.', { ...bind, formId: F.militia }),
    lesson('axt-der-alten-wache', 'Axt der alten Wache', 15, 'simpleAxe', 'finisher', 'Ein entschlossener Axtschlag endet wieder vor der eigenen Flanke.', { guard: 1, formId: F.militia })
  ],
  derwyn: [
    lesson('erste-ruhige-klinge', 'Erste ruhige Klinge', 1, 'sword', 'strike', 'Der Derwyn führt den Schwertzweig schon in seiner vennyriischen Grundausbildung.'),
    lesson('sternhut-des-schuelers', 'Sternhut des Schülers', 3, 'morningstar', 'guard', 'Der eingeholte Waffenkopf hält die Flanke geschlossen.', guard),
    lesson('schwellenstoss', 'Schwellenstoß', 4, 'derwynStaff', 'strike', 'Ein kurzer physischer Stabstoß nutzt beide Hände und festen Stand.'),
    lesson('ruhe-der-drei-spitzen', 'Ruhe der drei Spitzen', 6, 'trident', 'preparation', 'Die drei Spitzen ruhen vor der nächsten sicheren Stoßlinie.', aim),
    lesson('freie-stabwacht', 'Freie Stabwacht', 7, 'derwynStaff', 'guard', 'Der Derwyn vertieft die geschlossene Deckung seines eigenen Stabgriffs.', { ...guard, formId: D.creative }),
    lesson('freie-schwertwende', 'Freie Schwertwende', 7, 'sword', 'flowing', 'Ein eigener Schwertschnitt deckt einen neuen Stellungswechsel.', { ...step, formId: D.creative }),
    lesson('freier-sternhieb', 'Freier Sternhieb', 8, 'morningstar', 'pressure', 'Der kontrollierte Hieb stört die gegnerische Waffenhaltung.', { ...bind, formId: D.creative }),
    lesson('freie-zinkenwacht', 'Freie Zinkenwacht', 8, 'trident', 'preparation', 'Der Dreizack bleibt schützend vor dem Körper, während der Blick die nächste Öffnung sammelt.', { ...guard, aim: true, formId: D.creative })
  ]
};

// Four missing intermediate levels, matching the Teulu's 9–20 expert cadence.
// The same resource envelopes are shared; each class chooses its own weapon.
const expert = {
  morwyr: {
    [F.breaker]: [['taukeil', 'Taukeil', 'axe'], ['harpunenkante', 'Harpunenkante', 'harpoon'], ['partisanendrang', 'Partisanendrang', 'polearm'], ['enteraxt-der-brandung', 'Enteraxt der Brandung', 'axe']],
    [F.current]: [['gleitende-partisane', 'Gleitende Partisane', 'polearm'], ['enge-axtwende', 'Enge Axtwende', 'axe'], ['wurf-durch-die-gischt', 'Wurf durch die Gischt', 'harpoon'], ['schirmende-bugspitze', 'Schirmende Bugspitze', 'polearm']],
    [F.depths]: [['ruhiger-harpunengriff', 'Ruhiger Harpunengriff', 'harpoon'], ['geschlossene-enteraxt', 'Geschlossene Enteraxt', 'axe'], ['partisane-vor-dem-mast', 'Partisane vor dem Mast', 'polearm'], ['stillgehaltener-wurf', 'Stillgehaltener Wurf', 'harpoon']]
  },
  rhyfelwyr: {
    [F.breaker]: [['hammer-der-brandung', 'Hammer der Brandung', 'hammer'], ['axt-im-keil', 'Axt im Keil', 'heavyAxe'], ['stern-der-front', 'Stern der Front', 'flail'], ['kolbenbrecher', 'Kolbenbrecher', 'mace']],
    [F.current]: [['wandernde-klinge', 'Wandernde Klinge', 'sword'], ['kurzer-hammerkreis', 'Kurzer Hammerkreis', 'hammer'], ['axt-um-den-fels', 'Axt um den Fels', 'heavyAxe'], ['gedeckter-sternbogen', 'Gedeckter Sternbogen', 'flail']],
    [F.depths]: [['fester-schwertgrund', 'Fester Schwertgrund', 'sword'], ['kolbenvorhalt', 'Kolbenvorhalt', 'mace'], ['hammer-der-schwelle', 'Hammer der Schwelle', 'hammer'], ['ruhende-axtlinie', 'Ruhende Axtlinie', 'heavyAxe']]
  },
  ceidwyn: {
    [F.breaker]: [['saebelkeil', 'Säbelkeil', 'sabre'], ['kurze-sehnenwucht', 'Kurze Sehnenwucht', 'shortbow'], ['drang-der-armbrust', 'Drang der Armbrust', 'crossbow'], ['dreifache-brandung', 'Dreifache Brandung', 'trident']],
    [F.current]: [['bolzen-aus-der-wende', 'Bolzen aus der Wende', 'crossbow'], ['schritt-der-drei-zinken', 'Schritt der drei Zinken', 'trident'], ['saebel-durch-die-gischt', 'Säbel durch die Gischt', 'sabre'], ['pfeil-der-neuen-linie', 'Pfeil der neuen Linie', 'shortbow']],
    [F.depths]: [['ruhige-armbrustlinie', 'Ruhige Armbrustlinie', 'crossbow'], ['geschlossener-sehnenblick', 'Geschlossener Sehnenblick', 'shortbow'], ['saebel-vor-der-schwelle', 'Säbel vor der Schwelle', 'sabre'], ['wartende-dreizackspitze', 'Wartende Dreizackspitze', 'trident']]
  },
  rhiddwyr: {
    [F.breaker]: [['reitflegelkeil', 'Reitflegelkeil', 'flail'], ['schwerer-wegeschaft', 'Schwerer Wegeschaft', 'riderPolearm'], ['gratbolzen', 'Gratbolzen', 'crossbow'], ['reiteraxt-der-brandung', 'Reiteraxt der Brandung', 'riderAxe']],
    [F.current]: [['wandernder-hammer', 'Wandernder Hammer', 'hammer'], ['bolzen-in-der-wende', 'Bolzen in der Wende', 'crossbow'], ['glefe-des-reisenden', 'Glefe des Reisenden', 'riderPolearm'], ['gedeckter-reitkolben', 'Gedeckter Reitkolben', 'mace']],
    [F.depths]: [['ruhiger-schaftgrund', 'Ruhiger Schaftgrund', 'riderPolearm'], ['reiterhammerhut', 'Reiterhammerhut', 'hammer'], ['bolzen-vor-der-schwelle', 'Bolzen vor der Schwelle', 'crossbow'], ['wartender-flegel', 'Wartender Flegel', 'flail']]
  },
  derwyn: {
    [D.flowing]: [['klinge-im-ruecklauf', 'Klinge im Rücklauf', 'sword'], ['stiller-schwertring', 'Stiller Schwertring', 'sword'], ['gebundene-schwertlinie', 'Gebundene Schwertlinie', 'sword'], ['ruhende-meisterhut', 'Ruhende Meisterhut', 'sword']],
    [D.breaking]: [['zinken-im-ruecklauf', 'Zinken im Rücklauf', 'trident'], ['stiller-dreizackring', 'Stiller Dreizackring', 'trident'], ['gebundene-brandungslinie', 'Gebundene Brandungslinie', 'trident'], ['ruhende-zinkenkrone', 'Ruhende Zinkenkrone', 'trident']],
    [D.rising]: [['schaft-im-ruecklauf', 'Schaft im Rücklauf', 'derwynStaff'], ['stiller-stabring', 'Stiller Stabring', 'derwynStaff'], ['gebundene-schaftlinie', 'Gebundene Schaftlinie', 'derwynStaff'], ['ruhende-stabkrone', 'Ruhende Stabkrone', 'derwynStaff']],
    [D.whipping]: [['stern-im-ruecklauf', 'Stern im Rücklauf', 'morningstar'], ['stiller-sternring', 'Stiller Sternring', 'morningstar'], ['gebundene-sternlinie', 'Gebundene Sternlinie', 'morningstar'], ['ruhender-meisterstern', 'Ruhender Meisterstern', 'morningstar']]
  }
};

function expertLesson(formId, [slug, name, weapon], index) {
  const level = [14, 16, 18, 19][index];
  if (formId === F.breaker || formId === D.breaking || formId === D.whipping) {
    return lesson(slug, name, level, weapon, ['strike', 'specialStrike', 'pressure', 'finisher'][index],
      'Der Kämpfer bündelt den geraden Druck seiner Waffenform in einen einzelnen kontrollierten Treffer.',
      index === 2 ? { ...bind, formId } : { formId });
  }
  if (formId === F.current || formId === D.rising) {
    return lesson(slug, name, level, weapon, ['flowing', 'strike', 'specialFlow', 'pressure'][index],
      'Der kurze Waffenweg verbindet den Treffer mit einem gedeckten Wechsel der eigenen Kampflinie.',
      { ...(index === 1 ? {} : step), formId });
  }
  return lesson(slug, name, level, weapon, ['strike', 'preparation', 'specialGuard', 'preparation'][index],
    'Die ruhige Waffenführung wahrt die eigene Deckung und wartet auf eine sichere Öffnung.',
    { ...(index === 1 ? { noDamage: true, guard: 1, aim: true } : index === 2 ? bind : index === 3 ? { noDamage: true, guard: 2 } : {}), formId });
}

export function getWyrmtanzBasicWeaponLessons(classId) {
  return (basic[classId] || []).map(spec => createSirenentanzTechnique(classId, {
    ...spec, formId: spec.formId || (spec.level <= 6 ? F.foundation : F.advanced)
  }));
}

export function getWyrmtanzExpertWeaponLessons(classId) {
  return Object.entries(expert[classId] || {}).flatMap(([formId, entries]) => entries.map((entry, index) =>
    createSirenentanzTechnique(classId, expertLesson(formId, entry, index))));
}
