import { PARTNERSHIP_LABELS } from '../config/family-colors.js';

const STATUS_LABELS = Object.freeze({ active: 'Bestehend', ended: 'Beendet', divorced: 'Geschieden', widowed: 'Verwitwet', secret: 'Geheim' });

export function presentPartnership(partnership) {
  const start = /\d/.test(partnership?.start || '') ? partnership.start : '';
  const end = /\d/.test(partnership?.end || '') ? partnership.end : '';
  return Object.freeze({
    label: PARTNERSHIP_LABELS[partnership?.type] || 'Verbindung',
    status: STATUS_LABELS[partnership?.status] || '',
    period: start && end ? `${start}–${end}` : start ? `ab ${start}` : end ? `bis ${end}` : ''
  });
}
