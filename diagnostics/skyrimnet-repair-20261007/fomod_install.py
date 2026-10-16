"""Flatten this release's FOMOD choices into a staging folder."""
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path


OPTIONS = {
    'Basic Actions', 'Combat Actions', 'Brawl Actions', 'Outfit Actions',
    'Furniture Actions', 'Economy Actions', 'Enterprises Actions', 'Crafting Actions',
    'Arrest Actions', 'Follower Actions', 'Core Awareness Prompts',
    'NPC Familiarity & Reputation', 'Combat Awareness Prompt', 'Brawl Awareness Prompt',
    'Arrest/Crime Prompts', 'Follower Companion Prompts', 'Group Meeting Awareness',
    'Merchant Prompt - Show Anywhere', 'AI Overhaul Flee Patch',
    "Sever's Hearth (Camp System)",
}


def build(source: Path, destination: Path):
    config = ET.parse(source / 'fomod/ModuleConfig.xml').getroot()
    flags = {}
    chosen = []
    available = set()
    installs = list(config.findall('./requiredInstallFiles/*'))
    for plugin in config.findall('./installSteps/installStep/optionalFileGroups/group/plugins/plugin'):
        name = plugin.attrib['name']
        available.add(name)
        if name in OPTIONS:
            chosen.append(name)
            flags.update({f.attrib['name']: f.text for f in plugin.findall('./conditionFlags/flag')})
            installs.extend(plugin.findall('./files/*'))
    assert OPTIONS <= available, 'A required installer choice changed'
    for pattern in config.findall('./conditionalFileInstalls/patterns/pattern'):
        deps = pattern.findall('./dependencies/*')
        assert all(d.tag == 'flagDependency' for d in deps), 'Unhandled installer condition'
        if all(flags.get(d.attrib['flag']) == d.attrib['value'] for d in deps):
            installs.extend(pattern.findall('./files/*'))
    for entry in sorted(installs, key=lambda node: int(node.attrib.get('priority', 0))):
        src = source / entry.attrib['source']
        dest = destination / entry.attrib.get('destination', '')
        assert src.exists(), 'Missing FOMOD source: ' + str(src)
        if entry.tag == 'folder':
            shutil.copytree(src, dest, dirs_exist_ok=True)
        elif entry.tag == 'file':
            target = dest if dest.suffix else dest / src.name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, target)
        else:
            raise ValueError('Unhandled FOMOD file entry')
    return {'choices': chosen, 'flags': flags, 'install_sources': [e.attrib for e in installs]}
