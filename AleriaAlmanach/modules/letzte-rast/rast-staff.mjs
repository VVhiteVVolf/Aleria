import { RAST_ART, VANN_PEOPLE } from './rast-people.mjs';

const staff = (key, name, sex, age, role, appearance) => Object.freeze({ key, name, sex, birth: String(1740-age), role, bio: role,
  portrait: `${RAST_ART}/staff/${key}.png`, appearance });
export const RAST_STAFF = Object.freeze([
  staff('cadoc', 'Cadoc', 'male', 49, 'Küchenmeister · Hausmenü und warme Küche', '49-year-old Cenyri man, broad muscular face, short natural reddish-brown hair, green eyes, tidy reddish-brown beard. Hair, eyebrows, moustache and beard all have the SAME reddish-brown base color, no grey temples or multicolor gradients. Ivory medieval cook tunic, dark green apron, no chef hat. Standing turned left, arms naturally at sides.'),
  staff('tegwen', 'Tegwen', 'female', 37, 'Erste Kellnerin · Speisesaal', '37-year-old Cenyri woman, tall slender build, long copper-red hair braided into a low knot, blue eyes, long face and pronounced straight nose. Elegant modest burgundy medieval serving gown, cream linen apron and collar. Standing three-quarter right, slight welcoming smile, arms relaxed.'),
  staff('nerys', 'Nerys', 'female', 26, 'Kellnerin · Salons', '26-year-old Cenyri woman, brown hair gathered into a crown braid, green eyes, round face, freckles and bright calm expression. Forest-green medieval serving dress, spotless ivory apron, simple brass clasp. Standing facing almost front with a natural slight head tilt, hands low.'),
  staff('ffion', 'Ffion', 'female', 22, 'Kellnerin · Abendtische', '22-year-old adult Cenyri woman, shoulder-length wavy dark auburn hair pinned back, brown eyes, small sharp nose and soft amused smile. Burgundy and cream modest medieval serving dress, plain linen apron. Standing three-quarter left, hands relaxed, no objects.'),
  staff('gareth', 'Gareth', 'male', 32, 'Erster Kellner · Weinservice', '32-year-old Cenyri man, lean oval face, dark brown short side-parted hair, blue eyes, clean shaven, composed expression. Dark green medieval doublet, ivory shirt, narrow burgundy sash. Standing frontal, one arm loosely behind his back, no objects.'),
  staff('ifor', 'Ifor', 'male', 24, 'Kellner · Speisesaal und Gesellschaften', '24-year-old Cenyri man, sturdy broad nose, tousled copper-red hair, green eyes, short auburn stubble and friendly smile. Burgundy medieval doublet over cream shirt, dark apron at waist. Standing slightly turned right, arms at sides, no props.'),
  staff('emlyn', 'Emlyn', 'male', 45, 'Stallmeister · Gastpferde und Kutschen', '45-year-old Cenyri man, lanky build, weathered narrow face, long brown hair in a short low tail with greying temples, brown eyes, long sideburns and otherwise clean shaven. Olive wool medieval tunic, simple brown leather vest. Standing relaxed three-quarter left, no tools.'),
  staff('gwilym', 'Gwilym', 'male', 42, 'Wachführer · Eingang und Nacht', '42-year-old Cenyri man, stocky square face, dark red cropped hair, blue eyes, thick short squared beard, small scar over left eyebrow. Dark navy padded medieval coat with brown leather belt and modest burgundy shoulder cloth, no weapon. Standing frontal with a patient neutral expression.')
]);
const member = p => ({ id: `rast-${p.key}`, portrait: p.portrait, title: p.name, subtitle: p.role, text: p.bio });
const people = new Map([...VANN_PEOPLE, ...RAST_STAFF].map(p => [p.key,p]));
const level = (label, ...keys) => ({ label, nodes: keys.map(key => member(people.get(key))) });
const vacancy = (key, role) => ({ id: `rast-frei-${key}`, portrait: '', title: 'Freier Platz', subtitle: role, text: 'Dieser einzelne Posten ist noch unbesetzt.' });
const vacancies = (label, jobs) => ({ label, nodes: jobs.map(([id,role]) => vacancy(id,role)) });
const tree = (id,label,levels) => ({ id, label, parentTreeId: '', levels });

export function buildRastHierarchy(source) {
  return { ...structuredClone(source), treeDisplayMode: 'tabs', portraitScale: 115,
    eyebrow: 'Celtigerns Letzte Rast', subtitle: 'Die Menschen unter dem alten Dach',
    centerLabel: 'Haus Vann · Tafel und Herberge', motto: 'Dem Gast das Beste.',
    emblem: `${RAST_ART}/references/schild.png`, sideImage: `${RAST_ART}/scenes/gedeckte-tafel.png`,
    details: source.details.map(d => d.label === 'Angestellte' ? {...d,value:'Rund sechzig Beschäftigte · ausgewählte Personen und freie Einzelposten im Hausbuch'} : d),
    trees: [
      tree('fuehrung','Führung', [level('Inhaber','brenn','madoc'),level('Hausleitung','seren','cadeyrn'),level('Kontor und Nachwuchs','meleri','aneirin','gwenna','rhys'),vacancies('Schreibstube',[['schreiber','Schreibgehilfe · Rechnungen']])]),
      tree('ausschank','Ausschank & Tafel', [level('Tischdienst und Bankette','angharad'),level('Erste Kellnerin','tegwen'),level('Kellnerinnen und Kellner','nerys','ffion','gareth','ifor'),level('Keller und Lieferanten','owain'),vacancies('Weitere Einzelposten',[['keller','Kellergehilfe'],['service','Kellner oder Kellnerin · weiterer Posten'],['schank','Schankwirt · Ausschank']])]),
      tree('herberge','Herberge', [level('Zimmer und Empfang','edern','elowen','enid'),level('Hauswäsche','lowri'),vacancies('Kammerdienst',[['stube1','Stubenmagd · unteres Geschoss'],['stube2','Stubenmagd · oberes Geschoss'],['waesche','Wäschegehilfin'],['hausbursche','Hausbursche · Gepäck']])]),
      tree('kueche','Küche', [level('Küchenmeister','cadoc'),vacancies('Eigene Fachposten',[['sauce','Koch oder Köchin · Saucen'],['fisch','Koch oder Köchin · Fisch'],['backen','Bäcker oder Bäckerin · Pasteten und Süßspeisen'],['kalt','Küchengehilfe · kalte Küche'],['spuele','Spülkraft']])]),
      tree('stall','Stallungen', [level('Stallmeister','emlyn'),vacancies('Hof und Pferde',[['stall1','Stallknecht · Gastpferde'],['stall2','Stallknecht · Futter und Einstreu'],['kutsche','Kutscher · bestellte Fahrten']])]),
      tree('sicherheit','Sicherheit', [level('Wachführer','gwilym'),vacancies('Einzelne Wachposten',[['tor','Hauswache · Eingang'],['nacht','Hauswache · Nacht'],['hof','Hauswache · Lieferhof']])])
    ], levels: [], footerNote: 'Eirlys lebt nach ihrer Heirat im Haus Raves. Kinder unter zwölf Jahren tragen keine Dienstposten; Rhys lernt im Kontor.' };
}
