// Comparatron template: two numbers drawn to scale, as standalone SVGs. See comparatron.md.
//
//   import { compare, writeCompare } from "./compare-template.mjs";
//   const built = compare({ slug, title, deck, items, kicker, source, form });
//   await writeCompare(HERE, built);
//
// Copy this file and comparatron-fonts.mjs next to the story (the make-charts script imports
// them). No npm install: it builds SVG strings, so a comparatron package needs no Plot or jsdom.
//
// One spec, five outputs: the blog figure on desktop (680 px, the portrait card's vertical
// composition; or 1024 px wide with layout "wide") and on a phone (350 px, drawn 1:1), and the
// social cards at 1080x1350 (portrait, the house default), 1080x1080 (square) and 1200x630 (link);
// plus, with altForm, the figure in a second form for the post's switcher. The design is the
// approved "quiet" direction: circles side by side, Lora (embedded as Comparatron Serif), warm
// near-black mass, one vermilion accent on the small value's own mark, white, generous space.
//
// The build throws, so a figure that breaks a rule cannot ship: title over 10 words, deck over 15,
// anything but two positive values, a mark not wholly on the canvas, an area (or length) off true
// by 2% or more (the lie factor is computed from the geometry as written and as visible), a value
// not printed, printed values that do not
// reproduce the ratio within 1%, text below contrast, text off the canvas, text on text, text
// across a mark it is not printed on, or a card over 40 words or over its height.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

// The embedded face and its advance widths. Without comparatron-fonts.mjs beside this file the
// figures fall back to the system serif (Georgia) and text is measured with a 6% margin.
let FONTS = null;
try {
  FONTS = (await import(pathToFileURL(join(HERE, "comparatron-fonts.mjs")).href)).FONTS;
} catch {
  console.warn("compare-template: comparatron-fonts.mjs not found beside this file; using the system serif");
}

/** Palette of the quiet direction. Text colours are >= 4.5:1 on white; the marks >= 3:1. */
export const CP = {
  ground: "#ffffff",
  ink: "#2a2925", // titles, labels (14.6:1)
  muted: "#5f5b55", // deck, notes (6.7:1)
  faint: "#6b6760", // source strip (5.6:1)
  rule: "#e3e0da", // the hairline above the source
  mass: "#35342f", // the big value's mark (12.5:1)
  accent: "#c8381f", // vermilion: the small value, its mark and the kicker's number (5.2:1)
  onMass: "#ffffff",
};

// Type and mark sizes per output, in SVG px. Desktop is 1024 wide and story-check reads it at
// 720 (x0.70), so nothing is under 16 px; mobile is 350 wide, read at 326 (x0.93), nothing under
// 12. Cards: nothing under 34 px at 1080 (12 px in a 390 px feed). L is the big mark's side (or
// diameter); cards shrink it to fit their height, never below Lmin.
export const CT = {
  // narrow (the default blog figure): the card's vertical composition at the text column's width
  narrow: { w: 680, pad: 0, title: 28, deck: 17, label: 17, small: 26, meta: 16, kicker: 25, maxBig: 64, L: 360, Lmin: 200, gap: 56 },
  // wide (layout: "wide"): 1024 px through the breakout snippet, kicker beside the marks
  desktop: { w: 1024, pad: 0, title: 30, deck: 17, label: 17, small: 26, meta: 16, kicker: 30, maxBig: 56, L: 360, Lmin: 220, gap: 72 },
  mobile: { w: 350, pad: 0, title: 21, deck: 14.5, label: 13.5, small: 18, meta: 12, kicker: 16, maxBig: 44, L: 240, Lmin: 150, gap: 22 },
  portrait: { w: 1080, h: 1350, pad: 72, title: 58, deck: 36, label: 38, small: 54, meta: 34, kicker: 48, maxBig: 110, L: 490, Lmin: 260, gap: 64 },
  square: { w: 1080, h: 1080, pad: 72, title: 54, deck: 34, label: 36, small: 50, meta: 34, kicker: 44, maxBig: 100, L: 420, Lmin: 240, gap: 56 },
  link: { w: 1200, h: 630, pad: 72, title: 48, deck: 36, label: 38, small: 48, meta: 36, kicker: 40, maxBig: 84, L: 300, Lmin: 200, gap: 44 },
};
const CARD_SAFE = 48; // story-check card-safe-zone
const MAX_LF_ERROR = 0.02;
const MAX_PRINTED_RATIO_ERROR = 0.01;

const FAMILY = FONTS ? `'${FONTS.family}', Georgia, 'Iowan Old Style', serif` : "Georgia, 'Iowan Old Style', 'Times New Roman', serif";

// --- Text ------------------------------------------------------------------------------------

const faceKey = (weight, italic) => (italic ? "400i" : weight >= 600 ? "600" : weight >= 500 ? "500" : "400");
const wordCount = (s) => String(s ?? "").split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const f1 = (n) => {
  if (!Number.isFinite(n)) throw new Error(`compare: non-finite coordinate ${n}`);
  return (Math.round(n * 10) / 10).toString();
};

/** Width of `s` in px, from the embedded face's advance widths (kerning ignored). */
export function measure(s, size, { weight = 400, italic = false, ls = 0 } = {}) {
  const chars = [...String(s)];
  const adv = FONTS?.advance[faceKey(weight, italic)];
  const em = adv ? chars.reduce((n, ch) => n + (adv[ch] ?? 0.6), 0) * (FONTS ? 1 : 1.06) : chars.length * (weight >= 600 ? 0.58 : 0.52);
  return em * size + ls * size * Math.max(0, chars.length - 1);
}
// story-check estimates widths at 0.52 em (0.58 bold); cards are wrapped and bounded to the wider of
// the two so its card-safe-zone agrees with this build.
const checkWidth = (s, size, o = {}) => Math.max(measure(s, size, o), [...String(s)].length * size * ((o.weight ?? 400) >= 600 ? 0.58 : 0.52));

function wrap(s, width, size, o, strict = false) {
  const out = [];
  let line = "";
  const w = (x) => (strict ? checkWidth(x, size, o) : measure(x, size, o));
  for (const word of String(s).split(/\s+/).filter(Boolean)) {
    const c = line ? `${line} ${word}` : word;
    if (line && w(c) > width) { out.push(line); line = word; } else line = c;
  }
  if (line) out.push(line);
  return out;
}

// Kicker runs: "A year of aid = **15 days** of defense" -> the bold part in the accent. A "\n"
// is a preferred break, used only when the kicker does not fit on one line; a no-break space
// (\u00a0) keeps a number with its unit ("11\u00a0minutes").
function kickerRuns(s) {
  return String(s).split(/(\*\*[^*]+\*\*)/).filter(Boolean).flatMap((part) => {
    const hi = /^\*\*.*\*\*$/.test(part);
    return part.replace(/\*\*/g, "").split(/( |\n)/).filter((w) => w !== "" && w !== " ").map((w) => ({ w, hi }));
  });
}
const plainKicker = (s) => String(s ?? "").replace(/\*\*/g, "").replace(/\s*\n\s*/g, " ").trim();

