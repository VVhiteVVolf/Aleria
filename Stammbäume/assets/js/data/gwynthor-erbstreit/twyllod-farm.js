import { createFamilyPerson, createMarriage, createParentages } from '../family-record-builders.js';

// New household branch, grounded in the already mapped fishery. It does not
// turn the family's small local trade into Eifion's separate merchant fleet.
export const TWYLLOD_FARM = Object.freeze({
  pinId: 'gwynthor-marking-138', name: 'Twyllod-Hof',
  mapPath: 'Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/data.json',
  description: 'Mehrere Fischerhäuser mit eigenem Steg, einer Fischkogge und mehreren kleinen Booten an der Ostküste von Gwynthors Bannkreis. Frischer und geräucherter Fisch für umliegende Höfe, Tavernen und vorbeiziehende Händler. Kleiner, tragfähiger Familienbetrieb ohne große Gewinne.'
});

const member = (id, name, sex, birth, title, notes, options = {}) => createFamilyPerson({
  id, name, sex, birth, title, notes, houseId: 'house-twyllod', ...options
});
export const TWYLLOD_FARM_PEOPLE = Object.freeze([
  member('meirion-twyllod', 'Meirion Twyllod', 'male', '1693', 'Fischer · führt den Twyllod-Hof',
    'Mittlerer Bruder Arians und Eifions. Blieb auf dem Familienhof und übernahm mit Anest die tägliche Bewirtschaftung. Fährt mit der Fischkogge aus, teilt Fangfahrten ein und hält Steg und Boote instand. Der wirtschaftliche Fortbestand des Hofes hebt die frühere Verstoßung Eithnes durch die Familie nicht auf.', { lineageRole: 'head' }),
  member('anest-spouse-twyllod', 'Anest', 'female', '1695', 'Räuchermeisterin und Haushaltsvorsteherin',
    'Meirions Frau. Beaufsichtigt Räuchern, Salzen, Vorräte und Verkauf. Verbindet Fang und Verarbeitung zu einem verlässlichen, bescheidenen Einkommen.', { houseId: '', familyRole: 'married' }),
  member('cledwyn-twyllod', 'Cledwyn Twyllod', 'male', '1717', 'Fischer · führt die kleinen Boote',
    'Ältester Sohn Meirions und Anests. Arbeitet mit den kleinen Küstenbooten und soll den Hof später mittragen. Lebt mit Delyth und dem kleinen Bledri auf dem Hof.'),
  member('delyth-spouse-twyllod', 'Delyth', 'female', '1719', 'Netzmacherin und Fischverkäuferin',
    'Cledwyns Frau. Flickt Netze, führt Fanglisten und verkauft Fisch an die umliegenden Höfe und Tavernen.', { houseId: '', familyRole: 'married' }),
  member('gwenllian-twyllod', 'Gwenllian Twyllod', 'female', '1720', 'Fischverarbeiterin · Verkauf im Umland',
    'Tochter Meirions und Anests. Arbeitet in der Räucherei und hält Kontakt zu den örtlichen Abnehmern. Unverheiratet. Die Verstoßung Eithnes geschah vor ihrer Geburt.'),
  member('dewi-twyllod', 'Dewi Twyllod', 'male', '1725', 'Fischerlehrling',
    'Jüngster Sohn Meirions und Anests. Lernt Netze, Gezeiten und Bootsarbeit; hilft bei Fang, Steg und Transport.'),
  member('bledri-twyllod', 'Bledri Twyllod', 'male', '1739', 'Kind auf dem Twyllod-Hof',
    'Einjähriger Sohn Cledwyns und Delyths; die jüngste Generation des weiterlebenden Fischerzweigs.')
]);
export const TWYLLOD_FARM_MARRIAGES = Object.freeze([
  createMarriage('marriage-meirion-anest-twyllod', 'meirion-twyllod', 'anest-spouse-twyllod', { start: '1715' }),
  createMarriage('marriage-cledwyn-delyth-twyllod', 'cledwyn-twyllod', 'delyth-spouse-twyllod', { start: '1738' })
]);
export const TWYLLOD_FARM_PARENTAGES = Object.freeze([
  ...createParentages(['cledwyn-twyllod', 'gwenllian-twyllod', 'dewi-twyllod'], ['meirion-twyllod', 'anest-spouse-twyllod'], 'marriage-meirion-anest-twyllod'),
  ...createParentages(['bledri-twyllod'], ['cledwyn-twyllod', 'delyth-spouse-twyllod'], 'marriage-cledwyn-delyth-twyllod')
]);
