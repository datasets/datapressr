// PNG renders of chart SVGs for the critic (design section 5.3, open question 5). Decided in
// datapressr-hcn.8: a system rasteriser, headless Google Chrome, so the harness keeps no npm
// dependency and the critic sees what a reader's browser shows. Each SVG is screenshotted at its
// own width and height (from the root element) at 2x. macOS Quick Look (`qlmanage -t`) was tried
// first and rejected: it clips wide charts at the right edge, and a critic fed those renders
// reported clipping that a browser does not show. Where Chrome is missing, `available()` says so
// and `score --png` refuses rather than silently sending SVG text only. The portable alternative is
// @resvg/resvg-js as one dependency in evals/package.json.

import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const CHROME = process.env.EVALS_CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
export const SCALE = 2;
// Headless Chrome paints a stray copy of the top of the page into the last few rows of the
// window. So the chart sits between two white strips of PAD px, the stray copy lands in the
// lower strip, and a centred crop (`sips`, which ships with macOS) keeps exactly the chart.
export const PAD = 120;

export function available({ bin = CHROME } = {}) {
  if (!existsSync(bin)) return { ok: false, reason: `no Chrome at ${bin} (set EVALS_CHROME); PNG renders need a headless Chrome` };
  if (!existsSync("/usr/bin/sips")) return { ok: false, reason: "no sips (macOS) to crop the renders" };
  return { ok: true, rasteriser: bin };
}

// The root <svg>'s width and height in px (falling back to its viewBox, then 900 x 600).
export function svgSize(svg) {
  const root = String(svg).match(/<svg\b[^>]*>/)?.[0] ?? "";
  const attr = (n) => root.match(new RegExp(`\\s${n}="([\\d.]+)(?:px)?"`))?.[1];
  const vb = root.match(/\sviewBox="[\d.-]+[\s,]+[\d.-]+[\s,]+([\d.]+)[\s,]+([\d.]+)"/);
  const w = Number(attr("width") ?? vb?.[1] ?? 900);
  const h = Number(attr("height") ?? vb?.[2] ?? 600);
  return { width: Math.ceil(w), height: Math.ceil(h) };
}

// Headless Chrome with a throwaway profile writes the screenshot and then may linger, so wait for
// the PNG to appear and stop growing, then end the process.
function screenshot(bin, args, png, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: "ignore" });
    const started = Date.now();
    let last = -1;
    const done = (err) => {
      clearInterval(timer);
      child.kill("SIGKILL");
      err ? reject(err) : resolve(png);
    };
    const timer = setInterval(() => {
      const size = existsSync(png) ? statSync(png).size : -1;
      if (size > 0 && size === last) return done();
      last = size;
      if (Date.now() - started > timeoutMs) done(new Error(`Chrome produced no PNG within ${timeoutMs} ms`));
    }, 250);
    child.on("error", done);
    child.on("exit", () => {
      if (existsSync(png) && statSync(png).size > 0) done();
    });
  });
}

// Render each { file, raw } chart into outDir; resolves to absolute PNG paths in chart order.
export async function renderCharts(charts, outDir, { bin = CHROME, scale = SCALE, timeoutMs = 60_000 } = {}) {
  mkdirSync(outDir, { recursive: true });
  const out = [];
  for (const [i, c] of charts.entries()) {
    const svgPath = join(outDir, `chart-${i + 1}.svg`);
    const png = join(outDir, `chart-${i + 1}.png`);
    const htmlPath = join(outDir, `chart-${i + 1}.html`);
    writeFileSync(svgPath, c.raw);
    const { width, height } = svgSize(c.raw);
    // An <img> on a margin-free page, so the screenshot is exactly the chart as a page shows it.
    writeFileSync(htmlPath, `<!doctype html><html><body style="margin:0;padding:${PAD}px 0;background:white"><img src="chart-${i + 1}.svg" width="${width}" height="${height}" style="display:block"></body></html>\n`);
    const args = ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", `--user-data-dir=${join(outDir, "chrome-profile")}`, `--force-device-scale-factor=${scale}`, `--window-size=${width},${height + 2 * PAD}`, `--screenshot=${png}`, pathToFileURL(htmlPath).href];
    try {
      await screenshot(bin, args, png, timeoutMs);
      execFileSync("sips", ["--cropToHeightWidth", String(height * scale), String(width * scale), png], { stdio: "ignore" });
      out.push(png);
    } catch (e) {
      throw new Error(`rendering ${c.file}: ${e.message}`);
    }
  }
  return out;
}