// --- Canvas: elements with their boxes, checked before they are written ---------------------------

function canvas(W, H, mode) {
  const els = [];
  const c = {
    W, H, mode, els,
    text(x, y, s, o) {
      const w = measure(s, o.size, o);
      const anchor = o.anchor ?? "start";
      const left = anchor === "end" ? x - w : anchor === "middle" ? x - w / 2 : x;
      const el = { type: "text", x, y, s: String(s), w, left, right: left + w, top: y - o.size * 0.78, bottom: y + o.size * 0.24, anchor, ...o };
      els.push(el);
      return el;
    },
    rect(x, y, w, h, fill, o = {}) { const el = { type: "rect", x, y, w, h, fill, ...o }; els.push(el); return el; },
    circle(cx, cy, r, fill, o = {}) { const el = { type: "circle", cx, cy, r, fill, ...o }; els.push(el); return el; },
    line(x1, y1, x2, y2, stroke, o = {}) { const el = { type: "line", x1, y1, x2, y2, stroke, ...o }; els.push(el); return el; },
    /** Wrapped paragraph; y is the top of the block. Returns the last baseline. */
    para(x, y, s, width, o, lh = 1.3) {
      const lines = wrap(s, width, o.size, o, true); // story-check's width estimate, so chart-clipping agrees
      // No one-word last line: take a word down from the line above.
      if (lines.length > 1 && !/\s/.test(lines.at(-1)) && /\s/.test(lines.at(-2))) {
        const prev = lines.at(-2).split(" ");
        lines[lines.length - 1] = `${prev.pop()} ${lines.at(-1)}`;
        lines[lines.length - 2] = prev.join(" ");
      }
      lines.forEach((l, i) => { y += i === 0 ? o.size * 0.9 : o.size * lh; c.text(x, y, l, o); });
      return y;
    },
  };
  return c;
}

/** Lay the kicker out in `width` from top `y`; draw it when `draw`. Returns { h, w, lines }. */
function kicker(cv, x, y, width, size, s, P, draw = true) {
  const runs = kickerRuns(s);
  const o = (hi) => ({ size, weight: hi ? 600 : 500, fill: hi ? P.accent : P.ink, cls: "dp-kicker" });
  const sp = measure(" ", size, { weight: 500 });
  const ww = (r) => checkWidth(r.w, size, o(r.hi));
  const spFit = Math.max(sp, size * 0.52); // story-check counts a space like any glyph
  const one = runs.filter((r) => r.w !== "\n");
  const fitsOne = one.reduce((n, r) => n + ww(r), 0) + spFit * (one.length - 1) <= width;
  const lines = [[]];
  let lw = 0;
  for (const r of runs) {
    if (r.w === "\n") { if (!fitsOne && lines.at(-1).length) { lines.push([]); lw = 0; } continue; }
    const add = ww(r) + (lines.at(-1).length ? spFit : 0);
    if (lines.at(-1).length && lw + add > width) { lines.push([r]); lw = ww(r); } else { lines.at(-1).push(r); lw += add; }
  }
  let maxW = 0;
  lines.forEach((line, i) => {
    const by = y + size * 0.9 + i * size * 1.2;
    let lx = x;
    // Adjacent runs of one style are written as one <text>, so story-check reads whole phrases.
    const groups = [];
    for (const r of line) { if (groups.length && groups.at(-1).hi === r.hi) groups.at(-1).w += ` ${r.w}`; else groups.push({ ...r }); }
    groups.forEach((g, j) => {
      if (j) lx += sp;
      if (draw) cv.text(lx, by, g.w, o(g.hi));
      lx += measure(g.w, size, o(g.hi));
    });
    maxW = Math.max(maxW, lx - x);
  });
  return { h: size * 0.9 + (lines.length - 1) * size * 1.2 + size * 0.24, w: maxW, lines: lines.length };
}

// --- Forms -------------------------------------------------------------------------------------
// Each draws the pair into (x, y, width w) with the big mark's side (or diameter, or the bars'
// full length) L, and returns { h, right, markH }. big and small are the items, big first.

/** The big value inside the mass, top-left (or centred), as large as fits; null when it cannot. */
function valueInside(cv, x, y, L, t, item, P, { centre = false, cx, cy } = {}) {
  const pad = Math.max(12, L * 0.055);
  const o = { weight: 600, ls: -0.02 };
  const room = centre ? L * 0.72 : L - 2 * pad;
  const size = Math.min(t.maxBig, room / (measure(item.display, 1, o) || 1));
  if (size < t.small) return null;
  const el = centre
    ? cv.text(cx, cy + size * 0.33, item.display, { ...o, size, fill: P.onMass, anchor: "middle", cls: "dp-cmp-value", on: "big" })
    : cv.text(x + pad, y + pad + size * 0.85, item.display, { ...o, size, fill: P.onMass, cls: "dp-cmp-value", on: "big" });
  return el;
}

/** The small value and its label beside its mark (vertically centred on cy) or, without room, under
 * it, kept right of minX (the big mark's edge) so it never sits under the big mark; with no room
 * there either, under both marks at belowY. */
function smallLabel(cv, mx, mw, cy, bottom, xMax, t, item, P, minX = -Infinity, belowY = bottom) {
  const vW = measure(item.display, t.small, { weight: 600 });
  const lW = measure(item.label, t.label);
  const lx = mx + mw + Math.max(10, mw * 0.22);
  if (xMax - lx >= Math.max(vW, lW) + 4) {
    cv.text(lx, cy - t.label * 0.35, item.display, { size: t.small, weight: 600, fill: P.accent, cls: "dp-cmp-value" });
    cv.text(lx, cy + t.label * 0.95, item.label, { size: t.label, fill: P.ink, cls: "dp-cmp-label" });
    return { right: lx + Math.max(vW, lW), under: 0 };
  }
  const half = Math.max(vW, lW) / 2;
  const lo = Math.max(minX + 8, cv.minX ?? 0) + half + 1, hi = xMax - half - 1;
  const fits = lo <= hi;
  const ax = fits ? Math.min(Math.max(mx + mw / 2, lo), hi) : Math.min(Math.max(mx + mw / 2, half + 1), hi);
  const vy = (fits ? bottom : Math.max(bottom, belowY) + t.label * 1.7) + t.small * 1.15;
  cv.text(ax, vy, item.display, { size: t.small, weight: 600, fill: P.accent, anchor: "middle", cls: "dp-cmp-value" });
  cv.text(ax, vy + t.label * 1.3, item.label, { size: t.label, fill: P.ink, anchor: "middle", cls: "dp-cmp-label" });
  return { right: ax + half, under: vy + t.label * 1.3 + t.label * 0.24 - bottom };
}

