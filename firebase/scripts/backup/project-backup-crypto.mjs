import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { gzipSync, gunzipSync } from 'node:zlib';

const MAGIC = Buffer.from('ALERIA-BACKUP-1\n');

// The archive is encrypted before touching disk. Windows protects its random
// encryption key for the current Windows account; credentials are never saved.
export function protectWindowsKey(bytes, unprotect = false) {
  if (process.platform !== 'win32') throw new Error('Windows-Schlüsselschutz benötigt Windows.');
  const method = unprotect ? 'Unprotect' : 'Protect';
  const script = `Add-Type -AssemblyName System.Security; $backupInput = [Console]::In.ReadToEnd(); $backupBytes = [Convert]::FromBase64String($backupInput); $backupResult = [Security.Cryptography.ProtectedData]::${method}($backupBytes, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser); [Console]::Out.Write([Convert]::ToBase64String($backupResult))`;
  return new Promise((resolve, reject) => {
    const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    const chunks = [];
    child.stdout.on('data', chunk => chunks.push(chunk));
    child.stderr.on('data', () => {});
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve(Buffer.from(Buffer.concat(chunks).toString().trim(), 'base64')) : reject(new Error('Windows-Schlüsselschutz fehlgeschlagen.')));
    child.stdin.end(bytes.toString('base64'));
  });
}

export async function encryptProjectBackup(payload, protect = protectWindowsKey) {
  const bytes = Buffer.from(JSON.stringify(payload));
  const key = randomBytes(32);
  try {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(gzipSync(bytes)), cipher.final()]);
    const header = Buffer.from(JSON.stringify({ type: 'aleria-private-project-backup', version: 1,
      keyProtection: 'Windows-DPAPI-CurrentUser', wrappedKey: (await protect(key)).toString('base64'),
      iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), sha256: createHash('sha256').update(bytes).digest('hex') }));
    const length = Buffer.alloc(4); length.writeUInt32BE(header.length);
    return Buffer.concat([MAGIC, length, header, encrypted]);
  } finally { key.fill(0); }
}

export async function decryptProjectBackup(archive, unprotect = bytes => protectWindowsKey(bytes, true)) {
  if (!archive.subarray(0, MAGIC.length).equals(MAGIC)) throw new Error('Unbekanntes Sicherungsformat.');
  const length = archive.readUInt32BE(MAGIC.length);
  if (length > 64 * 1024) throw new Error('Ungültiger Sicherungskopf.');
  const offset = MAGIC.length + 4 + length;
  const header = JSON.parse(archive.subarray(MAGIC.length + 4, offset).toString());
  const key = await unprotect(Buffer.from(header.wrappedKey, 'base64'));
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(header.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(header.tag, 'base64'));
    const compressed = Buffer.concat([decipher.update(archive.subarray(offset)), decipher.final()]);
    const bytes = gunzipSync(compressed, { maxOutputLength: 512 * 1024 * 1024 });
    if (createHash('sha256').update(bytes).digest('hex') !== header.sha256) throw new Error('Prüfsumme der Sicherung stimmt nicht.');
    return JSON.parse(bytes.toString());
  } finally { key.fill(0); }
}
