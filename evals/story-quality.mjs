#!/usr/bin/env node
import { readFileSync, realpathSync, statSync } from 'node:fs';
import { relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appendRecord, readJournal, validateManifest, validateRecords, renderReport } from './lib/story-quality-tracker.mjs';
const ROOT = fileURLToPath(new URL('../', import.meta.url));
try {
  const [command, ...args] = process.argv.slice(2);
  const linkedReport = command === 'report' && args.length === 4 && args[2] === '--relative-to' && !args[3].startsWith('--');
  if (!['validate','append','report'].includes(command) || (!linkedReport && args.length !== (command === 'append' ? 3 : 2)) || args.slice(0, command === 'append' ? 3 : 2).some(a=>a.startsWith('--'))) throw new Error('Usage: node evals/story-quality.mjs validate|report <manifest.json> <journal.jsonl> [report only: --relative-to <report-directory>] | append <manifest.json> <journal.jsonl> <record.json>');
  let linkBase = '';
  if (linkedReport) {
    const directory = realpathSync(args[3]);
    if (!statSync(directory).isDirectory()) throw new Error('--relative-to must identify an existing report directory');
    linkBase = relative(realpathSync(ROOT), directory);
    if (linkBase === '..' || linkBase.startsWith(`..${sep}`) || isAbsolute(linkBase)) throw new Error('--relative-to report directory must be within repository root');
    linkBase = linkBase.split(sep).join('/');
  }
  const instrument = JSON.parse(readFileSync(new URL('./calibration/story/tracking-v0.1/instrument.json', import.meta.url),'utf8'));
  const [manifestPath,journalPath,recordPath] = args;
  const manifest = JSON.parse(readFileSync(manifestPath,'utf8'));
  const records = readJournal(journalPath);
  validateManifest(manifest,{root:ROOT,instrument});
  validateRecords(records,{manifest,instrument,root:ROOT});
  if (command === 'append') appendRecord(journalPath,JSON.parse(readFileSync(recordPath,'utf8')),{root:ROOT,manifest,instrument});
  if (command === 'report') process.stdout.write(renderReport(records,{manifest,instrument,linkBase}));
} catch (error) { console.error(error.message); process.exitCode = 1; }
