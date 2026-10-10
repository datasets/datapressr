// Story checks (design 5.1): tokeniser units, the oracle (the published stories in site/stories)
// and saboteurs (copies of one story, each broken in one way, must fail exactly that check).
// Offline: chart builds run with the network blocked and the repo's site/stories/node_modules.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { appendFileSync, cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeRepo } from "../fixture-repo.mjs";
import { readLedger } from "../ledger.mjs";
import { validateChecks } from "../schema.mjs";
import { archiveInto, checkNumbers, checkStory, countWords, findDates, linkNodeModules, numberOnChart, parseProse, removeWorkspace, svgTexts, tokenizeNumbers } from "./story.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const STORIES = join(root, "site/stories");
const haveToolchain = existsSync(join(STORIES, "node_modules", "@observablehq", "plot"));
const buildSkip = haveToolchain ? false : "site/stories/node_modules missing (run npm ci in site/stories)";

const nums = (text) => tokenizeNumbers(text).filter((t) => t.kind === "number").map((t) => t.raw);
const kinds = (text) => tokenizeNumbers(text).map((t) => `${t.kind}:${t.raw}`);

// --- Tokeniser ------------------------------------------------------------------

test("numbers: thousands separators, decimals, percentages, signs and magnitudes", () => {
  const [a, b, c, d] = tokenizeNumbers("25,415 rows; 1.5 ppm; 57.1% of spending; 25\u202f415 again");
  assert.deepEqual([a.mantissa, a.decimals], [25415, 0]);
  assert.deepEqual([b.mantissa, b.decimals], [1.5, 1]);
  assert.deepEqual([c.mantissa, c.percent], [57.1, true]);
  assert.equal(d.mantissa, 25415);

  const [e, f, g, h, i] = tokenizeNumbers("€1.7 trillion, €153 billion, -$36.98, −€11.5bn and US$3.2m");
  assert.deepEqual([e.currency, e.scale, e.value], ["EUR", 1e12, 1.7e12]);
  assert.deepEqual([f.currency, f.value], ["EUR", 153e9]);
  assert.deepEqual([g.currency, g.negative, g.value], ["USD", true, -36.98]);
  assert.deepEqual([h.currency, h.negative, h.scale], ["EUR", true, 1e9]);
  assert.deepEqual([i.currency, i.scale], ["USD", 1e6]);
  assert.deepEqual(nums("12 percent and 4 per cent and 3pp"), ["12 percent", "4 per cent", "3pp"]);
});

test("numbers: years, dates, ordinals and references are not data numbers", () => {
  assert.deepEqual(kinds("from 1959 to 2025, the 1960s"), ["year:1959", "year:2025", "year:1960s"]);
  assert.deepEqual(kinds("2014–2024 and 2014-2024"), ["year:2014", "year:2024", "year:2014", "year:2024"]);
  assert.deepEqual(kinds("On 20 April 2020, Monday 21 April, April 22, 2020, in May 2020 and on 2020-04-24"), ["date:20 April 2020", "date:21 April", "date:April 22, 2020", "date:May 2020", "date:2020-04-24"]);
  assert.deepEqual(kinds("the 21st time, story #3, CO2 and G7"), ["ordinal:21st"]);
  assert.deepEqual(nums("€2,000 and 2,000 and 2000 tonnes and 2.000"), ["€2,000", "2,000", "2.000"]);
  assert.deepEqual(nums("a 31-year record"), ["31"]);
});

test("dates parse to year, month and day", () => {
  assert.deepEqual(findDates("10 Dec 1998 and Sept 2025").map(({ y, m, d }) => [y, m, d]), [[1998, 12, 10], [2025, 9, null]]);
});