export const FORMS = {
  sideSquares: {
    name: "Side-by-side squares",
    encoding: "area",
    use: "The default. Two squares on one baseline: area and height both carry the ratio, and square areas are the easiest areas to judge. Ratios from about 2 to about 400.",
    draw(cv, x, y, w, L, t, { big, small, R }, P) {
      const s = L / Math.sqrt(R);
      cv.rect(x, y, L, L, P.mass, { id: "big", cls: "dp-cmp-mark", value: big.value });
      const inside = valueInside(cv, x, y, L, t, big, P);
      const sx = x + L + t.gap;
      cv.rect(sx, y + L - s, s, s, P.accent, { id: "small", cls: "dp-cmp-mark", value: small.value });
      // The big mark's label sits inside it, under its value, so the number is never nameless.
      let h = L;
      if (inside) cv.text(x + Math.max(12, L * 0.055), inside.y + inside.size * 0.3 + t.label * 1.2, big.label, { size: t.label, fill: P.onMass, opacity: 0.82, cls: "dp-cmp-label", on: "big" });
      else { cv.text(x, y + L + t.small * 1.15, big.display, { size: t.small, weight: 600, fill: P.ink, cls: "dp-cmp-value" }); h = L + t.small * 1.15 + t.label * 1.4; cv.text(x, y + h, big.label, { size: t.label, fill: P.ink, cls: "dp-cmp-label" }); }
      const sl = smallLabel(cv, sx, s, y + L - s / 2, y + L, x + w, t, small, P, x + L, y + L + t.label * 0.4);
      return { h: Math.max(h, L + sl.under), right: Math.max(sl.right, sx + s), markH: L };
    },
  },
  nestedSquares: {
    name: "Nested squares",
    encoding: "area",
    use: "The Billion Dollar-o-Gram move: the small square in the big one's corner, so the leftover shows. For a part against its whole, or when the small value is under about a twentieth.",
    draw(cv, x, y, w, L, t, { big, small, R }, P) {
      const s = L / Math.sqrt(R);
      cv.rect(x, y, L, L, P.mass, { id: "big", cls: "dp-cmp-mark", value: big.value });
      const v = valueInside(cv, x, y, L, t, big, P);
      if (!v) throw new Error("compare: the big value does not fit inside the nested square; use sideSquares");
      const pad = Math.max(12, L * 0.055);
      cv.text(x + pad, v.y + v.size * 0.3 + t.label * 1.2, big.label, { size: t.label, fill: P.onMass, opacity: 0.82, cls: "dp-cmp-label", on: "big" });
      cv.rect(x, y + L - s, s, s, P.accent, { id: "small", cls: "dp-cmp-mark", value: small.value });
      const by = y + L + t.small * 1.1;
      const vt = cv.text(x, by, small.display, { size: t.small, weight: 600, fill: P.accent, cls: "dp-cmp-value" });
      const lt = cv.text(vt.right + t.small * 0.3, by, small.label, { size: t.label, fill: P.ink, cls: "dp-cmp-label" });
      return { h: L + t.small * 1.1 + t.label * 0.3, right: Math.max(x + L, lt.right), markH: L };
    },
  },
  circles: {
    name: "Circles side by side",
    encoding: "area",
    use: "The 2010 and 2020 Comparotron signature, gentlest on the eye; circle areas are the hardest to judge, so the ratio is under-read. For a warm, iconic card when both values are printed large.",
    draw(cv, x, y, w, L, t, { big, small, R }, P) {
      const rb = L / 2, rs = rb / Math.sqrt(R), cy = y + rb;
      cv.circle(x + rb, cy, rb, P.mass, { id: "big", cls: "dp-cmp-mark", value: big.value });
      const inside = valueInside(cv, x, y, L, t, big, P, { centre: true, cx: x + rb, cy: cy - t.label * 0.75 });
      if (!inside) throw new Error("compare: the big value does not fit inside the circle; use sideSquares");
      cv.text(x + rb, inside.y + inside.size * 0.3 + t.label * 1.2, big.label, { size: t.label, fill: P.onMass, opacity: 0.82, anchor: "middle", cls: "dp-cmp-label", on: "big" });
      const cxs = x + L + t.gap + rs;
      cv.circle(cxs, cy, rs, P.accent, { id: "small", cls: "dp-cmp-mark", value: small.value });
      const sl = smallLabel(cv, cxs - rs, 2 * rs, cy, cy + rs, x + w, t, small, P, x + L, y + L + t.label * 0.4);
      return { h: Math.max(L, cy + rs - y + sl.under), right: Math.max(sl.right, cxs + rs), markH: L };
    },
  },
  nestedCircles: {
    name: "Nested circles",
    encoding: "area",
    use: "One object with a small part marked: intimate, but nested areas are the hardest of all to read. Rarely; never for a ratio the reader must retell.",
    draw(cv, x, y, w, L, t, { big, small, R }, P) {
      const rb = L / 2, rs = rb / Math.sqrt(R), cx = x + rb, cy = y + rb;
      cv.circle(cx, cy, rb, P.mass, { id: "big", cls: "dp-cmp-mark", value: big.value });
      const v = valueInside(cv, x, y, L, t, big, P, { centre: true, cx, cy: cy - rb * 0.22 });
      if (!v) throw new Error("compare: the big value does not fit inside the circle; use sideSquares");
      cv.text(cx, v.y + v.size * 0.3 + t.label * 1.2, big.label, { size: t.label, fill: P.onMass, opacity: 0.82, anchor: "middle", cls: "dp-cmp-label", on: "big" });
      const scy = cy + rb - rs - 1;
      cv.circle(cx, scy, rs, P.accent, { id: "small", cls: "dp-cmp-mark", value: small.value });
      const lx = x + L + t.gap * 0.6;
      const need = Math.max(measure(small.display, t.small, { weight: 600 }), measure(small.label, t.label));
      if (x + w - lx >= need + 4) {
        cv.line(cx + rs + 4, scy, lx - 8, scy, P.faint, { cls: "dp-cmp-leader" });
        cv.text(lx, scy - t.label * 0.35, small.display, { size: t.small, weight: 600, fill: P.accent, cls: "dp-cmp-value" });
        cv.text(lx, scy + t.label * 0.95, small.label, { size: t.label, fill: P.ink, cls: "dp-cmp-label" });
        return { h: L, right: lx + need, markH: L };
      }
      const by = y + L + t.small * 1.15;
      cv.text(cx, by, small.display, { size: t.small, weight: 600, fill: P.accent, anchor: "middle", cls: "dp-cmp-value" });
      cv.text(cx, by + t.label * 1.3, small.label, { size: t.label, fill: P.ink, anchor: "middle", cls: "dp-cmp-label" });
      return { h: L + t.small * 1.15 + t.label * 1.55, right: x + L, markH: L };
    },
  },
  bars: {
    name: "Bars from zero",
    encoding: "length",
    use: "One scale, one baseline, length against length: the most exact and the flattest. For ratios under about 5, where areas would look alike, and for an in-text chart.",
    draw(cv, x, y, w, L, t, { big, small }, P) {
      const bh = Math.max(14, L * 0.095);
      const vW = Math.max(measure(big.display, t.small * 1.15, { weight: 600 }), measure(small.display, t.small * 1.15, { weight: 600 })) + 24;
      const scale = (w - vW) / big.value;
      const rowGap = bh * 0.9;
      let cy = y;
      for (const [item, fill, id] of [[big, P.mass, "big"], [small, P.accent, "small"]]) {
        cy += t.label * 0.95;
        cv.text(x, cy, item.label, { size: t.label, weight: 500, fill: P.ink, cls: "dp-cmp-label" });
        cy += t.label * 0.55;
        const len = item.value * scale;
        cv.rect(x, cy, len, bh, fill, { id, cls: "dp-cmp-mark", value: item.value });
        cv.text(x + len + 12, cy + bh / 2 + t.small * 1.15 * 0.36, item.display, { size: t.small * 1.15, weight: 600, fill: id === "small" ? P.accent : P.ink, cls: "dp-cmp-value" });
        cy += bh + rowGap;
      }
      return { h: cy - rowGap - y, right: x + w, markH: cy - rowGap - y };
    },
  },
};
const FORM_ALIASES = { side: "sideSquares", squares: "sideSquares", sideCircles: "circles", nested: "nestedSquares" };

