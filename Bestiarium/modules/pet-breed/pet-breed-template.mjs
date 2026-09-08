import { renderLivestockArchive } from '../livestock-category/livestock-category-template.mjs';
import { PET_BREED_GROUPS } from './pet-breed-registry.mjs';

function petNavigation(record) {
  return {
    generatedBy: 'Bestiarium/scripts/build-pet-breeds.mjs',
    pageTitleContext: 'Haustiere · Vieh',
    faviconHref: '../../../../../IconOrdner/ReiterIcons/Bestiarium-register.webp',
    bookShellHref: '../../../../modules/book-shell/book-shell.css',
    stylesheetHref: '../../../../modules/livestock-category/livestock-category.css',
    skipLabel: 'Zur Haustierkunde',
    rootHref: '../../../../index.html#tiere',
    mastheadEdition: 'Thalenorische Akademie · Archiv der Haustiere',
    breadcrumbs: [
      { title: 'Bestiarium', href: '../../../../index.html' },
      { title: 'Vieh', href: '../../index.html' },
      { title: 'Haustiere', href: '../index.html' }
    ],
    tabsLabel: 'Unterregister der Haustiere',
    tabs: PET_BREED_GROUPS.map(group => ({
      ...group,
      href: group.id === record.id ? './index.html' : `../${group.id}/index.html`
    })),
    sealLabel: 'Haustierregister',
    parentHref: '../index.html',
    parentLabel: 'Zu den Haustieren',
    footerBackLabel: 'zu den Haustieren',
    registerLabel: 'Kapitel der Haustierkunde',
    registerBackLabel: 'Alle Haustiere',
    loreLabel: 'Haustierkundlicher Text',
    footerContext: 'Haustiere Alerias'
  };
}

export function renderPetBreedOverview(record) {
  return renderLivestockArchive(record, petNavigation(record));
}
