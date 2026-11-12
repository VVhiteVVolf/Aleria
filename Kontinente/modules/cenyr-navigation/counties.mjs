import counties from './counties.source.json' with { type: 'json' };
import { territoryHref } from '../territory-page/territory-reference.mjs';
import { territoryNavigationMarkup } from '../territory-page/territory-navigation-template.mjs';

export function renderCenyrCounties(registry) {
  const links = counties.map(county => {
    const href = territoryHref(county.id, registry);
    if (!href) throw new Error(`Grafschaft fehlt im Territorialregister: ${county.id}`);
    return { ...county, href, imageSrc: `/Stammbäume/assets/images/regions/${county.banner}.png`, imageAlt: `Banner der Grafschaft ${county.title}` };
  });
  return `<section class="cenyr-counties" aria-labelledby="cenyr-counties-title">
  <h3 id="cenyr-counties-title">Die neun Grafschaften Cenyrs</h3>
  <img class="cenyr-counties-crest" src="https://i.imgur.com/sGtUOpK.png" alt="Abbildung des Königreichs Cenyr" width="365" height="569" loading="lazy">
  ${territoryNavigationMarkup(links, 'Grafschaften Cenyrs')}
</section>`;
}
