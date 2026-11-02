"""Audited cartographic data from the supplied, unchanged Venalys rasters.

The red district stroke is sampled only for geometry. POI groups were checked
against all supplied icon legends and the unmarked full-resolution map.
"""
from pathlib import Path
import json
import math

ROOT = Path(__file__).resolve().parents[2]
QA = Path(__file__).resolve().parent
OUTPUT = ROOT / 'Vorschau/Venalys/territory-data.mjs'


def simplify(points, epsilon):
    if len(points) < 3:
        return points
    start, end = points[0], points[-1]
    dx, dy = end[0] - start[0], end[1] - start[1]
    denominator = math.hypot(dx, dy)
    distances = [abs(dy * p[0] - dx * p[1] + end[0] * start[1] - end[1] * start[0]) / denominator
                 if denominator else math.dist(start, p) for p in points]
    index = max(range(1, len(points) - 1), key=lambda n: distances[n])
    if distances[index] <= epsilon:
        return [start, end]
    return simplify(points[:index + 1], epsilon)[:-1] + simplify(points[index:], epsilon)


def boundary(pixels):
    pixels = set(map(tuple, pixels))
    edges = {}
    for x, y in pixels:
        if (x, y - 1) not in pixels:
            edges.setdefault((x, y), []).append((x + 1, y))
        if (x + 1, y) not in pixels:
            edges.setdefault((x + 1, y), []).append((x + 1, y + 1))
        if (x, y + 1) not in pixels:
            edges.setdefault((x + 1, y + 1), []).append((x, y + 1))
        if (x - 1, y) not in pixels:
            edges.setdefault((x, y + 1), []).append((x, y))
    loops = []
    while edges:
        start = min(edges)
        points, vertex = [start], start
        while True:
            candidates = edges.get(vertex)
            if not candidates:
                break
            following = candidates.pop()
            if not candidates:
                del edges[vertex]
            points.append(following)
            vertex = following
            if vertex == start:
                break
        loops.append(points)
    outer = max(loops, key=len)
    split = max(range(len(outer)), key=lambda n: math.dist(outer[0], outer[n]))
    result = simplify(outer[:split + 1], 1.4)[:-1] + simplify(outer[split:], 1.4)[:-1]
    return result


descriptions = [
    'Nördlicher Hafenbereich westlich der Stadtmitte mit dem südlich anschließenden Dreiecksviertel.',
    'Mittlerer nördlicher Hafenbezirk mit mehreren Hafenbecken und vorgelagerten Kais.',
    'Nordöstlicher Hafenbezirk mit dem großen Gebäudeensemble unter dem hohen Turm.',
    'Nordwestlicher Bezirk um die beiden Kuppelbauten und ihre Gartenanlage.',
    'Nordwestlicher Hafen- und Palastbezirk; die rote Grenze umfasst mehrere Kanalinseln.',
    'Westlicher mittlerer Bezirk mit mehreren Kanalinseln und dem großen südwestlichen Gebäudeensemble.',
    'Zentraler Bezirk um den großen mehrtürmigen Kirchenbau und seine Plätze.',
    'Östlicher nördlicher Mauerbezirk mit Wohnblöcken, Gartenanlage und Tor.',
    'Kleiner innerer Bezirk unmittelbar südwestlich des zentralen Kirchenbaus.',
    'Östlicher mittlerer Bezirk mit Gartenquartier und dem großen Kuppelensemble am Mauerring.',
    'Südwestlicher Eckbezirk um den großen Kuppel- und Turmbau.',
    'Südlicher mittlerer Bezirk mit mehrtürmigem Kirchenbau und Wohnquartieren.',
    'Südöstlicher Bezirk mit Amphitheater, größeren Gebäuden und den südlichen Wohnblöcken.',
]

sample = json.loads((QA / 'district-components.json').read_text())
districts = []
for item, description in zip(sample['components'], descriptions, strict=True):
    percent = lambda p: [round(p[0] / sample['width'] * 100, 4), round(p[1] / sample['height'] * 100, 4)]
    districts.append({'id': f"district-{item['id']:02}", 'name': f"Bezirk {item['id']:02}",
                      'point': percent(item['centre']), 'polygon': list(map(percent, boundary(item['pixels']))),
                      'description': description})

