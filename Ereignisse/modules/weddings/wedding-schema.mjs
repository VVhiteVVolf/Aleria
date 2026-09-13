export const WEDDING_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const WEDDING_MAX_BYTES = 1024 * 1024;
export const WEDDING_GROUPS = Object.freeze(['ceremony', 'house-one', 'house-two', 'individual', 'delegations']);
export const WEDDING_STATUS = Object.freeze({ planning: 'In Vorbereitung', scheduled: 'Termin steht fest', celebrated: 'Gefeiert', cancelled: 'Abgesagt' });
export const ATTENDANCE = Object.freeze({ planned: 'Vorgemerkt', invited: 'Eingeladen', confirmed: 'Zugesagt', declined: 'Abgesagt' });
export const GIFT_STATUS = Object.freeze({ open: 'Noch offen', planned: 'Vorgemerkt', received: 'Überreicht', later: 'Wird nachgereicht' });

const fail = message => { throw Object.assign(new Error(message), { status: 400 }); };
export function validateWeddingId(value) {
  if (typeof value !== 'string' || value.length > 80 || !WEDDING_ID.test(value)) fail('Die Seitenadresse darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.');
  return value;
}
function text(value, max = 300, required = false) {
  if (typeof value !== 'string' || value.length > max) fail(`Ungültiger Text oder mehr als ${max} Zeichen.`);
  const result = value.trim();
  if (required && !result) fail('Bitte alle Pflichtfelder ausfüllen.');
  return result;
}
function choice(value, options) { if (!options.includes(value)) fail('Ungültige Auswahl.'); return value; }
function optionalNumber(value, max) {
  if (value === null) return null;
  if (!Number.isInteger(value) || value < 1 || value > max) fail('Die Datums- oder Personenangabe liegt außerhalb des gültigen Bereichs.');
  return value;
}
export function validateWeddingMedia(value) {
  const path = text(value, 1200);
  if (!path) return '';
  if (/^https:\/\//i.test(path)) {
    try { const url = new URL(path); if (url.username || url.password) fail('Bildadresse enthält Zugangsdaten.'); return url.href; } catch { fail('Ungültige Bildadresse.'); }
  }
  if (!/^assets\/[a-zA-Z0-9/_-]+\.(png|webp|jpe?g|svg)$/i.test(path) || path.includes('..')) fail('Bitte eine HTTPS-Bildadresse oder einen Bildpfad unter assets/ verwenden.');
  return path;
}
export function validateWeddingPortrait(value) {
  const path = text(value,1200,true);
  if (/^\.\.\/Stammbäume\/assets\/images\/portraits\/[a-zA-Z0-9/_-]+\.(png|webp|jpe?g)$/i.test(path)) return path;
  return validateWeddingMedia(path);
}
export function validateWeddingPortraits(value = []) {
  return entries(value,8,person => ({name:text(person.name,200,true),image:validateWeddingPortrait(person.image),position:choice(person.position || 'top',['top','upper','center','bottom'])}));
}
function time(value) { const result = text(value, 5); if (result && !/^([01]\d|2[0-3]):[0-5]\d$/.test(result)) fail('Uhrzeiten bitte als HH:MM eintragen.'); return result; }
function entries(items, limit, normalize) {
  if (!Array.isArray(items) || items.length > limit) fail(`Diese Liste darf höchstens ${limit} Einträge haben.`);
  const result = items.map(item => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) fail('Ungültiger Listeneintrag.');
    return { id: validateWeddingId(item.id), ...normalize(item) };
  });
  if (new Set(result.map(item => item.id)).size !== result.length) fail('Einträge benötigen eindeutige Kennungen.');
  return result;
}
export function validateWedding(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Ungültige Hochzeitsdaten.');
  const date = input.date || {};
  const result = {
    title: text(input.title, 180, true), subtitle: text(input.subtitle, 250), status: choice(input.status, Object.keys(WEDDING_STATUS)),
    location: text(input.location, 200), region: text(input.region, 200), intro: text(input.intro, 5000), background: text(input.background, 7000), notes: text(input.notes, 7000),
    date: { year: optionalNumber(date.year, 100000), month: optionalNumber(date.month, 13), day: optionalNumber(date.day, 36), time: time(date.time) },
    image: validateWeddingMedia(input.image),
    couple: entries(input.couple, 2, person => ({ name: text(person.name, 140, true), title: text(person.title, 120), house: text(person.house, 140), crest: validateWeddingMedia(person.crest) })),
    guests: entries(input.guests, 500, guest => ({ group: choice(guest.group, WEDDING_GROUPS), name: text(guest.name, 200, true), role: text(guest.role, 200), house: text(guest.house, 140), rank: text(guest.rank, 180), task: text(guest.task, 1600), gift: text(guest.gift, 1600), giftStatus: choice(guest.giftStatus, Object.keys(GIFT_STATUS)), attendance: choice(guest.attendance, Object.keys(ATTENDANCE)), count: optionalNumber(guest.count, 10000), leader: text(guest.leader ?? '',160), emblem: validateWeddingMedia(guest.emblem ?? ''), portraits:validateWeddingPortraits(guest.portraits) })),
    schedule: entries(input.schedule, 100, item => ({ title: text(item.title, 180, true), time: time(item.time), location: text(item.location, 200), description: text(item.description, 2400) })),
    tasks: entries(input.tasks, 200, item => {
      if (typeof item.done !== 'boolean') fail('Ungültiger Aufgabenstatus.');
      return { title: text(item.title, 220, true), owner: text(item.owner, 160), notes: text(item.notes, 2400), done: item.done };
    })
  };
  if (result.couple.length !== 2) fail('Bitte beide Brautpersonen angeben.');
  if (result.date.month && !result.date.year || result.date.day && !result.date.month || result.date.time && !result.date.day) fail('Bitte das Datum vervollständigen oder unbestimmte Angaben leer lassen.');
  if (result.status === 'scheduled' && !result.date.day) fail('Für einen festen Termin werden Jahr, Monat und Tag benötigt.');
  return result;
}
export function validateWeddingEnvelope(input) {
  if (!input || input.schemaVersion !== 1 || !Number.isSafeInteger(input.revision) || input.revision < 0) fail('Ungültige Hochzeitsfassung.');
  return { schemaVersion: 1, id: validateWeddingId(input.id), revision: input.revision, updatedAt: input.updatedAt ? text(input.updatedAt, 80) : null, wedding: validateWedding(input.wedding) };
}
export function weddingPageHref(id) { return id === 'tudwal-revelyn' ? 'Hochzeiten/Haus-Draig-und-Penderyn.html' : `hochzeit.html?id=${encodeURIComponent(validateWeddingId(id))}`; }
export function weddingRegistryEntry(envelope) {
  const { id, revision, updatedAt, wedding } = validateWeddingEnvelope(envelope);
  return { id, title: wedding.title, status: wedding.status, date: wedding.date, revision, updatedAt, page: weddingPageHref(id) };
}
