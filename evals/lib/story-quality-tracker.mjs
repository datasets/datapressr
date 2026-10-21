import { appendFileSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { isAbsolute, relative, resolve, sep, posix } from 'node:path';

const frozenBytes = readFileSync(new URL('../calibration/story/tracking-v0.1/instrument.json', import.meta.url));
const frozen = JSON.parse(frozenBytes);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const versions = ['instrument_id', 'human_anchor_version', 'diagnostic_version', 'procedure_version', 'check_version'];
const fail = (field, message) => { throw new Error(`${field}: ${message}`); };
const object = (value, field) => { if (!value || typeof value !== 'object' || Array.isArray(value)) fail(field, 'expected object'); };
const text = (value, field) => { if (typeof value !== 'string' || !value.trim()) fail(field, 'expected nonempty string'); };
const array = (value, field) => { if (!Array.isArray(value)) fail(field, 'expected array'); };
const hash = (value, field) => { if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value)) fail(field, 'expected SHA-256'); };
const nullableText = (value, field) => { if (value !== null) text(value, field); };
const own = (o, key) => Object.hasOwn(o, key);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function keys(value, expected, field) { object(value, field); if (!same(Object.keys(value).sort(), [...expected].sort())) fail(field, `expected keys ${expected.join(', ')}`); }
function pathName(path, field) { text(path, field); if (isAbsolute(path) || path.includes('\\') || path.split('/').some(p => p === '..' || p === '.' || p === '')) fail(field, 'path must be repository-relative without traversal'); }
function fileAsset(asset, root, field) {
  object(asset, field); pathName(asset.path, `${field}.path`); hash(asset.sha256, `${field}.sha256`);
  const base = realpathSync(root);
  const path = realpathSync(resolve(base, asset.path));
  const rel = relative(base, path);
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) fail(`${field}.path`, 'path escapes root');
  if (!statSync(path).isFile()) fail(`${field}.path`, 'expected existing regular file');
  if (digest(readFileSync(path)) !== asset.sha256) fail(`${field}.sha256`, 'file hash mismatch');
}
function registry(instrument) {
  if (!same(instrument, frozen)) fail('instrument', 'unsupported instrument or version; supply a reviewed registry for a new instrument');
}
function manifestIdentity(manifest, instrument) {
  registry(instrument); object(manifest, 'manifest');
  if (manifest.schema !== 1) fail('manifest.schema', 'unsupported version');
  if (manifest.instrument_id !== instrument.instrument_id) fail('manifest.instrument_id', 'unsupported instrument');
  if (manifest.instrument_sha256 !== digest(frozenBytes)) fail('manifest.instrument_sha256', 'frozen instrument hash mismatch');
  if (manifest.procedure_version !== instrument.procedure_version) fail('manifest.procedure_version', 'unsupported version');
  array(manifest.artifacts, 'manifest.artifacts');
}
function positive(value, field) { if (!Number.isInteger(value) || value <= 0) fail(field, 'expected positive integer'); }