// --- Checks ------------------------------------------------------------------------------------

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const lum = (hex) => { const [r, g, b] = rgb(hex).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
const blend = (hex, op, bg) => "#" + rgb(hex).map((c, i) => Math.round((c * op + rgb(bg)[i] * (1 - op)) * 255).toString(16).padStart(2, "0")).join("");

const boxOf = (e) => (e.type === "rect" ? { left: e.x, right: e.x + e.w, top: e.y, bottom: e.y + e.h } : { left: e.cx - e.r, right: e.cx + e.r, top: e.cy - e.r, bottom: e.cy + e.r });
const meets = (a, b, tol = 0.5) => a.left < b.right - tol && b.left < a.right - tol && a.top < b.bottom - tol && b.top < a.bottom - tol;
function textCrossesShape(t, s) {
  if (s.type === "rect") return meets(t, boxOf(s));
  const nx = Math.max(t.left, Math.min(s.cx, t.right)), ny = Math.max(t.top, Math.min(s.cy, t.bottom));
  return Math.hypot(nx - s.cx, ny - s.cy) < s.r - 0.5;
}
function textInsideShape(t, s) {
  if (s.type === "rect") { const b = boxOf(s); return t.left >= b.left - 0.5 && t.right <= b.right + 0.5 && t.top >= b.top - 0.5 && t.bottom <= b.bottom + 0.5; }
  return [[t.left, t.top], [t.right, t.top], [t.left, t.bottom], [t.right, t.bottom]].every(([px, py]) => Math.hypot(px - s.cx, py - s.cy) <= s.r + 0.5);
}

// The part of a circle inside the canvas [0, W] x [0, H], by summing clipped vertical chords.
function visibleCircleArea(cx, cy, r, W, H) {
  if (cx - r >= 0 && cx + r <= W && cy - r >= 0 && cy + r <= H) return Math.PI * r * r;
  const x0 = Math.max(0, cx - r), x1 = Math.min(W, cx + r), n = 4000, dx = (x1 - x0) / n;
  let a = 0;
  for (let i = 0; i < n; i++) {
    const x = x0 + (i + 0.5) * dx, h = Math.sqrt(Math.max(0, r * r - (x - cx) ** 2));
    a += Math.max(0, Math.min(H, cy + h) - Math.max(0, cy - h)) * dx;
  }
  return a;
}

/** Lie factor from the geometry as written (after rounding) and as seen (clipped to the canvas,
 * W x H): drawn ratio / data ratio. A mark cut off by the edge shows less than it encodes. */
export function lieFactor(els, encoding, W = Infinity, H = Infinity) {
  const r = (n) => Number(f1(n));
  const clip = (a, b, max) => Math.max(0, Math.min(b, max) - Math.max(a, 0));
  const size = (e) => (e.type === "circle" ? visibleCircleArea(r(e.cx), r(e.cy), r(e.r), W, H)
    : encoding === "length" ? clip(r(e.x), r(e.x) + r(e.w), W) : clip(r(e.x), r(e.x) + r(e.w), W) * clip(r(e.y), r(e.y) + r(e.h), H));
  const big = els.find((e) => e.id === "big"), small = els.find((e) => e.id === "small");
  return size(big) / size(small) / (big.value / small.value);
}

function check(cv, { id, encoding, items, P, card }) {
  const problems = [];
  const texts = cv.els.filter((e) => e.type === "text");
  const shapes = cv.els.filter((e) => e.type === "rect" && e.cls === "dp-cmp-mark" || e.type === "circle");
  const lf = lieFactor(cv.els, encoding, cv.W, cv.H);
  // Containment: every mark wholly on the canvas, so the reader sees all of the area it encodes.
  for (const sh of shapes) {
    const b = boxOf(sh);
    if (b.left < -0.05 || b.top < -0.05 || b.right > cv.W + 0.05 || b.bottom > cv.H + 0.05) problems.push(`the ${sh.id} mark runs off the canvas (${b.left.toFixed(1)}..${b.right.toFixed(1)} x ${b.top.toFixed(1)}..${b.bottom.toFixed(1)} on ${cv.W} x ${cv.H})`);
  }
  if (!(Math.abs(lf - 1) < MAX_LF_ERROR)) problems.push(`lie factor ${lf.toFixed(4)} (|LF - 1| must be under ${MAX_LF_ERROR})`);
  const smallMark = cv.els.find((e) => e.id === "small");
  const across = smallMark.type === "circle" ? 2 * smallMark.r : Math.min(smallMark.w, smallMark.h);
  if (across < (cv.mode === "mobile" ? 6 : 8)) problems.push(`the small mark is ${across.toFixed(1)} px across: too small to see; use bars or a 1-against-N grid`);
  for (const it of items) if (!texts.some((x) => x.cls === "dp-cmp-value" && x.s === it.display)) problems.push(`value "${it.display}" is not printed`);
  const edge = card ? CARD_SAFE : 0;
  for (const t of texts) {
    const left = card ? (t.anchor === "end" ? t.x - checkWidth(t.s, t.size, t) : t.anchor === "middle" ? t.x - checkWidth(t.s, t.size, t) / 2 : t.x) : t.left;
    const right = card ? left + checkWidth(t.s, t.size, t) : t.right;
    if (left < edge - 0.5 || right > cv.W - edge + 0.5 || t.top < edge - 0.5 || t.bottom > cv.H - edge + 0.5) problems.push(`"${t.s.slice(0, 30)}" runs off the canvas${card ? ` or into the outer ${CARD_SAFE} px` : ""}`);
    const on = t.on && shapes.find((s) => s.id === t.on);
    if (on && !textInsideShape(t, on)) problems.push(`"${t.s.slice(0, 30)}" spills out of its mark`);
    for (const s of shapes) if (s !== on && textCrossesShape(t, s)) problems.push(`"${t.s.slice(0, 30)}" crosses a mark`);
    const bg = on ? on.fill : P.ground;
    const fill = t.opacity ? blend(t.fill, t.opacity, bg) : t.fill;
    const need = t.size >= 24 || (t.size >= 18.66 && (t.weight ?? 400) >= 700) ? 3 : 4.5;
    if (contrast(fill, bg) < need) problems.push(`"${t.s.slice(0, 30)}" in ${fill} on ${bg} is ${contrast(fill, bg).toFixed(1)}:1 (needs ${need}:1)`);
    if (t.size < (card ? 32 * (cv.W / 1080) : cv.mode === "mobile" ? 12 : 16) - 0.01) problems.push(`"${t.s.slice(0, 30)}" is ${t.size} px, under the ${cv.mode} minimum`);
  }
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) if (meets(texts[i], texts[j])) problems.push(`"${texts[i].s.slice(0, 20)}" overlaps "${texts[j].s.slice(0, 20)}"`);
  for (const s of shapes) if (contrast(s.fill, P.ground) < 3) problems.push(`mark ${s.fill} is ${contrast(s.fill, P.ground).toFixed(1)}:1 on white (needs 3:1)`);
  if (card) {
    const words = texts.reduce((n, t) => n + wordCount(t.s), 0);
    if (words > 40) problems.push(`${words} words on the card (max 40): shorten card.deck or card.source, or drop the deck`);
  }
  if (problems.length) throw new Error(`compare ${id}: ${[...new Set(problems)].join("; ")}`);
  return lf;
}

