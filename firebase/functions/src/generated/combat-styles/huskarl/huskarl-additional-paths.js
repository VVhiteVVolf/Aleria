import { additionalHuskarlSpec } from './huskarl-additional-lessons.js';

const paths = {
  skjoldr: {
    wall: [['Fesselstoß der Linie','flexible'],['Schild über der Schulter','shield'],['Eisenkreuz am Waffenarm','paired'],['Wache der Engstelle','shield'],['Ruhe hinter der langen Klinge','longblade'],['Stand des Torhüters','shield']],
    advance: [['Schneide an der Flanke','flexible'],['Zwei Klingen voran','paired'],['Langer Keilhieb','longblade'],['Schildkante am Knie','shield'],['Hieb durch die Bresche','flexible'],['Eisen des Vorreiters','longblade']]
  },
  thegnar: {
    wall: [['Speer am Wegsaum','lance'],['Sattelhut der Wache','rider'],['Abgesessene Klingenbindung','rider'],['Wache am Zügel','rider'],['Atem der langen Patrouille','rider'],['Schild an der Wegenge','shield']],
    advance: [['Reiterhieb im Wechsel','rider'],['Lanze am Außenbogen','lance'],['Stoß des Wegbereiters','lance'],['Abgesessener Fesselhieb','rider'],['Keil an der Weggabel','lance'],['Hieb vor dem Banner','rider']]
  },
  skeidr: {
    wall: [['Haken der Deckwache','deck'],['Sax hinter der Schanz','sidearm'],['Klammer an der Reling','deck'],['Eiserner Halt am Mast','deck'],['Atem nach der Woge','sidearm'],['Wacht über dem Kiel','deck']],
    advance: [['Gezielter Küstenwurf','throwing'],['Klinge über der Planke','sidearm'],['Enterhammer der Vorhut','deck'],['Axtbart im Gedränge','deck'],['Wurf zur letzten Reling','throwing'],['Hieb des Sturmdecks','deck']]
  },
  skjaldr: {
    wall: [['Axtsperre der Fessel','flexible'],['Gekreuzte Ruhe','twinAxes'],['Lange Schaftbindung','greatAxe'],['Schildwacht im Zorn','shield'],['Gezügelter Atem','flexible'],['Eisenhut des Schildbeißers','twinAxes']],
    advance: [['Doppelaxtfinte','twinAxes'],['Langer Axtschritt','greatAxe'],['Spalter der Vorhut','greatAxe'],['Zwillingsgriff am Bein','twinAxes'],['Hieb des gebündelten Zorns','greatAxe'],['Zwei Schneiden im Durchbruch','twinAxes']]
  },
  skytte: {
    wall: [['Speersperre im Dickicht','spear'],['Waldhut der Klinge','sidearm'],['Sax an der Sehne','sidearm'],['Grenzwacht am Speer','spear'],['Ruhe der langen Pirsch','bow'],['Deckung des Grenzhüters','sidearm']],
    advance: [['Pfeil an der Deckungskante','bow'],['Speerschritt des Jägers','spear'],['Schuss des vollen Auszugs','bow'],['Sax am Wildpfad','sidearm'],['Stoß der Winterjagd','spear'],['Pfeil des Morgenwinds','bow']]
  }
};
const levels = [9,11,13,15,17,20];
const modes = {wall:['slow','brace','bind','bulwark','resolve','bulwark'],advance:['feint','advance','heavy','slow','heavy','heavy']};

export function getAdditionalHuskarlPathLessons(classId) {
  if (classId === 'hird-maid') return [
    [9,'Speer der Nachtwache','spear','slow'],[10,'Atem vor dem Hoftor','militia','resolve'],
    [12,'Schild am Kornspeicher','shield','bulwark'],[14,'Hieb des Dorfhüters','militia','heavy'],
    [15,'Stand der erfahrenen Hird','shield','brace'],[16,'Speer der Grenzhöfe','spear','heavy'],
    [18,'Bindung des alten Wächters','militia','bind'],[20,'Letzte Wache der Heimat','shield','bulwark']
  ].map(([level,...option],index) => ({path:'militia',...additionalHuskarlSpec(option,level,`hirdwacht-wahl-${index + 1}`)}));
  return Object.entries(paths[classId] || {}).flatMap(([path, entries]) => entries.map(([name,weapon],index) => {
    const mode = classId === 'thegnar' && path === 'advance' && index !== 3
      ? `mounted${modes[path][index][0].toUpperCase()}${modes[path][index].slice(1)}` : modes[path][index];
    return {path,...additionalHuskarlSpec([name,weapon,mode],levels[index],`${path}-wahl-${index + 1}`)};
  }));
}
