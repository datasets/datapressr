// Local packet preparation only: no rendering, model calls, scoring or publication.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pngSize } from './render.mjs';

export function singleLeadingTitle(markdown) {
  return markdown.replace(/^(# [^\n]+\n)\n\1\n/, '$1\n');
}

/** Copy already rendered pages into a new reader-only directory. Keep the returned
 * administrative manifest outside that directory. Screenshots must show the complete
 * visible story; this utility cannot establish capture completeness or readability. */
export function prepareReaderPacket({ out, images }) {
  if (!Array.isArray(images) || images.length === 0) throw new Error('Nonempty images required');
  // Validate all inputs before creating output; never overwrite a frozen packet.
  const pages = images.map((image, i) => {
    for (const key of ['display_width_px', 'display_height_px']) {
      if (!Number.isInteger(image[key]) || image[key] <= 0) throw new Error(`${key}: positive display size required`);
    }
    const bytes = readFileSync(image.path);
    const { width, height } = pngSize(bytes);
    return { bytes, path: `page-${i + 1}.png`, sha256: createHash('sha256').update(bytes).digest('hex'), width_px: width, height_px: height, intended_display_width_px: image.display_width_px, intended_display_height_px: image.display_height_px };
  });
  mkdirSync(out);
  for (const page of pages) writeFileSync(join(out, page.path), page.bytes, { flag: 'wx' });
  writeFileSync(join(out, 'README.md'), `# Reading packet\n\nRead only the rendered pages below, in order. They contain the visible prose and images. Record prior exposure and the actual displayed size or any automatic scaling; intended dimensions do not prove native-size viewing. Do not read HTML, SVG, alt text, hidden captions, source data, expected answers or diagnostic anchors before freezing both spontaneous and prompted responses. If assistance was already seen, disclose it; this reading is source-assisted rather than unaided. Accessibility reading is a separate explicitly declared scope.\n\n${pages.map(p => `- ${p.path}: intended display ${p.intended_display_width_px} × ${p.intended_display_height_px}px; intrinsic ${p.width_px} × ${p.height_px}px.`).join('\n')}\n\nSave a spontaneous takeaway before receiving the pre-frozen comprehension prompts. Freeze prompted answers before source verification or diagnostic anchors. If labels cannot be read at the delivered size, say so before enlargement; record any later enlargement separately.\n`, { flag: 'wx' });
  return { version: 'reader-packet-v2', mode: 'ordinary-rendered', pages: pages.map(({ bytes, ...page }) => page) };
}

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
function responseRecord(ref, stage) {
  if (!ref || !nonempty(ref.path) || !/^[a-f0-9]{64}$/.test(ref.sha256)) throw new Error(`${stage}: pinned response required`);
  const bytes = readFileSync(ref.path);
  if (digest(bytes) !== ref.sha256) throw new Error(`${stage}: frozen response hash mismatch`);
  const record = JSON.parse(bytes);
  if (!record || typeof record !== 'object' || record.version !== 'reader-response-v2' || record.stage !== stage || !nonempty(record.response) || !/^[a-f0-9]{64}$/.test(record.packet_sha256) || !['ordinary-rendered', 'accessibility'].includes(record.mode) || !Array.isArray(record.assistance) || record.assistance.some(a => !nonempty(a))) throw new Error(`${stage}: malformed response`);
  return record;
}

/** Freeze verbatim text before releasing the next stage. Returned refs must be kept by
 * the custodian outside the reader directory. This cannot police out-of-band access. */
export function freezeReaderResponse({ path, stage, response, packetSha256, spontaneous, mode = 'ordinary-rendered', assistance = [] }) {
  if (!['spontaneous', 'prompted'].includes(stage) || !nonempty(response) || !/^[a-f0-9]{64}$/.test(packetSha256) || !['ordinary-rendered', 'accessibility'].includes(mode) || !Array.isArray(assistance) || assistance.some(a => !nonempty(a))) throw new Error('Invalid response, stage, packet hash, mode or assistance');
  if (stage === 'prompted') {
    const first = responseRecord(spontaneous, 'spontaneous');
    if (first.packet_sha256 !== packetSha256 || first.mode !== mode) throw new Error('Spontaneous response packet/mode mismatch');
  }
  const record = { version: 'reader-response-v2', stage, packet_sha256: packetSha256, mode, assistance, response, frozen_at: new Date().toISOString(), spontaneous_sha256: stage === 'prompted' ? spontaneous.sha256 : null };
  const bytes = `${JSON.stringify(record, null, 2)}\n`;
  writeFileSync(path, bytes, { flag: 'wx' });
  return { path, sha256: digest(bytes) };
}

/** A release attestation, not source delivery or an unaided-comprehension verdict. */
export function releaseVerification({ spontaneous, prompted }) {
  const first = responseRecord(spontaneous, 'spontaneous');
  const second = responseRecord(prompted, 'prompted');
  if (second.spontaneous_sha256 !== spontaneous.sha256 || first.packet_sha256 !== second.packet_sha256 || first.mode !== second.mode) throw new Error('Prompted response is not bound to this spontaneous response and packet');
  return { version: 'reader-release-v2', packet_sha256: first.packet_sha256, spontaneous, prompted, released_at: new Date().toISOString(), reading_scope: first.mode === 'accessibility' ? 'accessibility' : [...first.assistance, ...second.assistance].length ? 'source-assisted' : 'ordinary-rendered-assistance-not-declared' };
}
