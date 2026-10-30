// Offline development fixture only; uses the existing renderer, no model calls.
// Supply a NEW output directory; retained fixtures are never overwritten.
import { readFileSync, mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { renderCharts } from '../../../lib/render.mjs';
import { prepareReaderPacket } from '../../../lib/reader-packet.mjs';
const out = process.argv[2];
if (!out || process.argv.length !== 3) throw new Error('Usage: node build-fixtures.mjs <new-output-directory>');
const scratch = mkdtempSync(join(tmpdir(), 'diagnostic-render-'));
try {
  const charts = ['clipped', 'corrected'].map(name => ({ file: `${name}.svg`, raw: readFileSync(new URL(`fixtures/${name}.svg`, import.meta.url), 'utf8') }));
  const paths = await renderCharts(charts, scratch, { scale: 1 });
  mkdirSync(resolve(out));
  const manifest = prepareReaderPacket({ out: join(resolve(out), 'reader'), images: paths.map((path, i) => ({ path, display_width_px: 360, display_height_px: i === 0 ? 220 : 260 })) });
  writeFileSync(join(resolve(out), 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });
} finally { rmSync(scratch, { recursive: true, force: true }); }
