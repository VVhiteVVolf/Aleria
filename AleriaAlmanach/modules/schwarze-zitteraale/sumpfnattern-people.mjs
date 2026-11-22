const art = '/AleriaAlmanach/assets/schwarze-zitteraale/groups';

export const SUMPFNATTERN_ID = 'zitteraale-gruppe-ii';
export const CADWGAN_ID = 'zitteraale-gruppe-ii-fuehrer';
export const CADWGAN_NAME = 'Cadwgan Bwach';
export const CADWGAN_FAMILY_EMBLEM = `${art}/icons/familie-bwch-v3.png`;
export const BWACH_WARRIOR = `${art}/figures/haus-bwach-ritter-v1.png`;
export const CADWGAN_PORTRAIT = `${art}/portraits/sumpfnattern-gruene-natter-v2.png`;

export const SUMPFNATTERN_LIEUTENANTS = Object.freeze([
  Object.freeze({
    title: 'Erster Leutnant · unbenannt', role: 'Rechte Hand · Wachen und Überfälle',
    portrait: `${art}/portraits/sumpfnattern-leutnant-1-v2.png`,
    appearance: 'Ehemaliger Wachtmeister mit dunkelrotem Haar, ergrauendem Bart und gebrochener Nase. Schwarze Brigantine, grüne Schuppenpartien und schwere Panzerhandschuhe; auf den senkrechten Waffenschaft gestützt.',
    text: 'Koordiniert die zugewiesenen Räuber, Wachen und bewaffneten Überfälle. Vertritt die Gruppenführung bei der Durchsetzung ihrer Befehle.'
  }),
  Object.freeze({
    title: 'Zweiter Leutnant · unbenannt', role: 'Linke Hand · Alchemie und Versorgung',
    portrait: `${art}/portraits/sumpfnattern-alchemist-v1.png`,
    appearance: 'Abtrünniger, exzentrischer Alchemist mit zerzaustem aschblondem Haar, bernsteinfarbenen Augen und runder Brille. Geflickter grüner Mantel, lederne Arbeitskleidung, kleine Fläschchen und ein beunruhigend begeistertes Grinsen.',
    text: 'Verantwortet alchemistische Arbeiten und die zugehörigen Vorräte der Unterbande. Stimmt ihre Verwendung und die Versorgung mit der Gruppenführung ab.'
  })
]);

export const SUMPFNATTERN_GROUP = Object.freeze({
  name: 'Die Sumpfnattern', leaderId: CADWGAN_ID, leaderName: CADWGAN_NAME,
  leaderPortrait: CADWGAN_PORTRAIT,
  banner: `${art}/banners/banner-sumpfnattern-v1.png`,
  emblem: `${art}/icons/icon-sumpfnattern-v1.png`,
  overviewImage: `${art}/scenes/sumpfnattern-lycath-aussen-v1.png`,
  headquartersImage: `${art}/scenes/sumpfnattern-lycath-lager-v1.png`,
  summary: 'Cadwgan Bwach, die Grüne Natter, führt die Sumpfnattern aus den Ruinen Lycaths gegen die Ländereien der Gafyr.',
  motto: 'Eine persönliche Fehde unter fremdem Banner.',
  hierarchyDescription: '<p>Die Grüne Natter führt eine weitgehend eigenständig handelnde Unterbande der Schwarzen Zitteraale. Die rechte Hand koordiniert Räuber und Wachen; die linke Hand verantwortet Alchemie und Versorgung. Das vorbereitete Aufgebot umfasst sechzehn Räuberplätze.</p>',
  lieutenants: SUMPFNATTERN_LIEUTENANTS
});
