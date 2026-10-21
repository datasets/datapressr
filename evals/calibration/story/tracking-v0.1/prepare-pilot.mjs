import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderReport, validateManifest, validateRecords } from '../../../lib/story-quality-tracker.mjs';

const BASE = 'evals/calibration/story/tracking-v0.1';
const SOURCE = 'evals/experiments/story-quality/reference-led-v1';
const SLOTS = [
  ['A', 'M30755c', 'France', 'q01-french-debt', 'baseline', 1],
  ['B', 'Mb8941a', 'France', 'q01-french-debt', 'candidate', 1],
  ['C', 'Mbe53b2', 'Oil', 'q03-wti-negative', 'baseline', 1],
  ['D', 'M9b1fee', 'Oil', 'q03-wti-negative', 'candidate', 1],
  [null, 'Mf4bb1f', 'France', 'q01-french-debt', 'baseline', 2],
  [null, 'M1d3194', 'France', 'q01-french-debt', 'candidate', 2],
  [null, 'Mee832a', 'Oil', 'q03-wti-negative', 'baseline', 2],
  [null, 'M948761', 'Oil', 'q03-wti-negative', 'candidate', 2],
];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const portable = path => path.split(sep).join('/');
const json = value => `${JSON.stringify(value, null, 2)}\n`;
function confined(root, path) {
  const rel = relative(root, path);
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error('Path escapes repository root');
  // Check every existing ancestor, including symlinks, before creating output.
  let ancestor = path;
  let entry = lstatSync(ancestor, { throwIfNoEntry: false });
  while (!entry) {
    ancestor = dirname(ancestor);
    entry = lstatSync(ancestor, { throwIfNoEntry: false });
  }
  if (entry.isSymbolicLink() && !existsSync(ancestor)) throw new Error('Broken output symlink');
  const real = realpathSync(ancestor);
  const actual = relative(root, real);
  if (actual === '..' || actual.startsWith(`..${sep}`) || isAbsolute(actual)) throw new Error('Symlink escapes repository root');
}

function ownerReadme(instrument) {
  const names = ['Reader value', 'Explanation and argument', 'Presentation', 'Optional independent overall'];
  const anchors = instrument.human_dimensions.map((dimension, i) => `| ${names[i]} | ${[2, 4, 6, 8, 10].map(n => dimension.anchors[n]).join(' | ')} |`);
  return `# Reading packet\n\nStart with [the response form](form.md), which links each commission and story. Read the linked PNG charts with the prose. The intended chart display width is 720px; your actual device, viewport or chart size may differ. Record that size if known. No specific audience is stated in these commissions; say if that limits your response.\n\nYou may read fewer stories, skip dimensions, or give only an overall response. Leave skipped items as not rated and state why if possible. The recorded denominator will remain the number of actual responses; missing scores stay null with a reason. Please use your own words. No response is inferred from an empty form.\n\nUse whole numbers from 1–10. 1 and odd numbers are allowed between these guideposts. Overall is an independent judgment, never an average of the three dimensions. These are proposed anchors, not an established owner standard. An 8 does not authorize publication.\n\n| Dimension | 2 | 4 | 6 | 8 | 10 |\n| --- | --- | --- | --- | --- | --- |\n${anchors.join('\n')}\n\nDoes the proposed 8 / minor-edits anchor fit your own standard? Please respond in the form. This asks about the anchor, not permission to publish. You do not need to recompute data or complete diagnostic or evidence checks.\n\nThe reading copies preserve the original article content and charts. Preparation removed only a redundant identical leading title and changed local image destinations to the same existing PNG files; the commissions are byte-identical copies. No charts were regenerated. Neutral A–D names minimize identity cues, but existing public mappings and prior exposure mean this is not proven blind. Record previous familiarity, even if uncertain. A fresh reviewer does not make old stories holdout material.\n`;
}
function ownerForm() {
  const sections = SLOTS.filter(s => s[0]).map(([id]) => `## ${id}\n\n[Commission ${id}](${id}-commission.md) · [Story ${id}](${id}.md) (including the linked chart views)\n\nWas this worth reading? Did I learn something that matters? __ /10 or not rated\n\nDid I understand the answer and why the evidence supports it? __ /10 or not rated\n\nHow easy and enjoyable was it to read the prose and charts? __ /10 or not rated\n\nOptional independent overall: How good is this story for its intended audience and commission? __ /10 or not rated\n\nYour comments, in your own words:\n\nSingle most useful improvement:\n\nOptional presentation tag: prose / chart\n\nHave you seen this story, its treatment/model identity, or previous ratings before? If unsure, say unknown.\n\nReading device/viewport or displayed chart size, if known:\n\nReason for any not-rated or skipped item, if you wish:\n`);
  return `# Story response form\n\nSee the [complete anchor table and reading instructions](README.md). Responses are optional; you may read fewer stories or provide overall only.\n\n${sections.join('\n')}\nDoes the proposed 8 / minor-edits anchor fit your own standard? Your answer:\n\nThis anchor question does not grant publication approval.\n`;
}

