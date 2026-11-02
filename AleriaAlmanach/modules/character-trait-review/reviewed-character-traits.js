// Explicit editorial decisions, never guesses applied to arbitrary profiles.
export const CHARACTER_TRAIT_REVIEW_VERSION = '2026-11-02-sparse-v1';
export const REVIEWED_CHARACTER_TRAITS = Object.freeze([
  { id: 'ksJQe8Ai4KbRE9jOAvb7', onlineId: 'ksJQe8Ai4KbRE9jOAvb7', name: 'Freya Skald', traits: ['frohnatur', 'buehnenmensch', 'vollbusig'],
    reason: 'Offene Frohnatur, ausdrücklich theatralische und feldunerfahrene Künstlerin; die ausgeprägte Brustform ist bereits als Busenwunder im alten Bogen belegt.', evidence: ['Öffentliche Freya-Biografie: Gesellig und lebensfroh; Theatralisch und exzentrisch; Vertrauensvoll und unerfahren', 'Alter Bogen: freya-busenwunder'] },
  { id: 'FKiXsSWVoV74rTgmpPip', onlineId: 'FKiXsSWVoV74rTgmpPip', name: 'Fenrir Varulv', traits: ['symbiose-varulv-wolf'],
    reason: 'Belegter leiblicher Spross der Varulv-Linie. Nur die bereits ausgearbeitete angeborene Grundprägung; keine neue Verwandlungsfähigkeit und kein Werwolffluch.', evidence: ['Stammbaum haus-varulv/fenrir-varulv: bestätigte biologische Eltern Sleipnir Varulv und Svantje Skaal', 'Autorenfestlegung und Symbiose-Modul: Varulv (Wolf)'] },
  { id: 'oUlhJyX6C4Q69mtLS9u1', onlineId: 'oUlhJyX6C4Q69mtLS9u1', name: 'Asgeir Wolfshorn', traits: ['fit'],
    reason: 'Der ausgearbeitete Bogen belegt ausgeprägte körperliche Kondition: KRF 18, KON 16, geübte Athletik und Körperbeherrschung sowie persönliche Grenzerausbildung.', evidence: ['Bearbeiteter Kampfbogen: Attribute, Fertigkeiten und Grenzer des Dunkelhains'] },
  { id: 'bSYZYAEOwiRgy44f6OmO', onlineId: 'bSYZYAEOwiRgy44f6OmO', name: 'Ylva Wolfshorn', traits: ['faehrtenleser'],
    reason: 'Langjährige Grenzerin und Skytte mit ausgearbeiteter Wildnisausbildung in Überleben, Naturkunde, Wahrnehmung und Tierumgang. Die persönliche Veteranin-Ausbildung bleibt separat erhalten.', evidence: ['Bearbeiteter Kampfbogen: Veteranin des Dunkelhains und ausdrücklich gewählte Wildnisfertigkeiten'] },
  { id: 'q1QtSIug74FzzwUAqWrs', onlineId: 'q1QtSIug74FzzwUAqWrs', name: 'Gawain Draig', traits: ['neugier-vor-vorsicht', 'eigensinn'], removeAbilityIds: ['gawain-muttersoehnchen'], removeConditionIds: ['gawain-strenge-gerueche'],
    reason: 'Belegte Abenteuerneugier und riskanter Übermut; Widerspruch gegen Bevormundung und eigene Ansprüche. Keine pauschale schwere psychologische Zuschreibung. Die alte globale Unsicherheit auf sieben Fertigkeiten entfällt.', evidence: ['Öffentliche Gawain-Biografie: Hungrig auf die Welt; Begabt, aber bequem; seine Bewährung und riskante letzte Angriffsfolge', 'Alter Bogen: gawain-muttersoehnchen'] },
  { id: 'person--haus-draig--gethin-1722-draig', onlineId: 'person--haus-draig--gethin-1722-draig', name: 'Gethin Draig', traits: [],
    reason: 'Nur allgemeine Ritter-, Kultur- und Ausbildungsangaben belegt. Keine individuelle Persönlichkeit, Krankheit oder besondere Begabung erfinden.', evidence: ['Bearbeiteter Kampfbogen ohne Bio; alte drei generische Herkunftseinträge'] },
  { id: '6atOllMA637Z2VNAZAxf', onlineId: '6atOllMA637Z2VNAZAxf', name: 'Gethin', traits: [],
    reason: 'Separater vorhandener Bogen ohne individuelle Biografie. Keine Zusammenführung mit Gethin Draig und keine spekulative Traitvergabe.', evidence: ['Eigenständige Dokument-ID und eigener bearbeiteter Kampfbogen'] },
  { id: 'HjDXMMexahez1G0rJrBE', onlineId: 'HjDXMMexahez1G0rJrBE', name: 'Kane Draig', traits: [],
    reason: 'Der Bogen belegt Ausbildung und Grundwerte, aber keine notwendige individuelle Prägung. Niedrige WEI ist keine Begründung für eine kognitive Einschränkung.', evidence: ['Bearbeiteter Kampfbogen ohne persönliche Bio; alte generische Herkunftseinträge'] },
  { id: 'y7MBxDiAaesbWHBtmw5Q', onlineId: 'y7MBxDiAaesbWHBtmw5Q', name: 'Rhiannon Draig', traits: ['arkan-geschult'],
    reason: 'Myrddins persönliche Lehrlingin mit ausdrücklich hervorragender arkaner Ausbildung. Hohe INT allein begründet weder Genie noch eidetisches Gedächtnis.', evidence: ['Bio: Myrddins Lehrling und künftige Hofzauberin', 'Alter Bogen: Hervorragende Arkane Ausbildung'] },
  { id: 'tmfBA2zPTc88EMMGkyyA', onlineId: 'tmfBA2zPTc88EMMGkyyA', name: 'Duncan Gafyr', traits: ['taktisches-gespuer'],
    reason: 'Die belegte Marschallerfahrung und das ausdrückliche Lesen von Formationen begründen taktisches Gespür. Meisterschaft, Rang und Mentorrolle bleiben in Ausbildung, Arsenal, Aura und Prosa.', evidence: ['Bio und alter Bogen: Ehemaliger Marschall; Schlachtfelder, Befehlswege und Formationen'] },
  { id: 'gildas-gafyr', onlineId: 'person--haus-gafyr--gildas-gafyr', name: 'Gildas Gafyr', traits: ['wachsam', 'eigensinn'], removeConditionIds: ['gildas-vorschnelles-urteil'],
    reason: 'Ausdrücklich frühes Prüfen von Ort und Ausrüstung; strenger Eigenanspruch und beharrliches Urteilen. Keine angeborene Sonderbegabung entgegen seiner Biografie.', evidence: ['Öffentliche Gildas-Biografie: Vorbereitung, Beharrlichkeit, Urteilend und Unnachsichtig', 'Alter Bogen: Pünktlich heißt zu früh'] },
  { id: 'person--haus-neidr--guinevere-neidr', onlineId: 'person--haus-neidr--guinevere-neidr', name: 'Guinevere Neidr', traits: ['spuernase', 'scharfe-augen'],
    reason: 'Die beiden individuellen Altmerkmale belegen verborgene Details und ausdrücklich scharfe Sicht. Die breiten alten Wissens- und Angriffsboni werden nicht zusätzlich weitergeführt.', evidence: ['Alter Bogen: Scharfsinnig und Jägerauge'] },
  { id: 'person--haus-saethwyr--nudd-saethwyr', onlineId: 'person--haus-saethwyr--nudd-saethwyr', name: 'Nudd Saethwyr', traits: ['eigensinn', 'ritualgebunden'],
    reason: 'Ausdrücklich dogmatische, schwer revidierbare Urteile und ernsthaft gelebte tägliche religiöse Pflichten. Keine kognitive Erkrankung aus Engstirnigkeit ableiten.', evidence: ['Öffentliche Nudd-Biografie: Gottesfürchtig, Dogmatisch und Engstirnig'] },
  { id: 'person--haus-wyrm--gais-wyrm', onlineId: 'person--haus-wyrm--gais-wyrm', name: 'Gais Wyrm', traits: ['silberzunge', 'eigensinn'],
    reason: 'Ausdrücklich gewinnende Gesprächsführung und Gesandtenausbildung sowie pedantisches Festhalten an Umgangsformen. Eitelkeit allein begründet keine neue schwere psychologische Prägung.', evidence: ['Öffentliche Gais-Biografie: Charismatisch und Pedantisch'] }
]);
export function reviewedCharacterTraitAssignment(id) {
  return REVIEWED_CHARACTER_TRAITS.find(row => row.id === id || row.onlineId === id) || null;
}
