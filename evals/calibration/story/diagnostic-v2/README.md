# Reference-led manual diagnostic and packet procedure v2

Identity: `reference-led-manual-v2`, 30 October 2026. Additive development repair for `datapressr-8no.9.9`. The [v1 procedure](../reference-led-protocol.md), frozen reference-led-v1 artifacts, runtime rubrics, tracking-v0.1 instrument and installed story skill remain unchanged. This is not a calibrated judge, model-evaluation authorization or evidence of improved story quality.

## Why this revision exists

The exposed [v1 decisions](../../../experiments/story-quality/reference-led-v1/decisions.md) identify three conflations: a supported bounded payoff with an answer to the commission; a valid accounting/descriptive relationship with a stronger causal lede; and recoverable primary-chart comparisons with readable delivery. They also record duplicate packet titles and two prompted readings after source verification/anchors. The [workshop reader](../../../development/story-craft-workshop-v1/reader-first.md) explicitly read HTML source, hidden captions and alt text before relying on screenshots; correct answers therefore do not establish unaided visual comprehension. Preserve those historical limitations rather than recoding old observations.

## Delivery and custody

The custodian freezes this protocol, the exact commission, prewritten comprehension prompts, packet manifest and source/anchor materials by SHA-256 before a reading. Keep administrative identities, source paths, expected answers and prior ratings outside the reader directory. Prior topic/treatment/source exposure remains declared, and a fresh reader does not make development material held out.

For **ordinary rendered reading**, deliver only the rasterized visible story, including visible prose and charts, at the intended reading sizes. Do not deliver source Markdown, HTML, SVG, hidden captions or alt text as a surrogate for what was visible. A whole-page image that the image tool silently shrinks is not evidence of actual-size chart reading: use readable sequential captures/crops without omitted text, retain the full page for context, and record actual viewed dimensions/scaling. The custodian independently checks page completeness, order and one visible title before freezing delivery. `singleLeadingTitle` only removes the exact identical leading Markdown duplicate observed in v1; it is not a general HTML/title detector. The existing pilot builder uses this same correction and remains byte-stable.

For **accessibility reading**, preserve appropriate alt text, semantic HTML and accessible descriptions and explicitly identify that mode and assistance. This is a valid separate task; do not merge its results into an unaided visual-comprehension outcome. If HTML/source/alt text was already read in an ordinary session, preserve the observation as source-assisted. Do not erase exposure or restart it under a clean label.

`prepareReaderPacket` in [reader-packet.mjs](../../../lib/reader-packet.mjs) accepts already rendered PNGs with intended display sizes and writes a new, exclusive directory containing only neutral instructions and copied PNGs. Its returned administrative manifest retains exact hashes, intrinsic dimensions and intended display dimensions; save it outside the reader directory and pin its bytes. It does not render HTML, prove complete capture, force the reader's viewer size, inspect labels, or sandbox the reader. PNG header validation establishes dimensions, not successful decoding or legibility. Existing [renderCharts](../../../lib/render.mjs) remains the renderer for standalone charts.

Sequence:

1. The reader receives only the commission and visible reading packet (or the explicitly declared accessibility equivalent), records prior exposure and actual viewing conditions, then gives a spontaneous main takeaway, what changed their understanding and weakest passage. Freeze that verbatim response.
2. Release only the pre-frozen neutral comprehension prompts. Ask for the central comparison's direction, magnitude where relevant, units/denominator and group/time identities; include the chart supporting the most consequential secondary claim. Ask what question remains unanswered without supplying the expected answer. Freeze prompted responses before verification, coding anchors, source text or treatment reveal.
A chart-only comprehension outcome requires a separate reading before any prose or explanatory caption assistance, with that exposure and response frozen. A reader who has already read the full story can supply a story-assisted chart response, not an unaided chart-only result. Use separate scope labels; do not silently subtract prior prose exposure. This procedure authorizes no additional reader/model batch.

3. Call `releaseVerification` only after both response refs are frozen. Then release source/diagnostic materials to the verifier and record the release attestation, reader identity, exposure, prompt hash and packet hash in the existing experiment custody record. The utility verifies response hashes and that prompted responses link to the earlier spontaneous response and same packet/mode. It preserves declared assistance. No declaration of assistance is not proof of no assistance.
4. Independently verify the claims and every required delivered-size render; only then code the diagnostic outcomes below. Retain original responses and scoped verification separately. Enlarged/reconstructed readings can be recorded later but cannot replace the original rendered-reading outcome.

Example local custody API (administrative paths stay outside the reader directory):