/** Prepare only; importing this module performs no filesystem I/O. */
export function preparePilot({ root, out }) {
  root = realpathSync(root);
  out = resolve(root, out);
  confined(root, out);
  const pathFromRoot = path => portable(relative(root, path));
  const instrumentPath = join(root, BASE, 'instrument.json');
  const instrumentBytes = readFileSync(instrumentPath);
  const instrument = JSON.parse(instrumentBytes);
  const indexPath = `${SOURCE}/review-materials-index.json`;
  const indexBytes = readFileSync(join(root, indexPath));
  const index = JSON.parse(indexBytes);
  if (index.codes.length !== SLOTS.length || SLOTS.some(s => !index.codes.includes(s[1]))) throw new Error('Eligible source codes differ from frozen selection');
  const indexedAsset = path => {
    confined(root, join(root, path));
    if (!statSync(join(root, path)).isFile()) throw new Error(`Not a regular source file: ${path}`);
    const bytes = readFileSync(join(root, path));
    const entry = index.files.find(f => `${SOURCE}/review-materials/${f.archived_relative_path}` === path);
    const sha256 = digest(bytes);
    if (!entry || entry.sha256 !== sha256 || entry.bytes !== bytes.length) throw new Error(`Source hash/index mismatch: ${path}`);
    return { path, sha256 };
  };
  const files = new Map();
  const put = (path, bytes) => files.set(join(out, path), Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes));
  const artifacts = SLOTS.filter(s => s[0]).map(([id, code, topic, caseId, arm, replicate]) => {
    const sourceDir = `${SOURCE}/review-materials/${code}/stage2`;
    const sourceStory = indexedAsset(`${sourceDir}/story.md`);
    const sourceCommission = indexedAsset(`${sourceDir}/commission.md`);
    const commissionBytes = readFileSync(join(root, sourceCommission.path));
    put(`owner/${id}-commission.md`, commissionBytes);
    const viewedPath = join(out, 'owner', `${id}.md`);
    const original = readFileSync(join(root, sourceStory.path), 'utf8');
    let text = original.replace(/^(# [^\n]+\n)\n\1\n/, '$1\n');
    if (text === original) throw new Error(`Expected identical duplicate leading H1: ${code}`);
    const rewrites = [];
    const renders = [];
    text = text.replace(/(!\[[^\]]*\]\()([^\s)]+\.png)(\))/g, (match, before, destination, after) => {
      if (/^[a-z]+:|^\//i.test(destination)) throw new Error('Expected local PNG destination');
      const sourcePath = resolve(root, sourceDir, destination);
      const asset = indexedAsset(pathFromRoot(sourcePath));
      const bytes = readFileSync(sourcePath);
      if (bytes.length < 33 || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) || bytes.readUInt32BE(8) !== 13 || bytes.toString('ascii', 12, 16) !== 'IHDR') throw new Error(`Invalid PNG IHDR: ${asset.path}`);
      const to = portable(relative(dirname(viewedPath), sourcePath));
      rewrites.push({ from: destination, to });
      renders.push({ render_id: `chart-${renders.length + 1}`, ...asset, width_px: bytes.readUInt32BE(16), height_px: bytes.readUInt32BE(20), intended_display_width_px: 720 });
      return `${before}${to}${after}`;
    });
    if (!renders.length) throw new Error(`No PNG references: ${code}`);
    put(`owner/${id}.md`, text);
    return {
      artifact_id: `tracking-pilot-20261021-${id}`, packet_id: id, source_code: code, story_id: code,
      case_id: caseId, pair_id: `${caseId}-r${replicate}`, topic, arm, replicate,
      commission: { path: pathFromRoot(join(out, 'owner', `${id}-commission.md`)), sha256: digest(commissionBytes), audience: null, audience_unknown_reason: 'The archived commission does not state an intended audience.' },
      source_commission: sourceCommission, source_story: sourceStory,
      viewed_story: { path: pathFromRoot(viewedPath), sha256: digest(Buffer.from(text)) },
      transformation: { duplicate_heading_removed: true, heading: original.split('\n')[0], description: 'Removed the second identical initial H1 and its following blank line; changed only local PNG destinations to the same immutable source files.', link_rewrites: rewrites },
      renders,
      process: { writer_rounds: null, review_rounds: null, resources: [], unknown_reason: 'Stage2 stories, commissions and PNGs do not establish writer/review rounds or measured resource counters with accounting boundaries; no process usage is inferred.' },
      actual_viewed_sizes: null, actual_viewed_sizes_unknown_reason: 'No reviewer observation has been collected; intrinsic and intended sizes do not establish actual viewed size.',
    };
  });
  const manifest = {
    schema: 1, instrument_id: instrument.instrument_id, instrument_sha256: digest(instrumentBytes),
    study_id: 'tracking-pilot-20261021', population: 'known-development',
    selection_rule: 'First replicate in both arms and both topics; fixed A–D order independent of historical ratings.',
    procedure_version: instrument.procedure_version,
    source_index: { path: indexPath, sha256: digest(indexBytes) },
    selection: {
      provenance: { path: `${SOURCE}/results.md`, locator: 'Predetermined pair outcomes table; mapping only, historical ratings are not tracker observations.' },
      identity_limit: 'Identity-minimized, not proven blind: existing public mappings and prior exposure remain possible. All eight eligible outputs are known-development, not holdout material.',
      eligible: SLOTS.map(([id, code, topic, caseId, arm, replicate]) => ({ source_code: code, topic, case_id: caseId, arm, replicate, packet_id: id, selected: id !== null, exclusion_reason: id === null ? 'second replicate outside four-artifact pilot' : null })),
    }, artifacts,
  };
  put('manifest.json', json(manifest));
  put('judgments.jsonl', '');
  put('owner/README.md', ownerReadme(instrument));
  put('owner/form.md', ownerForm());
  const materialLinks = artifacts.map(a => `| ${a.packet_id} | [Commission](owner/${a.packet_id}-commission.md) | [Story and linked PNGs](owner/${a.packet_id}.md) |`).join('\n');
  put('README.md', `# Retrospective pilot preparation\n\nFour eligible stories from two topics and both arms are frozen in the administrative [manifest](manifest.json). The selected slot and all eight eligible codes are recorded there. Selection uses first replicates regardless of historical ratings. Existing mappings and previous exposure mean this is identity-minimized, not proven blind. These are known-development stories.\n\nThe [owner packet](owner/README.md) and future independent AI reviewers use exactly these same commissions, final reading copies and linked existing PNGs:\n\n| Packet | Brief | Reading view |\n| --- | --- | --- |\n${materialLinks}\n\nThe sole prose change is removal of the second identical leading H1 and its following blank line. PNG destinations are rewritten relative to the reading copy; image bytes and every other prose byte remain unchanged. Commissions are byte-identical neutral copies. Administrative source identity, hashes, selection and unknown process metadata stay outside the response form. The intended display width is 720px; intrinsic dimensions come from PNG IHDR. Actual viewed dimensions must be reported later, not inferred from either value.\n\nFreeze the instrument and packet hashes before assessment. Future AI reviewers independently score the same three human dimensions plus optional independent overall and all seven instrument diagnostics, before owner responses are revealed. Supply the exact commission, reading view and PNGs linked above, plus the frozen instrument. Record actual identity, materials seen, familiarity, order, uncertainty, viewing dimensions and any missing reasons; do not assume a requested model was served. Unperformed evidence checks remain unresolved/unassessed. No ratings or factual verification are created by this preparation.\n\nFreeze AI records separately before supplying the score-free owner packet; do not provide the administrative manifest, historical assessments, AI scores or expected findings with the owner form. Preserve actual owner wording and missing dimensions without filling answers. Fewer stories or overall-only responses keep a smaller observed denominator and explicit null reasons. A fresh reviewer does not turn these stories into holdout material.\n\nCoordinate later real owner capture and reconciliation with hcn.13 and hcn.14. This packet neither replaces their required artifacts nor closes owner work. Owner agreement and calibration remain unmeasured until actual owner responses arrive. Ratings and check outcomes cannot authorize publication.\n\nRegenerate with \`node ${BASE}/prepare-pilot.mjs\`. Identical regeneration succeeds. A nonempty journal or differing frozen packet/instrument requires a new output directory; this generator never overwrites it. The deterministic [report](report.md) starts with zero owner and AI observations and all checks unassessed.\n`);
  // Registry validation rejects a changed instrument before any output is written.
  validateRecords([], { manifest, instrument });
  put('report.md', renderReport([], { manifest, instrument, linkBase: pathFromRoot(out) }));
  for (const [path, bytes] of files) {
    confined(root, path);
    const entry = lstatSync(path, { throwIfNoEntry: false });
    if (entry) {
      if (!entry.isFile() || !readFileSync(path).equals(bytes)) throw new Error(`Frozen packet or nonempty journal differs: ${path}; use a new output directory`);
    }
  }
  for (const [path, bytes] of files) {
    if (lstatSync(path, { throwIfNoEntry: false })) continue;
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, bytes, { flag: 'wx' });
  }
  validateManifest(manifest, { root, instrument });
  return manifest;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
  preparePilot({ root, out: join(root, BASE, 'pilot') });
}
