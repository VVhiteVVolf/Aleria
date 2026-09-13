import { WEDDING_STATUS, ATTENDANCE, GIFT_STATUS } from './wedding-schema.mjs';
import { weddingText as e, weddingGroups } from './wedding-model.mjs';

function field(name, label, value = '', { type = 'text', options, required = false, wide = false, max = 300 } = {}) {
  const attributes = `name="${name}"${required ? ' required' : ''}`;
  const control = options ? `<select ${attributes}>${Object.entries(options).map(([id, title]) => `<option value="${e(id)}"${String(value ?? '') === id ? ' selected' : ''}>${e(title)}</option>`).join('')}</select>`
    : type === 'textarea' ? `<textarea ${attributes} maxlength="${max}" rows="4">${e(value)}</textarea>`
    : type === 'checkbox' ? `<input type="checkbox" ${attributes}${value ? ' checked' : ''}>`
    : `<input type="${type}" ${attributes} value="${e(value)}"${type === 'number' ? ` min="1" max="${max}" step="1"` : ` maxlength="${max}"`}>`;
  return `<label class="${wide ? 'wedding-form-wide' : ''}${type === 'checkbox' ? ' wedding-checkbox-label' : ''}">${type === 'checkbox' ? control : ''}<span>${label}${required ? ' *' : ''}</span>${type !== 'checkbox' ? control : ''}</label>`;
}
const area = (name, label, value, max = 2400) => field(name, label, value, { type: 'textarea', wide: true, max });
export function weddingDetailsFields(wedding, { creating = false, calendar } = {}) {
  return `${creating ? field('id', 'Seitenadresse (z. B. anna-und-owain)', '', { required: true, max: 80, wide: true }) : ''}
    ${field('title', 'Titel des Festbuchs', wedding.title, { required: true, wide: true, max: 180 })}${field('subtitle', 'Untertitel', wedding.subtitle, { wide: true, max: 250 })}
    ${field('status', 'Stand der Hochzeit', wedding.status, { options: WEDDING_STATUS })}${field('image', 'Titelbild · HTTPS oder assets/…', wedding.image, { max: 1200 })}
    ${wedding.couple.map((person, i) => `<h3>${i === 0 ? 'Erste' : 'Zweite'} Brautperson</h3>${field(`name${i}`, 'Name', person.name, { required: true, max: 140 })}${field(`title${i}`, 'Titel / Anrede', person.title, { max: 120 })}${field(`house${i}`, 'Haus', person.house, { max: 140 })}${field(`crest${i}`, 'Wappen · HTTPS oder assets/…', person.crest, { max: 1200 })}`).join('')}
    <h3>Ort & Termin</h3>${field('location', 'Ort', wedding.location, { max: 200 })}${field('region', 'Region', wedding.region, { max: 200 })}
    ${field('year', 'Jahr (leer = offen)', wedding.date.year, { type: 'number', max: 100000 })}${field('month', 'Monat', wedding.date.month, { options: { '': 'Noch offen', ...Object.fromEntries(calendar.months.map((name, i) => [i + 1, name])) } })}
    ${field('day', 'Tag (1–36)', wedding.date.day, { type: 'number', max: 36 })}${field('time', 'Uhrzeit (leer = offen)', wedding.date.time, { type: 'time' })}
    <h3>Die Geschichte des Festes</h3>${area('intro', 'Einführung auf der Titelseite', wedding.intro, 5000)}${area('background', 'Das Bündnis', wedding.background, 7000)}${area('notes', 'Notizen zum Fest', wedding.notes, 7000)}`;
}
export function readWeddingDetails(form, wedding) {
  const data = new FormData(form), value = key => String(data.get(key) ?? '').trim();
  const number = key => value(key) ? Number(value(key)) : null;
  return { ...wedding, ...Object.fromEntries(['title','subtitle','status','image','location','region','intro','background','notes'].map(key => [key,value(key)])),
    couple: wedding.couple.map((person,i) => ({ ...person, ...Object.fromEntries(['name','title','house','crest'].map(key => [key,value(`${key}${i}`)])) })),
    date: { year: number('year'), month: number('month'), day: number('day'), time: value('time') } };
}
export function weddingEntryFields(list, item, wedding) {
  if (list === 'guests') return `${field('name','Name / Namen',item.name,{required:true,max:200,wide:true})}${field('group','Gesellschaft',item.group || 'individual',{options:weddingGroups(wedding)})}${field('attendance','Teilnahme',item.attendance || 'planned',{options:ATTENDANCE})}${field('role','Rolle beim Fest',item.role,{max:200})}${field('rank','Rang / Titel',item.rank,{max:180})}${field('house','Haus',item.house,{max:140})}${field('count','Personenzahl (optional)',item.count,{type:'number',max:10000})}${area('task','Aufgabe beim Fest',item.task,1600)}${area('gift','Geschenk / Beitrag',item.gift,1600)}${field('giftStatus','Stand der Gabe',item.giftStatus || 'open',{options:GIFT_STATUS})}${field('leader','Oberhaupt (bei Delegationen)',item.leader,{max:160})}${field('emblem','Wappen / Symbol · HTTPS oder assets/…',item.emblem,{max:1200,wide:true})}`;
  if (list === 'schedule') return `${field('title','Programmpunkt',item.title,{required:true,max:180,wide:true})}${field('time','Uhrzeit (leer = offen)',item.time,{type:'time'})}${field('location','Ort',item.location,{max:200})}${area('description','Beschreibung',item.description)}`;
  if (list === 'tasks') return `${field('title','Aufgabe',item.title,{required:true,max:220,wide:true})}${field('owner','Verantwortlich',item.owner,{max:160})}${field('done','Erledigt',item.done,{type:'checkbox'})}${area('notes','Notizen',item.notes)}`;
  throw new Error('Unbekannte Liste.');
}
export function readWeddingEntry(form, list, id) {
  const data = new FormData(form), values = Object.fromEntries(data);
  if (list === 'guests') values.count = values.count ? Number(values.count) : null;
  if (list === 'tasks') values.done = data.has('done');
  return { id, ...values };
}
