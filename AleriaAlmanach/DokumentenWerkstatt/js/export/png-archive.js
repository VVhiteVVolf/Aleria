// Uncompressed ZIP: PNG is already compressed. No runtime dependency or network request.
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
  return (crc ^ 0xffffffff) >>> 0;
}

export async function createPngArchive(files) {
  const chunks = [], directory = [];
  let offset = 0;
  for (const file of files) {
    const name = new TextEncoder().encode(file.name), data = new Uint8Array(await file.blob.arrayBuffer());
    const checksum = crc32(data), header = new Uint8Array(30 + name.length), local = new DataView(header.buffer);
    local.setUint32(0, 0x04034b50, true); local.setUint16(4, 20, true); local.setUint16(6, 0x800, true);
    local.setUint32(14, checksum, true); local.setUint32(18, data.length, true); local.setUint32(22, data.length, true);
    local.setUint16(26, name.length, true); header.set(name, 30);
    const central = new Uint8Array(46 + name.length), view = new DataView(central.buffer);
    view.setUint32(0, 0x02014b50, true); view.setUint16(4, 20, true); view.setUint16(6, 20, true); view.setUint16(8, 0x800, true);
    view.setUint32(16, checksum, true); view.setUint32(20, data.length, true); view.setUint32(24, data.length, true);
    view.setUint16(28, name.length, true); view.setUint32(42, offset, true); central.set(name, 46);
    chunks.push(header, data); directory.push(central); offset += header.length + data.length;
  }
  const size = directory.reduce((sum, entry) => sum + entry.length, 0), end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, size, true); end.setUint32(16, offset, true);
  return new Blob([...chunks, ...directory, end.buffer], { type: 'application/zip' });
}