names = {
    'D': ['Vellano', 'Civena', 'Sernio', 'Onara', 'Fidera', 'Orviano', 'Livena', 'Ventano', 'Velina', 'Orveto', 'Valdessa', 'Cirello', 'Sentina', 'Bellera', 'Novera'],
    'S': ['Senavia', 'Valcena', 'Civerna', 'Ordessa', 'Artena', 'Bellario', 'Ferenza', 'Noventa', 'Salerna', 'Civento', 'Rovenna', 'Varello', 'Libera', 'Fidora', 'Valtina'],
    'F': ['Castel Ligor', 'Castel Fortessa', 'Castel Orsena', 'Castel Vetario', 'Castel Bellona', 'Castel Ordano', 'Castel Fidessa', 'Castel Argenna', 'Castel Vercio'],
    'R': ['Torre Levante', 'Torre Calvena', 'Torre Sernato', 'Torre Ventalis', 'Torre Cerano', 'Torre Valora', 'Torre Spirano', 'Torre Corvenna'],
    'K': ['Kloster Valerium', 'Kloster Fidaria', 'Kloster Honorium', 'Kloster Sapentia'],
    'C': ['Kirche Convalia'], 'B': ['Burg Valcerra'],
    'M': ['Arganella', 'Ferrano', 'Ferravia', 'Rocavena'], 'W': ['Silvena'],
}
types = {
    'T': ('Taverne, Herberge oder Bordell', 'Tavernentyp.png / Tavernentype2.png'),
    'A': ('Anwesen', 'Venalys Anwesen.png; weitere violette Einzelhausvarianten'),
    'D': ('Dorf', 'DorfKleinerOrtGehöftHofWeilerEtc.png'),
    'S': ('Siedlung', 'StandardSiedlungstypHandelHandwerk.png'),
    'F': ('Ritterliches Gut oder Festung', 'RitterlichesGutoderFestung.png'),
    'R': ('Turm', 'Turm.png'), 'K': ('Kloster', 'Kloster.png'), 'C': ('Kirche', 'Kirche.png'),
    'B': ('Burg', 'Große Burg.png'), 'M': ('Bergbausiedlung', 'Bergbausiedlung.png'),
    'W': ('Waldsiedlung', 'Waldsiedlung.png'),
}

pois = []
for item in json.loads((QA / 'poi-inventory.json').read_text()):
    code, x, y = item['kind'], *item['point']
    index = int(item['key'][1:]) - 1
    kind, legend = types[code]
    name = 'Taverne, Herberge oder Bordell' if code == 'T' else f'Anwesen {index + 1:02}' if code == 'A' else names[code][index]
    eastwest = 'westlichen' if x < 1200 else 'östlichen'
    northsouth = 'nördlichen' if y < 650 else 'südlichen'
    detail = f'Außerhalb des Stadtrings im {northsouth}, {eastwest} Umland.'
    if code == 'A':
        detail += ' Violettes Einzelhaus oder zusammengehöriges Gebäudeensemble; Hausname und Zugehörigkeit bleiben offen.'
    elif code == 'T':
        detail += ' Die genaue Nutzung als Taverne, Herberge oder Bordell bleibt offen.'
    elif code == 'S':
        detail += ' Die gelieferte Kartenlegende bezeichnet diesen Typ als Siedlung für Handel und Handwerk.'
    elif code == 'F':
        detail += ' Ringförmige Befestigung; genaue Nutzung als Gut oder Festung bleibt offen.'
    pois.append({'id': f"poi-{item['key'].lower()}", 'name': name, 'kind': kind,
                 'point': [round(x / 2400 * 100, 4), round(y / 1376 * 100, 4)],
                 'description': detail, 'sourceKind': legend})

assert len(districts) == 13 and len(pois) == 78
assert len({p['id'] for p in pois}) == len(pois)
assert len({p['name'] for p in pois if p['kind'] not in ['Anwesen', 'Taverne, Herberge oder Bordell']}) == 58
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text('// Cartographic source: the two supplied Venalys maps, 2 November 2026.\n'
                  '// Neutral district names are intentionally editable; no house assignments are implied.\n'
                  'export const mapGeometry = Object.freeze({width:8192,height:4698});\n\n'
                  'export const districts = Object.freeze(' + json.dumps(districts, ensure_ascii=False, indent=2) + ');\n\n'
                  'export const pointsOfInterest = Object.freeze(' + json.dumps(pois, ensure_ascii=False, indent=2) + ');\n', encoding='utf-8')
print(json.dumps({'districts': len(districts), 'pointsOfInterest': len(pois), 'polygonVertices': [len(d['polygon']) for d in districts]}))
