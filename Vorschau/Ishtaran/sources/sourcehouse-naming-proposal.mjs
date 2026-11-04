import { EMBLEMS } from '../heraldry-data.mjs';
import { HOUSE_NAME_PROPOSALS, CITY_NAME_PROPOSALS } from '../name-proposals.mjs';

/** Lokaler Zuordnungsentwurf nach aktueller Nutzerfreigabe; ohne Ränge/Sitze. */
const houseRows = [
  ['source-01', 'Bayindir', 'Breiter, traditionsreicher Klang für das kräftige rot-weiße Wappen.'],
  ['source-02', 'Ilterisch', 'Eigenständige scharf-weiche Lautfolge neben der fein ornamentierten Lampe.'],
  ['source-03', 'Dahakid', 'Der bereits vorgegebene Hausname bleibt unverändert.'],
  ['source-04', 'Altugan', 'Offener dreisilbiger Klang mit genügend Gewicht für das starke Rot und Gold.'],
  ['source-05', 'Kutlug', 'Knapper markanter Name zum klar gegliederten blau-weißen Wappen.'],
  ['source-06', 'Merugan', 'Weicher voller Ausklang als ruhiger Gegenpol zum satten Grün und Gold.'],
  ['source-07', 'Aschina', 'Nutzerfavorit für die Herrscherdynastie; die Sonne bleibt zugleich das Landeswappen.'],
  ['source-08', 'Alptegin', 'Dreisilbiger klarer Rhythmus zum reich verschlungenen Fisch-und-Klingen-Wappen.'],
  ['source-09', 'Kargan', 'Kurzer dunkler Klang, ohne den Namen vom Krokodil abzuleiten.'],
  ['source-10', 'Tarkut', 'Zwei feste Silben geben dem ornamentierten Skorpionwappen eine klare Namensform.'],
  ['source-11', 'Bayturan', 'Weiter voller Klang zum großen grün-weißen Adlerbild.'],
  ['pool-01', 'Börtan', 'Ein besonders griffiger Nutzerfavorit; kurz genug neben der reichen Silber-Blau-Heraldik.'],
  ['pool-02', 'Turgut', 'Kerniger zweisilbiger Name zum ockerfarbenen Wappen mit dunkler Zeichnung.'],
  ['pool-03', 'Arkut', 'Knapp und herb; gut von den längeren Hausnamen unterscheidbar.'],
  ['pool-04', 'Erlugan', 'Fließender, heller Klang zur zurückhaltenden Grün-Elfenbein-Palette.'],
  ['pool-05', 'Afschar', 'Kräftiger Anfang und offener Ausklang neben der roten Tulpenheraldik.'],
  ['pool-06', 'Tardu', 'Kurzer, eigenständiger Klang mit anderer Endung als die vielen Namen auf -an.'],
  ['pool-07', 'Barsbek', 'Markant und gut merkbar; das Adlerbild benötigt keinen zusätzlichen sprechenden Namen.'],
  ['pool-08', 'Aybars', 'Heller runder Nutzername zum silbernen Zeichen auf dunklem Violett.'],
  ['pool-09', 'Turgan', 'Schlichter alter Steppenklang neben dem klaren weißen Zeltmotiv.'],
  ['pool-10', 'Tenguran', 'Getragener dreisilbiger Name zum feierlichen Rot-Gold-Wappen.'],
  ['pool-11', 'Karluk', 'Kompakter, etwas kantiger Name als Gegenstück zur breiten schwarzen Silhouette.'],
  ['pool-12', 'Iltan', 'Schlanker heller Klang, der die leichte grün-weiße Heraldik gut ergänzt.'],
  ['pool-13', 'Salur', 'Runder zweisilbiger Name mit ruhigem Abschluss neben dem kreisenden Karpfenmotiv.'],
  ['pool-14', 'Ordugan', 'Sonorer voller Name, der auch ohne Anker- oder Hafenbedeutung funktioniert.'],
  ['pool-15', 'Balkar', 'Breiter warmer Klang zur gedämpften gold-oliven Palette.'],
  ['pool-16', 'Erkut', 'Kurzer klarer Name neben der formalen weiß-blauen Brückenheraldik.'],
  ['pool-17', 'Kinik', 'Besonders prägnante Lautform zum einfachen rot-elfenbeinfarbenen Hauptmotiv.'],
  ['pool-18', 'Göktemir', 'Kräftiger dreisilbiger Klang zum reichen Schwarzblau und Gold.'],
  ['pool-19', 'Ardulan', 'Fließender voller Name zur ruhigen blaugrün-silbernen Palette.'],
  ['pool-20', 'Kurtan', 'Knapper dunkler Klang; bewusst keine wörtliche Benennung des Widdermotivs.'],
  ['pool-21', 'Börtugan', 'Getragener Nutzerfavorit mit eigenständigem Rhythmus zum klaren Sternwappen.'],
  ['pool-22', 'Torgun', 'Runder dunkler Ausklang zum kräftigen Grün und dem roten Flussband.'],
  ['pool-23', 'Kuturan', 'Klarer dreisilbiger Name, der neben dem großen Festungszeichen gut lesbar bleibt.'],
  ['pool-24', 'Yarkulan', 'Weiter kräftiger Klang; kein aus dem Windhund abgeleiteter Tiername.'],
  ['pool-25', 'Tebaran', 'Helle offene Silben zur weißen Zeichnung auf Blau.'],
  ['pool-26', 'Albaran', 'Weicher voller Klang zu Elfenbein, Rot und grüner Ornamentik.'],
];