test("a prose number matches a chart value it rounds, with compatible units, never a more precise one", () => {
  const chart = tokenizeNumbers("€1,710bn · 57.12% · −$36.98 · 392 · 5.1");
  const on = (t) => numberOnChart(tokenizeNumbers(t)[0], chart);
  assert.equal(on("€1.7 trillion"), true, "magnitude words convert");
  assert.equal(on("57.1%"), true, "prose rounds the chart");
  assert.equal(on("$36.98"), true, "sign carried in words");
  assert.equal(on("€392 billion"), true, "bare figure under a unit title");
  assert.equal(on("57.123%"), false, "prose more precise than the chart");
  assert.equal(on("$5.1"), true);
  assert.equal(on("€57.1"), false, "a percentage on the chart is not a euro amount");
  assert.equal(on("17.36"), false);
});

test("prose parsing drops frontmatter, alt text, URLs and friction notes, and reads the exempt list", () => {
  const md = `---\ntitle: "T 99"\n---\n\n# T\n\n![alt with 123 words](c.svg)\n\nSee [the data](https://x.org/2031/55) — **42 units**.\n\n## Friction notes\n\n- Something with 77.\n- **Exempt numbers** (story-craft):\n  - 25,415 (dataset-wide count)\n  - $9.10 (all-time low)\n- After the list, 88.\n`;
  const p = parseProse(md);
  assert.deepEqual(p.images, ["c.svg"]);
  assert.deepEqual(nums(p.mainText), ["42"]);
  assert.deepEqual(nums(p.exemptText), ["25,415", "$9.10"]);
  assert.equal(countWords(p.mainText), 6);
});

