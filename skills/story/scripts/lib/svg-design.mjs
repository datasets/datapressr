// Design checks on story chart SVGs, dependency-free (story-check runs with no install).
//
// The rules come from the story-remakes design audit (factory, 2026-11-12) and the
// information-design principles it cites; charting.md states each one with its check
// question. A chart built with the template's frame() carries `data-dp-frame`; for those,
// measurable defects (no title/source/accessible name, text too small on a phone, text
// contrast) FAIL. Older charts get the same findings as warnings, so published packages
// don't newly fail. Taste rules (accents, colour-blind pairs, mobile height, mobile keys)
// are always warnings: legitimate charts can trip them.
//
// The parser is a small tag walker, not a full XML parser: it tracks inherited
// font-size, fill, colour, translate() offsets and aria-labels, which is all Plot
// output and the template's frame need.

export const PHONE_PX = 326; // a 390 px phone shows the chart in a ~326 px column
export const DESKTOP_PX = 720;
export const MIN_TEXT_PX = 11; // rendered, on the device the SVG is shown on
export const MOBILE_MAX_H = 560; // graphic height at 360 px wide
export const MAX_ACCENTS = 2; // hue families besides greys and ink

// --- Colour -----------------------------------------------------------------------

const NAMED = { white: "#ffffff", black: "#000000", red: "#ff0000", green: "#008000", blue: "#0000ff", orange: "#ffa500", steelblue: "#4682b4", gray: "#808080", grey: "#808080", none: null, transparent: null };

