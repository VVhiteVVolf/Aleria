"""Compatibility entry point for the approved Raves/Veltrane alpha cleanup."""
import json
from heraldic_emblem_alpha import ROOT, normalize_emblem_alpha

report = [normalize_emblem_alpha(ROOT / path) for path in [
    'Stammbäume/assets/images/houses/Kaiserreich Argentum/Veltrane.png',
    'Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Raves.png',
]]
(ROOT / 'AleriaAlmanach/assets/goettliche-eleganz/emblem-alpha-audit.json').write_text(
    json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Wappen geprüft: innen Alpha 255, außen Alpha 0; RGB unverändert.')