export function validateManifest(manifest, { root, instrument }) {
  manifestIdentity(manifest, instrument);
  for (const key of ['study_id', 'selection_rule']) text(manifest[key], `manifest.${key}`);
  if (manifest.population !== 'known-development') fail('manifest.population', 'expected known-development');
  const ids = new Set();
  for (const a of manifest.artifacts) {
    object(a, 'artifact'); const p = `artifact ${a.artifact_id}`;
    for (const key of ['artifact_id', 'source_code', 'story_id', 'case_id', 'pair_id', 'topic', 'arm']) text(a[key], `${p}.${key}`);
    if (ids.has(a.artifact_id)) fail(p, 'duplicate artifact_id'); ids.add(a.artifact_id);
    positive(a.replicate, `${p}.replicate`);
    for (const key of ['commission', 'source_story', 'viewed_story']) fileAsset(a[key], root, `${p}.${key}`);
    nullableText(a.commission.audience, `${p}.commission.audience`);
    if (a.commission.audience === null) text(a.commission.audience_unknown_reason, `${p}.commission.audience_unknown_reason`);
    object(a.transformation, `${p}.transformation`);
    array(a.renders, `${p}.renders`); const renderIds = new Set();
    for (const r of a.renders) {
      text(r.render_id, `${p}.render_id`); if (renderIds.has(r.render_id)) fail(p, 'duplicate render_id'); renderIds.add(r.render_id);
      fileAsset(r, root, `${p}.render ${r.render_id}`);
      for (const key of ['width_px', 'height_px', 'intended_display_width_px']) positive(r[key], `${p}.render.${key}`);
    }
    object(a.process, `${p}.process`);
    for (const key of ['writer_rounds', 'review_rounds']) {
      if (a.process[key] === null) text(a.process.unknown_reason, `${p}.process.unknown_reason`);
      else if (!Number.isInteger(a.process[key]) || a.process[key] < 0) fail(`${p}.process.${key}`, 'expected nonnegative integer or null');
    }
    array(a.process.resources, `${p}.process.resources`);
    for (const resource of a.process.resources) {
      object(resource, `${p}.resource`);
      if (typeof resource.value !== 'number' || !Number.isFinite(resource.value) || resource.value < 0) fail(`${p}.resource.value`, 'expected nonnegative finite number');
      text(resource.unit, `${p}.resource.unit`); text(resource.boundary, `${p}.resource.boundary`);
      array(resource.evidence, `${p}.resource.evidence`); if (!resource.evidence.length) fail(`${p}.resource.evidence`, 'source evidence required');
      for (const e of resource.evidence) { fileAsset(e, root, `${p}.resource.evidence`); text(e.locator, `${p}.resource.evidence.locator`); }
    }
  }
  return manifest;
}
function artifactAssets(a) { return [a.commission, a.source_story, a.viewed_story, ...a.renders, ...a.process.resources.flatMap(r => r.evidence)]; }
function refs(refs, field, allowed, locator = true, required = false) {
  array(refs, field); if (required && refs.length === 0) fail(field, 'concrete evidence required');
  for (const e of refs) {
    object(e, field); pathName(e.path, `${field}.path`); hash(e.sha256, `${field}.sha256`);
    if (allowed.has(e.path) && allowed.get(e.path) !== e.sha256) fail(field, `misattributed evidence hash for ${e.path}`);
    if (locator) text(e.locator, `${field}.locator`);
  }
}
function validateScore(score, field, max, materials) {
  object(score, field);
  nullableText(score.uncertainty, `${field}.uncertainty`);
  refs(score.evidence, `${field}.evidence`, materials, true, score.value !== null);
  for (const e of score.evidence) if (!materials.has(e.path)) fail(`${field}.evidence`, 'evidence must identify a declared viewed material');
  if (score.value === null) {
    text(score.missing_reason, `${field}.missing_reason`);
    if (typeof score.reason !== 'string') fail(`${field}.reason`, 'expected string');
  } else {
    if (!Number.isInteger(score.value) || score.value < (max === 10 ? 1 : 0) || score.value > max) fail(field, `expected integer ${max === 10 ? 1 : 0}–${max} or null`);
    text(score.reason, `${field}.reason`); if (score.missing_reason !== null) fail(`${field}.missing_reason`, 'must be null for a score');
  }
}
function partition(r) { return [...versions.map(k => r[k]), r.instrument_sha256, r.judge.role, r.judge.id, r.judge.requested_model, r.judge.requested_effort, r.judge.served_model, r.judge.served_effort ?? null]; }
function correctionIdentity(r) { return [r.kind, r.artifact_id, r.artifact_sha256, Object.entries(r.render_sha256).sort(), ...partition(r), ...(r.kind === 'check' ? [r.check_id, r.target, r.scope] : [])]; }
export function validateRecords(records, { manifest, instrument, root }) {
  manifestIdentity(manifest, instrument); array(records, 'records');
  const seen = new Map(); const superseded = new Set();
  for (const r of records) {
    object(r, 'record'); const p = `record ${r.id ?? '?'}`;
    text(r.id, `${p}.id`); if (seen.has(r.id)) fail(p, 'duplicate record id');
    if (r.schema !== 1) fail(`${p}.schema`, 'unsupported version');
    if (!['judgment', 'check'].includes(r.kind)) fail(`${p}.kind`, 'expected judgment or check');
    if (typeof r.at !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(r.at) || !Number.isFinite(Date.parse(r.at)) || new Date(r.at).toISOString().replace('.000Z','Z') !== r.at.replace('.000Z','Z')) fail(`${p}.at`, 'expected valid ISO UTC timestamp');
    for (const key of versions) if (r[key] !== instrument[key]) fail(`${p}.${key}`, 'unsupported version or instrument');
    if (r.instrument_sha256 !== manifest.instrument_sha256) fail(`${p}.instrument_sha256`, 'instrument hash mismatch');
    const a = manifest.artifacts.find(a => a.artifact_id === r.artifact_id); if (!a) fail(`${p}.artifact_id`, 'unknown artifact');
    if (r.artifact_sha256 !== a.viewed_story.sha256) fail(`${p}.artifact_sha256`, 'viewed story hash mismatch');
    keys(r.render_sha256, a.renders.map(render => render.render_id), `${p}.render_sha256`);
    for (const render of a.renders) if (r.render_sha256[render.render_id] !== render.sha256) fail(`${p}.render_sha256`, 'render hash mismatch');
    object(r.judge, `${p}.judge`); if (!['human','ai'].includes(r.judge.role)) fail(`${p}.judge.role`, 'expected human or ai'); text(r.judge.id, `${p}.judge.id`);
    for (const key of ['requested_model', 'requested_effort', 'served_model']) {
      nullableText(r.judge[key], `${p}.judge.${key}`);
      if (r.judge.role === 'human' && r.judge[key] !== null) fail(`${p}.judge.${key}`, 'human model fields must be null (not applicable)');
      if (r.judge[key] === null) text(r.judge.unknown_reason, `${p}.judge.unknown_reason`);
    }
    nullableText(r.judge.unknown_reason, `${p}.judge.unknown_reason`);
    if (own(r.judge, 'served_effort')) { nullableText(r.judge.served_effort, `${p}.judge.served_effort`); if (r.judge.served_effort === null) text(r.judge.unknown_reason, `${p}.judge.unknown_reason`); if (r.judge.role === 'human' && r.judge.served_effort !== null) fail(`${p}.judge.served_effort`, 'human model fields are not applicable'); }
    const x = r.exposure; object(x, `${p}.exposure`); object(x.unknown_reasons, `${p}.exposure.unknown_reasons`);
    const assets = new Map(artifactAssets(a).map(e => [e.path, e.sha256]));
    refs(x.materials, `${p}.exposure.materials`, assets, false);
    if (root !== undefined) for (const e of x.materials) fileAsset(e, root, `${p}.exposure.materials`);
    const materials = new Map(x.materials.map(e => [e.path, e.sha256]));
    if (materials.size !== x.materials.length) fail(`${p}.exposure.materials`, 'duplicate material path');
    if (materials.get(a.viewed_story.path) !== a.viewed_story.sha256) fail(`${p}.exposure.materials`, 'must include the exact viewed story');
    for (const key of ['stage','order','prior_exposure','treatment_visible','model_visible','prior_ratings_visible','retrospective','viewed_sizes']) {
      if (!own(x, key)) fail(`${p}.exposure.${key}`, 'required field');
      if (x[key] === null) { text(x.unknown_reasons[key], `${p}.exposure.unknown_reasons.${key}`); continue; }
      if (['treatment_visible','model_visible','prior_ratings_visible','retrospective'].includes(key) && typeof x[key] !== 'boolean') fail(`${p}.exposure.${key}`, 'expected boolean or null');
      if (key === 'stage') text(x[key], `${p}.exposure.${key}`);
      if (key === 'order') positive(x[key], `${p}.exposure.${key}`);
      if (key === 'prior_exposure' && typeof x[key] !== 'boolean') text(x[key], `${p}.exposure.${key}`);
      if (key === 'viewed_sizes') {
        array(x[key], `${p}.exposure.viewed_sizes`);
        for (const size of x[key]) {
          object(size, `${p}.exposure.viewed_sizes`); text(size.target, `${p}.exposure.viewed_sizes.target`);
          for (const dim of ['width_px','height_px']) positive(size[dim], `${p}.exposure.viewed_sizes.${dim}`);
        }
      }
    }
    if (r.kind === 'judgment') {
      keys(r.scores, instrument.human_dimensions.map(d => d.id), `${p}.scores`);
      for (const [key,s] of Object.entries(r.scores)) validateScore(s, `${p}.${key}`, 10, materials);
      if (r.judge.role === 'human') { if (r.diagnostics !== null) fail(`${p}.diagnostics`, 'human diagnostics must be null'); }
      else { keys(r.diagnostics, instrument.diagnostics.map(d => d.id), `${p}.diagnostics`); for (const [key,s] of Object.entries(r.diagnostics)) validateScore(s, `${p}.diagnostics.${key}`, 2, materials); }
      nullableText(r.verbatim_comment, `${p}.verbatim_comment`); nullableText(r.most_useful_improvement, `${p}.most_useful_improvement`);
      if (![...Object.values(r.scores), ...Object.values(r.diagnostics ?? {})].some(s => s.value !== null) && !r.verbatim_comment && !r.most_useful_improvement) fail(p, 'empty form is not a response or assessment');
    } else {
      const definition = instrument.checks.find(c => c.id === r.check_id); if (!definition) fail(`${p}.check_id`, 'unsupported check');
      if (r.gate !== definition.gate) fail(`${p}.gate`, 'check gate mismatch');
      for (const key of ['target','scope','method','reason']) text(r[key], `${p}.${key}`);
      nullableText(r.follow_up, `${p}.follow_up`);
      if (!['pass','fail','unresolved','not-applicable'].includes(r.outcome)) fail(`${p}.outcome`, 'unsupported outcome');
      for (const key of ['material','central']) if (typeof r[key] !== 'boolean') fail(`${p}.${key}`, 'expected boolean');
      refs(r.evidence, `${p}.evidence`, materials, true, ['pass','fail'].includes(r.outcome));
      for (const e of r.evidence) if (!materials.has(e.path)) fail(`${p}.evidence`, 'evidence must identify a declared viewed material');
      if (r.gate === 'G4' && ['pass','fail'].includes(r.outcome) && !a.renders.some(render => r.evidence.some(e => e.path === render.path && e.sha256 === render.sha256) && x.viewed_sizes?.some(size => size.target === render.render_id))) fail(`${p}.evidence`, 'visual pass/fail requires viewed render evidence and actual reported size');
    }
    if (r.supersedes === null) { if (r.correction_reason !== null) fail(`${p}.correction_reason`, 'must be null for an independent record'); }
    else {
      text(r.supersedes, `${p}.supersedes`); text(r.correction_reason, `${p}.correction_reason`);
      const previous = seen.get(r.supersedes); if (!previous) fail(`${p}.supersedes`, 'target must be an earlier record; cycles are prohibited');
      if (superseded.has(r.supersedes)) fail(`${p}.supersedes`, 'target is no longer active; correction branch prohibited');
      if (!same(correctionIdentity(previous), correctionIdentity(r))) fail(`${p}.supersedes`, 'correction identity/version/model/artifact/check scope mismatch');
      superseded.add(r.supersedes);
    }
    seen.set(r.id, r);
  }
  return records;
}
export function readJournal(file) {
  let content; try { content = readFileSync(file, 'utf8'); } catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  if (!content) return [];
  const lines = content.split('\n'); if (lines.at(-1) === '') lines.pop();
  return lines.map((line, i) => { try { return JSON.parse(line); } catch (error) { fail(`${file}:${i + 1}`, `malformed/truncated JSON: ${error.message}`); } });
}
export function appendRecord(file, record, { root, manifest, instrument }) {
  validateManifest(manifest, {root, instrument});
  const records = readJournal(file); validateRecords([...records, record], {manifest, instrument, root});
  let bytes; try { bytes = readFileSync(file); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (bytes?.length && bytes.at(-1) !== 10) fail(file, 'nonempty journal must end with a final newline');
  const line = JSON.stringify(record); appendFileSync(file, `${line}\n`, 'utf8');
}
const md = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('|','\\|').replaceAll('\r','').replaceAll('\n','<br>');
const json = value => md(JSON.stringify(value));
const assetLink = (e, linkBase) => `[${md(e.path).replaceAll('[', '\\[').replaceAll(']', '\\]')}](${posix.relative(linkBase || '.', e.path).split('/').map(encodeURIComponent).join('/').replaceAll('(', '%28').replaceAll(')', '%29')}) sha256=${e.sha256}${e.locator ? ` locator=${md(e.locator)}` : ''}`;
function details(r, artifact, link) {
  const lines = [`### ${md(r.id)} — ${md(r.kind)}`, '', `Artifact: ${md(r.artifact_id)}; story=${md(artifact.story_id)}; topic=${md(artifact.topic)}; viewed sha256=${r.artifact_sha256}; renders=${json(r.render_sha256)}.`, '', `Source: ${link(artifact.source_story)}. Viewed: ${link(artifact.viewed_story)}. Commission: ${link(artifact.commission)}.`, '', `At: ${md(r.at)}; judge=${json(r.judge)}.`, '', `Versions: ${versions.map(k=>`${k}=${md(r[k])}`).join('; ')}; instrument_sha256=${r.instrument_sha256}.`, '', `Exposure: ${json(r.exposure)}.`, ''];
  if (r.kind === 'judgment') {
    lines.push('| Dimension | Value | Reason / missing reason | Evidence | Uncertainty |', '| --- | --- | --- | --- | --- |');
    for (const [key,s] of [...Object.entries(r.scores), ...Object.entries(r.diagnostics ?? {})]) lines.push(`| ${md(key)} | ${s.value ?? 'missing'} | ${md(s.value === null ? s.missing_reason : s.reason)} | ${s.evidence.map(link).join('; ')} | ${md(s.uncertainty ?? 'not stated')} |`);
    lines.push('', `Verbatim comment: ${json(r.verbatim_comment)}.`, '', `Most useful improvement: ${json(r.most_useful_improvement)}.`, '');
  } else lines.push(`Check: ${md(r.check_id)} / ${md(r.gate)}; outcome=${md(r.outcome)}; material=${r.material}; central=${r.central}.`, '', `Target: ${md(r.target)}. Scope: ${md(r.scope)}. Method: ${md(r.method)}.`, '', `Reason: ${md(r.reason)}. Follow-up: ${md(r.follow_up ?? 'not stated')}. Evidence: ${r.evidence.map(link).join('; ') || 'none; unresolved/unassessed'}.`, '');
  if (r.supersedes) lines.push(`Supersedes ${md(r.supersedes)}: ${md(r.correction_reason)}.`, '');
  return lines;
}
export function renderReport(records, { manifest, instrument, linkBase = '' }) {
  if (linkBase !== '') pathName(linkBase, 'linkBase');
  const link = e => assetLink(e, linkBase);
  validateRecords(records, {manifest, instrument});
  const dead = new Set(records.map(r=>r.supersedes).filter(Boolean));
  const active = records.filter(r=>!dead.has(r.id)); const judgments = active.filter(r=>r.kind === 'judgment'); const checks = active.filter(r=>r.kind === 'check');
  const artifact = id => manifest.artifacts.find(a=>a.artifact_id === id);
  const human = judgments.filter(r=>r.judge.role === 'human'); const ai = judgments.filter(r=>r.judge.role === 'ai');
  const unique = values => new Set(values).size;
  const lines = ['# Story quality observations', '', `Study: ${md(manifest.study_id)}. Population: ${md(manifest.population)}.`, '', `Owner observations: ${human.length}; AI observations: ${ai.length}.`, '', `Unique observed stories: ${unique(judgments.map(r=>artifact(r.artifact_id).story_id))}; Unique observed topics: ${unique(judgments.map(r=>artifact(r.artifact_id).topic))}.`, '', `Active judgment rows: ${judgments.length}; active check rows: ${checks.length}; scored human dimensions: ${judgments.flatMap(r=>Object.values(r.scores)).filter(s=>s.value !== null).length}; scored diagnostic dimensions: ${judgments.flatMap(r=>Object.values(r.diagnostics ?? {})).filter(s=>s.value !== null).length}; declared chart assets: ${manifest.artifacts.reduce((n,a)=>n+a.renders.length,0)}.`, '', 'Coverage counts describe observations, never calibration or publication approval.', '', '## Artifact coverage and scoped checks', ''];
  for (const a of manifest.artifacts) {
    const ownerCount = human.filter(r=>r.artifact_id === a.artifact_id).length; const aiCount = ai.filter(r=>r.artifact_id === a.artifact_id).length; const checked = checks.filter(r=>r.artifact_id === a.artifact_id);
    lines.push(`### ${md(a.artifact_id)}`, '', `Owner observations: ${ownerCount}; AI observations: ${aiCount}. ${ownerCount && aiCount ? 'Both roles represented; independent observations remain separate.' : 'Missing coverage: '+[!ownerCount?'owner':null,!aiCount?'AI':null].filter(Boolean).join(', ')+'.'}`, '');
    if (checked.some(r=>r.outcome === 'fail' && r.material)) lines.push('repair-required: material failed check in named scope.', '');
    if (checked.some(r=>r.outcome === 'unresolved' && r.central)) lines.push('verification-required: unresolved central check in named scope.', '');
    lines.push(`Checked scopes: ${checked.map(r=>`${md(r.check_id)}: ${md(r.scope)} (${md(r.outcome)})`).join('; ') || 'none'}.`, '', `Unassessed regions: all claims, pipeline steps and render variants outside these exact recorded scopes; missing checks: ${instrument.checks.filter(c=>!checked.some(r=>r.check_id === c.id)).map(c=>c.id).join(', ') || 'other targets within each check family'}.`, '');
  }
  lines.push('## Active observations by identity and version partition', '');
  const groups = new Map(); for (const r of active) { const key = JSON.stringify(partition(r)); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(r); }
  for (const [key,rows] of groups) { lines.push(`Partition: ${md(key)}`, ''); for (const r of rows) lines.push(...details(r, artifact(r.artifact_id), link)); }
  lines.push('## Superseded history', '');
  for (const r of records.filter(r=>dead.has(r.id))) { lines.push(`Superseded record ${md(r.id)}; replaced by ${md(records.find(x=>x.supersedes === r.id).id)}.`, '', ...details(r, artifact(r.artifact_id), link)); }
  if (!dead.size) lines.push('None.', '');
  return lines.join('\n');
}
