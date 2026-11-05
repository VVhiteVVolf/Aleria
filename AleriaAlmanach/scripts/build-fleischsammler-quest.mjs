// Deliberately depends only on the public notice and neutral place/family index.
// No private character dossier, case file or portrait is an input.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildFleischsammlerNotices } from '../../Anzeigetafeln/tools/quests/fleischsammler-wanted.mjs';
import { FLEISCHSAMMLER_LOCALITIES, FLEISCHSAMMLER_FAMILIES_INDEX } from '../../Stammbäume/assets/js/data/gwynthor-fleischsammler/localities.mjs';
import { normalizeQuestDossier } from '../modules/quests/quest-dossier-model.js';
import { ARGALL_CAPTAIN_QUEST_CONTACT } from '../modules/fleischsammler-argall/household.mjs';

export async function buildFleischsammlerQuest({ check = false } = {}) {
  const mapPath = 'Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis';
  const root = new URL('../../', import.meta.url);
  const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
  const [map, crop, notices] = await Promise.all([
    read(`${mapPath}/data.json`), read(`${mapPath}/fleischsammler-area.source.json`), buildFleischsammlerNotices()
  ]);
  const mapId = 'cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis';
  const sketch = '/Anzeigetafeln/assets/images/quests/fleischsammler/sinnbild-v1.png';
  const authors = [notices[1], notices[2], notices[0]];
  const descriptions = [
    'Adjutant des Justiziars von Gwynthor. Die Verfügung zur Belohnung verlangt eine Prüfung durch den Hof; bloße Beschuldigungen und unbestätigte Gerüchte genügen nicht.',
    'Netzmeister der Fahndung. Hinweise zum östlichen Bannkreis, zu den späten Abend- und Nachtstunden und zum vergangenen Monat sind unmittelbar an den Hof von Gwynthor zu richten.',
    'Kommandant der Stadtwache von Gwynthor. Söldner, Kopfgeldjäger und andere Suchwillige melden sich zunächst bei ihm; er leitet sie gegebenenfalls an die Fahndung weiter.'
  ];
  const dossier = normalizeQuestDossier({
    tagline: 'Mordserie im östlichen Bannkreis · Täter unbekannt',
    invitation: 'Umsicht ist keine Feigheit. Für die Euren einzustehen ist Pflicht.',
    coverImage: sketch, coverCaption: 'Sinnbild · keine Zeichnung nach Zeugenaussage',
    cardImage: sketch, cardImageStyle: 'avatar', participantsTitle: 'Kontaktpersonen',
    preparation: 'Söldner, Kopfgeldjäger und andere zur Übernahme der Suche bereite Personen melden sich zunächst beim Kommandanten der Stadtwache. Vorhandene Hinweise sind unmittelbar an den Hof von Gwynthor zu richten. Nennt, was Ihr selbst wahrgenommen habt, wo und wann. Kennzeichnet Vermutungen, ungenaue Zeitangaben und fremde Mitteilungen. Frauen sollen nachts nicht allein unterwegs sein; organisiert Begleitung.',
    rewardPromise: 'Drei Goldmünzen für das Auffinden und Zurstreckebringen des Täters; eine Silbermünze für ernsthafte, nachweislich hilfreiche Informationen. Der Hof prüft Identität, Leistung und Anspruch. Eine bloße Beschuldigung oder ein unbestätigtes Gerücht begründet keinen Anspruch. Vorsätzliche Falschaussagen und Täuschungen werden streng geahndet.',
    participants: [...authors.map((notice, index) => {
      const person = notice.media.verfasser;
      return { name: person.name, role: notice.verfasserName.split(' · ').slice(1).join(' · '), description: descriptions[index],
        kind: 'character', recordId: `person--${person.familyId}--${person.personId}`, image: '/'+decodeURI(person.src).replace(/^\.\.\//, ''), profile: '' };
    }), ARGALL_CAPTAIN_QUEST_CONTACT],
    area: { mapId, title: 'Höfe und Landwege im östlichen Bannkreis',
      image: `/${mapPath}/Kartenbilder/display/gwynthor-normal-4096-q90.webp`,
      width: crop.width, height: crop.height, center: crop.center, radius: crop.radius,
      note: 'Die bekannten Taten betreffen das östliche Umland außerhalb der Stadt: Bauernhöfe, Straßen und Felder. Innerhalb Gwynthors ist bislang keine Tätigkeit dieses Mörders festgestellt worden.',
      locations: FLEISCHSAMMLER_LOCALITIES.map(place => {
        const pin = map.state.pins.find(row => row.id === place.pinId);
        if (!pin || !crop.pinIds.includes(pin.id)) throw Error(`Fallort fehlt im Kartenausschnitt: ${place.pinId}`);
        return { name: place.placeName, pinId: pin.id, x: pin.x, y: pin.y };
      }) },
    informationSources: FLEISCHSAMMLER_FAMILIES_INDEX.map(family => ({
      name: `Familie ${family.surname}`, familyId: family.familyId,
      description: 'Örtliche Anlaufstelle im östlichen Bannkreis.',
      image: family.emblem.startsWith('/') ? family.emblem : '/Stammbäume/'+family.emblem,
      profile: `/Stammbäume/Stammbaum.html?family=${family.familyId}&mode=view`,
      placeName: family.placeName, mapId, pinId: family.pinId
    })),
    pois: [], encounters: [], rewardArt: []
  });
  const preparation = { title: 'Der Fleischsammler aus Gwynthors Bannkreis', dossier,
    summary: 'Seit einem Monat werden im östlichen Umland von Gwynthor Frauen ermordet aufgefunden. Der Abgleich der Funde hat eine zusammenhängende Mordserie ergeben. An den Leichnamen fehlen Körperteile; daher der Beiname Fleischsammler. Die Opfer waren sechzehn bis vierunddreißig Jahre alt und fast immer allein spätabends oder nachts unterwegs. Identität, Aussehen, Beweggrund und Zweck der Taten sind unbekannt. Weder Kapuze noch Hackebeil der Skizze sind als Tätermerkmal belegt. Die Stadtwache sichert Gwynthor, die Ortswachen im Umland leisten doppelte Wachgänge und Schichten. Drei Goldmünzen sind für das Auffinden und Zurstreckebringen des Täters ausgesetzt, eine Silbermünze für nachweislich hilfreiche Informationen – jeweils nach amtlicher Prüfung.',
    objectives: [
      { id: 'report-commandant', title: 'Als Suchwillige beim Kommandanten der Stadtwache melden' },
      { id: 'submit-observations', title: 'Eigene Beobachtungen vollständig und ohne Ausschmückung an den Hof melden' },
      { id: 'find-perpetrator', title: 'Den gesuchten Täter auffinden und zur Strecke bringen; Feststellungen durch den Hof prüfen lassen' }
    ], modules: [] };
  const output = `// Generated only from public notices and neutral locality data. Rebuild: node scripts/build-fleischsammler-quest.mjs\nexport const FLEISCHSAMMLER_QUEST_PREPARATIONS = ${JSON.stringify({ 'gwynthor-fleischsammler': preparation }, null, 2)};\n`;
  const target = new URL('../modules/quests/quest-preparations/fleischsammler.generated.js', import.meta.url);
  if (check) { if (await readFile(target, 'utf8') !== output) throw Error('Fleischsammler-Questvorbereitung ist veraltet.'); }
  else await writeFile(target, output);
  return preparation;
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const preparation = await buildFleischsammlerQuest({ check: process.argv.includes('--check') });
  console.log(`${preparation.dossier.participants.length} Kontakte, ${preparation.dossier.area.locations.length} Orte, ${preparation.dossier.informationSources.length} Familienquellen.`);
}
