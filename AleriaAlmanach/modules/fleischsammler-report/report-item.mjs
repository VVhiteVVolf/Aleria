import { REPORT_DOCUMENT_ID, REPORT_ITEM_ID } from './case-records.mjs';
import { REPORT_ASSETS } from './report-book.mjs';

export function buildFleischsammlerReportItems() {
  return [{ id: REPORT_ITEM_ID, canonicalKey: REPORT_ITEM_ID, title: 'Meredydds Ermittlungsbuch · Der Fleischsammler',
    category: 'sonstiges', type: 'Dünnes Notizbuch · Ermittlungsbericht', documentRef: { id: REPORT_DOCUMENT_ID },
    image: `${REPORT_ASSETS}/duennes-notizbuch-r1.png`, mechanicsStatus: 'narrative', inventoryUseMode: 'use',
    stackable: false, description: 'Ein dünnes ledergebundenes Ermittlungsbuch von Meredydd Gwyllach an Sir Brenric Coeddu. Enthält den bekannten Fallstand, sechzehn Falleinträge, Familienberichte, zwei ausdrücklich vorläufige Ermittlerskizzen, Unterschrift, Verwaltungssiegel und eine freie Notizseite.',
    section: 'definition', aliases: [], tags: ['Dokument', 'Gwynthor', 'Fleischsammler'], priceRange: null, stock: null,
    attributes: [], infoRows: [{ label: 'Verfasser', value: 'Meredydd Gwyllach' }, { label: 'Adressat', value: 'Sir Brenric Coeddu' }],
    sourceRefs: [{ kind: 'workshop-document', documentId: REPORT_DOCUMENT_ID }], hiddenMeta: { origin: 'Nutzerauftrag 14.11.2026' } }];
}
