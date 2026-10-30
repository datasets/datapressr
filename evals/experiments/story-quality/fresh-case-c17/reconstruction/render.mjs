// Reuse existing evals harness; no model calls.
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {renderCharts} from '../../../../lib/render.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const out=resolve(process.argv[2] ?? resolve(here,'rendered'));
await renderCharts([{file:'components.svg',raw:readFileSync(resolve(here,'../inputs/components.svg'),'utf8')}],out);
console.log('Offline harness render completed');
