"""Stable source-family identities shared by the offline import stages."""

def family_kind(config, slug):
    return config.get('familyKinds', {}).get(slug, 'clan')

def family_id(config, slug):
    return ('sept-' if family_kind(config, slug) == 'sept' else 'haus-') + slug

def house_id(config, slug):
    return ('house-sept-' if family_kind(config, slug) == 'sept' else 'house-') + slug
