"""Change only SkyrimNet's provider sorting, preserving all other configuration."""
from pathlib import Path
from datetime import datetime
import copy
import hashlib
import json
import os
import re
import subprocess

import yaml


def main():
    source = Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\SkyrimNet - Beta25 Test Runtime 20260927\SKSE\Plugins\SkyrimNet\config\OpenRouter.yaml')
    running = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq SkyrimSE.exe', '/FO', 'CSV', '/NH'], capture_output=True, text=True, check=True)
    if 'skyrimse.exe' in running.stdout.casefold():
        raise RuntimeError('Skyrim is running; configuration has not been modified.')
    before = source.read_bytes()
    parsed_before = yaml.safe_load(before)
    if parsed_before['openrouter']['provider_sorting'] != 'latency':
        raise RuntimeError('Unexpected initial routing; inspect before changing anything.')
    after, count = re.subn(rb'(?m)^(\s*provider_sorting:\s*)latency([ \t]*\r?)$', rb'\g<1>price\2', before)
    if count != 1:
        raise RuntimeError(f'Expected exactly one plain sorting setting, found {count}.')
    expected = copy.deepcopy(parsed_before)
    expected['openrouter']['provider_sorting'] = 'price'
    if yaml.safe_load(after) != expected:
        raise RuntimeError('Unexpected configuration change.')
    destination = Path(r'E:\Aleria\diagnostics') / ('skyrimnet-price-routing-' + datetime.now().strftime('%Y%m%d-%H%M%S'))
    destination.mkdir(exist_ok=False)
    (destination / 'OpenRouter.before.yaml').write_bytes(before)
    (destination / 'OpenRouter.after.yaml').write_bytes(after)
    if (destination / 'OpenRouter.before.yaml').read_bytes() != before:
        raise RuntimeError('Backup verification failed.')
    temporary = source.with_name('OpenRouter.yaml.price-routing-' + datetime.now().strftime('%Y%m%d-%H%M%S') + '.tmp')
    with temporary.open('xb') as stream:
        stream.write(after)
        stream.flush()
        os.fsync(stream.fileno())
    if source.read_bytes() != before:
        raise RuntimeError('Source changed concurrently; original was not overwritten.')
    os.replace(temporary, source)
    if source.read_bytes() != after:
        raise RuntimeError('Readback verification failed.')
    report = {
        'status': 'VERIFIED',
        'source': str(source),
        'profile': 'Nolvus Awakening - SkyrimNet Beta25 Test',
        'change': {'provider_sorting': {'before': 'latency', 'after': 'price'}},
        'before_sha256': hashlib.sha256(before).hexdigest(),
        'after_sha256': hashlib.sha256(after).hexdigest(),
        'backup_and_updated_snapshot': str(destination),
        'validation': 'Exactly one configuration value changed; YAML structure and byte readback verified.',
        'runtime_test': 'Pending next Skyrim launch; no paid API call issued.'
    }
    (destination / 'change.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report))


if __name__ == '__main__':
    main()