// The exempt-list format the story skill prescribes (skills/story/SKILL.md step 4), read from the
// skill itself so the two cannot drift: its example must satisfy S3 with no charts at all.
test("the story skill's exempt-list example is what S3 parses", () => {
  const skill = readFileSync(join(root, "skills/story/SKILL.md"), "utf8");
  const example = skill.match(/exempt"[^\n]*\n\n```markdown\n([\s\S]*?)```/)?.[1];
  assert.ok(example, "SKILL.md step 4 has a fenced exempt-list example");
  const md = `# T\n\nThere are 25,415 rows and the low was $9.10, but 77 is unlisted.\n\n## Friction notes\n\n${example}`;
  const prose = parseProse(md);
  assert.deepEqual(nums(prose.exemptText), ["25,415", "$9.10"]);
  const s3 = checkNumbers({ prose, svgs: [] });
  assert.equal(s3.pass, false);
  assert.deepEqual(s3.evidence.misses.map((m) => m.number), ["77"]);
  const listed = checkNumbers({ prose: parseProse(md.replace(", but 77 is unlisted", "")), svgs: [] });
  assert.equal(listed.pass, true, listed.message);
});

test("SVG text: <text> and <tspan> contents, entities decoded, tooltips ignored", () => {
  const svg = `<svg><text>a &amp; b</text><text><tspan>−&#36;36.98</tspan><tspan>x</tspan></text><g aria-label="99"><title>77</title></g></svg>`;
  assert.deepEqual(svgTexts(svg), ["a & b", "−$36.98 x"]);
});

// --- Oracle: the published stories ---------------------------------------------

// Inputs each story's chart build reads (S5 compares them with HEAD). Planetary Boundaries
// reads only its own planetary-boundaries-src/ snapshot.
const ORACLE = {
  "keeling-curve": ["datasets/climate-and-environment/co2-ppm/data"],
  "oil-prices": ["datasets/energy-and-commodities/oil-prices/data"],
  "france-public-finances": ["datasets/france-public-finances/data"],
  "planetary-boundaries": [],
};

// Documented exceptions (see evals/LESSONS.md). A check is never weakened to make a story pass:
// each entry pins the exact failure so a change in either the checker or the story shows up.
// S3 evidence lists the prose numbers on no chart and on no exempt list.
const ORACLE_EXCEPTIONS = {
  "keeling-curve": {
    S1: { reason: "Story #1 predates the <slug>-make-charts.mjs convention: its build is site/stories/make-charts.mjs.", missing: ["site/stories/keeling-curve-make-charts.mjs"] },
    S3: { reason: "Story #1 predates the every-number-on-a-chart rule: start/end values, rates and the source file's quirks (sentinel codes, altitude) are prose-only.", misses: ["3,400", "316", "427", "67", "0.9", "2.6", "6", "40", "-1", "-9.99", "-0.99"] },
    S4: { reason: "Follows from S1: there is no keeling-curve-make-charts.mjs to run (make-charts.mjs is reproducible on its own)." },
  },
  "france-public-finances": {
    S3: { reason: "An attributed DREES figure (pension uprating) with no exempt list; the story has no friction notes section.", misses: ["5.3%"] },
  },
  "planetary-boundaries": {
    S3: { reason: "Story #2 predates the rule: the scoreboard is in boundary units, so the raw readings and boundaries (and the Holocene span) are prose-only.", misses: ["11,700", "150", "10", "428", "350", "350"] },
  },
};

function oracleWorkspace(slug) {
  const ws = mkdtempSync(join(tmpdir(), "evals-oracle-"));
  for (const p of ORACLE[slug]) archiveInto(root, "HEAD", p, ws);
  cpSync(STORIES, join(ws, "site/stories"), { recursive: true, filter: (src) => !src.split(/[\\/]/).includes("node_modules") });
  linkNodeModules(root, ws);
  return ws;
}

for (const slug of Object.keys(ORACLE)) {
  test(`oracle: ${slug} passes every check except its documented exceptions`, { skip: buildSkip }, () => {
    const ws = oracleWorkspace(slug);
    try {
      const results = checkStory({ workspace: ws, slug, root, inputs: ORACLE[slug].map((path) => ({ path, commit: "HEAD" })) });
      assert.deepEqual(validateChecks({ checker: "story", results }).errors, []);
      const exceptions = ORACLE_EXCEPTIONS[slug] ?? {};
      for (const r of results) {
        const ex = exceptions[r.id];
        if (!ex) {
          assert.equal(r.pass, true, `${slug} ${r.id}: ${r.message}`);
          continue;
        }
        assert.ok(ex.reason, "every exception has a reason");
        assert.equal(r.pass, false, `${slug} ${r.id} now passes: remove its exception (${r.message})`);
        if (ex.misses) assert.deepEqual(r.evidence.misses.map((m) => m.number), ex.misses, `${slug} S3 misses changed`);
        if (ex.missing) assert.deepEqual(r.evidence.missing, ex.missing);
      }
    } finally {
      removeWorkspace(ws);
    }
  });
}

// --- Saboteurs --------------------------------------------------------------------

// The base: a copy of the oil-prices story (which lists its exempt numbers in the skill's format),
// checked with an as_of so S6 is active. It must pass
// all six checks; each saboteur breaks one thing and must fail exactly that check.
const SLUG = "oil-prices";
const INPUT = "datasets/energy-and-commodities/oil-prices/data";
const AS_OF = "2026-10-09";

const proseFile = (ws) => join(ws, "site/stories", `${SLUG}.md`);
const edit = (file, fn) => writeFileSync(file, fn(readFileSync(file, "utf8")));
const insertBefore = (marker, text) => (s) => {
  assert.ok(s.includes(marker), `marker ${marker} not found`);
  return s.replace(marker, `${text}${marker}`);
};

function baseWorkspace() {
  return oracleWorkspace(SLUG);
}

const run = (ws) => checkStory({ workspace: ws, slug: SLUG, root, inputs: [{ path: INPUT, commit: "HEAD" }], asOf: AS_OF });
const failed = (results) => results.filter((r) => !r.pass).map((r) => r.id);

test("saboteur base: the oil-prices copy passes all six checks", { skip: buildSkip }, () => {
  const ws = baseWorkspace();
  try {
    const results = run(ws);
    assert.deepEqual(failed(results), [], JSON.stringify(results.filter((r) => !r.pass), null, 1));
    assert.deepEqual(results.find((r) => r.id === "S3").evidence.exempt, ["25,415", "-$37.63", "$9.10", "76%"]);
  } finally {
    removeWorkspace(ws);
  }
});

const SABOTEURS = {
  S1: { what: "a missing outline", apply: (ws) => rmSync(join(ws, "site/stories", `${SLUG}-outline.md`)) },
  S2: {
    what: "a 900-word prose",
    apply: (ws) => edit(proseFile(ws), insertBefore("## How this was made", `${"Traders watched the screens and waited for the market to settle down again. ".repeat(31)}\n\n`)),
  },
  S3: { what: "a prose-only number", apply: (ws) => edit(proseFile(ws), insertBefore("## How this was made", "Brent averaged $41.96 a barrel over the whole of that year.\n\n")) },
  S4: {
    what: "Date.now() in the chart build",
    apply: (ws) =>
      edit(join(ws, "site/stories", `${SLUG}-make-charts.mjs`), (s) => {
        const marker = 'toSvg(fig) + "\\n"';
        assert.ok(s.includes(marker));
        return s.replace(marker, 'toSvg(fig) + `<!-- built ${Date.now()} -->\\n`');
      }),
  },
  S5: {
    what: "an edited input",
    apply: (ws) => {
      const dir = join(ws, INPUT);
      const csv = readdirSync(dir).find((f) => f.endsWith(".csv"));
      appendFileSync(join(dir, csv), "\n"); // the build trims, so the charts are unchanged
    },
  },
  S6: { what: "a date after as_of", apply: (ws) => edit(proseFile(ws), insertBefore("## How this was made", "EIA expects to revise these figures in March 2031.\n\n")) },
};

for (const [id, { what, apply }] of Object.entries(SABOTEURS)) {
  test(`saboteur ${id}: ${what} fails exactly ${id}`, { skip: buildSkip }, () => {
    const ws = baseWorkspace();
    try {
      apply(ws);
      const results = run(ws);
      assert.deepEqual(failed(results), [id], JSON.stringify(results.filter((r) => !r.pass), null, 1));
    } finally {
      removeWorkspace(ws);
    }
  });
}

// --- The check subcommand -------------------------------------------------------

test("check <run_id> and check --all write checks.json and append check rows", () => {
  const { root: repo } = makeRepo();
  try {
    const cli = (args) => spawnSync(process.execPath, [join(repo, "evals/run.mjs"), ...args], { cwd: repo, encoding: "utf8" });
    const res = cli(["run", "story/t01-demo", "--writer", "fake"]);
    assert.equal(res.status, 0, res.stderr);
    const caseRuns = join(repo, "evals/runs/story/t01-demo");
    const [runId] = readdirSync(caseRuns);
    const checksFile = join(caseRuns, runId, "checks.json");
    const first = JSON.parse(readFileSync(checksFile, "utf8"));
    assert.deepEqual(validateChecks(first).errors, []);
    assert.deepEqual(first.results.map((r) => r.id), ["S1", "S2", "S3", "S4", "S5", "S6"]);
    // The fake story is a placeholder: everything holds except its length.
    assert.deepEqual(first.results.filter((r) => !r.pass).map((r) => r.id), ["S2"]);

    rmSync(checksFile);
    assert.equal(cli(["check", runId]).status, 0);
    assert.ok(existsSync(checksFile));
    const again = cli(["check", "--all"]);
    assert.equal(again.status, 0, again.stderr);
    assert.match(again.stdout, new RegExp(`${runId}: failed S2`));

    const checkRows = readLedger(join(repo, "evals/ledger.jsonl")).filter((r) => r.kind === "check");
    assert.equal(checkRows.length, 3);
    for (const row of checkRows) assert.deepEqual([row.run_id, row.checker, row.failed, row.passed], [runId, "story", ["S2"], 5]);
    assert.notEqual(cli(["check", "no-such-run"]).status, 0);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});