export function parseColour(v) {
  if (v == null) return null;
  v = String(v).trim().toLowerCase();
  if (v in NAMED) return NAMED[v];
  let m = v.match(/^#([0-9a-f]{3})$/);
  if (m) return "#" + [...m[1]].map((c) => c + c).join("");
  m = v.match(/^#([0-9a-f]{6})(?:[0-9a-f]{2})?$/);
  if (m) return "#" + m[1];
  m = v.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (m) return "#" + m.slice(1, 4).map((n) => Math.min(255, +n).toString(16).padStart(2, "0")).join("");
  return null; // currentColor, url(#...), inherit: resolved by the caller or ignored
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const unlin = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const luminance = (hex) => {
  const [r, g, b] = rgb(hex).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG contrast ratio of two hex colours. */
export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** `hex` drawn at `opacity` over `bg`. */
export function blend(hex, opacity, bg = "#ffffff") {
  const f = rgb(hex), g = rgb(bg);
  return "#" + f.map((c, i) => Math.round((c * opacity + g[i] * (1 - opacity)) * 255).toString(16).padStart(2, "0")).join("");
}

function lab(hex) {
  const [r, g, b] = rgb(hex).map(lin);
  const xyz = [
    (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047,
    0.2126 * r + 0.7152 * g + 0.0722 * b,
    (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883,
  ].map((t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116));
  return [116 * xyz[1] - 16, 500 * (xyz[0] - xyz[1]), 200 * (xyz[1] - xyz[2])];
}
const chroma = (hex) => Math.hypot(lab(hex)[1], lab(hex)[2]);
const hue = (hex) => ((Math.atan2(lab(hex)[2], lab(hex)[1]) * 180) / Math.PI + 360) % 360;

// Machado, Oliveira & Fernandes (2009), severity 1.0, applied in linear RGB.
const CVD = {
  protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
};
export function simulateCvd(hex, type) {
  const c = rgb(hex).map(lin);
  const out = CVD[type].map((row) => row.reduce((s, k, i) => s + k * c[i], 0));
  return "#" + out.map((v) => Math.round(Math.min(1, Math.max(0, unlin(v))) * 255).toString(16).padStart(2, "0")).join("");
}

const NEUTRAL_CHROMA = 15; // greys and ink (#111827, #6b7280, #b6bcc6) sit well below this
const isNeutral = (hex) => chroma(hex) < NEUTRAL_CHROMA;

/** Group saturated colours into hue families (30° buckets around the first member). */
export function hueFamilies(colours) {
  const fams = [];
  for (const c of [...new Set(colours)].filter((c) => !isNeutral(c)).sort((a, b) => chroma(b) - chroma(a))) {
    const h = hue(c);
    const f = fams.find((f) => Math.min(Math.abs(f.hue - h), 360 - Math.abs(f.hue - h)) < 30);
    if (f) f.members.push(c);
    else fams.push({ hue: h, rep: c, members: [c] });
  }
  return fams;
}

/** Pairs of hue families that normal vision separates but protanopia or deuteranopia merges. */
export function cvdConfusions(colours) {
  const reps = hueFamilies(colours).map((f) => f.rep);
  const out = [];
  for (let i = 0; i < reps.length; i++) {
    for (let j = i + 1; j < reps.length; j++) {
      const [a, b] = [reps[i], reps[j]];
      for (const type of Object.keys(CVD)) {
        // Simulated, the pair keeps only lightness and a yellow-blue axis. Confusable when
        // the lightness gap is small and the simulated hues are close (red vs green:
        // two olives of similar lightness). Lab distance alone overweights chroma.
        const [sa, sb] = [simulateCvd(a, type), simulateCvd(b, type)];
        const dL = Math.abs(lab(sa)[0] - lab(sb)[0]);
        const dh = Math.abs(hue(sa) - hue(sb));
        const close = Math.min(dh, 360 - dh) < 25 || Math.min(chroma(sa), chroma(sb)) < NEUTRAL_CHROMA;
        if (dL < 12 && close) { out.push({ a, b, type, deltaL: Math.round(dL * 10) / 10 }); break; }
      }
    }
  }
  return out;
}

// --- Parsing ----------------------------------------------------------------------

const attrsOf = (s) => {
  const a = {};
  for (const m of s.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) a[m[1]] = m[2] ?? m[3];
  return a;
};
const styleOf = (s) => {
  const o = {};
  for (const d of (s ?? "").split(";")) {
    const i = d.indexOf(":");
    if (i > 0) o[d.slice(0, i).trim().toLowerCase()] = d.slice(i + 1).trim();
  }
  return o;
};
const prop = (a, st, name) => st[name] ?? a[name];

function fontPx(v, parent) {
  if (v == null) return parent;
  const m = String(v).trim().match(/^(-?[\d.]+)\s*(px|em|%|pt)?$/);
  if (!m) return parent;
  const n = +m[1];
  return m[2] === "em" ? n * parent : m[2] === "%" ? (n / 100) * parent : m[2] === "pt" ? (n * 4) / 3 : n;
}
const lengthPx = (v, font) => {
  if (v == null) return 0;
  const m = String(v).trim().match(/^(-?[\d.]+)\s*(em|px)?/);
  return m ? (m[2] === "em" ? +m[1] * font : +m[1]) : 0;
};
function translate(t) {
  let x = 0, y = 0;
  for (const m of (t ?? "").matchAll(/translate\(\s*(-?[\d.e+-]+)(?:[\s,]+(-?[\d.e+-]+))?\s*\)/g)) { x += +m[1]; y += +(m[2] ?? 0); }
  return [x, y];
}
const decode = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

/** Parse an SVG string into the facts the checks need. */
export function parseSvg(svg) {
  const root = attrsOf(svg.match(/<svg\b([^>]*)>/)?.[1] ?? "");
  const vb = (root.viewBox ?? "").split(/[\s,]+/).map(Number);
  const width = vb.length === 4 && vb[2] ? vb[2] : Number(root.width) || 0;
  const height = vb.length === 4 && vb[3] ? vb[3] : Number(root.height) || 0;
  const texts = [], colours = [], gridYs = [];
  let titleEl = false, descEl = false;
  const stack = [{ font: 16, fill: "#000000", color: "#000000", opacity: 1, x: 0, y: 0, aria: "", cls: "", weight: 400, hidden: false, anchor: "start" }];
  let cur = null; // open <text>
  const tags = /<!--[\s\S]*?-->|<style\b[\s\S]*?<\/style>|<(title|desc)\b[^>]*>[\s\S]*?<\/\1>|<(\/?)([\w:-]+)([^>]*?)(\/?)>|([^<]+)/g;
  for (const raw of svg.matchAll(tags)) {
    if (raw[1]) { // <title>/<desc>: an accessible name when a child of the root <svg>
      if (stack.length === 2 && raw[1] === "title") titleEl = true;
      if (stack.length === 2 && raw[1] === "desc") descEl = true;
      continue;
    }
    const m = [raw[0], raw[2], raw[3], raw[4], raw[5], raw[6]];
    if (m[5] !== undefined) { if (cur) cur.raw += m[5]; continue; }
    if (!m[2]) continue;
    const [, close, name, rest, self] = m;
    const tag = name.toLowerCase();
    if (close) {
      if (tag === "text" && cur) { finishText(cur, texts); cur = null; }
      stack.pop();
      continue;
    }
    const a = attrsOf(rest);
    const st = styleOf(a.style);
    const p = stack.at(-1);
    const font = fontPx(prop(a, st, "font-size"), p.font);
    const color = parseColour(prop(a, st, "color")) ?? p.color;
    const rawFill = prop(a, st, "fill");
    const fill = rawFill === "currentColor" ? color : parseColour(rawFill) ?? (rawFill === "none" ? null : p.fill);
    const op = Number(prop(a, st, "fill-opacity") ?? 1) * Number(prop(a, st, "opacity") ?? 1);
    const [tx, ty] = translate(a.transform);
    const nested = tag === "svg" && stack.length > 1;
    const node = {
      font, color, fill, opacity: p.opacity * (Number.isFinite(op) ? op : 1),
      x: p.x + tx + (nested ? lengthPx(a.x, font) : 0), y: p.y + ty + (nested ? lengthPx(a.y, font) : 0),
      aria: a["aria-label"] ?? p.aria, cls: `${p.cls} ${a.class ?? ""}`,
      weight: Number(String(prop(a, st, "font-weight") ?? "").replace("bold", "700")) || p.weight,
      hidden: p.hidden || prop(a, st, "display") === "none" || prop(a, st, "visibility") === "hidden",
      anchor: prop(a, st, "text-anchor") ?? p.anchor,
    };
    if (tag === "text") cur = { node, ax: node.x + lengthPx(a.x, font), ay: node.y + lengthPx(a.y, font), raw: "", lines: 0, sizes: [font], fills: [] };
    else if (tag === "tspan" && cur) { cur.lines++; cur.sizes.push(font); cur.raw += "\n"; }
    else if (tag !== "svg" && tag !== "g" && !cur) {
      for (const k of ["fill", "stroke"]) {
        const v = prop(a, st, k);
        const c = v === "currentColor" ? color : parseColour(v);
        if (c) colours.push(c);
      }
      if (/y-grid/.test(node.aria) && tag === "line") gridYs.push(node.y + Number(a.y1 ?? 0));
    } else if (tag === "g") {
      for (const k of ["fill", "stroke"]) {
        const v = prop(a, st, k);
        const c = parseColour(v);
        if (c && !/axis|grid/.test(node.aria)) colours.push(c);
      }
    }
    if (self || tag === "br") { if (tag === "text" && cur) { finishText(cur, texts); cur = null; } continue; }
    stack.push(node);
  }
  const yTicks = texts.filter((t) => /y-axis tick label/.test(t.aria)).map((t) => t.y - t.size);
  const plotTop = [...gridYs, ...yTicks].length ? Math.min(...gridYs, ...yTicks) : null;
  const framed = /\bdata-dp-frame\b/.test(svg.match(/<svg\b[^>]*>/)?.[0] ?? "");
  const accessibleName = titleEl || !!root["aria-label"] || !!root["aria-labelledby"];
  return { width, height, texts, colours, plotTop, framed, accessibleName, hasDesc: descEl, role: root.role ?? null, background: parseColour(styleOf(root.style).background) ?? "#ffffff" };
}

function finishText(cur, texts) {
  const text = decode(cur.raw.replace(/\s+/g, " ").trim());
  if (!text) return;
  const n = cur.node;
  const longest = Math.max(...cur.raw.split("\n").map((l) => decode(l.replace(/\s+/g, " ").trim()).length));
  texts.push({
    text, lines: Math.max(1, cur.lines), size: Math.min(...cur.sizes), x: cur.ax, y: cur.ay, anchor: n.anchor, longest,
    fill: n.fill ? (n.opacity < 1 ? blend(n.fill, n.opacity) : n.fill) : null,
    weight: n.weight, aria: n.aria, classes: n.cls.trim().split(/\s+/), hidden: n.hidden,
  });
}

// --- Checks -----------------------------------------------------------------------

// Average glyph width in em for system sans (mixed text ~0.52, bold ~0.58).
export const textWidth = (t) => t.longest * t.size * (t.weight >= 600 ? 0.58 : 0.52); // = the template wrap()
const CLIP_TOLERANCE = 4;

const res = (id, pass, severity, message) => ({ id, pass, severity, message });
const isFrameText = (t) => t.classes.some((c) => /^dp-(title|subtitle|source|note)$/.test(c));
const visible = (t) => !t.hidden;

/** Scale from SVG units to on-screen px for the device it is shown on. */
export function displayScale(width, role) {
  const px = role === "desktop" ? DESKTOP_PX : PHONE_PX;
  return width > px ? px / width : 1;
}
const phoneShown = (role) => role !== "desktop";

// Description-style references to marks: "black dot", "red = …", "Grey: 2025", "(grey)".
const COLOUR_WORD = "(?:black|grey|gray|red|blue|green|orange|amber|pink|purple|yellow|open|filled|solid|hollow|dashed|dotted|thin|thick|shaded|light|dark)";
const DESCRIPTION_REF = new RegExp(`\\b${COLOUR_WORD}\\s+(?:dots?|lines?|bars?|circles?|ticks?|band|area|squares?)\\b|^\\s*${COLOUR_WORD}\\s*[:=]|\\(${COLOUR_WORD}\\)`, "i");

/**
 * Check every chart SVG of a story.
 * charts: [{ path, svg (string), role: "desktop" | "mobile" | "only" }]
 *   desktop = has a -mobile sibling, shown at 720 px; mobile = the phone variant;
 *   only = a single SVG shown on every screen (checked at phone size).
 */
export function checkChartDesign(charts) {
  const parsed = charts.map((c) => ({ ...c, p: parseSvg(c.svg) }));
  const sev = (list) => (list.some((x) => x.framed) ? "fail" : "warn");
  const out = [];
  const tag = (c, msg) => ({ framed: c.p.framed, msg: `${c.path}: ${msg}` });
  const summarise = (id, hits, okMsg, severity) =>
    hits.length
      ? res(id, false, severity ?? sev(hits), `${[...new Set(hits.map((h) => h.msg))].slice(0, 6).join("; ")}${hits.length > 6 ? `; +${hits.length - 6} more` : ""}`)
      : res(id, true, "warn", okMsg);

  // D1 frame: title, source line and an accessible name inside the SVG.
  {
    const hits = [];
    for (const c of parsed) {
      const t = c.p.texts.filter(visible);
      // Legacy charts: a bold line at the top, larger than the chart's usual text.
      const usual = t.map((x) => x.size).sort((a, b) => a - b)[Math.floor(t.length / 2)] ?? 0;
      const title = t.some((x) => x.classes.includes("dp-title")) || t.some((x) => x.weight >= 600 && x.size >= usual * 1.2 && x.y < c.p.height * 0.2 && x.text.split(" ").length >= 4);
      const source = t.some((x) => x.classes.includes("dp-source") || /\bSources?\s*:/i.test(x.text));
      const missing = [!title && "takeaway title", !source && "source line", !c.p.accessibleName && "<title> (accessible name)"].filter(Boolean);
      if (missing.length) hits.push(tag(c, `no ${missing.join(", ")}`));
    }
    out.push(summarise("chart-frame", hits, `${parsed.length} chart(s) carry a title, source line and accessible name`));
  }

  // D2 rendered text size on the device the SVG is shown on.
  {
    const hits = [];
    for (const c of parsed) {
      const s = displayScale(c.p.width, c.role);
      const small = c.p.texts.filter(visible).filter((t) => t.size * s < MIN_TEXT_PX - 0.05);
      if (small.length) {
        const min = Math.min(...small.map((t) => t.size));
        hits.push(tag(c, `${small.length} text(s) render at ${(min * s).toFixed(1)} px on ${c.role === "desktop" ? "desktop" : "a phone"} (min ${MIN_TEXT_PX}), e.g. "${small[0].text.slice(0, 30)}"`));
      }
    }
    out.push(summarise("chart-text-size", hits, `all chart text renders at ${MIN_TEXT_PX} px or more`));
  }

  // D3 text contrast: 4.5:1, or 3:1 for large text (WCAG: >= 24 px, or >= 18.66 px bold).
  {
    const hits = [];
    for (const c of parsed) {
      const s = displayScale(c.p.width, c.role);
      for (const t of c.p.texts.filter(visible)) {
        if (!t.fill || luminance(t.fill) > 0.8) continue; // white labels sit on marks, not the background
        const large = t.size * s >= 24 || (t.size * s >= 18.66 && t.weight >= 700);
        const need = large ? 3 : 4.5;
        const r = contrastRatio(t.fill, c.p.background);
        if (r < need) hits.push(tag(c, `"${t.text.slice(0, 30)}" in ${t.fill} is ${r.toFixed(1)}:1 (needs ${need}:1)`));
      }
    }
    out.push(summarise("chart-contrast", hits, "chart text has at least 4.5:1 contrast"));
  }

  // D4 colour-blind confusable hue pairs (warning: labels or shapes can still separate them).
  {
    const hits = [];
    for (const c of parsed) {
      for (const k of cvdConfusions(c.p.colours)) hits.push(tag(c, `${k.a} and ${k.b} look alike with ${k.type} (lightness gap ${k.deltaL}): darken one or label both`));
    }
    out.push(summarise("chart-colour-blind", hits, "no hue pair merges under protanopia or deuteranopia", "warn"));
  }

  // D5 accent count: greys + one accent, a second only for a two-way comparison.
  {
    const hits = [];
    for (const c of parsed) {
      const fams = hueFamilies(c.p.colours);
      if (fams.length > MAX_ACCENTS) hits.push(tag(c, `${fams.length} accent hues (${fams.map((f) => f.rep).join(", ")}); use greys plus one accent`));
    }
    out.push(summarise("chart-accents", hits, `every chart uses at most ${MAX_ACCENTS} accent hues`, "warn"));
  }

  // D6 phone height at 360 px wide.
  {
    const hits = [];
    for (const c of parsed.filter((c) => phoneShown(c.role))) {
      const h = c.p.width ? (c.p.height * 360) / c.p.width : c.p.height;
      if (h > MOBILE_MAX_H) hits.push(tag(c, `${Math.round(h)} px tall at 360 px wide (max ${MOBILE_MAX_H}): trim rows or the window`));
    }
    out.push(summarise("chart-mobile-height", hits, `phone charts are at most ${MOBILE_MAX_H} px tall`, "warn"));
  }

  // D7 no text key on phones: a block of 3+ lines above the plot, or marks named by looks.
  {
    const hits = [];
    for (const c of parsed.filter((c) => phoneShown(c.role))) {
      const t = c.p.texts.filter(visible).filter((x) => !isFrameText(x) && !/axis/.test(x.aria));
      const top = c.p.plotTop ?? c.p.height * 0.25;
      const above = t.filter((x) => x.y < top - 2);
      const lines = above.reduce((n, x) => n + x.lines, 0);
      if (lines >= 3) hits.push(tag(c, `${lines}-line text key above the plot ("${above[0].text.slice(0, 30)}" …): label the marks instead`));
      const refs = t.filter((x) => DESCRIPTION_REF.test(x.text));
      if (refs.length) hits.push(tag(c, `refers to marks by their look: "${refs[0].text.slice(0, 40)}"`));
    }
    out.push(summarise("chart-mobile-key", hits, "phone charts label marks directly, with no text key", "warn"));
  }

  // D8 text running off the canvas (estimated glyph widths, so a warning): y tick labels
  // wider than marginLeft, end labels wider than marginRight.
  {
    const hits = [];
    for (const c of parsed) {
      for (const t of c.p.texts.filter(visible)) {
        const w = textWidth(t);
        const left = t.anchor === "end" ? t.x - w : t.anchor === "middle" ? t.x - w / 2 : t.x;
        const over = Math.max(-left, left + w - c.p.width);
        if (over > CLIP_TOLERANCE) hits.push(tag(c, `"${t.text.slice(0, 30)}" runs ~${Math.round(over)} px off the ${left < 0 ? "left" : "right"} edge: widen the margin or shorten the label`));
      }
    }
    out.push(summarise("chart-clipping", hits, "no text runs off the chart edges", "warn"));
  }
  return out;
}
