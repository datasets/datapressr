#!/usr/bin/env node
// Fails on literal invisible characters in checked-in source code. Zero
// dependencies, like the other scripts here.
//
// Why this exists: the same bug was written twice here inside two days — a raw
// U+00A0 or U+200B sitting inside a regular-expression character class. One of
// them shipped (`tesla-quarterly-deliveries/build.ts` in e97a613, fixed the
// next day in 9e886d0); the other was caught by review in the minutes before
// commit. Neither is visible in an editor or a diff, so whether it is caught
// comes down to someone thinking to look. The worse of the two was in a *test*:
// had its U+200B been flattened to a plain space by a copy-paste, the test
// would still have passed while no longer testing the one thing it exists to
// test. The rule the fixes settled on is that source code spells these
// characters as backslash-u escapes, which survive a paste and are legible in a
// diff. This encodes that rule.
//
// Scope is source code only — `.ts`/`.mjs`/`.js`/`.py` and friends — and never
// anything under an `archive/` directory. Archived snapshots, `data/*.csv` and
// `datasets/commons-issues/*.md` are records of what a source said, invisible
// characters and all; rewriting them would be falsifying the evidence. Prose
// Markdown is excluded too: it has no escape syntax to offer as the fix.
//
// Known gap, left open on purpose: `datapackage.json` descriptions are neither
// source nor archived evidence, and JSON does have `\u` escapes — so a stray
// U+00A0 pasted into a published field description would not be caught here.
// Covering it means separating hand-written metadata from `archive/` and
// `data/` JSON, which is a different rule; none of the tracked JSON in this
// repo carries one today.
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

/** Characters that are invisible, or indistinguishable from a plain space, in a normal editor. */
export const INVISIBLE = new Map([
  [0x00a0, "NO-BREAK SPACE"],
  [0x00ad, "SOFT HYPHEN"],
  [0x061c, "ARABIC LETTER MARK"],
  [0x1680, "OGHAM SPACE MARK"],
  [0x180e, "MONGOLIAN VOWEL SEPARATOR"],
  [0x2000, "EN QUAD"],
  [0x2001, "EM QUAD"],
  [0x2002, "EN SPACE"],
  [0x2003, "EM SPACE"],
  [0x2004, "THREE-PER-EM SPACE"],
  [0x2005, "FOUR-PER-EM SPACE"],
  [0x2006, "SIX-PER-EM SPACE"],
  [0x2007, "FIGURE SPACE"],
  [0x2008, "PUNCTUATION SPACE"],
  [0x2009, "THIN SPACE"],
  [0x200a, "HAIR SPACE"],
  [0x200b, "ZERO WIDTH SPACE"],
  [0x200c, "ZERO WIDTH NON-JOINER"],
  [0x200d, "ZERO WIDTH JOINER"],
  [0x200e, "LEFT-TO-RIGHT MARK"],
  [0x200f, "RIGHT-TO-LEFT MARK"],
  [0x2028, "LINE SEPARATOR"],
  [0x2029, "PARAGRAPH SEPARATOR"],
  [0x202a, "LEFT-TO-RIGHT EMBEDDING"],
  [0x202b, "RIGHT-TO-LEFT EMBEDDING"],
  [0x202c, "POP DIRECTIONAL FORMATTING"],
  [0x202d, "LEFT-TO-RIGHT OVERRIDE"],
  [0x202e, "RIGHT-TO-LEFT OVERRIDE"],
  [0x202f, "NARROW NO-BREAK SPACE"],
  [0x205f, "MEDIUM MATHEMATICAL SPACE"],
  [0x2060, "WORD JOINER"],
  [0x2061, "FUNCTION APPLICATION"],
  [0x2062, "INVISIBLE TIMES"],
  [0x2063, "INVISIBLE SEPARATOR"],
  [0x2064, "INVISIBLE PLUS"],
  [0x2066, "LEFT-TO-RIGHT ISOLATE"],
  [0x2067, "RIGHT-TO-LEFT ISOLATE"],
  [0x2068, "FIRST STRONG ISOLATE"],
  [0x2069, "POP DIRECTIONAL ISOLATE"],
  [0x3000, "IDEOGRAPHIC SPACE"],
  [0xfeff, "ZERO WIDTH NO-BREAK SPACE (BOM)"],
  [0xfff9, "INTERLINEAR ANNOTATION ANCHOR"],
  [0xfffa, "INTERLINEAR ANNOTATION SEPARATOR"],
  [0xfffb, "INTERLINEAR ANNOTATION TERMINATOR"],
]);