export const HOUSE_NAMING_PROPOSAL = Object.freeze(houseRows.map(([emblemId, name, reason]) => {
  const emblem = EMBLEMS.find((entry) => entry.id === emblemId);
  const nameProposal = HOUSE_NAME_PROPOSALS.find((entry) => entry.name === name);
  if (!emblem || (!nameProposal && emblemId !== 'source-03')) throw new Error(`Unbekannte Vorlage: ${emblemId} / ${name}`);
  return Object.freeze({
    emblemId, name, houseName: `Haus ${name}`, nameProposalId: nameProposal?.id ?? null,
    emblemName: emblem.name, motif: emblem.motif, colors: emblem.colors,
    note: reason, reason, status: 'proposal', preserveExistingName: emblemId === 'source-03',
    nameSource: emblemId === 'source-03' ? 'confirmed-current-user' : 'existing-name-proposal',
    sharedRealmEmblem: emblemId === 'source-07',
  });
}));

const cityRows = [
  ['Altasar', 'Prägnant und weit klingend; mein klarer Hauptstadtfavorit.', ['Hauptstadt', 'große Landesstadt']],
  ['Ildaran', 'Fließend und etwas weicher als Altasar; starke zweite große Stadt.', ['große Landesstadt', 'Flusstal']],
  ['Belduran', 'Ruhiger voller Dreiklang.', ['weite Ebene', 'große Landesstadt']],
  ['Ayseran', 'Heller und melodischer Ortsklang.', ['Küste', 'größeres Gewässer']],
  ['Kargulan', 'Rauer Beginn mit offenem Ausklang.', ['Gebirgsrand', 'Hochland']],
  ['Kembaran', 'Weiche Mitte und tragender Schluss.', ['Flusstal', 'weite Ebene']],
  ['Orsakent', 'Klar gegliedert und anders endend als die meisten übrigen Namen.', ['Küste', 'Flusskreuzung']],
  ['Torgasar', 'Dunklerer, kräftiger Dreiklang.', ['Hochland', 'große Landesstadt']],
  ['Kalduran', 'Kräftig und zugleich fließend.', ['Gebirgsrand', 'Flusstal']],
  ['Börkent', 'Kurzer markanter Name.', ['kleinere Stadt', 'engeres Flusstal']],
  ['Altschar', 'Herb, knapp und gut von den langen Namen abgesetzt.', ['Hochland', 'kleinere Stadt']],
  ['Koyrath', 'Weicher Beginn, fester Abschluss.', ['Küste', 'größeres Gewässer']],
  ['Bayrath', 'Hell und offen mit kurzem Rhythmus.', ['Küste', 'kleinere Stadt']],
  ['Oryntar', 'Runder ruhiger Klang.', ['weite Ebene', 'Flusstal']],
  ['Ilbarsen', 'Klarer Beginn und weicher Schluss.', ['bewaldeter Landstrich', 'Flusstal']],
  ['Kersalan', 'Gleichmäßiger ruhiger Dreiklang.', ['weite Ebene', 'bewaldeter Landstrich']],
  ['Kutlakar', 'Markante Konsonanten und ein harter Schluss.', ['Gebirgsrand', 'Hochland']],
  ['Teldarak', 'Fester, gut unterscheidbarer Abschluss.', ['Hochland', 'kleinere Stadt']],
  ['Taschuran', 'Rauer Anlaut, danach runder Ausklang.', ['Gebirgsrand', 'Flusstal']],
  ['Arkulan', 'Weiter offener Steppenklang.', ['weite Ebene', 'kleinere Stadt']],
  ['Temrakan', 'Kernig und leicht lesbar.', ['Gebirgsrand', 'bewaldeter Landstrich']],
];

export const CITY_NAMING_SHORTLIST = Object.freeze(cityRows.map(([name, reason, possibleLandscape]) => {
  const proposal = CITY_NAME_PROPOSALS.find((entry) => entry.name === name);
  if (!proposal) throw new Error(`Unbekannter Stadtvorschlag: ${name}`);
  return Object.freeze({
    id: proposal.id, name, reason, possibleLandscape: Object.freeze(possibleLandscape),
    status: 'proposal',
  });
}));

export const CAPITAL_NAME_RECOMMENDATION = Object.freeze({
  name: 'Altasar', alternative: 'Ildaran', status: 'proposal',
  reason: 'Altasar ist kurz genug für die Karte, hat drei klare Silben und einen kräftigen eigenen Klang. Ildaran klingt weicher und eignet sich gut als zweite bedeutende Landesstadt. Beide bleiben ohne behauptete Übersetzung.',
});

export const NAMING_PROPOSAL_NOTES = Object.freeze({
  sourceReview: ['diagnostics/ishtaran/source-emblems-contact.jpg', 'diagnostics/ishtaran/pool-emblems-naming-review.png'],
  livingEmblemCount: 37,
  newHouseNameChoices: 36,
  preservedExistingName: 'Dahakid',
  ancientEmblemExcluded: 'maghneach',
  nationalEmblemUse: 'Das Sonnenwappen bleibt Landeswappen. Seine zusätzliche Nutzung durch das vorgeschlagene Haus Aschina ist ein Entwurf, keine Änderung des Wappens.',
  scope: 'Nur Namens-/Wappenentwurf und Stadtnamenauswahl. Kein Rang, konkreter Sitz, Kartenpunkt, Verwandtschaftsbeleg oder Amt wird zugewiesen.',
  rationale: 'Natürlicher alttürkisch/tengrisch inspirierter Klang und deutliche Unterscheidbarkeit gehen vor Tier-, Berufs- oder Funktionsnamen. Motiv und Farben helfen bei der ästhetischen Kombination; sie begründen keine Etymologie oder Hausgeschichte.',
});
