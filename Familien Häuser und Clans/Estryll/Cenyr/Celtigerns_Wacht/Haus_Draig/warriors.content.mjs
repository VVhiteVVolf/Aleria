const assets = 'Estryll/Cenyr/Celtigerns_Wacht/Haus_Draig/assets/krieger';
const warrior = (id, name, description) => ({ name, description, image: `${assets}/${id}.png` });

export const DRAIG_WARRIOR_GALLERY = {
  title: 'Krieger des Hauses Draig',
  introduction: 'Ritter, Waffenknechte und die persönliche Leibgarde tragen den Wyvern des Hauses. Die Tafeln zeigen ihre unterschiedlichen Dienste sowie Knappen und Pagen auf dem Weg in das Hausgefolge. Cochllamwyr und Ortswachen gehören zum gesonderten städtischen Wachdienst.',
  entries: [
    warrior('draig-uchelwyr', 'Uchelwyr', 'Ritter des Hauses · im Sattel und unter dem Wyvern.'),
    warrior('draig-helwyr', 'Helwyr', 'Eine der cenyrischen Ritterklassen im Dienst der Draigs.'),
    warrior('draig-teulu', 'Teulu', 'Ritter des Hauses · mit dem Schwert im Dienst des Grafen.'),
    warrior('draig-cantref', 'Cantref', 'Ritter des Hauses · mit der Lanze unter seinem Banner.'),
    warrior('draig-barddwyr', 'Barddwyr', 'Eine der cenyrischen Ritterklassen im Hausgefolge.'),
    warrior('draig-derwyn-v1', 'Derwyn', 'Heiliger Ritter und Paladin im Zeichen des Heiligen Grals.'),
    warrior('draig-ritter-zur-see', 'Ritter zur See', 'Ritterlicher Dienst auf den Schiffen des Hauses.'),
    warrior('draig-berittener-waffenknecht', 'Berittener Waffenknecht', 'Milwr · professioneller Waffendienst zu Pferde.'),
    warrior('draig-bogenschuetze', 'Bogenschützen-Waffenknecht', 'Milwr · ausgebildeter Waffenknecht mit dem Bogen.'),
    warrior('draig-mariner-waffenknecht', 'Mariner Waffenknecht', 'Milwr · professioneller Waffendienst auf See.'),
    warrior('draig-leibgardist-v1', 'Leibgardist', 'Handverlesener persönlicher Wächter · Teil der Draig-Hausmacht.'),
    warrior('draig-knappe', 'Knappe', 'In ritterlicher Ausbildung · auch Bürgerlichen steht dieser Weg offen.'),
    warrior('draig-page', 'Page', 'Junger Angehöriger des Hausgefolges in Dienst und Unterweisung.'),
  ],
};
