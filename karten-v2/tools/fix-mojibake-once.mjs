#!/usr/bin/env node
// One-off fix for the Celtigerns-Wacht legacy export: the source text was
// UTF-8 but got interpreted as Latin-1 somewhere in its export/copy
// pipeline (classic mojibake: "Führung" -> "FÃ¼hrung"). This is a clean,
// reversible round trip - not a hand-edit - since UTF-8 bytes 0x80-0xFF
// happen to be valid Latin-1 code points one-to-one.
import { readFileSync, writeFileSync } from 'node:fs';

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error('Usage: node fix-mojibake-once.mjs <in> <out>');
  process.exit(1);
}

const mangled = readFileSync(inPath, 'utf8');
const fixed = Buffer.from(mangled, 'latin1').toString('utf8');
writeFileSync(outPath, fixed);

// Sanity spot-check on known words.
const checks = ['Führung', 'Bevölkerung', 'Groß', 'Baronie', 'Küste'];
for (const word of checks) {
  console.log(`${word}: ${fixed.includes(word) ? 'OK' : 'MISSING'}`);
}