// --- Writing SVG -------------------------------------------------------------------------------

function fontCss(els) {
  if (!FONTS) return "";
  const used = new Set(els.filter((e) => e.type === "text").map((e) => faceKey(e.weight ?? 400, e.italic)));
  return [...used].sort().map((k) => `@font-face{font-family:'${FONTS.family}';font-style:${k.endsWith("i") ? "italic" : "normal"};font-weight:${parseInt(k, 10)};src:url(data:font/woff2;base64,${FONTS.woff2[k]}) format('woff2')}`).join("");
}

function serialize(cv, { id, title, alt, root, dy = 0 }) {
  const out = [];
  for (const e of cv.els) {
    if (e.type === "rect") out.push(`<rect${e.cls ? ` class="${e.cls}"` : ""} x="${f1(e.x)}" y="${f1(e.y + dy)}" width="${f1(e.w)}" height="${f1(e.h)}" fill="${e.fill}"${e.value != null ? ` data-value="${e.value}"` : ""}/>`);
    else if (e.type === "circle") out.push(`<circle class="${e.cls}" cx="${f1(e.cx)}" cy="${f1(e.cy + dy)}" r="${f1(e.r)}" fill="${e.fill}" data-value="${e.value}"/>`);
    else if (e.type === "line") out.push(`<line${e.cls ? ` class="${e.cls}"` : ""} x1="${f1(e.x1)}" y1="${f1(e.y1 + dy)}" x2="${f1(e.x2)}" y2="${f1(e.y2 + dy)}" stroke="${e.stroke}" stroke-width="${e.sw ?? 1}"/>`);
    else {
      const a = [`class="${e.cls}"`, `x="${f1(e.x)}"`, `y="${f1(e.y + dy)}"`, `font-size="${e.size}"`, `fill="${e.fill}"`];
      if (e.opacity) a.push(`fill-opacity="${e.opacity}"`);
      if (e.weight && e.weight !== 400) a.push(`font-weight="${e.weight}"`);
      if (e.italic) a.push(`font-style="italic"`);
      if (e.anchor !== "start") a.push(`text-anchor="${e.anchor}"`);
      if (e.ls) a.push(`letter-spacing="${e.ls}em"`);
      out.push(`<text ${a.join(" ")}>${esc(e.s)}</text>`);
    }
  }
  const css = fontCss(cv.els);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" ${root} role="img" aria-labelledby="${id}-title ${id}-desc" width="${cv.W}" height="${cv.H}" viewBox="0 0 ${cv.W} ${cv.H}" font-family="${esc(FAMILY)}">` +
    `<title id="${id}-title">${esc(title)}</title><desc id="${id}-desc">${esc(alt)}</desc>` +
    (css ? `<defs><style>${css}</style></defs>` : "") +
    `<rect width="${cv.W}" height="${cv.H}" fill="${CP.ground}"/>${out.join("")}</svg>`;
  const visible = svg.replace(/<style>[\s\S]*?<\/style>/, "");
  if (/NaN|Infinity|undefined|=>/.test(visible)) throw new Error(`compare ${id}: NaN, Infinity, undefined or function source in the SVG`);
  return svg;
}

// --- Layouts -----------------------------------------------------------------------------------

function sourceStrip(cv, y, t, source, P, x0, x1) {
  const brand = "datahub.io";
  const markW = measure(brand, t.meta) + t.meta * 1.5;
  cv.line(x0, y - t.meta * 1.4, x1, y - t.meta * 1.4, P.rule, { cls: "dp-rule" });
  const top = y;
  y = cv.para(x0, y, source, x1 - x0 - markW, { size: t.meta, fill: P.faint, cls: "dp-source" }, 1.3);
  cv.text(x1, top + t.meta * 0.9, brand, { size: t.meta, fill: P.faint, anchor: "end", cls: "dp-mark" });
  return y;
}

/** The blog figure. Narrow (default) and mobile stack title, deck, marks, kicker and source like
 * the portrait card; wide (desktop only) puts the kicker beside the marks. */
