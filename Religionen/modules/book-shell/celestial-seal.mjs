// Decorative vector ornament; deliberately independent of any religion's canonical symbol.
export function renderCelestialSeal() {
  return `<svg class="celestial-seal" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
    <defs><path id="seal-title-arc" d="M 48,200 A 152,152 0 1,1 352,200"/><path id="seal-bottom-arc" d="M 30,200 A 170,170 0 0,0 370,200"/></defs>
    <g fill="none" stroke="currentColor"><circle cx="200" cy="200" r="190"/><circle cx="200" cy="200" r="184" stroke-width=".5"/><circle cx="200" cy="200" r="143"/><circle cx="200" cy="200" r="137" stroke-dasharray="1 8"/>
      <path d="M200 40V360M40 200H360M88 88L312 312M88 312L312 88" opacity=".3"/>
      <path d="M200 63L235 165L337 200L235 235L200 337L165 235L63 200L165 165Z"/><path d="M110 110L200 155L290 110L245 200L290 290L200 245L110 290L155 200Z" opacity=".5"/>
      <circle cx="200" cy="200" r="68"/><circle cx="200" cy="200" r="61"/>
    </g>
    <g fill="currentColor"><path d="M200 67L200 132L215 155Z M333 200L268 200L245 215Z M200 333L200 268L185 245Z M67 200L132 200L155 185Z" opacity=".25"/>
      <path d="M200 150L209 178L235 165L222 191L250 200L222 209L235 235L209 222L200 250L191 222L165 235L178 209L150 200L178 191L165 165L191 178Z"/>
      <circle cx="200" cy="48" r="3"/><circle cx="352" cy="200" r="3"/><circle cx="200" cy="352" r="3"/><circle cx="48" cy="200" r="3"/>
    </g>
    <g fill="currentColor" font-family="Georgia, serif" font-size="10" letter-spacing="4"><text><textPath href="#seal-title-arc" startOffset="50%" text-anchor="middle">AHNEN · TITANEN · URGÖTTER</textPath></text><text><textPath href="#seal-bottom-arc" startOffset="50%" text-anchor="middle">DIE GLAUBENSWELTEN ALERIAS</textPath></text></g>
  </svg>`;
}
