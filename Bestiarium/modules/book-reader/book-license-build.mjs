import { readFile } from 'node:fs/promises';

// The library is vendored, so it is not discovered through npm dependency notices.
// Ship its complete license alongside the minified production chunk as well.
export function preserveBookReaderLicense() {
  return {
    name: 'preserve-book-reader-license',
    async generateBundle(_options, bundle) {
      const usesPageFlip = Object.values(bundle).some(asset => asset.type === 'chunk'
        && Object.keys(asset.modules).some(id => id.replaceAll('\\', '/').includes('/book-reader/vendor/page-flip.mjs')));
      if (usesPageFlip) this.emitFile({
        type: 'asset', fileName: 'licenses/stpageflip-2.0.7-LICENSE.txt',
        source: await readFile(new URL('./vendor/LICENSE', import.meta.url), 'utf8')
      });
    }
  };
}