function figure(spec, mode, A, P) {
  const wide = mode === "desktop" && spec.layout === "wide";
  const t = mode === "mobile" ? CT.mobile : wide ? CT.desktop : { ...CT.narrow, w: spec.width ?? CT.narrow.w };
  const W = t.w, pad = t.pad, cw = W - 2 * pad;
  const form = FORMS[spec.form];
  const build = (L) => {
    const cv = canvas(W, 0, mode);
    let y = pad;
    y = cv.para(pad, y, spec.title, cw, { size: t.title, weight: 500, fill: P.ink, cls: "dp-title", ls: -0.01 }, 1.15);
    if (spec.deck) { y += t.deck * 0.7; y = cv.para(pad, y, spec.deck, cw, { size: t.deck, italic: true, fill: P.muted, cls: "dp-subtitle" }, 1.35); }
    y += t.deck * 1.7;
    const bodyTop = y;
    const body = form.draw(cv, pad, y, cw, L, t, A, P);
    y += body.h;
    if (spec.kicker) {
      const kx = Math.max(body.right + 56, Math.round(W * 0.66));
      const kw = W - pad - kx;
      const k = wide && spec.form !== "bars" && kw >= 240 ? kicker(cv, kx, 0, kw, t.kicker, spec.kicker, P, false) : null;
      if (k && k.lines <= 3) {
        const noteH = spec.kickerNote ? t.label * 1.8 : 0;
        const ky = bodyTop + body.markH / 2 - (k.h + noteH) / 2;
        kicker(cv, kx, ky, kw, t.kicker, spec.kicker, P);
        if (spec.kickerNote) cv.text(kx, ky + k.h + t.label * 1.4, spec.kickerNote, { size: t.label, fill: P.muted, cls: "dp-note" });
      } else {
        y += t.kicker * 1.1;
        y += kicker(cv, pad, y, cw, t.kicker, spec.kicker, P).h;
        if (spec.kickerNote) { const ns = mode === "desktop" ? t.label : Math.max(t.meta, 12.5); y += ns * 1.6; cv.text(pad, y, spec.kickerNote, { size: ns, fill: P.muted, cls: "dp-note" }); }
      }
    }
    y += t.meta * 2.8;
    y = sourceStrip(cv, y, t, spec.source, P, pad, W - pad);
    cv.H = Math.ceil(y + t.meta * 0.5 + pad);
    return cv;
  };
  // Shrink the marks until they and their labels fit the width (never clip a mark).
  let L = t.L, cv = build(L);
  for (let i = 0; i < 8; i++) {
    const over = Math.max(...cv.els.filter((e) => e.type !== "line").map((e) => (e.type === "text" ? e.right : boxOf(e).right))) - (W - pad);
    if (over <= 0 || L <= 80) break; // the width decides; containment in check() is the backstop
    L = Math.max(80, Math.floor(L - over - 1));
    cv = build(L);
  }
  return cv;
}

/** A portrait or square card: title, deck, the pair, the kicker, the foot strip; centred vertically. */
function cardTall(spec, size, A, P) {
  const t = CT[size], W = t.w, H = t.h, pad = t.pad, cw = W - 2 * pad;
  const form = FORMS[spec.form];
  const build = (L) => {
    const cv = canvas(W, H, size);
    let y = pad;
    y = cv.para(pad, y, spec.title, cw, { size: t.title, weight: 500, fill: P.ink, cls: "dp-title", ls: -0.01 }, 1.12);
    if (spec.deck) { y += t.deck * 0.75; y = cv.para(pad, y, spec.deck, cw, { size: t.deck, italic: true, fill: P.muted, cls: "dp-subtitle" }, 1.3); }
    y += t.deck * 1.6;
    const body = form.draw(cv, pad, y, cw, L, t, A, P);
    y += body.h;
    if (spec.kicker) { y += t.kicker * 0.9; y += kicker(cv, pad, y, cw, t.kicker, spec.kicker, P).h; }
    y += t.meta * 2.4;
    y = sourceStrip(cv, y, t, spec.source, P, pad, W - pad);
    const right = Math.max(...cv.els.filter((e) => e.type !== "line").map((e) => (e.type === "text" ? e.right : boxOf(e).right)));
    return { cv, bottom: y + t.meta * 0.24, over: Math.max(y + t.meta * 0.24 - (H - pad), right - (W - pad)) };
  };
  let L = t.L, r = build(L);
  for (let i = 0; i < 8 && r.over > 0; i++) { L = Math.floor(L - r.over - 1); if (L < t.Lmin) break; r = build(L); }
  if (r.bottom > H - pad) throw new Error(`compare ${spec.slug}-${size}: the ${size} card overflows by ${Math.ceil(r.bottom - (H - pad))} px even with the marks at ${t.Lmin} px; shorten card.title, card.deck or card.kicker`);
  return { cv: r.cv, dy: (H - pad - r.bottom) / 2 };
}

/** The 1200x630 link card: title and kicker on the left, the pair on the right, foot strip below. */
function cardLink(spec, A, P) {
  const t = CT.link, W = t.w, H = t.h, pad = t.pad;
  const form = FORMS[spec.form];
  const footY = H - pad - t.meta * 0.24 - (wrap(spec.source, W - 2 * pad - measure("datahub.io", t.meta) - t.meta * 1.5, t.meta, {}, true).length - 1) * t.meta * 1.3 - t.meta * 0.9;
  const avail = footY - t.meta * 1.4 - 36 - pad;
  let L = t.L, probe;
  for (let i = 0; i < 6; i++) {
    probe = canvas(W, H, "link");
    const b = form.draw(probe, 0, 0, W - 2 * pad - 480, L, t, A, P); // leave the title column at least 480 px
    if (b.h <= avail || L <= t.Lmin) { probe.body = b; break; }
    L = Math.max(t.Lmin, Math.floor(L - (b.h - avail) - 1));
  }
  const bw = probe.body.right + 6; // the beside-label test keeps 4 px of slack
  const cv = canvas(W, H, "link");
  const bx = W - pad - bw, by = pad + (avail - probe.body.h) / 2;
  const body = form.draw(cv, bx, by, bw, L, t, A, P);
  if (body.h > avail) throw new Error(`compare ${spec.slug}-link: the pair needs ${Math.ceil(body.h)} px, ${Math.floor(avail)} available`);
  const colW = bx - pad - 48;
  let y = pad;
  y = cv.para(pad, y, spec.title, colW, { size: t.title, weight: 500, fill: P.ink, cls: "dp-title", ls: -0.01 }, 1.12);
  if (spec.linkDeck) { y += t.deck * 0.5; y = cv.para(pad, y, spec.linkDeck, colW, { size: t.deck, italic: true, fill: P.muted, cls: "dp-subtitle" }, 1.25); y += t.deck * 0.24; }
  if (spec.kicker) { y += t.kicker * 0.8; y += kicker(cv, pad, y, colW, t.kicker, spec.kicker, P).h; }
  if (y > footY - t.meta * 1.4 - 24) throw new Error(`compare ${spec.slug}-link: the title and kicker need ${Math.ceil(y)} px; shorten card.title or card.kicker`);
  sourceStrip(cv, footY, t, spec.source, P, pad, W - pad);
  return { cv, dy: 0 };
}

// --- The entry point ---------------------------------------------------------------------------

