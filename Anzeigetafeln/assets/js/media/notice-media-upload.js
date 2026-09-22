(function () {
  'use strict';
  async function read(file) {
    if (!file || !/^image\/(png|jpeg|webp|gif)$/i.test(file.type)) throw new Error('Bitte ein PNG-, JPG-, WebP- oder GIF-Bild wählen.');
    if (file.size > 12 * 1024 * 1024) throw new Error('Das Bild darf höchstens 12 MB groß sein.');
    const bitmap = await createImageBitmap(file).catch(() => { throw new Error('Dieses Bild konnte nicht gelesen werden.'); });
    try {
      const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const src = canvas.toDataURL('image/webp', .82);
      if (src.length > 600000) throw new Error('Das Bild ist zu detailreich. Bitte verkleinern oder als Bildlink einfügen.');
      return { kind: 'upload', src, name: file.name };
    } finally { bitmap.close(); }
  }
  window.TafelNoticeMediaUpload = Object.freeze({ read });
})();
