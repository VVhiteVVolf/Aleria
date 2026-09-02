(function(root){
  const SOURCES = Object.freeze([
    '/Karten/assets/images/pin-placeholders/default-hafensiedlung.webp',
    '/Karten/assets/images/pin-placeholders/default-siedlung.webp',
    '/Karten/assets/images/pin-placeholders/default-waldsiedlung.webp',
  ]);

  function stableHash(value){
    let hash = 2166136261;
    const text = String(value || 'unbenannter-ort');
    for(let index = 0; index < text.length; index += 1){
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function identityFor(pin = {}){
    return [pin.id, pin.title, pin.x, pin.y].map(value => String(value ?? '')).join('|');
  }

  function select(pin = {}){
    return SOURCES[stableHash(identityFor(pin)) % SOURCES.length];
  }

  function resolve(pin = {}){
    const explicitSource = String(pin.img || '').trim();
    const isPlaceholder = !explicitSource;
    return {
      src: explicitSource || select(pin),
      link: isPlaceholder ? '' : String(pin.imgLink || '').trim(),
      isPlaceholder,
    };
  }

  root.KartoPinPlaceholders = Object.freeze({
    sources: SOURCES,
    select,
    resolve,
  });
})(typeof window !== 'undefined' ? window : globalThis);