/**
 * Build a comparatron. spec:
 *   slug, name ("pair")    file and id stem
 *   title                  the claim, at most 10 words ("$24 on defense for every $1 of US foreign aid")
 *   deck                   period, scope and "drawn to scale", at most 15 words
 *   items                  [{ label, value, display, unit }] x2: value is the number drawn (same unit
 *                          both sides), display the printed value ("$37.5bn"), unit for the alt text
 *   kicker                 the conversion line, "**bold**" in the accent, "\n" a preferred break
 *   kickerNote             optional quiet line under the kicker on the blog figure ("24 to 1, fiscal 2025")
 *   source                 "Source: ..." for the figure's foot strip
 *   form                   circles (default) | nestedSquares | sideSquares
 *   altForm                optional second form for the post's switcher ("nestedSquares"): adds
 *                          { alternative: { form, desktop, mobile, alt } } with the same text
 *   layout                 "narrow" (default: the card's vertical composition, `width` px, 680) or
 *                          "wide" (1024 px, kicker beside the marks, for the breakout snippet)
 *   accent                 the small value's colour (default vermilion #c8381f; >= 4.5:1 on white)
 *   card                   overrides for the cards: { title, deck, source, kicker, alt, form } (40 words max);
 *                          card.link overrides the 1200x630 card alone, and its linkDeck is an
 *                          italic line under the title (the link card shows no deck otherwise)
 *   alt                    alt text; default built from the spec (form, title, both values, ratio, source)
 * Returns { desktop, mobile, portrait, square, link, alt, cardAlt, ratio, lieFactor, alternative? }.
 * (bars and nestedCircles still build but are not recommended: see comparatron.md.)
 */
export function compare(spec) {
  const s = { name: "pair", form: "circles", layout: "narrow", ...spec };
  s.form = FORM_ALIASES[s.form] ?? s.form;
  if (!["narrow", "wide"].includes(s.layout)) throw new Error(`compare: layout must be "narrow" or "wide"`);
  const id = `${s.slug}-${s.name}`;
  if (!s.slug) throw new Error("compare: slug is required");
  if (!FORMS[s.form]) throw new Error(`compare ${id}: form must be one of ${Object.keys(FORMS).join(", ")}`);
  for (const k of ["title", "source"]) if (!s[k]) throw new Error(`compare ${id}: ${k} is required`);
  if (wordCount(s.title) > 10) throw new Error(`compare ${id}: the title is ${wordCount(s.title)} words; at most 10`);
  if (wordCount(s.deck) > 15) throw new Error(`compare ${id}: the deck is ${wordCount(s.deck)} words; at most 15`);
  if (!Array.isArray(s.items) || s.items.length !== 2) throw new Error(`compare ${id}: items must be exactly two`);
  for (const it of s.items) {
    if (!(Number.isFinite(it.value) && it.value > 0)) throw new Error(`compare ${id}: "${it.label}" needs a positive value (got ${it.value})`);
    if (!it.label || !it.display) throw new Error(`compare ${id}: every item needs a label and a display value`);
  }
  const [big, small] = [...s.items].sort((a, b) => b.value - a.value);
  const R = big.value / small.value;
  // The printed values must reproduce the ratio the shapes draw, so a reader can check it.
  const num = (d) => Number(String(d).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/)?.[0]);
  const unitOf = (d) => String(d).replace(/[\d.,\s-]/g, "");
  if (Number.isFinite(num(big.display)) && Number.isFinite(num(small.display)) && unitOf(big.display) === unitOf(small.display)) {
    const printed = num(big.display) / num(small.display);
    if (Math.abs(printed / R - 1) >= MAX_PRINTED_RATIO_ERROR) throw new Error(`compare ${id}: the printed values give ${printed.toFixed(2)} to 1 but the data give ${R.toFixed(2)}; print one more digit ("${small.display}" is too rounded)`);
  }
  const P = { ...CP, accent: s.accent ?? CP.accent };
  if (contrast(P.accent, P.ground) < 4.5) throw new Error(`compare ${id}: accent ${P.accent} is ${contrast(P.accent, P.ground).toFixed(1)}:1 on white; it colours text, so it needs 4.5:1`);
  const A = { big, small, R };
  const form = FORMS[s.form];
  const ratioText = R >= 10 ? Math.round(R) : Math.round(R * 10) / 10;
  const alt = s.alt ?? `${form.name}, drawn to scale by ${form.encoding}: ${s.title}. ${big.label} ${big.display}, ${small.label} ${small.display}, ${ratioText} to 1.${s.kicker ? ` ${plainKicker(s.kicker)}.` : ""} ${s.source}`;
  const c = { ...s, ...(s.card ?? {}) };
  c.form = FORM_ALIASES[c.form] ?? c.form;
  if (!FORMS[c.form]) throw new Error(`compare ${id}: card.form must be one of ${Object.keys(FORMS).join(", ")}`);
  const cardAlt = s.card?.alt ?? `${FORMS[c.form].name}: ${c.title}. ${big.label} ${big.display}, ${small.label} ${small.display}.${c.kicker ? ` ${plainKicker(c.kicker)}.` : ""} ${c.source}`;
  const out = { alt, cardAlt, ratio: R, lieFactor: {} };
  const fig = { encoding: form.encoding, items: s.items, P };

  for (const mode of ["desktop", "mobile"]) {
    const cv = figure(s, mode, A, P);
    const fid = mode === "desktop" ? id : `${id}-mobile`;
    out.lieFactor[mode] = check(cv, { ...fig, id: fid });
    out[mode] = serialize(cv, { id: fid, title: s.title, alt, root: `data-dp-frame="1" data-dp-compare="${s.form}"` });
  }
  if (s.altForm) {
    const af = FORM_ALIASES[s.altForm] ?? s.altForm;
    if (!FORMS[af] || af === s.form) throw new Error(`compare ${id}: altForm must be another of ${Object.keys(FORMS).join(", ")}`);
    const as = { ...s, form: af };
    const aAlt = s.altFormAlt ?? alt.replace(form.name, FORMS[af].name);
    out.alternative = { form: af, alt: aAlt, lieFactor: {} };
    for (const mode of ["desktop", "mobile"]) {
      const cv = figure(as, mode, A, P);
      const fid = `${id}-${af}${mode === "mobile" ? "-mobile" : ""}`;
      out.alternative.lieFactor[mode] = check(cv, { ...fig, encoding: FORMS[af].encoding, id: fid });
      out.alternative[mode] = serialize(cv, { id: fid, title: s.title, alt: aAlt, root: `data-dp-frame="1" data-dp-compare="${af}"` });
    }
  }
  for (const size of ["portrait", "square", "link"]) {
    const { cv, dy } = size === "link" ? cardLink({ ...c, ...(s.card?.link ?? {}) }, A, P) : cardTall(c, size, A, P);
    const cid = `${id}-card-${size}`;
    // Check at the final position: shift every element by dy first.
    const moved = { ...cv, els: cv.els.map((e) => (e.type === "text" ? { ...e, y: e.y + dy, top: e.top + dy, bottom: e.bottom + dy } : e.type === "rect" ? { ...e, y: e.y + dy } : e.type === "circle" ? { ...e, cy: e.cy + dy } : { ...e, y1: e.y1 + dy, y2: e.y2 + dy })) };
    out.lieFactor[size] = check(moved, { ...fig, encoding: FORMS[c.form].encoding, id: cid, card: true });
    out[size] = serialize(moved, { id: cid, title: c.title, alt: cardAlt, root: `data-dp-card="${size}" data-dp-compare="${c.form}"` });
  }
  return out;
}

