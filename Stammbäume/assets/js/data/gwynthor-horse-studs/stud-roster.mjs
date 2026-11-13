// Canonical authored family source. Almanach views project these identities.
const ART = '../AleriaAlmanach/assets/gwynthor-horse-studs';
export const HALENRHYD_EMBLEM = `${ART}/wappen/halenrhyd-wappen-v2.png`;
export const CAEFFYN_EMBLEM = `${ART}/wappen/caeffyn-wappen-v2.png`;
export const STUD_PORTRAITS = Object.freeze(Object.fromEntries(['gorweth-halenrhyd', 'eirfena-halenrhyd', 'maelrig-caeffyn', 'kyria-aurdden'].map(id => [id, `${ART}/portraits/${id}-v${id === 'maelrig-caeffyn' ? 3 : 1}.png`])));
const member = (id, name, sex, birth, branch, role, notes, options = {}) => Object.freeze({
  id, name, sex, birth: String(birth), death: '', status: 'alive', branch, title: role, notes,
  familyId: 'haus-halenrhyd', houseId: 'house-halenrhyd', worldPersonId: `person--haus-halenrhyd--${id}`,
  portrait: STUD_PORTRAITS[id] || '', ...options
});
export const HALENRHYD_PEOPLE = Object.freeze([
  member('idren-halenrhyd', 'Idren Halenrhyd', 'male', 1664, 'herkunft', 'Früherer Familienvorsteher', 'Vater Gorweths, Odrigs und Bryndors. Festigte die Verbindung zwischen Pferdeverkauf, Rosszucht und Futterhof.', { death: '1733', status: 'dead' }),
  member('branessa-halenrhyd', 'Branessa', 'female', 1667, 'herkunft', 'Frühere Hofverwalterin', 'Gemahlin Idrens und Mutter der drei Brüder. Hielt die Rechnungen der Familienbetriebe zusammen.', { death: '1737', status: 'dead', spouse: true, houseId: '' }),
  member('gorweth-halenrhyd', 'Gorweth Halenrhyd', 'male', 1691, 'stadt', 'Inhaber · Familienoberhaupt', '49 Jahre. Leitet das Gestüt Zum Silberhalm und den städtischen Pferdeankauf und -verkauf. Vertritt die Halenrhyd im Achterrat der Klingenden Münze und wahrt die Dienstbindung an Haus Wyrm. Prüft Herkunft und Eignung eines Pferdes geduldig; seine ruhige Stimme wird bei unklaren Besitzpapieren sehr bestimmt.'),
  member('eirfena-halenrhyd', 'Eirfena', 'female', 1693, 'stadt', 'Stadtverwaltung · Hofhaushalt', '47 Jahre. Gorweths Gemahlin. Verantwortet mit ihm Rechnungen, Termine und den gemeinsamen Stadthaushalt. Kennt die Lieferwege ihrer Verwandten und besteht auf nachvollziehbaren Übergaben.', { spouse: true, houseId: '' }),
  member('odrig-halenrhyd', 'Odrig Halenrhyd', 'male', 1694, 'hof', 'Leitung des Futterhofs', '46 Jahre. Gorweths jüngerer Bruder. Führt den eigenen Familienhof mit Futteranbau, Getreide, Gemüse und Viehhaltung. Plant Ernte und Vorräte für den Familienverbund.'),
  member('rhaenna-halenrhyd', 'Rhaenna', 'female', 1696, 'hof', 'Vorräte und Landwirtschaftsverwaltung', '44 Jahre. Odrigs Gemahlin. Betreut Saatgut, Vorräte und die Abrechnung landwirtschaftlicher Lieferungen.', { spouse: true, houseId: '' }),
  member('bryndor-halenrhyd', 'Bryndor Halenrhyd', 'male', 1695, 'zucht', 'Leitung des Landgestüts', '45 Jahre. Jüngster der drei Brüder. Verantwortet die Rosszucht im östlichen Bannkreis und die Abstimmung zwischen Aufzucht, Bereitung und städtischem Verkauf.'),
  member('melyssa-halenrhyd', 'Melyssa', 'female', 1698, 'zucht', 'Stutenpflege und Zuchtaufzeichnungen', '42 Jahre. Bryndors Gemahlin. Führt Abstammungsaufzeichnungen und achtet auf feste Routinen bei Stuten und Fohlen.', { spouse: true, houseId: '' }),
  member('rhydor-halenrhyd', 'Rhydor Halenrhyd', 'male', 1714, 'stadt', 'Ankauf und Pferdevorstellung', '26 Jahre. Ältester Sohn Gorweths und Eirfenas. Stellt Tiere vor, prüft ihre Vorgeschichte und begleitet verabredete Ankäufe.'),
  member('gwenessa-halenrhyd', 'Gwenessa', 'female', 1715, 'stadt', 'Verkaufsbücher und Hauswirtschaft', '25 Jahre. Rhydors Gemahlin und Mutter Iffryns und Enoras. Unterstützt Verkaufsbücher und Haushalt.', { spouse: true, houseId: '' }),
  member('cerydd-halenrhyd', 'Cerydd Halenrhyd', 'female', 1717, 'stadt', 'Pferdeberatung', '23 Jahre. Tochter Gorweths und Eirfenas. Berät zu Haltung, Reitkenntnissen und der Eignung angebotener Pferde.'),
  member('talwern-halenrhyd', 'Talwern Halenrhyd', 'male', 1720, 'stadt', 'Sattlerlehrling', '20 Jahre. Lernt unter Aufsicht Zuschnitt, Nähen und die Prüfung von Riemen und Sätteln.'),
  member('eilrann-halenrhyd', 'Eilrann Halenrhyd', 'female', 1725, 'stadt', 'Im Familienhaushalt', '15 Jahre. Lernt Lesen, Rechnen und einfache betreute Handgriffe. Keine selbständige Verantwortung für Handel oder schwierige Pferde.'),
  member('iffryn-halenrhyd', 'Iffryn Halenrhyd', 'male', 1735, 'stadt', 'Kind im Familienhaushalt', '5 Jahre. Sohn Rhydors und Gwenessas; ohne Arbeitspflichten.'),
  member('enora-halenrhyd', 'Enora Halenrhyd', 'female', 1738, 'stadt', 'Kind im Familienhaushalt', '2 Jahre. Tochter Rhydors und Gwenessas; ohne Arbeitspflichten.'),
  member('brialeth-halenrhyd', 'Brialeth Halenrhyd', 'female', 1717, 'zucht', 'Stuten- und Jungpferdepflege', '23 Jahre. Tochter Bryndors und Melyssas. Unterstützt Fohlenaufzucht und tägliche Pflege.'),
  member('odrann-halenrhyd', 'Odrann Halenrhyd', 'male', 1720, 'zucht', 'Pferdeausbildung', '20 Jahre. Sohn Bryndors und Melyssas. Arbeitet unter fachlicher Leitung an Bodenarbeit und dem behutsamen Anreiten.'),
  member('gwelric-halenrhyd', 'Gwelric Halenrhyd', 'male', 1723, 'zucht', 'Ausbildung in Pferdepflege', '17 Jahre. Lernt Fütterung, Stallpflege und sichere Handgriffe unter Aufsicht.'),
  member('neryssa-halenrhyd', 'Neryssa Halenrhyd', 'female', 1727, 'zucht', 'Im Familienhaushalt', '13 Jahre. Lebt am Landgestüt und lernt altersgemäß unter Aufsicht.'),
  member('cynradd-halenrhyd', 'Cynradd Halenrhyd', 'male', 1715, 'hof', 'Feldbau und Futterwirtschaft', '25 Jahre. Ältester Sohn Odrigs und Rhaennas. Arbeitet an Futteräckern, Getreide und Heuernte.'),
  member('ffionna-halenrhyd', 'Ffionna', 'female', 1716, 'hof', 'Gemüse und Hofhaushalt', '24 Jahre. Cynradds Gemahlin und Mutter Eirwennas. Betreut Küchengarten und Vorratsverarbeitung.', { spouse: true, houseId: '' }),
  member('mairfena-halenrhyd', 'Mairfena Halenrhyd', 'female', 1718, 'hof', 'Saatgut und Erntevorräte', '22 Jahre. Tochter Odrigs und Rhaennas. Unterstützt Feldbau und die getrennte Lagerung der Ernte.'),
  member('dewrann-halenrhyd', 'Dewrann Halenrhyd', 'male', 1721, 'hof', 'Viehpflege', '19 Jahre. Sohn Odrigs und Rhaennas. Betreut Rinder, Schafe und die alltäglichen Stallarbeiten.'),
  member('gwenrith-halenrhyd', 'Gwenrith Halenrhyd', 'female', 1724, 'hof', 'Ausbildung im Hofhaushalt', '16 Jahre. Hilft bei überschaubaren Aufgaben und lernt Vorratshaltung unter Aufsicht.'),
  member('eirwenna-halenrhyd', 'Eirwenna Halenrhyd', 'female', 1737, 'hof', 'Kind im Familienhaushalt', '3 Jahre. Tochter Cynradds und Ffionnas; ohne Arbeitspflichten.')
]);
export const HALENRHYD_COUPLES = Object.freeze([
  ['eltern', 'idren-halenrhyd', 'branessa-halenrhyd', ['gorweth-halenrhyd', 'odrig-halenrhyd', 'bryndor-halenrhyd']],
  ['stadt', 'gorweth-halenrhyd', 'eirfena-halenrhyd', ['rhydor-halenrhyd', 'cerydd-halenrhyd', 'talwern-halenrhyd', 'eilrann-halenrhyd']],
  ['land', 'bryndor-halenrhyd', 'melyssa-halenrhyd', ['brialeth-halenrhyd', 'odrann-halenrhyd', 'gwelric-halenrhyd', 'neryssa-halenrhyd']],
  ['hof', 'odrig-halenrhyd', 'rhaenna-halenrhyd', ['cynradd-halenrhyd', 'mairfena-halenrhyd', 'dewrann-halenrhyd', 'gwenrith-halenrhyd']],
  ['rhydor', 'rhydor-halenrhyd', 'gwenessa-halenrhyd', ['iffryn-halenrhyd', 'enora-halenrhyd']],
  ['cynradd', 'cynradd-halenrhyd', 'ffionna-halenrhyd', ['eirwenna-halenrhyd']]
]);
export const MAELRIG_CAEFFYN = Object.freeze({ id: 'maelrig-caeffyn', name: 'Maelrig Caeffyn', sex: 'male', birth: '1678', death: '', status: 'alive',
  familyId: 'haus-caeffyn', houseId: 'house-caeffyn', worldPersonId: 'person--haus-caeffyn--maelrig-caeffyn', portrait: STUD_PORTRAITS['maelrig-caeffyn'],
  title: 'Standortleiter · Rhosmeres Rösser – Gwynthor',
  notes: '62 Jahre. Kräftig gebauter älterer Pferdezüchter und Pferdekenner mit grauem Haar und grauem Bart aus dem Ährental. Bei Rhosmeres Rösser ausgebildet, betreute er über viele Jahre kleinere Niederlassungen, bevor er den großen Standort in Gwynthor übernahm. Er verbindet genaue Abstammungsprüfung mit ruhiger Ausbildung und handelt Partnerschaften mit Zuchtbetrieben und deren Lehnsherren aus. Kyria Aurdden ist seine Frau; sie verantwortet die Finanzen des Standorts. Das Paar hat noch keine Kinder.' });
