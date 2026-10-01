import { access, copyFile, constants, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const project = dirname(fileURLToPath(import.meta.url));
const target = resolve(project, '../../../desktop-app/demos/datapressr-demo-v2.mp4');
try {
  await access(target);
  throw new Error(`Preserving existing export: ${target}. Choose a new version filename before rendering again.`);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
execFileSync(join(project, 'node_modules/.bin/hyperframes'), [
  'render', '--output', 'output/datapressr-demo-v2.mp4', '--fps', '24', '--quality', 'looks', '--workers', '2',
], { cwd: join(project, 'v2'), stdio: 'inherit', env: { ...process.env, HYPERFRAMES_NO_TELEMETRY: '1' } });
await mkdir(dirname(target), { recursive: true });
await copyFile(join(project, 'v2/output/datapressr-demo-v2.mp4'), target, constants.COPYFILE_EXCL);
console.log(`Saved without overwriting: ${target}`);