```js
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { prepareReaderPacket, freezeReaderResponse, releaseVerification } from '../../../lib/reader-packet.mjs';
const manifest = prepareReaderPacket({out: '/new/reader', images: [{path: '/capture/page.png', display_width_px: 390, display_height_px: 600}]});
const bytes = JSON.stringify(manifest, null, 2) + '\n';
writeFileSync('/admin/packet.json', bytes, {flag: 'wx'});
const packetSha256 = createHash('sha256').update(bytes).digest('hex');
// Execute each call only at its actual stage, using the reader's verbatim text.
const spontaneous = freezeReaderResponse({path: '/admin/spontaneous.json', stage: 'spontaneous', response: actualSpontaneousText, packetSha256, assistance: []});
const prompted = freezeReaderResponse({path: '/admin/prompted.json', stage: 'prompted', response: actualPromptedText, packetSha256, spontaneous, assistance: []});
const release = releaseVerification({spontaneous, prompted});
writeFileSync('/admin/release.json', JSON.stringify(release, null, 2) + '\n', {flag: 'wx'});
```

The helpers prevent overwriting through this API and reject changed pinned response bytes or missing/malformed responses. They cannot prevent a reader with filesystem access from opening sources early, fabricate trust in supplied timestamps or establish independent identity. Stage delivery, prompt custody, complete exposure recording and independent review remain the custodian's duties. Declare any violation instead of claiming technical enforcement the helper does not provide.

## Separate diagnostic decisions

Record the exact claim/passage, reader wording, evidence locator, judgment and reason for each row. Use `supported`, `unsupported`, `unresolved` or `absent` as appropriate; preserve missing evidence without forced scores. Do not average these decisions.

| Decision | What is judged | What does not establish it |
| --- | --- | --- |
| Bounded payoff | The worthwhile comparison actually recovered, supported within its units/population/time scope | Whether the full commissioned question was answered |
| Commission answer | Full, partial, unanswered or unresolved answer to the frozen main question, with the unsupported/unanswered remainder named | A true narrower comparison or an engaging story |
| Central claim | Independently select the actual lede/central explanation; classify descriptive, accounting, causal or attributed mechanism; verify its exact scope | The first eligible easier relationship elsewhere in the story |
| First eligible descriptive/accounting relationship | Freeze selection independently of the central claim and retain its narrower support judgment | Support for a causal lede, ratio trajectory or other population/series |
| Qualified attribution | Check the permitted source's passage, units, population, series and reach; accept correctly qualified verified attribution | Causal identification; a named but unread source; switching futures to spot or central to all government |
| Chart recovery | Record direction, magnitude, unit/denominator and identities recovered before prose/source/zoom assistance; keep each required chart separate | Label legibility, absence of clipping, or an answer reconstructed from prose |
| Delivered rendering | Inspect retained images at actual reported size for clipping, collision and readable labels; identify each chart/viewport and unresolved region | SVG existence, successful generation, dimensions alone or a readable primary comparison |

For a debt ratio, deficit financing concerns the numerator; GDP and stock-flow adjustments can be material to the ratio trajectory. A correct descriptive/accounting link is not a causal explanation. A permitted verified mechanism attribution may be a useful supported answer within its stated reach even when the local CSV contains only outcomes. Missing external verification remains unresolved, not automatically false.

## Deterministic custody tests and manual controls

[controls.json](controls.json) contains six synthetic exposed controls grounded in the failure classes above: incomplete causal answer despite true payoff, ratio overstatement, population switch, futures/spot switch, valid qualified attribution and unavailable attribution. Their expected labels are hypotheses for independent manual review, not outputs of an automated claim classifier. The reviewer must reject the negatives, accept the correctly qualified attribution within its scope and preserve the unavailable-source case as unresolved. Do not report these six as held-out detection accuracy.

The [rendered fixture](rendered/manifest.json) contains an intentionally clipped title and overlapping footer, followed by a corrected 360px-wide rendition. The main A=10/B=20 comparison remains recoverable in both. Thus recovery can pass while render quality fails. Source-only title/description assistance exists in the SVG fixture but is absent from the PNG reader packet's text. The fixture is synthetic; no external mechanism source, fresh case or model call is used.

Reproduce into a **new** directory with `node evals/calibration/story/diagnostic-v2/build-fixtures.mjs /absolute/new-output-directory` using the existing Chrome/sips renderer. Inspect `reader/page-1.png` at 360×220 and `reader/page-2.png` at 360×260. Source files and expected judgments remain administrative. The fixture builder does not judge its own images.

Run `node --test evals/lib/reader-packet.test.mjs evals/lib/story-quality-tracker.test.mjs evals/calibration/story/tracking-v0.1/prepare-pilot.test.mjs`. Tests exercise source exclusion, immutable packet/response writes, response order/hash linkage, source-assistance disclosure, single-title correction, PNG dimension mismatch, stale review hashes, absent/malformed review evidence and G4 evidence requirements. The existing tracker CLI verifies current image hashes and PNG intrinsic dimensions against its manifest; pass/fail G4 records require a pinned viewed render and actual reported size. No review remains unassessed, not passed. Any re-render invalidates the old image hash; a new scoped review is required before acceptance.

Neither the tests nor the fixture prove universal clipping detection, readable mobile labels, user comprehension, owner taste, calibrated ratings or skill efficacy. Independent review and exact revisions are recorded in the [handoff](../../../../docs/handoffs/2026-10-30-diagnostic-repair.md).