// --- Post markup ------------------------------------------------------------------------------

/**
 * The MDX for the figure in a DataHub blog post (README.md), with a <picture> that serves the phone
 * figure under 641 px. With an alternative form, a CSS-only switcher: two radio inputs, two labels and
 * two <picture>s; a :checked sibling rule hides the other picture. It needs no JavaScript (posts are
 * server-rendered MDX), no platform change and no Tailwind. The CSS goes in through
 * dangerouslySetInnerHTML because React escapes text inside <style>. Without CSS the reader sees
 * both figures, the default first. ids are prefixed with the slug, so two switchers can share a page.
 *   files: { desktop, mobile, altDesktop?, altMobile? } published file names
 *   labels: [default, alternative] for the switcher, e.g. ["Circles", "Nested squares"]
 */
export function mdx({ slug, files, alt, altAlt, labels = ["Circles", "Nested squares"], accent = CP.accent }) {
  const url = (f) => `https://datahub.io/blog/${slug}/_r/-/${f}`;
  const q = (s) => String(s).replace(/"/g, "&quot;");
  const pic = (d, m, a, cls) => `<picture${cls ? ` className="${cls}"` : ""}><source media="(max-width: 640px)" srcSet="${url(m)}" /><img src="${url(d)}" alt="${q(a)}" style={{ width: "100%", height: "auto", display: "block" }} /></picture>`;
  if (!files.altDesktop) return `<figure style={{ margin: "2em 0" }}>\n  ${pic(files.desktop, files.mobile, alt)}\n</figure>`;
  const k = `cmp-${slug.replace(/[^a-z0-9-]/gi, "")}`;
  const css = [
    `.${k} input{position:absolute;opacity:0;width:1px;height:1px;margin:0}`,
    `.${k} .${k}-sw{font-size:14px;line-height:1.4;color:#6b6760;margin:0 0 10px}`,
    `.${k} .${k}-sw label{cursor:pointer;padding:2px 0;border-bottom:2px solid transparent;margin:0 2px}`,
    `#${k}-a:checked~.${k}-sw label[for=${k}-a],#${k}-b:checked~.${k}-sw label[for=${k}-b]{color:#2a2925;border-bottom-color:${accent}}`,
    `#${k}-a:focus-visible~.${k}-sw label[for=${k}-a],#${k}-b:focus-visible~.${k}-sw label[for=${k}-b]{outline:2px solid ${accent};outline-offset:2px}`,
    `#${k}-a:checked~.${k}-b,#${k}-b:checked~.${k}-a{display:none}`,
  ].join("");
  return [
    `<figure className="${k}" style={{ margin: "2em 0" }}>`,
    `  <style dangerouslySetInnerHTML={{ __html: "${css}" }} />`,
    `  <input type="radio" name="${k}" id="${k}-a" defaultChecked />`,
    `  <input type="radio" name="${k}" id="${k}-b" />`,
    `  <div className="${k}-sw">Drawn as <label htmlFor="${k}-a">${labels[0].toLowerCase()}</label> · <label htmlFor="${k}-b">${labels[1].toLowerCase()}</label></div>`,
    `  ${pic(files.desktop, files.mobile, alt, `${k}-a`)}`,
    `  ${pic(files.altDesktop, files.altMobile, altAlt, `${k}-b`)}`,
    `</figure>`,
  ].join("\n");
}

// --- Files and PNGs ----------------------------------------------------------------------------

const PLAYWRIGHT = join(homedir(), ".cache", "factory-playwright", "node_modules", "playwright", "index.mjs");

/** Render SVG strings to PNG with Playwright (fonts loaded first). jobs: [{ svg, path, scale }]. */
export async function renderPngs(jobs) {
  if (!existsSync(PLAYWRIGHT)) { console.log(`no PNGs: ${PLAYWRIGHT} not installed`); return false; }
  const { chromium } = await import(pathToFileURL(PLAYWRIGHT).href);
  const browser = await chromium.launch();
  try {
    for (const { svg, path, scale = 1 } of jobs) {
      const w = Number(svg.match(/viewBox="0 0 (\d+)/)[1]);
      const page = await browser.newPage({ viewport: { width: w, height: 800 }, deviceScaleFactor: scale });
      await page.setContent(`<html><body style="margin:0;background:#fff"><div id="c" style="width:${w}px">${svg}</div><style>#c svg{display:block;width:100%;height:auto}</style></body></html>`);
      await page.evaluate(() => document.fonts.ready);
      await page.locator("#c").screenshot({ path });
      await page.close();
    }
  } finally {
    await browser.close();
  }
  return true;
}

/**
 * Write a compare() result: <base>.svg and <base>-mobile.svg (the blog figure), and the cards
 * <cardBase>.svg|png (portrait), <cardBase>-square and <cardBase>-link, into `dir`. With
 * `preview`, also desktop (2x) and mobile (1x, true size, and 2x) PNGs of the figure there.
 */
export async function writeCompare(dir, built, { base, cardBase, preview } = {}) {
  const id = built.desktop.match(/aria-labelledby="(.+?)-title/)[1];
  base ??= id;
  cardBase ??= `${base}-card`;
  const files = { [`${base}.svg`]: built.desktop, [`${base}-mobile.svg`]: built.mobile, [`${cardBase}.svg`]: built.portrait, [`${cardBase}-square.svg`]: built.square, [`${cardBase}-link.svg`]: built.link };
  const altBase = built.alternative && `${base}-${built.alternative.form.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`; // <base>-nested-squares
  if (altBase) Object.assign(files, { [`${altBase}.svg`]: built.alternative.desktop, [`${altBase}-mobile.svg`]: built.alternative.mobile });
  for (const [f, svg] of Object.entries(files)) writeFileSync(join(dir, f), svg + "\n");
  const jobs = [["portrait", cardBase], ["square", `${cardBase}-square`], ["link", `${cardBase}-link`]].map(([k, f]) => ({ svg: built[k], path: join(dir, `${f}.png`) }));
  if (preview) {
    mkdirSync(preview, { recursive: true });
    jobs.push({ svg: built.desktop, path: join(preview, `${base}-desktop.png`), scale: 2 }, { svg: built.mobile, path: join(preview, `${base}-mobile@1x.png`), scale: 1 }, { svg: built.mobile, path: join(preview, `${base}-mobile@2x.png`), scale: 2 });
    if (altBase) jobs.push({ svg: built.alternative.desktop, path: join(preview, `${altBase}-desktop.png`), scale: 2 }, { svg: built.alternative.mobile, path: join(preview, `${altBase}-mobile@2x.png`), scale: 2 });
  }
  const png = await renderPngs(jobs);
  console.log(`wrote ${Object.keys(files).join(", ")}${png ? ` and ${jobs.length} PNG(s)` : ""}`);
}
