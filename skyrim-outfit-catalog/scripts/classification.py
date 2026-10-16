"""Transparent, thematic recommendations; never gameplay requirements."""
import re

STYLE_RULES = [
    (r'thief|thieves|nightingale|sneak|rogue|duskrogue', ['Dieb / Schurke'], ['Diebesgilde']),
    (r'assassin|dark brotherhood|sithis|morag tong|shrouded', ['Assassine'], ['Dunkle Bruderschaft / Morag Tong']),
    (r'mage|wizard|sorcer|arcane|magic|witch|necromanc|warlock', ['Magier / Hexe'], ['Akademie von Winterfeste']),
    (r'paladin|stendarr|vigilant|inquisitor|crusader', ['Paladin'], ['Wächter von Stendarr']),
    (r'dawnguard|vampire hunter', ['Jäger / Waldläufer', 'Paladin'], ['Dämmerwacht']),
    (r'vampire|volkihar|blood witch|blood mage', ['Vampir / Dunkler Magier'], ['Volkihar']),
    (r'companion|wolf armor|skyforge', ['Krieger / Schildmaid'], ['Gefährten']),
    (r'imperial|legion|centurion|dragonguard', ['Soldat / Ritter'], ['Kaiserliche / Klingen']),
    (r'stormcloak', ['Krieger / Schildmaid'], ['Sturmmäntel']),
    (r'thalmor|dominion|auridon', ['Soldat / Ritter', 'Magier / Hexe'], ['Thalmor / Aldmeri-Stil']),
    (r'forsworn|reachman|druid|shaman', ['Druide / Schamane'], ['Abgeschworene / Naturstil']),
    (r'knight|templar|plate|northern god|valkyr|shieldmaiden|berserk', ['Krieger / Schildmaid', 'Soldat / Ritter'], []),
    (r'hunter|ranger|scout|archer|nomad|wanderer|adventur|travel', ['Jäger / Waldläufer'], []),
    (r'monk|priest|cleric|bishop|cultist|religious', ['Priester / Mönch'], ['Tempel / Kult']),
    (r'noble|royal|regal|duchess|court|princess|prince|elegan', ['Adel / Hof'], ['Hof / Gesellschaft']),
    (r'bard|minstrel', ['Barde'], ['Bardenakademie']),
    (r'blacksmith|smithing|apron', ['Handwerker / Bürger'], ['Handwerk / Alltag']),
    (r'dress|gown|tunic|casual|maid|merchant|common|farmer|peasant', ['Bürger / Kleidung'], ['Alltag / Gesellschaft']),
    (r'lingerie|bikini|swimsuit|underwear|panties|bra\b', ['Freizeit / Unterwäsche'], ['Freizeit']),
]

SLOT_NAMES = {
    30: 'Kopf', 31: 'Haare', 32: 'Rumpf', 33: 'Hände', 34: 'Unterarme',
    35: 'Amulett', 36: 'Ring', 37: 'Füße', 38: 'Waden', 39: 'Schild',
    40: 'Schweif', 41: 'Langhaar', 42: 'Reif', 43: 'Ohren',
}


def recommend(name, editor, keywords, armor_type, context=''):
    search = ' '.join([name, editor, context, *keywords]).casefold().replace('_', ' ')
    classes, guilds = set(), set()
    for pattern, roles, factions in STYLE_RULES:
        if re.search(pattern, search):
            classes.update(roles)
            guilds.update(factions)
    if not classes:
        classes.add({'Schwer': 'Krieger / Schildmaid', 'Leicht': 'Abenteurer / Allround',
                     'Kleidung': 'Bürger / Kleidung'}.get(armor_type, 'Nicht eindeutig'))
    return sorted(classes), sorted(guilds) or ['Kein eindeutiger Gildenstil']


def title(mod, plugin):
    if mod == 'Skyrim / Creation Club':
        return {'skyrim.esm': 'Skyrim – Grundspiel', 'dawnguard.esm': 'Dawnguard',
                'dragonborn.esm': 'Dragonborn', 'hearthfires.esm': 'Hearthfire'}.get(plugin.casefold(), 'Creation Club – ' + plugin)
    result = re.sub(r'^(Twisted|Local)\s*-\s*', '', mod)
    return re.sub(r'\s+20\d{6}$', '', result)


def slots(mask):
    return [SLOT_NAMES.get(index + 30, 'Slot ' + str(index + 30))
            for index in range(32) if mask & (1 << index)]
