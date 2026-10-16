"""Read public release metadata without credentials or local game mutations."""
import concurrent.futures
import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
REPOS = [
    'MinLL/SkyrimNet-GamePlugin', 'Severause/SeverActions',
    'Gerkinfeltser/IntelEngine-GamePlugin',
    'pdusen/skyrimnet-plugin-narrative-engine', 'tetherball88/OStimNet',
    'tetherball88/maras', 'PrismaUI-SKSE/framework',
]

def fetch(repo):
    request = urllib.request.Request(
        'https://api.github.com/repos/' + repo + '/releases?per_page=8',
        headers={'User-Agent': 'local-skyrimnet-install-audit'})
    with urllib.request.urlopen(request, timeout=45) as response:
        releases = json.load(response)
    target = ROOT / 'releases' / (repo.replace('/', '--') + '.json')
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(releases, indent=2), encoding='utf-8')
    return {'repo': repo, 'releases': [
        {'tag': r['tag_name'], 'date': r['published_at'], 'prerelease': r['prerelease'],
         'assets': [a['name'] for a in r['assets']]} for r in releases[:3]]}

if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        for repo, result in zip(REPOS, executor.map(fetch, REPOS)):
            print(json.dumps(result))