/** Source extensions whose string and comment syntax offers `\uXXXX` as the fix. */
export const SOURCE_EXTENSIONS = new Set(["ts", "mts", "cts", "tsx", "js", "mjs", "cjs", "jsx", "py"]);

const SKIP_DIRS = new Set([".git", "node_modules", "archive"]);

/**
 * Locate every invisible character in a piece of text.
 * @param {string} text
 * @returns {{line: number, column: number, codePoint: number, name: string, escape: string}[]}
 */
export function findInvisible(text) {
  const found = [];
  let line = 1;
  let column = 1;
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    const name = INVISIBLE.get(cp);
    if (name !== undefined) {
      found.push({
        line,
        column,
        codePoint: cp,
        name,
        escape: `\\u${cp.toString(16).padStart(4, "0")}`,
      });
    }
    // U+2028/U+2029 are line breaks to a JS engine but not to a human reading
    // the file, so count lines the way an editor does: "\n" only.
    if (ch === "\n") {
      line += 1;
      column = 1;
    } else {
      // Advance by UTF-16 code units, which is the column most editors report —
      // an astral character ahead of the finding counts as two, not one.
      column += ch.length;
    }
  }
  return found;
}

/** @param {string} path @returns {boolean} */
export function isSourcePath(path) {
  const parts = path.split(/[/\\]/);
  if (parts.some((p) => SKIP_DIRS.has(p))) return false;
  const ext = parts.at(-1).split(".").pop();
  return SOURCE_EXTENSIONS.has(ext);
}

/**
 * Source files git would consider part of the repo, relative to `root` —
 * tracked ones plus new ones not yet added, minus everything `.gitignore`
 * excludes, so a `node_modules/` left over from a dataset build never fails the
 * check and a file written this session does not slip through until it is
 * committed. Falls back to walking the tree when git is unavailable (an
 * exported tarball, say).
 * @param {string} root
 * @returns {string[]}
 */
export function sourceFiles(root) {
  let paths;
  try {
    paths = execFileSync(
      "git",
      ["-C", root, "ls-files", "-z", "--cached", "--others", "--exclude-standard"],
      { maxBuffer: 1 << 28 },
    )
      .toString()
      .split("\0")
      .filter(Boolean);
  } catch {
    paths = walkTree(root, root);
  }
  return paths.filter(isSourcePath).sort();
}

/**
 * Every file under `dir`, relative to `root`, skipping the directories git
 * would have skipped for us. Exported so the no-git path is tested directly
 * rather than only on machines whose temp directory happens not to be in a repo.
 * @param {string} dir @param {string} root @returns {string[]}
 */
export function walkTree(dir, root) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(...walkTree(join(dir, entry.name), root));
    } else if (entry.isFile()) {
      out.push(relative(root, join(dir, entry.name)).split(sep).join("/"));
    }
  }
  return out;
}

/**
 * @param {string} root
 * @returns {{file: string, line: number, column: number, codePoint: number, name: string, escape: string}[]}
 */
export function scanRepo(root) {
  const findings = [];
  for (const file of sourceFiles(root)) {
    for (const hit of findInvisible(readFileSync(join(root, file), "utf8"))) {
      findings.push({ file, ...hit });
    }
  }
  return findings;
}

/** @param {ReturnType<typeof scanRepo>} findings @returns {string} */
export function formatReport(findings) {
  if (findings.length === 0) return "✓ no literal invisible characters in tracked source";
  const lines = findings.map(
    (f) =>
      `✗ ${f.file}:${f.line}:${f.column}  U+${f.codePoint.toString(16).toUpperCase().padStart(4, "0")} ${f.name} — write it as ${f.escape}`,
  );
  lines.push("");
  lines.push(`${findings.length} literal invisible character(s)`);
  return lines.join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.argv[2] || ".";
  const findings = scanRepo(root);
  console.log(formatReport(findings));
  process.exit(findings.length > 0 ? 1 : 0);
}
